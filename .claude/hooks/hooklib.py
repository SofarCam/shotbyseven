"""Shared helpers for this project's Claude Code hooks.

Standard library only, Python 3.8+ (works with macOS's system python3).
"""
import datetime
import json
import math
import os
import re
import sys

HOOKS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_RAW = os.path.abspath(
    os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(os.path.dirname(HOOKS_DIR))
)
PROJECT_DIR = os.path.realpath(_PROJECT_RAW)
LOG_PATH = os.path.join(PROJECT_DIR, ".claude", "session.log")
LOG_MAX_BYTES = 5 * 1024 * 1024

# Hook stdout/stderr are pipes; force UTF-8 so a non-UTF-8 locale can't crash a guard
# (a crashed PreToolUse hook exits 1, which Claude Code treats as "allow").
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass


def read_input():
    """The hook's JSON payload from stdin ({} if empty or malformed)."""
    try:
        data = json.load(sys.stdin)
    except ValueError:
        return {}
    return data if isinstance(data, dict) else {}


def one_line(text, limit=200):
    text = re.sub(r"\s+", " ", str(text if text is not None else "")).strip()
    return text if len(text) <= limit else text[: limit - 1] + "…"


def project_relative(path):
    """POSIX path relative to the project root when inside it, else absolute."""
    p = os.path.abspath(os.path.expanduser(str(path))).replace("\\", "/")
    for root in {PROJECT_DIR, _PROJECT_RAW}:
        root = root.replace("\\", "/").rstrip("/")
        if p == root:
            return "."
        if p.startswith(root + "/"):
            return p[len(root) + 1:]
    return p


def resolve(path, cwd):
    """Absolute path for a shell/tool argument (expands ~ and $VARS like the shell)."""
    path = os.path.expanduser(os.path.expandvars(str(path)))
    return os.path.normpath(os.path.join(cwd or PROJECT_DIR, path))


# --------------------------------------------------------------------------- logging

def log_event(data, tool, target, result):
    """Append one tab-separated line to .claude/session.log:
    timestamp, session, tool, target, result."""
    fields = [
        datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
        str(data.get("session_id") or "-")[:8],
        one_line(tool, 60),
        redact(one_line(target, 240)),
        redact(one_line(result, 240)),
    ]
    try:
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        if os.path.exists(LOG_PATH) and os.path.getsize(LOG_PATH) > LOG_MAX_BYTES:
            os.replace(LOG_PATH, LOG_PATH + ".1")
        with open(LOG_PATH, "a", encoding="utf-8") as fh:
            fh.write("\t".join(fields) + "\n")
    except OSError:
        pass


def deny(data, hook, target, reason, message):
    """Block the pending tool call. Exit 2 makes Claude Code cancel the call and
    hand `message` (stderr) to Claude as the reason."""
    log_event(data, data.get("tool_name") or "?", target, "BLOCKED by %s: %s" % (hook, reason))
    sys.stderr.write(message.rstrip() + "\n")
    sys.exit(2)


# --------------------------------------------------------------- credential patterns
# (name, regex). Group 0 is the credential itself. Kept deliberately specific so the
# commit scan doesn't cry wolf; the generic `key = value` rule below adds entropy checks.
_RULES = [
    ("private key", r"-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----"),
    ("AWS access key ID", r"\b(?:AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16}\b"),
    ("GitHub token", r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,255}\b"),
    ("GitHub fine-grained token", r"\bgithub_pat_[A-Za-z0-9_]{50,255}\b"),
    ("Anthropic API key", r"\bsk-ant-[a-z]{2,6}\d{2}-[A-Za-z0-9_\-]{40,}"),
    ("OpenAI API key", r"\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_\-]{40,}|\bsk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}\b"),
    ("Stripe secret key", r"\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{20,}\b"),
    ("Stripe webhook signing secret", r"\bwhsec_[A-Za-z0-9+/=]{24,}"),
    ("Google API key", r"\bAIza[0-9A-Za-z_\-]{35}(?![0-9A-Za-z_\-])"),
    ("Google OAuth client secret", r"\bGOCSPX-[A-Za-z0-9_\-]{28}(?![A-Za-z0-9_\-])"),
    ("Slack token", r"\bxox[abposr]-[A-Za-z0-9\-]{10,}"),
    ("Slack webhook URL", r"https://hooks\.slack\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[A-Za-z0-9]{20,}"),
    ("Discord webhook URL", r"https://(?:ptb\.|canary\.)?discord(?:app)?\.com/api/webhooks/\d+/[A-Za-z0-9_\-]{30,}"),
    ("Telegram bot token", r"\b\d{8,10}:AA[A-Za-z0-9_\-]{33}(?![A-Za-z0-9_\-])"),
    ("Resend API key", r"\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}\b"),
    ("SendGrid API key", r"\bSG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43}(?![A-Za-z0-9_\-])"),
    ("Twilio API key", r"\bSK[0-9a-f]{32}\b"),
    ("Mailgun API key", r"\bkey-[0-9a-f]{32}\b"),
    ("Shopify access token", r"\bshp(?:at|ca|pa|ss)_[a-fA-F0-9]{32}\b"),
    ("Hugging Face token", r"\bhf_[A-Za-z0-9]{34,}\b"),
    ("npm token", r"\bnpm_[A-Za-z0-9]{36}\b"),
    ("PyPI token", r"\bpypi-AgEIcHlwaS5vcmc[A-Za-z0-9_\-]{50,}"),
    ("Linear API key", r"\blin_api_[A-Za-z0-9]{40}\b"),
    ("Notion token", r"\b(?:secret_[A-Za-z0-9]{43}|ntn_[A-Za-z0-9]{46})\b"),
    ("Figma token", r"\bfigd_[A-Za-z0-9_\-]{40,}"),
    ("Meta/Instagram access token", r"\b(?:EAA[A-Za-z0-9]{80,}|IG(?:QV|AA)[A-Za-z0-9_\-]{80,})"),
    ("JSON Web Token", r"\beyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}"),
    ("password in URL", r"\b[a-z][a-z0-9+.\-]{1,20}://[^\s/:@'\"]{1,64}:[^\s/:@'\"]*\d[^\s/:@'\"]*@[A-Za-z0-9.\-]+"),
]
_RULES = [(name, re.compile(rx)) for name, rx in _RULES]

