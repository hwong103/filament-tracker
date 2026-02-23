import { FunnelSimple } from "@phosphor-icons/react";
import type { FilterOptions, InventoryFiltersState } from "../types/inventory";

type InventoryFiltersProps = {
  filters: InventoryFiltersState;
  options: FilterOptions;
  onChange: (next: InventoryFiltersState) => void;
  onReset: () => void;
};

export function InventoryFilters({
  filters,
  options,
  onChange,
  onReset,
}: InventoryFiltersProps) {
  return (
    <section className="panel" aria-label="Inventory filters">
      <div className="panel-heading">
        <h2>
          <FunnelSimple size={18} weight="duotone" aria-hidden="true" /> Filters
        </h2>
        <button type="button" className="button ghost small" onClick={onReset}>
          Reset filters
        </button>
      </div>
      <div className="filters">
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

        <label htmlFor="filter-material">
          Material
          <select
            id="filter-material"
            value={filters.material}
            onChange={(event) =>
              onChange({ ...filters, material: event.target.value })
            }
          >
            <option value="all">All materials</option>
            {options.materials.map((material) => (
              <option key={material} value={material}>
                {material}
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

        <label htmlFor="filter-search-color">
          Color search
          <input
            id="filter-search-color"
            type="search"
            placeholder="Search color"
            value={filters.searchColor}
            onChange={(event) =>
              onChange({ ...filters, searchColor: event.target.value })
            }
          />
        </label>

        <label className="checkbox-label" htmlFor="filter-hide-out-of-stock">
          Hide out of stock
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
