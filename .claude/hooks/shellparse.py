"""Best-effort shell parsing for the PreToolUse guards.

Not a full shell grammar: it covers what Claude's Bash calls realistically contain
(&&, ||, ;, | chains and newlines, redirections, heredocs, comments, $(...) and
backtick substitutions, `sh -c '...'`, `eval`, env/sudo/time prefixes) well enough
to find `git push` targets and file writes without flagging text inside quotes.
"""
import os
import re
import shlex

_PUNCT = "();<>|&\n"
_OPS = re.compile(r"&>>|&>|>>|>\||>&|<<<|<<-|<<|<>|<&|>|<|&&|\|\||\|&|;;&|;;|;&|[;&|()\n]")
_HEREDOC = re.compile(r"(?<!<)<<(?!<)(-?)[ \t]*(['\"]?)\\?([A-Za-z_][A-Za-z0-9_]*)\2")
_ASSIGNMENT = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=")
_PREFIXES = {"then", "do", "else", "elif", "if", "while", "until", "!", "time", "command",
             "builtin", "exec", "nohup", "nice", "env", "xargs", "sudo", "doas"}
_SUDO_VALUE_OPTS = {"-u", "-g", "-h", "-p", "-C", "-D", "-R", "-T", "-U"}
SHELLS = {"sh", "bash", "zsh", "dash", "ksh"}


class Command(object):
    """One simple command: its words (quotes removed) and (operator, target) redirects."""

    def __init__(self):
        self.words = []
        self.redirects = []

    def __repr__(self):
        return "Command(%r, %r)" % (self.words, self.redirects)


def strip_heredocs(text):
    """Drop heredoc bodies (they are data, not commands; they also often hold quotes
    that would confuse tokenizing, e.g. commit messages)."""
    out, pending = [], []
    for line in text.split("\n"):
        if pending:
            delim, tabs = pending[0]
            if (line.lstrip("\t") if tabs else line).rstrip() == delim:
                pending.pop(0)
            continue
        out.append(line)
        for m in _HEREDOC.finditer(line):
            pending.append((m.group(3), m.group(1) == "-"))
    return "\n".join(out)


def strip_comments(text):
    """Remove unquoted `# ...` comments."""
    out, quote, i, n = [], None, 0, len(text)
    while i < n:
        ch = text[i]
        if quote:
            out.append(ch)
            if ch == "\\" and quote == '"' and i + 1 < n:
                out.append(text[i + 1])
                i += 2
                continue
            if ch == quote:
                quote = None
        elif ch == "\\" and i + 1 < n:
            out.append(text[i:i + 2])
            i += 2
            continue
        elif ch in "'\"":
            quote = ch
            out.append(ch)
        elif ch == "#" and (i == 0 or text[i - 1] in " \t\n;&|()"):
            end = text.find("\n", i)
            if end == -1:
                break
            i = end
            continue
        else:
            out.append(ch)
        i += 1
    return "".join(out)


def substitutions(text):
    """Bodies of $(...) and `...` substitutions, which the shell also executes."""
    found, i, n = [], 0, len(text)
    while i < n:
        if text.startswith("$(", i) and not text.startswith("$((", i):
            depth, j = 0, i + 1
            while j < n:
                if text[j] == "(":
                    depth += 1
                elif text[j] == ")":
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            found.append(text[i + 2:j])
            i = j + 1
        elif text[i] == "`":
            j = text.find("`", i + 1)
            if j == -1:
                break
            found.append(text[i + 1:j])
            i = j + 1
        elif text[i] == "\\":
            i += 2
        else:
            i += 1
    return found


def tokenize(text):
    """[(token, is_operator)] using shlex; degrades gracefully on unbalanced quotes."""
    for attempt in (text, text.replace('"', " ").replace("'", " ")):
        lex = shlex.shlex(attempt, posix=True, punctuation_chars=_PUNCT)
        lex.whitespace = " \t\r"
        lex.whitespace_split = True
        lex.commenters = ""
        try:
            tokens = list(lex)
        except ValueError:
            continue
        return [(t, bool(t) and all(c in _PUNCT for c in t)) for t in tokens]
    return [(t, False) for t in text.split()]


def parse(command, _depth=0):
    """Split a command line into simple Commands, including those inside
    substitutions, `sh -c` scripts and `eval` arguments."""
    if not command or _depth > 4:
        return []
    text = strip_comments(strip_heredocs(command))
    result = []
    for inner in substitutions(text):
        result.extend(parse(inner, _depth + 1))
    current, redirect_op = Command(), None
    for token, is_op in tokenize(text):
        if is_op:
            for op in _OPS.findall(token):
                if "<" in op or ">" in op:
                    if current.words and current.words[-1].isdigit():
                        current.words.pop()  # the fd number in 2>file / 1>&2
                    redirect_op = op
                else:
                    if current.words or current.redirects:
                        result.append(current)
                    current, redirect_op = Command(), None
        elif redirect_op is not None:
            current.redirects.append((redirect_op, token))
            redirect_op = None
        else:
            current.words.append(token)
    if current.words or current.redirects:
        result.append(current)
    for cmd in list(result):
        script = inline_script(command_words(cmd.words))
        if script:
            result.extend(parse(script, _depth + 1))
    return result


def command_words(words):
    """Words with leading VAR=value assignments and wrappers (sudo, env, time,
    nohup, xargs, then/do, ...) removed; the command name is reduced to its basename."""
    words = list(words)
    while words:
        head = words[0]
        if _ASSIGNMENT.match(head):
            words.pop(0)
        elif head in _PREFIXES:
            words.pop(0)
            while words and words[0].startswith("-"):
                opt = words.pop(0)
                if head in ("sudo", "doas") and opt in _SUDO_VALUE_OPTS and words:
                    words.pop(0)
        elif head == "timeout":
            words.pop(0)
            while words and words[0].startswith("-"):
                words.pop(0)
            if words:
                words.pop(0)  # the duration
        else:
            break
    if words:
        words[0] = os.path.basename(words[0])
    return words


def inline_script(words):
    """The script text run by `bash -c '...'` or `eval ...`, if any."""
    if not words:
        return None
    if words[0] == "eval":
        return " ".join(words[1:])
    if words[0] in SHELLS:
        for i, word in enumerate(words[1:-1], 1):
            if word.startswith("-") and not word.startswith("--") and "c" in word[1:]:
                return words[i + 1]
    return None


def option_values(args, names):
    """Values given to any of the options in `names` (`-o x`, `-ox`, `--out=x`)."""
    values, i = [], 0
    while i < len(args):
        arg = args[i]
        for name in names:
            if arg == name and i + 1 < len(args):
                values.append(args[i + 1])
                i += 1
                break
            if name.startswith("--") and arg.startswith(name + "="):
                values.append(arg[len(name) + 1:])
                break
            if not name.startswith("--") and len(name) == 2 and arg.startswith(name) and len(arg) > 2 \
                    and not arg.startswith("--"):
                values.append(arg[2:])
                break
        i += 1
    return values
