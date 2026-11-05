# Next tasks

1. **Release PR #6:** Confirm the current candidate's CI receipt in the PR description and complete required review. Obtain explicit owner authorization before merging to `main` or deploying, as required by `AGENTS.md`; then verify the GitHub Pages workflow deploys the merge commit.
2. **Live smoke test:** After deployment, open the live site and verify the 38-tool directory, category/search navigation, deep links, representative calculator workflows, tokenizer asset paths and no console/runtime errors.
3. **Population data audit:** Download the official UN WPP 2024 dataset directly, compare the 1 July 2025 and 2026 World / Medium baselines against the code, and record the dataset URL, file revision and SHA-256 checksum. Keep births, deaths and CO₂ withheld until independently sourced.
4. **Human locale review:** Have fluent speakers review all new and existing German, Yoruba and Nigerian Pidgin labels, help text, result labels and sensitive health/safety notices.
5. **Manual accessibility review:** Complete the remaining manual checklist in `docs/TEST_PLAN.md`: keyboard-only navigation, screen reader, focus order, responsive devices, 200% zoom, contrast, offline/network/privacy and all 38 tool workflows.
6. **Owner licence decision:** Select and authorize a project-wide licence before adding a root `LICENSE`. Third-party dependency licences and notices are already inventoried.
7. **Final status:** Record the observed Pages deployment run and the outcomes of the human/data checks in `docs/PROJECT_STATUS.md`. Do not claim production certification while any required manual gate remains untested.
