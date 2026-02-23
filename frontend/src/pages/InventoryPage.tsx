import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AuthPanel } from "../components/AuthPanel";
import { FilamentForm } from "../components/FilamentForm";
import { InventoryFilters } from "../components/InventoryFilters";
import { InventoryHeader } from "../components/InventoryHeader";
import { InventoryList } from "../components/InventoryList";
import { StatusBanner } from "../components/StatusBanner";
import {
  createFilament,
  deleteFilament,
  fetchFilaments,
  toApiError,
  updateFilament,
  verifyPasscode,
} from "../lib/api";
import {
  createInitialOperationStates,
  EMPTY_DRAFT,
  HIDE_OUT_OF_STOCK_STORAGE_KEY,
  PASSCODE_STORAGE_KEY,
} from "../lib/constants";
import {
  filterFilaments,
  getFilterOptions,
  getTotalSpools,
  sortFilaments,
} from "../lib/inventory";
import {
  normalizeDraft,
  normalizeFilament,
  validateDraft,
} from "../lib/normalize";
import type {
  ApiError,
  FieldErrors,
  Filament,
  FilamentDraft,
  InventoryFiltersState,
  OperationSource,
  OperationStatus,
  SortField,
  SortState,
} from "../types/inventory";

function getSavedHideOutOfStock() {
  const saved = localStorage.getItem(HIDE_OUT_OF_STOCK_STORAGE_KEY);
  return saved === "true";
}

function emptyFilters(): InventoryFiltersState {
  return {
    brand: "all",
    material: "all",
    type: "all",
    searchColor: "",
    hideOutOfStock: false,
  };
}

