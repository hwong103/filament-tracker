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
  const colors = new Set<string>();

  filaments.forEach((filament) => {
    brands.add(filament.brand);
    materials.add(filament.material);
    types.add(filament.type);
    colors.add(filament.color);
  });

  return {
    brands: Array.from(brands).sort(),
    materials: Array.from(materials).sort(),
    types: Array.from(types).sort(),
    colors: Array.from(colors).sort(),
  };
}

function includeSelected(available: string[], selected: string[]) {
  return Array.from(new Set([...available, ...selected])).sort();
}

export function getAvailableFilterOptions(
  filaments: Filament[],
  filters: InventoryFiltersState
): FilterOptions {
  const brandOptions = getFilterOptions(
    filterFilaments(filaments, { ...filters, brand: "all" })
  );
  const materialOptions = getFilterOptions(
    filterFilaments(filaments, { ...filters, materials: [] })
  );
  const typeOptions = getFilterOptions(
    filterFilaments(filaments, { ...filters, types: [] })
  );
  const colorOptions = getFilterOptions(
    filterFilaments(filaments, { ...filters, colors: [] })
  );

  return {
    brands: brandOptions.brands,
    materials: includeSelected(materialOptions.materials, filters.materials),
    types: includeSelected(typeOptions.types, filters.types),
    colors: includeSelected(colorOptions.colors, filters.colors),
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

    if (
      filters.materials.length > 0 &&
      !filters.materials.includes(filament.material)
    ) {
      return false;
    }

    if (filters.types.length > 0 && !filters.types.includes(filament.type)) {
      return false;
    }

    if (filters.colors.length > 0 && !filters.colors.includes(filament.color)) {
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
