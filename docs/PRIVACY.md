# Privacy and data handling

The canonical implementation-specific description is [Privacy and data handling](../PRIVACY.md). It covers all 39 tools, local calculation workers, static asset requests, offline application-file caching, explicit geolocation/clipboard actions and the hosting-provider boundary.

Inputs remain in page memory by default. The Electrical Load Calculator's explicit Save/Load/Delete controls manage one browser-local profile containing applied devices and settings. Customer estimate details are excluded from that saved profile and CSV exports, but are included in the user-requested customer print/PDF output. Consult the canonical document for storage, shared-device and export details; this page does not define a separate privacy policy.

The offline cache contains canonical build assets only, including lazy worker/WASM/model files. It does not persist inputs, queries, browsing history or exports. The canonical document also explains readiness/retry, versioned updates, browser eviction and the distinction between cached application files and the optional saved electrical profile.
