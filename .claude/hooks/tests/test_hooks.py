#!/usr/bin/env python3
"""End-to-end proof that every hook in .claude/settings.json fires and does its job.

Each check runs the hooks the way Claude Code does: handlers are picked from settings.json
by event + matcher, each `command` runs through `sh -c` with the event JSON on stdin and
CLAUDE_PROJECT_DIR set. Everything happens in a throwaway sandbox copy of the project
(temp git repo, fake .env, local mock Telegram API), so the real repo, .env and chat are
never touched.

    python3 .claude/hooks/tests/test_hooks.py [path/to/settings.json]
"""
import json
import os
import random
import re
import shutil
import string
import subprocess
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SETTINGS = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(REPO, ".claude", "settings.json")
MATCH_FIELD = {"PreToolUse": "tool_name", "PostToolUse": "tool_name",
               "PostToolUseFailure": "tool_name", "Notification": "notification_type"}
RESULTS = []


def rand(n, alphabet=string.ascii_letters + string.digits):
    return "".join(random.choice(alphabet) for _ in range(n))


# Fake credentials are assembled at runtime so this file never contains one.
FAKE_TG_TOKEN = "%d:%s%s" % (random.randint(10 ** 9, 2 * 10 ** 9), "A" * 2, rand(33))
FAKE_AWS_KEY = "AK" + "IA" + rand(16, string.ascii_uppercase + string.digits)
FAKE_GH_TOKEN = "gh" + "p_" + rand(36)


# ------------------------------------------------------------------ harness

def check(name, ok, detail=""):
    RESULTS.append(bool(ok))
    print("  %s %s%s" % ("PASS" if ok else "FAIL", name, "" if ok or not detail else "\n       -> " + detail))


class Outcome(object):
    def __init__(self):
        self.ran, self.codes, self.stderr, self.json = [], [], "", []

    @property
    def blocked(self):
        return 2 in self.codes


def matcher_matches(matcher, value):
    """Claude Code's documented matcher semantics."""
    if matcher in (None, "", "*"):
        return True
    if re.fullmatch(r"[A-Za-z0-9_\-|, ]*", matcher):
        return (value or "") in [m.strip() for m in re.split(r"[|,]", matcher)]
    return re.search(matcher, value or "") is not None


