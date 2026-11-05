# Project status — AdigunTokenCalculator

## Released

The 38-tool catalogue is deployed at [GitHub Pages](https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/).

- The catalogue shipped in PR #6. [PR #9](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/9) subsequently merged with standing owner authorization on 5 November 2026.
- Merge commit: `2c90d7ab3ea28511923fb3763b575f584afe6f64`.
- [Exact-merge build/test run](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42003919750): succeeded.
- [Exact-merge Pages deployment](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42003919714): succeeded.
- Public HTTP 200 and deployed asset paths verified. An agent-operated live browser opened all 38 views and checked the directory, Unicode token reconstruction with both encodings and the bundled currency snapshot. This is functional browser verification, not a human accessibility or translation certification.

The release includes 11 directory categories, four locales, responsive navigation, the original 18 tools and 20 additional tools. Reset/focus, malformed-link, async-result, Unicode QR, lossless JSON and numeric-validation repairs are included. All calculation inputs remain in the browser.

## Released enhancements — PR #7

PR #7 passed **95 tests, 0 failed, 0 skipped**, including Chromium, and the production build. Live verification also covered RGB-to-HEX conversion, English/German password scoring, population reference totals, variance output and the localized notices link. Released changes:

- Four-locale dynamic result text, holiday names, JSON locations, time-zone dates and corrected directory descriptions.
- Direct official UN WPP2024 data audit, with checksums, exact rows and reproduction script. The corrected 2026 population baseline is 8,300,678,396; the 365-day slope reproduces both reference endpoints. See [POPULATION_AUDIT.md](POPULATION_AUDIT.md).
- Password strength checking with an explicitly loaded local zxcvbn model; no password storage, transmission or result echo.
- Bidirectional HEX/RGB/HSL input and displayed population/sample variance.
- Inactive form controls excluded from validation, mode/reset regressions and published dependency notices.

## Released enhancements — PR #8

PR #8 passed **102 tests, 0 failed, 0 skipped** and the production build. Exact-merge CI and Pages succeeded. Live checks verified both percentage tools and zero/tiny-interest loan cases. The release implements the remaining engineering percentage operation and displayed loan formula from `MASTER_PROMPT.md` §§4.2 and 4.14. The binary operation explicitly means A × B / 100. The dedicated percentage tool now displays amounts without a percentage suffix and explains each mode. Loan results include the applicable zero/nonzero-rate formula, variable definitions and payment count in all four locales. A cancellation defect at tiny positive interest rates is corrected with a stable equivalent formula.

## Released enhancements — PR #9

PR #9 passed **110 tests, 0 failed, 0 skipped** and the production build. Exact-merge CI and Pages succeeded. Live English/German checks confirmed tiny digital-unit results stay nonzero. The release preserves nonzero unit results that would round to zero, using localized scientific notation with eight significant digits. Ordinary display rounding is unchanged. Conversion uses the factor ratio before multiplication to avoid intermediate overflow; genuinely nonfinite outputs are rejected.

## Current continuation branch

`codex/complete-required-details` adds weighted GPA calculation details, the captured local age reference date, compatible recipe-unit conversion, and selected empty-file hashing.

The current release PR is the authoritative exact-candidate verification receipt. Local Chromium execution is **NOT TESTED** because the browser binary is unavailable; CI runs the browser suite. Human reviews below are separate from automated checks.

## Outstanding human / owner work

- **PENDING OWNER DECISION:** Project-wide licence selection. No root `LICENSE` has been added. Dependency licences and notices are inventoried separately.
- **PENDING HUMAN REVIEW:** Fluent German, Yoruba and Nigerian Pidgin review, including health/safety wording.
- **NOT TESTED MANUALLY:** Screen reader and assistive technology, complete keyboard-only workflows, target-device matrix, 200% zoom, complete contrast and offline/network inspection. See [TEST_PLAN.md](TEST_PLAN.md).

## Calculation limits

- Tokenizer reconstruction uses a version-pinned internal byte map in js-tiktoken 1.0.21.
- Population is simplified interpolation/extrapolation of dated UN projections. Births, deaths and CO₂ remain withheld.
- Currency uses a dated ECB snapshot; inflation uses a user-supplied rate.
- Health/water/BAC estimates are educational; BAC must never decide fitness to drive.
- MD5/SHA-1 are legacy checksums. Password-strength estimates do not guarantee security.
- Holiday dates are calendar references, not legal determinations.
- Demographic shares are dated editable aggregates, not individual beliefs.

No full production/accessibility certification is claimed while human review remains open.

## Electrical load calculator — current checkpoint

- Objective: add the owner's browser-only electrical load tool, keeping all existing calculators, shared utilities and tests unchanged.
- Branch: `codex/electrical-load-calculator`; base/last observed remote main: `2af80960933250c6bc8b2a03f020d44ad5e9dc1f`.
- Stage: pure engine and profile implemented; 20 new tests pass, 0 fail. Includes signed reactive power, vector apparent power, active/standby energy, demand/diversity/growth, costs/carbon, capped renewable offsets, idealized battery duration, phase/current and limits.
- Baseline: `npm test` passed 106 tests, failed 0, skipped 1 browser test. Local Chromium installation failed at the network download; browser behavior is NOT TESTED locally.
- Scope gate: connecting the tool requires additions to `src/main.js` and updates to the existing browser test's fixed 38-tool assertions. The owner's instruction requires approval before those existing shared/test files change. Complete the new modules and prepare the exact patch first.
- Next bounded action: add the editable appliance presets and their validation tests, then implement isolated UI/locales.
- Synchronization: shell push lacked credentials; use the authorized GitHub connector for commit/ref writes with expected-head checks. Verified remote checkpoint: `873f3e2f1c5fd9ea1c69927d6a93cd3ed7967535` on 5 November 2026; new changes after that checkpoint are locally pending. Preserve this section as the single current checkpoint; earlier continuation notes above describe the pre-feature release.

| Step | File | Observed verification | Next |
| --- | --- | --- | --- |
| 1 | `tests/loadProfile.test.js` | Expected red: missing implementation | Implement profile and input validation |
| 2 | `src/calculators/loadProfile.js` | 7 profile tests passed | Specify calculation engine |
| 3 | `tests/loadCalculator.test.js` | Expected red: missing engine | Implement pure engine |
| 4 | `src/calculators/loadCalculator.js` | 20 engine/profile tests passed | Add presets |
| 5 | `tests/loadPresets.test.js` | Expected red: missing preset library | Add requested estimates |
| 6 | `src/data/loadPresets.js` | 3 preset tests passed; 19 appliances and 2 generation offsets | Add localized interface copy |
| 7 | `tests/loadI18n.test.js` | Expected red: missing localization module | Add explicit EN/DE/YO/PCM copy |
| 8 | `src/tools/loadCalculator-i18n.js` | 5 localization tests passed; explicit four-locale keys, placeholders, presets and legacy catalogue preservation | Add requested export/status copy |
| 9 | `tests/loadI18n.test.js` | Expected red for newly requested CSV/status/export-failure keys | Supply those four-locale keys |
| 10 | `src/tools/loadCalculator-i18n.js` | 5 localization tests passed including CSV/status/export-failure keys | Add editable CO₂ assumption notice |
| 11 | `src/tools/loadCalculator-i18n.js` | 5 localization tests passed; illustrative CO₂ default explained in four locales | Implement isolated UI with these translation keys |
