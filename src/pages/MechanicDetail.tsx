import { Link, useParams } from "react-router-dom";
import { BookOpenText, Lightbulb, Link2 } from "lucide-react";
import { getMechanic } from "../lib/data";
import { BackLink, Kicker, StatBlock, TagPill } from "../components/bits";
import { NotFound } from "./NotFound";

export default function MechanicDetail() {
  const { id } = useParams();
  const mechanic = getMechanic(id ?? "");

  if (!mechanic) return <NotFound />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <BackLink to="/wiki/mechanics" label="All mechanics" />

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <Kicker>Mechanic</Kicker>
          <TagPill>{mechanic.group}</TagPill>
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-bark-50 sm:text-5xl">
          {mechanic.name}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-bark-200">{mechanic.summary}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="pixel-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-bark-700 bg-bark-800/60 px-5 py-3">
              <BookOpenText className="h-4 w-4 text-sky-400" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                How it works
              </h2>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-bark-200">{mechanic.howItWorks}</p>
            </div>
          </div>

          {mechanic.tips && mechanic.tips.length > 0 && (
            <div className="pixel-card p-5">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gold-400" />
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                  Tips
                </h2>
              </div>
              <ul className="mt-4 space-y-3">
                {mechanic.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-3 rounded-md border border-bark-700/70 bg-ink-deep/50 px-4 py-3 text-sm leading-relaxed text-bark-200">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-moss-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <StatBlock label="Group" value={mechanic.group} />
          </div>

          {mechanic.related && mechanic.related.length > 0 && (
            <div className="pixel-card p-5">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-moss-300" />
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                  Related entries
                </h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {mechanic.related.map((r) => (
                  <span key={r} className="chip">{r}</span>
                ))}
              </div>
            </div>
          )}

          {mechanic.tags.length > 0 && (
            <div className="pixel-card p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                Tags
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {mechanic.tags.map((t) => (
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
