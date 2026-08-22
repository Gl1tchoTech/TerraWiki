import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Compass, Hammer, Skull, Swords, UserRound } from "lucide-react";
import { countByCategory } from "../lib/data";
import { CATEGORY_META, SectionHeading } from "../components/bits";
import type { Category } from "../lib/types";

const ICONS: Record<Category, typeof Swords> = {
  items: Swords,
  npcs: UserRound,
  bosses: Skull,
  mechanics: Hammer,
};

export default function WikiHome() {
  const counts = countByCategory();
  const categories: Category[] = ["items", "npcs", "bosses", "mechanics"];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-pixel-grid opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading
          kicker="The Field Guide"
          title="Welcome to the Compendium"
          description="Choose a volume to explore. Every entry is indexed, cross-linked, and searchable from the bar above."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = ICONS[cat];
            const meta = CATEGORY_META[cat];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link
                  to={`/wiki/${cat}`}
                  className="group flex h-full flex-col rounded-xl border border-bark-700 bg-bark-900/50 p-6 shadow-card transition-all hover:-translate-y-1 hover:border-gold-500/50"
                >
                  <div className="flex items-center justify-between">
                    <div className={`grid h-12 w-12 place-items-center rounded-lg border ${meta.accent} bg-ink-deep`}>
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <span className="font-display text-3xl font-bold text-bark-600 group-hover:text-gold-500">
                      {counts[cat]}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-bark-50 group-hover:text-gold-300">
                    {meta.label}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-bark-300">{meta.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 font-display text-xs font-semibold uppercase tracking-wide text-gold-400">
                    Explore <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl border border-bark-700 bg-bark-900/40 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-sky-500/50 bg-ink-deep">
              <Compass className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-bark-50">Quick paths</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Hardmode activation", to: "/wiki/mechanics/hardmode-activation" },
                  { label: "Zenith", to: "/wiki/items/zenith" },
                  { label: "Moon Lord", to: "/wiki/bosses/moon-lord" },
                  { label: "Guide NPC", to: "/wiki/npcs/guide" },
                  { label: "Terraspark Boots", to: "/wiki/items/terraspark-boots" },
                ].map((p) => (
                  <Link
                    key={p.to}
                    to={p.to}
                    className="chip transition-colors hover:border-gold-500/60 hover:text-gold-300"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
