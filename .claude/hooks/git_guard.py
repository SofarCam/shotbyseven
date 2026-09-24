#!/usr/bin/env python3
"""PreToolUse guard for Bash: protect main/master and keep credentials out of commits.

1. Blocks any `git push` whose destination is main or master: explicit refspecs
   (`origin main`, `HEAD:main`, `x:refs/heads/master`, `:main`, `--delete main`),
   `--all`/`--mirror`, and a bare `git push` while on (or tracking) main/master.
2. Before `git commit`, scans what the commit would contain for API keys/tokens:
   the staged diff, plus files that `git add ...` / `commit -a` / `commit <paths>`
   earlier in the same command would stage. Found values are shown masked.
   Mark a false positive with `gitleaks:allow` on that line.
"""
import fnmatch
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hooklib  # noqa: E402
import shellparse  # noqa: E402

HOOK = "git-guard"
PROTECTED_BRANCHES = ("main", "master")
GIT_VALUE_OPTS = {"-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env",
                  "--exec-path", "--super-prefix"}
COMMIT_VALUE_SHORT = set("mFCct")
COMMIT_VALUE_LONG = {"--message", "--file", "--reuse-message", "--reedit-message", "--author",
                     "--date", "--template", "--fixup", "--squash", "--cleanup", "--trailer",
                     "--pathspec-from-file"}
MAX_UNTRACKED_FILES = 500
MAX_FILE_BYTES = 1024 * 1024


def git(cwd, *args):
    try:
        proc = subprocess.run(["git", "-C", cwd, "-c", "core.quotepath=off"] + list(args),
                              capture_output=True, text=True, timeout=15)
    except (OSError, subprocess.SubprocessError):
        return ""
    return proc.stdout if proc.returncode == 0 else ""


def split_git(words, cwd):
    """['git', globals..., sub, args...] -> (cwd, sub, args)."""
    i = 1
    while i < len(words):
        word = words[i]
        if word == "-C" and i + 1 < len(words):
            cwd = hooklib.resolve(words[i + 1], cwd)
            i += 2
        elif word in GIT_VALUE_OPTS:
            i += 2
        elif word.startswith("-"):
            i += 1
        else:
            return cwd, word, words[i + 1:]
    return cwd, None, []


def current_branch(cwd):
    return git(cwd, "symbolic-ref", "--quiet", "--short", "HEAD").strip()


def upstream_branch(cwd):
    upstream = git(cwd, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}").strip()
    return upstream.split("/", 1)[1] if "/" in upstream else ""


def is_protected(branch):
    return any(branch == p or ("*" in branch and fnmatch.fnmatchcase(p, branch))
               for p in PROTECTED_BRANCHES)


# ------------------------------------------------------------------------ push

def push_problems(args, cwd, branch_hint):
    positional, delete, everything, tags, repo_opt = [], False, False, False, False
    i = 0
    while i < len(args):
        arg = args[i]
        if arg == "--":
            positional.extend(args[i + 1:])
            break
        if arg.startswith("--"):
            name = arg.split("=", 1)[0]
            if name in ("--all", "--mirror", "--branches"):
                everything = True
            elif name == "--delete":
                delete = True
            elif name == "--tags":
                tags = True
            elif name == "--repo":
                repo_opt = True
                i += "=" not in arg
            elif name in ("--push-option", "--receive-pack", "--exec") and "=" not in arg:
                i += 1
        elif arg.startswith("-") and len(arg) > 1:
            delete = delete or "d" in arg[1:]
            if arg[1:].endswith("o"):
                i += 1  # -o <push option>
        else:
            positional.append(arg)
        i += 1

    if everything:
        return ["`--all`/`--mirror` pushes every branch, including main/master"]
    refspecs = positional if repo_opt else positional[1:]
    branch = branch_hint or current_branch(cwd)
    if not refspecs:
        if tags:
            return []
        hits = [b for b in (branch, "" if branch_hint else upstream_branch(cwd)) if is_protected(b)]
        if hits:
            return ["a bare `git push` here pushes to '%s' (current branch/upstream)" % hits[0]]
        return []
    problems = []
    for spec in refspecs:
        spec = spec.lstrip("+")
        if delete:
            dst = spec
        elif ":" in spec:
            src, dst = spec.split(":", 1)
            dst = dst or src
        else:
            dst = spec
        if dst in ("HEAD", "@"):
            dst = branch
        for prefix in ("refs/heads/", "heads/"):
            if dst.startswith(prefix):
                dst = dst[len(prefix):]
        if is_protected(dst):
            problems.append("`%s` targets protected branch '%s'" % (spec, dst if "*" not in dst else "main/master"))
    return problems


