#!/usr/bin/env python3
"""
Translate Chinese text in vendor Veepoo SDK markdown snapshots to English.

Uses Google Translate (unofficial web API) via deep-translator. Requires:
  pip install deep-translator

Preserves ``` fenced code blocks as segments; translates each segment that contains CJK.
Chunks are kept under the library max payload size (4990 chars).
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from pathlib import Path

try:
    from deep_translator import GoogleTranslator
    from deep_translator.exceptions import TooManyRequests, TranslationNotFound
except ImportError:
    print("Install dependencies: pip install deep-translator", file=sys.stderr)
    sys.exit(1)

CJK = re.compile(r"[\u4e00-\u9fff]")
MAX_CHUNK = 4990  # deep_translator validates len(text) < 5000
CODE_FENCE = re.compile(r"(```[\s\S]*?```)")


def chunk_at_newlines(text: str, max_chars: int = MAX_CHUNK) -> list[str]:
    if len(text) <= max_chars:
        return [text]
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        if end < len(text):
            nl = text.rfind("\n", start, end)
            if nl > start:
                end = nl + 1
        chunks.append(text[start:end])
        start = end
    return chunks


def translate_text(
    text: str,
    translator: GoogleTranslator,
    delay: float,
    label: str,
) -> str:
    if not CJK.search(text):
        return text
    chunks = chunk_at_newlines(text)
    out: list[str] = []
    for i, ch in enumerate(chunks):
        print(f"    {label} chunk {i + 1}/{len(chunks)} ({len(ch)} chars)", flush=True)
        done = False
        for attempt in range(15):
            try:
                out.append(translator.translate(ch))
                done = True
                time.sleep(delay)
                break
            except TooManyRequests:
                wait = min(120.0, 6.0 * (2**attempt))
                print(f"      rate limited, sleeping {wait:.0f}s", flush=True)
                time.sleep(wait)
            except TranslationNotFound:
                print("      translation not found, keeping chunk", flush=True)
                out.append(ch)
                done = True
                break
            except Exception as e:
                print(f"      error {e!r}, attempt {attempt + 1}", flush=True)
                time.sleep(min(90.0, 3.0 * (attempt + 1)))
        if not done:
            print("      keeping original chunk after failures", flush=True)
            out.append(ch)
    return "".join(out)


def translate_file(path: Path, translator: GoogleTranslator, delay: float) -> str:
    raw = path.read_text(encoding="utf-8")
    parts = CODE_FENCE.split(raw)
    out: list[str] = []
    for idx, part in enumerate(parts):
        kind = "code" if part.startswith("```") else "md"
        print(f"  segment {idx + 1}/{len(parts)} ({kind}, {len(part)} chars)", flush=True)
        out.append(translate_text(part, translator, delay, kind))
    return "".join(out)


def repair_markdown_glue(text: str) -> str:
    """
    Google Translate strips newlines inside segments; restore common markdown patterns.
    Does not fix rare vendor structural bugs (review git diff after regeneration).
    """
    t = text.replace("###API", "### API")
    t = re.sub(r"([^\n])(```)", r"\1\n\n\2", t)
    t = re.sub(r"```(#{1,6}\s)", r"```\n\n\1", t)
    t = re.sub(r"```(#{1,6})([A-Za-z])", r"```\n\n\1 \2", t)
    t = t.replace("```|", "```\n\n|")
    t = re.sub(r"```(\*\*)", r"```\n\n\1", t)
    t = re.sub(r"```(Note:)", r"```\n\n\1", t)
    return t


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("paths", nargs="+", type=Path, help="Markdown files to translate in place")
    ap.add_argument(
        "--delay",
        type=float,
        default=0.14,
        help="Seconds to sleep after each successful chunk (reduce if you hit rate limits)",
    )
    ap.add_argument(
        "--dry-run",
        action="store_true",
        help="Print segment stats only",
    )
    ap.add_argument(
        "--repair-only",
        action="store_true",
        help="Skip translation; only apply repair_markdown_glue (for fixing formatting)",
    )
    ap.add_argument(
        "--no-repair",
        action="store_true",
        help="Do not run repair_markdown_glue after translation",
    )
    args = ap.parse_args()
    translator = GoogleTranslator(source="zh-CN", target="en")

    for path in args.paths:
        path = path.resolve()
        raw = path.read_text(encoding="utf-8")
        parts = CODE_FENCE.split(raw)
        if args.dry_run:
            cjk_parts = [p for p in parts if CJK.search(p)]
            cjk_chars = sum(len(p) for p in cjk_parts)
            print(
                f"{path.name}: segments={len(parts)}, with_CJK={len(cjk_parts)}, cjk_chars≈{cjk_chars}",
                flush=True,
            )
            continue

        if args.repair_only:
            print(f"Repairing {path} …", flush=True)
            path.write_text(repair_markdown_glue(raw), encoding="utf-8")
            print(f"Wrote {path}", flush=True)
            continue

        print(f"Translating {path} …", flush=True)
        text = translate_file(path, translator, args.delay)
        if not args.no_repair:
            text = repair_markdown_glue(text)
        path.write_text(text, encoding="utf-8")
        print(f"Wrote {path}", flush=True)


if __name__ == "__main__":
    main()
