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

## Continuation repairs — 5 November 2026

- Restore declared form defaults, conditional fields and units on Reset, including the seeded currency/demographic text.
- Preserve keyboard focus through category filtering, tool entry and back navigation; recover safely from malformed URL fragments.
- Ignore stale asynchronous token/hash/geolocation results after Reset, Clear, navigation, language changes or a newer calculation.
- Preserve UTF-8 input in generated QR codes and original numeric tokens when formatting JSON.
- Return the population reference baseline, reject missing GPA grades and nonpositive calorie estimates, reject non-finite numeric output, and keep sleep times valid across multi-day rollover.
- Wrap calculator action rows on narrow screens. Regression coverage checks all 38 calculator panels at 375 px.

## Automated verification

The first repair candidate, commit `038f380dd7eba709ab608eb2834dee8b0d22b8c6`, passed [CI run #193](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/41993381331): **72 tests passed, 0 failed, 0 skipped**, including Chromium regressions, all 38 mobile tool panels and the production build.

Follow-up invalid-number checks and fresh-page malformed-link coverage require a new CI result. Their exact candidate SHA and latest verification receipt are maintained in the [PR #6 verification section](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/6), avoiding a self-referential documentation/CI commit cycle. A prior green run does not verify later changes.

- Initial repair checks: changed JavaScript syntax and focused isolated JavaScript regressions passed.
- Full repaired-candidate npm/browser/build verification: pending branch CI when this checkpoint was authored.
- Local browser and build execution: **NOT TESTED**; the execution environment is unavailable.
- Manual human checks listed below remain separate from automated CI.

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

**Release status:** the expanded implementation and continuation repairs are on the feature branch; use PR #6 for the latest exact-candidate automated verification receipt. The 38-tool version is not yet merged or deployed, and the human/owner/data-audit gates above remain open.
