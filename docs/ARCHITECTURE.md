# Architecture

## Runtime
- Static single-page application: semantic HTML, CSS custom properties and vanilla JavaScript ES modules.
- Vite builds the site for GitHub Pages project path `/AdigunTokenCalculator/`.
- No backend, database, analytics, telemetry, external calculation service or runtime CDN.
- Core calculation logic lives in `src/calculators.js`; the expanded offline algorithms live in `src/additional.js`; DOM rendering and interaction live in `src/main.js`.
- Electrical-load validation and calculations live in `src/calculators/loadProfile.js` and `src/calculators/loadCalculator.js`. `src/tools/loadCalculatorUI.js` owns its isolated interface, exports and customer estimate; `src/tools/loadProfileStorage.js` implements explicit profile persistence. Presets and approved company display data live under `src/data/`.
- The expanded catalogue and four-locale descriptions are defined in `src/additional-i18n.js`. QR generation is bundled through `qrcode-generator@2.0.4`; no runtime CDN or QR API is used.
- Four UI locales are defined in `src/i18n.js`, core translations in `src/copy.js`, expanded calculator translations in `src/additional-i18n.js`, and dynamic result/feature copy in `src/result-i18n.js` and `src/feature-i18n.js`.
- Electrical copy is maintained separately in `src/tools/loadCalculator-i18n.js` and `src/tools/loadV2-i18n.js`, with the same EN/DE/YO/PCM scope.

## Tokenizer data flow
`src/tokenizer.js` dynamically imports only the selected local `cl100k_base` or `o200k_base` rank chunk from pinned `js-tiktoken@1.0.21`. The package's per-token byte map is used to reconstruct display pieces with a streaming UTF-8 decoder; concatenated pieces are checked against the exact input. The pinned JS package does not expose a public per-token-byte method, so this adapter is version-pinned and fails closed if its expected map is unavailable.

## Data flow and privacy
Form values are read from the active form, passed to pure calculation functions and rendered using DOM node creation and `textContent`. No form values are placed in URLs or sent to an API. Geolocation is requested only from an explicit button click. Clipboard writes are explicit user actions.

Inputs remain in page memory by default. The electrical profile is the explicit persistence exception described below and in [PRIVACY.md](../PRIVACY.md); customer estimate fields are not part of its serialized schema.

## Build and test
- `npm ci`
- `npm test`
- `npm run build`
- `npm run dev`

Vite emits the canonical third-party notice text into the production bundle and serves the same notice during development.

Production output is `dist/`; GitHub Actions deploys only that directory after tests and build succeed.


## Expanded local utilities
- Time-zone conversion uses the bundled `@js-temporal/polyfill@0.5.1` for explicit DST disambiguation plus native `Intl.DateTimeFormat` and the browser's IANA data; ambiguous fall-back times choose the earlier instant and are flagged, while nonexistent spring-forward times are rejected.
- Currency conversion uses a static, editable ECB EUR-base snapshot dated 4 November 2026. No request is made when calculating.
- Password generation uses `crypto.getRandomValues`. Checking strength explicitly imports a separate local `zxcvbn@4.4.2` chunk; the model is not loaded for viewing the tool or generating a password. The wrapper accepts up to 128 Unicode code points and returns only score/pattern metadata; inputs are never persisted or transmitted. Hashes use `crypto.subtle.digest` for SHA-1/SHA-256 and a local MD5 compatibility implementation.
- QR code generation is bundled with `qrcode-generator` and creates a local data URL for preview/download.
- Hashing reads an explicitly selected file fully into memory (25 MB limit) or text. No file contents are transmitted.
- JSON uses native parsing for validation, then formats the validated token stream without converting its numeric tokens or collapsing duplicate object members.

## Electrical state, saved profiles and exports

The electrical interface keeps applied devices, unfinished builder edits, planning settings and customer-estimate fields in its own in-memory state. **Save** writes only the validated applied devices/settings/extensions into one `localStorage` slot. **Load** reads and validates that slot before replacing the current profile; version-one records are normalized to the current schema in memory without rewriting storage. **Delete** removes only that slot. The storage module performs no browser storage access on import, and saving/loading are explicit actions rather than autosave or automatic restoration.

Device labels are included in saved profiles and CSV exports. Unfinished builder edits and customer contact/billing fields are excluded from the persisted profile; customer fields are also excluded from CSV. Customer print/PDF output is built from the current validated estimate, includes the entered customer details, and uses the browser's print workflow. CSV downloads use a generated local Blob URL. Storage/validation failures are reported without treating invalid saved data as a successful load. See the [electrical calculation contract](ELECTRICAL_LOAD_CALCULATOR.md) for numerical and estimate limitations.

## Interaction state

`src/bac-gate.js` uses a native modal dialog to gate the educational BAC form. `src/form-errors.js` maps confirmed validation failures to inputs and manages ARIA description links without overwriting existing help IDs; ambiguous/runtime failures remain form-level. Editing input invalidates pending calculation requests so stale errors cannot attach to newer values. Shared calculator forms are recreated on reset, routing or language change; the electrical interface manages its separate state and preserves unfinished edits across language changes. The shared formatter in `src/format.js` offers an explicit scientific fallback for nonzero values that would otherwise round to zero.
