# Design decisions — AdigunTokenCalculator

**Owner decisions confirmed:** 2026-11-04.

## Confirmed
1. Division: HB Artificial Intelligence; violet `#A78BFA`.
2. Full interface language support: English, German, Yoruba and Nigerian Pidgin for all 18 tools.
3. System-font fallback until official typography is supplied.

## Verified design identity
Corporate tokens: midnight navy `#0B1220`, metallic gold `#D4AF37`, royal blue `#2563EB`, ivory `#F8FAFC`, slate `#64748B`; AI division accent violet `#A78BFA`. Naming hierarchy is Hephzibah Behulah → HB Artificial Intelligence → AdigunTokenCalculator. Canonical design files do not define a complete spacing/type/radius/shadow/component system; initial CSS uses explicit product-level values, not claimed canonical tokens. The corporate logo placeholder is not the official logo; approved exact artwork and provenance remain a release gate.

## Architecture and privacy
Static Vite + semantic HTML + CSS + vanilla JS. All calculations run in-browser. No backend, analytics, telemetry, remote logging, third-party calculation API or runtime CDN. User input is rendered through DOM APIs and textContent.

## Tokenizer dependency
Initial candidate: `js-tiktoken@1.0.21`, MIT declared by npm. Lite rank imports keep only `cl100k_base` and `o200k_base` in the product source. Package maintenance cadence and model-to-encoding claims must be re-evaluated before release. Initial supported model labels: GPT-4o / GPT-4o mini → o200k_base; GPT-4 / GPT-3.5 Turbo → cl100k_base. These mappings require upstream verification and reproducible tests before production claims.

## Data restraint
World-statistics metrics remain withheld until credible dated baselines, units, sources and assumptions are documented. Demographic shares are user-entered; no unsupported global estimates are supplied.

## Licensing
No product licence has been authorized. Include third-party notices for the MIT tokenizer dependency when packaging. Do not infer a licence for corporate artwork.

## Release gates
Generate and inspect lockfile; verify tokenizer mappings and Unicode pieces; obtain fluent translation review; obtain approved logo and asset permissions; complete accessibility, responsive, browser and offline verification; source any world-statistics baselines; obtain explicit deployment authorization.
