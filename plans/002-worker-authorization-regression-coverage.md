# Plan 002: Add Worker authorization regression coverage

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. Stop and report instead of improvising if a STOP condition occurs.
> Update `plans/README.md` when finished.
>
> **Drift check (run first)**: `git diff --stat 11e42b6..HEAD -- backend/src/worker.ts backend/package.json backend/package-lock.json`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — test harness configuration can affect the deployment build.
- **Depends on**: plans/001-multi-select-inventory-filters.md
- **Category**: tests
- **Planned at**: commit `11e42b6`, 2026-06-20

## Why this matters

`GET /api/filaments` was recently changed from public access to passcode
protection in `backend/src/worker.ts`, but the backend has no test suite. A
future refactor could accidentally make inventory data public again without a
local verification failure. Add a small Worker-level regression suite that
proves unauthorized reads are rejected and authorized reads continue to work.

## Current state

- `backend/src/worker.ts:105-115` dispatches `GET /api/filaments` and now calls
  `requireAuth` before querying D1.
- `backend/src/worker.ts:64-81` parses a bearer token and returns a 401 JSON
  response for missing or invalid tokens.
- `backend/package.json` has `wrangler` and TypeScript but no test script or
  test dependency.
- Frontend tests are Vitest-based, but they do not execute the Worker.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `cd backend && npm ci` | exit 0 |
| Worker typecheck | `cd backend && npx tsc --noEmit` | exit 0 |
| New Worker tests | `cd backend && npm run test:run` | all tests pass |
| Worker config preflight | `cd backend && npx wrangler deploy --dry-run` | validates config without deploy |

## Scope

**In scope**:

- `backend/package.json`
- `backend/package-lock.json`
- `backend/src/worker.test.ts` (new)
- `backend/src/worker.ts` only if dependency injection is required for tests

**Out of scope**:

- Changing the passcode algorithm or moving away from the existing `EDIT_TOKEN`
  secret.
- Running migrations or deploying production during this test-only task.

## Git workflow

- Branch: `test/worker-authorization-regression`
- Match existing imperative commit style.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Choose the smallest Cloudflare-supported Worker test harness

Use the version-compatible Cloudflare Workers test-pool guidance for the
installed Wrangler version. Add only the test dependencies and scripts needed
to execute the default export in `backend/src/worker.ts` with a mocked D1
binding. Do not duplicate the Worker implementation in tests.

**Verify**: `cd backend && npm run test:run` → test command starts and exits
with a clear pass/fail result.

### Step 2: Add authorization and read-path coverage

Create `backend/src/worker.test.ts` with a minimal mocked `D1Database` whose
prepared query resolves to a known result. Assert all of the following:

- `GET /api/filaments` without Authorization returns 401 and does not invoke
  the D1 query;
- the same route with an invalid bearer token returns 401;
- the route with the configured valid token returns 200 and the expected JSON;
- `OPTIONS /api/filaments` remains a successful preflight response.

Use a synthetic `Env` object in the test. Never put a real production secret in
the test or fixtures.

**Verify**: `cd backend && npm run test:run` → all new tests pass.

### Step 3: Keep deployment compatibility intact

Run the typecheck and dry-run deploy after adding the test tooling. Ensure the
deployment command still builds only the frontend assets and Worker source, not
test files as public assets.

**Verify**: `cd backend && npx tsc --noEmit && npx wrangler deploy --dry-run`
→ both commands exit 0.

## Test plan

- Unauthorized read with no token.
- Unauthorized read with bad token.
- Authorized read with mocked D1 data.
- OPTIONS preflight response.

## Done criteria

- [ ] Backend has an executable test command.
- [ ] All four authorization/read-path cases pass.
- [ ] No real token or D1 identifier is placed in tests.
- [ ] Backend typecheck and dry-run deploy pass.
- [ ] `plans/README.md` marks plan 002 as DONE.

## STOP conditions

- Stop if the selected test harness requires an unsupported Workers runtime or
  a paid Cloudflare feature.
- Stop if mocking D1 requires changing production query behavior.
- Stop if test tooling causes the deploy dry run to package tests as assets.

## Maintenance notes

Whenever a new API route is added, include an authorization test beside it.
Reviewers should ensure tests verify that the D1 query is not called for failed
authorization, rather than only checking the response code.
