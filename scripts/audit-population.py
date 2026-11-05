#!/usr/bin/env python3
"""Verify the pinned official UN WPP2024 source using only the standard library."""

import argparse
import csv
import gzip
import hashlib
import json
import sys
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path


MANIFEST = Path(__file__).resolve().parents[1] / "docs" / "population-audit.json"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def verify_asset(path, expected):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    require(digest.hexdigest() == expected["sha256"],
            f"SHA-256 mismatch: {path.name}")
    require(path.stat().st_size == expected["bytes"],
            f"Byte length mismatch: {path.name}")


def people(value, multiplier):
    result = Decimal(value) * multiplier
    require(result.is_finite() and result == result.to_integral_value(),
            f"Population must convert to an exact integer: {value}")
    return int(result)


def verify(source_path, notes_path):
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    require(manifest["schema_version"] == 1, "Unsupported audit schema")
    require(manifest["revision"] == "WPP2024", "Unexpected UN revision")
    require(manifest["source_unit"] == "thousands"
            and manifest["people_per_source_unit"] == 1000,
            "Unexpected source units or conversion")
    for name, path in (("source", source_path), ("notes", notes_path)):
        verify_asset(path, manifest["assets"][name])

    with notes_path.open(encoding="utf-8-sig", newline="") as source:
        notes = list(csv.DictReader(source))
    for expected in manifest["indicators"]:
        matches = [row for row in notes if row["Indicator"] == expected["Indicator"]]
        require(len(matches) == 1, f"Missing or duplicate indicator: {expected['Indicator']}")
        require(matches[0] == expected and expected["Unit"] == "thousands",
                f"Indicator definition or unit mismatch: {expected['Indicator']}")

    records = manifest["records"]
    expected_by_year = {record["source_row"]["Time"]: record for record in records}
    require(len(records) == 2 and set(expected_by_year) == {"2025", "2026"},
            "Expected exactly one reference record for each year: 2025, 2026")
    matches_by_year = {year: [] for year in expected_by_year}
    with gzip.open(source_path, "rt", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        require(reader.fieldnames is not None and
                set(records[0]["source_row"]).issubset(reader.fieldnames),
                "Missing required source columns")
        for row_number, row in enumerate(reader, 1):
            year = row["Time"]
            if row["Location"] == "World" and row["Variant"] == "Medium" and year in matches_by_year:
                matches_by_year[year].append((row_number, reader.line_num, row))

    totals = {}
    reference_dates = []
    for year, expected in sorted(expected_by_year.items()):
        matches = matches_by_year[year]
        require(len(matches) == 1, f"Expected one World/Medium row for {year}; found {len(matches)}")
        row_number, line_number, row = matches[0]
        require(all(row[key] == value for key, value in manifest["selection"].items()),
                f"Location or variant identifier mismatch for {year}")
        require(row == expected["source_row"], f"Source row differs from recorded evidence for {year}")
        require(row_number == expected["csv_data_row_1based"]
                and line_number == expected["csv_line_1based"],
                f"Source row position mismatch for {year}")
        multiplier = manifest["people_per_source_unit"]
        total = people(row["TPopulation1July"], multiplier)
        male = people(row["TPopulationMale1July"], multiplier)
        female = people(row["TPopulationFemale1July"], multiplier)
        require(male + female == total, f"Male/female sum mismatch for {year}")
        require(total == expected["expected_people"], f"Unexpected population for {year}: {total}")
        require(expected["reference_date_utc"] == f"{year}-07-01T00:00:00Z",
                f"Unexpected reference date for {year}")
        reference_dates.append(datetime.fromisoformat(expected["reference_date_utc"].replace("Z", "+00:00")))
        totals[year] = total

    increase = totals["2026"] - totals["2025"]
    interval_seconds = (reference_dates[1] - reference_dates[0]).total_seconds()
    require(increase == manifest["annual_increase_people"], "Annual increase mismatch")
    require(interval_seconds == manifest["reference_interval_days"] * 86400,
            "Reference date interval mismatch")
    print("PASS: WPP2024 source and notes checksums, units, unique rows and sex sums")
    for year, total in totals.items():
        print(f"{year}-07-01 World/Medium: {total:,} people")
    print(f"Increase: {increase:,} people over {manifest['reference_interval_days']} days")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path,
                        help="Original WPP2024_Demographic_Indicators_Medium.csv.gz")
    parser.add_argument("--notes", required=True, type=Path,
                        help="Original WPP2024_Demographic_Indicators_notes.csv")
    args = parser.parse_args()
    try:
        verify(args.source, args.notes)
    except (OSError, EOFError, ValueError, KeyError, TypeError, csv.Error, InvalidOperation) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
