import type { FormEvent } from "react";
import { PlusCircle } from "@phosphor-icons/react";
import { FilamentFields } from "./FilamentFields";
import type { FieldErrors, FilamentDraft } from "../types/inventory";

type FilamentFormProps = {
  draft: FilamentDraft;
  errors: FieldErrors;
  pending: boolean;
  onDraftChange: (next: FilamentDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  errorMessage: string | null;
};

export function FilamentForm({
  draft,
  errors,
  pending,
  onDraftChange,
  onSubmit,
  errorMessage,
}: FilamentFormProps) {
  return (
    <section className="panel form-panel" aria-label="Add filament">
      <div className="panel-heading">
        <h2>
          <PlusCircle size={18} weight="duotone" aria-hidden="true" /> Add filament
        </h2>
      </div>

      <form onSubmit={onSubmit}>
        <FilamentFields
          draft={draft}
          onChange={onDraftChange}
          errors={errors}
          idPrefix="create"
          disabled={pending}
        />
        <div className="form-actions">
          <button className="button" type="submit" disabled={pending}>
            {pending ? "Adding filament..." : "Add filament"}
          </button>
          {errorMessage ? (
            <p className="field-error" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
