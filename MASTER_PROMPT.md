# AdigunTokenCalculator — Master Build Prompt

**Document purpose:** Authoritative execution brief for an AI coding agent building, testing, documenting, and deploying AdigunTokenCalculator.

**Target repository:** https://github.com/HephzibahBehulahHQ/AdigunTokenCalculator  
**Target deployment:** GitHub Pages  
**Application type:** Static, browser-only multi-tool utility  
**Primary implementation:** Semantic HTML, CSS, and JavaScript ES modules. Use a small build tool only where required for reliable dependency bundling.

---

## 1. Agent role and mission

Act as a senior frontend engineer, accessibility specialist, test engineer, technical writer, and careful project maintainer. Build a polished, reliable, secure, accessible, maintainable static web application named **AdigunTokenCalculator**.

The application combines an accurate OpenAI-compatible text tokenizer with a broad suite of practical calculators. It must be suitable for public use and deployment through GitHub Pages.

Work incrementally. First understand the repository and its governing standards; then establish a verified baseline; then implement one milestone at a time. Do not assume that a requirement is already implemented merely because it appears in this prompt. Inspect the actual repository and verify the state of the code.

### Non-negotiable principles

1. Correctness before speed or feature count.
2. Follow the organisation's authoritative policy and design standards.
3. Keep calculations and user-entered content local to the browser.
4. Never expose secrets, credentials, private user data, or API keys.
5. Do not invent organisational requirements, source data, test results, or product capabilities.
6. Preserve existing work and inspect the working tree before making changes.
7. Keep changes small, reviewable, testable, and documented.
8. Use the lowest sufficient reasoning effort and avoid wasteful repeated repository scans.
9. Do not claim deployment or production readiness until independently verified.
10. If requirements conflict, stop and document the conflict rather than silently choosing an interpretation.

---

## 2. Repository audit and authority

Before implementation, inspect the target repository's default branch, directory structure, recent commits, existing files, GitHub Pages configuration, and current working state. Read all applicable instructions such as `AGENTS.md`, `README.md`, and existing project specifications.

Then inspect these organisational reference repositories:

- Corporate conventions: https://github.com/HephzibahBehulahHQ/HephzibahBehulahHQ.github.io
- AI-related patterns: https://github.com/HephzibahBehulahHQ/hb-artificial-intelligence
- Design system: https://github.com/HephzibahBehulahHQ/hb-design-system
- AI governance: https://github.com/HephzibahBehulahHQ/hb-AI-policy

Use the actual current repository contents as the source of truth. Do not rely on memory, assumptions, or this prompt where a governing repository has a more specific current rule.

### Required reference inspection

Inspect the relevant instructions, specifications, and assets in each repository. In the design-system repository, specifically look for and inspect these files if they exist:

- `AGENTS.md`
- `README.md`
- `README_AI.md`
- `SYSTEM_PROMPT.md`
- `tokens/corporate.json`
- `tokens/brands.json`
- `docs/brand-and-product-naming.md`
- `templates/universal-product/README.md`
- `templates/universal-product/product.config.json`

The template may contain values or naming for another product. Reuse its structure and applicable patterns, but adapt product-specific values for AdigunTokenCalculator. Do not copy another product's identity or configuration blindly.

For the AI policy, extract exact applicable requirements for transparency, privacy, disclaimers, data handling, attribution, and responsible AI use. Do not invent or paraphrase a purported mandatory policy statement as a quotation. If the policy does not specify a requirement, label any proposed wording as a project recommendation, not as a policy quotation.

For the design system, extract the actual colour, typography, spacing, border, radius, shadow, layout, button, input, card, navigation, and responsive conventions. Respect the repository's licensing and reuse rules. Prefer consuming an approved package or copying only permitted assets/tokens with attribution, rather than copying an entire stylesheet without checking its licence.

### Authority and conflict handling

Apply the following order:

1. Applicable organisation-wide governance and security policies.
2. Applicable design-system standards and approved product template.
3. Existing repository-specific instructions and accepted architecture.
4. This master prompt's product requirements.
5. Agent judgement for implementation details not specified elsewhere.

