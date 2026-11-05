# Data sources and calculation assumptions

## World population estimate
The dashboard displays one population estimate using UN DESA Population Division, *World Population Prospects 2024*, World / Medium variant, population at 1 July:

- 2025: **8,231,613,070** people.
- 2026: **8,300,678,396** people.

The exact increase of 69,065,326 people is divided by the actual **365-day** interval between these UTC dates. The app applies this daily slope from 1 July 2026 to the current UTC instant. Dates within the reference interval are interpolated; dates outside it are extrapolated. Output is rounded to the nearest thousand and labelled an estimate, not live data.

The values were verified directly against the official UN WPP2024 Medium CSV on 5 November 2026, including the source's thousands-to-people conversion. [The source audit](POPULATION_AUDIT.md) records original URLs, SHA-256 checksums, exact rows and a reproducible standard-library verification script. Births, deaths and CO₂ remain withheld because separately verified baselines are not bundled.

## Religion demographics
Starting shares are Pew Research Center estimates for 2020, published 9 June 2025:
- Christianity 28.8%; Islam 25.6%; Hinduism 14.9%; Buddhism 4.1%; Judaism 0.2%; other religions 2.2%; religiously unaffiliated 24.2%.

These add to 100%. Pew's "other religions" category includes Baha'is, Daoists, Jains, Shintoists, Sikhs, Wiccans, Zoroastrians and small groups, including some folk/traditional religions. Folk religions are not a separately measured percentage in this seven-category summary. The analysis draws on more than 2,700 censuses, surveys and population registers; definitions and measurement vary by country. The calculator labels values as editable 2020 estimates and does not silently normalise edits.

Source: [Pew Research Center, The World's Religious Groups: How Their Sizes Changed from 2010 to 2020 (9 June 2025)](https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/).

## Other assumptions
- Text reading time: 200 words/minute; sentence count is punctuation-based. Both are estimates.
- BMI: kg/m²; imperial formula uses 703 × lb / in². General adult screening only, not diagnosis.
- Practice: annual projection assumes 52 weeks; daily minutes are weekly total divided by seven.
- Zakat: entered assets and user-selected rate only; no threshold, liabilities or ruling inferred.
- Qibla: great-circle bearing to 21.4225° N, 39.8262° E; compass is a 16-point approximation.
- Loan: fixed nominal annual rate divided monthly; 12 end-of-month payments per year, no fees or extra payments. With principal P, monthly decimal rate r = annual percentage / 1200 and n = years × 12, M = P × r / (1 − (1 + r)^(-n)). For r = 0, M = P / n. The implementation uses log1p/expm1 for the equivalent denominator to avoid cancellation near zero; repayment and interest are rounded only for display.
- Engineering percentage: A is the first input (percentage), B is the second (base); A% of B = A × B / 100. Signed and decimal inputs are allowed.
- Date difference: elapsed calendar days exclude the start date. Annual events use next occurrence; 29 February maps to 28 February in non-leap years.
- GPA: 4.0 grade mapping is illustrative; institutions vary. Percentage mode is a weighted percentage average, not a GPA.
- Fuel: metric uses L/100 km and price/litre; imperial uses miles per US or Imperial gallon and price per matching gallon.
- Sleep: cycle and fall-asleep buffer are user-adjustable planning assumptions, not medical advice.
- Digital units: kB/MB/GB are decimal SI; KiB/MiB/GiB are binary.


## Additional tool sources and assumptions

The expanded calculator suite's full source register is maintained in the root [SOURCES.md](../SOURCES.md). Key date-sensitive and consequential references are:
- ECB euro reference rates dated 4 November 2026; editable, offline, and explicitly not transaction prices.
- Mifflin–St Jeor (1990) for the adult resting-energy estimate; activity and macro ratios are approximate.
- ACOG due-date guidance; LMP dating is conventional and ultrasound is more accurate for confirming gestational age.
- NIST forensic toxicology guidance for Widmark-style alcohol calculations; the app's simplified output is educational only and must never guide driving.
- WCAG 2.2 contrast criteria, ITU-R M.1677-1 Morse code, and Web Crypto digest API documentation.
- IANA time-zone database through the browser's native Intl implementation; the app does not fetch time-zone services.

The water range is explicitly a project-selected editable heuristic (30–35 mL/kg plus user-entered adjustment), not an official health recommendation. Inflation uses a user-supplied annual rate rather than an unverified CPI series. Holiday outputs are rule-based calendar dates, not legal confirmation of public-holiday status.


The official UNData World / Medium record is linked in [SOURCES.md](../SOURCES.md). Exact 2025/2026 numeric rows still require a direct downloadable WPP file comparison and recorded checksum; the values have not been certified against an archived source file.


The README now contains the full 38-tool catalogue with category, purpose and source/formula columns, plus the deliberate exclusions in MASTER_PROMPT.md §7.3. Formula references for BMI, Qibla, units/fuel, Zakat, water and regional holidays are recorded in root SOURCES.md.

## Tip and bill splitting

Tax is applied to the entered subtotal. The tip uses either that subtotal or the subtotal plus unrounded tax, according to the selected basis. Decimal values are taken from the validated JavaScript Number's decimal spelling and calculated as integer ratios; tax and tip are not rounded before splitting. Only the final per-person share is rounded to cents. Nearest-cent ties round up; up/down selects the next/previous cent only when a real remainder exists. Exact cents stay unchanged. For example, 1.10 rounded up remains 1.10, and 0.29 divided between two people rounds to 0.15 each in nearest mode.

The displayed tax, tip and total use the existing two-decimal formatting. Multiplying a rounded share by the party size can differ from the unrounded bill total. Inputs remain subject to JavaScript Number precision; nonfinite outputs or rounded shares whose exact cent value cannot survive conversion to a Number are rejected. This is arithmetic on user-entered amounts, not a currency-specific tax or payment rule.

## Unit result display

Unit conversions retain the full JavaScript number until display. Results normally use up to eight fractional digits; nonzero results below that rounding threshold use localized scientific notation with eight significant digits, so 1 byte → GB is shown as 1E-9 GB instead of zero. Input/output values outside the finite number range are rejected.

## Grade, age and recipe details

GPA shows each grade value × credits, total weighted points, total credits and the resulting quotient. Percentage mode uses scores from 0–100 with the same weighting. The 4.0 letter mapping remains illustrative. Age calculations capture one browser-local calendar date and display that same date as the reference. Recipe conversion is opt-in and limited to exact metric mass pairs (kg↔g) and volume pairs (L↔mL); unknown units and ingredient text remain intact. No density or cup-size assumptions are inferred. Zero/tiny quantities are preserved, and out-of-range scaling is rejected.
