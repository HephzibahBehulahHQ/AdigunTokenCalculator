# Project status — AdigunTokenCalculator

## Master-prompt completion

- Scope: all original 18 calculators, the 20-tool addendum and shared implementation/documentation requirements in [MASTER_PROMPT.md](../MASTER_PROMPT.md). The owner-authorized electrical-load tool is preserved, bringing the application to 39 tools.
- Implementation: the full requirement audit's identified technical gaps are implemented. [SPEC_COMPLIANCE.md](SPEC_COMPLIANCE.md) maps each requirement to code, tests and deliberate scope limits. Source coverage and release verification are separate gates.
- Current continuation: [PR #19](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/19), branch `codex/master-prompt-completion`. The PR is the authoritative receipt for its exact candidate, full Chromium/build outcome, merged revision, Pages deployment and live asset/behavior checks. A local pass with skipped browser checks does not establish full verification.
- Release rule: merge under the owner's standing authorization only after the exact candidate passes the full gate. Pages independently requires Chromium, tests and build before publication. Verify the actual deployed revision; do not infer publication from a passing pull-request test.
- Human/owner work remains: assistive-technology/accessibility and target-browser review; fluent-speaker review of German, Yoruba and Nigerian Pidgin, including sensitive explanatory content; the owner's project-wide licence choice. Manual and source/content review notes remain explicit in [TEST_PLAN.md](TEST_PLAN.md) and [SOURCES.md](../SOURCES.md).
- Previous verified deployment: main `1ea5f1ad3519c32e609087725087a1d2a7d226bc`, [PR #18](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/18). Its 242 passing tests and deployment receipts verify that earlier tip-rounding release only.

## Historical records

Earlier checkpoints are preserved in [PROJECT_HISTORY.md](archive/PROJECT_HISTORY.md). They are historical snapshots and do not override later release receipts.