If two authoritative sources conflict, do not conceal the conflict. Record the exact sources, explain the impact, and request an owner decision before implementing the disputed requirement. Keep product code and product-specific documentation in this repository; do not make changes to reference repositories unless explicitly authorised.

### Audit deliverable

Create `DESIGN_DECISIONS.md` containing:

- Repositories and files inspected, with links and the inspected revision/commit where available.
- Applicable design tokens and component conventions.
- Applicable AI-policy and privacy requirements, with source links.
- Licensing/reuse decisions for assets and styles.
- Decisions made for this product and any unresolved questions.
- Any deliberate deviations and their justification.

Do not begin visual implementation until this audit is complete.

---

## 3. Product goals and experience

Build a responsive single-page utility application with a clear, searchable, scalable way to access all tools. The interface must feel like a coherent product within the approved organisational design system, not a collection of unrelated demo widgets.

### Navigation

There are 18 tools in the complete requested scope: the original seven tools plus eleven additional tools. Do not lose, duplicate, or miscount any tool.

A flat row of 18 tabs is not acceptable. Use either:

- A searchable calculator directory with grouped categories and dedicated tool panels; or
- A compact primary navigation with grouped calculator categories and accessible sub-navigation.

Preferred categories:

- AI & Text
- Math & Engineering
- Conversion
- Time & Date
- Health & Body
- World & Culture
- Finance

Include a home/directory view, a clear active-tool state, keyboard-accessible navigation, and a way to return to the tool directory. On narrow screens, navigation must remain usable without horizontal overflow.

Every tool must have a clear name, short purpose statement, labelled inputs, visible result, validation feedback, and relevant contextual disclaimer where required.

---

## 4. Functional scope

### 4.1 OpenAI-compatible Token Calculator

**Purpose:** Let users paste or type text and inspect tokenisation for a selected supported model/encoding.

**Implementation requirements**

- Use a maintained JavaScript tokenizer implementation compatible with the required OpenAI encodings, such as `js-tiktoken`, after checking its current documentation, package health, API, and licence.
- Prefer a small production bundle. A build step such as Vite is acceptable if it makes dependency handling reliable.
- Bundle tokenizer code and encoding data locally. Do not make a runtime CDN request to fetch tokenizer code, ranks, or token data.
- Load only encodings actually required by the supported model choices. Lazy-load locally bundled encoding data if this materially improves initial load time.
- Do not claim that a model is supported until its encoding mapping has been verified against authoritative tokenizer documentation or source.
- Keep model names and encoding names distinct in the implementation. Multiple model families can share an encoding.
- Provide a clear fallback/error state if an encoding cannot initialise.

**User interface**

- Large labelled text area.
- Model/encoding selector with understandable descriptions.
- Live token count.
- Character count, with the counting convention stated (for example, Unicode code points or UTF-16 code units).
- Token IDs, presented in a readable, copyable format.
- Visual token segmentation using a restrained, accessible palette derived from approved design tokens.
- Clear, copyable results and a reset/clear action.
- Empty-input state and robust handling of Unicode, emoji, newlines, whitespace, punctuation, and long input.

**Tokenisation correctness**

- Tokenise the exact input string without trimming or normalising it unless the user explicitly requests such a transformation.
- Preserve leading/trailing spaces, repeated spaces, tabs, newlines, punctuation, and Unicode.
- Ensure visual token pieces concatenate to exactly reproduce the original input.
- Use the library's supported API for decoding token IDs back to token byte/text pieces. Do not assume that converting each token ID independently to a Unicode string is always valid; token boundaries can split UTF-8 byte sequences.
- Make the relationship between model selection, encoding, token IDs, and visual pieces explicit.
- Test case-sensitive and whitespace-sensitive examples such as `red`, ` Red`, and ` red`.
- Validate example expectations from the actual tokenizer implementation. Do not hard-code a sample count or token ID unless verified for the selected encoding and library version.

**Accuracy and transparency notice**

