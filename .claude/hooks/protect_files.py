#!/usr/bin/env python3
"""PreToolUse guard: keep Claude from writing or editing sensitive files.

Protected paths (case-insensitive, relative to the project root):
  .env*               any file whose name starts with .env
  *credentials*       any path containing "credentials"
  *secret*            any path containing "secret"
  *.pem               PEM keys / certificates
  seo-agent/brief.md  never writable
  seo-agent/log.md    append-only: adding text at the end is allowed, nothing else

Checks Write / Edit / MultiEdit / NotebookEdit, and (best-effort) shell writes in
Bash: redirections, tee, cp/mv/rm/touch/truncate/ln/install, sed -i / perl -i,
dd of=, curl -o, wget -O, git mv/rm/clean/restore. Exit 2 blocks the call.
"""
import fnmatch
import glob
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hooklib  # noqa: E402
import shellparse  # noqa: E402

HOOK = "protect-files"
EXACT = {  # project-relative path -> (label, append_only)
    "seo-agent/brief.md": ("SEO agent brief", False),
    "seo-agent/log.md": ("SEO agent log", True),
}
BASENAME_GLOBS = [(".env*", ".env* file"), ("*.pem", "*.pem key/certificate")]
PATH_GLOBS = [("*credentials*", "*credentials* path"), ("*secret*", "*secret* path")]
OUTPUT_OPTIONS = {  # commands whose option value names a file they write
    "curl": ["-o", "--output"], "wget": ["-O", "--output-document"], "sort": ["-o", "--output"],
    "openssl": ["-out", "-keyout"], "ssh-keygen": ["-f"], "gpg": ["-o", "--output"],
}


def classify(path, cwd=None):
    """(label, append_only) if `path` is protected, else None."""
    absolute = hooklib.resolve(path, cwd)
    for candidate in (absolute, os.path.realpath(absolute)):
        rel = hooklib.project_relative(candidate).lower()
        if rel in EXACT:
            return EXACT[rel]
        base = rel.rsplit("/", 1)[-1]
        for pattern, label in BASENAME_GLOBS:
            if fnmatch.fnmatchcase(base, pattern):
                return label, False
        for pattern, label in PATH_GLOBS:
            if fnmatch.fnmatchcase(rel, pattern):
                return label, False
    return None


def protected_inside(directory, cwd):
    """Protected files that deleting/moving `directory` would take with it."""
    absolute = hooklib.resolve(directory, cwd)
    if not os.path.isdir(absolute):
        return []
    rel_dir = hooklib.project_relative(absolute).lower().rstrip("/")
    hits = [p for p in EXACT if (rel_dir == "." or p.startswith(rel_dir + "/"))
            and os.path.exists(os.path.join(hooklib.PROJECT_DIR, p))]
    try:
        hits += [os.path.join(absolute, n) for n in os.listdir(absolute)
                 if classify(os.path.join(absolute, n))]
    except OSError:
        pass
    return hits


# ------------------------------------------------------------------ file tools

def read_text(path):
    try:
        with open(path, encoding="utf-8", newline="") as fh:
            return fh.read()
    except FileNotFoundError:
        return ""
    except (OSError, UnicodeDecodeError):
        return None


def apply_edit(text, old, new, replace_all=False):
    if old == "":
        return new if text == "" else None
    count = text.count(old)
    if count == 0 or (count > 1 and not replace_all):
        return None
    return text.replace(old, new) if replace_all else text.replace(old, new, 1)


def append_only_violation(tool, tool_input, path):
    """None if the Write/Edit only adds text at the end of the file, else why not."""
    original = read_text(path)
    if original is None:
        return "its current contents could not be read"
    if tool == "Write":
        result = tool_input.get("content", "")
    else:
        edits = tool_input.get("edits") if tool == "MultiEdit" else [tool_input]
        result = original
        for edit in edits or []:
            result = apply_edit(result, edit.get("old_string", ""), edit.get("new_string", ""),
                                bool(edit.get("replace_all")))
            if result is None:
                return "the edit could not be verified as an append"
    if result.startswith(original):
        return None
    return "the change rewrites or removes existing text"


def check_file_tool(data, tool, tool_input):
    path = tool_input.get("file_path") or tool_input.get("notebook_path") or ""
    rule = classify(path, data.get("cwd")) if path else None
    if not rule:
        return
    label, append_only = rule
    rel = hooklib.project_relative(path)
    if append_only and tool in ("Write", "Edit", "MultiEdit"):
        why = append_only_violation(tool, tool_input, path)
        if why is None:
            return
        hooklib.deny(data, HOOK, rel, "%s is append-only; %s" % (rel, why),
                     "BLOCKED by %s: %s is append-only and %s.\n"
                     "Only add new text at the end, e.g. Bash: printf '%%s\\n' \"<entry>\" >> %s"
                     % (HOOK, rel, why, rel))
    hooklib.deny(data, HOOK, rel, "%s is protected (%s)" % (rel, label),
                 "BLOCKED by %s: %s is a protected file (%s). Claude may not write or edit it; "
                 "ask the user to make this change themselves." % (HOOK, rel, label))


# ------------------------------------------------------------------------ shell

def inplace_files(name, args):
    """Files edited in place by `sed -i` / `perl -i`, or [] if not in-place."""
    in_place = any(a == "--in-place" or a.startswith("--in-place=")
                   or (a.startswith("-") and not a.startswith("--") and "i" in a[1:].split(".")[0])
                   for a in args)
    if not in_place:
        return []
    files, script_given, skip = [], False, False
    for i, arg in enumerate(args):
        if skip:
            skip = False
            continue
        if arg in ("-e", "--expression", "-f", "--file"):
            script_given, skip = True, True
        elif arg.startswith("-") and arg != "-":
            if name == "perl" and arg[1:].endswith("e"):
                script_given, skip = True, True  # perl -pie / -pe: next arg is the script
        else:
            files.append(arg)
    return files if script_given or name == "perl" else files[1:]