# --------------------------------------------------------------- secret scan

def parse_commit_args(args):
    """-> (commit_all, pathspecs)."""
    commit_all, pathspecs, i = False, [], 0
    while i < len(args):
        arg = args[i]
        if arg == "--":
            pathspecs.extend(args[i + 1:])
            break
        if arg.startswith("--"):
            name = arg.split("=", 1)[0]
            commit_all = commit_all or name == "--all"
            if name in COMMIT_VALUE_LONG and "=" not in arg:
                i += 1
        elif arg.startswith("-") and len(arg) > 1:
            for j, flag in enumerate(arg[1:], 1):
                if flag == "a":
                    commit_all = True
                if flag in COMMIT_VALUE_SHORT:
                    if j == len(arg) - 1:
                        i += 1  # value is the next argument
                    break  # otherwise the rest of the cluster is the value
        else:
            pathspecs.append(arg)
        i += 1
    return commit_all, pathspecs


def spec_filter(specs, base_cwd, top):
    """Predicate on repo-relative paths for pathspecs given relative to base_cwd."""
    if specs is None:
        return lambda path: True
    rels = []
    for spec in specs:
        if spec.startswith(":"):  # magic pathspecs (:/, :!exclude): don't try to be clever
            return lambda path: True
        rel = os.path.relpath(hooklib.resolve(spec, base_cwd), top).replace("\\", "/")
        rels.append(rel)

    def matches(path):
        return any(r == "." or path == r or path.startswith(r.rstrip("/") + "/")
                   or fnmatch.fnmatchcase(path, r) for r in rels)
    return matches


def scan_diff(diff, keep):
    findings, path, line_no = [], None, 0
    for line in diff.splitlines():
        if line.startswith("+++ "):
            name = line[4:].strip().strip('"')
            path = None if name == "/dev/null" else (name[2:] if name.startswith("b/") else name)
        elif line.startswith("@@"):
            try:
                line_no = int(line.split("+", 1)[1].split(",")[0].split(" ")[0])
            except (IndexError, ValueError):
                line_no = 0
        elif line.startswith("+") and path and keep(path):
            text = line[1:]
            for name, start, end in hooklib.find_leaks(text):
                findings.append((path, line_no, name, text[start:end]))
            line_no += 1
    return findings


def scan_untracked(top, keep):
    findings = []
    names = [n for n in git(top, "ls-files", "--others", "--exclude-standard", "-z").split("\0") if n and keep(n)]
    for name in names[:MAX_UNTRACKED_FILES]:
        try:
            with open(os.path.join(top, name), "rb") as fh:
                blob = fh.read(MAX_FILE_BYTES)
        except OSError:
            continue
        if b"\0" in blob:
            continue  # binary
        for line_no, text in enumerate(blob.decode("utf-8", "replace").splitlines(), 1):
            for rule, start, end in hooklib.find_leaks(text):
                findings.append((name, line_no, rule, text[start:end]))
    return findings


