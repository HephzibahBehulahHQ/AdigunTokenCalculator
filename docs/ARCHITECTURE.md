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
- Requirement-completion copy lives in `src/completion-i18n.js`; offline readiness/update copy lives in `src/offline-i18n.js`.

## Tokenizer data flow
`src/tokenizer-client.js` sends text/encoding requests to the module worker in `src/tokenizer-worker.js`. The shared `src/worker-client.js` keeps one running request and only the latest queued edit, reuses identical pending requests and can terminate work on cancellation. Routing/reset/language changes cancel the workers; request guards prevent stale results from replacing current values.

`src/tokenizer.js` imports the selected local `cl100k_base` or `o200k_base` encoder from pinned `tiktoken@1.0.22`. Vite aliases the runtime adapter to `src/tokenizer-runtime.browser.js`, which fetches the same-origin bundled Lite WASM file and initializes it locally. Token pieces use the public `decode_single_token_bytes` API with a streaming UTF-8 decoder; concatenated pieces must match the input. Failed runtime initialization can be retried. Offline preparation caches both encoders, the runtime and the worker without executing a token request.

The displayed token/ID preview uses pages of 2,000 tokens. Counts and copy actions use the full result. No fixed tokenizer text-length cutoff is imposed; browser memory and computation time still bound very large inputs.

## Offline application assets

`scripts/offline-assets-plugin.js` runs during production builds after notice generation. It collects the emitted files and copied public assets, adds the build revision to `index.html`, and emits `offline-sw.js` with canonical relative paths and SHA-256 hashes. The worker itself is managed through browser service-worker registration. `src/offline.js` registers it only in production and mounts a localized footer status with Retry and an explicit update/reload action.

Installation verifies all manifest bytes before the build is ready. A failed new installation removes its incomplete cache and preserves the previous build. Active-cache repair only fetches known assets. Readiness requires a complete cache and a controller whose build matches the page; page visibility/connectivity changes trigger another check. Navigation to the app root or `index.html`, including hash routes, uses the canonical cached index. Queries and visited URL variations never become cache keys. Other origins and generated exports are not cached.

New builds wait while the current application remains open. Explicit update activation checks for other calculator tabs and warns that reloading loses unsaved entries/results. Controller changes do not reload a document automatically. Activation keeps the current and one previous build for old lazy imports during the update transition, pruning only names under this product's scope-specific namespace. Waiting workers can also activate after old pages close. Cache eviction, storage restrictions and site-data clearing can remove offline availability; the status/retry flow does not promise permanent storage. Cached application assets contain no calculator inputs and are independent of the saved electrical profile.

## Data flow and privacy
Form values are read from the active form, passed to pure calculation functions and rendered using DOM node creation and `textContent`. No form values are placed in URLs or sent to an API. Geolocation is requested only from an explicit button click. Clipboard writes are explicit user actions.

Inputs remain in page memory by default. The electrical profile is the explicit persistence exception described below and in [PRIVACY.md](../PRIVACY.md); customer estimate fields are not part of its serialized schema.

## Build and test
- `npm ci`
- `npm test`
- `npm run build`
- `npm run dev`

Vite emits the canonical third-party notice text into the production bundle and serves the same notice during development.

Production output is `dist/`. The verification and Pages workflows both install Chromium and require its executable before running the full test suite; the Pages upload/deploy depends on its test/build job. `tests/offline.test.js` covers manifest integrity, worker/cache/client lifecycle, failure/retry and a production fresh-context offline-first-use browser scenario. Browser checks are explicitly skipped locally if Chromium is absent; such a run is not browser verification. Candidate-specific CI and published-site receipts belong in [project status](PROJECT_STATUS.md).


## Expanded local utilities
- Time-zone conversion uses the bundled `@js-temporal/polyfill@0.5.1` for explicit DST disambiguation plus native `Intl.DateTimeFormat` and the browser's IANA data; ambiguous fall-back times choose the earlier instant and are flagged, while nonexistent spring-forward times are rejected.
- Currency conversion uses a static, editable ECB EUR-base snapshot dated 4 November 2026. No request is made when calculating.
- Password generation uses `crypto.getRandomValues`. Checking strength executes a separate local `zxcvbn@4.4.2` chunk; viewing the tool or generating a password does not execute the model. Offline preparation downloads/caches its script in advance. The wrapper accepts up to 128 Unicode code points and returns only score/pattern metadata; inputs are never persisted or transmitted. Hashes use `crypto.subtle.digest` for SHA-1/SHA-256 and a local MD5 compatibility implementation.
- QR code generation is bundled with `qrcode-generator` and creates a local data URL for preview/download.
- Hashing reads an explicitly selected file fully into memory (25 MB limit) or text. No file contents are transmitted.
- JSON uses `src/json-client.js` / `src/json-worker.js` with the shared cancellable worker client. Native parsing validates the input, then token-preserving formatting retains numeric tokens, duplicate object members and string escapes. `src/json-task.js` limits input to 5,000,000 UTF-16 code units and output to 10,000,000, with a conservative pretty-print expansion bound checked before formatting.
- Statistics in `src/statistics.js` accepts up to 250,000 finite values and 5,000,000 UTF-16 code units. Compensated/scaled arithmetic avoids common overflow and cancellation failures; unrepresentable outputs are rejected.
- Water estimates expose an editable positive base range and activity/climate factors plus an additive mL adjustment. Holiday countdowns derive today's calendar date with `Intl.DateTimeFormat` in the selected IANA zone, display that reference date/zone, and calculate whole calendar-day differences. See [data assumptions](DATA_SOURCES.md).

## Electrical state, saved profiles and exports

The electrical interface keeps applied devices, unfinished builder edits, planning settings and customer-estimate fields in its own in-memory state. **Save** writes only the validated applied devices/settings/extensions into one `localStorage` slot. **Load** reads and validates that slot before replacing the current profile; version-one records are normalized to the current schema in memory without rewriting storage. **Delete** removes only that slot. The storage module performs no browser storage access on import, and saving/loading are explicit actions rather than autosave or automatic restoration.

Device labels are included in saved profiles and CSV exports. Unfinished builder edits and customer contact/billing fields are excluded from the persisted profile; customer fields are also excluded from CSV. Customer print/PDF output is built from the current validated estimate, includes the entered customer details, and uses the browser's print workflow. CSV downloads use a generated local Blob URL. Storage/validation failures are reported without treating invalid saved data as a successful load. See the [electrical calculation contract](ELECTRICAL_LOAD_CALCULATOR.md) for numerical and estimate limitations.

## Interaction state

`src/bac-gate.js` uses a native modal dialog to gate the educational BAC form. `src/form-errors.js` maps confirmed validation failures to inputs and manages ARIA description links without overwriting existing help IDs; ambiguous/runtime failures remain form-level. Editing input invalidates pending calculation requests so stale errors cannot attach to newer values. Shared calculator forms are recreated on reset, routing or language change; the electrical interface manages its separate state and preserves unfinished edits across language changes. The shared formatter in `src/format.js` offers an explicit scientific fallback for nonzero values that would otherwise round to zero.
