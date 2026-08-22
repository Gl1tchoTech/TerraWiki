// Terraria item rarity tiers mapped to readable colors/labels.
export const RARITY_COLORS: Record<number, { label: string; text: string }> = {
  0: { label: "Gray", text: "text-zinc-400" },
  1: { label: "White", text: "text-zinc-100" },
  2: { label: "Blue", text: "text-sky-400" },
  3: { label: "Green", text: "text-moss-300" },
  4: { label: "Orange", text: "text-gold-400" },
  5: { label: "Light Red", text: "text-red-400" },
  6: { label: "Pink", text: "text-pink-400" },
  7: { label: "Light Purple", text: "text-violet-400" },
  8: { label: "Lime", text: "text-lime-400" },
  9: { label: "Yellow", text: "text-yellow-300" },
  10: { label: "Cyan", text: "text-cyan-300" },
  11: { label: "Red", text: "text-red-500" },
};

export function rarityLabel(rarity: number): string {
  return RARITY_COLORS[rarity]?.label ?? "Gray";
}

export function rarityText(rarity: number): string {
  return RARITY_COLORS[rarity]?.text ?? "text-zinc-400";
}
