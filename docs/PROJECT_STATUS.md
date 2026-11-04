# Project status — AdigunTokenCalculator

**Milestone:** 4 — Completion implementation automated verification passed; review and deployment pending.
**Branch:** codex/milestone-4-completion.
**Base:** main at f154de2d80baef52ed66b838ec548fdd1e1f8302.
**Live production baseline:** https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/

## Implemented in this milestone
- Tokenizer live count, reconstructed text and token-ID copy controls, clear action and special-token text notice.
- Explicit supported model-to-encoding mappings; byte-preserving token reconstruction check.
- Engineering memory controls (M+, M−, MR, MC), clear/backspace; degree-based trigonometry, modulo, logs and factorial.
- Named editable religion categories with Pew Research Center's sourced 2020 shares and source link.
- World population estimate based on UN WPP 2024 medium-variant mid-year values, rounded to nearest thousand with UTC timestamp. Births, deaths and CO₂ remain withheld.
- Qibla compass direction and explicit click-to-request geolocation.
- Daily practice-time average.
- Annual recurring event countdown and corrected today/upcoming/elapsed status.
- GPA percentage mode, clearly distinguished from GPA.
- Metric and imperial fuel calculations (US and Imperial mpg).
- More translated labels, outputs, assumptions and validation feedback in four locales.
- Privacy, architecture, data-source, licensing, third-party notice and test-plan documentation.
- CI workflow runs on the completion feature branch; high-contrast focus indicator.

## Verified automated checkpoint
GitHub Actions **Build and test**, run #98 (41916198986), commit ef334ba15364fc6db6edd1d43278e19a76eadd1c:
- Dependency install: PASS.
- Unit tests: **32 passed, 0 failed**.
- Production build: PASS.
- Pages base path remains configured for /AdigunTokenCalculator/.

## Not yet verified
- **NOT TESTED:** Manual browser interaction for every tool, assistive technology/screen reader, keyboard-only end-to-end, responsive device matrix, full contrast audit, offline behaviour, live-site network/privacy inspection and browser console.
- Translation quality requires fluent-speaker review.
- A package lockfile could not be generated in the current execution environment; CI currently installs dependencies without a committed lockfile.
- Official population baseline values should be rechecked against the official downloadable UN dataset before future data refreshes.

## Remaining release limitations
- Official corporate logo artwork not integrated; the HB monogram remains a placeholder. The design-system repo provides the exact official artwork, but this product repo has no explicit reuse grant/binary asset copy. Do not generate a substitute.
- Project-wide licence has not been authorised; no root LICENSE file added.
- Tokenizer byte-piece adapter relies on the pinned js-tiktoken 1.0.21 internal byte map because the package does not expose a public per-token byte method.
- World population estimate is a linear interpolation, not live data. Births, deaths and CO₂ remain omitted pending separately verified baselines.
- Pew 2020 "other religions" aggregates folk/traditional and several smaller traditions; a separate folk percentage is not inferred.
- This milestone is automated-test/build verified, but not production-certified until manual release gates and deployed-commit verification are completed.
