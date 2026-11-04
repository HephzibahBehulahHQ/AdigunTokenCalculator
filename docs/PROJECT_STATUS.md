# Project status — AdigunTokenCalculator

**Current state:** Published to GitHub Pages.
**Production commit:** 4b338de154350437697425a162e342d45702d9b4.
**Live URL:** https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/
**Owner decisions:** HB Artificial Intelligence; English/German/Yoruba/Nigerian Pidgin; system-font fallback.

## Implemented
- Static Vite app with grouped directory for all 18 tools.
- Four-language interface foundation: tool names, descriptions, group names, primary form labels, select options and result labels.
- Local lazy-loaded tokenizer rank chunks for o200k_base and cl100k_base; byte-preserving token segmentation.
- Scientific engineering operations: arithmetic, modulo, powers, square root, degree-based trigonometry, logarithms and factorial.
- BMI metric and imperial input modes.
- Date difference with upcoming/elapsed countdown status.
- Initial calculators for text statistics, temperature, age, percentages, user-entered demographics, practice time, Zakat arithmetic, Qibla bearing, unit conversions, loans, GPA, fuel and sleep.
- Vite project-site base path configured as /AdigunTokenCalculator/.
- GitHub Actions workflow builds, tests and deploys the site from main.
- Privacy/architecture documentation. Unsourced world-statistics figures remain withheld.

## Verification and deployment evidence
- Pre-merge GitHub Actions Build and test run #68 (41913773155): **12 tests passed, 0 failed; production build passed**.
- Post-merge Pages workflow run #70 (41913949546), commit 4b338de154350437697425a162e342d45702d9b4: dependency install PASS, tests PASS, production build PASS, Pages artifact upload PASS, deployment PASS.
- GitHub Actions reported the deployment URL as https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/.
- Main app bundle: 46.01 kB (gzip 16.49 kB).
- Tokenizer rank data is lazy-loaded: cl100k_base 1.09 MB and o200k_base 2.33 MB minified (gzip 502 kB and 1.14 MB respectively), fetched only when the selected encoding is first used.

## Remaining validation
- Manual browser interaction, assistive technology, keyboard-only end-to-end, responsive device matrix, contrast audit, offline behavior and full network/privacy inspection: **NOT TESTED**.
- Translation quality needs fluent-speaker review.
- Tokenizer model mappings need release-time verification against official model documentation.
- No committed npm lockfile yet.

## Known product gaps
Official corporate logo is not integrated; HB monogram is a placeholder. Engineering memory, richer demographics category labels, source/methodology views and some detailed master-prompt UX remain incomplete. World-statistics metrics remain hidden until credible dated baselines are sourced. This is published and CI-tested, but not a fully production-certified release.
