import type { Boss, Category, Item, Mechanic, Npc, WikiEntry } from "../types";
import { items } from "./items";
import { npcs } from "./npcs";
import { bosses } from "./bosses";
import { mechanics } from "./mechanics";

export { items, npcs, bosses, mechanics };

export function getItems(): Item[] {
  return items;
}

export function getNpcs(): Npc[] {
  return npcs;
}

export function getBosses(): Boss[] {
  return bosses;
}

export function getMechanics(): Mechanic[] {
  return mechanics;
}

export function getItem(id: string): Item | undefined {
  return items.find((i) => i.id === id);
}

export function getNpc(id: string): Npc | undefined {
  return npcs.find((n) => n.id === id);
}

export function getBoss(id: string): Boss | undefined {
  return bosses.find((b) => b.id === id);
}

export function getMechanic(id: string): Mechanic | undefined {
  return mechanics.find((m) => m.id === id);
}

export function countByCategory(): Record<Category, number> {
  return {
    items: items.length,
    npcs: npcs.length,
    bosses: bosses.length,
    mechanics: mechanics.length,
  };
}

export function allEntries(): WikiEntry[] {
  const entries: WikiEntry[] = [
    ...items.map<WikiEntry>((i) => ({
      id: i.id,
      name: i.name,
      category: "items",
      blurb: i.description,
      tags: i.tags,
      tier: i.tier,
      group: i.kind,
    })),
    ...npcs.map<WikiEntry>((n) => ({
      id: n.id,
      name: n.name,
      category: "npcs",
      blurb: n.description,
      tags: n.tags,
      group: n.role,
    })),
    ...bosses.map<WikiEntry>((b) => ({
      id: b.id,
      name: b.name,
      category: "bosses",
      blurb: b.description,
      tags: b.tags,
      tier: b.tier,
    })),
    ...mechanics.map<WikiEntry>((m) => ({
      id: m.id,
      name: m.name,
      category: "mechanics",
      blurb: m.summary,
      tags: m.tags,
      group: m.group,
    })),
  ];
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

export function searchWiki(query: string): WikiEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/);
  const scored = allEntries()
    .map((entry) => {
      const name = entry.name.toLowerCase();
      const blurb = entry.blurb.toLowerCase();
      const tags = entry.tags.join(" ").toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (name === term) score += 10;
        else if (name.startsWith(term)) score += 6;
        else if (name.includes(term)) score += 4;
        if (blurb.includes(term)) score += 2;
        if (tags.includes(term)) score += 3;
      }
      return { entry, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((r) => r.entry);
}
