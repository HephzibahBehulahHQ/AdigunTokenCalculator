# Project status — AdigunTokenCalculator

## Released

The 38-tool catalogue is deployed at [GitHub Pages](https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/).

- The catalogue shipped in PR #6. [PR #7](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/7) subsequently merged with standing owner authorization on 5 November 2026.
- Merge commit: `740a2cb4bfb04547a55ee33d9400d40003894efb`.
- [Exact-merge build/test run](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42001385069): succeeded.
- [Exact-merge Pages deployment](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42001385025): succeeded.
- Public HTTP 200 and deployed asset paths verified. An agent-operated live browser opened all 38 views and checked the directory, Unicode token reconstruction with both encodings and the bundled currency snapshot. This is functional browser verification, not a human accessibility or translation certification.

The release includes 11 directory categories, four locales, responsive navigation, the original 18 tools and 20 additional tools. Reset/focus, malformed-link, async-result, Unicode QR, lossless JSON and numeric-validation repairs are included. All calculation inputs remain in the browser.

## Released enhancements — PR #7

PR #7 passed **95 tests, 0 failed, 0 skipped**, including Chromium, and the production build. Live verification also covered RGB-to-HEX conversion, English/German password scoring, population reference totals, variance output and the localized notices link. Released changes:

- Four-locale dynamic result text, holiday names, JSON locations, time-zone dates and corrected directory descriptions.
- Direct official UN WPP2024 data audit, with checksums, exact rows and reproduction script. The corrected 2026 population baseline is 8,300,678,396; the 365-day slope reproduces both reference endpoints. See [POPULATION_AUDIT.md](POPULATION_AUDIT.md).
- Password strength checking with an explicitly loaded local zxcvbn model; no password storage, transmission or result echo.
- Bidirectional HEX/RGB/HSL input and displayed population/sample variance.
- Inactive form controls excluded from validation, mode/reset regressions and published dependency notices.

## Current continuation branch

`codex/engineering-loan-completion` implements the remaining engineering percentage operation and displayed loan formula from `MASTER_PROMPT.md` §§4.2 and 4.14. The binary operation explicitly means A × B / 100. The dedicated percentage tool now displays amounts without a percentage suffix and explains each mode. Loan results include the applicable zero/nonzero-rate formula, variable definitions and payment count in all four locales. A cancellation defect at tiny positive interest rates is corrected with a stable equivalent formula.

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
