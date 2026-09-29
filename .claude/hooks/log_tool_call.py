#!/usr/bin/env python3
"""PostToolUse / PostToolUseFailure hook: append every tool call to .claude/session.log.

One tab-separated line per call:  timestamp  session  tool  target  result
Calls blocked by the PreToolUse guards are logged by the guards themselves
("BLOCKED by ..."), since blocked calls never reach PostToolUse.
Likely credentials in targets are redacted before anything is written.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hooklib  # noqa: E402

TARGET_KEYS = ("file_path", "notebook_path", "url", "query", "pattern", "skill", "path",
               "description", "prompt", "subject", "name", "message")


def target_of(tool, tool_input):
    if not isinstance(tool_input, dict):
        return hooklib.one_line(tool_input)
    if tool in ("Bash", "PowerShell"):
        return tool_input.get("command", "")
    if tool in ("Agent", "Task"):
        return "%s: %s" % (tool_input.get("subagent_type") or "agent", tool_input.get("description", ""))
    if tool in ("Grep", "Glob"):
        where = tool_input.get("path") or tool_input.get("glob")
        return tool_input.get("pattern", "") + (" in " + hooklib.project_relative(where) if where else "")
    for key in TARGET_KEYS:
        value = tool_input.get(key)
        if value:
            return hooklib.project_relative(value) if key.endswith("path") else value
    return json.dumps(tool_input, sort_keys=True, default=str)


def result_of(tool, response):
    """Short success summary from the tool_response."""
    if not isinstance(response, dict):
        return "ok"
    if tool in ("Bash", "PowerShell"):
        lines = len((response.get("stdout") or "").splitlines())
        parts = ["exit 0", "%d line%s of output" % (lines, "" if lines == 1 else "s")]
        if response.get("backgroundTaskId"):
            parts = ["started in background"]
        if response.get("interrupted"):
            parts.append("interrupted")
        return "ok (%s)" % ", ".join(parts)
    if response.get("type") in ("create", "update"):
        return "ok (%s)" % ("created" if response["type"] == "create" else "overwritten")
    if "oldString" in response or "structuredPatch" in response:
        return "ok (edited)"
    if isinstance(response.get("file"), dict) and "numLines" in response["file"]:
        return "ok (%s lines)" % response["file"]["numLines"]
    if "numFiles" in response:
        return "ok (%s files)" % response["numFiles"]
    if "code" in response:
        return "ok (HTTP %s)" % response["code"]
    if "status" in response:
        return "ok (%s)" % response["status"]
    return "ok"


def main():
    data = hooklib.read_input()
    tool = data.get("tool_name") or "?"
    target = target_of(tool, data.get("tool_input") or {})
    if data.get("hook_event_name") == "PostToolUseFailure":
        error = str(data.get("error") or data.get("tool_error") or "failed").strip()
        result = "error: " + (error.splitlines() or ["failed"])[0]
        if data.get("is_interrupt"):
            result += " (interrupted)"
    else:
        result = result_of(tool, data.get("tool_response"))
    if data.get("duration_ms") is not None:
        result += " [%sms]" % data["duration_ms"]
    hooklib.log_event(data, tool, target, result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
