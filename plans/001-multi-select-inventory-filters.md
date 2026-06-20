# Plan 001: Support multi-select material, finish, and colour filters

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update this plan's status row in
> `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 11e42b6..HEAD -- frontend/src/components/InventoryFilters.tsx frontend/src/lib/inventory.ts frontend/src/lib/inventory.test.ts frontend/src/pages/InventoryPage.tsx frontend/src/pages/InventoryPage.test.tsx frontend/src/styles.css frontend/src/types/inventory.ts`
> If any in-scope file changed since this plan was written, compare the current
> code with the excerpts below. If the filter model or component contract no
> longer matches, stop and report.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — changing filter state affects all inventory result sets.
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `11e42b6`, 2026-06-20

## Why this matters

The filter rail currently lets a user choose only one material, one finish
type, and one exact colour at a time. That makes the primary task—finding a
usable spool among several compatible choices—unnecessarily serial. The
in-stock-only control still exists but is visually relegated below secondary
brand and type selectors, making it appear missing. The final UI should let a
user combine any number of material, finish, and colour chips using OR within
each category and AND between categories, while keeping the in-stock control
visible alongside the main filter controls.

## Current state

- `frontend/src/types/inventory.ts` defines `InventoryFiltersState` with
  singular `material`, `type`, and string `searchColor` fields.
- `frontend/src/lib/inventory.ts:29-58` filters with strict equality for one
  material and type and with one free-text colour search.
- `frontend/src/components/InventoryFilters.tsx:49-110` renders colour and
  material chips, but clicking one replaces the prior selection.
- `frontend/src/components/InventoryFilters.tsx:131-162` keeps finish type in
  a select and puts “In stock only” inside the visually secondary control
  block.
- `frontend/src/pages/InventoryPage.tsx:180-189` determines whether reset is
  available from the same singular filter fields.
- Data is normalized before filtering. Preserve that convention; see
  `frontend/src/lib/normalize.ts:31-48` and do not compare raw API labels.

Current filter logic:

```ts
if (filters.material !== "all" && filament.material !== filters.material) {
  return false;
}

if (filters.type !== "all" && filament.type !== filters.type) {
  return false;
}
```

Existing unit-test style is plain Vitest with a `baseFilters` helper in
`frontend/src/lib/inventory.test.ts`. Existing page tests use Testing Library
and `userEvent` in `frontend/src/pages/InventoryPage.test.tsx`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `cd frontend && npm ci` | exit 0 |
| Unit tests | `cd frontend && NODE_OPTIONS='--localstorage-file=/tmp/filament-tracker-vitest-localstorage' npm run test:run` | all tests pass |
| Production build | `cd frontend && npm run build` | Vite completes with exit 0 |
| Diff validation | `git diff --check` | no output, exit 0 |

## Scope

**In scope**:

- `frontend/src/types/inventory.ts`
- `frontend/src/lib/inventory.ts`
- `frontend/src/lib/inventory.test.ts`
- `frontend/src/components/InventoryFilters.tsx`
- `frontend/src/pages/InventoryPage.tsx`
- `frontend/src/pages/InventoryPage.test.tsx`
- `frontend/src/styles.css`

**Out of scope**:

- `backend/src/worker.ts` and the D1 schema. Filtering is client-side over an
  already authorized inventory response.
- Brand selection. Keep it single-select unless a separate product request
  asks for multi-brand filtering.
- Persisting selected material/type/colour values across browser sessions.

## Git workflow

- Branch: `fix/multi-select-inventory-filters`
- Use concise imperative commit messages, matching existing history (for
  example, `Gate inventory behind passcode and pin filters beside results`).
- Do not push or open a PR unless the operator instructs it.

## Steps

### Step 1: Replace singular chip filter state with arrays

In `frontend/src/types/inventory.ts`, replace the singular material/type fields
and one chip-owned colour value with arrays such as `materials`, `types`, and
`colors`. Keep `searchColor` as free-text search so a user can still find a
colour not represented by a suggested chip. In `emptyFilters()` in
`InventoryPage.tsx`, initialize all arrays empty.

Use the invariant: an empty array means “all values”; never store an `all`
sentinel inside an array.

**Verify**: `cd frontend && npx tsc --noEmit` → exit 0 after all callers are
updated in subsequent steps.

### Step 2: Apply OR-within-category and AND-between-category matching

Update `filterFilaments` in `frontend/src/lib/inventory.ts`:

