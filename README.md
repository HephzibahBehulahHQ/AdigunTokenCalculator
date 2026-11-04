# AdigunTokenCalculator

**Hephzibah Behulah · HB Artificial Intelligence**

Live application: https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/

A static, browser-side suite of 18 token and everyday calculators. The interface is available in English, German, Yoruba and Nigerian Pidgin. The visual system uses approved corporate colours with a system-font fallback pending official typography.

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

## Privacy and architecture

Calculations run in the browser. There is no application backend, database, analytics, telemetry, remote logging or runtime calculation API/CDN. Inputs are not intentionally persisted. Geolocation is requested only after a user action; token copying is also user initiated. See [PRIVACY.md](PRIVACY.md).

Architecture and assumptions:
- [Architecture](docs/ARCHITECTURE.md)
- [Data sources and methodology](docs/DATA_SOURCES.md)
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