class Sandbox(object):
    def __init__(self):
        with open(SETTINGS) as fh:
            self.settings = json.load(fh)
        self.root = tempfile.mkdtemp(prefix="hooktest-")
        self.proj = os.path.join(self.root, "shotbyseven")
        hooks_src = os.path.join(REPO, ".claude", "hooks")
        os.makedirs(os.path.join(self.proj, ".claude", "hooks"))
        for name in os.listdir(hooks_src):
            if name.endswith(".py"):
                shutil.copy(os.path.join(hooks_src, name), os.path.join(self.proj, ".claude", "hooks", name))
        shutil.copy(SETTINGS, os.path.join(self.proj, ".claude", "settings.json"))
        self.git("init", "-q", "-b", "main")
        self.git("config", "user.name", "Hook Test")
        self.git("config", "user.email", "hooktest@example.invalid")
        self.git("config", "commit.gpgsign", "false")
        self.write("README.md", "# sandbox\n")
        self.write("src/App.jsx", "export default function App() { return null }\n")
        self.write("seo-agent/brief.md", "# SEO brief\nTarget: wedding photography, Portland\n")
        self.write("seo-agent/log.md", "- 2026-09-01 kickoff\n- 2026-09-10 keyword audit\n")
        self.write(".gitignore", ".env\n.env.*\n!.env.example\n.claude/session.log*\n")
        self.write(".env.example", "TELEGRAM_BOT_TOKEN=\nTELEGRAM_CHAT_ID=\n")
        self.git("add", "-A")
        self.git("commit", "-q", "-m", "init")
        self.write(".env", "# local only\nTELEGRAM_BOT_TOKEN=%s\nTELEGRAM_CHAT_ID=\"4242\"\n" % FAKE_TG_TOKEN)
        self.telegram = []
        self.server = HTTPServer(("127.0.0.1", 0), self._handler())
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.env = {k: v for k, v in os.environ.items() if not k.startswith(("TELEGRAM_", "CLAUDE_COST"))}
        self.env.update({"CLAUDE_PROJECT_DIR": self.proj,
                         "TELEGRAM_API_BASE": "http://127.0.0.1:%d" % self.server.server_port,
                         "NO_PROXY": "127.0.0.1,localhost", "no_proxy": "127.0.0.1,localhost"})

    def _handler(self):
        sink = self.telegram

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                body = self.rfile.read(int(self.headers.get("Content-Length") or 0))
                sink.append({"path": self.path, "body": json.loads(body.decode("utf-8"))})
                reply = json.dumps({"ok": True, "result": {"message_id": len(sink)}}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(reply)))
                self.end_headers()
                self.wfile.write(reply)

            def log_message(self, *args):
                pass
        return Handler

    def path(self, rel):
        return os.path.join(self.proj, rel)

    def write(self, rel, text):
        os.makedirs(os.path.dirname(self.path(rel)), exist_ok=True)
        with open(self.path(rel), "w") as fh:
            fh.write(text)

    def read(self, rel):
        with open(self.path(rel)) as fh:
            return fh.read()

    def git(self, *args):
        return subprocess.run(["git", "-C", self.proj] + list(args), capture_output=True, text=True, check=True).stdout

    def log_lines(self):
        try:
            return self.read(".claude/session.log").splitlines()
        except OSError:
            return []

    def fire(self, event, payload, env=None):
        """Run every handler Claude Code would run for this event, like Claude Code does."""
        data = {"session_id": "test-session-0001", "transcript_path": self.path("transcript.jsonl"),
                "cwd": self.proj, "permission_mode": "default", "hook_event_name": event}
        data.update(payload)
        outcome = Outcome()
        field = MATCH_FIELD.get(event)
        for group in self.settings.get("hooks", {}).get(event, []):
            if field and not matcher_matches(group.get("matcher"), data.get(field)):
                continue
            for handler in group.get("hooks", []):
                proc = subprocess.run(["sh", "-c", handler["command"]], input=json.dumps(data),
                                      cwd=data["cwd"], env=env or self.env, capture_output=True,
                                      text=True, timeout=handler.get("timeout", 600))
                outcome.ran.append(re.findall(r"hooks/([\w.]+)", handler["command"])[0])
                outcome.codes.append(proc.returncode)
                outcome.stderr += proc.stderr
                if proc.stdout.strip().startswith("{"):
                    outcome.json.append(json.loads(proc.stdout))
                if proc.returncode not in (0, 2):
                    check("%s exited cleanly" % outcome.ran[-1], False, proc.stderr.strip()[-400:])
        return outcome

    def pre(self, tool, tool_input):
        return self.fire("PreToolUse", {"tool_name": tool, "tool_input": tool_input, "tool_use_id": "toolu_test"})

    def bash(self, command):
        return self.pre("Bash", {"command": command, "description": "test"})


# --------------------------------------------------------------- transcripts

