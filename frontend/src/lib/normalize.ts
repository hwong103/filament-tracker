import type { Filament, FilamentDraft, FieldErrors } from "../types/inventory";

export function normalizeText(value: string) {
  return value
    .trim()
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/\s+/g, " ");
}

export function canonicalType(value: string) {
  const cleaned = normalizeText(value);
  const normalized = cleaned.toLowerCase();
  if (normalized === "basic") return "Basic";
  if (normalized === "matte") return "Matte";
  if (normalized === "silk") return "Silk";
  return cleaned;
}

export function canonicalMaterial(value: string) {
  const cleaned = normalizeText(value).toUpperCase();
  const compact = cleaned.replace(/\s+/g, "");
  if (compact === "PLA+") return "PLA+";
  if (compact === "PLA") return "PLA";
  if (compact === "PETG") return "PETG";
  if (compact === "ABS") return "ABS";
  if (compact === "ASA") return "ASA";
  if (compact === "TPU") return "TPU";
  return cleaned;
}

export function normalizeFilament(filament: Filament): Filament {
  return {
    ...filament,
    brand: filament.brand.trim(),
    color: normalizeText(filament.color),
    type: canonicalType(filament.type),
    material: canonicalMaterial(filament.material),
  };
}

export function normalizeDraft(draft: FilamentDraft): FilamentDraft {
  return {
    ...draft,
    brand: draft.brand.trim(),
    color: normalizeText(draft.color),
    type: canonicalType(draft.type),
    material: canonicalMaterial(draft.material),
  };
}

export function validateDraft(draft: FilamentDraft): FieldErrors {
  const errors: FieldErrors = {};

  if (!draft.brand.trim()) {
    errors.brand = "Brand is required.";
  }

  if (!draft.color.trim()) {
    errors.color = "Color is required.";
  }

  if (!draft.type.trim()) {
    errors.type = "Type is required.";
  }

  if (!draft.material.trim()) {
    errors.material = "Material is required.";
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.amount = "Amount must be zero or greater.";
  }

  return errors;
}
