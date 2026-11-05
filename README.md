# AdigunTokenCalculator

**Hephzibah Behulah · HB Artificial Intelligence**

Live application: https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/

A static, browser-side suite of 39 token, everyday, health-estimate and developer calculators. The interface is available in English, German, Yoruba and Nigerian Pidgin. The visual system uses the approved corporate logo, corporate colours and a system-font fallback pending official typography.

## Tool catalogue

| Tool | Category | Purpose and assumptions | Data source / formula |
|---|---|---|---|
| OpenAI-compatible token calculator | AI & Text | Plain-text token count, token IDs and reversible visual pieces; not API billing. | OpenAI tiktoken mappings; bundled js-tiktoken. |
| Engineering calculator | Math & Engineering | Arithmetic, A% of B, powers, trig, logs, factorial and memory. | Standard arithmetic; degree-based trig. |
| Wordpedometer / text statistics | AI & Text | Unicode-aware word/character/sentence/paragraph counts and reading-time estimate. | Unicode text handling; 200 wpm product heuristic. |
| Celsius / Fahrenheit | Conversion | Bidirectional temperature conversion with absolute-zero checks. | Standard Celsius/Fahrenheit formulas. |
| Age calculator | Time & Date | Calendar age from birth date to local today. | Calendar arithmetic in browser. |
| BMI calculator | Health & Body | Metric/imperial adult screening estimate. | CDC BMI formula and adult categories. |
| Percentage calculator | Math & Engineering | Percent of, ratio and percentage change. | Standard arithmetic. |
| World population estimate | World & Culture | Interpolated mid-year population estimate; not live. | UN WPP 2024 Medium; official file checksums and rows verified in [the audit](docs/POPULATION_AUDIT.md). |
| Religion demographics | World & Culture | Editable global shares and counts. | Pew Research Center 2020 estimates, published 2025. |
| Contemplative practice time | World & Culture | Daily/weekly/annual/lifetime projections. | User inputs; 52 weeks/year assumption. |
| Zakat / charity | Finance | User-entered assets and editable rate; not a ruling. | Islamic Relief 2.5% reference; no nisab ruling. |
| Qibla direction | World & Culture | Great-circle bearing to the Kaaba; location only by explicit action. | Kaaba coordinate from DAI gazetteer; great-circle formula. |
| Extended unit converter | Conversion | Length, mass, volume, area, speed and digital units. | BIPM SI and NIST SP 811 conversion factors. |
| Loan / mortgage | Finance | Fixed-rate monthly payment, repayment and interest with formula and payment count. | Standard amortization formula; user-supplied rate. |
| Date difference / countdown | Time & Date | Calendar-day difference and recurring event countdown. | Browser calendar arithmetic. |
| GPA / grade calculator | Finance | Weighted illustrative 4.0 mapping or percentage average with course calculations. | Explicit product mapping; percentage mode stays separate. |
| Fuel cost / trip | Finance | Metric, US mpg and Imperial mpg fuel/cost estimate. | NIST unit conversions; user-supplied fuel price. |
| Sleep cycle planner | Health & Body | Configurable cycle and fall-asleep buffer. | User-adjustable 90-minute heuristic; not medical advice. |
| Time zone converter | Time & Date | IANA-zone conversion with daylight-saving checks. | Temporal polyfill plus native Intl.DateTimeFormat / browser IANA time-zone database. |
| Offline currency converter | Finance | Editable dated reference-rate snapshot. | ECB euro reference rates, 4 Nov 2026; not transaction pricing. |
| Inflation / purchasing power | Finance | Compound estimate using user-entered annual rate. | User-supplied rate; not official CPI. |
| Tip & bill splitter | Finance | Tax, tip, total and per-person rounding. | Standard arithmetic. |
| Calorie & macro estimate | Health & Body | Adult BMR/TDEE and macro grams. | Mifflin–St Jeor; activity multipliers are estimates. |
| Pregnancy due date estimate | Health & Body | LMP/conception date, gestational age and trimester. | Conventional 280/266-day dating; ACOG guidance. |
| Water intake range | Health & Body | Adjustable estimated total-water range, including food water. | DGE adult reference band 30–35 mL/kg; not a drink-only target. |
| Blood alcohol estimate | Health & Body | Educational estimate with required acknowledgement and no-driving warning. | Simplified Widmark-style estimate; EU road-safety / forensic references; assumptions are not person-specific. |
| Roman numeral converter | Text & Language | Canonical Arabic/Roman conversion 1–3999. | Canonical Roman numeral rules. |
| Number base converter | Conversion | Signed BigInt conversion between bases 2–36. | JavaScript BigInt. |
| Password generator & strength checker | Security & Privacy | Generate a password or estimate strength locally; no storage or upload. | Browser crypto.getRandomValues; bundled zxcvbn 4.4.2. |
| QR code generator | Developer | Local QR image preview/download. | Bundled qrcode-generator. |
| Hash / checksum | Security & Privacy | Local SHA-256, SHA-1 and MD5 for text/files. | Web Crypto and local MD5; MD5/SHA-1 not security choices. |
| JSON formatter / validator | Developer | Local pretty-print, minify and line/column validation. | Native JSON.parse / JSON.stringify. |
| Color & contrast checker | Developer | HEX/RGB/HSL and WCAG contrast. | WCAG relative luminance and contrast ratio. |
| Discount & tax calculator | Finance | Discount, tax and reverse original-price estimate. | Standard arithmetic; currency-neutral. |
| Recipe scaler | Conversion | Scale quantities and preserve entered units/fractions. | Direct ratio scaling; no inferred unit conversion. |
| Holiday countdown | Time & Date | Common rule-based dates by region; incomplete calendar coverage. | Gregorian computus and selected official holiday references. |
| Morse code translator | Text & Language | Bidirectional International Morse mapping. | ITU-R M.1677-1. |
| Statistics calculator | Math & Engineering | Mean, median, mode, range, variance and standard deviation. | Standard descriptive statistics. |
| Electrical Load Calculator | Math & Engineering | Building/community load, real/reactive/apparent power, peak demand, load factor, cost, CO₂, 24h profile. | Typical appliance wattage/PF engineering estimates; user-editable; no live data. Presets are editable estimates, not manufacturer-specific. [Calculation assumptions](docs/ELECTRICAL_LOAD_CALCULATOR.md). |

