import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, SearchX } from "lucide-react";
import { cn } from "../lib/utils";

export interface ListEntry {
  id: string;
  name: string;
  meta: string;
  blurb: string;
  tags: string[];
  accent?: string;
}

export default function EntryList({
  entries,
  basePath,
  placeholder = "Filter this volume…",
}: {
  entries: ListEntry[];
  basePath: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.meta.toLowerCase().includes(q) ||
        e.blurb.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [entries, query]);

  return (
    <div>
      <div className="mb-6 max-w-md">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-bark-700 bg-ink-deep/70 px-3.5 py-2.5 text-sm text-bark-50 placeholder:text-bark-300/70 outline-none transition-colors focus:border-gold-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="pixel-card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX className="h-8 w-8 text-bark-300" />
          <p className="font-display text-base font-semibold text-bark-200">No entries match</p>
          <p className="text-sm text-bark-300">Try a different term or clear the filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <Link
              key={entry.id}
              to={`${basePath}/${entry.id}`}
              className="group flex flex-col rounded-xl border border-bark-700 bg-bark-900/50 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-gold-500/50"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-bold text-bark-50 group-hover:text-gold-300">
                  {entry.name}
                </h3>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-bark-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-400" />
              </div>
              <p
                className={cn(
                  "mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]",
                  entry.accent ?? "text-bark-300"
                )}
              >
                {entry.meta}
              </p>
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-bark-300">
                {entry.blurb}
              </p>
              {entry.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {entry.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="chip !px-2 !py-0.5 !text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
