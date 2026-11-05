# Project status — AdigunTokenCalculator

## Latest deployed functional release

[PR #10](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/10) merged with standing owner authorization on 5 November 2026 and deployed at [GitHub Pages](https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/).

- Merge commit: `2af80960933250c6bc8b2a03f020d44ad5e9dc1f`.
- [Exact-merge CI](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42005699636): succeeded.
- [Pages deployment](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42005699723): succeeded.
- Candidate verification: **122 passed, 0 failed, 0 skipped**, including Chromium and the production build.
- Live checks verified weighted grade details and exact metric recipe conversion. Earlier live checks covered all 38 views, token reconstruction, currency, color conversion, password strength, population baselines, variance, percentages, loan formulas and tiny unit results. Prior exact receipts are in merged PRs #6–#9.

## Implemented scope

The application contains 38 tools in 11 searchable categories and four locales. All calculation inputs remain in the browser. Continuation work includes an archived official UN population audit; localized dynamic results; password strength checking; bidirectional color conversion; variance; engineering percentages; stable loan formulas; nonzero unit precision; GPA weighting; local age reference dates; recipe-unit conversion; and empty-file hashing. Sources, privacy, dependency notices and calculation limitations are documented.

## Current continuation candidate

`codex/accessible-validation-bac-gate` adds the specified BAC warning dialog, confirmed-input error associations and focus, stale-error prevention after editing, disabled inactive controls, clearer recipe wording and visible multiline output. Local tests and build pass; the current PR is the authoritative exact-candidate Chromium/build receipt. Local Chromium is unavailable, so local browser execution is **NOT TESTED**.

## Remaining human / owner work

- **PENDING OWNER DECISION:** Choose a project-wide licence. No root `LICENSE` has been added. All 71 locked dependency packages have declared licences; complete notices ship with the site.
- **PENDING HUMAN REVIEW:** Fluent German, Yoruba and Nigerian Pidgin review, including health/safety wording.
- **NOT TESTED MANUALLY:** Screen reader/assistive technology, complete keyboard-only workflows, target-device matrix, 200% zoom, full contrast and offline/network inspection. Automated browser checks and agent-operated live checks are recorded separately in `docs/TEST_PLAN.md`.

## Calculation limits

Population is simplified interpolation/extrapolation of dated UN projections; births/deaths/CO₂ remain withheld. Currency is a dated ECB snapshot and inflation uses a user-entered rate. Health/BAC outputs are educational; BAC must never decide fitness to drive. Password strength is an estimate, and MD5/SHA-1 are legacy checksums. Holidays are calendar references, demographic shares are dated aggregates, and grade mappings are illustrative. Recipe conversion uses exact kg↔g and L↔mL pairs without density assumptions. Token reconstruction relies on a version-pinned tokenizer byte map.

No full accessibility or production certification is claimed while required human review remains open.
