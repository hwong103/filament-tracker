const COLOR_KEYWORDS: Array<{ token: string; hex: string }> = [
  { token: "black", hex: "#23201d" },
  { token: "white", hex: "#f4f1ec" },
  { token: "grey", hex: "#7d7a76" },
  { token: "gray", hex: "#7d7a76" },
  { token: "red", hex: "#a84e47" },
  { token: "orange", hex: "#c97640" },
  { token: "yellow", hex: "#bfa24f" },
  { token: "green", hex: "#5c7f62" },
  { token: "blue", hex: "#547298" },
  { token: "purple", hex: "#7a6a92" },
  { token: "violet", hex: "#7a6a92" },
  { token: "pink", hex: "#b57c8d" },
  { token: "brown", hex: "#7a5c45" },
  { token: "silver", hex: "#9fa3aa" },
  { token: "gold", hex: "#af8f57" },
];

const COLOR_FAMILIES: Array<{ label: string; tokens: string[] }> = [
  { label: "Black & grey", tokens: ["black", "grey", "gray", "silver"] },
  { label: "White & clear", tokens: ["white", "clear", "transparent"] },
  { label: "Reds & pinks", tokens: ["red", "pink"] },
  { label: "Oranges & yellows", tokens: ["orange", "yellow", "gold"] },
  { label: "Greens", tokens: ["green", "mint"] },
  { label: "Blues", tokens: ["blue"] },
  { label: "Purples", tokens: ["purple", "violet"] },
  { label: "Natural tones", tokens: ["brown", "beige", "wood"] },
];

export function colorFamily(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    COLOR_FAMILIES.find((family) =>
      family.tokens.some((token) => normalized.includes(token))
    )?.label ?? "Other colours"
  );
}

export function colorHex(value: string) {
  const normalized = value.trim().toLowerCase();
  const keyword = COLOR_KEYWORDS.find((entry) => normalized.includes(entry.token));

  if (keyword) {
    return keyword.hex;
  }

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = normalized.charCodeAt(index) + ((hash << 5) - hash);
  }

  return `oklch(0.64 0.08 ${Math.abs(hash) % 360})`;
}
