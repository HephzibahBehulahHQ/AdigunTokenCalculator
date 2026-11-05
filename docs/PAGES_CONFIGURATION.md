# GitHub Pages configuration

## Required repository setting

This application is built by Vite. The correct Pages deployment artifact is the generated `dist/` directory, published by `.github/workflows/pages.yml`.

In GitHub repository settings, configure:
1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Keep the custom workflow `.github/workflows/pages.yml` as the publisher.

If Source remains set to **Deploy from a branch**, GitHub also runs its generated Jekyll/branch deployment. That deployment can publish the repository's unbuilt Vite source and overwrite the compiled `dist` site. The custom workflow now checks the Pages `build_type` and fails clearly unless it is `workflow`.

## Verification

After changing Source to GitHub Actions:
- Push/merge a commit to `main` or run the **Deploy GitHub Pages** workflow manually.
- Confirm the custom workflow's build and deploy jobs both pass.
- Confirm the published site URL is `https://hephzibahbehulahhq.github.io/AdigunTokenCalculator/`.
- Confirm no generated Jekyll/branch deployment is triggered for the same push.

The `verify-live` job then downloads that run's published artifact and uses `scripts/verify-deployment.mjs` to compare every file's SHA-256 digest with the live site and exercise all 39 tools in Chromium. Its result is part of the release gate, alongside the exact-main test/build and deploy results. CI also runs this verifier against a local production preview before changes are merged.

The current receipt is linked from [PROJECT_STATUS.md](PROJECT_STATUS.md). Do not change Pages settings merely because publication stalls after deployment creation; inspect the failed job and distinguish a service-side timeout from an actual source-setting or permission error.
