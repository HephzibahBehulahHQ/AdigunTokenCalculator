# Architecture

## Runtime
- Static single-page application: semantic HTML, CSS custom properties and vanilla JavaScript ES modules.
- Vite builds the site for GitHub Pages project path `/AdigunTokenCalculator/`.
- No backend, database, analytics, telemetry, external calculation service or runtime CDN.
- Pure calculation logic lives in `src/calculators.js`; DOM rendering and interaction live in `src/main.js`.
- Four UI locales are defined in `src/i18n.js` and product translations/assumptions in `src/copy.js`.

## Tokenizer data flow
`src/tokenizer.js` dynamically imports only the selected local `cl100k_base` or `o200k_base` rank chunk from pinned `js-tiktoken@1.0.21`. The package's per-token byte map is used to reconstruct display pieces with a streaming UTF-8 decoder; concatenated pieces are checked against the exact input. The pinned JS package does not expose a public per-token-byte method, so this adapter is version-pinned and fails closed if its expected map is unavailable.

## Data flow and privacy
Form values are read from the active form, passed to pure calculation functions and rendered using DOM node creation and `textContent`. No form values are placed in URLs or sent to an API. Geolocation is requested only from an explicit button click. Clipboard writes are explicit user actions.

## Build and test
- `npm install`
- `npm test`
- `npm run build`
- `npm run dev`

Production output is `dist/`; GitHub Actions deploys only that directory after tests and build succeed.
