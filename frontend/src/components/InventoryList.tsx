import { ArrowClockwise, SortAscending, SortDescending } from "@phosphor-icons/react";
import { LOW_STOCK_THRESHOLD } from "../lib/constants";
import { InventoryRow } from "./InventoryRow";
import type { FieldErrors, Filament, FilamentDraft, SortField, SortState } from "../types/inventory";

type InventoryListProps = {
  filaments: Filament[];
  loading: boolean;
  authorized: boolean;
  sort: SortState;
  onSort: (field: SortField) => void;
  editingId: number | null;
  editDraft: FilamentDraft;
  editErrors: FieldErrors;
  onEditDraftChange: (next: FilamentDraft) => void;
  onStartEdit: (filament: Filament) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  pendingUpdateId: number | null;
  deleteConfirmId: number | null;
  pendingDeleteId: number | null;
  onRequestDelete: (id: number) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: number) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onRefresh: () => void;
};

function SortButton({
  label,
  field,
  activeSort,
  onSort,
}: {
  label: string;
  field: SortField;
  activeSort: SortState;
  onSort: (field: SortField) => void;
}) {
  const isActive = activeSort.field === field;
  const ariaSort = isActive
    ? activeSort.direction === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <button
      type="button"
      className="sort-button"
      onClick={() => onSort(field)}
      aria-sort={ariaSort}
    >
      {label}
      {isActive ? (
        activeSort.direction === "asc" ? (
          <SortAscending size={14} weight="duotone" aria-hidden="true" />
        ) : (
          <SortDescending size={14} weight="duotone" aria-hidden="true" />
        )
      ) : null}
    </button>
  );
}

function SkeletonRows({ authorized }: { authorized: boolean }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <tr key={`skeleton-${index}`} className="skeleton-row" aria-hidden="true">
          <td>
            <div className="skeleton-line" />
          </td>
          <td>
            <div className="skeleton-line" />
          </td>
          <td>
            <div className="skeleton-line" />
          </td>
          <td>
            <div className="skeleton-line" />
          </td>
          <td>
            <div className="skeleton-line short" />
          </td>
          {authorized ? (
            <td>
              <div className="skeleton-line short" />
            </td>
          ) : null}
        </tr>
      ))}
    </>
  );
}

export function InventoryList({
  filaments,
  loading,
  authorized,
  sort,
  onSort,
  editingId,
  editDraft,
  editErrors,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  pendingUpdateId,
  deleteConfirmId,
  pendingDeleteId,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  hasActiveFilters,
  onClearFilters,
  onRefresh,
}: InventoryListProps) {
  const colSpan = authorized ? 6 : 5;

  return (
    <section className="panel table-panel" aria-label="Inventory">
      <div className="table-header">
        <h2>Inventory</h2>
        <button type="button" className="button ghost small" onClick={onRefresh}>
          <ArrowClockwise size={14} weight="duotone" aria-hidden="true" /> Refresh
        </button>
      </div>

      <div className="desktop-table-wrap">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>
                <SortButton
                  label="Brand"
                  field="brand"
                  activeSort={sort}
                  onSort={onSort}
                />
              </th>
              <th>
                <SortButton
                  label="Color"
                  field="color"
                  activeSort={sort}
                  onSort={onSort}
                />
              </th>
              <th>
                <SortButton
                  label="Type"
                  field="type"
                  activeSort={sort}
                  onSort={onSort}
                />
              </th>
              <th>
                <SortButton
                  label="Material"
                  field="material"
                  activeSort={sort}
                  onSort={onSort}
                />
              </th>
              <th>
                <SortButton
                  label="Amount"
                  field="amount"
                  activeSort={sort}
                  onSort={onSort}
                />
              </th>
              {authorized ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? <SkeletonRows authorized={authorized} /> : null}
            {!loading && filaments.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
                  <div className="empty">
                    <p>No filaments match your filters.</p>
                    <div className="empty-actions">
                      {hasActiveFilters ? (
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={onClearFilters}
                        >
                          Clear filters
                        </button>
                      ) : null}
                      <button type="button" className="button small" onClick={onRefresh}>
                        Reload inventory
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : null}

            {!loading
              ? filaments.map((filament) => {
                  const isEditing = editingId === filament.id;

                  return (
                    <InventoryRow
                      key={`table-${filament.id}`}
                      layout="table"
                      filament={filament}
                      lowStockThreshold={LOW_STOCK_THRESHOLD}
                      authorized={authorized}
                      isEditing={isEditing}
                      editDraft={editDraft}
                      editErrors={editErrors}
                      onEditDraftChange={onEditDraftChange}
                      onStartEdit={() => onStartEdit(filament)}
                      onCancelEdit={onCancelEdit}
                      onSaveEdit={onSaveEdit}
                      isSaving={pendingUpdateId === filament.id}
                      deleteConfirming={deleteConfirmId === filament.id}
                      isDeleting={pendingDeleteId === filament.id}
                      onRequestDelete={() => onRequestDelete(filament.id)}
                      onConfirmDelete={() => onConfirmDelete(filament.id)}
                      onCancelDelete={onCancelDelete}
                    />
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      <div className="mobile-list" aria-live="polite">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <article key={`mobile-skeleton-${index}`} className="mobile-card skeleton-card" aria-hidden="true">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </article>
            ))
          : null}

        {!loading && filaments.length === 0 ? (
          <div className="empty mobile-empty">
            <p>No filaments match your filters.</p>
            <div className="empty-actions">
              {hasActiveFilters ? (
                <button type="button" className="button ghost small" onClick={onClearFilters}>
                  Clear filters
                </button>
              ) : null}
              <button type="button" className="button small" onClick={onRefresh}>
                Reload inventory
              </button>
            </div>
          </div>
        ) : null}

        {!loading
          ? filaments.map((filament) => {
              const isEditing = editingId === filament.id;
              return (
                <InventoryRow
                  key={`mobile-${filament.id}`}
                  layout="card"
                  filament={filament}
                  lowStockThreshold={LOW_STOCK_THRESHOLD}
                  authorized={authorized}
                  isEditing={isEditing}
                  editDraft={editDraft}
                  editErrors={editErrors}
                  onEditDraftChange={onEditDraftChange}
                  onStartEdit={() => onStartEdit(filament)}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={onSaveEdit}
                  isSaving={pendingUpdateId === filament.id}
                  deleteConfirming={deleteConfirmId === filament.id}
                  isDeleting={pendingDeleteId === filament.id}
                  onRequestDelete={() => onRequestDelete(filament.id)}
                  onConfirmDelete={() => onConfirmDelete(filament.id)}
                  onCancelDelete={onCancelDelete}
                />
              );
            })
          : null}
      </div>
    </section>
  );
}
