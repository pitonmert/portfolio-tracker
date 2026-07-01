from __future__ import annotations

import json
import math
from collections.abc import Mapping
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Callable

import borsapy as bp


ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "outputs"
SUMMARY_PATH = OUTPUT_DIR / "latest-summary.json"
RESULTS_PATH = ROOT / "RESULTS.md"
SAMPLE_SIZE = 3


def sanitize(value: Any) -> Any:
    if value is None:
        return None

    if isinstance(value, float):
        return None if math.isnan(value) else value

    try:
        import pandas as pd

        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass
    except Exception:
        pass

    if isinstance(value, Mapping):
        return {str(key): sanitize(item) for key, item in value.items()}

    if isinstance(value, list | tuple | set):
        return [sanitize(item) for item in value]

    if hasattr(value, "item"):
        try:
            return sanitize(value.item())
        except Exception:
            pass

    if isinstance(value, str | int | bool):
        return value

    return str(value)


def dataframe_summary(name: str, loader: Callable[[], Any]) -> dict[str, Any]:
    try:
        frame = loader()
        columns = [str(column) for column in getattr(frame, "columns", [])]
        shape = getattr(frame, "shape", None)
        records = frame.head(SAMPLE_SIZE).to_dict(orient="records")

        return {
            "name": name,
            "status": "ok",
            "kind": "dataframe",
            "rowCount": int(shape[0]) if shape else None,
            "columnCount": int(shape[1]) if shape else len(columns),
            "columns": columns,
            "sample": sanitize(records),
        }
    except Exception as exc:
        return error_summary(name, exc)


def object_summary(name: str, loader: Callable[[], Any]) -> dict[str, Any]:
    try:
        value = loader()
        extracted = extract_object(value)

        return {
            "name": name,
            "status": "ok",
            "kind": extracted["kind"],
            "type": type(value).__name__,
            "rowCount": extracted.get("rowCount"),
            "keys": extracted.get("keys", []),
            "sample": sanitize(extracted.get("sample")),
            "repr": str(value)[:1200],
        }
    except Exception as exc:
        return error_summary(name, exc)


def extract_object(value: Any) -> dict[str, Any]:
    if isinstance(value, Mapping):
        return {
            "kind": "mapping",
            "keys": [str(key) for key in value.keys()],
            "sample": dict(list(value.items())[:25]),
        }

    if isinstance(value, list):
        keys = sorted(
            {
                str(key)
                for item in value[:20]
                if isinstance(item, Mapping)
                for key in item.keys()
            }
        )
        return {
            "kind": "list",
            "rowCount": len(value),
            "keys": keys,
            "sample": value[:SAMPLE_SIZE],
        }

    items_method = getattr(value, "items", None)
    if callable(items_method):
        try:
            items = list(items_method())
            return {
                "kind": "mapping-like",
                "keys": [str(key) for key, _ in items],
                "sample": dict(items[:25]),
            }
        except Exception:
            pass

    keys_method = getattr(value, "keys", None)
    if callable(keys_method):
        try:
            keys = list(keys_method())
            sample = {key: value[key] for key in keys[:25]}
            return {
                "kind": "mapping-like",
                "keys": [str(key) for key in keys],
                "sample": sample,
            }
        except Exception:
            pass

    if hasattr(value, "_asdict"):
        try:
            data = value._asdict()
            return {
                "kind": "namedtuple",
                "keys": [str(key) for key in data.keys()],
                "sample": data,
            }
        except Exception:
            pass

    public_values: dict[str, Any] = {}
    for key in dir(value):
        if key.startswith("_"):
            continue
        try:
            item = getattr(value, key)
        except Exception:
            continue
        if callable(item):
            continue
        if isinstance(item, str | int | float | bool) or item is None:
            public_values[key] = item

    return {
        "kind": "object",
        "keys": sorted(public_values.keys()),
        "sample": public_values,
    }


def error_summary(name: str, exc: Exception) -> dict[str, Any]:
    return {
        "name": name,
        "status": "error",
        "kind": "error",
        "errorType": type(exc).__name__,
        "error": str(exc),
    }