export function InventoryPage() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [sort, setSort] = useState<SortState>({ field: "brand", direction: "asc" });

  const [filters, setFilters] = useState<InventoryFiltersState>(() => ({
    ...emptyFilters(),
    hideOutOfStock: getSavedHideOutOfStock(),
  }));

  const [operations, setOperations] = useState(createInitialOperationStates);

  const [passcode, setPasscode] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [authReady, setAuthReady] = useState(false);

  const [newDraft, setNewDraft] = useState<FilamentDraft>(EMPTY_DRAFT);
  const [newDraftErrors, setNewDraftErrors] = useState<FieldErrors>({});

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<FilamentDraft>(EMPTY_DRAFT);
  const [editDraftErrors, setEditDraftErrors] = useState<FieldErrors>({});

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const authorized = authReady && Boolean(passcode);

  function setOperation(
    source: OperationSource,
    status: OperationStatus,
    error: ApiError | null = null
  ) {
    setOperations((prev) => ({
      ...prev,
      [source]: { status, error },
    }));
  }

  function clearAuthState() {
    localStorage.removeItem(PASSCODE_STORAGE_KEY);
    setPasscode("");
    setEditingId(null);
    setDeleteConfirmId(null);
  }

  function handleAuthFailure(error: ApiError) {
    if (error.status !== 401) {
      return false;
    }

    clearAuthState();
    setOperation("authVerify", "error", {
      source: "authVerify",
      status: 401,
      message: "Passcode rejected. Enter the current passcode.",
    });
    return true;
  }

  async function loadInventory() {
    setOperation("load", "loading");

    try {
      const data = await fetchFilaments();
      setFilaments(data.map(normalizeFilament));
      setOperation("load", "success");
    } catch (error) {
      setOperation("load", "error", toApiError(error, "load", "Failed to load inventory."));
    }
  }

  async function restoreSavedPasscode() {
    const savedToken = localStorage.getItem(PASSCODE_STORAGE_KEY);

    if (!savedToken) {
      setAuthReady(true);
      return;
    }

    setOperation("authVerify", "loading");

    try {
      await verifyPasscode(savedToken);
      setPasscode(savedToken);
      setOperation("authVerify", "success");
    } catch (error) {
      clearAuthState();
      setOperation(
        "authVerify",
        "error",
        toApiError(error, "authVerify", "Saved passcode is invalid.")
      );
    } finally {
      setAuthReady(true);
    }
  }

  useEffect(() => {
    void loadInventory();
    void restoreSavedPasscode();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      HIDE_OUT_OF_STOCK_STORAGE_KEY,
      filters.hideOutOfStock ? "true" : "false"
    );
  }, [filters.hideOutOfStock]);

  const filterOptions = useMemo(() => getFilterOptions(filaments), [filaments]);

  const filteredFilaments = useMemo(() => {
    return sortFilaments(filterFilaments(filaments, filters), sort);
  }, [filaments, filters, sort]);

  const totalSpools = useMemo(() => getTotalSpools(filaments), [filaments]);

  const hasActiveFilters =
    filters.brand !== "all" ||
    filters.material !== "all" ||
    filters.type !== "all" ||
    filters.searchColor.trim() !== "" ||
    filters.hideOutOfStock;

  function resetFilters() {
    setFilters(emptyFilters());
  }

  async function savePasscode() {
    const token = passcodeInput.trim();

    if (!token) {
      clearAuthState();
      setOperation("authVerify", "idle");
      return;
    }

    setOperation("authVerify", "loading");

    try {
      await verifyPasscode(token);
      localStorage.setItem(PASSCODE_STORAGE_KEY, token);
      setPasscode(token);
      setPasscodeInput("");
      setOperation("authVerify", "success");
      setAuthReady(true);
    } catch (error) {
      clearAuthState();
      setOperation(
        "authVerify",
        "error",
        toApiError(error, "authVerify", "Unable to verify passcode.")
      );
      setAuthReady(true);
    }
  }

  function signOut() {
    clearAuthState();
    setOperation("authVerify", "idle");
  }

  function toggleSort(field: SortField) {
    setSort((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return { field, direction: "asc" };
    });
  }

  async function createFilamentEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authorized) {
      return;
    }

    const errors = validateDraft(newDraft);
    setNewDraftErrors(errors);

    if (Object.keys(errors).length > 0) {
      setOperation("create", "error", {
        source: "create",
        status: 400,
        message: "Fix the highlighted fields before creating a filament entry.",
      });
      return;
    }

    setOperation("create", "loading");

    try {
      const created = await createFilament(normalizeDraft(newDraft), passcode);
      setFilaments((prev) => [...prev, normalizeFilament(created)]);
      setNewDraft(EMPTY_DRAFT);
      setNewDraftErrors({});
      setOperation("create", "success");
    } catch (error) {
      const apiError = toApiError(error, "create", "Unable to create filament.");
      handleAuthFailure(apiError);
      setOperation("create", "error", apiError);
    }
  }

  function startEdit(filament: Filament) {
    setEditingId(filament.id);
    setEditDraft({
      brand: filament.brand,
      color: filament.color,
      type: filament.type,
      material: filament.material,
      amount: filament.amount,
    });
    setEditDraftErrors({});
    setDeleteConfirmId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraftErrors({});
  }

  async function saveEdit() {
    if (!authorized || editingId === null) {
      return;
    }

    const errors = validateDraft(editDraft);
    setEditDraftErrors(errors);

    if (Object.keys(errors).length > 0) {
      setOperation("update", "error", {
        source: "update",
        status: 400,
        message: "Fix the highlighted fields before saving changes.",
      });
      return;
    }

    setPendingUpdateId(editingId);
    setOperation("update", "loading");

    try {
      const updated = await updateFilament(editingId, normalizeDraft(editDraft), passcode);
      setFilaments((prev) =>
        prev.map((filament) =>
          filament.id === editingId ? normalizeFilament(updated) : filament
        )
      );
      setEditingId(null);
      setEditDraftErrors({});
      setOperation("update", "success");
    } catch (error) {
      const apiError = toApiError(error, "update", "Unable to update filament.");
      handleAuthFailure(apiError);
      setOperation("update", "error", apiError);
    } finally {
      setPendingUpdateId(null);
    }
  }

  function requestDelete(id: number) {
    setDeleteConfirmId(id);
    setEditingId(null);
  }

  function cancelDelete() {
    setDeleteConfirmId(null);
  }

  async function confirmDelete(id: number) {
    if (!authorized) {
      return;
    }

    setPendingDeleteId(id);
    setOperation("delete", "loading");

    try {
      await deleteFilament(id, passcode);
      setFilaments((prev) => prev.filter((filament) => filament.id !== id));
      setDeleteConfirmId(null);
      setOperation("delete", "success");
    } catch (error) {
      const apiError = toApiError(error, "delete", "Unable to delete filament.");
      handleAuthFailure(apiError);
      setOperation("delete", "error", apiError);
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="page">
      <InventoryHeader totalSpools={totalSpools} skuCount={filaments.length} />

      <div className="controls-layout">
        <InventoryFilters
          filters={filters}
          options={filterOptions}
          onChange={setFilters}
          onReset={resetFilters}
        />
        <AuthPanel
          passcodeInput={passcodeInput}
          authorized={authorized}
          checking={operations.authVerify.status === "loading"}
          errorMessage={operations.authVerify.error?.message ?? null}
          onPasscodeInputChange={setPasscodeInput}
          onVerify={() => void savePasscode()}
          onSignOut={signOut}
        />
      </div>

      {authorized ? (
        <FilamentForm
          draft={newDraft}
          errors={newDraftErrors}
          pending={operations.create.status === "loading"}
          onDraftChange={(next) => {
            setNewDraft(next);
            setNewDraftErrors((prev) => ({
              ...prev,
              brand: next.brand.trim() ? undefined : prev.brand,
              color: next.color.trim() ? undefined : prev.color,
              type: next.type.trim() ? undefined : prev.type,
              material: next.material.trim() ? undefined : prev.material,
              amount: next.amount >= 0 ? undefined : prev.amount,
            }));
          }}
          onSubmit={createFilamentEntry}
          errorMessage={operations.create.error?.message ?? null}
        />
      ) : null}

      {operations.load.error ? (
        <StatusBanner
          tone="error"
          title="Could not load inventory"
          message={operations.load.error.message}
          actionLabel="Retry"
          onAction={() => void loadInventory()}
          actionDisabled={operations.load.status === "loading"}
        />
      ) : null}

      {operations.update.error ? (
        <StatusBanner
          tone="error"
          title="Update failed"
          message={operations.update.error.message}
        />
      ) : null}

      {operations.delete.error ? (
        <StatusBanner
          tone="error"
          title="Delete failed"
          message={operations.delete.error.message}
        />
      ) : null}

      <InventoryList
        filaments={filteredFilaments}
        loading={operations.load.status === "loading"}
        authorized={authorized}
        sort={sort}
        onSort={toggleSort}
        editingId={editingId}
        editDraft={editDraft}
        editErrors={editDraftErrors}
        onEditDraftChange={setEditDraft}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        onSaveEdit={() => void saveEdit()}
        pendingUpdateId={pendingUpdateId}
        deleteConfirmId={deleteConfirmId}
        pendingDeleteId={pendingDeleteId}
        onRequestDelete={requestDelete}
        onCancelDelete={cancelDelete}
        onConfirmDelete={(id) => void confirmDelete(id)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={resetFilters}
        onRefresh={() => void loadInventory()}
      />

      <footer className="footer">
        <span>Low stock threshold uses 0.25 spool units.</span>
      </footer>
    </div>
  );
}
