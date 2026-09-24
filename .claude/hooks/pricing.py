"""Token usage and API-equivalent cost of a Claude Code session, from its transcript.

Prices are USD per million tokens from https://platform.claude.com/docs/en/about-claude/pricing
(checked 2026-09-24). Cache writes bill at 1.25x the input price (5-minute TTL) or 2x
(1-hour TTL); cache reads at a per-model fraction of the input price. It's an estimate:
tokens Claude Code spends outside the transcript (e.g. WebFetch summaries) aren't counted.
"""
import glob
import json
import os
import re
import time

# model -> (input, output, cache-read multiplier)
PRICES = {
    "claude-fable-5-1": (10.0, 50.0, 0.025),
    "claude-mythos-5-1": (10.0, 50.0, 0.025),
    "claude-fable-5": (10.0, 50.0, 0.10),
    "claude-mythos-5": (10.0, 50.0, 0.10),
    "claude-opus-5-5": (4.0, 20.0, 0.05),
    "claude-opus-5": (5.0, 25.0, 0.10),
    "claude-opus-4-8": (5.0, 25.0, 0.10),
    "claude-opus-4-7": (5.0, 25.0, 0.10),
    "claude-opus-4-6": (5.0, 25.0, 0.10),
    "claude-opus-4-5": (5.0, 25.0, 0.10),
    "claude-opus-4-1": (15.0, 75.0, 0.10),
    "claude-opus-4": (15.0, 75.0, 0.10),
    "claude-sonnet-5": (2.0, 10.0, 0.10),
    "claude-sonnet-4-6": (3.0, 15.0, 0.10),
    "claude-sonnet-4-5": (3.0, 15.0, 0.10),
    "claude-sonnet-4": (3.0, 15.0, 0.10),
    "claude-3-7-sonnet": (3.0, 15.0, 0.10),
    "claude-haiku-4-5": (1.0, 5.0, 0.10),
    "claude-3-5-haiku": (0.8, 4.0, 0.10),
}
FAST_PRICES = {  # speed: "fast" (input, output)
    "claude-opus-5-5": (8.0, 40.0),
    "claude-opus-5": (10.0, 50.0),
    "claude-opus-4-8": (10.0, 50.0),
}
FAMILY_FALLBACK = [("fable", "claude-fable-5"), ("mythos", "claude-mythos-5"),
                   ("opus", "claude-opus-5"), ("sonnet", "claude-sonnet-4-6"),
                   ("haiku", "claude-haiku-4-5")]
WEB_SEARCH_USD = 10.0 / 1000
CACHE_WRITE_5M, CACHE_WRITE_1H = 1.25, 2.0
US_ONLY_MULTIPLIER = 1.1  # inference_geo "us" (Claude 4.6+)


def alert_threshold():
    try:
        return float(os.environ.get("CLAUDE_COST_ALERT_USD", "5"))
    except ValueError:
        return 5.0


def normalize_model(model):
    m = re.sub(r"\[.*?\]", "", str(model or "").lower())
    if "claude-" in m:
        m = m[m.index("claude-"):]
    m = re.split(r"[@:]", m)[0]
    m = re.sub(r"-v\d+$", "", m)
    return re.sub(r"-\d{8}$", "", m)


def price_for(model):
    """(key, (input, output, read_multiplier), exact?)."""
    m = normalize_model(model)
    for key in sorted(PRICES, key=len, reverse=True):
        if m == key or m.startswith(key + "-"):
            return key, PRICES[key], True
    for word, key in FAMILY_FALLBACK:
        if word in m:
            return key, PRICES[key], False
    return "claude-opus-5", PRICES["claude-opus-5"], False


