import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Search, Sprout } from "lucide-react";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { to: "/wiki", label: "Guide" },
  { to: "/wiki/items", label: "Items" },
  { to: "/wiki/npcs", label: "NPCs" },
  { to: "/wiki/bosses", label: "Bosses" },
  { to: "/wiki/mechanics", label: "Mechanics" },
];

function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={submit} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bark-300" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search items, NPCs, bosses…"
        autoFocus={autoFocus}
        className="w-full rounded-md border border-bark-700 bg-ink-deep/80 py-2 pl-9 pr-16 font-body text-sm text-bark-50 placeholder:text-bark-300/70 outline-none transition-colors focus:border-gold-500"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded border border-bark-600 bg-bark-800 px-2 py-0.5 font-display text-[11px] font-semibold uppercase text-bark-200 transition-colors hover:bg-bark-700 hover:text-white"
      >
        Go
      </button>
    </form>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-md border border-moss-600 bg-ink-deep shadow-pixel">
        <Sprout className="h-5 w-5 text-moss-300" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-bark-50">
          Terra<span className="text-gold-400">Wiki</span>
        </span>
      )}
    </Link>
  );
}

export default function Layout() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-ink-deep text-bark-50">
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-bark-800/80 bg-ink/90 backdrop-blur transition-shadow",
          scrolled && "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/wiki"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 font-display text-sm font-medium uppercase tracking-wide transition-colors",
                    isActive
                      ? "bg-bark-800 text-gold-400"
                      : "text-bark-200 hover:bg-bark-900 hover:text-white"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto w-full max-w-xs">
            <SearchBox />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-bark-800/60 px-4 py-1.5 lg:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/wiki"}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-md px-3 py-1 font-display text-xs font-medium uppercase tracking-wide transition-colors",
                  isActive
                    ? "bg-bark-800 text-gold-400"
                    : "text-bark-200 hover:bg-bark-900"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-bark-800 bg-ink">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="max-w-md text-sm text-bark-300">
              A community field guide to Terraria 1.4.5.7 — items, recipes, NPCs, bosses, and
              mechanics.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-bark-300">
            <BookOpen className="h-4 w-4" />
            <span>Not affiliated with Re-Logic. Terraria © Re-Logic.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
