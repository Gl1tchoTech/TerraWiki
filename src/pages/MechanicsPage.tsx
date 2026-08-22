import { getMechanics } from "../lib/data";
import EntryList, { type ListEntry } from "../components/EntryList";
import { SectionHeading } from "../components/bits";

export default function MechanicsPage() {
  const entries: ListEntry[] = getMechanics().map((m) => ({
    id: m.id,
    name: m.name,
    meta: m.group,
    blurb: m.summary,
    tags: m.tags,
    accent: "text-sky-400",
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        kicker="Volume IV"
        title="Mechanics"
        description="The systems that power Terraria — progression, world rules, events, and everything in between."
      />
      <div className="mt-10">
        <EntryList entries={entries} basePath="/wiki/mechanics" placeholder="Filter mechanics, groups…" />
      </div>
    </div>
  );
}
