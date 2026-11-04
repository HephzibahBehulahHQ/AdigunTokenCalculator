# AdigunTokenCalculator

**Hephzibah Behulah · HB Artificial Intelligence**

Live application: https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/

A static, browser-side suite of 38 token, everyday, health-estimate and developer calculators. The interface is available in English, German, Yoruba and Nigerian Pidgin. The visual system uses the approved corporate logo, corporate colours and a system-font fallback pending official typography.

## Tool catalogue

| Tool | Purpose and assumptions |
|---|---|
| OpenAI-compatible token calculator | Counts plain text using locally bundled cl100k_base or o200k_base; token pieces reconstruct the original UTF-8 text. Not an API billing estimate. |
| Engineering calculator | Arithmetic, powers, square root, modulo, trigonometry in degrees, logarithms, factorial and memory controls. |
| Wordpedometer / text statistics | Word, Unicode character, non-whitespace character, sentence and paragraph counts; reading time assumes 200 wpm. |
| Celsius / Fahrenheit converter | Bidirectional conversion with absolute-zero validation. |
| Age calculator | Completed calendar years, months and days from date of birth to the browser's local current date. |
| BMI calculator | Metric and imperial input; general adult screening only, not a diagnosis. |
| Percentage calculator | Percent of, ratio as a percentage, and signed percentage change. |
| Worldometer-style estimates | One rounded population estimate interpolated from UN WPP 2024 mid-year projections. Not live data; births, deaths and CO₂ are omitted pending separately verified baselines. |
| Religion demographics | Editable categories seeded with Pew Research Center 2020 global estimates, published 2025. Other religions includes folk/traditional and smaller groups. |
| Contemplative practice time | Daily average, weekly, annual and optional lifetime projections; annual projection assumes 52 weeks. |
| Zakat / charity | User-entered assets and adjustable rate; mathematical aid only, not a religious ruling. |
| Qibla direction | Great-circle bearing to the Kaaba; optional geolocation only after an explicit button click. |
| Extended unit converter | Length, mass, US customary volume, area, speed and decimal/binary digital units. |
| Loan / mortgage | Fixed-rate monthly payment, total repayment and interest; estimate, not a lender quote. |
| Date difference / countdown | Exclusive calendar-day difference and annual event countdown. |
| GPA / grade calculator | Weighted illustrative 4.0 mapping or credit-weighted percentage average. |
| Fuel cost / trip | Metric L/100 km or miles per US/Imperial gallon with matching fuel-price units. |
| Sleep cycle planner | Configurable cycle and fall-asleep buffer; not medical advice. |

| Time zone converter | Convert local date/time between IANA zones; flags ambiguous fall-back times and rejects nonexistent spring-forward times. |
| Offline currency converter | Editable ECB reference-rate snapshot dated 4 November 2026; not a live or transaction rate. |
| Inflation / purchasing power | Compound-rate estimate using the annual rate entered by the user; not an official CPI series. |
| Tip & bill splitter | Calculate tax, tip, total and per-person amount with explicit rounding. |
| Calorie & macro estimate | Adult Mifflin–St Jeor BMR/TDEE and macro estimate; not a diet prescription. |
| Pregnancy due date estimate | LMP/conception-based date estimate; not prenatal care. |
| Water intake range | Adjustable 30–35 mL/kg planning heuristic plus user adjustment; not medical guidance. |
| Blood alcohol estimate | Simplified educational Widmark-style estimate with prominent no-driving warning; never a fitness-to-drive test. |
| Roman numeral converter | Canonical conversion for integers 1–3999. |
| Number base converter | Signed integer conversion between bases 2–36 using BigInt. |
| Password generator | Local cryptographic random generation; nothing is uploaded or stored. |
| QR code generator | Locally generated downloadable QR image; scanned content is visible to others. |
| Hash / checksum | Local SHA-256, SHA-1 and MD5 for text, selected files or dropped files (25 MB limit); MD5/SHA-1 are not security choices. |
| JSON formatter / validator | Local pretty-print, minify and syntax validation with line/column errors. |
| Color & contrast checker | HEX/RGB/HSL conversion and WCAG contrast ratio. |
| Discount & tax calculator | Discount, tax and reverse original-price estimate. |
| Recipe scaler | Scale ingredient quantities while preserving entered units and names. |
| Holiday dates | Countdown to common rule-based holidays for selected regions; not legal entitlement advice. |
| Morse code translator | Bidirectional supported International Morse mapping. |
| Statistics calculator | Mean, median, mode, range, population and sample standard deviation. |

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
npm install
npm run dev
npm test
npm run build
```

Vite writes the static production site to dist/. GitHub Actions tests and builds before deploying. The project-site base path is configured in vite.config.js.

## Tokenizer scope

- GPT-4o and GPT-4o mini labels use o200k_base.
- GPT-4 and GPT-3.5 Turbo labels use cl100k_base.

The selected encoding counts only supplied plain text. API usage may additionally include message framing, role/tool metadata, images, audio and other model-specific processing. Tokenizer ranks are bundled locally and loaded on demand. Current dependency is js-tiktoken@1.0.21 (MIT); see third-party notices.

## Data restraint and known limitations

- World population output is a linear estimate from UN WPP 2024 mid-year projections, rounded to the nearest thousand. It is not a live headcount. Births, deaths and CO₂ are not shown without verified matching baselines.
- Religion shares are historical 2020 estimates, not a statement about individual beliefs; categories and surveys have limitations.
- Official corporate logo is not yet embedded; current HB monogram is a placeholder pending confirmed asset reuse permission.
- Fluent-speaker translation review and manual browser/accessibility testing remain release tasks.
- No project-wide licence has been authorised. Do not assume the complete application is open source.
