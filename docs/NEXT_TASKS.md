# Next tasks

1. **Release the continuation:** Run exact-candidate CI for `codex/complete-required-details`, merge under the owner's standing merge/deploy authorization, verify the merge's Pages run and exercise the new features on the live site.
2. **Finish required interaction details:** Add the specified BAC warning modal and associate custom validation errors with their relevant inputs. GPA/age/recipe details and empty-file hashing are in the current release candidate. Keep independently useful changes reviewable and record exact verification receipts in their PRs.
3. **Human locale review:** Fluent speakers review German, Yoruba and Nigerian Pidgin labels, dynamic results and health/safety notices.
4. **Human accessibility review:** Complete the outstanding checklist in `docs/TEST_PLAN.md`, including screen reader, keyboard-only workflows, target devices, 200% zoom and offline/network inspection.
5. **Owner licence decision:** Select and authorize a project-wide licence before adding a root `LICENSE`. All 71 dependency packages have declared licences; complete notices ship with the built site.

Completed: PR #6 through PR #9 merged and deployed; live walkthrough covered all 38 views and the PR #7 color/password/population/variance updates; the official UN population file and notes were verified directly with SHA-256 checksums and reproducible row/unit checks. See `docs/PROJECT_STATUS.md` and `docs/POPULATION_AUDIT.md`.
