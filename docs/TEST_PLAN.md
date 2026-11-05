# Test plan

## Automated
Run `npm ci`, `npm test` and `npm run build` with Node.js 20+. See the current release PR verification receipt for the exact tested candidate, test totals and build result; old run counts do not verify later repairs.

Unit coverage includes Unicode text statistics; age/date-only calendar arithmetic; arithmetic, percentages, temperature limits, BMI metric/imperial; Qibla bearing and compass validation; zero-rate loans; GPA and percentage averages; metric and imperial fuel; unit conversion; Zakat; practice projections; named demographic shares; sleep rollover; scientific operations; calculator memory; annual countdowns; population estimate baseline; four-locale tool catalogues, fields, options and results; tokenizer whitespace, newlines, emoji, non-Latin text, special-token literals, token IDs and UTF-8 reconstruction.

## Manual release checklist
- [ ] Open all 38 tools and submit valid and invalid examples (automated unit coverage is separate).
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
- [x] `tests/browser.test.js` runs Chromium against the Vite development server in CI. It checks all 38 tool views, the 38-card directory, category filters, search, currency conversion, QR generation, BAC acknowledgement, back navigation, a direct time-zone deep link, mobile overflow, keyboard activation, no third-party requests and no geolocation before explicit user action. It is skipped locally when the Playwright browser binary is not installed.

## Expanded manual browser checklist
- [ ] Verify all 38 cards, category filters, search, deep links and back navigation.
- [ ] Verify every new tool in all four locales; fluent German, Yoruba and Nigerian Pidgin review is still required.
- [ ] Confirm currency and other calculations work with network disabled after the static site loads.
- [ ] Confirm password and hash data are never sent in network requests; file hashing is local and rejects files above 25 MB.
- [ ] Confirm QR content is visibly disclosed as readable by scanners and downloaded QR image scans correctly.
- [ ] Confirm health and BAC warnings remain visible beside results; BAC must never be represented as driving clearance.
- [ ] Verify DST gap and ambiguity behavior in browser versions with IANA time-zone data.
- [ ] Check responsive card grid, keyboard focus, screen-reader announcements and 200% zoom.

## Continuation regression coverage

Automated regressions cover default restoration and conditional form state, BMI unit labels in all four locales, keyboard focus, malformed fragments on fresh page loads, non-finite numeric results, delayed hash/geolocation results, and mobile overflow across all 38 panels. Unit regressions cover UTF-8 QR byte vectors, JSON numeric-token and string preservation, population baseline output, multi-day sleep rollover, omitted GPA grades and nonpositive calorie estimates. The presence of a test is not a pass receipt: consult the current PR CI result.

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
