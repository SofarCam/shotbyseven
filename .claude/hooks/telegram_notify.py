#!/usr/bin/env python3
"""Stop + Notification hook: send a Telegram message about what finished / what's waiting.

Credentials come from the project's .env (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID), falling
back to environment variables of the same name; nothing is hardcoded and the token is
never logged. Missing credentials or a failed send are recorded in .claude/session.log
and never block Claude.
"""
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hooklib  # noqa: E402
import pricing  # noqa: E402

API_BASE = "https://api.telegram.org"
NOTIFICATION_HEADINGS = {
    "permission_prompt": "🔐 Permission needed",
    "idle_prompt": "💬 Waiting for your reply",
    "elicitation_dialog": "📝 Input requested",
    "elicitation_url_dialog": "📝 Input requested (browser)",
    "agent_needs_input": "⏳ A background session needs input",
    "agent_completed": "✅ A background session finished",
    "quota_auto_resume_stale": "⏸ Usage limit reset — press Enter to continue",
    "quota_auto_resume_disabled": "⏸ Usage limit — task not resumed",
}


def credentials():
    env_file = hooklib.load_dotenv(os.path.join(hooklib.PROJECT_DIR, ".env"))
    token = env_file.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = env_file.get("TELEGRAM_CHAT_ID") or os.environ.get("TELEGRAM_CHAT_ID", "")
    return token.strip(), chat_id.strip()


def api_base():
    """Overridable only to a local address (used by the test suite's mock server)."""
    override = os.environ.get("TELEGRAM_API_BASE", "")
    if urllib.parse.urlparse(override).hostname in ("127.0.0.1", "localhost", "::1"):
        return override.rstrip("/")
    return API_BASE


def send(token, chat_id, text):
    request = urllib.request.Request(
        "%s/bot%s/sendMessage" % (api_base(), token),
        data=json.dumps({"chat_id": chat_id, "text": text[:4000],
                         "disable_web_page_preview": True}).encode("utf-8"),
        headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8") or "{}")
        return bool(payload.get("ok")), payload.get("description", "")
    except urllib.error.HTTPError as err:
        try:
            description = json.loads(err.read().decode("utf-8")).get("description", "")
        except ValueError:
            description = ""
        return False, "HTTP %s %s" % (err.code, description)
    except Exception as err:  # network, TLS, timeout: report without the token
        return False, str(err).replace(token, "<token>")


def where():
    branch = ""
    try:
        branch = subprocess.run(["git", "-C", hooklib.PROJECT_DIR, "symbolic-ref", "--quiet", "--short", "HEAD"],
                                capture_output=True, text=True, timeout=5).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        pass
    name = os.path.basename(hooklib.PROJECT_DIR)
    return "%s (%s)" % (name, branch) if branch else name


def plain(text, limit):
    text = re.sub(r"```.*?```", "[code]", str(text or ""), flags=re.S)
    text = re.sub(r"\*\*|__|`", "", text)
    text = re.sub(r"(?m)^[ \t]*(?:#{1,6}|>)[ \t]*", "", text)
    return hooklib.one_line(text, limit)


def stop_message(data):
    usage = pricing.session_usage(data)
    session, turn = usage["session"], usage["turn"]
    threshold = pricing.alert_threshold()
    lines = ["✅ Claude finished · " + where()]
    if usage["prompt"]:
        lines.append("Task: " + hooklib.one_line(usage["prompt"], 200))
    result = data.get("last_assistant_message")
    if result:
        lines.append("Result: " + plain(result, 700))
    if session.cost > threshold:
        lines.append("⚠️ Session cost ≈ %s — over your %s limit (this turn %s)" % (
            pricing.fmt_usd(session.cost), pricing.fmt_usd(threshold), pricing.fmt_usd(turn.cost)))
    elif session.tokens:
        lines.append("💰 Session ≈ %s (this turn %s)" % (pricing.fmt_usd(session.cost), pricing.fmt_usd(turn.cost)))
    running = [t for t in data.get("background_tasks") or [] if isinstance(t, dict)]
    if running:
        lines.append("⏳ Still running: %d background task(s)" % len(running))
    return "\n\n".join(lines)


def notification_message(data):
    kind = data.get("notification_type") or ""
    heading = NOTIFICATION_HEADINGS.get(kind, "🔔 " + (data.get("title") or "Claude needs your attention"))
    body = data.get("message") or data.get("title") or kind
    return "%s · %s\n\n%s" % (heading, where(), plain(body, 800))


def main():
    data = hooklib.read_input()
    event = data.get("hook_event_name") or (sys.argv[1] if len(sys.argv) > 1 else "")
    if event == "Stop":
        label = "finished"
    elif event == "Notification":
        label = data.get("notification_type") or "notification"
    else:
        return 0
    token, chat_id = credentials()
    if not token or not chat_id:
        hooklib.log_event(data, event, "telegram", "skipped: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set in .env")
        return 0
    text = stop_message(data) if event == "Stop" else notification_message(data)
    ok, detail = send(token, chat_id, text)
    hooklib.log_event(data, event, "telegram (%s)" % label,
                      "sent" if ok else "failed: " + hooklib.one_line(detail, 160))
    return 0


if __name__ == "__main__":
    sys.exit(main())