def git_clean_victims(args, cwd):
    """Paths `git clean` would delete, via its own dry run."""
    dry = [a for a in args if a not in ("-f", "--force", "-i", "--interactive")]
    dry = [a.replace("f", "") if a.startswith("-") and not a.startswith("--") else a for a in dry]
    try:
        out = subprocess.run(["git", "-C", cwd, "clean", "-n"] + [a for a in dry if a != "-"],
                             capture_output=True, text=True, timeout=10).stdout
    except (OSError, subprocess.SubprocessError):
        return []
    return [line[len("Would remove "):] for line in out.splitlines() if line.startswith("Would remove ")]


def into_dir(dest, cwd):
    return dest.endswith("/") or os.path.isdir(hooklib.resolve(dest, cwd))


def shell_writes(cmd, cwd):
    """(path, mode, how) for each file this simple command would change.
    mode: 'append' | 'touch' | 'write' (overwrite) | 'remove' (delete or move away)."""
    for op, target in cmd.redirects:
        if ">" not in op:
            continue
        if op in (">&", "<&") and (target.isdigit() or target == "-"):
            continue
        yield target, "append" if ">>" in op else "write", "`%s` redirect" % op
    words = shellparse.command_words(cmd.words)
    if not words:
        return
    name, args = words[0], words[1:]
    if name == "git" and args[:1] in (["mv"], ["rm"], ["restore"], ["checkout"], ["clean"]):
        name, args = "git " + args[0], args[1:]
    paths = [a for a in args if not a.startswith("-")]
    if name == "tee":
        append = any(a == "--append" or (a.startswith("-") and not a.startswith("--") and "a" in a)
                     for a in args)
        for p in paths:
            yield p, "append" if append else "write", "tee"
    elif name in ("cp", "install", "ln", "rsync", "mv", "git mv"):
        targets = shellparse.option_values(args, ["-t", "--target-directory"])
        sources = [p for p in paths if p not in targets]
        if not targets:
            targets, sources = paths[-1:], paths[:-1]
        if not sources:
            return
        dest = targets[0]
        if name in ("mv", "git mv"):
            for src in sources:
                yield src, "remove", name
        if into_dir(dest, cwd):
            for src in sources:
                yield os.path.join(dest, os.path.basename(src.rstrip("/"))), "write", name
        elif name != "ln" or len(sources) == 1:
            yield dest, "write", name
    elif name in ("rm", "unlink", "shred", "git rm"):
        for p in paths:
            yield p, "remove", name
    elif name in ("truncate", "git restore"):
        for p in paths:
            yield p, "write", name
    elif name == "git checkout" and "--" in args:
        for p in args[args.index("--") + 1:]:
            yield p, "write", name
    elif name == "git clean" and any(a == "--force" or (a.startswith("-") and not a.startswith("--")
                                                        and "f" in a) for a in args):
        for p in git_clean_victims(args, cwd):
            yield p, "remove", name
    elif name == "touch":
        for p in paths:
            yield p, "touch", "touch"
    elif name in ("sed", "gsed", "perl"):
        for p in inplace_files(name, args):
            yield p, "write", name + " -i"
    elif name == "dd":
        for a in args:
            if a.startswith("of="):
                yield a[3:], "write", "dd"
    elif name in OUTPUT_OPTIONS:
        for p in shellparse.option_values(args, OUTPUT_OPTIONS[name]):
            if p != "-":
                yield p, "write", name


def expand(target, cwd):
    """Shell-glob expansion of a target (unexpanded if nothing matches)."""
    if any(c in target for c in "*?["):
        matches = glob.glob(hooklib.resolve(target, cwd))[:2000]
        if matches:
            return matches
    return [target]


def check_shell(data, command):
    cwd = data.get("cwd") or hooklib.PROJECT_DIR
    problems = []
    for cmd in shellparse.parse(command):
        words = shellparse.command_words(cmd.words)
        if words[:1] == ["cd"]:
            cwd = hooklib.resolve(words[1] if len(words) > 1 else "~", cwd)
            continue
        for target, mode, how in shell_writes(cmd, cwd):
            for path in expand(target, cwd):
                rule = classify(path, cwd)
                if rule:
                    label, append_only = rule
                    if append_only and mode in ("append", "touch"):
                        continue
                    note = "append-only; use `>>` or `tee -a`" if append_only else label
                    problems.append("%s (%s) via %s" % (hooklib.project_relative(hooklib.resolve(path, cwd)), note, how))
                elif mode == "remove":
                    for inner in protected_inside(path, cwd):
                        problems.append("%s (inside %s) via %s" % (hooklib.project_relative(inner), path, how))
    if problems:
        problems = list(dict.fromkeys(problems))
        hooklib.deny(data, HOOK, command, "; ".join(problems),
                     "BLOCKED by %s: this command would modify protected files:\n  - %s\n"
                     "These files are off-limits to Claude (see .claude/hooks/protect_files.py). "
                     "Ask the user if the change is really needed." % (HOOK, "\n  - ".join(problems)))


def main():
    data = hooklib.read_input()
    tool = data.get("tool_name") or ""
    tool_input = data.get("tool_input") or {}
    if tool in ("Bash", "PowerShell"):
        check_shell(data, tool_input.get("command") or "")
    elif tool in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
        check_file_tool(data, tool, tool_input)
    return 0


if __name__ == "__main__":
    sys.exit(main())