Display a concise notice near the result and in documentation explaining that this tool counts text using the selected tokenizer encoding. It is not a complete estimate of an API request's total usage or billing. Actual requests can include message framing, role and tool metadata, images, audio, other modalities, and model-specific processing not represented by plain-text tokenisation.

Do not describe the calculator's count as an exact API bill or universal count across models. Explain that the result is exact for the selected text and encoding only, subject to the tokenizer implementation/version.

### 4.2 Engineering Calculator

Provide:

- Addition, subtraction, multiplication, division.
- Decimal input and negative values.
- Exponentiation and square root.
- Percentage operations with clearly defined semantics.
- Memory functions: M+, M-, MR, MC.
- Clear and backspace.
- Keyboard support where practical.

Handle division by zero, invalid sequences, malformed numbers, repeated operators, square roots of negative values, and overflow with clear messages. Do not use unsafe `eval()` to calculate expressions. Use a safe parser or explicit state machine and test operator precedence if expression parsing is supported.

### 4.3 Wordpedometer / Text Statistics

Provide:

- Word count.
- Character count including spaces.
- Character count excluding whitespace (label the precise rule).
- Sentence count.
- Paragraph count.
- Estimated reading time, using a documented configurable or stated words-per-minute assumption.

Handle empty text, multiple spaces, line breaks, punctuation, abbreviations, emoji, and mixed-language input. Explain that sentence segmentation and reading-time figures are estimates and may vary by language.

### 4.4 Celsius and Fahrenheit Converter

Provide bidirectional conversion:

- Celsius to Fahrenheit: `F = (C × 9/5) + 32`
- Fahrenheit to Celsius: `C = (F − 32) × 5/9`

Validate absolute zero in both units, support decimal precision, and avoid rounding intermediate values unnecessarily.

### 4.5 Age Calculator

Calculate completed years, months, and days between a birth date and the current local date.

- Reject future birth dates.
- Handle leap-day birthdays and differing month lengths.
- Use date-only calendar arithmetic rather than elapsed milliseconds where timezone changes could cause off-by-one errors.
- State which date is used as “today”.
- Test month-end and leap-year boundaries.

### 4.6 BMI Calculator

Support metric and imperial input, with accurate unit conversion. Calculate BMI using kg/m². Validate positive, plausible numeric inputs and handle zero or negative values.

If BMI categories are shown, identify them as general adult screening categories and provide the source. Do not present BMI as a diagnosis or as an adequate individual health assessment. Include a contextual health disclaimer.

### 4.7 Percentage Calculator

Provide three clearly separated operations:

1. Calculate X percent of Y.
2. Calculate X as a percentage of Y.
3. Calculate percentage increase/decrease from an initial value to a final value.

Define the sign convention and handle zero denominators and negative values transparently.

### 4.8 Worldometer-style Estimated Statistics Dashboard

Provide locally calculated, illustrative estimates such as population, births, deaths, and CO₂ emissions based on published annual rates or baseline data.

- No polling or external API requests.
- Record every baseline value, unit, publication date, source, and calculation assumption.
- Calculate estimates from a clearly defined time reference and elapsed time; handle UTC/local-time boundaries consistently.
- Avoid false precision and misleading animation.
- Prominently label every output: **estimate, not live data**.
- Provide source links and methodology in the application documentation.
- If reliable current baseline data cannot be verified, omit that metric rather than inventing a value.

### 4.9 World Religion Demographic Calculator

Allow a user to enter a total population and apply documented approximate global demographic shares for broad categories, including Christianity, Islam, Hinduism, Buddhism, Judaism, folk/traditional religions, unaffiliated, and other.

- Show the source, publication date, methodology, and category definitions.
- Distinguish source-reported figures from user-adjusted percentages.
- Permit editable percentages and show whether the total is below, equal to, or above 100%.
- Do not silently normalise user input.
- Avoid rankings, value judgements, proselytising, or claims that demographic estimates describe individual belief.
- Explain uncertainty, regional variation, and differences between demographic studies.
- Do not invent demographic percentages where a credible source is unavailable.

Use neutral, respectful wording. Include a notice that the tool is an educational demographic calculator, not an endorsement of any belief system.

