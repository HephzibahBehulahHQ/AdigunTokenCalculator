# AdigunTokenCalculator

**Hephzibah Behulah · HB Artificial Intelligence**

Live application: https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/

A static, browser-side suite of 39 token, everyday, health-estimate and developer calculators. The interface is available in English, German, Yoruba and Nigerian Pidgin. The visual system uses the approved corporate logo, corporate colours and a system-font fallback pending official typography.

## Tool catalogue

| Tool | Category | Purpose and assumptions | Data source / formula |
|---|---|---|---|
| OpenAI-compatible token calculator | AI & Text | Plain-text token count, token IDs and reversible visual pieces in a local worker; not API billing. | OpenAI encoding mappings; bundled tiktoken 1.0.22 and its public token-byte API. |
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
| Water intake range | Health & Body | Editable base range, activity/climate multipliers and additional adjustment for illustrative total fluid, including food water. | Starting 30–35 mL/kg/day from an adult clinical nutrition-support context; multipliers are user assumptions, not validated recommendations. |
| Blood alcohol estimate | Health & Body | Educational estimate with required acknowledgement and no-driving warning. | Simplified Widmark-style estimate; EU road-safety / forensic references; assumptions are not person-specific. |
| Roman numeral converter | Text & Language | Canonical Arabic/Roman conversion 1–3999. | Canonical Roman numeral rules. |
| Number base converter | Conversion | Signed BigInt conversion between bases 2–36. | JavaScript BigInt. |
| Password generator & strength checker | Security & Privacy | Generate a password or estimate strength locally; no storage or upload. | Browser crypto.getRandomValues; bundled zxcvbn 4.4.2. |
| QR code generator | Developer | Local QR image preview/download. | Bundled qrcode-generator. |
| Hash / checksum | Security & Privacy | Local SHA-256, SHA-1 and MD5 for text/files. | Web Crypto and local MD5; MD5/SHA-1 not security choices. |
| JSON formatter / validator | Developer | Local worker for pretty-print, minify and line/column validation; preserves numeric tokens and duplicate members. | Native JSON.parse validation and token-preserving formatting; explicit input/output bounds. |
| Color & contrast checker | Developer | HEX/RGB/HSL and WCAG contrast. | WCAG relative luminance and contrast ratio. |
| Discount & tax calculator | Finance | Discount, tax and reverse original-price estimate. | Standard arithmetic; currency-neutral. |
| Recipe scaler | Conversion | Scale quantities/fractions and optionally convert compatible metric units. | Direct ratio scaling; exact kg↔g and L↔mL conversions only, with no density assumptions. |
| Holiday countdown | Time & Date | Common rule-based dates by region, with calendar-day countdowns in a selected IANA time zone; incomplete calendar coverage. | Gregorian computus, selected official holiday references and browser time-zone data. |
| Morse code translator | Text & Language | Bidirectional International Morse mapping. | ITU-R M.1677-1. |
| Statistics calculator | Math & Engineering | Mean, median, mode, range, variance and standard deviation. | Standard descriptive statistics. |
| Electrical Load Calculator | Math & Engineering | Building/community real/reactive/apparent power, surge current, PF correction, time-of-use tariffs, cable sizing and voltage drop, seasonal cost/CO₂, hourly/15-min profiles, and customer bill/estimate printout with validated contact fields, tax and grand total. | Typical appliance wattage/PF/inrush engineering estimates; user-editable; no live data. Presets are editable estimates, not manufacturer-specific. [Calculation assumptions](docs/ELECTRICAL_LOAD_CALCULATOR.md). |

## Privacy and architecture

Calculations run in the browser. There is no application backend, database, analytics, telemetry, remote logging or runtime calculation API/CDN. Inputs stay in page memory by default. The Electrical Load Calculator has an explicit Save/Load/Delete option for one profile in this browser's local storage; saving includes applied device labels and settings, so use generic labels without personal details. Customer estimate details stay in memory and are excluded from saved profiles and CSV exports. Printing an estimate can include those details in the user-requested print/PDF output. Geolocation, copying and exports require user actions. See [PRIVACY.md](PRIVACY.md).

Architecture and assumptions:

- [Architecture](docs/ARCHITECTURE.md)
- [Data sources and methodology](docs/DATA_SOURCES.md)
- [Sources and calculation methodology](SOURCES.md)
- [Test plan and manual checklist](docs/TEST_PLAN.md)
- [Design decisions](DESIGN_DECISIONS.md)
- [Licensing status](docs/LICENSING.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)
- [GitHub Pages configuration](docs/PAGES_CONFIGURATION.md)

## Offline use and updates

On a production visit, the application prepares a browser cache of its published files, including tools that have not yet been opened. The footer reports readiness only after all build assets have been verified and the service worker controls the page. Wait for **All tools are ready offline** before disconnecting. Failed preparation exposes a Retry action; browsers that cannot provide the required storage/service-worker support report that offline preparation is unavailable. Development mode does not register this worker.

