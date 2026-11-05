# Master prompt requirement coverage

This is an evidence checklist for [MASTER_PROMPT.md](../MASTER_PROMPT.md), including its 20-tool addendum. A tool count or passing suite alone does not establish specification completion. The current execution state and release receipt are in [PROJECT_STATUS.md](PROJECT_STATUS.md).

Audit baseline: main `1ea5f1ad3519c32e609087725087a1d2a7d226bc`, released through [PR #18](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/18). That release passed 242 tests, including Chromium. The rows below distinguish existing behavior from gaps found by reading the requirements, source and tests. New changes are not verified until the continuation's candidate checks pass.

## Original 18 tools

| Requirement | Implementation and retained evidence | Audit finding / acceptance still required |
| --- | --- | --- |
| §4.1 Tokenizer: local encodings, model mapping, exact text/Unicode, count, IDs, pieces, copy/clear, error/long-input handling, scope notice | `src/tokenizer.js`, token flows in `src/main.js`, `tests/tokenizer.test.js`, `tests/browser.test.js` | Open: replace protected byte-map access with supported API; expose encoding name; establish responsive long-input handling. |
| §4.2 Engineering: signed decimals, arithmetic/powers/root/percent, memory, clear/backspace, keyboard, invalid/overflow handling | `engineering`, `arithmetic`, `memory`; calculator/browser/accessibility tests | Existing explicit operations satisfy the scope; expression parsing and precedence are not offered. Retain regression gates. |
| §4.3 Text: words, Unicode/whitespace counts, sentences, paragraphs, stated reading speed, multilingual/abbreviation handling | `stats`, text result UI, 200-wpm notice; calculator tests | Open: improve explicit non-Latin sentence terminators and abbreviation handling while retaining estimate wording. |
| §4.4 Temperature: both directions, decimal precision, absolute zero | `temperature`; calculator/browser tests | Implemented; retain reference and invalid-value coverage. |
| §4.5 Age: completed calendar age, local reference date, leap/month ends, future rejection | `age`, age reference result; calculator/browser tests | Open: correct shared early-year date arithmetic. |
| §4.6 BMI: metric/imperial equivalence, validation, screening notice | `bmi`, conditional unit labels; calculator/browser tests | Open: use exact lb/in conversions rather than approximate 703 multiplier. No categories or diagnoses are shown. |
| §4.7 Percentage: three modes, signs, negative inputs, zero denominators | `percent`; calculator and feature/browser tests | Open: avoid intermediate overflow for finite signed percentage changes. |
| §4.8 World estimates: dated verified baselines, local time calculation, source/method, restrained precision | `populationEstimate`, `docs/POPULATION_AUDIT.md`, archived audit JSON, calculator tests | Population is implemented. Births/deaths/CO₂ omission is explicitly permitted when separate verified baselines are unavailable; do not invent them. |
| §4.9 Demographics: sourced/editable categories, percentage status, definitions, neutrality, source vs edited indication | `demographics`, cited Pew defaults; calculator/browser tests | Open: exact default total, blank-share rejection, source/custom distinction and contradictory notice. Folk/traditional categories remain in the source's documented other-religions aggregate. |
| §4.10 Practice: daily/weekly/annual/lifetime arithmetic and assumptions | `practice`, weekly sessions, 52-week notice; calculator tests | Implemented; weekly entry satisfies the stated day-or-week choice. |
| §4.11 Zakat: editable assets/rate, default explanation, visible arithmetic, no eligibility/ruling | `zakat`, asset fields, scholar notice; calculator tests | Open: explain the 2.5% default and show the inputs/addition/rate calculation. |
| §4.12 Qibla: manual coordinates, optional deliberate location, purpose/privacy explanation, validation, bearing/compass | `qibla`, `compass`, guarded geolocation; calculator/browser tests | Open: explain purpose and local use before requesting location; repair manual-only result wording. |
| §4.13 Units: all six groups, exact factors, SI/binary distinction, precision | `unit`, unit choices, small-value formatter; calculator/format/browser tests | Implemented; retain exact-pair and small-result coverage. |
| §4.14 Loan: payment/repayment/interest, formula, monthly assumptions, zero-rate handling | `loan`, formula/result copy; calculator/browser tests | Implemented. Amortization table is optional and not claimed. |
| §4.15 Dates: difference/countdown, start exclusion, past/future, leap/year boundaries | `days`, `dateDifference`, `recurringDate`; calculator/browser tests | Open: correct early-year arithmetic. Annual recurrence is implemented. |
| §4.16 GPA: documented scale, weighted/percentage modes, row calculation, validation | `GRADE_POINTS`, `gradeBreakdown`, GPA results; calculator/browser tests | Open: publish the complete supported grade-to-point mapping for users. |
| §4.17 Fuel: metric/US/Imperial, units, zero distance, invalid efficiency, quantity/cost, exclusions | `fuelTrip`, conditional labels and notices; calculator/browser tests | Implemented; retain equivalent-unit and invalid-input coverage. |
| §4.18 Sleep: either direction, configurable cycle/buffer, rollover, limits notice | `sleep`, visible defaults; calculator/browser tests | Implemented; no medical certainty is claimed. |

## Additional 20 tools (§7.2 addendum)

| Tool and required behavior | Implementation / evidence | Audit finding / acceptance still required |
| --- | --- | --- |
| Time zones: IANA zones, offsets, DST gaps/overlaps, no location transmission | `convertTimeZone`, bundled Temporal, additional/result/browser tests | Implemented; retain gap rejection and overlap notice. |
| Offline currency: editable dated snapshot, disclaimer, no live API | `convertCurrency`, `parseCurrencyRates`, ECB snapshot; additional/browser tests | Implemented; snapshot date and edit notice remain explicit. |
| Inflation: selected year range, user rate, forward/reverse estimate, disclaimer | `inflationValue`; additional/browser tests | Implemented; no unsupported historical CPI series is claimed. |
| Tip: tip/tax/basis, party size, rounding modes | `splitTip`, tip/additional/browser tests | PR #18 fixed exact-cent/tie rounding; retain those gates. |
| Calories: BMR/TDEE, activity, optional macros, adult/health limits | `calorieTargets`; additional/browser tests | Implemented; retain positive-energy/domain checks. |
| Pregnancy: LMP/conception, due date, gestational age/trimester, date validation | `pregnancyEstimate`; additional/browser tests | Implemented; apply the corrected shared date helper where relevant. |
| Water: weight, activity, climate, adjustable factor, range and health notice | `waterRange`; additional tests | Open: expose explicit configurable base-range/activity/climate inputs with honest assumptions. |
| BAC: Widmark estimate, mandatory warning gate, policy decision, no driving claims | `bloodAlcohol`, `bac-gate.js`, documented governance audit; additional/browser tests | Implemented with acknowledgement and reset/navigation protection. |
| Roman numerals: both directions, 1–3999, invalid feedback | `toRoman`, `fromRoman`; additional/browser tests | Implemented. |
| Number bases: bases 2–36, digit validation, large integers | `convertBase` with BigInt; additional/browser tests | Implemented. |
| Passwords: local cryptographic generator and strength estimate, no persistence | `generatePassword`, lazy strength module; password/additional/accessibility tests | Implemented; first use offline belongs to the shared offline gap. |
| QR: local encoding, downloadable output, visibility notice | `qr.js`, QR UI/download; QR/browser tests | Implemented. |
| Hashes: SHA-256/SHA-1/MD5, pasted/dropped file, local/no-upload notice | hash functions and file UI; additional/browser tests | Implemented, including zero-byte files and stale-request protection. |
| JSON: validation location, pretty/minify, large-input handling, no upload | `formatJson`; additional/browser tests | Semantic preservation exists. Establish bounded, responsive large-input behavior. |
| Colors: HEX/RGB/HSL conversion and WCAG contrast | `colors.js`, additional helpers, color UI; colors/browser tests | Implemented. |
| Discounts: forward/reverse calculation, tax, rounding explanation | discount functions, conditional UI; additional/browser tests | Implemented. |
| Recipe: serving scaling, fractions, compatible unit conversion | `scaleRecipe`; additional/browser tests | Implemented; only exact kg/g and L/mL conversions are claimed. |
| Holidays: region rules, timezone-aware day countdown, source/coverage limits | `holidayDates`, date countdown UI; additional/result/browser tests | Open: explicit reference time zone and local reference date with midnight/DST tests. |
| Morse: both directions, unsupported-character feedback | `translateMorse`; additional/browser tests | Implemented. |
| Statistics: all requested summaries, invalid/empty/singleton handling | `summarizeNumbers`; additional/browser tests | Existing outputs present; check numeric range and large-list behavior during completion. |

The 39th tool, Electrical Load Calculator, is an additional owner-authorized workstream beyond this master prompt. Preserve its released v2 implementation and its load/profile/storage/UI/localization tests; its final integration history is recorded in PRs #11 and #14–#16.

## Shared requirements and deliverables

| Requirement | Evidence / remaining acceptance |
| --- | --- |
| §§1–2: preserve work, governing audit, hierarchy, naming, approved assets, provenance | `AGENTS.md` pins HB-AI-ENGINEERING-001 v2.0; `DESIGN_DECISIONS.md` records four immutable reference revisions and owner decisions. No reference repository is modified. |
| §3 / addendum §7.5: searchable categorized cards, back/deep links, active state, readable panels | 39-card/11-category directory and hash router; browser/accessibility tests. |
| §5: static architecture, semantic DOM, reusable patterns, pure calculations, local dependencies | Vite/ES modules and separate pure functions; architecture documentation requires electrical/storage/offline updates. Suggested filenames are adaptable. |
| §6 / addendum §7.6: truthful privacy, safe DOM, no input transmission/logging, explicit location/persistence | Implementation safeguards and tests exist. Open: correct root privacy/README claims to describe opt-in electrical profiles and transient customer/export data. |
| §7: landmarks, labels, keyboard/focus, ARIA errors/status, reflow/zoom, contrast and reduced motion | Existing automated coverage; open: reduced-motion rule and new-control checks. Human assistive-technology/target-device/visual review remains separate. |
| §8: normal/invalid/boundary unit tests, real integration, privacy/network, project paths, production build | Existing suites and prior CI receipts; new candidate must run full browser tests with no skips and the production build. |
| §9: README, design, privacy, architecture, data/methodology, tests, licences | Open: reconcile stale population/tool/release claims, add contribution guidance, and update affected documentation. Root LICENSE requires an owner choice. Dependency notices remain required. |
| §9 / §10: reviewed commits, exact revision verification, artifact-only Pages, actual live checks | Existing release receipts. Open: make Pages itself require full Chromium verification before publication. |
| §11: recoverable checkpoints, concise current status, honest bounded reports | Dedicated continuation branch; one current status, archived history and this evidence checklist. Checkpoint receipts belong in the continuation PR. |
| §12: verified completion rather than tool-count assertions | Close every technical gap above and link exact test/build/deployment receipts before claiming technical completion. Human reviews and licence decision must remain plainly identified. |
| Addendum §7.8: offline capability after initial preparation | Open: prepare all required application assets and test first use of lazy tools plus offline reload without pre-warming individual tools. Cache application assets only, never calculation inputs. |

## Decisions that must not be fabricated

- Project-wide licence: pending explicit owner selection; do not invent a root licence.
- Fluent German/Yoruba/Nigerian Pidgin review: human review remains pending even when key parity and automated flows pass.
- Human assistive-technology, target-device/browser-zoom and visual review: do not equate automated checks with independent human certification.
- Approved system-font fallback, consolidated module structure, omitted unsourced population metrics, source-reported religion aggregation and optional amortization are documented scope decisions, not missing features to invent.