### 4.10 Contemplative Practice Time Calculator

Use tradition-neutral language. Calculate time spent based on minutes per session and sessions per day or week. Show daily, weekly, annual, and optional lifetime projections.

State assumptions about days per year and duration. Do not infer or prescribe religious practice.

### 4.11 Zakat / Charity Calculator

Provide a mathematical calculator for user-entered asset values, such as cash, gold, silver, and investments, and a user-adjustable rate. A 2.5% default may be offered only with clear explanation that applicability depends on the user's circumstances and religious interpretation.

- Do not issue religious rulings or determine eligibility for a user.
- Do not silently subtract liabilities or apply thresholds unless the user explicitly selects a documented method.
- Show the arithmetic and inputs used.
- Include a prominent notice: mathematical aid only; consult a qualified scholar for religious rulings and personal circumstances.
- Do not transmit financial information.

### 4.12 Approximate Qibla Direction Calculator

Calculate the initial great-circle bearing from user-supplied coordinates to the Kaaba (21.4225° N, 39.8262° E).

- Support manual latitude/longitude entry.
- Optional browser geolocation must only be requested after the user deliberately clicks a clearly labelled button.
- Never request location automatically on page load.
- Explain why location permission is requested and that coordinates are processed locally and not transmitted.
- Validate coordinate ranges.
- Display bearing in degrees and, if practical, a compass direction.
- Explain that the result is an approximate calculated bearing and users may verify it with a trusted local source.

### 4.13 Extended Unit Converter

Support:

- Length: m, km, mi, ft, in.
- Mass: kg, g, lb, oz.
- Volume: L, mL, US gal, US qt (identify US customary units).
- Area: m², ft², acre, hectare.
- Speed: km/h, mph, m/s.
- Digital storage: bit/byte and decimal or binary multiples where offered.

Clearly distinguish decimal SI units (kB, MB, GB) from binary units (KiB, MiB, GiB). Use exact conversion factors where defined, retain adequate internal precision, and round only for display. Validate units and numeric inputs.

### 4.14 Loan / Mortgage Calculator

For fixed-rate loans, calculate periodic payment, total repayment, and total interest from principal, annual interest rate, and term.

- State payment frequency and compounding assumptions.
- Handle zero-interest loans separately.
- Validate non-negative principal/rate and positive term.
- Show the formula and a clear result breakdown.
- An optional first-12-period amortisation view may be included.
- Do not describe the result as a lender quote or financial advice.
- Do not collect or transmit personal financial details.

### 4.15 Date Difference / Countdown

Provide:

- Calendar days between two dates.
- Countdown to a future date.
- Optional recurring annual event countdown.

Use date-only arithmetic and explicitly define whether the start date is included. Handle past dates, leap years, invalid ranges, and year boundaries. Avoid timezone-dependent off-by-one errors.

### 4.16 GPA / Grade Calculator

Provide weighted GPA from course grades and credit values. Support a documented 4.0 scale and percentage mode. If a grade scale is configurable, show the mapping and do not assume that all institutions use the same scale.

Validate missing grades, zero/negative credits, and out-of-range values. Show the weighted calculation and clearly label the selected grading scheme.

### 4.17 Fuel Cost / Trip Calculator

Calculate estimated trip fuel cost from distance, fuel efficiency, and fuel price.

- Support metric and imperial units.
- Clearly distinguish L/100 km from distance-per-volume units such as km/L or mpg.
- State whether mpg is US or Imperial.
- Handle zero distance and invalid/zero efficiency.
- Show fuel quantity and estimated total cost.
- Do not imply that the estimate includes tolls, traffic, vehicle condition, or other trip costs.

### 4.18 Sleep Cycle Calculator

Allow calculation from bedtime or desired wake time using configurable cycle duration and estimated time to fall asleep.

- A 90-minute cycle may be offered as a rough planning assumption, not a scientifically guaranteed duration for every person.
- Make the fall-asleep buffer configurable and visible.
- Avoid medical claims or diagnosis.
- Include a health notice: not medical advice; sleep needs and sleep cycles vary by individual.
- Do not collect or transmit sleep data.