class Tally(object):
    def __init__(self):
        self.cost = 0.0
        self.input = self.output = self.cache_write = self.cache_read = self.web_searches = 0
        self.models, self.unpriced = set(), set()

    @property
    def tokens(self):
        return self.input + self.output + self.cache_write + self.cache_read

    def add(self, model, usage):
        key, (in_price, out_price, read_mult), exact = price_for(model)
        if usage.get("speed") == "fast" and key in FAST_PRICES:
            in_price, out_price = FAST_PRICES[key]
        n = lambda k: int(usage.get(k) or 0)  # noqa: E731
        inp, out, read, write = n("input_tokens"), n("output_tokens"), \
            n("cache_read_input_tokens"), n("cache_creation_input_tokens")
        split = usage.get("cache_creation") or {}
        write_1h = int(split.get("ephemeral_1h_input_tokens") or 0)
        write_5m = max(write - write_1h, 0)  # untyped cache writes are 5-minute writes
        cost = (inp * in_price + out * out_price + read * in_price * read_mult
                + write_5m * in_price * CACHE_WRITE_5M + write_1h * in_price * CACHE_WRITE_1H) / 1e6
        if usage.get("inference_geo") == "us":
            cost *= US_ONLY_MULTIPLIER
        searches = int((usage.get("server_tool_use") or {}).get("web_search_requests") or 0)
        self.cost += cost + searches * WEB_SEARCH_USD
        self.input += inp
        self.output += out
        self.cache_read += read
        self.cache_write += write
        self.web_searches += searches
        self.models.add(key.replace("claude-", ""))
        if not exact:
            self.unpriced.add(str(model))


def read_jsonl(path):
    rows = []
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    try:
                        rows.append(json.loads(line))
                    except ValueError:
                        pass
    except OSError:
        pass
    return rows


def text_of(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(b.get("text", "") for b in content
                         if isinstance(b, dict) and b.get("type") == "text")
    return ""


def is_prompt(row):
    """A genuine user prompt (not a tool result or injected meta message)."""
    if row.get("type") != "user" or row.get("isMeta"):
        return False
    content = (row.get("message") or {}).get("content")
    if isinstance(content, list):
        kinds = {b.get("type") for b in content if isinstance(b, dict)}
        return "text" in kinds and "tool_result" not in kinds
    return isinstance(content, str) and bool(content.strip())


def clean_prompt(text):
    text = re.sub(r"<(system-reminder|local-command-[a-z]+|command-[a-z]+)>.*?</\1>", " ", text, flags=re.S)
    return re.sub(r"\s+", " ", text).strip()


def session_usage(data, wait_for_final=True):
    """Totals for the whole session and for the current turn (main + subagent transcripts)."""
    path = os.path.expanduser(str(data.get("transcript_path") or ""))
    rows = read_jsonl(path)
    final = str(data.get("last_assistant_message") or "").strip()[:80]
    if wait_for_final and final:
        # The transcript is written asynchronously; give the final message a moment to land.
        for _ in range(5):
            last_texts = [text_of((r.get("message") or {}).get("content"))
                          for r in rows[-40:] if r.get("type") == "assistant"]
            if any(final in t for t in last_texts):
                break
            time.sleep(0.4)
            rows = read_jsonl(path)

    prompt_row = None
    if data.get("prompt_id"):
        prompt_row = next((r for r in rows if r.get("type") == "user"
                           and r.get("promptId") == data["prompt_id"] and is_prompt(r)), None)
    if prompt_row is None:
        prompt_row = next((r for r in reversed(rows) if is_prompt(r)), None)
    turn_start = (prompt_row or {}).get("timestamp") or ""

    stem = os.path.splitext(path)[0]
    for sub in sorted(glob.glob(os.path.join(stem, "subagents", "**", "*.jsonl"), recursive=True)):
        rows.extend(read_jsonl(sub))

    session, turn, seen = Tally(), Tally(), set()
    for row in rows:
        message = row.get("message") or {}
        usage = message.get("usage")
        if row.get("type") != "assistant" or not isinstance(usage, dict) or message.get("model") == "<synthetic>":
            continue
        key = (message.get("id"), row.get("requestId")) if message.get("id") else row.get("uuid")
        if key in seen:
            continue  # one API response is split across several transcript lines
        seen.add(key)
        session.add(message.get("model"), usage)
        if turn_start and str(row.get("timestamp") or "") >= turn_start:
            turn.add(message.get("model"), usage)
    prompt = clean_prompt(text_of((prompt_row or {}).get("message", {}).get("content"))) if prompt_row else ""
    return {"session": session, "turn": turn, "prompt": prompt}


def fmt_tokens(n):
    for size, unit in ((1e9, "B"), (1e6, "M"), (1e3, "K")):
        if n >= size:
            return ("%.2f" % (n / size)).rstrip("0").rstrip(".") + unit
    return str(int(n))


def fmt_usd(x):
    return "<$0.01" if 0 < x < 0.005 else "$%.2f" % x
