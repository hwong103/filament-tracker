import type { FieldErrors, FilamentDraft } from "../types/inventory";

type FilamentFieldsProps = {
  draft: FilamentDraft;
  onChange: (next: FilamentDraft) => void;
  errors: FieldErrors;
  idPrefix: string;
  disabled?: boolean;
  compact?: boolean;
};

export function FilamentFields({
  draft,
  onChange,
  errors,
  idPrefix,
  disabled,
  compact,
}: FilamentFieldsProps) {
  return (
    <div className={`form-grid ${compact ? "compact" : ""}`}>
      <div className="field-block">
        <label htmlFor={`${idPrefix}-brand`}>Brand</label>
        <input
          id={`${idPrefix}-brand`}
          value={draft.brand}
          onChange={(event) => onChange({ ...draft, brand: event.target.value })}
          disabled={disabled}
          aria-invalid={Boolean(errors.brand)}
          aria-describedby={`${idPrefix}-brand-helper ${idPrefix}-brand-error`}
        />
        <p id={`${idPrefix}-brand-helper`} className="field-helper">
          Manufacturer name.
        </p>
        {errors.brand ? (
          <p id={`${idPrefix}-brand-error`} className="field-error" role="alert">
            {errors.brand}
          </p>
        ) : null}
      </div>

      <div className="field-block">
        <label htmlFor={`${idPrefix}-color`}>Color</label>
        <input
          id={`${idPrefix}-color`}
          value={draft.color}
          onChange={(event) => onChange({ ...draft, color: event.target.value })}
          disabled={disabled}
          aria-invalid={Boolean(errors.color)}
          aria-describedby={`${idPrefix}-color-helper ${idPrefix}-color-error`}
        />
        <p id={`${idPrefix}-color-helper`} className="field-helper">
          Common color name used on the spool label.
        </p>
        {errors.color ? (
          <p id={`${idPrefix}-color-error`} className="field-error" role="alert">
            {errors.color}
          </p>
        ) : null}
      </div>

      <div className="field-block">
        <label htmlFor={`${idPrefix}-type`}>Type</label>
        <input
          id={`${idPrefix}-type`}
          value={draft.type}
          onChange={(event) => onChange({ ...draft, type: event.target.value })}
          disabled={disabled}
          aria-invalid={Boolean(errors.type)}
          aria-describedby={`${idPrefix}-type-helper ${idPrefix}-type-error`}
        />
        <p id={`${idPrefix}-type-helper`} className="field-helper">
          Example: Basic, Matte, Silk.
        </p>
        {errors.type ? (
          <p id={`${idPrefix}-type-error`} className="field-error" role="alert">
            {errors.type}
          </p>
        ) : null}
      </div>

      <div className="field-block">
        <label htmlFor={`${idPrefix}-material`}>Material</label>
        <input
          id={`${idPrefix}-material`}
          value={draft.material}
          onChange={(event) =>
            onChange({ ...draft, material: event.target.value })
          }
          disabled={disabled}
          aria-invalid={Boolean(errors.material)}
          aria-describedby={`${idPrefix}-material-helper ${idPrefix}-material-error`}
        />
        <p id={`${idPrefix}-material-helper`} className="field-helper">
          Example: PLA, PLA+, PETG, ABS, ASA, TPU.
        </p>
        {errors.material ? (
          <p
            id={`${idPrefix}-material-error`}
            className="field-error"
            role="alert"
          >
            {errors.material}
          </p>
        ) : null}
      </div>

      <div className="field-block">
        <label htmlFor={`${idPrefix}-amount`}>Amount</label>
        <input
          id={`${idPrefix}-amount`}
          type="number"
          step="0.01"
          min="0"
          value={draft.amount}
          onChange={(event) =>
            onChange({ ...draft, amount: Number(event.target.value) })
          }
          disabled={disabled}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={`${idPrefix}-amount-helper ${idPrefix}-amount-error`}
        />
        <p id={`${idPrefix}-amount-helper`} className="field-helper">
          Decimal value in spool units.
        </p>
        {errors.amount ? (
          <p id={`${idPrefix}-amount-error`} className="field-error" role="alert">
            {errors.amount}
          </p>
        ) : null}
      </div>
    </div>
  );
}