---

## 5. Architecture and implementation

### Preferred approach

Use semantic HTML, CSS custom properties, and vanilla JavaScript ES modules. Use Vite only if required to bundle tokenizer dependencies and encoding assets reliably. Keep the architecture understandable to a beginner and document every build/deployment command.

Do not introduce a backend, database, serverless function, API key, analytics tracker, or external calculation service.

### Suggested structure

Adapt this structure to the repository's existing conventions rather than forcing a rewrite:

```text
AdigunTokenCalculator/
├── index.html
├── package.json                 # only if a build/dependency workflow is used
├── vite.config.js               # only if Vite is used
├── css/
│   ├── design-tokens.css        # approved tokens, with provenance documented
│   └── app.css                  # product-specific composition
├── js/
│   ├── main.js
│   ├── navigation.js
│   ├── shared/
│   │   ├── validation.js
│   │   ├── formatting.js
│   │   └── dates.js
│   ├── tokenizer.js
│   ├── engineering.js
│   ├── wordpedometer.js
│   ├── temperature.js
│   ├── age.js
│   ├── bmi.js
│   ├── percentage.js
│   ├── worldometer.js
│   ├── religion.js
│   ├── contemplative.js
│   ├── charity.js
│   ├── qibla.js
│   ├── units.js
│   ├── loan.js
│   ├── datediff.js
│   ├── gpa.js
│   ├── fuel.js
│   └── sleep.js
├── assets/
├── tests/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA_SOURCES.md
│   └── TEST_PLAN.md
├── DESIGN_DECISIONS.md
├── PRIVACY.md
├── README.md
├── LICENSE                    # only after confirming applicable licence
└── .github/
    └── workflows/
        └── deploy.yml
```

Use a shared application shell and reusable input/result patterns. Keep calculation functions separate from DOM rendering so they can be unit-tested without a browser. Avoid duplicating validation, formatting, date handling, and unit conversion logic.

### Runtime network policy

The calculator features must not send user inputs or calculation data to external services. Do not use API polling. Bundle runtime dependencies and tokenizer data locally. A static site may download its own published HTML/CSS/JS assets from GitHub Pages, but application calculations must not depend on a third-party runtime API or CDN. If any external link is offered as a source or reference, opening it must be an explicit user action.

---

## 6. Privacy, safety, and responsible presentation

The application is designed for local browser-side processing.

- Do not send text, coordinates, health-related inputs, religious demographic inputs, financial inputs, or other calculator values to a server.
- Do not add telemetry, analytics, remote logging, or tracking without explicit owner approval and a policy review.
- Do not store sensitive input in local storage, cookies, or IndexedDB unless there is an approved, documented user benefit and explicit consent. Prefer no persistence by default.
- Do not put user-entered content in URLs, query strings, logs, or error reports.
- Use browser geolocation only after a deliberate user action and permission.
- Use safe DOM APIs such as `textContent`; do not inject untrusted user text with `innerHTML`.
- Avoid unsafe dynamic code execution.
- Ensure all disclaimers are accurate and context-specific.
- Distinguish educational calculations from professional medical, financial, legal, or religious advice.
- Do not claim that an organisational policy requires exact wording unless that wording exists in the policy source.

Create `PRIVACY.md` only after verifying the actual implementation. It must accurately describe what the application does and does not collect, transmit, store, or request. Do not promise “no data is transmitted” if any feature or dependency contradicts that statement.

---

## 7. Design, accessibility, and responsive behaviour

Use the approved hb-design-system tokens and patterns. Do not invent a competing visual language.

Requirements:

- Semantic landmarks and heading hierarchy.
- Explicit labels for every form control.
- Keyboard-accessible navigation and calculator interactions.
- Visible focus indicators.
- Sufficient colour contrast; never communicate token categories or validation state through colour alone.
- Accessible names and status announcements for dynamic results where appropriate.
- Error messages associated with the relevant input.
- Responsive layouts for mobile, tablet, and desktop.
- Respect reduced-motion preferences.
- Avoid unnecessary animation and visual clutter.
- Support browser zoom and text resizing.
- Ensure token visualisation remains readable and preserves whitespace.
- Avoid horizontal overflow at common mobile widths.

