# Plan 003: Correct access and deployment documentation

> **Executor instructions**: Follow this plan step by step. Confirm each
> verification step. Update `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat 11e42b6..HEAD -- README.md`

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW — documentation-only correction.
- **Depends on**: plans/001-multi-select-inventory-filters.md
- **Category**: docs
- **Planned at**: commit `11e42b6`, 2026-06-20

## Why this matters

The README still describes public reads and points the low-stock threshold at
`frontend/src/App.tsx`. Both claims are now false: the Worker protects reads
with `EDIT_TOKEN`, and the threshold is imported from the constants module.
The setup list also repeats numbering. Incorrect access documentation can lead
operators to assume inventory is public or troubleshoot the wrong file.

## Current state

- `README.md:15-20` contains duplicated list number 5.
- `README.md:54-57` says public read access is enabled and names
  `frontend/src/App.tsx` for the low-stock threshold.
- `backend/src/worker.ts:105-115` requires authorization for GET inventory
  requests.
- Locate the actual threshold before writing the final path by searching for
  `LOW_STOCK_THRESHOLD` under `frontend/src`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Find threshold source | `rg -n "LOW_STOCK_THRESHOLD" frontend/src` | one or more source locations |
| Documentation diff check | `git diff --check` | no output, exit 0 |

## Scope

**In scope**:

- `README.md`

**Out of scope**:

- Any code or deployment configuration.
- Documenting the value of `EDIT_TOKEN` or any other credential.

## Git workflow

- Branch: `docs/accurate-tracker-access-notes`
- Use the repo's concise imperative commit style.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Correct the deployment setup sequence

Renumber the Cloudflare setup list in `README.md` so it progresses without a
duplicate number. Keep the existing Worker/D1 deployment architecture and
manual GitHub Actions credential instructions intact.

**Verify**: inspect the rendered Markdown or `sed -n '9,34p' README.md` →
steps progress in order.

### Step 2: Describe the locked-first access model accurately

Replace the public-read claim with a concise explanation that the static app
shell presents an unlock screen and inventory API reads, as well as mutations,
require the shared `EDIT_TOKEN` passcode. Do not describe this as individual
user-account authentication.

Update the low-stock threshold note to point to the exact current constants
file found in the prerequisite search.

**Verify**: `rg -n "Public read|App.tsx|EDIT_TOKEN|LOW_STOCK_THRESHOLD" README.md` →
no stale public-read or App.tsx reference remains; the access and threshold
notes remain present.

### Step 3: Record the completed status

Mark plan 003 as DONE in `plans/README.md`.

**Verify**: `git diff --check` → no whitespace errors.

## Test plan

- No runtime test is required for this documentation-only task.
- Verify every statement against the current Worker source and threshold
  definition before committing.

## Done criteria

- [ ] Setup numbering is correct.
- [ ] README describes protected inventory reads accurately.
- [ ] README points to the real low-stock threshold source.
- [ ] `git diff --check` passes.
- [ ] `plans/README.md` marks plan 003 as DONE.

## STOP conditions

- Stop if the Worker access model changes while this plan is being executed.
- Stop if the low-stock threshold is duplicated in multiple active locations;
  report the ambiguity rather than documenting one arbitrarily.

## Maintenance notes

When authentication changes from one shared passcode to user accounts, rewrite
the access paragraph rather than layering exceptions onto it.