def transcript(sb, name, opus_output):
    """Synthetic transcript: an earlier turn on Opus 5.5, the current turn on Sonnet 5,
    plus a Haiku subagent. Returns (path, expected session $, expected turn $)."""
    path = sb.path(name + ".jsonl")
    final = "Fixed the gallery lightbox and the build passes."

    def assistant(msg_id, ts, model, usage, text="working"):
        return {"type": "assistant", "timestamp": ts, "requestId": "req_" + msg_id, "uuid": rand(8),
                "message": {"id": msg_id, "model": model, "usage": usage, "role": "assistant",
                            "content": [{"type": "text", "text": text}]}}
    opus_usage = {"input_tokens": 1000, "output_tokens": opus_output, "cache_read_input_tokens": 2000000,
                  "cache_creation_input_tokens": 100000,
                  "cache_creation": {"ephemeral_1h_input_tokens": 100000, "ephemeral_5m_input_tokens": 0}}
    sonnet_usage = {"input_tokens": 2000, "output_tokens": 10000, "cache_read_input_tokens": 500000,
                    "cache_creation_input_tokens": 20000, "server_tool_use": {"web_search_requests": 3}}
    rows = [
        {"type": "user", "timestamp": "2026-09-24T10:00:00.000Z", "promptId": "p1",
         "message": {"role": "user", "content": "Earlier task"}},
        assistant("msg_a", "2026-09-24T10:00:05.000Z", "claude-opus-5-5", opus_usage),
        assistant("msg_a", "2026-09-24T10:00:05.000Z", "claude-opus-5-5", opus_usage),  # same response, 2nd block
        {"type": "user", "timestamp": "2026-09-24T11:00:00.000Z", "promptId": "p2",
         "message": {"role": "user", "content": "Fix the gallery lightbox on mobile"}},
        {"type": "user", "timestamp": "2026-09-24T11:00:01.000Z", "promptId": "p2",
         "message": {"role": "user", "content": [{"type": "tool_result", "content": "ok"}]}},
        assistant("msg_b", "2026-09-24T11:00:09.000Z", "claude-sonnet-5", sonnet_usage, final),
    ]
    with open(path, "w") as fh:
        fh.write("\n".join(json.dumps(r) for r in rows) + "\n")
    os.makedirs(sb.path(name + "/subagents"), exist_ok=True)
    with open(sb.path(name + "/subagents/agent-1.jsonl"), "w") as fh:
        fh.write(json.dumps(assistant("msg_c", "2026-09-24T11:00:04.000Z", "claude-haiku-4-5-20251001",
                                      {"input_tokens": 5000, "output_tokens": 2000})) + "\n")
    opus = (1000 * 4 + opus_output * 20 + 2000000 * 4 * 0.05 + 100000 * 4 * 2) / 1e6
    sonnet = (2000 * 2 + 10000 * 10 + 500000 * 2 * 0.1 + 20000 * 2 * 1.25) / 1e6 + 3 * 0.01
    haiku = (5000 * 1 + 2000 * 5) / 1e6
    return path, final, opus + sonnet + haiku, sonnet + haiku


def usd(x):
    return "$%.2f" % x


# ------------------------------------------------------------------- tests

def test_wiring(sb):
    print("\n0. settings.json wiring")
    hooks = sb.settings.get("hooks", {})
    for event in ("PreToolUse", "PostToolUse", "PostToolUseFailure", "Stop", "Notification"):
        check("%s hooks configured" % event, hooks.get(event))
    for event, groups in hooks.items():
        for group in groups:
            for handler in group["hooks"]:
                scripts = re.findall(r"\.claude/hooks/[\w.]+\.py", handler["command"])
                check("%s -> %s exists" % (event, scripts[0] if scripts else handler["command"]),
                      scripts and os.path.exists(os.path.join(REPO, scripts[0])))


