# Test plan

## Automated
Run `npm ci`, `npm test` and `npm run build` with Node.js 20+. See the current release PR verification receipt for the exact tested candidate, test totals and build result; old run counts do not verify later repairs.

Unit coverage includes Unicode text statistics; age/date-only calendar arithmetic; arithmetic, percentages, temperature limits, BMI metric/imperial; Qibla bearing and compass validation; zero-rate loans; GPA and percentage averages; metric and imperial fuel; unit conversion; Zakat; practice projections; named demographic shares; sleep rollover; scientific operations; calculator memory; annual countdowns; population estimate baseline; four-locale tool catalogues, fields, options and results; tokenizer whitespace, newlines, emoji, non-Latin text, special-token literals, token IDs and UTF-8 reconstruction.

## Tip rounding regressions

`tests/tip.test.js` checks exact cents, half-cent ties, all three rounding modes, real values just above/below boundaries, exponent notation, fractional tip/tax rates, both tip bases, zero and invalid party sizes, and unrepresentable results. The browser suite exercises these rounding controls and localized results in EN/DE/YO/PCM, plus range-error recovery and reset. Test presence is not an execution receipt; see the current status and continuation PR for observed results.

## Manual release checklist
- [ ] Open all 39 tools and submit valid and invalid examples (automated unit coverage is separate).
- [ ] Keyboard-only directory navigation, form submission, reset and memory controls.
- [ ] Screen-reader inspection of labels, errors, live token count and result announcements.
- [ ] Mobile/tablet/desktop layouts and 200% zoom; no horizontal overflow.
- [ ] Contrast check for text, focus states, selected navigation and token pieces.
- [ ] Confirm geolocation is not requested until Qibla button activation.
- [ ] Inspect browser Network panel: only same-site static assets during calculations; no form values in requests.
- [ ] Inspect browser console for runtime errors.
- [ ] Verify tokenizer chunks load from the GitHub Pages project path.
- [ ] Verify copy controls require deliberate activation and copy expected text.
- [ ] Verify language switching on every calculator.

Manual checks require a human on target browsers before claiming full accessibility or production certification.


## Expanded calculator unit coverage
- [x] Time-zone normal conversion, DST gap rejection and repeated-time ambiguity.
- [x] Currency conversion, custom-rate parsing and dated snapshot values.
- [x] Inflation forward/reverse compounding and negative-rate boundaries.
- [x] Tip/tax basis, people count and rounding modes.
- [x] Mifflin–St Jeor, activity multipliers and macro percentage validation.
- [x] LMP/conception due dates, gestational age and future-date rejection.
- [x] Water heuristic lower/upper bounds and adjustment.
- [x] BAC formula zero case, range validation and disclaimer visibility.
- [x] Roman canonicality, base conversion BigInt boundaries and password character sets.
- [x] QR generation, hash known vectors, JSON line-column errors.
- [x] HEX/RGB/HSL and WCAG ratio, discount reverse calculation, recipe fractions.
- [x] Easter computus and regional holiday rules, Morse round-trip and statistics edge cases.

## Automated browser integration
- [x] `tests/browser.test.js` runs Chromium against the Vite development server in CI. It checks all 39 tool views, the 39-card directory, category filters, search, currency conversion, QR generation, BAC acknowledgement, back navigation, a direct time-zone deep link, mobile overflow, keyboard activation, no third-party requests and no geolocation before explicit user action. It is skipped locally when the Playwright browser binary is not installed.

## Expanded manual browser checklist
- [ ] Verify all 39 cards, category filters, search, deep links and back navigation.
- [ ] Verify every new tool in all four locales; fluent German, Yoruba and Nigerian Pidgin review is still required.
- [ ] Confirm currency and other calculations work with network disabled after the static site loads.
- [ ] Confirm password and hash data are never sent in network requests; file hashing is local and rejects files above 25 MB.
- [ ] Confirm QR content is visibly disclosed as readable by scanners and downloaded QR image scans correctly.
- [ ] Confirm health and BAC warnings remain visible beside results; BAC must never be represented as driving clearance.
- [ ] Verify DST gap and ambiguity behavior in browser versions with IANA time-zone data.
- [ ] Check responsive card grid, keyboard focus, screen-reader announcements and 200% zoom.

## Continuation regression coverage

