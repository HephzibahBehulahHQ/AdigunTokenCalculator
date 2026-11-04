# Architecture

- `index.html`: semantic static shell.
- Vite: local development and production bundling.
- `src/calculators.js`: pure calculation functions.
- `src/i18n.js`: interface strings for English, German, Yoruba and Nigerian Pidgin.
- `src/tokenizer.js`: local `js-tiktoken` lite imports for `cl100k_base` and `o200k_base`.
- `src/main.js`: grouped directory, accessible forms and DOM rendering with `textContent`.
- `tests/calculators.test.js`: Node built-in test suite.

No backend, remote calculation service, telemetry or runtime CDN is part of the architecture.
