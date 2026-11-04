# Project status — AdigunTokenCalculator

**Milestone:** 2 — Static application foundation and initial calculator interactions.
**Branch:** codex/milestone-1-foundation.
**Owner decisions:** confirmed — HB Artificial Intelligence; English/German/Yoruba/Nigerian Pidgin; system-font fallback.

## Implemented source
- Static Vite app shell and responsive grouped directory for all 18 tools.
- Four-language tool names, category labels, tool descriptions, form labels, notices and select-option labels.
- Local lazy-loaded tokenizer rank chunks for o200k_base and cl100k_base, with byte-level reconstruction check.
- Initial calculation modules for arithmetic, text stats, temperature, age, BMI, percentages, user-entered demographics, practice time, Zakat arithmetic, Qibla bearing, units, loans, date difference, GPA, fuel and sleep.
- Privacy/architecture documentation and CI workflow.
- Unsourced world-statistics metrics remain withheld rather than fabricated.

## Verified CI evidence
GitHub Actions workflow **Build and test**, run **#35** (41912578859), commit dcaeb694d74267f55f811e5711070bcfe3306e99:
- Dependency installation: PASS.
- Unit tests: **9 passed, 0 failed**. Includes both tokenizer encodings, whitespace/newlines, emoji/non-Latin text, special-token literals and four-locale structural coverage.
- Production build: PASS using Vite 6.4.5.
- Initial app JS bundle: approximately 41.71 kB (gzip 15.30 kB); tokenizer data is split into lazy-loaded rank chunks.
- Individual tokenizer rank chunks exceed 500 kB; these are loaded only when the corresponding encoding is selected.

## Not yet verified
- **NOT TESTED:** browser interaction, real assistive-technology/screen-reader behavior, keyboard-only end-to-end use, responsive device matrix, contrast audit, offline behavior, full privacy/network inspection and browser console.
- Translation quality needs fluent-speaker review; structural coverage does not establish linguistic accuracy.
- Tokenizer model mappings need release-time verification against current official model documentation.
- No committed lockfile yet; CI resolved dependencies using npm install.
- **NOT DEPLOYED:** GitHub Pages is not configured or verified.

## Known product gaps
Official corporate logo is not yet integrated; current HB monogram is only a typographic placeholder. Engineering memory, full countdown mode, imperial BMI, richer GPA/percentage modes, category-specific demographic labels and source/methodology views remain incomplete. World-statistics data is withheld until credible dated sources are verified. This is a tested foundation, not a release candidate.

## Repository correction record
A source-edit command briefly wrote src/main.js to the default branch unintentionally. The file was immediately removed in a follow-up commit. A fresh default-branch read confirmed src/main.js is absent on main; the intended implementation file is present only on the feature branch. No merge or deployment was performed.

Next steps: see docs/NEXT_TASKS.md.
