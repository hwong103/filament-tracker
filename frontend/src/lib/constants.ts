import type { FilamentDraft, OperationStates } from "../types/inventory";

export const LOW_STOCK_THRESHOLD = 0.25;
export const PASSCODE_STORAGE_KEY = "filament_passcode";
export const HIDE_OUT_OF_STOCK_STORAGE_KEY = "filament_hide_out_of_stock";
export const ICON_STROKE_WIDTH = 1.8;

export const EMPTY_DRAFT: FilamentDraft = {
  brand: "",
  color: "",
  type: "",
  material: "",
  amount: 0,
};

export function createInitialOperationStates(): OperationStates {
  return {
    load: { status: "idle", error: null },
    create: { status: "idle", error: null },
    update: { status: "idle", error: null },
    delete: { status: "idle", error: null },
    authVerify: { status: "idle", error: null },
  };
}
