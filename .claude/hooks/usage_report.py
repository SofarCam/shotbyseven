#!/usr/bin/env python3
"""Stop hook: report the session's token usage and estimated cost; flag it past $5.

Shows a one-line summary to the user (JSON `systemMessage`) at the end of every turn
and records it in .claude/session.log. Threshold: CLAUDE_COST_ALERT_USD (default 5).
Never blocks Claude from stopping.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hooklib  # noqa: E402
import pricing  # noqa: E402


def summary(session, turn, threshold):
    if not session.tokens:
        return "💰 Session usage: no API usage recorded yet."
    breakdown = "in %s · out %s · cache write %s · cache read %s" % tuple(
        pricing.fmt_tokens(n) for n in (session.input, session.output, session.cache_write, session.cache_read))
    extras = []
    if session.web_searches:
        extras.append("%d web searches" % session.web_searches)
    if session.unpriced:
        extras.append("unknown model priced as nearest family: " + ", ".join(sorted(session.unpriced)))
    text = "%s tokens (%s) ≈ %s API-equivalent · this turn %s · %s%s" % (
        pricing.fmt_tokens(session.tokens), breakdown, pricing.fmt_usd(session.cost),
        pricing.fmt_usd(turn.cost), ", ".join(sorted(session.models)),
        "".join(" · " + e for e in extras))
    if session.cost > threshold:
        return "⚠️ COST ALERT: this session is over %s — %s" % (pricing.fmt_usd(threshold), text)
    return "💰 Session usage: " + text


def main():
    data = hooklib.read_input()
    usage = pricing.session_usage(data)
    session, turn = usage["session"], usage["turn"]
    threshold = pricing.alert_threshold()
    message = summary(session, turn, threshold)
    print(json.dumps({"systemMessage": message}))
    hooklib.log_event(data, "Stop", "session usage",
                      "%s session, %s this turn, %s tokens%s" % (
                          pricing.fmt_usd(session.cost), pricing.fmt_usd(turn.cost),
                          pricing.fmt_tokens(session.tokens),
                          " — OVER %s" % pricing.fmt_usd(threshold) if session.cost > threshold else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
