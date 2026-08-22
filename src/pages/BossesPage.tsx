import { getBosses } from "../lib/data";
import EntryList, { type ListEntry } from "../components/EntryList";
import { SectionHeading } from "../components/bits";

export default function BossesPage() {
  const entries: ListEntry[] = getBosses().map((boss) => ({
    id: boss.id,
    name: boss.name,
    meta: `${boss.tier} · ${boss.hp}`,
    blurb: boss.description,
    tags: boss.tags,
    accent: boss.tier === "Hardmode" ? "text-ember-400" : "text-gold-400",
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        kicker="Volume III"
        title="Bosses"
        description="Every pre-Hardmode and Hardmode boss — summoning methods, health, drops, and battle strategy."
      />
      <div className="mt-10">
        <EntryList entries={entries} basePath="/wiki/bosses" placeholder="Filter bosses, tiers…" />
      </div>
    </div>
  );
}
