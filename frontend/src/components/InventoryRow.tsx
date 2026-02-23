import type { ReactNode } from "react";
import {
  Check,
  Cube,
  Palette,
  PencilSimple,
  Tag,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { FilamentFields } from "./FilamentFields";
import type { FieldErrors, Filament, FilamentDraft } from "../types/inventory";

type InventoryRowProps = {
  layout: "table" | "card";
  filament: Filament;
  lowStockThreshold: number;
  authorized: boolean;
  isEditing: boolean;
  editDraft: FilamentDraft;
  editErrors: FieldErrors;
  onEditDraftChange: (next: FilamentDraft) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  isSaving: boolean;
  deleteConfirming: boolean;
  isDeleting: boolean;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

function AmountBar({ amount }: { amount: number }) {
  const clamped = Math.max(0, Math.min(amount, 1));
  const percent = Math.round(clamped * 100);

  return (
    <div className="amount">
      <div className="amount-bar" aria-hidden="true">
        <div className="amount-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="amount-value">{amount.toFixed(2)}</span>
    </div>
  );
}

function Attribute({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="attribute-value">
      {icon}
      {label}
    </span>
  );
}

function DeleteControls({
  confirming,
  deleting,
  onRequest,
  onConfirm,
  onCancel,
}: {
  confirming: boolean;
  deleting: boolean;
  onRequest: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!confirming) {
    return (
      <button
        className="button danger small"
        type="button"
        onClick={onRequest}
        disabled={deleting}
      >
        <Trash size={14} weight="duotone" aria-hidden="true" /> Delete
      </button>
    );
  }

  return (
    <div className="delete-confirm" role="alert">
      <span>Delete entry?</span>
      <button
        className="button danger small"
        type="button"
        onClick={onConfirm}
        disabled={deleting}
      >
        <Check size={14} weight="duotone" aria-hidden="true" />
        {deleting ? "Deleting..." : "Confirm"}
      </button>
      <button
        className="button ghost small"
        type="button"
        onClick={onCancel}
        disabled={deleting}
      >
        <X size={14} weight="duotone" aria-hidden="true" /> Cancel
      </button>
    </div>
  );
}

export function InventoryRow({
  layout,
  filament,
  lowStockThreshold,
  authorized,
  isEditing,
  editDraft,
  editErrors,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isSaving,
  deleteConfirming,
  isDeleting,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: InventoryRowProps) {
  const lowStock = filament.amount <= lowStockThreshold;

  const colorValue = (
    <Attribute
      icon={<Palette size={14} weight="duotone" aria-hidden="true" />}
      label={filament.color}
    />
  );

  const typeValue = (
    <Attribute
      icon={<Tag size={14} weight="duotone" aria-hidden="true" />}
      label={filament.type}
    />
  );

  const materialValue = (
    <Attribute
      icon={<Cube size={14} weight="duotone" aria-hidden="true" />}
      label={filament.material}
    />
  );

  const actionCell = authorized ? (
    <div className="actions">
      <button
        className="button ghost small"
        type="button"
        onClick={onStartEdit}
        disabled={isSaving || isDeleting}
      >
        <PencilSimple size={14} weight="duotone" aria-hidden="true" /> Edit
      </button>
      <DeleteControls
        confirming={deleteConfirming}
        deleting={isDeleting}
        onRequest={onRequestDelete}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </div>
  ) : null;

  if (layout === "card") {
    return (
      <article className={`mobile-card ${lowStock ? "low-stock" : ""}`}>
        {isEditing ? (
          <div className="card-edit-panel">
            <FilamentFields
              draft={editDraft}
              onChange={onEditDraftChange}
              errors={editErrors}
              idPrefix={`edit-mobile-${filament.id}`}
              compact
              disabled={isSaving || isDeleting}
            />
            <div className="actions">
              <button
                className="button small"
                type="button"
                onClick={onSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
              <button
                className="button ghost small"
                type="button"
                onClick={onCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <dl className="mobile-details">
              <div>
                <dt>Brand</dt>
                <dd>{filament.brand}</dd>
              </div>
              <div>
                <dt>Color</dt>
                <dd>{colorValue}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{typeValue}</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>{materialValue}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>
                  <AmountBar amount={filament.amount} />
                </dd>
              </div>
            </dl>
            {lowStock ? (
              <p className="stock-alert" role="status">
                <WarningCircle size={14} weight="duotone" aria-hidden="true" />
                Low stock
              </p>
            ) : null}
            {actionCell}
          </>
        )}
      </article>
    );
  }

  if (isEditing) {
    return (
      <tr className="row-edit-shell">
        <td colSpan={authorized ? 6 : 5}>
          <div className="row-edit-panel">
            <FilamentFields
              draft={editDraft}
              onChange={onEditDraftChange}
              errors={editErrors}
              idPrefix={`edit-table-${filament.id}`}
              compact
              disabled={isSaving || isDeleting}
            />
            <div className="actions">
              <button
                className="button small"
                type="button"
                onClick={onSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
              <button
                className="button ghost small"
                type="button"
                onClick={onCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={lowStock ? "low-stock" : ""}>
      <td>{filament.brand}</td>
      <td>{colorValue}</td>
      <td>{typeValue}</td>
      <td>{materialValue}</td>
      <td>
        <AmountBar amount={filament.amount} />
      </td>
      {authorized ? <td>{actionCell}</td> : null}
    </tr>
  );
}
