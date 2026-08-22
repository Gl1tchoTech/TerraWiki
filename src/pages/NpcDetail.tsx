import { Link, useParams } from "react-router-dom";
import { Home, MapPin, MessageSquareQuote, Store } from "lucide-react";
import { getNpc } from "../lib/data";
import { BackLink, Kicker, StatBlock } from "../components/bits";
import { NotFound } from "./NotFound";

export default function NpcDetail() {
  const { id } = useParams();
  const npc = getNpc(id ?? "");

  if (!npc) return <NotFound />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <BackLink to="/wiki/npcs" label="All NPCs" />

      <div className="mt-6">
        <Kicker>NPC</Kicker>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-bark-50 sm:text-5xl">
          {npc.name}
        </h1>
        <p className="mt-2 font-mono text-sm font-semibold uppercase tracking-[0.15em] text-moss-300">
          {npc.role}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <div className="pixel-card p-5">
            <p className="text-base leading-relaxed text-bark-100">{npc.description}</p>
            {npc.notes && (
              <p className="mt-3 border-l-2 border-moss-500 pl-3 text-sm leading-relaxed text-bark-300">
                {npc.notes}
              </p>
            )}
          </div>

          {npc.quotes && npc.quotes.length > 0 && (
            <div className="pixel-card p-5">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="h-4 w-4 text-gold-400" />
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                  Quotes
                </h2>
              </div>
              <ul className="mt-4 space-y-3">
                {npc.quotes.map((q) => (
                  <li key={q} className="rounded-md border border-bark-700/70 bg-ink-deep/50 px-4 py-3 text-sm italic leading-relaxed text-bark-200">
                    “{q}”
                  </li>
                ))}
              </ul>
            </div>
          )}

          {npc.sells && npc.sells.length > 0 && (
            <div className="pixel-card p-5">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-moss-300" />
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                  Sells
                </h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {npc.sells.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <StatBlock label="Spawn condition" value={npc.spawnCondition} />
            <StatBlock label="Preferred biome" value={npc.biome ?? "—"} />
            <StatBlock label="Likes" value={npc.likes?.join(", ") ?? "—"} />
          </div>

          <div className="pixel-card p-5">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gold-400" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                Services
              </h2>
            </div>
            <ul className="mt-3 space-y-2">
              {npc.services.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-bark-200">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-300" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {npc.tags.length > 0 && (
            <div className="pixel-card p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                Tags
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {npc.tags.map((t) => (
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
