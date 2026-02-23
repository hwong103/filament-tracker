import {
  Check,
  Cube,
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

const TYPE_TONES: Record<string, string> = {
  basic: "type-tone-basic",
  matte: "type-tone-matte",
  silk: "type-tone-silk",
};

const MATERIAL_TONES: Record<string, string> = {
  pla: "material-tone-pla",
  "pla+": "material-tone-plaplus",
  petg: "material-tone-petg",
  abs: "material-tone-abs",
  asa: "material-tone-asa",
  tpu: "material-tone-tpu",
};

const COLOR_KEYWORDS: Array<{ token: string; hex: string }> = [
  { token: "black", hex: "#23201d" },
  { token: "white", hex: "#f4f1ec" },
  { token: "grey", hex: "#7d7a76" },
  { token: "gray", hex: "#7d7a76" },
  { token: "red", hex: "#a84e47" },
  { token: "orange", hex: "#c97640" },
  { token: "yellow", hex: "#bfa24f" },
  { token: "green", hex: "#5c7f62" },
  { token: "blue", hex: "#547298" },
  { token: "purple", hex: "#7a6a92" },
  { token: "violet", hex: "#7a6a92" },
  { token: "pink", hex: "#b57c8d" },
  { token: "brown", hex: "#7a5c45" },
  { token: "silver", hex: "#9fa3aa" },
  { token: "gold", hex: "#af8f57" },
];

function toneClass(value: string, map: Record<string, string>, fallback: string) {
  const key = value.trim().toLowerCase();
  return map[key] ?? fallback;
}

function hashColor(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 32%, 56%)`;
}

function colorHex(value: string) {
  const normalized = value.trim().toLowerCase();
  const keyword = COLOR_KEYWORDS.find((entry) => normalized.includes(entry.token));
  return keyword ? keyword.hex : hashColor(normalized);
}

function colorParts(value: string) {
  return value
    .split(/[\/,&]/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function ColorValue({ color }: { color: string }) {
  const normalized = color.toLowerCase();
  const parts = colorParts(color);
  const isSplit = parts.length >= 2;
  const isClear = normalized.includes("clear") || normalized.includes("transparent");
  const isMarble = normalized.includes("marble");
  const isMetal = normalized.includes("metal") || normalized.includes("silver") || normalized.includes("gold");

  const swatchStyle = isSplit
    ? {
        background: `linear-gradient(90deg, ${colorHex(parts[0])} 0%, ${colorHex(parts[0])} 49%, ${colorHex(parts[1])} 51%, ${colorHex(parts[1])} 100%)`,
      }
    : { backgroundColor: colorHex(color) };

  return (
    <span className="color-cell">
      <span
        className={`color-swatch${isClear ? " clear" : ""}${isMarble ? " marble" : ""}${isMetal ? " metal" : ""}`}
        style={swatchStyle}
        aria-hidden="true"
      />
      <span>{color}</span>
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

  const colorValue = <ColorValue color={filament.color} />;

  const typeValue = (
    <span className={`pill-chip type-chip ${toneClass(filament.type, TYPE_TONES, "type-tone-default")}`}>
      <Tag size={14} weight="duotone" aria-hidden="true" />
      {filament.type}
    </span>
  );

  const materialValue = (
    <span
      className={`pill-chip material-chip ${toneClass(
        filament.material,
        MATERIAL_TONES,
        "material-tone-default"
      )}`}
    >
      <Cube size={14} weight="duotone" aria-hidden="true" />
      {filament.material}
    </span>
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
