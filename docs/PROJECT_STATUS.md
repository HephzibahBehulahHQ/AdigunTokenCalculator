# Project status — AdigunTokenCalculator

## Cross-site template work — 24 November 2026

- Current local branch: `codex/token-calculator-adigun-bot`, based on verified `origin/main` at `f95080745af3fb8bb05d7073371ca5fc7eb70e60`.
- Added a floating Adigun BOT for TokenCalculator with EN/DE/Yoruba/Nigerian Pidgin UI; the selected app language is followed. The backend sends a product-scoped request to the Cloudflare Workers AI binding only after the visitor checks explicit consent and types a message. It does not send calculator state, account data, files or saved work. It fails closed without the AI/rate-limit bindings and applies same-origin, body/message-size, role and IP-rate bounds.
- Added the approved compact company footer links after reading the current AdigunSPs `src/brand.js`: company website and its Facebook, X, Instagram, TikTok and LinkedIn destinations. Added a small localized Help & docs dialog. Corrected the privacy wording in all four interface locales and `PRIVACY.md` so that the optional AI chat is disclosed accurately.
- `node --test tests/product-bot.test.mjs tests/product-bot-browser.test.mjs`: **5 passed** using installed system Chrome. Browser acceptance verified explicit consent, only typed chat payload, German language synchronization, help dialog and 375px layout. `npm run build` passed. `npm test`: **277 passed, 12 skipped, 0 failed**; skipped checks depend on the missing Playwright-managed browser. `wrangler.toml` parsed successfully with Python `tomllib`; `git diff --check` passed.
- No worker was deployed, no Cloudflare model request was sent, and no Supabase, secret, account, domain or production setting was changed. Live AI availability/cost depends on the hosting account and is **NOT TESTED**. Existing product account UI remains behind its existing `VITE_PRODUCT_ACCOUNTS` preview flag; it was not enabled in production.
- The app's OTP worker calls shared Supabase Auth and does not select a product-specific email template. Product-named OTP delivery still needs an authenticated custom send-email hook/provider or equivalent verified shared-project configuration. Do not claim this checkpoint fixes OTP branding, account readiness or all-site adoption.
- This is still an uncommitted local feature branch; no PR, merge or deployment has been made.

### Next bounded action

Review the diff, commit and push this scoped branch, then let its CI verify the exact candidate. Continue the cross-repository audit afterward; full template adoption remains open.

## Master-prompt completion

- Scope: all original 18 calculators, the 20-tool addendum and shared implementation/documentation requirements in [MASTER_PROMPT.md](../MASTER_PROMPT.md). The owner-authorized electrical-load tool is preserved, bringing the application to 39 tools.
- Implementation: the full requirement audit's identified technical gaps are implemented. [SPEC_COMPLIANCE.md](SPEC_COMPLIANCE.md) maps each requirement to code, tests and deliberate scope limits. Source coverage and release verification are separate gates.
- Current continuation: [PR #21](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/21), branch `codex/final-release-verification`. The final bounded review found one remaining form defect: a valid 100% forward discount was blocked. The fix accepts the full forward range, preserves the reverse-mode exclusion of 100%, and associates that error with the discount input. The PR is the authoritative receipt for the exact candidate, Chromium/build outcome, merged revision, Pages deployment and live asset/behavior checks. A local pass with skipped browser checks does not establish full verification.
- Release rule: merge under the owner's standing authorization only after the exact candidate passes the full gate. Pages independently requires Chromium, tests and build before publication. Verify the actual deployed revision; do not infer publication from a passing pull-request test.
- Automated live gate: CI tests `scripts/verify-deployment.mjs` against the production preview. After deployment, Pages downloads the same run's artifact and verifies live file hashes, all 39 synthetic tool workflows, both encodings, four-language navigation, narrow reflow and browser/privacy checks. The linked PR records whether those gates actually passed for this release.
- Human/owner work remains: assistive-technology/accessibility and target-browser review; fluent-speaker review of German, Yoruba and Nigerian Pidgin, including sensitive explanatory content; the owner's project-wide licence choice. Manual and source/content review notes remain explicit in [TEST_PLAN.md](TEST_PLAN.md) and [SOURCES.md](../SOURCES.md).
- Baseline verification: PRs #19 and #20 are merged. Main `fd18435830026893ec23d0346a24d13f756660ea` passed [CI](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42056196041) with 313 tests and no failures/skips. The [Pages run](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/actions/runs/42056196046) built successfully and confirmed Actions as the publishing source, but its first two deployment attempts timed out. PR #21 supersedes this baseline for current release verification.
- Previous verified deployment: main `1ea5f1ad3519c32e609087725087a1d2a7d226bc`, [PR #18](https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator/pull/18). Its 242 passing tests and deployment receipts verify that earlier tip-rounding release only; a reachable older site does not establish publication of the new release.

## Historical records

Earlier checkpoints are preserved in [PROJECT_HISTORY.md](archive/PROJECT_HISTORY.md). They are historical snapshots and do not override later release receipts.
