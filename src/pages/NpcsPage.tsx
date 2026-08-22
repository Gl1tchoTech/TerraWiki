import { getNpcs } from "../lib/data";
import EntryList, { type ListEntry } from "../components/EntryList";
import { SectionHeading } from "../components/bits";

export default function NpcsPage() {
  const entries: ListEntry[] = getNpcs().map((npc) => ({
    id: npc.id,
    name: npc.name,
    meta: npc.role,
    blurb: npc.description,
    tags: npc.tags,
    accent: "text-moss-300",
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        kicker="Volume II"
        title="NPCs"
        description="Every town NPC and special character — how to find them, what they sell, and where they like to live."
      />
      <div className="mt-10">
        <EntryList entries={entries} basePath="/wiki/npcs" placeholder="Filter NPCs, roles…" />
      </div>
    </div>
  );
}
