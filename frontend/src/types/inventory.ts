export type Filament = {
  id: number;
  brand: string;
  color: string;
  type: string;
  material: string;
  amount: number;
  created_at: string;
  updated_at: string;
};

export type FilamentDraft = {
  brand: string;
  color: string;
  type: string;
  material: string;
  amount: number;
};

export type FieldErrors = Partial<Record<keyof FilamentDraft, string>>;

export type SortField = "brand" | "color" | "type" | "material" | "amount";

export type SortState = {
  field: SortField;
  direction: "asc" | "desc";
};

export type InventoryFiltersState = {
  brand: string;
  material: string;
  type: string;
  searchColor: string;
  hideOutOfStock: boolean;
};

export type FilterOptions = {
  brands: string[];
  materials: string[];
  types: string[];
};

export type OperationStatus = "idle" | "loading" | "success" | "error";

export type OperationSource =
  | "load"
  | "create"
  | "update"
  | "delete"
  | "authVerify";

export type ApiError = {
  status: number | null;
  message: string;
  source: OperationSource;
};

export type OperationState = {
  status: OperationStatus;
  error: ApiError | null;
};

export type OperationStates = Record<OperationSource, OperationState>;
