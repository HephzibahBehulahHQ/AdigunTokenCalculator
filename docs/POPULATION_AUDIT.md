# Population source audit

The population calculator uses **World Population Prospects 2024 (WPP2024),
World, Medium variant, population as of 1 July**. The official source was retrieved
directly from the United Nations Population Division on 5 November 2026.

| Reference date (UTC) | Source value, thousands | Exact people | CSV data row / physical line |
| --- | ---: | ---: | ---: |
| 2025-07-01 | 8231613.07 | 8,231,613,070 | 35,644 / 35,645 |
| 2026-07-01 | 8300678.396 | 8,300,678,396 | 35,645 / 35,646 |

The source field is `TPopulation1July`; the notes define its unit as **thousands**.
Multiplication by 1,000 using decimal arithmetic preserves the exact integer.
The 2026 total corrects the previous baseline of 8,300,678,395 by one person.
The increase is **69,065,326 people over the actual 365 days** between these
reference dates. Interpolation must use that interval to reproduce both annual
endpoints; using an average Gregorian year of 365.2425 days misses the earlier
endpoint. Extending the same slope outside these dates is extrapolation.
These are annual projection values, not a measured real-time count.

## Official source and integrity

Citation: United Nations, Department of Economic and Social Affairs, Population
Division (2024). *World Population Prospects 2024, Online Edition.* License:
CC BY 3.0 IGO. See the [official download catalog](https://population.un.org/wpp/assets/downloads.json).

| Asset | Retrieved (UTC) | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| [Medium CSV gzip](https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20%28Standard%29/CSV_FILES/WPP2024_Demographic_Indicators_Medium.csv.gz) | 2026-11-05T08:45:47.121628+00:00 | 16,557,272 | `286ac36bb1415e2e1ade03acfef0a29f0e4c087e2f78e38c48f50c5df89082bc` |
| [Indicator notes](https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20%28Standard%29/CSV_FILES/WPP2024_Demographic_Indicators_notes.csv) | 2026-11-05T08:45:41.309416+00:00 | 4,370 | `c6063ba18b23e899c02bb7f9c78b6e410f25b30cb9d40b66eda032e1127bea49` |

Both downloads returned HTTP 200. Their final URLs match the links above.
The data revision is **WPP2024**; HTTP `Last-Modified` values describe hosted
assets and are not revision publication dates.

[population-audit.json](population-audit.json) preserves the complete two source
rows, exact indicator definitions, identifiers, expected counts, retrieval
metadata, checksums and HTTP modification metadata. Raw downloads are kept
outside this repository; no unofficial mirror is used as verification.

## Reproduce

Download both original files from the official links above, or use retained
copies. Keep the source compressed and do not resave the notes through a
spreadsheet editor: verification uses their original bytes. From the repository
root, run with Python 3.7 or later (standard library only):

```sh
python3 scripts/audit-population.py \
  --source /path/to/WPP2024_Demographic_Indicators_Medium.csv.gz \
  --notes /path/to/WPP2024_Demographic_Indicators_notes.csv
```

The script performs no network requests and writes no files. It checks both
SHA-256 digests and byte lengths; the total, male and female July indicators and
their units; exactly one World/Medium record per target year; location ID 900
and variant ID 2; complete row equality and row positions; exact integer
conversion; male plus female totals; expected population counts; annual increase;
and the reference interval. It prints `PASS` only after every check succeeds and
returns a nonzero exit status on failure. If the UN replaces a hosted asset,
investigate the difference before changing the pinned digest or evidence.

This audit verifies the source data. Product behavior and display rounding are
covered separately by the calculator tests.
