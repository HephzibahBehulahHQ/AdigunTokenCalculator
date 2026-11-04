# AdigunTokenCalculator — product repository instructions

## Policy adoption

This product adopts **HB-AI-ENGINEERING-001 · v2.0**, pinned to immutable commit `d42d4e04ac6ab77ebafa1d4fccb724a4dde8d02e` in [hb-AI-policy](https://github.com/HephzibahBehulahHQ/hb-AI-policy). Adoption is grounded in the repository's master build prompt, which makes organisational governance authoritative. Do not silently upgrade this pin.

## Product scope

- Product: **AdigunTokenCalculator**; product division is pending owner confirmation.
- Product-owned application code, tests, documentation and deployment workflows remain in this repository.
- Governing product specification: [MASTER_PROMPT.md](MASTER_PROMPT.md).
- Design identity: [hb-design-system](https://github.com/HephzibahBehulahHQ/hb-design-system), pinned for this audit at `52f01f9986d97088413ca9785bc7a2d3f2967123`.
- Division context: [hb-artificial-intelligence](https://github.com/HephzibahBehulahHQ/hb-artificial-intelligence), pinned for this audit at `4d4eb7e9108f88f6a406cec52e3e9a551eb09bdd`.
- One current status: [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).
- Standing scope: scoped documentation, implementation and tests on dedicated feature branches, with reviewable pull requests. Do not merge to `main`, change repository settings or deploy without the applicable owner authorization.
- Feature and release gates are defined by the master prompt and [hb-AI-policy quality requirements](https://github.com/HephzibahBehulahHQ/hb-AI-policy/blob/d42d4e04ac6ab77ebafa1d4fccb724a4dde8d02e/policies/quality-and-testing.md).

## Working rules

Inspect the current branch, remote head and relevant work before editing. Preserve existing work. Keep changes scoped, avoid secrets and unrelated files, and never force-push. Verify the exact remote revision after each checkpoint. Mark unrun checks **NOT TESTED**. Do not claim build, test, integration or deployment success without observed evidence.

Use the pinned policy's checkpoint, security, quality and five-field reporting standards. Resolve the documented product-language and division-identity decisions before visual implementation.
