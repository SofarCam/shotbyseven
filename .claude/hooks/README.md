# Claude Code hooks

Wired up in [`.claude/settings.json`](../settings.json). Python 3.8+, standard library only.

| Event | Script | What it does |
|---|---|---|
| `PreToolUse` Write/Edit/MultiEdit/NotebookEdit/Bash | `protect_files.py` | Blocks writes to `.env*`, `*credentials*`, `*secret*`, `*.pem`, `seo-agent/brief.md`. `seo-agent/log.md` is append-only. |
| `PreToolUse` Bash | `git_guard.py` | Blocks `git push` to main/master. Before `git commit`, scans what the commit would include for API keys and tokens. |
| `PostToolUse` + `PostToolUseFailure` | `log_tool_call.py` | Appends `timestamp, session, tool, target, result` (tab-separated) to `.claude/session.log` |
| `Stop` | `usage_report.py` | Shows session tokens and estimated cost after each turn. ⚠️ flag over $5 |
| `Stop` + `Notification` | `telegram_notify.py` | Telegram message when Claude finishes or is waiting on you |

## Telegram setup

Put these in `.env` (gitignored; never commit it):

```
TELEGRAM_BOT_TOKEN=<token from @BotFather>
TELEGRAM_CHAT_ID=<your chat id>
```

To get the chat id, send your bot a message, then open `https://api.telegram.org/bot<token>/getUpdates`.
Environment variables with the same names are used as a fallback (handy for cloud sessions). Without
credentials the hook logs `skipped` and does nothing else.

## Settings

- `CLAUDE_COST_ALERT_USD`: cost alert threshold (default `5`)
- Protected paths and branches: constants at the top of `protect_files.py` and `git_guard.py`
- Secret-scan false positive: put `gitleaks:allow` in a comment on that line

## Test

```
python3 .claude/hooks/tests/test_hooks.py
```

Fires every hook the way Claude Code does: handlers are picked by event and matcher, each command
runs through `sh -c` with the event JSON on stdin. It runs against a throwaway sandbox repo and a
mock Telegram API, so your repo, `.env` and chat are never touched.

## Limits

- Shell-write detection in Bash is best-effort. It covers redirects, `tee`, `cp`/`mv`/`rm`, `sed -i`,
  `git clean`, and similar commands, but not writes made from inside `python -c` and the like.
- Cost is an API-list-price estimate from the session transcript (prices in `pricing.py`). On a
  Pro/Max plan it shows usage, not a bill.
- `idle_prompt` notifications aren't forwarded because the Stop message already says Claude is done.
  To get them too, add `idle_prompt` to the `Notification` matcher.
