import { Link, useParams } from "react-router-dom";
import { Crosshair, Gift, HeartPulse, MapPin, ScrollText } from "lucide-react";
import { getBoss } from "../lib/data";
import { BackLink, Kicker, StatBlock, TagPill } from "../components/bits";
import { NotFound } from "./NotFound";

export default function BossDetail() {
  const { id } = useParams();
  const boss = getBoss(id ?? "");

  if (!boss) return <NotFound />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <BackLink to="/wiki/bosses" label="All bosses" />

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <Kicker>Boss</Kicker>
          <TagPill tone={boss.tier === "Hardmode" ? "gold" : "neutral"}>
            {boss.tier}
          </TagPill>
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-bark-50 sm:text-5xl">
          {boss.name}
        </h1>
        {boss.biome && (
          <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-sm font-semibold uppercase tracking-[0.15em] text-ember-400">
            <MapPin className="h-4 w-4" /> {boss.biome}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <div className="pixel-card p-5">
            <p className="text-base leading-relaxed text-bark-100">{boss.description}</p>
          </div>

          <div className="pixel-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-bark-700 bg-bark-800/60 px-5 py-3">
              <Crosshair className="h-4 w-4 text-ember-400" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                Battle strategy
              </h2>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-bark-200">{boss.strategy}</p>
            </div>
          </div>

          <div className="pixel-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-bark-700 bg-bark-800/60 px-5 py-3">
              <ScrollText className="h-4 w-4 text-gold-400" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                How to summon
              </h2>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-bark-200">{boss.summon}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <StatBlock label="Tier" value={boss.tier} />
            <StatBlock label="Health" value={boss.hp} />
            <StatBlock label="Biome" value={boss.biome ?? "Any"} />
          </div>

          <div className="pixel-card p-5">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-gold-400" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                Notable drops
              </h2>
            </div>
            <ul className="mt-3 space-y-2">
              {boss.drops.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-bark-200">
                  <HeartPulse className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember-400" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {boss.tags.length > 0 && (
            <div className="pixel-card p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                Tags
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {boss.tags.map((t) => (
                  <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="chip transition-colors hover:border-gold-500/60 hover:text-gold-300">
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