- when `materials` is non-empty, keep a row if its normalized material is in
  that array;
- when `types` is non-empty, keep a row if its normalized type is in that
  array;
- when `colors` is non-empty, keep a row if its exact normalized colour is in
  that array;
- retain free-text colour matching, applying it in addition to selected
  colour chips;
- retain `hideOutOfStock` behavior exactly: rows with `amount <= 0` are
  excluded when true.

Update `getFilterOptions` only if needed to preserve stable, unique normalized
chip labels. Do not move filtering to the Worker.

**Verify**: `cd frontend && npm run test:run -- src/lib/inventory.test.ts` →
all inventory tests pass.

### Step 3: Make material, finish, and colour chips independently toggleable

In `InventoryFilters.tsx`, add a small local pure helper or inline immutable
array toggle logic. Clicking a selected chip removes it; clicking an unselected
chip adds it. The “All materials”, “All finishes”, and equivalent colour-clear
controls should clear only their own category, not reset other filters.

Replace the finish `<select>` with a visible chip group matching the material
and colour interaction. Use `aria-pressed` on every toggle button and provide
an accessible group label. Keep brand as its existing select.

Move “In stock only / Hide empty spools” into the primary filter surface—next
to or immediately after the material/finish controls—rather than the secondary
brand block. Preserve its labelled checkbox and persisted local-storage
behavior from `InventoryPage.tsx:165-170`.

Update `hasActiveFilters` in both the component and page to test array lengths
as well as the text search and stock toggle. The result count should update
after every chip change.

**Verify**: `cd frontend && npx tsc --noEmit` → exit 0 with no TypeScript
errors.

### Step 4: Preserve the workshop filter-rail layout at every breakpoint

In `frontend/src/styles.css`, reuse the existing `.filter-chip-group`,
`.filter-chip`, and `.checkbox-label` patterns. Keep the desktop filter rail
sticky (`.filter-rail`) and use a wrapping chip group so many selected values
remain usable. On narrow screens, retain the existing one-column stacking.

Do not introduce a modal, a second filter drawer, gradient text, or colored
side stripes. Keep controls large enough to use on touch devices.

**Verify**: `cd frontend && npm run build` → Vite completes successfully.

### Step 5: Add regression tests for selection semantics and controls

Update `frontend/src/lib/inventory.test.ts` to assert:

- two selected materials return rows from either material;
- selected finishes have the same OR behavior;
- selected colours have the same OR behavior;
- an active material/finish/colour selection still combines with the other
  categories and in-stock-only control using AND;
- clearing a category restores all values for that category.

Add a focused component or page test that clicks at least two chips, confirms
both are `aria-pressed="true"`, clicks the in-stock-only checkbox, and confirms
the matching result count or inventory row state changes. Follow the current
`userEvent` pattern in `InventoryPage.test.tsx` and mock passcode verification
before requesting inventory.

**Verify**: `cd frontend && NODE_OPTIONS='--localstorage-file=/tmp/filament-tracker-vitest-localstorage' npm run test:run` → all tests pass.

## Test plan

- Unit tests in `frontend/src/lib/inventory.test.ts` cover all multi-select
  semantics, including empty selections and stock filtering.
- UI test covers toggle/add/remove behavior, `aria-pressed`, and the visible
  in-stock control.
- Use `baseFilters` in `inventory.test.ts` and the authenticated setup sequence
  in `InventoryPage.test.tsx` as the test patterns.

## Done criteria

- [ ] Empty material/type/colour arrays mean “all”; no `"all"` sentinels are
  stored in those arrays.
- [ ] Multiple selected chips use OR within one category and AND across
  categories.
- [ ] Finish types are filterable chips, not a single-value select.
- [ ] “In stock only” remains visible in the primary filter surface and still
  excludes zero-stock rows.
- [ ] Frontend typecheck, tests, build, and `git diff --check` all pass.
- [ ] `plans/README.md` marks plan 001 as DONE.

## STOP conditions

- Stop if the API starts returning unnormalized material/type values at the
  point filters are calculated; investigate normalization first.
- Stop if the change requires modifying the Worker or D1 schema.
- Stop if a necessary interaction cannot be covered with the existing Testing
  Library setup without adding a new test harness; report that dependency.

## Maintenance notes

If a future request adds multi-brand filtering, use the same array invariant
and test matrix rather than introducing a distinct sentinel model. Reviewers
should specifically check that a selected colour chip does not overwrite the
free-text search and that clearing one category does not clear any other.
