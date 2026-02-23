import { describe, expect, it } from "vitest";
import { filterFilaments, sortFilaments } from "./inventory";
import type { Filament, InventoryFiltersState, SortState } from "../types/inventory";

const filaments: Filament[] = [
  {
    id: 1,
    brand: "Aster",
    color: "Ivory",
    type: "Basic",
    material: "PLA",
    amount: 0,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
  {
    id: 2,
    brand: "Boreal",
    color: "Forest Green",
    type: "Matte",
    material: "PLA+",
    amount: 0.7,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
  {
    id: 3,
    brand: "Cinder",
    color: "Signal Red",
    type: "Silk",
    material: "PETG",
    amount: 0.2,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
];

const baseFilters: InventoryFiltersState = {
  brand: "all",
  material: "all",
  type: "all",
  searchColor: "",
  hideOutOfStock: false,
};

describe("inventory", () => {
  it("sorts by string and numeric fields", () => {
    const sortByBrand: SortState = { field: "brand", direction: "desc" };
    const byBrand = sortFilaments(filaments, sortByBrand);
    expect(byBrand.map((item) => item.brand)).toEqual(["Cinder", "Boreal", "Aster"]);

    const sortByAmount: SortState = { field: "amount", direction: "asc" };
    const byAmount = sortFilaments(filaments, sortByAmount);
    expect(byAmount.map((item) => item.amount)).toEqual([0, 0.2, 0.7]);
  });

  it("applies combined filters", () => {
    const filtered = filterFilaments(filaments, {
      ...baseFilters,
      material: "PLA+",
      type: "Matte",
      searchColor: "green",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].brand).toBe("Boreal");
  });

  it("removes out-of-stock entries when requested", () => {
    const filtered = filterFilaments(filaments, {
      ...baseFilters,
      hideOutOfStock: true,
    });

    expect(filtered.map((item) => item.id)).toEqual([2, 3]);
  });
});
