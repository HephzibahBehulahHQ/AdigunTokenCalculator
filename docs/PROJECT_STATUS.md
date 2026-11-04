# Project status — AdigunTokenCalculator

**Milestone:** 7 — expanded 38-tool release candidate; final merge and Pages deployment pending.
**Default branch:** `main`.
**Feature branch:** `codex/milestone-4-6-complete-tools`.
**Pull request:** [#6 — expand AdigunTokenCalculator to 38 tools](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/6).
**Live site:** https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/

## Implemented on the feature branch

- All 18 original tools plus the 20 additional tools required by the latest `MASTER_PROMPT.md`: 38 tools total.
- Searchable, responsive card directory with 11 category filters, localized descriptions, deep links and back navigation.
- Four locales: English, German, Yoruba and Nigerian Pidgin. Automated completeness checks cover all 38 tool names, groups, descriptions, form labels, select options, result labels and safety notices; fluent-speaker review remains required.
- Time-zone conversion across a curated set of IANA zones using Temporal polyfill plus native Intl.DateTimeFormat; daylight-saving gaps are rejected and ambiguous fall-back times flagged.
- Offline ECB currency conversion with an editable 4 November 2026 reference-rate snapshot for 30 currencies.
- Inflation, tip/tax splitting, adult calorie/macro estimates, pregnancy date estimates, adjustable water range and educational BAC estimate.
- Roman numeral, number-base, password, QR, file/text hash, JSON, color/contrast, discount/tax, recipe scaling, regional holiday countdown, Morse and statistics tools.
- Hashing, password generation, QR generation and calculations run locally. Hashing supports pasted text, selected files and drag/drop (25 MB limit).
- The BAC tool is explicitly educational and says never to use it to decide whether to drive. Health-related tools include non-medical disclaimers.
- Exact approved corporate logo artwork copied byte-for-byte from the design-system repository; provenance and reference revisions are recorded.
- Root `SOURCES.md`, architecture, privacy, licensing, third-party notices, test plan and Pages configuration records updated.

## Automated verification

Latest successful CI run: [#190](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/41930582052), commit `e43c0d309be7640be37bb27a07631eaf6f7b73cb`.
- `npm ci`: PASS.
- Chromium installation on Ubuntu 24.04: PASS.
- `npm test`: **58 passed, 0 failed**, including Playwright Chromium browser smoke test.
- `npm run build`: PASS.
- Lockfile inventory: 70 dependency packages; all have declared licence metadata (MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0).

Earlier deployment run #6 succeeded for commit `862ca832609d8e6dd80e616c37ad75b9c237ff06` after the owner changed GitHub Pages source to **GitHub Actions**. That deployment contains the earlier 18-tool release, not this 38-tool feature branch. PR #6 must merge and its own Pages workflow must pass before the live site contains the expanded catalogue.

## Remaining release checks / limitations

- **PENDING OWNER DECISION:** Choose and authorize a project-wide licence. No root `LICENSE` has been added.
- **PENDING HUMAN REVIEW:** Fluent-speaker review of German, Yoruba and Nigerian Pidgin translations and health/safety wording.
- **NOT TESTED MANUALLY:** Screen-reader/assistive-technology review, keyboard-only end-to-end review, target-device responsive matrix, 200% zoom, full contrast audit, offline network inspection and deployed-site manual walkthrough of all 38 tools. Automated Chromium smoke tests do not replace these.
- **PENDING DATA AUDIT:** Compare the 2025/2026 population baseline values against a directly downloaded UN WPP 2024 dataset file and record its checksum. The official UNData World / Medium series is identified in `SOURCES.md`; direct file-level verification is not yet archived.
- **PENDING RELEASE:** Merge PR #6, confirm its Pages workflow deployed the merge commit, then perform a live smoke test.

## Known calculation limitations

- Tokenizer byte-piece reconstruction relies on the pinned `js-tiktoken@1.0.21` internal byte map because no public per-token byte method is exposed.
- Population output is an interpolation/extrapolation from mid-year UN medium-variant projections, not a live count. Births, deaths and CO₂ remain withheld.
- ECB rates are a dated reference snapshot, not live transaction rates.
- Inflation uses a user-supplied annual rate, not an official CPI series.
- The water range is a broad DGE-derived total-water estimate (including food water), with an editable activity/climate adjustment; it is not a medical recommendation.
- BAC is a simplified Widmark-style educational estimate, never a fitness-to-drive assessment.
- MD5 and SHA-1 are supported for legacy checksums only, not security-sensitive use.
- Holiday dates are rule-based calendar references, not legal confirmation of statutory-holiday entitlement.
- Pew's 2020 “other religions” aggregate includes folk/traditional and smaller traditions; no unsupported separate folk percentage is inferred.

**Release status:** implementation and automated verification are complete on the feature branch. The 38-tool version is not yet merged or deployed, and the human/owner/data-audit gates above remain open.
