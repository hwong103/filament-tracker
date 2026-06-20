import { FunnelSimple, MagnifyingGlass, X } from "@phosphor-icons/react";
import { colorFamily, colorHex } from "../lib/color";
import type { FilterOptions, InventoryFiltersState } from "../types/inventory";

type InventoryFiltersProps = {
  filters: InventoryFiltersState;
  options: FilterOptions;
  onChange: (next: InventoryFiltersState) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
};

function toggleSelection(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

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
    filters.materials.length > 0 ||
    filters.types.length > 0 ||
    filters.colors.length > 0 ||
    filters.searchColor.trim() !== "" ||
    filters.hideOutOfStock;

  const colorSuggestions = [...options.colors].sort((a, b) => {
    const aSelected = filters.colors.includes(a);
    const bSelected = filters.colors.includes(b);
    return Number(bSelected) - Number(aSelected) || a.localeCompare(b);
  });
  const colorGroups = colorSuggestions.reduce<Record<string, string[]>>(
    (groups, color) => {
      const family = colorFamily(color);
      groups[family] = [...(groups[family] ?? []), color];
      return groups;
    },
    {}
  );

  function renderColorChip(color: string) {
    const selected = filters.colors.includes(color);

    return (
      <button
        key={color}
        type="button"
        className={`filter-chip color-filter-chip${selected ? " is-selected" : ""}`}
        onClick={() =>
          onChange({
            ...filters,
            colors: toggleSelection(filters.colors, color),
          })
        }
        aria-pressed={selected}
      >
        <span
          className="filter-color-dot"
          style={{ backgroundColor: colorHex(color) }}
          aria-hidden="true"
        />
        {color}
      </button>
    );
  }

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
        <p className="filter-helper">Select any combination to include matching spools.</p>
        {colorSuggestions.length > 0 ? (
          <div className="filter-chip-group" aria-label="Available colours">
            <button
              type="button"
              className={`filter-chip${filters.colors.length === 0 ? " is-selected" : ""}`}
              onClick={() => onChange({ ...filters, colors: [] })}
              aria-pressed={filters.colors.length === 0}
            >
              All colours
            </button>
            {Object.entries(colorGroups).map(([family, colors]) => (
              <div key={family} className="color-family" role="group" aria-label={family}>
                <span className="color-family-label">{family}</span>
                <div className="filter-chip-group">{colors.map(renderColorChip)}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="material-finder">
        <span className="filter-group-label">Material family</span>
        <div className="filter-chip-group" aria-label="Filter by material">
          <button
            type="button"
            className={`filter-chip${filters.materials.length === 0 ? " is-selected" : ""}`}
            onClick={() => onChange({ ...filters, materials: [] })}
            aria-pressed={filters.materials.length === 0}
          >
            All materials
          </button>
          {options.materials.map((material) => (
            <button
              key={material}
              type="button"
              className={`filter-chip material-filter-chip${filters.materials.includes(material) ? " is-selected" : ""}`}
              onClick={() =>
                onChange({
                  ...filters,
                  materials: toggleSelection(filters.materials, material),
                })
              }
              aria-pressed={filters.materials.includes(material)}
            >
              {material}
            </button>
          ))}
        </div>
      </div>

      <div className="material-finder type-finder">
        <span className="filter-group-label">Finish type</span>
        <div className="filter-chip-group" aria-label="Filter by finish type">
          <button
            type="button"
            className={`filter-chip${filters.types.length === 0 ? " is-selected" : ""}`}
            onClick={() => onChange({ ...filters, types: [] })}
            aria-pressed={filters.types.length === 0}
          >
            All finishes
          </button>
          {options.types.map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-chip${filters.types.includes(type) ? " is-selected" : ""}`}
              onClick={() =>
                onChange({
                  ...filters,
                  types: toggleSelection(filters.types, type),
                })
              }
              aria-pressed={filters.types.includes(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <label className="checkbox-label primary-stock-filter" htmlFor="filter-hide-out-of-stock">
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

      </div>
    </section>
  );
}
