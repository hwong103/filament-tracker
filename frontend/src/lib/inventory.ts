import type {
  FilterOptions,
  Filament,
  InventoryFiltersState,
  SortState,
} from "../types/inventory";

export function getFilterOptions(filaments: Filament[]): FilterOptions {
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
}

export function filterFilaments(
  filaments: Filament[],
  filters: InventoryFiltersState
): Filament[] {
  const normalizedSearch = filters.searchColor.trim().toLowerCase();

  return filaments.filter((filament) => {
    if (filters.brand !== "all" && filament.brand !== filters.brand) {
      return false;
    }

    if (filters.material !== "all" && filament.material !== filters.material) {
      return false;
    }

    if (filters.type !== "all" && filament.type !== filters.type) {
      return false;
    }

    if (filters.hideOutOfStock && filament.amount <= 0) {
      return false;
    }

    if (normalizedSearch) {
      return filament.color.toLowerCase().includes(normalizedSearch);
    }

    return true;
  });
}

export function sortFilaments(filaments: Filament[], sort: SortState): Filament[] {
  const sorted = [...filaments].sort((a, b) => {
    const direction = sort.direction === "asc" ? 1 : -1;

    if (sort.field === "amount") {
      return (a.amount - b.amount) * direction;
    }

    return a[sort.field].localeCompare(b[sort.field]) * direction;
  });

  return sorted;
}

export function getTotalSpools(filaments: Filament[]) {
  return filaments.reduce((sum, filament) => sum + filament.amount, 0);
}