def build_report(summary: dict[str, Any]) -> str:
    lines = [
        "# borsapy Asset Data Probe Results",
        "",
        f"- Generated at: `{summary['generatedAt']}`",
        f"- borsapy version: `{summary['borsapyVersion']}`",
        "- Reference: `market-data-service/user-guide.md`",
        "",
        "## Overview",
        "",
        "| Probe | Status | Shape / Count | Columns / Keys |",
        "|---|---:|---:|---|",
    ]

    for probe in summary["probes"]:
        columns_or_keys = probe.get("columns") or probe.get("keys") or []
        shape = format_shape(probe)
        lines.append(
            f"| `{probe['name']}` | {probe['status']} | {shape} | "
            f"{', '.join(f'`{column}`' for column in columns_or_keys)} |"
        )

    lines.extend(["", "## Details", ""])

    for probe in summary["probes"]:
        lines.extend([f"### {probe['name']}", "", f"- Status: `{probe['status']}`"])

        if probe["status"] == "error":
            lines.extend(
                [
                    f"- Error type: `{probe['errorType']}`",
                    f"- Error: {probe['error']}",
                    "",
                ]
            )
            continue

        lines.extend(
            [
                f"- Kind: `{probe['kind']}`",
                f"- Type: `{probe.get('type', probe['kind'])}`",
                f"- Shape / Count: {format_shape(probe)}",
            ]
        )

        columns = probe.get("columns")
        keys = probe.get("keys")
        if columns:
            lines.append(f"- Columns: {', '.join(f'`{column}`' for column in columns)}")
        if keys:
            lines.append(f"- Keys: {', '.join(f'`{key}`' for key in keys)}")

        lines.extend(["", "Sample:", "", "```json"])
        lines.append(json.dumps(probe.get("sample"), ensure_ascii=False, indent=2))
        lines.extend(["```", ""])

    errors = [probe for probe in summary["probes"] if probe["status"] == "error"]
    lines.extend(["## Errors", ""])
    if not errors:
        lines.append("- No errors.")
    else:
        for error in errors:
            lines.append(
                f"- `{error['name']}`: `{error['errorType']}` - {error['error']}"
            )

    lines.append("")
    return "\n".join(lines)


def format_shape(probe: dict[str, Any]) -> str:
    if probe["status"] == "error":
        return "-"

    if probe.get("rowCount") is not None and probe.get("columnCount") is not None:
        return f"{probe['rowCount']} x {probe['columnCount']}"

    if probe.get("rowCount") is not None:
        return str(probe["rowCount"])

    return "-"


def main() -> None:
    probes = [
        dataframe_summary("companies", bp.companies),
        dataframe_summary(
            "search_companies_banka", lambda: bp.search_companies("banka")
        ),
        dataframe_summary("screen_stocks_default", bp.screen_stocks),
        object_summary(
            "search_funds_banka_limit_10",
            lambda: bp.search_funds("banka", limit=10),
        ),
        dataframe_summary(
            "screen_funds_YAT_limit_5000",
            lambda: bp.screen_funds(fund_type="YAT", limit=5000),
        ),
        dataframe_summary(
            "screen_funds_EMK_limit_5000",
            lambda: bp.screen_funds(fund_type="EMK", limit=5000),
        ),
        object_summary("ticker_THYAO_fast_info", lambda: bp.Ticker("THYAO").fast_info),
        object_summary("ticker_THYAO_info", lambda: bp.Ticker("THYAO").info),
        object_summary("fund_KPA_info", lambda: bp.Fund("KPA").info),
        object_summary("fund_AAK_info_error_example", lambda: bp.Fund("AAK").info),
    ]

    summary = {
        "generatedAt": datetime.now(UTC).isoformat(),
        "borsapyVersion": getattr(bp, "__version__", "unknown"),
        "probes": probes,
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    SUMMARY_PATH.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    RESULTS_PATH.write_text(build_report(summary), encoding="utf-8")

    print(f"Wrote {RESULTS_PATH.relative_to(ROOT)}")
    print(f"Wrote {SUMMARY_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
