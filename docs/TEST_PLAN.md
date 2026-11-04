# Test plan

## Automated
Run `npm test` and `npm run build` with Node.js 20+.

Unit coverage includes Unicode text statistics; age/date-only calendar arithmetic; arithmetic, percentages, temperature limits, BMI metric/imperial; Qibla bearing and compass validation; zero-rate loans; GPA and percentage averages; metric and imperial fuel; unit conversion; Zakat; practice projections; named demographic shares; sleep rollover; scientific operations; calculator memory; annual countdowns; population estimate baseline; four-locale tool catalogues, fields, options and results; tokenizer whitespace, newlines, emoji, non-Latin text, special-token literals, token IDs and UTF-8 reconstruction.

## Manual release checklist
- [ ] Open all 18 tools and submit valid and invalid examples.
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
- [ ] Time-zone normal conversion, DST gap rejection and repeated-time ambiguity.
- [ ] Currency conversion, custom-rate parsing and dated snapshot values.
- [ ] Inflation forward/reverse compounding and negative-rate boundaries.
- [ ] Tip/tax basis, people count and rounding modes.
- [ ] Mifflin–St Jeor, activity multipliers and macro percentage validation.
- [ ] LMP/conception due dates, gestational age and future-date rejection.
- [ ] Water heuristic lower/upper bounds and adjustment.
- [ ] BAC formula zero case, range validation and disclaimer visibility.
- [ ] Roman canonicality, base conversion BigInt boundaries and password character sets.
- [ ] QR generation, hash known vectors / file limit, JSON line-column errors.
- [ ] HEX/RGB/HSL and WCAG ratio, discount reverse calculation, recipe fractions.
- [ ] Easter computus and regional holiday rules, Morse round-trip and statistics edge cases.

## Automated browser integration
- `tests/browser.test.js` runs Chromium against the Vite development server in CI. It checks the 38-card directory, category filters, search, currency conversion, back navigation and a direct time-zone deep link. It is skipped locally when the Playwright browser binary is not installed.

## Expanded manual browser checklist
- [ ] Verify all 38 cards, category filters, search, deep links and back navigation.
- [ ] Verify every new tool in all four locales; fluent German, Yoruba and Nigerian Pidgin review is still required.
- [ ] Confirm currency and other calculations work with network disabled after the static site loads.
- [ ] Confirm password and hash data are never sent in network requests; file hashing is local and rejects files above 25 MB.
- [ ] Confirm QR content is visibly disclosed as readable by scanners and downloaded QR image scans correctly.
- [ ] Confirm health and BAC warnings remain visible beside results; BAC must never be represented as driving clearance.
- [ ] Verify DST gap and ambiguity behavior in browser versions with IANA time-zone data.
- [ ] Check responsive card grid, keyboard focus, screen-reader announcements and 200% zoom.
