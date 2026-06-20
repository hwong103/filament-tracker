import { FunnelSimple, MagnifyingGlass, X } from "@phosphor-icons/react";
import { colorHex } from "../lib/color";
import type { FilterOptions, InventoryFiltersState } from "../types/inventory";

type InventoryFiltersProps = {
  filters: InventoryFiltersState;
  options: FilterOptions;
  onChange: (next: InventoryFiltersState) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
};

export function InventoryFilters({
  filters,
  options,
  onChange,
  onReset,
  resultCount,
  totalCount,
}: InventoryFiltersProps) {
  const hasActiveFilters =
    filters.brand !== "all" ||
    filters.material !== "all" ||
    filters.type !== "all" ||
    filters.searchColor.trim() !== "" ||
    filters.hideOutOfStock;

  const colorSuggestions = options.colors.slice(0, 12);

  return (
    <section className="panel filters-panel" aria-label="Inventory filters">
      <div className="panel-heading">
        <div>
          <h2>
            <FunnelSimple size={18} weight="duotone" aria-hidden="true" /> Filter bench
          </h2>
          <p className="filter-results" aria-live="polite">
            Showing <strong>{resultCount}</strong> of {totalCount} {totalCount === 1 ? "filament" : "filaments"}
          </p>
        </div>
        {hasActiveFilters ? (
          <button type="button" className="button ghost small" onClick={onReset}>
            <X size={14} weight="bold" aria-hidden="true" /> Clear filters
          </button>
        ) : null}
      </div>

      <div className="color-finder">
        <label htmlFor="filter-search-color">
          Colour bank
          <span className="search-control">
            <MagnifyingGlass size={19} weight="bold" aria-hidden="true" />
            <input
              id="filter-search-color"
              type="search"
              placeholder="Search colour — e.g. forest, charcoal, blue"
              value={filters.searchColor}
              onChange={(event) =>
                onChange({ ...filters, searchColor: event.target.value })
              }
            />
          </span>
        </label>
        {colorSuggestions.length > 0 ? (
          <div className="filter-chip-group" aria-label="Available colours">
            {colorSuggestions.map((color) => (
              <button
                key={color}
                type="button"
                className={`filter-chip color-filter-chip${filters.searchColor === color ? " is-selected" : ""}`}
                onClick={() => onChange({ ...filters, searchColor: color })}
                aria-pressed={filters.searchColor === color}
              >
                <span
                  className="filter-color-dot"
                  style={{ backgroundColor: colorHex(color) }}
                  aria-hidden="true"
                />
                {color}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="material-finder">
        <span className="filter-group-label">Material family</span>
        <div className="filter-chip-group" aria-label="Filter by material">
          <button
            type="button"
            className={`filter-chip${filters.material === "all" ? " is-selected" : ""}`}
            onClick={() => onChange({ ...filters, material: "all" })}
            aria-pressed={filters.material === "all"}
          >
            All materials
          </button>
          {options.materials.map((material) => (
            <button
              key={material}
              type="button"
              className={`filter-chip material-filter-chip${filters.material === material ? " is-selected" : ""}`}
              onClick={() => onChange({ ...filters, material })}
              aria-pressed={filters.material === material}
            >
              {material}
            </button>
          ))}
        </div>
      </div>

      <div className="filters filters-secondary">
        <label htmlFor="filter-brand">
          Brand
          <select
            id="filter-brand"
            value={filters.brand}
            onChange={(event) =>
              onChange({ ...filters, brand: event.target.value })
            }
          >
            <option value="all">All brands</option>
            {options.brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="filter-type">
          Type
          <select
            id="filter-type"
            value={filters.type}
            onChange={(event) =>
              onChange({ ...filters, type: event.target.value })
            }
          >
            <option value="all">All types</option>
            {options.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-label" htmlFor="filter-hide-out-of-stock">
          <span>
            <strong>In stock only</strong>
            <small>Hide empty spools</small>
          </span>
          <input
            id="filter-hide-out-of-stock"
            type="checkbox"
            checked={filters.hideOutOfStock}
            onChange={(event) =>
              onChange({ ...filters, hideOutOfStock: event.target.checked })
            }
          />
        </label>
      </div>
    </section>
  );
}
