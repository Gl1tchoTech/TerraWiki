import { Link, useParams } from "react-router-dom";
import { Anvil, Hammer, Package, Sparkles } from "lucide-react";
import { getItem } from "../lib/data";
import { rarityLabel, rarityText } from "../lib/rarity";
import { BackLink, Kicker, StatBlock, TagPill } from "../components/bits";
import { NotFound } from "./NotFound";

export default function ItemDetail() {
  const { id } = useParams();
  const item = getItem(id ?? "");

  if (!item) return <NotFound />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <BackLink to="/wiki/items" label="All items" />

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <Kicker>Item</Kicker>
          {item.hardmode && <TagPill tone="gold">Hardmode</TagPill>}
          {item.tier && <TagPill tone="gold">{item.tier}</TagPill>}
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-bark-50 sm:text-5xl">
          {item.name}
        </h1>
        <p className={`mt-2 font-mono text-sm font-semibold uppercase tracking-[0.15em] ${rarityText(item.rarity)}`}>
          {rarityLabel(item.rarity)} rarity · {item.kind}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Left column */}
        <div className="space-y-6">
          <div className="pixel-card p-5">
            <p className="text-base leading-relaxed text-bark-100">{item.description}</p>
            {item.notes && (
              <p className="mt-3 border-l-2 border-moss-500 pl-3 text-sm leading-relaxed text-bark-300">
                {item.notes}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatBlock label="Type" value={item.kind} />
            <StatBlock label="Damage" value={item.damage ?? "—"} />
            <StatBlock label="Sell price" value={item.sell ?? "—"} />
            <StatBlock label="Rarity" value={rarityLabel(item.rarity)} />
          </div>

          <div className="pixel-card p-5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gold-400" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                How to obtain
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-bark-200">{item.obtain}</p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {item.recipe && (
            <div className="pixel-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-bark-700 bg-bark-800/60 px-5 py-3">
                <Hammer className="h-4 w-4 text-moss-300" />
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                  Crafting recipe
                </h2>
              </div>
              <div className="p-5">
                <div className="mb-4 flex items-center gap-2 rounded-md border border-bark-700 bg-ink-deep/60 px-3 py-2">
                  <Anvil className="h-4 w-4 text-bark-300" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-bark-200">
                    {item.recipe.station}
                  </span>
                </div>
                <ul className="space-y-2">
                  {item.recipe.ingredients.map((ing) => (
                    <li
                      key={ing.name}
                      className="flex items-center justify-between rounded-md border border-bark-700/70 bg-bark-900/40 px-3 py-2.5"
                    >
                      <span className="text-sm text-bark-100">{ing.name}</span>
                      <span className="font-display text-sm font-bold text-gold-400">
                        ×{ing.qty}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-2 border-t border-bark-700 pt-4">
                  <Sparkles className="h-4 w-4 text-gold-400" />
                  <span className="text-sm text-bark-300">Result:</span>
                  <span className="font-display text-sm font-bold text-bark-50">
                    {item.name}
                    {item.recipe.resultQty && item.recipe.resultQty > 1
                      ? ` ×${item.recipe.resultQty}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          )}

          {item.usedIn && item.usedIn.length > 0 && (
            <div className="pixel-card p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                Used to craft
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.usedIn.map((u) => (
                  <span key={u} className="chip">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.tags.length > 0 && (
            <div className="pixel-card p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-bark-50">
                Tags
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((t) => (
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
