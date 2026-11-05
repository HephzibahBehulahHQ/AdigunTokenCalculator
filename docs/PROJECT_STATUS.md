# Project status — AdigunTokenCalculator

## Latest deployed functional release

[PR #12](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/12) merged with standing owner authorization on 5 November 2026 and deployed at [GitHub Pages](https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/). These receipts identify the latest functional release; later documentation-only commits do not replace them.

- Merge commit: `a33c9827a378565068bb0855f682de44ae932195`.
- [Exact-merge CI](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42009691371): succeeded.
- [Pages deployment](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42009691478): succeeded.
- Candidate `9b6e0`: **134 passed, 0 failed, 0 skipped**, including Chromium; production build passed.
- Live BAC checks passed: initial title focus, unchecked consent with Continue disabled, contained/wrapping Tab navigation, acknowledgement followed by input focus, fresh consent after Reset, and Escape back to the directory.
- Live JSON checks passed: invalid input receives `aria-invalid`, an `aria-describedby` error association and field focus; editing clears the stale message and attributes.
- Live recipe checks passed: scaling `1.5 kg flour` and `0.25 L water` from 2 to 4 servings produces `3000 g flour` and `500 mL water` on separate lines. Computed `white-space: pre-wrap` and the exact-metric-pairs/no-density notice were verified.
- Earlier live checks covered all 38 views, token reconstruction, currency, color conversion, password strength, population baselines, variance, percentages, loan formulas, tiny unit results and weighted grade details. Prior receipts are in merged PRs #6–#10.

## Implemented scope

The application contains 38 tools in 11 searchable categories and four locales. All calculation inputs remain in the browser. Continuation work includes an archived official UN population audit; localized dynamic results; password strength checking; bidirectional color conversion; variance; engineering percentages; stable loan formulas; nonzero unit precision; GPA weighting; local age reference dates; recipe-unit conversion; and empty-file hashing. PR #12 adds the BAC warning dialog, confirmed-input errors with ARIA associations and focus, stale-error prevention after editing, disabled inactive controls, clearer recipe wording and visible multiline output. Sources, privacy, dependency notices and calculation limitations are documented.

## Separate integration review

Draft [PR #11](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/11), the electrical-load feature, remains an independent workstream awaiting integration review. Its PR body requires separate owner approval before shared-file integration. It is outside this deployed release's 38-tool scope.

## Remaining human / owner work

- **PENDING OWNER DECISION:** Choose a project-wide licence. No root `LICENSE` has been added. All 71 locked dependency packages have declared licences; complete notices ship with the site.
- **PENDING HUMAN REVIEW:** Fluent German, Yoruba and Nigerian Pidgin review, including health/safety wording.
- **NOT TESTED MANUALLY:** Screen reader/assistive technology, complete keyboard-only workflows, target-device matrix, 200% zoom, full contrast and offline/network inspection. Automated browser checks and agent-operated live checks are recorded separately in `docs/TEST_PLAN.md`.

## Calculation limits

Population is simplified interpolation/extrapolation of dated UN projections; births/deaths/CO₂ remain withheld. Currency is a dated ECB snapshot and inflation uses a user-entered rate. Health/BAC outputs are educational; BAC must never decide fitness to drive. Password strength is an estimate, and MD5/SHA-1 are legacy checksums. Holidays are calendar references, demographic shares are dated aggregates, and grade mappings are illustrative. Recipe conversion uses exact kg↔g and L↔mL pairs without density assumptions. Token reconstruction relies on a version-pinned tokenizer byte map.

No full accessibility or production certification is claimed while required human review remains open.
