import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InventoryPage } from "./InventoryPage";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("InventoryPage", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("shows auth error and revokes editor mode when saved token is unauthorized", async () => {
    localStorage.setItem("filament_passcode", "old-token");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ error: "Unauthorized" }, 401));

    vi.stubGlobal("fetch", fetchMock);

    render(<InventoryPage />);

    expect(await screen.findByText("Unauthorized")).toBeInTheDocument();
    expect(screen.queryByLabelText("Add filament")).not.toBeInTheDocument();
  });

  it("retries after load failure and clears stale load error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: "Server down" }, 500))
      .mockResolvedValueOnce(jsonResponse([]));

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<InventoryPage />);

    expect(await screen.findByText("Could not load inventory")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.queryByText("Could not load inventory")).not.toBeInTheDocument();
    });
  });

  it("handles unauthorized create response by clearing editor mode", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse({ error: "Unauthorized" }, 401));

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<InventoryPage />);

    await user.type(screen.getAllByLabelText("Passcode")[0], "secret-token");
    await user.click(screen.getByRole("button", { name: "Verify passcode" }));

    const formSection = await screen.findByLabelText("Add filament");
    const formQueries = within(formSection);

    const brandInputs = formQueries.getAllByLabelText("Brand");
    const colorInputs = formQueries.getAllByLabelText("Color");
    const typeInputs = formQueries.getAllByLabelText("Type");
    const materialInputs = formQueries.getAllByLabelText("Material");

    await user.type(brandInputs[0], "NovaFil");
    await user.type(colorInputs[0], "Teal");
    await user.type(typeInputs[0], "Basic");
    await user.type(materialInputs[0], "PLA");

    await user.click(formQueries.getByRole("button", { name: "Add filament" }));

    expect(
      await screen.findByText("Passcode rejected. Enter the current passcode.")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByLabelText("Add filament")).not.toBeInTheDocument();
    });
  });
});
