# Design and organisational decisions — AdigunTokenCalculator

**Audit date:** 2026-11-04  
**Product specification:** [MASTER_PROMPT.md](MASTER_PROMPT.md)  
**Audit branch:** `codex/milestone-0-audit`

## 1. Repository baseline

Target repository: [HephzibahBehulahHQ/AdigunTokenCalculator](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator)

- Default branch: `main`.
- Baseline revision: `1551e3d51d296a8d19b469db1f8bb8d2d6f46736`.
- Existing tracked files at baseline: `MASTER_PROMPT.md` and a minimal `README.md`.
- No application source, package manifest, tests, `AGENTS.md`, deployment workflow or project documentation existed at baseline.
- GitHub repository metadata reported Pages disabled (`has_pages: false`); no deployment is claimed.
- The initial commit and master-prompt commit were inspected. No existing application work or user changes were present in the repository tree.
- A dedicated audit branch was created from `main`; no changes were made to `main`.

## 2. Organisational references inspected

| Reference | Inspected revision | Relevant findings |
| --- | --- | --- |
| [Corporate website repository](https://github.com/HephzibahBehulahHQ/HephzibahBehulahHQ.github.io) | `bd116504412b37105166805018f64a6e7bbe3cde` | Corporate identity, five-division structure, repository boundaries and branch/PR expectations. Product code belongs in the product repository. |
| [AI division repository](https://github.com/HephzibahBehulahHQ/hb-artificial-intelligence) | `4d4eb7e9108f88f6a406cec52e3e9a551eb09bdd` | Responsible technology guidance: privacy, protect sensitive data, evaluate AI outputs, human oversight for consequential decisions; no unverified capability claims. |
| [Design system](https://github.com/HephzibahBehulahHQ/hb-design-system) | `52f01f9986d97088413ca9785bc7a2d3f2967123` | Canonical corporate tokens, approved assets, naming rules, product template and Adigun BOT standards. |
| [AI engineering policy](https://github.com/HephzibahBehulahHQ/hb-AI-policy) | `d42d4e04ac6ab77ebafa1d4fccb724a4dde8d02e` | Policy HB-AI-ENGINEERING-001 v2.0: bounded milestones, secure scoped changes, recovery checkpoints, verification evidence and truthful reporting. |

### Files and standards read

- Corporate: `AGENTS.md`, `README.md`, `docs/repository-scope.md`.
- AI division: `AGENTS.md`, `README.md`, `docs/responsible-technology-guidance.md`.
- Design system: `AGENTS.md`, `README.md`, `tokens/corporate.json`, `tokens/brands.json`, `docs/brand-and-product-naming.md`, `templates/universal-product/README.md`, `templates/universal-product/product.config.json`, `components/AdigunBot/README.md`, `assets/corporate/README.md`.
- AI policy: `AGENTS.md`, `README.md`, `docs/policy-index.md`, `policies/governance.md`, `policies/model-and-token-efficiency.md`, `policies/checkpoint-and-recovery.md`, `policies/security-and-approvals.md`, `policies/quality-and-testing.md`, `policies/cloud-execution.md`, `standards/continuation-and-reporting.md`, `standards/repository-ownership.md`, `templates/product-AGENTS.md`.

The design-system root does not contain `README_AI.md` or `SYSTEM_PROMPT.md`; these were not available to inspect. Its current root structure contains `AGENTS.md`, `README.md`, `assets/`, `components/`, `docs/`, `templates/` and `tokens/`.

## 3. Applicable design identity and UI conventions

### Verified tokens

From `hb-design-system/tokens/corporate.json`:

- Midnight navy: `#0B1220`
- Metallic gold: `#D4AF37`
- Royal blue: `#2563EB`
- Ivory: `#F8FAFC`

The corporate website also documents slate grey `#64748B` as a secondary colour. The approved Artificial Intelligence division accent is violet `#A78BFA`, but this product's division assignment is not confirmed.

### Naming and shared layout

The naming standard defines the hierarchy **Hephzibah Behulah → Division → Adigun[Product]**. It requires one approved corporate logo in the header, a text product wordmark, a textual division label, and no competing product/division logos. The exact approved corporate image exists at `assets/corporate/hephzibah-behulah-official.jpg`; its asset README says to use the exact supplied artwork and not generate a substitute. The product template describes the configuration contract, not a ready-made UI package.

The naming standard requires complete support for English (`en`), German (`de`), Yoruba (`yo`) and Nigerian Pidgin (`pcm`). It also describes a shared header/footer and optional Adigun BOT; BOT must remain disabled unless a real, documented product adapter and capability exist.

### Gaps in the canonical design system

The inspected current design-system files provide the corporate and division colour tokens, but do not define a complete product-ready typography scale, spacing scale, radius/shadow system, component CSS package or responsive breakpoints. No official font file was present in the inspected asset directory. Do not invent official typography or claim a packaged component library exists. Use a documented product-level implementation only after the owner resolves the product identity and language decisions.

## 4. AI governance, privacy and quality requirements

The master prompt adopts organisational governance as authoritative. Product repository instructions pin HB-AI-ENGINEERING-001 v2.0 to `d42d4e04ac6ab77ebafa1d4fccb724a4dde8d02e`.

Applicable requirements include:

- Keep application code, product data, tests and deployment workflows in this product repository; keep shared policy and visual standards in their canonical repositories.
- Preserve user work; use dedicated branches, reviewable pull requests, scoped commits and normal fast-forward synchronization. Never force-push.
- Do not commit credentials, secrets or unrelated/private files.
- Keep calculator inputs local; do not add telemetry, remote logging, third-party calculation APIs or runtime CDN dependencies contrary to the product specification.
- Use safe DOM APIs and avoid unsafe dynamic code execution.
- Test meaningful user flows, invalid inputs, failure cases, keyboard/focus use, labels, contrast, responsive layouts and relevant privacy behavior.
- Distinguish saved, remotely synchronized, verified, integrated, deployed and complete states. Report only observed evidence; mark unrun checks **NOT TESTED**.
- Evaluate AI-generated information before consequential use and retain human oversight for important automated decisions. Do not imply that this browser-only calculator has a live AI service.

No exact mandatory privacy disclaimer wording was found in the inspected AI policy. Product-specific notices in the master prompt should be presented as product requirements, not quoted as policy language.

## 5. Licensing and asset reuse

- The target repository has no `LICENSE` file at baseline; do not infer an open-source licence.
- The inspected design-system and corporate repository roots do not expose a general software licence. The official corporate image is identified by the design-system asset guidance as supplied artwork, but a separate licence grant was not found.
- Use the official image only as the exact approved asset and retain its provenance; do not fabricate a logo or copy unrelated assets. Record any additional reuse decision before redistributing third-party code, fonts, data or imagery.
- Check the tokenizer package and its bundled encoding-data licences before selecting and bundling a dependency. Do not add a project `LICENSE` until the owner confirms the intended licence.

## 6. Product decisions and unresolved owner questions

### Decision A — product division

**Unresolved:** the master prompt does not name a division. The repository is a general-purpose calculator suite with an AI tokenizer, but the corporate design standard requires a division label and division accent. Confirm whether this product belongs to **HB Artificial Intelligence** (violet accent) or another division before applying the division identity.

### Decision B — four-language requirement

**Conflict requiring owner resolution:** the approved naming standard says four languages are mandatory and requires complete translations. The product master prompt specifies English-language tool requirements and describes a language selector only “where implemented”; it does not define translated strings or acceptance tests for four languages. Confirm whether all 18 tools must be fully translated into English, German, Yoruba and Nigerian Pidgin for the first release, or whether a documented phased exception is authorized. Do not ship a selector with incomplete translations.

### Decision C — design-system detail

**Unresolved design input:** the canonical repository does not provide an official font or full spacing/type/component token set in the inspected files. Confirm whether a product-level system-font fallback is acceptable until official typography and component guidance are published.

### Decision D — release and repository permissions

The corporate repository guidance requires a dedicated branch and reviewable PR, and says not to merge or deploy to `main` without authorization. Work is therefore on `codex/milestone-0-audit`; no merge, Pages settings change or deployment has been attempted. Repository metadata reported Pages disabled.

### Explicitly not enabled

Adigun BOT, accounts, cloud storage, external APIs, telemetry and analytics are not required by the master prompt's static-browser architecture. They remain out of scope unless separately authorized and implemented with verified capabilities.

## 7. Proposed milestone sequence

1. Resolve the owner decisions above; preserve the master prompt's milestone order.
2. Confirm product identity, language scope, typography fallback and asset-use basis.
3. Establish the static architecture and accessible directory/navigation shell.
4. Implement and verify the local OpenAI-compatible tokenizer.
5. Implement the original six additional tools; test each pure calculation module.
6. Implement the eleven expanded tools with credible dated data sources and contextual notices.
7. Complete integration, accessibility, privacy and responsive verification.
8. Complete architecture, source, privacy, test and setup documentation; confirm licensing.
9. Configure GitHub Pages only after authorization and verify the actual deployed artifact and every user flow.
10. Perform final release verification against the exact candidate revision.

No visual implementation has started. This audit is the required precondition, not a claim that the application is built or deployed.
