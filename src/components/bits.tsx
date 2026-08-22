import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";
import type { Category } from "../lib/types";

export const CATEGORY_META: Record<
  Category,
  { label: string; singular: string; accent: string; blurb: string }
> = {
  items: {
    label: "Items & Recipes",
    singular: "Item",
    accent: "text-gold-400 border-gold-600/50",
    blurb: "Every item from 1.4.5.7 — weapons, tools, armor, materials, and the recipes that make them.",
  },
  npcs: {
    label: "NPCs",
    singular: "NPC",
    accent: "text-moss-300 border-moss-600/50",
    blurb: "Every town NPC and special character in 1.4.5.7 — where to find them and what they do.",
  },
  bosses: {
    label: "Bosses",
    singular: "Boss",
    accent: "text-ember-400 border-ember-500/50",
    blurb: "Every pre-Hardmode and Hardmode boss in 1.4.5.7 — summons, drops, and strategies.",
  },
  mechanics: {
    label: "Mechanics",
    singular: "Mechanic",
    accent: "text-sky-400 border-sky-500/50",
    blurb: "The systems that power 1.4.5.7 — progression, crafting, events, and world rules.",
  },
};

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-xs font-semibold uppercase tracking-[0.2em] text-moss-300",
        className
      )}
    >
      {children}
    </p>
  );
}

export function TagPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" }) {
  return (
    <span
      className={cn(
        "chip",
        tone === "gold" && "border-gold-600/60 bg-gold-500/10 text-gold-300"
      )}
    >
      {children}
    </span>
  );
}

export function StatBlock({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn("pixel-card px-4 py-3", className)}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-bark-300">
        {label}
      </p>
      <div className="mt-1 font-body text-sm font-medium text-bark-50">{value}</div>
    </div>
  );
}

export function BackLink({ to, label = "Back to the Guide" }: { to: string; label?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wide text-bark-300 transition-colors hover:text-gold-400"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      {kicker && <Kicker className="mb-3">{kicker}</Kicker>}
      <h1 className="font-display text-3xl font-bold tracking-tight text-bark-50 sm:text-4xl">
        {title}
      </h1>
      {description && <p className="mt-3 text-base text-bark-300">{description}</p>}
    </div>
  );
}
