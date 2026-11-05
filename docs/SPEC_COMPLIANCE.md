# Master prompt requirement coverage

This is an evidence checklist for [MASTER_PROMPT.md](../MASTER_PROMPT.md), including its 20-tool addendum. A tool count or passing suite alone does not establish specification completion. The current execution state and release receipt are in [PROJECT_STATUS.md](PROJECT_STATUS.md).

Audit baseline: main `1ea5f1ad3519c32e609087725087a1d2a7d226bc`, released through [PR #18](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/18). The identified implementation gaps are addressed in [PR #19](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/19). The rows below record source coverage and executable acceptance evidence. The PR's exact-candidate, main, Pages and live verification receipts establish release status; source coverage or a previous test count alone does not. Human/owner acceptance is explicitly separate below.

## Original 18 tools

| Requirement | Implementation and retained evidence | Implementation status / scope limits |
| --- | --- | --- |
| §4.1 Tokenizer: local encodings, model mapping, exact text/Unicode, count, IDs, pieces, copy/clear, error/long-input handling, scope notice | `tokenizer.js`, runtime/client/worker modules, token UI; tokenizer/client/production-browser and completion-browser tests | Implemented with public byte API, local WASM/two encoders, encoding label, worker queue/retry/cancel and 2,000-token pages. Full counts/copy preserve the input. Browser resources still bound very large requests. |
| §4.2 Engineering: signed decimals, arithmetic/powers/root/percent, memory, clear/backspace, keyboard, invalid/overflow handling | `engineering`, `arithmetic`, `memory`; calculator/browser/accessibility tests | Existing explicit operations satisfy the scope; expression parsing and precedence are not offered. Retain regression gates. |
| §4.3 Text: words, Unicode/whitespace counts, sentences, paragraphs, stated reading speed, multilingual/abbreviation handling | `stats`, text result UI, 200-wpm notice; calculator tests | Implemented: Unicode words/code points, sentence segmentation with common abbreviation handling and Unicode punctuation fallback. Sentence/reading counts remain explicitly approximate. |
| §4.4 Temperature: both directions, decimal precision, absolute zero | `temperature`; calculator/browser tests | Implemented; retain reference and invalid-value coverage. |
| §4.5 Age: completed calendar age, local reference date, leap/month ends, future rejection | `age`, shared `calendar.js`, age reference result; calendar/calculator/browser tests | Implemented, including years 0000–0099 and month/leap boundaries. |
| §4.6 BMI: metric/imperial equivalence, validation, screening notice | `bmi`, conditional unit labels; calculator/browser tests | Implemented with exact lb/in conversions. No diagnostic categories are shown. |
| §4.7 Percentage: three modes, signs, negative inputs, zero denominators | `percent`; calculator and feature/browser tests | Implemented with finite-result guards and stable signed percentage changes at numeric extremes. |
| §4.8 World estimates: dated verified baselines, local time calculation, source/method, restrained precision | `populationEstimate`, `docs/POPULATION_AUDIT.md`, archived audit JSON, calculator tests | Population is implemented. Births/deaths/CO₂ omission is explicitly permitted when separate verified baselines are unavailable; do not invent them. |
| §4.9 Demographics: sourced/editable categories, percentage status, definitions, neutrality, source vs edited indication | `demographics`, cited Pew defaults, completion copy; calculator/completion/browser tests | Implemented: exact-decimal totals, blank/invalid rejection and parser limits, explicit unchanged/edited indicator, dated source/method/category/uncertainty context and educational non-endorsement. Folk/traditional stays in the source's documented other-religions aggregate. |
| §4.10 Practice: daily/weekly/annual/lifetime arithmetic and assumptions | `practice`, weekly sessions, 52-week notice; calculator tests | Implemented; weekly entry satisfies the stated day-or-week choice. |
| §4.11 Zakat: editable assets/rate, default explanation, visible arithmetic, no eligibility/ruling | `zakat`, asset/rate fields, scholar notice, visible arithmetic; calculator/completion-browser tests | Implemented: contextual 2.5% default, each input plus sum/rate arithmetic, no eligibility/threshold/deduction rules, finite-result safeguards. |
| §4.12 Qibla: manual coordinates, optional deliberate location, purpose/privacy explanation, validation, bearing/compass | `bearing`, `compass`, guarded geolocation, pre-permission help; calculator/completion/browser tests | Implemented: purpose/local processing explained before activation, browser location-service boundary, true-north/approximation notice and trusted-local-source verification guidance. |
| §4.13 Units: all six groups, exact factors, SI/binary distinction, precision | `unit`, unit choices, small-value formatter; calculator/format/browser tests | Implemented; retain exact-pair and small-result coverage. |
| §4.14 Loan: payment/repayment/interest, formula, monthly assumptions, zero-rate handling | `loan`, formula/result copy; calculator/browser tests | Implemented. Amortization table is optional and not claimed. |
| §4.15 Dates: difference/countdown, start exclusion, past/future, leap/year boundaries | `days`, `dateDifference`, `recurringDate`, `calendar.js`; calendar/calculator/browser tests | Implemented, including early-year arithmetic and annual recurrence. |
| §4.16 GPA: documented scale, weighted/percentage modes, row calculation, validation | `GRADE_POINTS`, `gradeBreakdown`, visible mapping table and GPA results; calculator/completion/browser tests | Implemented: complete supported scale, institution-variation explanation and separate percentage mode. |
| §4.17 Fuel: metric/US/Imperial, units, zero distance, invalid efficiency, quantity/cost, exclusions | `fuelTrip`, conditional labels and notices; calculator/browser tests | Implemented; retain equivalent-unit and invalid-input coverage. |
| §4.18 Sleep: either direction, configurable cycle/buffer, rollover, limits notice | `sleep`, visible defaults; calculator/browser tests | Implemented; no medical certainty is claimed. |

## Additional 20 tools (§7.2 addendum)

| Tool and required behavior | Implementation / evidence | Implementation status / scope limits |
| --- | --- | --- |
| Time zones: IANA zones, offsets, DST gaps/overlaps, no location transmission | `convertTimeZone`, bundled Temporal, additional/result/browser tests | Implemented; retain gap rejection and overlap notice. |
| Offline currency: editable dated snapshot, disclaimer, no live API | `convertCurrency`, `parseCurrencyRates`, ECB snapshot; additional/browser tests | Implemented; snapshot date and edit notice remain explicit. |
| Inflation: selected year range, user rate, forward/reverse estimate, disclaimer | `inflationValue`; additional/browser tests | Implemented; no unsupported historical CPI series is claimed. |
| Tip: tip/tax/basis, party size, rounding modes | `splitTip`, tip/additional/browser tests | PR #18 fixed exact-cent/tie rounding; retain those gates. |
| Calories: BMR/TDEE, activity, optional macros, adult/health limits | `calorieTargets`; additional/browser tests | Implemented; retain positive-energy/domain checks. |
| Pregnancy: LMP/conception, due date, gestational age/trimester, date validation | `pregnancyEstimate`, shared calendar helper; additional/completion/browser tests | Implemented, including early-year calendar arithmetic. |
| Water: weight, activity, climate, adjustable factor, range and health notice | `waterRange`, six explicit controls/formula; additional/completion/calculator-browser tests | Implemented: editable 30–35 base range, neutral activity/climate multipliers and additive adjustment. Clinical source context is stated; user assumptions are not personal medical recommendations. |
| BAC: Widmark estimate, mandatory warning gate, policy decision, no driving claims | `bloodAlcohol`, `bac-gate.js`, documented governance audit; additional/browser tests | Implemented with acknowledgement and reset/navigation protection. |
| Roman numerals: both directions, 1–3999, invalid feedback | `toRoman`, `fromRoman`; additional/browser tests | Implemented. |
| Number bases: bases 2–36, digit validation, large integers | `convertBase` with BigInt; additional/browser tests | Implemented. |
| Passwords: local cryptographic generator and strength estimate, no persistence | `generatePassword`, lazy strength module; password/additional/accessibility tests | Implemented; first use offline belongs to the shared offline gap. |
| QR: local encoding, downloadable output, visibility notice | `qr.js`, QR UI/download; QR/browser tests | Implemented. |
| Hashes: SHA-256/SHA-1/MD5, pasted/dropped file, local/no-upload notice | hash functions and file UI; additional/browser tests | Implemented, including zero-byte files and stale-request protection. |
| JSON: validation location, pretty/minify, large-input handling, no upload | `jsonTransform`, task/client/worker modules; JSON/additional/completion/browser tests | Implemented: exact token preservation, worker execution/cancellation, 5M input and 10M conservative output bounds, localized limit/syntax feedback. |
| Colors: HEX/RGB/HSL conversion and WCAG contrast | `colors.js`, additional helpers, color UI; colors/browser tests | Implemented. |
| Discounts: forward/reverse calculation, tax, rounding explanation | discount functions, conditional UI; additional/browser tests | Implemented. |
| Recipe: serving scaling, fractions, compatible unit conversion | `scaleRecipe`; additional/browser tests | Implemented; only exact kg/g and L/mL conversions are claimed. |
| Holidays: region rules, timezone-aware day countdown, source/coverage limits | `holidayDates`, `holidayCountdowns`, IANA selector/reference date; additional/result/completion/browser tests | Implemented: selected-zone date reference, start-exclusive day count, midnight/DST coverage and explicit incomplete regional scope. |
| Morse: both directions, unsupported-character feedback | `translateMorse`; additional/browser tests | Implemented. |
| Statistics: all requested summaries, invalid/empty/singleton handling | `statistics.js`, UI; statistics/additional/completion/browser tests | Implemented: stable large means/medians/variance, no long-list argument spreading, 250k-value/5M-input limit and explicit nonrepresentable-result rejection. |

The 39th tool, Electrical Load Calculator, is an additional owner-authorized workstream beyond this master prompt. Preserve its released v2 implementation and its load/profile/storage/UI/localization tests; its final integration history is recorded in PRs #11 and #14–#16.

## Shared requirements and deliverables

| Requirement | Evidence / remaining acceptance |
| --- | --- |
| §§1–2: preserve work, governing audit, hierarchy, naming, approved assets, provenance | `AGENTS.md` pins HB-AI-ENGINEERING-001 v2.0; `DESIGN_DECISIONS.md` records four immutable reference revisions and owner decisions. No reference repository is modified. |
| §3 / addendum §7.5: searchable categorized cards, back/deep links, active state, readable panels | 39-card/11-category directory and hash router; browser/accessibility tests. |
| §5: static architecture, semantic DOM, reusable patterns, pure calculations, local dependencies | Implemented in Vite/ES modules, local workers and pure functions. Architecture documents electrical profiles, transient customer data, worker processing and asset-only offline caching. Suggested filenames are adaptable. |
| §6 / addendum §7.6: truthful privacy, safe DOM, no input transmission/logging, explicit location/persistence | Implemented and documented: safe text DOM, local processing, deliberate location, opt-in electrical profile, transient customer/export data and canonical application assets only in CacheStorage. Privacy/browser/worker tests retain exclusions. |
| §7: landmarks, labels, keyboard/focus, ARIA errors/status, reflow/zoom, contrast and reduced motion | Implemented reduced-motion rule and localized new-control/status/error checks alongside keyboard/reflow suites. Human assistive-technology/target-device/visual review remains separate. |
| §8: normal/invalid/boundary unit tests, real integration, privacy/network, project paths, production build | Existing suites and prior CI receipts; new candidate must run full browser tests with no skips and the production build. |
| §9: README, design, privacy, architecture, data/methodology, tests, licences | Reconciled current claims, contribution guidance, all affected assumptions/privacy/offline behavior and complete pinned dependency notices. Root LICENSE still requires the owner's choice. |
| §9 / §10: reviewed commits, exact revision verification, artifact-only Pages, actual live checks | Pages installs/requires Chromium and runs the full suite before building/uploading. Current candidate/main/Pages/live receipts belong in PR #21; those gates must pass before a release-complete claim. |
| §11: recoverable checkpoints, concise current status, honest bounded reports | Dedicated continuation branch; one current status, archived history and this evidence checklist. Checkpoint receipts belong in the continuation PR. |
| §12: verified completion rather than tool-count assertions | Every identified technical gap above is implemented with requirement-level evidence. Release completion additionally requires the exact CI/build/deployment/live receipts; human reviews and licence choice remain plainly identified. |
| Addendum §7.8: offline capability after initial preparation | Implemented full manifest/hash-verified asset preparation, readiness/retry, explicit update, first-use lazy tools and offline reload/deep-link tests. Cache application assets only, never inputs. Browser site-data eviction or a first-ever offline visit cannot be covered by a cache that is absent. |

## Decisions that must not be fabricated

- Project-wide licence: pending explicit owner selection; do not invent a root licence.
- Fluent German/Yoruba/Nigerian Pidgin review: human review remains pending even when key parity and automated flows pass.
- Human assistive-technology, target-device/browser-zoom, visual and sensitive-content review: do not equate automated/source checks with independent human certification. Manual/source checklists remain explicit.
- Approved system-font fallback, consolidated module structure, omitted unsourced population metrics, source-reported religion aggregation and optional amortization are documented scope decisions, not missing features to invent.
