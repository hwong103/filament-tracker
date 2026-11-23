<!-- repo-guardrails:start -->
## Delivery workflow

Delivery uses a topic branch and pull request for the default branch main.

1. Fetch the current default branch before editing.
2. Create a `feat/`, `fix/`, or `chore/` branch for the change.
3. Run the repository's verification commands before publishing.
4. Push the topic branch and open a pull request with runtime and visual evidence where applicable.
5. Wait for checks and user approval, then merge through GitHub.

The pre-push hook rejects local pushes to main. GitHub PR merges use the reviewed commit and remain available.
<!-- repo-guardrails:end -->

## Repository checks

- Install dependencies with `npm ci`, `npm ci --prefix backend`, and `npm ci --prefix frontend`.
- Run the aggregate verification command with `npm run check`.
- The aggregate check covers Git hook setup tests, backend and frontend unit tests, both TypeScript projects, and the frontend production build.
- GitHub Actions runs the same command on Node 22 with read-only repository permissions.