Automated regressions cover default restoration and conditional form state, BMI unit labels in all four locales, keyboard focus, malformed fragments on fresh page loads, non-finite numeric results, delayed hash/geolocation results, and mobile overflow across all 39 panels. Unit regressions cover UTF-8 QR byte vectors, JSON numeric-token and string preservation, population baseline output, multi-day sleep rollover, omitted GPA grades and nonpositive calorie estimates. The presence of a test is not a pass receipt: consult the current PR CI result.

## Post-release feature regressions

Unit and browser checks cover four-locale dynamic results, ambiguous/normal time-zone labels, holiday names, JSON error locations, UTF-8 hash byte counts, demographic/fuel notes, population endpoints, rendered variance, bidirectional HEX/RGB/HSL conversion and password-strength scoring. Browser checks also verify inactive controls cannot block submission, mode/reset behaviour, lazy model loading, masked input and exclusion of checked passwords from results. Source-data verification is reproducible separately with `scripts/audit-population.py`. The current PR records actual CI outcomes.

## Engineering and loan completion

Unit cases cover defined percentage semantics, decimal/signed/zero operands, finite-output boundaries and overflow. Loan checks cover the ordinary reference vector, zero interest, tiny positive rates, zero principal, safe whole payment counts and invalid/non-finite inputs. Chromium exercises percentage mode after a unary operation and both loan formula branches in all four locales. Consult the current PR for actual run results.

## Unit output precision

Focused formatter checks cover all four locales, real byte→GB and bit→GiB conversions, signed values, zero, rounding boundaries, the smallest positive JavaScript number and invalid inputs. Browser regressions verify scientific fallback and ordinary decimal output. Unit arithmetic rejects genuine overflow while avoiding intermediate overflow when the final answer is finite.

## Required tool details

Browser regressions cover four-locale grade breakdowns and explicit recipe conversions/reset defaults. An isolated Los Angeles browser at 2026-01-01T00:30Z verifies that age uses and displays the local date 2025-12-31. Selected empty-file hashing is checked against known MD5/SHA-1/SHA-256 digests. Unit tests cover grade validation/aggregation bounds and recipe fractions, unit-token boundaries, unknown units, tiny reusable output and invalid/numeric-range cases.

## Warning gate and accessible validation

Chromium checks the BAC dialog in all four locales: initial focus, Tab/Shift-Tab containment, unchecked/disabled Continue, hidden pre-consent form, guarded submission, Cancel/Escape navigation, accepted focus, checkbox validation and fresh consent after reset/re-entry. Error regressions verify confirmed-input ARIA links/focus, preserved help IDs, unrelated-control exclusion, correction/mode/reset/navigation cleanup, form-level runtime failures and cancellation of delayed errors after editing. Multiline ingredient results remain visibly separated. These automated checks do not replace a human screen-reader review.

## Electrical load coverage

The electrical suite covers device presets and validation, P/Q/S and current calculations, surge estimates, power-factor correction, cable-planning assumptions, hourly/15-minute energy conservation, device windows, tariff bands, seasonal projections and customer-estimate cent arithmetic. Profile tests cover explicit local Save/Load/Delete, version migration, corrupted storage and preservation of unfinished edits. These are numerical and software checks, not hardware tests or certified electrical-design approval.

`tests/loadUI.test.js` and `tests/loadV2UI.test.js` exercise the actual production bundle: device editing, four locales, persistence, CSV and printing, customer validation, exclusion of customer details from saved profiles/CSV, print cleanup and multi-page A4 output. Consult the corresponding PR receipt for exact executed results.

## Keyboard, reflow and offline continuation

`tests/accessibility.test.js` adds browser checks for:

- Skip-link focus and the next Tab destination, while preserving the active route, history, entered values, results and directory filters in all four locales.
- Localized navigation/group names, descriptive engineering action names and keyboard-operated memory/edit controls with visible live status.
- Overflow recovery: the stored finite memory remains available to Recall and Clear after an accessible error. Pure unit tests separately cover addition/subtraction overflow, cancellation and the largest finite value.
- Every one of the 39 panels and the directory in all four locales at 320, 768 and 1440 CSS pixels, plus a 1280-pixel viewport with 2× content zoom. Root CSS zoom is a repeatable reflow check; it does not replace human browser-zoom and target-device review.
- Password strength, a known SHA-256 vector and currency calculation after their required code has loaded, with the browser offline. The checks require fresh results, no initiated requests, no local/session storage and no password echoed in output.

