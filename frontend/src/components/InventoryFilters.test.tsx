import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InventoryFilters } from "./InventoryFilters";
import type { InventoryFiltersState } from "../types/inventory";

const filters: InventoryFiltersState = {
  brand: "all",
  materials: [],
  types: [],
  colors: [],
  searchColor: "",
  hideOutOfStock: false,
};

describe("InventoryFilters", () => {
  it("allows multiple material, finish, and colour selections while keeping in-stock visible", async () => {
    const user = userEvent.setup();

    function FilterHarness() {
      const [nextFilters, setFilters] = useState(filters);

      return (
        <InventoryFilters
          filters={nextFilters}
          options={{
            brands: ["Aster"],
            materials: ["PLA", "PETG"],
            types: ["Basic", "Matte"],
            colors: ["Black", "White"],
          }}
          onChange={setFilters}
          onReset={() => setFilters(filters)}
          resultCount={4}
          totalCount={4}
        />
      );
    }

    render(<FilterHarness />);

    await user.click(screen.getByRole("button", { name: "PLA" }));
    await user.click(screen.getByRole("button", { name: "PETG" }));
    await user.click(screen.getByRole("button", { name: "Basic" }));
    await user.click(screen.getByRole("button", { name: "Matte" }));
    await user.click(screen.getByRole("button", { name: "Black" }));
    await user.click(screen.getByRole("button", { name: "White" }));

    expect(screen.getByRole("button", { name: "PLA" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "PETG" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Basic" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Matte" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Black" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "White" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    const inStockOnly = screen.getByRole("checkbox", {
      name: /In stock only/,
    });
    expect(inStockOnly).toBeVisible();
    await user.click(inStockOnly);
    expect(inStockOnly).toBeChecked();
  });
});
