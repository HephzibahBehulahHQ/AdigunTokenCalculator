# AdigunTokenCalculator — product repository instructions

## Policy adoption
Adopt **HB-AI-ENGINEERING-001 · v2.0**, pinned to `d42d4e04ac6ab77ebafa1d4fccb724a4dde8d02e` in [hb-AI-policy](https://github.com/HephzibahBehulahHQ/hb-AI-policy). Do not silently upgrade this pin.

## Confirmed owner decisions
- Division: **HB Artificial Intelligence**, approved violet accent `#A78BFA`.
- Full UI language scope: English (`en`), German (`de`), Yoruba (`yo`) and Nigerian Pidgin (`pcm`) across all 38 tools.
- Typography: system-font fallback until official typography is supplied.

## Working rules
- Product code, tests and documentation remain in this repository.
- Use dedicated feature branches and reviewable PRs. Do not merge to `main`, change repository settings, configure secrets/domains or deploy without explicit authorization.
- Preserve user work; never force-push. Inspect current branch and remote head before editing.
- No secrets, telemetry, remote logging, external calculation APIs or runtime CDN dependencies.
- Use safe DOM APIs; never evaluate user input as code.
- Test normal, invalid and boundary cases, accessibility, keyboard use, responsive behavior and privacy.
- Mark unrun checks **NOT TESTED**. Never claim build, test or deployment success without observed evidence.
