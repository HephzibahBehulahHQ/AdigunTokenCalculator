# Design decisions — AdigunTokenCalculator

**Owner decisions confirmed:** 2026-11-04.

## Confirmed
1. Division: HB Artificial Intelligence; violet `#A78BFA`.
2. Full interface language support: English, German, Yoruba and Nigerian Pidgin for all 38 tools.
3. System-font fallback until official typography is supplied.

## Verified design identity
Corporate tokens: midnight navy `#0B1220`, metallic gold `#D4AF37`, royal blue `#2563EB`, ivory `#F8FAFC`, slate `#64748B`; AI division accent violet `#A78BFA`. Naming hierarchy is Hephzibah Behulah → HB Artificial Intelligence → AdigunTokenCalculator. Canonical design files do not define a complete spacing/type/radius/shadow/component system; initial CSS uses explicit product-level values, not claimed canonical tokens. The header uses the exact approved corporate artwork copied byte-for-byte from the design-system repository at inspected revision `52f01f9986d97088413ca9785bc7a2d3f2967123`; provenance is recorded in `docs/LICENSING.md`.

## Architecture and privacy
Static Vite + semantic HTML + CSS + vanilla JS. All calculations run in-browser. No backend, analytics, telemetry, remote logging, third-party calculation API or runtime CDN. User input is rendered through DOM APIs and textContent.

## Tokenizer dependency
Pinned dependency: `js-tiktoken@1.0.21`, MIT declared by npm. Lite rank imports keep only `cl100k_base` and `o200k_base` in the product source. Model mappings were checked against OpenAI's upstream tiktoken model table and Cookbook: GPT-4o / GPT-4o mini → `o200k_base`; GPT-4 / GPT-3.5 Turbo → `cl100k_base`. Automated tests cover Unicode inputs and UTF-8 piece reconstruction. The byte-piece adapter still relies on the pinned package's internal byte map because no public per-token byte method is exposed; that implementation detail remains a documented maintenance risk.

## Data restraint
The world population tool uses two dated 1 July UN WPP 2024 medium-variant baselines and labels its linear interpolation/extrapolation as an estimate, not a live count. The direct downloadable dataset and checksum comparison for the 2025/2026 numeric rows remains a release check. Births, deaths and CO₂ remain withheld until separately sourced daily baselines are verified. Religion shares are seeded from the cited Pew 2020 estimates, are editable, and retain the Pew “other religions” aggregation; no unsupported folk-only share is invented.

## Licensing
No project-wide product licence has been authorized; no root `LICENSE` file is added until the owner chooses one. Third-party notices are included for `js-tiktoken@1.0.21` (MIT), `qrcode-generator@2.0.4` (MIT) and the development-only `playwright-core@1.57.0` (Apache-2.0). The corporate logo is copied byte-for-byte from the approved canonical design-system asset, with source revision and provenance recorded in `docs/LICENSING.md`.

## Release gates
Automated lockfile installation, 57 unit/browser tests, Chromium smoke test and production build pass on the current feature branch. The approved logo asset is integrated. Remaining gates are fluent translation review, manual keyboard/screen-reader/responsive/contrast/offline checks, direct UN WPP downloadable-file verification with checksum, and an owner decision on the project-wide licence. The owner has explicitly authorized completion, merge and deployment; the expanded feature branch is not yet merged or deployed.


## Completion milestone decisions
- The world dashboard now shows only a rounded, linear population estimate derived from UN WPP 2024 medium-variant 1 July 2025 and 1 July 2026 values. It is labelled an estimate, not live data; births, deaths and CO₂ remain omitted until independently sourced baselines are established.
- Religion demographics starts with Pew Research Center's 2020 estimates (published 9 June 2025). The Pew "other religions" category includes folk/traditional and smaller traditions; the app does not fabricate a separate folk-religion share. Users can edit category labels and percentages.
- Qibla geolocation is requested only after a deliberate button click; coordinates remain in-page.
- Imperial fuel calculations distinguish US mpg/US gallons from Imperial mpg/Imperial gallons. GPA percentage mode reports a weighted percentage and does not convert it into GPA.
- The tokenizer's UTF-8 piece reconstruction adapter remains pinned to js-tiktoken 1.0.21 internal byte-map behaviour because this version does not expose a public per-token-byte method. It fails closed if the map is unavailable.
- The approved corporate logo is now integrated byte-for-byte from the canonical design-system asset and its provenance is recorded. The project-wide licence remains an owner decision; no root LICENSE is added until that decision is explicit.


## Reference audit record

Inspected authoritative repositories at immutable revisions:

- **Corporate conventions:** [HephzibahBehulahHQ.github.io](https://github.com/HephzibahBehulahHQ/HephzibahBehulahHQ.github.io/tree/bd116504412b37105166805018f64a6e7bbe3cde), revision `bd116504412b37105166805018f64a6e7bbe3cde`. Inspected `AGENTS.md`, `README.md`, `docs/repository-scope.md` and `index.html`. The repository is the public corporate site; product code remains in this repository.
- **AI-related patterns:** [hb-artificial-intelligence](https://github.com/HephzibahBehulahHQ/hb-artificial-intelligence/tree/4d4eb7e9108f88f6a406cec52e3e9a551eb09bdd), revision `4d4eb7e9108f88f6a406cec52e3e9a551eb09bdd`. Inspected `AGENTS.md`, `README.md` and `docs/responsible-technology-guidance.md`; applied transparent capability claims, local-first data handling and human review for consequential uses.
- **Design system:** [hb-design-system](https://github.com/HephzibahBehulahHQ/hb-design-system/tree/52f01f9986d97088413ca9785bc7a2d3f2967123), revision `52f01f9986d97088413ca9785bc7a2d3f2967123`. Inspected `AGENTS.md`, `README.md`, `tokens/corporate.json`, `tokens/brands.json`, `docs/brand-and-product-naming.md`, `templates/universal-product/README.md`, `templates/universal-product/product.config.json`, `assets/corporate/README.md` and the exact approved corporate logo. `README_AI.md` and `SYSTEM_PROMPT.md` were not present at this revision. The approved logo is copied byte-for-byte; product-specific colours, spacing, typography fallbacks and components are recorded above rather than claiming an undocumented canonical component library.
- **AI governance:** [hb-AI-policy](https://github.com/HephzibahBehulahHQ/hb-AI-policy/tree/d42d4e04ac6ab77ebafa1d4fccb724a4dde8d02e), revision `d42d4e04ac6ab77ebafa1d4fccb724a4dde8d02e`. Inspected `AGENTS.md`, `README.md`, `docs/policy-index.md`, `policies/governance.md`, `policies/security-and-approvals.md`, `policies/quality-and-testing.md`, `policies/checkpoint-and-recovery.md`, `policies/model-and-token-efficiency.md`, `policies/cloud-execution.md`, `policies/multi-agent-collaboration.md`, `standards/continuation-and-reporting.md`, `standards/repository-ownership.md` and `templates/product-AGENTS.md`. BAC policy review found no categorical prohibition; the product adds mandatory educational-use acknowledgement and a no-driving warning.

The policy pin in `AGENTS.md` is unchanged. Product code, tests, runtime and deployment remain owned by this repository. No reference repository was modified.