def test_protect_files(sb):
    print("\n1. PreToolUse protect_files: .env*, *credentials*, *secret*, *.pem, seo-agent brief/log")
    for rel in (".env", ".env.production", "config/credentials.json", "notes/my-secret-plan.md",
                "certs/server.pem", "seo-agent/brief.md"):
        out = sb.pre("Write", {"file_path": sb.path(rel), "content": "x\n"})
        check("Write %s is blocked" % rel, out.blocked and "protect-files" in out.stderr, out.stderr)
    out = sb.pre("Edit", {"file_path": sb.path("seo-agent/brief.md"), "old_string": "Portland", "new_string": "Seattle"})
    check("Edit seo-agent/brief.md is blocked", out.blocked)
    out = sb.pre("NotebookEdit", {"notebook_path": sb.path("analysis/secret-model.ipynb"), "new_source": "1"})
    check("NotebookEdit analysis/secret-model.ipynb is blocked", out.blocked)
    check("Write src/App.jsx is allowed (control)",
          not sb.pre("Write", {"file_path": sb.path("src/App.jsx"), "content": "x"}).blocked)

    log = sb.read("seo-agent/log.md")
    last = log.splitlines(True)[-1]
    check("Write seo-agent/log.md that appends is allowed",
          not sb.pre("Write", {"file_path": sb.path("seo-agent/log.md"), "content": log + "- 2026-09-24 new\n"}).blocked)
    out = sb.pre("Write", {"file_path": sb.path("seo-agent/log.md"), "content": "- rewritten\n"})
    check("Write seo-agent/log.md that rewrites is blocked", out.blocked and "append-only" in out.stderr, out.stderr)
    check("Edit seo-agent/log.md that appends after the last line is allowed",
          not sb.pre("Edit", {"file_path": sb.path("seo-agent/log.md"), "old_string": last,
                              "new_string": last + "- 2026-09-24 new\n"}).blocked)
    check("Edit seo-agent/log.md that changes an old entry is blocked",
          sb.pre("Edit", {"file_path": sb.path("seo-agent/log.md"), "old_string": "kickoff",
                          "new_string": "KICKOFF"}).blocked)

    for command, should_block in (
            ("echo '- 2026-09-24 ran audit' >> seo-agent/log.md", False),
            ("printf 'x\\n' | tee -a seo-agent/log.md", False),
            ("echo oops > seo-agent/log.md", True),
            ("printf 'x' | tee seo-agent/log.md", True),
            ("sed -i 's/Portland/Seattle/' seo-agent/brief.md", True),
            ("cp .env.example .env", True),
            ("rm -rf seo-agent", True),
            ("git clean -fdx", True),
            ("cat .env && grep -rn secret src/", False),
            ("npm run build > build.log 2>&1", False)):
        out = sb.bash(command)
        check("Bash `%s` is %s" % (command, "blocked" if should_block else "allowed"),
              out.blocked == should_block, out.stderr)


def test_git_guard(sb):
    print("\n2. PreToolUse git_guard: no pushes to main/master, secret scan before commits")
    for command, should_block in (
            ("git push origin main", True),
            ("git push -u origin master", True),
            ("git push origin HEAD:main", True),
            ("git push --force origin feature:refs/heads/main", True),
            ("git push origin :main", True),
            ("npm test && git push origin main", True),
            ("git push", True),  # sandbox is on main
            ("git push origin feature/login", False),
            ("git push -u origin main-docs", False),
            ("git checkout -b feature/x && git push -u origin HEAD", False),
            ("git commit -m 'docs: never git push origin main'", False)):
        out = sb.bash(command)
        check("Bash `%s` is %s" % (command, "blocked" if should_block else "allowed"),
              out.blocked == should_block and (not should_block or "git-guard" in out.stderr), out.stderr)
    sb.git("checkout", "-q", "-b", "feature/y")
    check("bare `git push` on a feature branch is allowed", not sb.bash("git push").blocked)
    sb.git("checkout", "-q", "main")

    sb.write("src/aws.js", 'export const AWS_KEY = "%s";\n' % FAKE_AWS_KEY)
    sb.git("add", "src/aws.js")
    out = sb.bash("git commit -m 'add aws config'")
    check("commit with a staged AWS key is blocked (file:line reported)",
          out.blocked and "src/aws.js:1" in out.stderr and "AWS access key ID" in out.stderr, out.stderr)
    check("the blocked message masks the key", FAKE_AWS_KEY not in out.stderr and FAKE_AWS_KEY[:4] + "…" in out.stderr)
    sb.git("rm", "-q", "--cached", "src/aws.js")
    os.remove(sb.path("src/aws.js"))

    sb.write("src/notify.js", "const TELEGRAM_BOT_TOKEN = '%s';\n" % FAKE_TG_TOKEN)
    out = sb.bash("git add -A && git commit -m wip")
    check("`git add -A && git commit` with a token in an untracked file is blocked",
          out.blocked and "src/notify.js:1" in out.stderr, out.stderr)
    sb.write("src/App.jsx", "export default function App() { return 'hi' }\n")
    check("`git add src/App.jsx && git commit` ignores the unrelated file and is allowed",
          not sb.bash("git add src/App.jsx && git commit -m 'tweak app'").blocked)
    sb.write("src/notify.js", "const TELEGRAM_BOT_TOKEN = '%s'; // gitleaks:allow\n" % FAKE_TG_TOKEN)
    check("a line marked gitleaks:allow is not flagged", not sb.bash("git add -A && git commit -m wip").blocked)
    os.remove(sb.path("src/notify.js"))
    sb.git("add", "-A")
    check("a clean staged change commits fine", not sb.bash("git commit -m 'clean change'").blocked)


