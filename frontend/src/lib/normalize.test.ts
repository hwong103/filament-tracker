import { describe, expect, it } from "vitest";
import { canonicalMaterial, canonicalType, normalizeDraft } from "./normalize";

describe("normalize", () => {
  it("normalizes known material variants", () => {
    expect(canonicalMaterial(" pla+ ")).toBe("PLA+");
    expect(canonicalMaterial("petg")).toBe("PETG");
    expect(canonicalMaterial("abs")).toBe("ABS");
  });

  it("normalizes known type variants", () => {
    expect(canonicalType(" basic")).toBe("Basic");
    expect(canonicalType("MATTE")).toBe("Matte");
    expect(canonicalType("silk ")).toBe("Silk");
  });

  it("normalizes full draft payload", () => {
    const normalized = normalizeDraft({
      brand: " MakerCo ",
      color: "  Midnight  Blue ",
      type: "basic",
      material: " pla ",
      amount: 0.45,
    });

    expect(normalized).toEqual({
      brand: "MakerCo",
      color: "Midnight Blue",
      type: "Basic",
      material: "PLA",
      amount: 0.45,
    });
  });
});
