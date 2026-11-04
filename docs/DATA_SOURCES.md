# Data sources and calculation assumptions

## World population estimate
The dashboard displays one population estimate only. It uses UN DESA Population Division, *World Population Prospects 2024*, medium variant, world population at 1 July:
- 2025: 8,231,613,070
- 2026: 8,300,678,395

The app derives an average daily net change from the difference between these mid-year values divided by 365.2425 days, then applies that rate linearly from the 1 July 2026 baseline to the current UTC instant. The display is rounded to the nearest thousand and labelled an estimate, not live data. This is simplified interpolation, not a live headcount or replacement for later UN revisions.

Primary official record: [UNdata — Total population, both sexes combined (thousands), World, Medium variant](https://data.un.org/Data.aspx?d=PopDiv&f=variableID%3A12%3BcrID%3A900%3BvarID%3A2). Methodology and downloadable datasets: [UN DESA — World Population Prospects 2024](https://population.un.org/wpp/). The 2026 value is also listed in [PopulationPyramid's 2026 world profile](https://www.populationpyramid.net/world/2026/), which attributes it to UN WPP 2024 (medium variant). The 2025 value is listed in [StatisticsTimes' world population table](https://statisticstimes.com/demographics/world-population.php), also attributed to UN WPP 2024. Recheck exact values against the official downloadable dataset before future releases.

Births, deaths and CO₂ are not displayed. A consistently dated global baseline for each was not established for this release; these metrics are omitted rather than fabricated.

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
- Loan: fixed nominal annual rate divided monthly; 12 equal payments per year.
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
