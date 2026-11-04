# Project status — AdigunTokenCalculator

**Milestone:** 3 — Project-site deployment preparation and expanded calculator coverage.
**Branch:** codex/milestone-1-foundation.
**Owner decisions:** confirmed — HB Artificial Intelligence; English/German/Yoruba/Nigerian Pidgin; system-font fallback.

## Implemented
- Static Vite application with grouped directory for all 18 tools.
- Four-language interface foundation: tool names, descriptions, group names, primary form labels, select options and result labels.
- Local lazy-loaded tokenizer rank chunks for o200k_base and cl100k_base; byte-preserving token segmentation.
- Scientific engineering operations: arithmetic, modulo, powers, square root, trigonometry in degrees, logarithms and factorial.
- BMI metric and imperial input modes.
- Date difference with upcoming/elapsed countdown status.
- Initial calculator modules for text statistics, temperature, age, percentages, user-entered demographics, practice time, Zakat arithmetic, Qibla bearing, unit conversions, loans, GPA, fuel and sleep.
- GitHub Pages project-site base path configured as /AdigunTokenCalculator/.
- GitHub Actions Pages deployment workflow; deploys only from main after a push.
- Privacy/architecture documentation. World-statistics figures remain withheld pending source verification.

## Verification
- Earlier checkpoint CI run #35 passed 9 tests and a production build before the current milestone-3 changes.
- **NOT YET VERIFIED:** current expanded suite, current Pages-base production build and actual Pages deployment. Awaiting the new PR CI run.
- **NOT TESTED:** manual browser interaction, assistive technology, keyboard-only end-to-end, responsive device matrix, contrast audit, offline behavior and full network/privacy inspection.
- Fluent translation review and official tokenizer model mapping verification remain outstanding.

## Release blockers / known gaps
- Official corporate logo is not integrated; HB monogram is a placeholder.
- Translation quality is not independently certified by fluent speakers.
- No committed npm lockfile yet.
- Engineering memory, richer demographics category labels, source/methodology views and other master-prompt details remain.
- World-statistics metrics remain hidden until credible dated baselines are sourced.
- Deployment must be confirmed from GitHub Actions and the live project URL before describing the site as published.

This is a working application foundation, not yet a production-certified release.
