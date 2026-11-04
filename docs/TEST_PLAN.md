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