Test with keyboard-only navigation and at least one screen-reader-oriented accessibility inspection where tooling is available.

---

## 8. Testing and quality gates

Create a repeatable test strategy before declaring milestones complete.

### Unit tests

Test pure calculation functions for every tool. Include normal, boundary, invalid, and edge cases. At minimum:

- Tokenizer: verified encoding mapping, empty input, whitespace, punctuation, Unicode, emoji, newline, token IDs, and visual-piece reconstruction.
- Engineering: precedence (if supported), chained operations, decimals, negatives, zero division, invalid operations, memory.
- Word statistics: empty string, whitespace-only, punctuation, paragraphs, multilingual text.
- Temperature: freezing point, boiling point, absolute zero, reverse conversion.
- Age/date: leap day, month-end, future date, timezone boundaries.
- BMI: metric/imperial equivalence, zero and negative values.
- Percentage: zero denominator, negative values, increase/decrease sign.
- Worldometer: elapsed-time boundaries, source baseline, UTC handling, estimate labelling.
- Religion: percentages summing below/at/above 100%, user overrides, missing source data.
- Contemplative: daily/weekly conversions and annual assumptions.
- Charity: editable rate, asset totals, invalid values, no unsupported ruling logic.
- Qibla: known coordinate test cases, coordinate validation, permission not requested automatically.
- Units: known conversion pairs, decimal/binary distinction.
- Loan: zero rate, non-zero rate, short and long terms, invalid principal.
- Date difference: leap years, inclusive/exclusive convention, past/future.
- GPA: weighted values, invalid credits, scale boundaries.
- Fuel: metric/imperial equivalence, mpg variants, zero distance/efficiency.
- Sleep: bedtime/wake-time calculations, day rollover, configurable assumptions.

### Integration and browser checks

Verify:

- Every navigation item opens the correct panel.
- Inputs update results correctly.
- Errors are understandable and do not crash the application.
- No unexpected network requests are made by calculator functionality.
- No console errors occur in normal operation.
- Asset and route paths work under the GitHub Pages project subpath.
- The production build succeeds.
- The deployed app behaves like the tested build.

Run focused tests after each tool, then the full suite at milestone boundaries. Do not repeatedly run expensive broad checks when a focused test is sufficient.

### Quality gates

A milestone is complete only when:

1. The implementation matches its acceptance criteria.
2. Relevant automated tests pass.
3. Manual checks for the affected UI pass.
4. Accessibility and privacy implications are reviewed.
5. Documentation is updated.
6. The Git diff has been inspected for accidental changes.
7. The status report accurately records what was and was not tested.

Never report a passing test, successful deployment, or verified URL unless the corresponding action was actually performed and its result observed.

---

## 9. Milestones and deliverables

Complete milestones in order. Do not silently skip a milestone or mark it complete based on partial implementation.

### Milestone 0 — Repository and work-state baseline

- Inspect default branch, existing files, commit history, instructions, and worktree state.
- Preserve existing user work.
- Identify current build/test/deployment status.
- Record risks, blockers, and a baseline.
- Do not overwrite or delete existing project files without inspecting them.

**Deliverable:** concise baseline entry in project status documentation.

### Milestone 1 — Organisational and design audit

- Inspect the four reference repositories.
- Extract applicable policy, design, naming, licensing, and template conventions.
- Record source links and revisions.
- Resolve conflicts or request owner direction.

**Deliverable:** `DESIGN_DECISIONS.md`.

### Milestone 2 — Architecture and application shell

- Confirm static architecture and dependency strategy.
- Establish design tokens and shared styles.
- Build responsive app shell, directory, grouped navigation, tool panels, and footer.
- Implement accessible navigation.

**Acceptance:** shell works across viewport sizes and navigation is keyboard-accessible.

### Milestone 3 — Token calculator

- Integrate the locally bundled tokenizer.
- Verify model/encoding mappings.
- Implement live count, character count, token IDs, visual token pieces, copy, clear, and error states.
- Add accurate scope/limitations notice.