def test_logging(sb):
    print("\n3. PostToolUse / PostToolUseFailure log_tool_call -> .claude/session.log")
    before = len(sb.log_lines())
    sb.fire("PostToolUse", {"tool_name": "Bash", "tool_input": {"command": "git status --short"},
                            "tool_response": {"stdout": " M a\n?? b\n", "stderr": "", "interrupted": False},
                            "duration_ms": 42})
    sb.fire("PostToolUse", {"tool_name": "Write", "tool_input": {"file_path": sb.path("src/App.jsx"), "content": "x"},
                            "tool_response": {"type": "update", "filePath": sb.path("src/App.jsx")}})
    sb.fire("PostToolUse", {"tool_name": "mcp__github__get_me", "tool_input": {},
                            "tool_response": [{"type": "text", "text": "{}"}]})
    sb.fire("PostToolUseFailure", {"tool_name": "Bash", "tool_input": {"command": "npm test"},
                                   "error": "Exit code 1\nError: Cannot find module 'x'", "is_interrupt": False})
    sb.fire("PostToolUse", {"tool_name": "Bash", "tool_input": {
        "command": "curl -H 'Authorization: token %s' https://api.github.com/user" % FAKE_GH_TOKEN},
        "tool_response": {"stdout": "{}", "stderr": ""}})
    new = [line.split("\t") for line in sb.log_lines()[before:]]
    check("5 tool calls -> 5 new log lines", len(new) == 5, repr(new))
    first = new[0] if new else [""] * 5
    check("line has timestamp, session, tool, target, result",
          len(first) == 5 and re.match(r"\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d", first[0])
          and first[2:] == ["Bash", "git status --short", "ok (exit 0, 2 lines of output) [42ms]"], repr(first))
    check("Write is logged with a project-relative target",
          len(new) > 1 and new[1][2:] == ["Write", "src/App.jsx", "ok (overwritten)"], repr(new[1:2]))
    check("MCP tools are logged too", len(new) > 2 and new[2][2] == "mcp__github__get_me", repr(new[2:3]))
    check("failed calls are logged with the error",
          len(new) > 3 and new[3][2:] == ["Bash", "npm test", "error: Exit code 1"], repr(new[3:4]))
    check("credentials in targets are redacted",
          len(new) > 4 and FAKE_GH_TOKEN not in new[4][3] and "[REDACTED GitHub token]" in new[4][3], repr(new[4:5]))
    log = "\n".join(sb.log_lines())
    check("calls blocked by the PreToolUse guards are logged as BLOCKED",
          "BLOCKED by protect-files" in log and "BLOCKED by git-guard" in log)


def test_usage(sb):
    print("\n4. Stop usage_report: token/cost summary, flagged over $5")
    path, final, session_cost, turn_cost = transcript(sb, "t-small", opus_output=50000)
    out = sb.fire("Stop", {"transcript_path": path, "prompt_id": "p2", "stop_hook_active": False,
                           "last_assistant_message": final})
    message = next((j.get("systemMessage") for j in out.json if "systemMessage" in j), "")
    print("       systemMessage: " + message)
    check("Stop fired usage_report and telegram_notify", sorted(out.ran) == ["telegram_notify.py", "usage_report.py"], repr(out.ran))
    check("reports session cost %s and this-turn cost %s" % (usd(session_cost), usd(turn_cost)),
          usd(session_cost) in message and "this turn " + usd(turn_cost) in message, message)
    check("dedupes split responses and includes the subagent transcript",
          "cache read 2.5M" in message and "haiku-4-5" in message, message)
    check("not flagged under $5", message.startswith("💰") and "ALERT" not in message, message)
    check("never blocks Claude from stopping", not out.blocked and not any("decision" in j for j in out.json))

    path, final, session_cost, _ = transcript(sb, "t-big", opus_output=400000)
    out = sb.fire("Stop", {"transcript_path": path, "prompt_id": "p2", "last_assistant_message": final})
    message = next((j.get("systemMessage") for j in out.json if "systemMessage" in j), "")
    print("       systemMessage: " + message)
    check("flagged when the session is over $5 (%s)" % usd(session_cost),
          message.startswith("⚠️ COST ALERT") and usd(session_cost) in message, message)
    check("usage is recorded in session.log",
          any("session usage" in line and usd(session_cost) in line and "OVER $5.00" in line for line in sb.log_lines()))


