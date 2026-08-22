import { getItems } from "../lib/data";
import EntryList, { type ListEntry } from "../components/EntryList";
import { SectionHeading } from "../components/bits";

export default function ItemsPage() {
  const entries: ListEntry[] = getItems().map((item) => ({
    id: item.id,
    name: item.name,
    meta: [item.kind, item.tier].filter(Boolean).join(" · "),
    blurb: item.description,
    tags: item.tags,
    accent: item.tier === "Endgame" ? "text-gold-400" : "text-bark-300",
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        kicker="Volume I"
        title="Items & Recipes"
        description="Weapons, tools, armor, accessories, materials, ammo, and the crafting chains that build them."
      />
      <div className="mt-10">
        <EntryList entries={entries} basePath="/wiki/items" placeholder="Filter items, kinds, tiers…" />
      </div>
    </div>
  );
}