**Acceptance:** test cases match the selected tokenizer implementation and visual pieces reconstruct the original input exactly.

### Milestone 4 — Original calculator set

Implement Engineering, Wordpedometer, Temperature, Age, BMI, and Percentage calculators.

**Acceptance:** each has tested calculation logic, validation, accessible UI, and documented assumptions. Together with the token calculator, this completes the original seven tools.

### Milestone 5 — Expanded calculator set

Implement the eleven additional tools: Worldometer estimates, Religion Demographics, Contemplative Practice Time, Zakat/Charity, Qibla Direction, Extended Unit Converter, Loan/Mortgage, Date Difference/Countdown, GPA/Grade, Fuel Cost/Trip, and Sleep Cycle.

**Acceptance:** all eleven work, use credible documented assumptions/sources, respect privacy, and show contextual disclaimers where appropriate.

### Milestone 6 — Integration, accessibility, and privacy review

- Integrate all 18 tools into the navigation.
- Test responsive behaviour and keyboard accessibility.
- Audit network activity and data handling.
- Verify no user data is transmitted.
- Check all contextual notices and policy language.

**Acceptance:** no known critical privacy, accessibility, navigation, or integration defects remain.

### Milestone 7 — Documentation and licensing

Create or update:

- `README.md`: overview, screenshots if available, live URL only after verified deployment, complete tool catalogue, local setup, build/test commands, architecture, and contribution guidance.
- `DESIGN_DECISIONS.md`: audit findings and design provenance.
- `PRIVACY.md`: verified data-handling behaviour.
- `docs/ARCHITECTURE.md`: modules, data flow, dependencies, and build.
- `docs/DATA_SOURCES.md`: sources, dates, units, assumptions, and methodology for sourced metrics and demographic data.
- `docs/TEST_PLAN.md`: test coverage and manual verification.
- `LICENSE`: only after confirming the owner's intended licence and applicable organisational conventions.

Add a tool catalogue table listing all 18 tools, purpose, notable assumptions, and data sources where applicable.

### Milestone 8 — GitHub Pages deployment

- Confirm repository Pages settings and supported deployment method.
- Prefer a GitHub Actions workflow with least required permissions and a pinned/reliable action version consistent with organisational standards.
- Configure correct project-site base paths.
- Build and test the production artifact.
- Deploy only the intended static output.
- Verify the actual published URL and all tool workflows.
- Do not publish secrets or development artefacts.

Expected URL, subject to actual Pages configuration: https://HephzibahBehulahHQ.github.io/AdigunTokenCalculator/

**Acceptance:** live page loads, assets resolve, all 18 tools function in the deployed environment, and browser console/network checks show no unexpected failures.

### Milestone 9 — Final release verification

- Review all acceptance criteria.
- Run the complete test suite and production build.
- Inspect the final diff and commit history.
- Confirm deployed commit matches the verified source commit.
- Confirm privacy and source documentation match actual behaviour.
- Record remaining known limitations and owner decisions.

**Acceptance:** release evidence is complete. Do not call the application production-ready if any required criterion remains unverified.

---

## 10. Git, deployment, and change management

- Work only in the target product repository unless explicitly authorised otherwise.
- Inspect branch and worktree state before editing.
- Preserve uncommitted work; never discard or overwrite changes without approval.
- Use small, descriptive commits and milestone-sized changes.
- Never force-push or rewrite shared history.
- Do not commit secrets, credentials, local environment files, generated caches, or unnecessary build output.
- Review the diff before every commit.
- Verify the pushed commit SHA and branch.
- Wait for CI and deployment checks to finish; inspect their actual results.
- Do not assume a successful push means a successful deployment.
- Do not alter repository settings or external services unless the task and permissions explicitly authorise it.

If the repository is empty, initialise only the minimum appropriate structure after the audit. If it already contains a project, extend it carefully rather than replacing it wholesale.

---

## 11. Efficient AI-agent operating protocol

The agent must minimise unnecessary context and tool consumption without compromising correctness.

### Session start