def commit_findings(commit_cwd, commit_args, adds):
    """Credentials the commit would include. `adds` = [(cwd, git-add args)] that ran
    earlier in the same command line, so their files will be staged too."""
    top = git(commit_cwd, "rev-parse", "--show-toplevel").strip()
    if not top:
        return []
    diff_args = ["diff", "--no-color", "--no-ext-diff", "--src-prefix=a/", "--dst-prefix=b/",
                 "-U0", "--diff-filter=ACMRT"]
    findings = scan_diff(git(top, *(diff_args[:1] + ["--cached"] + diff_args[1:])), lambda p: True)

    commit_all, pathspecs = parse_commit_args(commit_args)
    tracked_filters, untracked_filters = [], []
    if commit_all:
        tracked_filters.append(lambda p: True)
    if pathspecs:
        tracked_filters.append(spec_filter(pathspecs, commit_cwd, top))
    for add_cwd, add_args in adds:
        if any(a in ("-n", "--dry-run") for a in add_args):
            continue
        specs = [a for a in add_args if not a.startswith("-")]
        everything = not specs and any(a in ("-A", "--all", "-u", "--update") for a in add_args)
        keep = spec_filter(None if everything else specs, add_cwd, top)
        tracked_filters.append(keep)
        if not any(a in ("-u", "--update") for a in add_args):
            untracked_filters.append(keep)
    if tracked_filters:
        findings += scan_diff(git(top, *diff_args), lambda p: any(f(p) for f in tracked_filters))
    if untracked_filters:
        findings += scan_untracked(top, lambda p: any(f(p) for f in untracked_filters))
    return list(dict.fromkeys(findings))


# ------------------------------------------------------------------------ main

def main():
    data = hooklib.read_input()
    if data.get("tool_name") not in ("Bash", "PowerShell"):
        return 0
    command = (data.get("tool_input") or {}).get("command") or ""
    cwd = data.get("cwd") or hooklib.PROJECT_DIR
    branch_hint, adds, push_issues, leak_findings = None, [], [], []

    for cmd in shellparse.parse(command):
        words = shellparse.command_words(cmd.words)
        if words[:1] == ["cd"]:
            cwd = hooklib.resolve(words[1] if len(words) > 1 else "~", cwd)
            continue
        if words[:1] != ["git"]:
            continue
        git_cwd, sub, args = split_git(words, cwd)
        if sub in ("checkout", "switch"):
            new = shellparse.option_values(args, ["-b", "-B", "-c", "-C", "--create"])
            rest = [a for a in args if not a.startswith("-") and a not in new]
            if new:
                branch_hint = new[0]
            elif rest and "--" not in args and not os.path.exists(hooklib.resolve(rest[0], git_cwd)):
                branch_hint = rest[0]  # `git checkout main` (not `git checkout <path>`)
        elif sub in ("add", "stage"):
            adds.append((git_cwd, args))
        elif sub == "push":
            push_issues += push_problems(args, git_cwd, branch_hint)
        elif sub == "commit":
            leak_findings += commit_findings(git_cwd, args, adds)

    if push_issues:
        hooklib.deny(data, HOOK, command, "push to protected branch: " + "; ".join(push_issues),
                     "BLOCKED by %s: pushing to main/master is not allowed.\n  - %s\n"
                     "Push a feature branch instead (git push -u origin <branch>) and open a pull request."
                     % (HOOK, "\n  - ".join(push_issues)))
    if leak_findings:
        lines = ["%s:%s  %s  (%s)" % (path, line, rule, hooklib.mask(value))
                 for path, line, rule, value in leak_findings[:20]]
        if len(leak_findings) > 20:
            lines.append("… and %d more" % (len(leak_findings) - 20))
        hooklib.deny(data, HOOK, command, "secret scan: %d finding(s) in %s" % (
            len(leak_findings), ", ".join(sorted({f[0] for f in leak_findings}))),
            "BLOCKED by %s secret scan: this commit would include likely credentials:\n  %s\n"
            "Move the value into .env (gitignored) and read it from the environment; unstage with "
            "`git restore --staged <file>`. If a line is a false positive, add a `gitleaks:allow` "
            "comment to it." % (HOOK, "\n  ".join(lines)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
