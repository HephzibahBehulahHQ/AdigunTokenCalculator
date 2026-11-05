# Architecture

## Runtime
- Static single-page application: semantic HTML, CSS custom properties and vanilla JavaScript ES modules.
- Vite builds the site for GitHub Pages project path `/AdigunTokenCalculator/`.
- No backend, database, analytics, telemetry, external calculation service or runtime CDN.
- Core calculation logic lives in `src/calculators.js`; the expanded offline algorithms live in `src/additional.js`; DOM rendering and interaction live in `src/main.js`.
- The expanded catalogue and four-locale descriptions are defined in `src/additional-i18n.js`. QR generation is bundled through `qrcode-generator@2.0.4`; no runtime CDN or QR API is used.
- Four UI locales are defined in `src/i18n.js`, core translations in `src/copy.js`, expanded calculator translations in `src/additional-i18n.js`, and dynamic result/feature copy in `src/result-i18n.js` and `src/feature-i18n.js`.

## Tokenizer data flow
`src/tokenizer.js` dynamically imports only the selected local `cl100k_base` or `o200k_base` rank chunk from pinned `js-tiktoken@1.0.21`. The package's per-token byte map is used to reconstruct display pieces with a streaming UTF-8 decoder; concatenated pieces are checked against the exact input. The pinned JS package does not expose a public per-token-byte method, so this adapter is version-pinned and fails closed if its expected map is unavailable.

## Data flow and privacy
Form values are read from the active form, passed to pure calculation functions and rendered using DOM node creation and `textContent`. No form values are placed in URLs or sent to an API. Geolocation is requested only from an explicit button click. Clipboard writes are explicit user actions.

## Build and test
- `npm install`
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

## Interaction state

`src/bac-gate.js` uses a native modal dialog to gate the educational BAC form. `src/form-errors.js` maps confirmed validation failures to inputs and manages ARIA description links without overwriting existing help IDs; ambiguous/runtime failures remain form-level. Editing input invalidates pending calculation requests so stale errors cannot attach to newer values. Form replacement on reset, routing or language change discards the previous UI state. The shared formatter in `src/format.js` offers an explicit scientific fallback for nonzero values that would otherwise round to zero.
