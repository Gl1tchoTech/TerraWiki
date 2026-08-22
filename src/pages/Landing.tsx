import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Axe,
  BookOpen,
  ChevronRight,
  Ghost,
  Hammer,
  Map,
  ScrollText,
  Skull,
  Sparkles,
  Swords,
  UserRound,
} from "lucide-react";
import { countByCategory, getBosses, getItems } from "../lib/data";
import { CATEGORY_META } from "../components/bits";
import type { Category } from "../lib/types";

const CATEGORY_ICONS: Record<Category, typeof Axe> = {
  items: Swords,
  npcs: UserRound,
  bosses: Skull,
  mechanics: Hammer,
};

export default function Landing() {
  const counts = countByCategory();
  const featuredItems = getItems().filter((i) => i.tier === "Endgame").slice(0, 3);
  const featuredBosses = getBosses().slice(-3);
  const total = counts.items + counts.npcs + counts.bosses + counts.mechanics;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-pixel-grid opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-moss-500/15 blur-3xl" />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-moss-600/50 bg-moss-500/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-moss-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            The 1.4.5.7 Field Guide
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-bark-50 sm:text-7xl"
          >
            Every secret of the
            <span className="block bg-gradient-to-r from-gold-300 via-gold-400 to-ember-400 bg-clip-text text-transparent">
              world of Terraria.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-bark-200"
          >
            TerraWiki is the complete community encyclopedia for the latest Terraria update —
            every item and recipe, every NPC, every boss, and every mechanic of 1.4.5.7, in one
            beautifully organized guide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link to="/wiki" className="btn-gold">
              <BookOpen className="h-4 w-4" />
              Browse the Guide
            </Link>
            <Link to="/wiki/items" className="btn-pixel">
              Explore Items
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {(
              [
                { label: "Items", value: counts.items },
                { label: "NPCs", value: counts.npcs },
                { label: "Bosses", value: counts.bosses },
                { label: "Mechanics", value: counts.mechanics },
              ] as const
            ).map((s) => (
              <div key={s.label} className="pixel-card px-4 py-3 text-center">
                <p className="font-display text-3xl font-bold text-gold-400">{s.value}</p>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-bark-300">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category cards */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-moss-300">
            The Compendium
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-bark-50 sm:text-4xl">
            Four volumes, one wiki
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(["items", "npcs", "bosses", "mechanics"] as Category[]).map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat];
            const meta = CATEGORY_META[cat];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <Link
                  to={`/wiki/${cat}`}
                  className="group block h-full rounded-xl border border-bark-700 bg-bark-900/50 p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-gold-500/50 hover:bg-bark-900"
                >
                  <div
                    className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-lg border ${meta.accent} bg-ink-deep`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-bark-50 group-hover:text-gold-300">
                    {meta.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-bark-300">{meta.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 font-display text-xs font-semibold uppercase tracking-wide text-gold-400 opacity-0 transition-opacity group-hover:opacity-100">
                    Open volume <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured content */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Legendary Crafting
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-bark-50">
              Chase the Zenith
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-bark-300">
              Follow crafting chains from a humble Wooden Sword all the way to the ultimate blade.
              TerraWiki maps every ingredient so nothing stays hidden.
            </p>
            <div className="mt-6 space-y-3">
              {featuredItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/wiki/items/${item.id}`}
                  className="group flex items-center justify-between rounded-lg border border-bark-700 bg-bark-900/50 px-4 py-3 transition-colors hover:border-gold-500/50"
                >
                  <div className="flex items-center gap-3">
                    <Swords className="h-5 w-5 text-gold-400" />
                    <div>
                      <p className="font-display text-sm font-semibold text-bark-50 group-hover:text-gold-300">
                        {item.name}
                      </p>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-bark-300">
                        {item.kind}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-bark-300 transition-transform group-hover:translate-x-1 group-hover:text-gold-400" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ember-400">
              The Road to Hardmode
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-bark-50">
              Every boss, every summon
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-bark-300">
              From the King Slime to the Moon Lord. Learn each boss's summoning method, health
              pool, drops, and a proven strategy to bring it down.
            </p>
            <div className="mt-6 space-y-3">
              {featuredBosses.map((boss) => (
                <Link
                  key={boss.id}
                  to={`/wiki/bosses/${boss.id}`}
                  className="group flex items-center justify-between rounded-lg border border-bark-700 bg-bark-900/50 px-4 py-3 transition-colors hover:border-ember-500/50"
                >
                  <div className="flex items-center gap-3">
                    <Ghost className="h-5 w-5 text-ember-400" />
                    <div>
                      <p className="font-display text-sm font-semibold text-bark-50 group-hover:text-ember-300">
                        {boss.name}
                      </p>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-bark-300">
                        {boss.tier}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-bark-300 transition-transform group-hover:translate-x-1 group-hover:text-ember-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-bark-700 bg-bark-900/40 p-8 sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <Map className="mx-auto h-8 w-8 text-moss-300" />
            <h2 className="mt-4 font-display text-3xl font-bold text-bark-50">
              Everything 1.4.5.7 has to offer
            </h2>
            <p className="mt-3 text-bark-300">
              {total} indexed entries and counting, covering the full scope of the update.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Swords, title: "Items & recipes", body: "Weapons, tools, armor, accessories, materials, ammo, and every crafting chain." },
              { icon: UserRound, title: "NPCs & towns", body: "Town NPCs, spawn conditions, shops, happiness, pylons, and rescues." },
              { icon: Skull, title: "Bosses", body: "Summons, health pools, drops, and strategies for pre-Hardmode and Hardmode." },
              { icon: Hammer, title: "Mechanics", body: "Hardmode, events, wiring, fishing, classes, secret seeds, and more." },
              { icon: ScrollText, title: "Up-to-date data", body: "Built around the 1.4.5.7 patch so the latest changes are front and center." },
              { icon: Axe, title: "Mobile companion", body: "Also shipped as an iOS app — built from this wiki's data via a GitHub workflow." },
            ].map((f) => (
              <div key={f.title} className="pixel-card p-5">
                <f.icon className="h-5 w-5 text-gold-400" />
                <h3 className="mt-3 font-display text-sm font-bold text-bark-50">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-bark-300">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold text-bark-50">
            Your adventure starts here.
          </h2>
          <p className="mt-4 text-lg text-bark-200">
            Open the guide and find exactly what you need — from your first copper pick to the
            final Moon Lord fight.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/wiki" className="btn-gold">
              <BookOpen className="h-4 w-4" />
              Open TerraWiki
            </Link>
            <Link to="/wiki/mechanics/hardmode-activation" className="btn-pixel">
              Start with Hardmode
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