def test_telegram(sb):
    print("\n5. Stop + Notification telegram_notify (credentials from .env, mock Telegram API)")
    sb.telegram[:] = []
    path, final, session_cost, turn_cost = transcript(sb, "t-small", opus_output=50000)
    sb.fire("Stop", {"transcript_path": path, "prompt_id": "p2", "last_assistant_message": final})
    msg = sb.telegram[-1] if sb.telegram else {"path": "", "body": {}}
    text = msg["body"].get("text", "")
    print("       Stop message:\n         " + text.replace("\n", "\n         "))
    check("Stop sends one Telegram message", len(sb.telegram) == 1)
    check("uses the bot token and chat id from .env",
          msg["path"] == "/bot%s/sendMessage" % FAKE_TG_TOKEN and msg["body"].get("chat_id") == "4242")
    check("says what finished (task, result, cost)",
          "Claude finished" in text and "Fix the gallery lightbox on mobile" in text and final in text
          and usd(session_cost) in text, text)

    path, final, session_cost, _ = transcript(sb, "t-big", opus_output=400000)
    sb.fire("Stop", {"transcript_path": path, "prompt_id": "p2", "last_assistant_message": final})
    text = sb.telegram[-1]["body"].get("text", "") if sb.telegram else ""
    check("over-$5 sessions are flagged in the message", "over your $5.00 limit" in text, text)

    count = len(sb.telegram)
    out = sb.fire("Notification", {"notification_type": "permission_prompt", "title": "Permission needed",
                                   "message": "Claude needs your permission to use Bash"})
    text = sb.telegram[-1]["body"].get("text", "") if len(sb.telegram) > count else ""
    print("       Notification message:\n         " + text.replace("\n", "\n         "))
    check("permission prompt -> 'waiting on you' message",
          out.ran == ["telegram_notify.py"] and "Claude needs your permission to use Bash" in text, text)
    count = len(sb.telegram)
    out = sb.fire("Notification", {"notification_type": "idle_prompt", "message": "Claude is waiting for your input"})
    check("idle_prompt is not re-sent (the Stop message already covers it)", not out.ran and len(sb.telegram) == count)

    os.rename(sb.path(".env"), sb.path(".env.off"))
    count = len(sb.telegram)
    out = sb.fire("Stop", {"transcript_path": path, "last_assistant_message": final})
    os.rename(sb.path(".env.off"), sb.path(".env"))
    check("without .env credentials it skips quietly (exit 0, logged)",
          len(sb.telegram) == count and out.codes == [0, 0] and "skipped" in "\n".join(sb.log_lines()[-2:]))
    check("the bot token never appears in session.log", FAKE_TG_TOKEN not in "\n".join(sb.log_lines()))


def main():
    print("Testing hooks from %s" % SETTINGS)
    sb = Sandbox()
    try:
        test_wiring(sb)
        test_protect_files(sb)
        test_git_guard(sb)
        test_logging(sb)
        test_usage(sb)
        test_telegram(sb)
    finally:
        sb.server.shutdown()
        shutil.rmtree(sb.root, ignore_errors=True)
    passed = sum(RESULTS)
    print("\n%d/%d checks passed" % (passed, len(RESULTS)))
    return 0 if passed == len(RESULTS) else 1


if __name__ == "__main__":
    sys.exit(main())
