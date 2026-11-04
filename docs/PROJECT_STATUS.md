# Project status — AdigunTokenCalculator

**Milestone:** 4 — Completion implementation and verification in progress.
**Branch:** codex/milestone-4-completion.
**Base:** main at f154de2d80baef52ed66b838ec548fdd1e1f8302.
**Live site:** https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/

## Implemented in this milestone
- Tokenizer live count, reconstructed text and token-ID copy controls, and clear action.
- Engineering memory controls (M+, M−, MR, MC), clear and backspace; degree-based trig, modulo, logs and factorial.
- Named editable religion categories with Pew Research Center 2020 shares.
- World population estimate based on UN WPP 2024 medium-variant mid-year values; rounded to nearest thousand. Births, deaths and CO₂ remain withheld.
- Qibla compass direction and explicit click-to-request geolocation.
- Daily practice-time average.
- Annual recurring event countdown and corrected today/upcoming/elapsed status.
- GPA percentage mode, clearly distinguished from GPA.
- Metric and imperial fuel calculations (US and Imperial mpg).
- More translated labels, outputs, assumptions and validation feedback in four locales.
- Privacy, architecture, data-source, licensing, third-party notice and test-plan documentation.
- CI workflow runs on the completion feature branch.

## Earlier verified production baseline
- Main commit before this branch: f154de2d80baef52ed66b838ec548fdd1e1f8302.
- Previous pre-merge CI: 12 tests passed; production build passed.
- Previous GitHub Pages deployment: successful at the live URL.

## Current verification state
- A first feature-branch CI run failed at setup-node because npm caching was enabled without a lockfile. The cache option was removed; the next run must confirm the corrected workflow.
- **NOT YET VERIFIED:** current expanded test suite, syntax/build, and current branch integration.
- **NOT TESTED:** manual browser, screen-reader, keyboard-only end-to-end, responsive device matrix, contrast, offline, live-site network/privacy and console checks.
- A package lockfile could not be generated in the current execution environment; CI currently installs dependencies without a committed lockfile.
- Translation text requires fluent-speaker review.

## Remaining release limitations
- Official corporate logo artwork not integrated; only an HB placeholder remains. No reuse permission has been established for copying the binary asset.
- Project-wide licence has not been authorised; no root LICENSE file added.
- Tokenizer byte-piece adapter relies on the pinned js-tiktoken 1.0.21 internal byte map because the package does not expose a public per-token byte method.
- World population estimate needs exact values rechecked against the official UN downloadable dataset before release; no births/deaths/CO₂ counters.
- This milestone is not production-certified until automated and manual release gates are completed.
