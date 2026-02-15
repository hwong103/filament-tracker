import { useEffect, useMemo, useState, type FormEvent } from "react";

type Filament = {
  id: number;
  brand: string;
  color: string;
  type: string;
  material: string;
  amount: number;
  created_at: string;
  updated_at: string;
};

type FilamentInput = Omit<Filament, "id" | "created_at" | "updated_at">;

type SortField = "brand" | "color" | "type" | "material" | "amount";

type SortState = {
  field: SortField;
  direction: "asc" | "desc";
};

const API_BASE = import.meta.env.VITE_API_BASE || "";
const LOW_STOCK_THRESHOLD = 0.25;
const PASSCODE_STORAGE_KEY = "filament_passcode";

const emptyForm: FilamentInput = {
  brand: "",
  color: "",
  type: "",
  material: "",
  amount: 0,
};

function apiUrl(path: string) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function AmountBar({ amount }: { amount: number }) {
  const clamped = Math.max(0, Math.min(amount, 1));
  const percent = Math.round(clamped * 100);

  return (
    <div className="amount">
      <div className="amount-bar">
        <div className="amount-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="amount-value">{amount.toFixed(2)}</span>
    </div>
  );
}

export default function App() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortState>({
    field: "brand",
    direction: "asc",
  });

  const [filterBrand, setFilterBrand] = useState("all");
  const [filterMaterial, setFilterMaterial] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchColor, setSearchColor] = useState("");

  const [passcode, setPasscode] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [authChecking, setAuthChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [newForm, setNewForm] = useState<FilamentInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FilamentInput>(emptyForm);

  const authorized = authReady && Boolean(passcode);

  useEffect(() => {
    void fetchFilaments();
    void restoreSavedPasscode();
  }, []);

  async function fetchFilaments() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl("/api/filaments"));
      if (!response.ok) {
        throw new Error(`Failed to load (${response.status})`);
      }
      const data = (await response.json()) as Filament[];
      setFilaments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyPasscode(token: string) {
    const response = await fetch(apiUrl("/api/auth/verify"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  }

  function clearAuthState() {
    localStorage.removeItem(PASSCODE_STORAGE_KEY);
    setPasscode("");
    setEditingId(null);
  }

  async function restoreSavedPasscode() {
    const savedToken = localStorage.getItem(PASSCODE_STORAGE_KEY);
    if (!savedToken) {
      setAuthReady(true);
      return;
    }

    setAuthChecking(true);
    try {
      const valid = await verifyPasscode(savedToken);
      if (valid) {
        setPasscode(savedToken);
        setAuthError(null);
      } else {
        clearAuthState();
        setAuthError("Saved passcode is invalid. Enter the current passcode.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setAuthError(`Unable to verify passcode (${message}).`);
    } finally {
      setAuthChecking(false);
      setAuthReady(true);
    }
  }

  async function savePasscode() {
    const token = passcodeInput.trim();
    if (!token) {
      clearAuthState();
      setAuthError(null);
      return;
    }

    setAuthChecking(true);
    setAuthError(null);
    try {
      const valid = await verifyPasscode(token);
      if (!valid) {
        clearAuthState();
        setAuthError("Invalid passcode.");
        return;
      }

      localStorage.setItem(PASSCODE_STORAGE_KEY, token);
      setPasscode(token);
      setPasscodeInput("");
    } catch (err) {
      clearAuthState();
      const message = err instanceof Error ? err.message : "Unknown error";
      setAuthError(`Unable to verify passcode (${message}).`);
    } finally {
      setAuthChecking(false);
      setAuthReady(true);
    }
  }

  function signOut() {
    clearAuthState();
    setAuthError(null);
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

  function sortedFilaments(items: Filament[]) {
    const sorted = [...items].sort((a, b) => {
      const field = sort.field;
      const dir = sort.direction === "asc" ? 1 : -1;

      if (field === "amount") {
        return (a.amount - b.amount) * dir;
      }
      return a[field].localeCompare(b[field]) * dir;
    });

    return sorted;
  }

  const filterOptions = useMemo(() => {
    const brands = new Set<string>();
    const materials = new Set<string>();
    const types = new Set<string>();

    filaments.forEach((filament) => {
      brands.add(filament.brand);
      materials.add(filament.material);
      types.add(filament.type);
    });

    return {
      brands: Array.from(brands).sort(),
      materials: Array.from(materials).sort(),
      types: Array.from(types).sort(),
    };
  }, [filaments]);

  const filtered = useMemo(() => {
    const normalizedSearch = searchColor.trim().toLowerCase();

    const matches = filaments.filter((filament) => {
      if (filterBrand !== "all" && filament.brand !== filterBrand) {
        return false;
      }
      if (filterMaterial !== "all" && filament.material !== filterMaterial) {
        return false;
      }
      if (filterType !== "all" && filament.type !== filterType) {
        return false;
      }
      if (normalizedSearch) {
        return filament.color.toLowerCase().includes(normalizedSearch);
      }
      return true;
    });

    return sortedFilaments(matches);
  }, [filaments, filterBrand, filterMaterial, filterType, searchColor, sort]);

  const totalSpools = useMemo(() => {
    return filaments.reduce((sum, filament) => sum + filament.amount, 0);
  }, [filaments]);

  async function createFilament(event: FormEvent) {
    event.preventDefault();
    if (!authorized) return;

    try {
      const response = await fetch(apiUrl("/api/filaments"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${passcode}`,
        },
        body: JSON.stringify(newForm),
      });

      if (response.status === 401) {
        clearAuthState();
        setAuthError("Passcode rejected. Enter the current passcode.");
        throw new Error("Unauthorized (401)");
      }

      if (!response.ok) {
        throw new Error(`Create failed (${response.status})`);
      }

      const created = (await response.json()) as Filament;
      setFilaments((prev) => [...prev, created]);
      setNewForm(emptyForm);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  }

  function startEdit(filament: Filament) {
    setEditingId(filament.id);
    setEditForm({
      brand: filament.brand,
      color: filament.color,
      type: filament.type,
      material: filament.material,
      amount: filament.amount,
    });
  }

  async function saveEdit() {
    if (!authorized || editingId === null) return;

    try {
      const response = await fetch(apiUrl(`/api/filaments/${editingId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${passcode}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.status === 401) {
        clearAuthState();
        setAuthError("Passcode rejected. Enter the current passcode.");
        throw new Error("Unauthorized (401)");
      }

      if (!response.ok) {
        throw new Error(`Update failed (${response.status})`);
      }

      const updated = (await response.json()) as Filament;
      setFilaments((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditingId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  }

  async function deleteFilament(id: number) {
    if (!authorized) return;
    const confirmed = window.confirm("Delete this filament entry?");
    if (!confirmed) return;

    try {
      const response = await fetch(apiUrl(`/api/filaments/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${passcode}`,
        },
      });

      if (response.status === 401) {
        clearAuthState();
        setAuthError("Passcode rejected. Enter the current passcode.");
        throw new Error("Unauthorized (401)");
      }

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }

      setFilaments((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  }

  const sortIndicator = (field: SortField) => {
    if (sort.field !== field) return "";
    return sort.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Filament Tracker</p>
          <h1>Know your spool situation at a glance.</h1>
          <p className="subhead">
            Keep the family stocked, discover low inventory fast, and update
            levels from anywhere.
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Total spools</span>
            <strong>{totalSpools.toFixed(2)}</strong>
          </div>
          <div className="stat">
            <span className="stat-label">SKUs</span>
            <strong>{filaments.length}</strong>
          </div>
        </div>
      </header>

      <section className="panel">
        <div className="panel-row">
          <div className="filters">
            <label>
              Brand
              <select
                value={filterBrand}
                onChange={(event) => setFilterBrand(event.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Material
              <select
                value={filterMaterial}
                onChange={(event) => setFilterMaterial(event.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.materials.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select
                value={filterType}
                onChange={(event) => setFilterType(event.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Colour search
              <input
                type="search"
                placeholder="Search colour"
                value={searchColor}
                onChange={(event) => setSearchColor(event.target.value)}
              />
            </label>
          </div>
          <div className="auth">
            <label>
              Editor passcode
              <input
                type="password"
                placeholder="Enter passcode"
                value={passcodeInput}
                onChange={(event) => setPasscodeInput(event.target.value)}
                disabled={authChecking}
              />
            </label>
            <p className={`auth-note ${authError ? "error" : ""}`}>
              {authChecking
                ? "Verifying passcode..."
                : authorized
                  ? "Editor mode enabled."
                  : authError || "Read-only mode."}
            </p>
            <div className="auth-actions">
              <button
                type="button"
                className="button"
                onClick={() => void savePasscode()}
                disabled={authChecking}
              >
                Verify passcode
              </button>
              {authorized ? (
                <button
                  type="button"
                  className="button ghost"
                  onClick={signOut}
                  disabled={authChecking}
                >
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {authorized ? (
        <section className="panel form-panel">
          <h2>Add filament</h2>
          <form className="form-grid" onSubmit={createFilament}>
            <input
              required
              placeholder="Brand"
              value={newForm.brand}
              onChange={(event) =>
                setNewForm((prev) => ({ ...prev, brand: event.target.value }))
              }
            />
            <input
              required
              placeholder="Colour"
              value={newForm.color}
              onChange={(event) =>
                setNewForm((prev) => ({ ...prev, color: event.target.value }))
              }
            />
            <input
              required
              placeholder="Type"
              value={newForm.type}
              onChange={(event) =>
                setNewForm((prev) => ({ ...prev, type: event.target.value }))
              }
            />
            <input
              required
              placeholder="Material"
              value={newForm.material}
              onChange={(event) =>
                setNewForm((prev) => ({ ...prev, material: event.target.value }))
              }
            />
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={newForm.amount}
              onChange={(event) =>
                setNewForm((prev) => ({
                  ...prev,
                  amount: Number(event.target.value),
                }))
              }
            />
            <button className="button" type="submit">
              Add filament
            </button>
          </form>
        </section>
      ) : null}

      <section className="panel table-panel">
        <div className="table-header">
          <h2>Inventory</h2>
          {loading ? <span className="pill">Loading</span> : null}
          {error ? <span className="pill error">{error}</span> : null}
        </div>
        <div className="table">
          <div className="table-row table-head">
            <button type="button" onClick={() => toggleSort("brand")}>
              Brand {sortIndicator("brand")}
            </button>
            <button type="button" onClick={() => toggleSort("color")}>
              Colour {sortIndicator("color")}
            </button>
            <button type="button" onClick={() => toggleSort("type")}>
              Type {sortIndicator("type")}
            </button>
            <button type="button" onClick={() => toggleSort("material")}>
              Material {sortIndicator("material")}
            </button>
            <button type="button" onClick={() => toggleSort("amount")}>
              Amount {sortIndicator("amount")}
            </button>
            {authorized ? <span>Actions</span> : null}
          </div>

          {filtered.map((filament) => {
            const isEditing = editingId === filament.id;
            const lowStock = filament.amount <= LOW_STOCK_THRESHOLD;

            return (
              <div
                key={filament.id}
                className={`table-row ${lowStock ? "low-stock" : ""}`}
              >
                {isEditing ? (
                  <>
                    <input
                      value={editForm.brand}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          brand: event.target.value,
                        }))
                      }
                    />
                    <input
                      value={editForm.color}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          color: event.target.value,
                        }))
                      }
                    />
                    <input
                      value={editForm.type}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          type: event.target.value,
                        }))
                      }
                    />
                    <input
                      value={editForm.material}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          material: event.target.value,
                        }))
                      }
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.amount}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          amount: Number(event.target.value),
                        }))
                      }
                    />
                    <div className="actions">
                      <button
                        className="button small"
                        type="button"
                        onClick={() => void saveEdit()}
                      >
                        Save
                      </button>
                      <button
                        className="button ghost small"
                        type="button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{filament.brand}</span>
                    <span>{filament.color}</span>
                    <span>{filament.type}</span>
                    <span>{filament.material}</span>
                    <AmountBar amount={filament.amount} />
                    {authorized ? (
                      <div className="actions">
                        <button
                          className="button ghost small"
                          type="button"
                          onClick={() => startEdit(filament)}
                        >
                          Edit
                        </button>
                        <button
                          className="button danger small"
                          type="button"
                          onClick={() => deleteFilament(filament.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!loading && filtered.length === 0 ? (
          <div className="empty">No filaments match your filters.</div>
        ) : null}
      </section>

      <footer className="footer">
        <span>Low stock: ≤ {LOW_STOCK_THRESHOLD} spool</span>
        <button className="button ghost" type="button" onClick={fetchFilaments}>
          Refresh
        </button>
      </footer>
    </div>
  );
}