# KEY = "value" style assignments where the key names a credential.
_GENERIC = re.compile(
    r"(?i)(?P<key>[A-Za-z0-9_.\-]*(?:api[_\-]?key|apikey|secret|token|passw(?:or)?d|"
    r"private[_\-]?key|access[_\-]?key|auth[_\-]?key|credentials?)[A-Za-z0-9_\-]*)"
    r"[\"']?[ \t]*(?:=|:=|=>|:)[ \t]*[\"']?(?P<value>[A-Za-z0-9+/_\-.~=:]{16,})"
)
_CODE_REF = re.compile(r"^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)+$")
_PLACEHOLDER = re.compile(
    r"\$|\{\{|<|>|\*\*\*|x{4,}|X{4,}|EXAMPLE|example|your[_\-]|YOUR[_\-]|placeholder|PLACEHOLDER|"
    r"dummy|DUMMY|changeme|CHANGEME|redacted|REDACTED"
)
# Put one of these on a line to tell the commit scan it's a false positive.
ALLOW_MARKERS = ("gitleaks:allow", "pragma: allowlist secret")


def _looks_random(value):
    if len(value) < 16 or _CODE_REF.match(value):
        return False
    classes = sum(bool(re.search(rx, value)) for rx in ("[a-z]", "[A-Z]", "[0-9]"))
    if classes < 2:
        return False
    counts = {}
    for ch in value:
        counts[ch] = counts.get(ch, 0) + 1
    entropy = -sum(c / len(value) * math.log(c / len(value), 2) for c in counts.values())
    return entropy >= 3.5


def find_leaks(text):
    """[(rule name, start, end)] for likely credentials in `text` (one line)."""
    if any(marker in text for marker in ALLOW_MARKERS):
        return []
    hits = []
    for name, rx in _RULES:
        for m in rx.finditer(text):
            if not _PLACEHOLDER.search(m.group(0)):
                hits.append((name, m.start(), m.end()))
    for m in _GENERIC.finditer(text):
        value = m.group("value")
        start = m.start("value")
        if _PLACEHOLDER.search(value) or not _looks_random(value):
            continue
        if not any(s <= start < e for _, s, e in hits):
            hits.append(("credential assigned to %s" % m.group("key"), start, m.end("value")))
    return sorted(hits, key=lambda h: h[1])


def mask(value):
    value = str(value)
    return "*" * len(value) if len(value) <= 10 else value[:4] + "…" + value[-4:]


def redact(text):
    """Replace likely credentials in `text` with [REDACTED <kind>]."""
    for name, start, end in reversed(find_leaks(text)):
        text = text[:start] + "[REDACTED %s]" % name + text[end:]
    return text


# ------------------------------------------------------------------------------ misc

def load_dotenv(path):
    """Parse KEY=VALUE lines from a .env file (quotes, `export`, comments). Never logs values."""
    values = {}
    try:
        with open(path, encoding="utf-8-sig") as fh:
            for raw in fh:
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                if line.startswith("export "):
                    line = line[len("export "):].lstrip()
                key, sep, value = line.partition("=")
                if not sep:
                    continue
                value = value.strip()
                if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
                    value = value[1:-1]
                else:
                    value = re.split(r"\s+#", value, 1)[0].strip()
                values[key.strip()] = value
    except (OSError, UnicodeDecodeError):
        pass
    return values
