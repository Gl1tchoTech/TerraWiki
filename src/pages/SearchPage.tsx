import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, SearchX } from "lucide-react";
import { searchWiki } from "../lib/data";
import { CATEGORY_META, Kicker } from "../components/bits";
import type { Category } from "../lib/types";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";

  const results = useMemo(() => searchWiki(query), [query]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <Kicker className="mb-3">Search</Kicker>
      <h1 className="font-display text-3xl font-bold tracking-tight text-bark-50 sm:text-4xl">
        Results for “{query}”
      </h1>

      {results.length === 0 ? (
        <div className="pixel-card mt-10 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX className="h-8 w-8 text-bark-300" />
          <p className="font-display text-base font-semibold text-bark-200">
            Nothing found for “{query}”
          </p>
          <p className="max-w-sm text-sm text-bark-300">
            Try a broader term, or browse a volume directly from the Guide.
          </p>
          <Link to="/wiki" className="btn-gold mt-2">
            Back to the Guide
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {results.map((entry) => {
            const meta = CATEGORY_META[entry.category as Category];
            return (
              <Link
                key={`${entry.category}-${entry.id}`}
                to={`/wiki/${entry.category}/${entry.id}`}
                className="group flex items-start justify-between gap-4 rounded-xl border border-bark-700 bg-bark-900/50 p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-gold-500/50"
              >
                <div className="flex items-start gap-4">
                  <span className={`chip shrink-0 border ${meta.accent.split(" ")[1]}`}>
                    {meta.singular}
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-bark-50 group-hover:text-gold-300">
                      {entry.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-bark-300">{entry.blurb}</p>
                  </div>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-bark-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-400" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
