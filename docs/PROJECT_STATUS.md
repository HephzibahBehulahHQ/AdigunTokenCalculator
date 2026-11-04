# Project status — AdigunTokenCalculator

**Milestone:** 3 — Project-site deployment preparation and expanded calculator coverage.
**Branch:** codex/milestone-1-foundation.
**Owner decisions:** confirmed — HB Artificial Intelligence; English/German/Yoruba/Nigerian Pidgin; system-font fallback.

## Implemented
- Static Vite app with grouped directory for all 18 tools.
- Four-language interface foundation: tool names, descriptions, group names, primary form labels, select options and result labels.
- Local lazy-loaded tokenizer rank chunks for o200k_base and cl100k_base; byte-preserving token segmentation.
- Scientific engineering operations: arithmetic, modulo, powers, square root, degree-based trigonometry, logarithms and factorial.
- BMI metric and imperial input modes.
- Date difference with upcoming/elapsed countdown status.
- Initial calculators for text statistics, temperature, age, percentages, user-entered demographics, practice time, Zakat arithmetic, Qibla bearing, unit conversions, loans, GPA, fuel and sleep.
- Vite project-site base path configured as /AdigunTokenCalculator/.
- GitHub Actions workflow to deploy the built site from main.
- Privacy/architecture documentation. Unsourced world-statistics figures remain withheld.

## Verified CI evidence
GitHub Actions **Build and test**, run #68 (41913773155), commit d843d03e493c327715a9170d3443ee9d3388866e:
- Dependency install: PASS.
- Unit tests: **12 passed, 0 failed**.
- Production build: PASS using Vite 6.4.5.
- Main app bundle: 46.01 kB (gzip 16.49 kB).
- Tokenizer rank data is lazy-loaded: cl100k_base 1.09 MB and o200k_base 2.33 MB minified (gzip 502 kB and 1.14 MB respectively). These are fetched only when the selected encoding is first used.

## Not yet verified
- **NOT TESTED:** manual browser interaction, assistive technology, keyboard-only end-to-end, responsive device matrix, contrast audit, offline behavior and full network/privacy inspection.
- Translation quality needs fluent-speaker review.
- Tokenizer model mappings need release-time verification against official model documentation.
- No committed npm lockfile yet.
- **NOT DEPLOYED YET:** Pages deployment workflow must run after merge, then the published URL must be checked.

## Known product gaps
Official corporate logo is not integrated; HB monogram is a placeholder. Engineering memory, richer demographics category labels, source/methodology views and some detailed master-prompt UX remain incomplete. World-statistics metrics remain hidden until credible dated baselines are sourced. This is a tested foundation, not a fully production-certified release.
