# Project status — AdigunTokenCalculator

## Verified deployed release

[PR #11](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/11) added Electrical Load Calculator as tool 39, merged with explicit owner authorization on 5 November 2026 and deployed at [GitHub Pages](https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/#/electrical-load). These are the verified release receipts at the start of the continuation below. Final follow-up receipts also belong in its merged pull request, avoiding a self-referential post-deployment commit.

- Merge commit: `4c0fb20e892cf6e34533160809002a83bed945bb`.
- [Exact-merge CI](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42012585549): succeeded.
- [Pages deployment](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42012585660): succeeded.
- Candidate `661b429`: **169 passed, 0 failed, 0 skipped**, including Chromium; production build passed.
- Live electrical fixture verified **0.972 kWh/day**, **0.15 kW hourly peak**, **27% load factor** and **0.1 kW / 0.075 kVAR / 0.125 kVA**. Browser checks cover four locales, CSV, print and mobile layout.
- The following earlier release checks remain preserved from PRs #6–#12:
- Live BAC checks passed: initial title focus, unchecked consent with Continue disabled, contained/wrapping Tab navigation, acknowledgement followed by input focus, fresh consent after Reset, and Escape back to the directory.
- Live JSON checks passed: invalid input receives `aria-invalid`, an `aria-describedby` error association and field focus; editing clears the stale message and attributes.
- Live recipe checks passed: scaling `1.5 kg flour` and `0.25 L water` from 2 to 4 servings produces `3000 g flour` and `500 mL water` on separate lines. Computed `white-space: pre-wrap` and the exact-metric-pairs/no-density notice were verified.
- Earlier live checks covered all 38 views, token reconstruction, currency, color conversion, password strength, population baselines, variance, percentages, loan formulas, tiny unit results and weighted grade details. Prior receipts are in merged PRs #6–#10.

## Implemented scope

The application contains 39 tools in 11 searchable categories and four locales. All calculation inputs remain in the browser. Continuation work includes an archived official UN population audit; localized dynamic results; password strength checking; bidirectional color conversion; variance; engineering percentages; stable loan formulas; nonzero unit precision; GPA weighting; local age reference dates; recipe-unit conversion; and empty-file hashing. PR #12 adds the BAC warning dialog, confirmed-input errors with ARIA associations and focus, stale-error prevention after editing, disabled inactive controls, clearer recipe wording and visible multiline output. PR #11 adds electrical device presets, power/energy/cost/carbon analysis, community factors, a conserved hourly profile and local exports. Sources, privacy, dependency notices and calculation limitations are documented.

## Electrical load follow-up

[PR #14](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/14) implements the owner-requested completion after the verified electrical release. The continuation adds explicit browser-local Save/Load/Delete, complete four-language copy, validated profile recovery, preservation of unfinished edits and the finite tiny-PF correction fix. No changes to the original 38 calculator implementations, shared router, dependencies, branding or AGENTS.md are included. Bounded file/test checkpoints follow below.

## Remaining human / owner work

- **PENDING OWNER DECISION:** Choose a project-wide licence. No root `LICENSE` has been added. All 71 locked dependency packages have declared licences; complete notices ship with the site.
- **PENDING HUMAN REVIEW:** Fluent German, Yoruba and Nigerian Pidgin review, including health/safety wording.
- **NOT TESTED MANUALLY:** Screen reader/assistive technology, complete keyboard-only workflows, target-device matrix, 200% zoom, full contrast and offline/network inspection. Automated browser checks and agent-operated live checks are recorded separately in `docs/TEST_PLAN.md`.

## Calculation limits

Population is simplified interpolation/extrapolation of dated UN projections; births/deaths/CO₂ remain withheld. Currency is a dated ECB snapshot and inflation uses a user-entered rate. Health/BAC outputs are educational; BAC must never decide fitness to drive. Password strength is an estimate, and MD5/SHA-1 are legacy checksums. Holidays are calendar references, demographic shares are dated aggregates, and grade mappings are illustrative. Recipe conversion uses exact kg↔g and L↔mL pairs without density assumptions. Token reconstruction relies on a version-pinned tokenizer byte map.

No full accessibility or production certification is claimed while required human review remains open.

## Electrical load calculator — initial implementation history

- Objective: add the owner's browser-only electrical load tool, keeping all existing calculators, shared utilities and tests unchanged.
- Branch: `codex/electrical-load-calculator`; initial base: `2af80960933250c6bc8b2a03f020d44ad5e9dc1f`; refreshed upstream: `84dd508075777ccbc230f1db0fd4e1b6068db3be`.
- Stage: integrated, tested in Chromium, merged and deployed as tool 39. Full initial local suite: 149 passed, 0 failed, 2 browser skips; `npm run build` passed. Final Actions/live receipts are above and in merged PR #11.
- Baseline: `npm test` passed 106 tests, failed 0, skipped 1 browser test. Local Chromium installation failed at the network download; browser behavior is NOT TESTED locally.
- Scope authorization: owner explicitly instructed commit, deploy and integrate to main during this turn. Proceed with the previously identified router additions and 38→39 browser assertions, then verified merge/deployment. Existing calculator logic remains unchanged.
- Next bounded action: initial implementation complete; see the continuation checkpoint for follow-up work.
- Synchronization: shell push lacked credentials; authorized GitHub connector writes used expected-head checks. Final initial candidate `661b4297c63ee6c8c3fb584cfdf8cb33bad12eaa` became main squash commit `4c0fb20e892cf6e34533160809002a83bed945bb`. The table below is historical; its intermediate pending checks were resolved by that release.

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
| 12 | `tests/loadProfile.test.js` | New null/sparse-array regression fails as expected | Reject malformed explicit values |
| 13 | `src/calculators/loadProfile.js` | First validation fix still failed: remaining null default identified | Repair remaining default then rerun |
| 14 | `src/calculators/loadProfile.js` | All 8 profile tests passed after remaining CO2 null default fix | Align power/factor numerical boundaries |
| 15 | `tests/loadCalculator.test.js` | New full-day factor regression fails as expected | Fix roundoff and tiny PF evaluation |
| 16 | `src/calculators/loadCalculator.js` | 22 engine/profile tests passed after numerical fixes | Build UI and interaction checks |
| 17 | `tests/loadUI.test.js` | Initial UI test failed during parsing (quoted CSV assertion); preview is designed to test proposed router additions in memory only | Implement isolated UI |
| 18 | `src/tools/loadCalculatorUI.js` | Pure UI/CSV implementation added; test blocked by quoted assertion syntax | Correct new UI test syntax |
| 19 | `tests/loadUI.test.js` | Parser fixed; CSV numeric formatting assertion fails on floating-point residue | Normalize export display precision |
| 20 | `src/tools/loadCalculatorUI.js` | 3 pure UI tests pass: registration, isolated memory state, multilingual CSV and formula-injection escaping; DOM mounting NOT IMPLEMENTED yet | Implement DOM renderer |
| 21 | `src/tools/loadCalculatorUI.js` | 4 UI/unit/build tests passed; 1 browser test skipped locally (no Chromium) | Verify production-preview interactions in Actions |
| 22 | Upstream synchronization | PRs #12/#13 preserved; both checkpoint/release sections retained. Full suite: 149 passed, 0 failed, 2 browser skips locally | Complete browser verification in Actions |
| 23 | `tests/loadUI.test.js` | Added CSV W-unit assertion (expected red), optional battery/keyboard checks and debounced-validation wait | Repair UI review findings |
| 24 | `src/tools/loadCalculatorUI.js` | 4 UI/unit/build checks pass; 1 browser check skipped locally. CSV includes W; blank optional battery maps to zero | Clarify renewable timing assumption, integrate router |
| 25 | `src/tools/loadCalculator-i18n.js` | All 5 locale tests passed; ideal renewable timing assumption explicit in all four languages | Add owner-authorized router integration |
| 26 | `src/main.js` | Owner-authorized 3-line integration; 4 UI/unit/build tests passed, 1 local browser skip | Update fixed catalogue counts only |
| 27 | `tests/browser.test.js` | Only 5 fixed catalogue count assertions changed 38→39; browser invocation skipped locally (no Chromium) | Run exact candidate in Actions |
| 28 | `README.md` | Required catalogue row appended; count updated to 39; 3 preset tests passed | Add calculation contract documentation |
| 29 | `docs/ELECTRICAL_LOAD_CALCULATOR.md` | Documented formulas/assumptions; all 22 engine/profile tests passed | Run full build/test and commit release candidate |
| 30 | `tests/loadUI.test.js` | Removed proposal-only transform after authorization; actual production route builds, 4 tests pass, browser check pending CI | Push exact feature commit and verify Actions |

## Electrical load completion — continuation checkpoint

- Owner instruction: continue building and finish; previous main merge/deployment authorization remains in effect.
- Base: deployed main `4c0fb20e892cf6e34533160809002a83bed945bb`; branch `codex/electrical-load-profiles`.
- Scope: explicit local profile save/load/delete, four-language copy, focused numerical correction, tests and release records. Existing 38 calculators remain untouched.
- Current state: follow-up implementation, documentation and Chromium verification complete. Functional candidate `3b9e4885b2cc40db20fd694b29079c2b27883191` passed **176 tests, 0 failed, 0 skipped**, plus production build in [GitHub CI](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42015301312). Local results were 155 passed with 3 unavailable-Chromium skips; CI resolved those skips.
- Next: feature work complete. This is the pre-merge verification checkpoint; [PR #14](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/14) records the final main commit, exact-main CI, Pages deployment and live profile verification. Standing owner authorization covers merge/deployment.

| Step | File | Observed verification | Next |
| --- | --- | --- | --- |
| 31 | `tests/loadCalculator.test.js` | 14 passed, 1 expected regression failure: finite tiny-PF correction overflows internally | Stabilize correction formula |
| 32 | `src/calculators/loadCalculator.js` | All 15 engine tests pass, including finite tiny-PF correction and genuine overflow rejection | Specify local profile persistence |
| 33 | `tests/loadStorage.test.js` | Expected red: persistence module does not exist; round-trip, malformed input, scoped deletion and failed-write cases specified | Implement versioned local storage adapter |
| 34 | `src/tools/loadProfileStorage.js` | All 5 storage tests pass: complete normalized round-trip, malformed/oversized rejection, one-slot isolation, blocked storage and write preservation | Add four-language persistence copy |
| 35 | `tests/loadI18n.test.js` | 4 passed, 1 expected red: persistence copy absent (`action.saveProfile` first missing key) | Add explicit four-language profile actions, notices and statuses |
| 36 | `src/tools/loadCalculator-i18n.js` | All 5 localization tests pass; explicit save/load/delete, shared-browser notice, applied-row semantics and failure/status copy in EN/DE/YO/PCM | Integrate profile controls into the isolated UI |
| 37 | `tests/loadUI.test.js` | 4 unit/build checks pass; 2 browser checks skipped locally (Chromium unavailable). Added save/load/delete, invalid/blocked storage and blank-name remount workflow specification | Connect UI and verify browser cases in CI |
| 38 | `tests/loadStorage.test.js` | 4 passed, 1 expected failure: stored engine-valid values may exceed UI limits or have blank names | Enforce editable profile limits before replacing current state |
| 39 | `src/tools/loadProfileStorage.js` | All 5 storage tests pass; saved data must satisfy UI bounds and nonblank names before restoration, including valid normalized kW ratings | Integrate explicit storage actions in UI |
| 40 | `src/tools/loadCalculatorUI.js` | 14 focused unit/build/locale/storage checks passed; 2 browser checks skipped locally. Added explicit local actions, full settings restoration, blank-name preservation and editable large kW ratings | Complete browser regressions and documentation |
| 41 | `tests/loadUI.test.js` | 4 unit/build checks pass; 2 browser checks await CI. Added rejected saved UI bounds and normalized large-kW editing regressions | Update feature documentation |
| 42 | `docs/ELECTRICAL_LOAD_CALCULATOR.md` | All 10 storage/locale tests pass; documented opt-in persistence, replacement/deletion behavior, browser-local privacy and recovery | Run full test/build, record candidate, push for browser CI |
| 43 | `docs/PROJECT_STATUS.md` | Corrected stale 38-tool/pending-PR records with verified PR #11 deployment receipts. Full local suite: 155 passed, 0 failed, 3 browser skips; build and diff checks passed | Push candidate and run Chromium CI |
| 44 | Final code candidate `3b9e488` | GitHub CI: 176 passed, 0 failed, 0 skipped; build passed. Browser save/reload/load/delete, corrupt/blocked storage, four locales and preserved unfinished edits verified | Record final merge/deployment receipts in PR #14 |
