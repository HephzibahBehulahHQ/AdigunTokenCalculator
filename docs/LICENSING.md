# Licensing status

No owner-approved project-wide licence exists. Do not add a root `LICENSE` or imply reuse permission for the complete application until the owner chooses a licence.

The direct tokenizer dependency is `tiktoken@1.0.22`, declared MIT. The browser bundles its Lite WebAssembly binary and only the `cl100k_base` and `o200k_base` encoder data. The published npm package does not include a licence file, so the complete MIT notice is preserved from [upstream revision `4c8b748e07992c00386f3180af5c574b27b65139`](https://github.com/dqbd/tiktoken/blob/4c8b748e07992c00386f3180af5c574b27b65139/LICENSE), the revision identified by the package metadata. The former `js-tiktoken` and its `base64-js` dependency have been removed.

The locally bundled QR generator is `qrcode-generator@2.0.4`, declared MIT. The optional password-strength model is `zxcvbn@4.4.2`, MIT. The browser test runner is `playwright-core@1.57.0`, declared Apache-2.0. Time-zone conversion uses `@js-temporal/polyfill@0.5.1` (ISC) and `jsbi@4.3.2` (Apache-2.0). Full licence texts and the complete lockfile inventory are recorded in `THIRD_PARTY_NOTICES.md`. The committed lockfile records all 70 dependency packages, including optional platform-specific build packages, and their declared SPDX licence metadata; the current tree reports MIT, ISC, BSD-3-Clause and Apache-2.0 declarations with no missing licence fields. Each dependency retains its own licence. The build includes the complete notices as `THIRD_PARTY_NOTICES.txt`, linked from the site footer.

The corporate logo is copied byte-for-byte from the approved design-system asset `hb-design-system/assets/corporate/hephzibah-behulah-official.jpg` at revision `52f01f9986d97088413ca9785bc7a2d3f2967123`, following the design-system one-logo and exact-artwork rules. It is stored at `assets/hephzibah-behulah-official.jpg`; do not alter or replace it.


Data attributions: DAI iDAI.gazetteer Kaaba coordinate (CC BY; attribution recorded in THIRD_PARTY_NOTICES.md) and ECB euro reference-rate snapshot (4 November 2026; informational reference data).
