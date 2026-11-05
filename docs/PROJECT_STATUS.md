# Project status — AdigunTokenCalculator

## Released

The 38-tool catalogue is deployed at [GitHub Pages](https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/).

- [PR #6](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/6) merged with owner authorization on 5 November 2026.
- Merge commit: `75aee426e090aa8fc6628a3f1cec15f51b735111`.
- [Exact-merge build/test run](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/41995964953): succeeded.
- [Exact-merge Pages deployment](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/41995964888): succeeded.
- Public HTTP 200 and deployed asset paths verified. An agent-operated live browser opened all 38 views and checked the directory, Unicode token reconstruction with both encodings and the bundled currency snapshot. This is functional browser verification, not a human accessibility or translation certification.

The release includes 11 directory categories, four locales, responsive navigation, the original 18 tools and 20 additional tools. Reset/focus, malformed-link, async-result, Unicode QR, lossless JSON and numeric-validation repairs are included. All calculation inputs remain in the browser.

## Current continuation branch

`codex/post-release-verification` contains the next release candidate:

- Four-locale dynamic result text, holiday names, JSON locations, time-zone dates and corrected directory descriptions.
- Direct official UN WPP2024 data audit, with checksums, exact rows and reproduction script. The corrected 2026 population baseline is 8,300,678,396; the 365-day slope reproduces both reference endpoints. See [POPULATION_AUDIT.md](POPULATION_AUDIT.md).
- Password strength checking with an explicitly loaded local zxcvbn model; no password storage, transmission or result echo.
- Bidirectional HEX/RGB/HSL input and displayed population/sample variance.
- Inactive form controls excluded from validation, mode/reset regressions and published dependency notices.

Local source-audit and focused calculation checks pass. Production build passed before final integration. The current pull request is the authoritative receipt for exact-candidate tests, Chromium integration and build status; new work is not covered by an earlier green run. Local Chromium execution is **NOT TESTED** because the browser binary is unavailable; CI runs the browser suite.

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
