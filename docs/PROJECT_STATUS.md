# Project status — AdigunTokenCalculator

**Milestone:** 2 — Static application foundation and initial calculator interactions.
**Branch:** codex/milestone-1-foundation.
**Latest verified source commit:** 3105afb47df0219816b9096b208c8a077983c9da.
**Owner decisions:** confirmed — HB Artificial Intelligence; English/German/Yoruba/Nigerian Pidgin; system-font fallback.

## Implemented source
- Static Vite app shell and responsive grouped directory for all 18 tools.
- Four-language tool names, category labels, tool descriptions, form labels, notices and result-label foundations.
- Local lazy-loaded tokenizer rank chunks for o200k_base and cl100k_base; exact byte-piece reconstruction check.
- Initial calculation modules for arithmetic, text stats, temperature, age, BMI, percentages, user-entered demographics, practice time, Zakat arithmetic, Qibla bearing, units, loans, date difference, GPA, fuel and sleep.
- Privacy/architecture documentation and a CI workflow.
- Unsourced world-statistics metrics remain withheld.

## Verified CI evidence
GitHub Actions workflow **Build and test**, run **#31** (41912304675), on commit 3105afb47df0219816b9096b208c8a077983c9da:
- Dependency installation: PASS.
- Unit tests: **7 passed, 0 failed**, including Unicode/tokenizer reconstruction across both encodings.
- Production build: PASS using Vite 6.4.5.
- Initial app JS bundle: approximately 41.71 kB (gzip 15.30 kB); tokenizer data is split into lazy-loaded rank chunks.
- Vite reports that individual tokenizer rank chunks exceed 500 kB; these are loaded only when their encoding is selected.

## Not yet verified
- **NOT TESTED:** browser interaction, real assistive-technology/screen-reader behavior, keyboard-only end-to-end use, responsive device matrix, contrast audit, offline behavior, full privacy/network inspection, browser console.
- Translation quality still needs fluent-speaker review.
- Tokenizer model mappings need a release-time check against current official model documentation.
- No committed lockfile yet; dependency resolution was performed by CI's npm install.
- **NOT DEPLOYED:** GitHub Pages is not configured or verified.

## Known product gaps
Official corporate logo is not yet integrated; current HB monogram is only a typographic placeholder. Engineering memory, full countdown mode, imperial BMI, richer GPA/percentage modes, source/methodology views and several detailed UX requirements remain. World-statistics data is withheld until sources are verified. This is a tested foundation, not a release candidate.

## Repository correction record
A source-edit command briefly wrote src/main.js to the default branch unintentionally. The file was immediately removed in a follow-up commit. A fresh default-branch read confirmed src/main.js is absent on main; the intended implementation file is present only on the feature branch. No merge or deployment was performed.

Next steps: see docs/NEXT_TASKS.md.