This cache contains application files only. It does not save calculator entries, URL/query history, generated exports or customer details. Browser site-data controls or automatic eviction can remove cached files, so offline readiness is rechecked when the page becomes visible or connectivity changes. Clearing site data also removes the separately saved electrical profile.

An update is prepared separately while current work remains open. The update control warns that reloading clears unsaved entries/results and asks you to close other calculator tabs before applying a waiting update. The app never automatically reloads an open page. See [architecture](docs/ARCHITECTURE.md) for the version and cache lifecycle, and [current status](docs/PROJECT_STATUS.md) for verification of the relevant release.

## Local development

Requirements: Node.js 20+.

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite writes the static production site to dist/. The project-site base path is configured in vite.config.js. For the full local Chromium integration tests, run `npx playwright-core install chromium` once after `npm ci`; without a browser binary, browser tests are skipped locally and must be reported as unrun. Both the verification and Pages workflows install Chromium and require its executable before running the complete test suite. Pages uploads the production artifact only after its test/build job succeeds; exact CI and deployment outcomes belong in [current status](docs/PROJECT_STATUS.md).

## Contributing

Read [AGENTS.md](AGENTS.md), [MASTER_PROMPT.md](MASTER_PROMPT.md) and the [current project status](docs/PROJECT_STATUS.md) before changing code. Work on a dedicated branch and open a scoped pull request. Preserve unrelated work, review the diff and never force-push shared history.

- Keep calculations local and use safe DOM APIs. Do not add a backend, telemetry, runtime calculation API or CDN dependency.
- Cover changed behavior with meaningful normal, invalid and boundary cases. Include relevant keyboard, privacy, responsive and EN/DE/YO/PCM interface checks; machine-reviewed translations do not replace fluent-speaker review.
- Cite the source, date, units and assumptions for non-trivial constants. Keep sourced data distinct from editable estimates. Update affected documentation and dependency notices alongside code; preserve the lockfile and pinned dependencies.
- Before requesting merge, run `npm ci`, install Chromium with `npx playwright-core install chromium`, then run `npm test` and `npm run build`. Record the exact candidate, results and any skipped or unrun checks in the pull request/current status. A passing build does not establish browser or deployment verification.
- Merge and deployment require the applicable owner authorization and successful required checks. Verify the resulting revision and published app, and record the release receipts. Repository settings, credentials and domains require their own authorization.

No project-wide licence has been selected. Public repository access does not establish permission to reuse the complete application; see [licensing status](docs/LICENSING.md).

## Tokenizer scope

- GPT-4o and GPT-4o mini labels use o200k_base.
- GPT-4 and GPT-3.5 Turbo labels use cl100k_base.

The selected encoding counts only supplied plain text. API usage may additionally include message framing, role/tool metadata, images, audio and other model-specific processing. The pinned `tiktoken@1.0.22` package supplies local encoder data and a Lite WebAssembly runtime. A dedicated worker initializes the selected encoding and reconstructs visual pieces through the public `decode_single_token_bytes` API and a streaming UTF-8 decoder. Concatenated pieces must equal the input. Offline preparation downloads the worker, runtime and both encoders in advance; calculator execution remains on demand. Dependency licensing is recorded in the [third-party notices](THIRD_PARTY_NOTICES.md).

The visual preview shows 2,000 tokens per page; the reported count and copy controls use the complete result. Tokenization has no fixed text-length cutoff in the current implementation, so available browser memory and processing time still limit very large inputs. JSON accepts up to 5,000,000 UTF-16 code units and a formatted output of up to 10,000,000; deeply nested pretty-print expansion can be rejected before formatting. Statistics accepts up to 250,000 finite values within 5,000,000 UTF-16 code units and rejects results outside its supported numeric range.

## Deliberate exclusions

- AI prediction, fortune-telling, personality and relationship-scoring tools are excluded because they imply unsupported certainty.
- Medical diagnosis/treatment tools beyond labelled screening or formula estimates are excluded.
- Live stock/crypto tickers and live exchange APIs are excluded to preserve the static local-only architecture.
- User accounts, cloud profiles and persistent sensitive data are excluded.

## Data restraint and known limitations

- World population output is a linear estimate from UN WPP 2024 mid-year projections, rounded to the nearest thousand. It is not a live headcount. Births, deaths and CO₂ are not shown without verified matching baselines.
- Religion shares are historical 2020 estimates, not a statement about individual beliefs; categories and surveys have limitations.
- The approved corporate logo is embedded byte-for-byte from the canonical design-system asset; provenance is documented in docs/LICENSING.md.
- Human assistive-technology/accessibility review and fluent-speaker translation review remain acceptance tasks; automated checks do not replace them.
- No project-wide licence has been authorised. Do not assume the complete application is open source.
