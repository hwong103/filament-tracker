import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InventoryList } from "./InventoryList";
import type { Filament } from "../types/inventory";

const filaments: Filament[] = [
  {
    id: 10,
    brand: "NovaFil",
    color: "Ocean Blue",
    type: "Basic",
    material: "PLA",
    amount: 0.65,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
];

describe("InventoryList", () => {
  it("renders labeled fields in mobile cards", () => {
    const { container } = render(
      <InventoryList
        filaments={filaments}
        loading={false}
        authorized={false}
        sort={{ field: "brand", direction: "asc" }}
        onSort={vi.fn()}
        editingId={null}
        editDraft={{ brand: "", color: "", type: "", material: "", amount: 0 }}
        editErrors={{}}
        onEditDraftChange={vi.fn()}
        onStartEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        pendingUpdateId={null}
        deleteConfirmId={null}
        pendingDeleteId={null}
        onRequestDelete={vi.fn()}
        onCancelDelete={vi.fn()}
        onConfirmDelete={vi.fn()}
        hasActiveFilters={false}
        onClearFilters={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    const mobileList = container.querySelector(".mobile-list");
    expect(mobileList).not.toBeNull();

    const mobileQueries = within(mobileList as HTMLElement);
    expect(mobileQueries.getByText("Brand")).toBeInTheDocument();
    expect(mobileQueries.getByText("Color")).toBeInTheDocument();
    expect(mobileQueries.getByText("Type")).toBeInTheDocument();
    expect(mobileQueries.getByText("Material")).toBeInTheDocument();
    expect(mobileQueries.getByText("Amount")).toBeInTheDocument();
  });
});
