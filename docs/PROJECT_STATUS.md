# Project status — AdigunTokenCalculator

**Milestone:** 6 — Pages release verification.
**Default branch:** `main`.
**Release target:** https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/
**Implementation:** Milestones 4 and 5 are merged to `main` (PRs #3 and #4).

## Implemented and merged

- 18 browser-side calculators and tools, including tokenizer, engineering calculator, BMI, fuel, GPA, Qibla, countdown, practice average, religion demographics and population estimate.
- Tokenizer live count, reconstructed text and token-ID copy controls, clear action and special-token text notice.
- Explicit supported model-to-encoding mappings; byte-preserving token reconstruction check.
- Engineering memory controls (M+, M−, MR, MC), clear/backspace; degree-based trigonometry, modulo, logs and factorial.
- Named editable religion categories with Pew Research Center's sourced 2020 shares and source link.
- World population estimate based on UN WPP 2024 medium-variant mid-year values, rounded to nearest thousand with UTC timestamp. Births, deaths and CO₂ remain withheld.
- Qibla compass direction and explicit click-to-request geolocation.
- Daily practice-time average; annual recurring event countdown with today/upcoming/elapsed status.
- GPA percentage mode, clearly distinguished from GPA; metric and imperial fuel calculations (US and Imperial mpg).
- Four locales: English, German, Yoruba and Nigerian Pidgin.
- Privacy, architecture, data-source, licensing, third-party notice, test-plan and Pages configuration documentation.
- GitHub Actions CI and Vite Pages deployment workflow. The Pages workflow checks that the repository Pages source is GitHub Actions before deploying.

## Automated verification

Latest previously recorded main-branch CI checkpoint (run #109, ID 41917476188):
- Dependency installation with `npm ci`: PASS.
- Unit tests: **32 passed, 0 failed**.
- Vite production build: PASS.

PR #4 added the Pages source preflight. Its first deployment attempt (run #5, ID 41917476549) correctly stopped because Pages was configured as `legacy`; the repository owner has now changed the Pages source to **GitHub Actions**. A fresh deployment run is now required to verify the corrected setting and published artifact.

## Not yet verified

- **PENDING:** Successful post-configuration GitHub Pages deployment and confirmation of the deployed commit/site contents.
- **NOT TESTED:** Manual browser interaction for every tool, assistive technology/screen reader, keyboard-only end-to-end, responsive device matrix, full contrast audit, offline behaviour, live-site network/privacy inspection and browser console.
- Translation quality requires fluent-speaker review.
- Official population baseline values should be rechecked against the official downloadable UN dataset before future data refreshes.

## Remaining release limitations

- Official corporate logo artwork not integrated; the HB monogram remains a placeholder. The design-system repo provides the exact official artwork, but this product repo has no explicit reuse grant/binary asset copy. Do not generate a substitute.
- Project-wide licence has not been authorised; no root LICENSE file added.
- Tokenizer byte-piece adapter relies on the pinned js-tiktoken 1.0.21 internal byte map because the package does not expose a public per-token byte method.
- World population estimate is a linear interpolation, not live data. Births, deaths and CO₂ remain omitted pending separately verified baselines.
- Pew 2020 "other religions" aggregates folk/traditional and several smaller traditions; a separate folk percentage is not inferred.

The application is implementation-complete for the scoped feature set and automated-test/build verified. It is not yet production-certified until the new deployment and the manual release gates above are completed.