## Privacy and architecture

Calculations run in the browser. There is no application backend, database, analytics, telemetry, remote logging or runtime calculation API/CDN. Inputs are not intentionally persisted. Geolocation is requested only after a user action; token copying is also user initiated. See [PRIVACY.md](PRIVACY.md).

Architecture and assumptions:
- [Architecture](docs/ARCHITECTURE.md)
- [Data sources and methodology](docs/DATA_SOURCES.md)
- [Sources and calculation methodology](SOURCES.md)
- [Test plan and manual checklist](docs/TEST_PLAN.md)
- [Design decisions](DESIGN_DECISIONS.md)
- [Licensing status](docs/LICENSING.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)
- [GitHub Pages configuration](docs/PAGES_CONFIGURATION.md)

## Local development

Requirements: Node.js 20+.

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite writes the static production site to dist/. GitHub Actions tests and builds before deploying. The project-site base path is configured in vite.config.js. For the full local Chromium integration test, run `npx playwright-core install chromium` once after `npm ci`; without a browser binary, the browser test is skipped locally. CI installs Chromium automatically.

## Tokenizer scope

- GPT-4o and GPT-4o mini labels use o200k_base.
- GPT-4 and GPT-3.5 Turbo labels use cl100k_base.

The selected encoding counts only supplied plain text. API usage may additionally include message framing, role/tool metadata, images, audio and other model-specific processing. Tokenizer ranks are bundled locally and loaded on demand. Current dependency is js-tiktoken@1.0.21 (MIT); see third-party notices.

## Deliberate exclusions

- AI prediction, fortune-telling, personality and relationship-scoring tools are excluded because they imply unsupported certainty.
- Medical diagnosis/treatment tools beyond labelled screening or formula estimates are excluded.
- Live stock/crypto tickers and live exchange APIs are excluded to preserve the static local-only architecture.
- User accounts, cloud profiles and persistent sensitive data are excluded.

## Data restraint and known limitations

- World population output is a linear estimate from UN WPP 2024 mid-year projections, rounded to the nearest thousand. It is not a live headcount. Births, deaths and CO₂ are not shown without verified matching baselines.
- Religion shares are historical 2020 estimates, not a statement about individual beliefs; categories and surveys have limitations.
- The approved corporate logo is embedded byte-for-byte from the canonical design-system asset; provenance is documented in docs/LICENSING.md.
- Fluent-speaker translation review and manual browser/accessibility testing remain release tasks.
- No project-wide licence has been authorised. Do not assume the complete application is open source.