Browser tests may skip locally when Chromium is absent; those skips are reported explicitly and do not establish browser verification. Both CI and the Pages build install Chromium and check that its executable exists before running the suite. Publication depends on these tests and the production build passing. Human screen-reader behavior, visual focus/contrast, fluent translation/content review and target-browser zoom remain separate unchecked release items above. Current candidate and execution receipts belong in [PROJECT_STATUS.md](PROJECT_STATUS.md) and its linked PR.

## Master-prompt completion gates

The requirement-to-implementation map is [SPEC_COMPLIANCE.md](SPEC_COMPLIANCE.md). The continuation adds these acceptance checks:

- Calendar/calculator tests preserve early years, leap boundaries and date-only semantics; exact metric/imperial BMI equivalence; signed percentage extremes; finite fuel, Zakat, temperature and practice outputs; sentence punctuation/abbreviations; exact decimal demographic sums, malformed shares and parser limits.
- `tests/completion-calculators.test.js` covers configurable water factors and bounds, selected-zone midnight holiday dates, DST-independent calendar days and pregnancy arithmetic across early years.
- `tests/completion-copy.test.js` verifies explicit EN/DE/YO/PCM controls/messages, interpolation and field-specific errors. Structural parity is not fluent-speaker approval.
- `tests/completion-browser.test.js` exercises the actual controls and explanatory copy in all four locales, GPA mapping, Zakat arithmetic, exact source/custom demographic totals, reference-zone holiday days, reduced motion, bounded token pagination/full-copy output, cancellation/busy cleanup and localized large-input errors.
- Tokenizer/unit/client/browser tests check supported public byte decoding, both encodings, concurrent initialization, known vectors, BOM/Unicode/special-marker reconstruction, long text, queue deduplication/cancellation/recovery, local WASM failure/retry, responsive worker execution and the actual two-encoder production bundle.
- JSON task/browser and statistics tests check exact token preservation, syntax positions, bounded input/output expansion, real-worker responsiveness, cancellation/newest requests, stable large-number summaries and long-list limits.
- `tests/offline.test.js` checks every production asset against its manifest hash, first preparation without warming tools, failed/mismatched installation, eviction/repair/retry, readiness only after matching control, explicit update and other-tab guarding, no automatic reload, product-only cache pruning and exclusion of user input/query/history data.
- The offline Chromium case starts with a fresh online context, waits for the complete application asset cache, disconnects, uses both token encodings and password strength for the first time, reloads a hash deep link and checks storage/privacy. A separate fresh context deliberately loses a WASM fetch, verifies failure and retries. A first-ever visit with no network or prior cache cannot work; readiness must have been reached first and browser site data must remain available.

Before marking a release complete, inspect the exact candidate's CI log for **zero failed and zero skipped tests**, confirm the production build, verify the exact merged main revision, wait for the Pages deployment for that same revision, and compare live assets/critical flows with the built candidate. Record current receipts in [PR #21](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/21), not as an unqualified tool-count claim.

## Final release verification

- The discount regressions cover a 100% forward discount with tax, the undefined 100% reverse calculation, accessible field focus/error recovery, and valid fractional reverse discounts above 99.99%.
- `scripts/verify-deployment.mjs` compares SHA-256 digests for every published artifact file and the directory entry point. It rejects stale or mismatched bytes, failed responses, symlinks and a missing entry point, with bounded retries for server startup or CDN propagation.
- The same script opens a fresh Chromium context and performs synthetic calculations in all 39 tools, both token encodings, password-strength loading and discount error/recovery. It checks four-language navigation/calculation, narrow reflow, keyboard operation, offline preparation, browser errors, failed assets, unintended external requests/writes, automatic location access and browser storage.
- CI first exercises this verifier against the built production preview. After a successful Pages deployment, the `verify-live` job downloads the exact artifact from that workflow run and repeats verification against the published URL. A green build or deploy step alone does not establish a successful live verification job.
- The verifier has a three-minute deadline. Human assistive-technology, fluent-speaker, target-device and sensitive-content review remain separate; browser automation does not certify those reviews.