1. Inspect branch and working-tree status.
2. Read applicable `AGENTS.md` and repository instructions.
3. Read the concise project status and next-task record.
4. Inspect only the files relevant to the next approved milestone.
5. Check recent relevant commits when needed.
6. Identify the next incomplete milestone and its acceptance criteria.

Do not reread the entire master prompt or unrelated repositories on every task. Keep a concise index of authoritative documents and refer to relevant sections.

### During work

- Use the lowest reasoning effort sufficient for the task.
- Reserve high reasoning for architecture, security, difficult debugging, ambiguous requirements, and release-risk decisions.
- Do not use multiple agents for the same work unless there is a clear independent task and explicit authorisation.
- Avoid repeated full-repository scans and broad searches.
- Prefer targeted file reads and focused diffs.
- Use local scripts for formatting, linting, tests, and mechanical checks.
- Avoid unnecessary dependency installation and repeated build steps.
- Do not ask the user to restate information already present in current project documentation.
- Do not invent progress or pad status updates.

### Session end / checkpoint

Maintain concise, current records in `docs/PROJECT_STATUS.md` and `docs/NEXT_TASKS.md` (or the repository's existing equivalent). Record:

- Current milestone and state.
- What changed, with file paths.
- Tests actually run and their outcomes.
- Commit SHA/branch when committed.
- Deployment/CI evidence where relevant.
- Known defects, blockers, and unresolved decisions.
- Exact next action.

Do not duplicate the full specification in progress records. Link to this master prompt and cite section numbers.

### Operating boundaries

Proceed through work that has been explicitly authorised. Stop and ask the owner before:

- Expanding scope or adding a new feature not specified here.
- Changing the chosen architecture or data-handling model.
- Introducing a backend, analytics, telemetry, external API, or new service.
- Making a policy exception or changing legal/privacy language.
- Deleting or replacing substantial existing work.
- Changing repository settings, secrets, billing, domains, or production infrastructure.
- Making an irreversible or security-sensitive change.

If a milestone is complete and the user has required milestone-by-milestone approval, stop at that boundary. Otherwise continue only within the explicitly authorised scope.

---

## 12. Definition of Done

The project is complete only when all of the following are verified:

- [ ] All 18 specified tools are implemented and accessible.
- [ ] Tokenisation uses verified encodings and produces reproducible results.
- [ ] All calculator logic has unit tests for normal and edge cases.
- [ ] Responsive, accessible navigation and forms work.
- [ ] Approved design-system standards are applied and documented.
- [ ] Privacy statements accurately reflect the implementation.
- [ ] No calculator sends user-entered data to an external service.
- [ ] No calculator depends on runtime API polling or a third-party CDN.
- [ ] Sensitive/policy-relevant tools show appropriate contextual notices.
- [ ] Worldometer and demographic estimates have credible, dated sources and transparent methodology.
- [ ] README, design decisions, privacy, architecture, data sources, and test documentation are complete.
- [ ] Licensing is verified rather than assumed.
- [ ] Production build and full test suite pass.
- [ ] No known critical browser-console errors or broken asset paths remain.
- [ ] GitHub Pages deployment is live and verified.
- [ ] Deployed source commit matches the verified repository commit.
- [ ] Final status clearly distinguishes verified completion from outstanding limitations.

---

## 13. Required status-report format

At each milestone boundary, provide a concise report in this exact structure:

```text
STATUS
- Done: [specific completed work]
- Tested: [commands/checks actually run and results]
- Blocked: [blockers, or None]
- Next: [single next milestone/task]
```

For ongoing work, provide a short checkpoint only when there is meaningful new, verified progress. Do not send repetitive status messages that contain no new information.

The final report must include the live URL (only if verified), final commit SHA, test/build results, known limitations, and any remaining owner decisions.

---

## 14. First instruction to the agent

Begin with **Milestone 0 — Repository and work-state baseline**. Inspect the target repository and all applicable instructions. Do not start building features until the repository audit and organisational reference review are complete. Then create the audit deliverable and report findings, conflicts, risks, and the proposed milestone sequence.

**Do not claim that work is complete merely because this prompt has been read.**
