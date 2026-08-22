#!/usr/bin/env bun
/**
 * Generates ios/TerraWiki/Resources/items.json from Official Terraria Wiki data.
 *
 * Sources (cached in ./data or passed as args):
 *  - iteminfo.json  : Module:Iteminfo/data — full item stats keyed by item ID
 *  - recipes-all.json : Cargo `Recipes` table rows (legacy=0) for current platforms
 *
 * Fetch fresh dumps with:
 *   bun scripts/fetch-wiki-data.mjs
 *
 * Usage:
 *   bun scripts/generate-items.mjs [dataDir]
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.argv[2] ?? join(root, "scripts", "data");
const outPath = join(root, "ios", "TerraWiki", "Resources", "items.json");

const iteminfo = JSON.parse(readFileSync(join(dataDir, "iteminfo.json"), "utf8"));
const recipes = JSON.parse(readFileSync(join(dataDir, "recipes-all.json"), "utf8"));
let itemsTypes = [];
try {
  itemsTypes = JSON.parse(readFileSync(join(dataDir, "items-types.json"), "utf8"));
} catch {
  console.warn("items-types.json not found; falling back to flag-based classification");
}

// wiki type and exact image file by item name (first non-empty row wins; skip aggregate "set" rows)
const wikiTypeByName = new Map();
const wikiImageByName = new Map();
for (const row of itemsTypes) {
  const name = row._pageName;
  const t = (row.type || "").split("^")[0].trim().toLowerCase();
  if (t === "set") continue;
  const imageMatch = (row.image || "").match(/File:([^|\]]+)/);
  const image = imageMatch ? decodeEntities(imageMatch[1].trim()) : null;
  if (t && !wikiTypeByName.has(name)) wikiTypeByName.set(name, t);
  if (image && !wikiImageByName.has(name)) wikiImageByName.set(name, image);
}

// Wiki file names whose <Name>.png guess does not match the real file
const IMAGE_OVERRIDES = {
  "1/2 Second Timer": "1 2 Second Timer.png",
  "1/4 Second Timer": "1 4 Second Timer.png",
  "r/Terraria": "R Terraria.png",
  "r/Terraria 2023": "R Terraria 2023.png",
  "Remix": "Remix (item).png",
  "Format:C": "Format C.png",
  "Advanced Combat Techniques: Volume Two": "Advanced Combat Techniques_Volume Two.png",
};

// Verified guesses: File:<Item Name>.png exists on the wiki
let imageExists = {};
try {
  imageExists = JSON.parse(readFileSync(join(dataDir, "image-exists.json"), "utf8"));
} catch {
  console.warn("image-exists.json not found; image verification skipped");
}

function decodeEntities(s) {
  return s
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function imageFor(name) {
  const exact = wikiImageByName.get(name);
  if (exact) return exact;
  const override = IMAGE_OVERRIDES[name];
  if (override) return override;
  const guess = name.replace(/ /g, "_") + ".png";
  if (imageExists[name]) return guess;
  return null;
}

// ---- recipe index ---------------------------------------------------------

const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

function parseIngs(ings) {
  if (!ings) return [];
  const out = [];
  for (const seg of ings.split("^")) {
    const parts = seg.split("¦").filter(Boolean); // e.g. ["Wood","1"]
    if (parts.length < 2) continue;
    const name = parts[0].trim();
    const qty = parseInt(parts[1], 10);
    if (name && !Number.isNaN(qty)) out.push({ name, qty });
  }
  return out;
}

// Desktop-relevant platforms only: all platforms, or any row that includes desktop.
const desktopRecipes = recipes.filter((r) => {
  const v = r.version || "";
  return v === "" || v.includes("desktop");
});

// recipesByResult: result name -> recipes [{station, ingredients, amount}]
const recipesByResult = new Map();
// usedIn: ingredient name -> set of result names
const usedIn = new Map();
for (const r of desktopRecipes) {
  const ingredients = parseIngs(r.ings);
  const entry = { station: r.station || "By Hand", ingredients, resultQty: parseInt(r.amount, 10) || 1 };
  if (!recipesByResult.has(r.result)) recipesByResult.set(r.result, []);
  recipesByResult.get(r.result).push(entry);
  for (const ing of ingredients) {
    if (!usedIn.has(ing.name)) usedIn.set(ing.name, new Set());
    usedIn.get(ing.name).add(r.result);
  }
}

// ---- helpers --------------------------------------------------------------

function coins(copper) {
  if (!copper || copper <= 0) return null;
  const p = Math.floor(copper / 1000000);
  const g = Math.floor((copper % 1000000) / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  const parts = [];
  if (p) parts.push(`${p} platinum`);
  if (g) parts.push(`${g} gold`);
  if (s) parts.push(`${s} silver`);
  if (c) parts.push(`${c} copper`);
  return parts.join(" ") || `${copper} copper`;
}

function classFlag(it) {
  if (it.melee) return "melee";
  if (it.ranged) return "ranged";
  if (it.magic) return "magic";
  if (it.summon) return "summon";
  return null;
}

// wiki type -> app kind
const WIKI_KIND = {
  weapon: "Weapon",
  armor: "Armor",
  vanity: "Armor",
  accessory: "Accessory",
  shield: "Accessory",
  boots: "Accessory",
  ammunition: "Ammo",
  tool: "Tool",
  block: "Block",
  wall: "Block",
  furniture: "Furniture",
  "crafting station": "Furniture",
  storage: "Furniture",
  mechanism: "Furniture",
  "light source": "Furniture",
  "light Source": "Furniture",
  "background object": "Furniture",
  ore: "Material",
  bar: "Material",
  brick: "Material",
  gem: "Material",
  "crafting material": "Material",
  seeds: "Material",
  potion: "Consumable",
  food: "Consumable",
  consumable: "Consumable",
  "permanent booster": "Consumable",
  "grab bag": "Consumable",
  crate: "Consumable",
  bait: "Consumable",
  key: "Consumable",
  "boss summon": "Consumable",
  "event summon": "Consumable",
  "item summon": "Consumable",
  "mount summon": "Other",
  "pet summon": "Other",
  "light pet": "Other",
  dye: "Other",
  "hair dye": "Other",
  miscellaneous: "Other",
};

function classify(it) {
  const wikiType = wikiTypeByName.get(it.name);
  if (wikiType && WIKI_KIND[wikiType]) return WIKI_KIND[wikiType];
  // fallback classification from raw stats
  if (it.ammo) return "Ammo";
  if (it.accessory) return "Accessory";
  if (it.headSlot || it.bodySlot || it.legSlot) return "Armor";
  if (it.pick || it.axe || it.hammer) return "Tool";
  if (it.damage && classFlag(it)) return "Weapon";
  if ((it.createTile || it.createWall) && /(Ore|Bar|Brick|Gem)$/.test(it.name)) return "Material";
  if (it.createTile || it.createWall) return "Block";
  if (it.material) return "Material";
  if (it.consumable) return "Consumable";
  return "Other";
}

function rarityOf(rare) {
  // wiki iteminfo rare: -1 junk(gray), 0 white ... 10 red, -11 quest, -12 expert, -13 master
  if (rare === undefined || rare === null) return 1;
  if (rare === -1) return 0; // gray
  if (rare === -11) return 4; // quest (orange-ish)
  if (rare === -12 || rare === -13) return 11; // expert/master animated
  const mapped = rare + 1; // 0->white ... 10->red
  return Math.max(0, Math.min(11, mapped));
}

function describe(it, kind, cls) {
  const dmg = it.damage ? `${it.damage} damage` : null;
  switch (kind) {
    case "Weapon": {
      const bits = [`A ${cls} weapon that deals ${dmg}`];
      if (it.knockBack) bits.push(`has ${it.knockBack} knockback`);
      if (it.crit) bits.push(`a ${it.crit}% critical strike chance`);
      if (it.mana) bits.push(`costs ${it.mana} mana per use`);
      if (it.shoot) bits.push("fires projectiles");
      if (it.autoReuse) bits.push("can be used continuously");
      return bits.join(", ") + ".";
    }
    case "Tool": {
      const bits = ["A tool"];
      if (it.pick) bits.push(`with ${it.pick}% pickaxe power`);
      if (it.axe) bits.push(`with ${it.axe}% axe power`);
      if (it.hammer) bits.push(`with ${it.hammer}% hammer power`);
      if (dmg) bits.push(`that also deals ${dmg}`);
      return bits.join(", ") + ".";
    }
    case "Armor": {
      const bits = [`An armor piece granting ${it.defense ?? 0} defense`];
      if (dmg) bits.push(`with ${dmg}`);
      return bits.join(", ") + ".";
    }
    case "Accessory": {
      const bits = ["An accessory that can be equipped for passive bonuses"];
      if (it.defense) bits.push(`granting ${it.defense} defense`);
      if (dmg) bits.push(`dealing ${dmg} when it hits`);
      return bits.join(", ") + ".";
    }
    case "Ammo": {
      const bits = ["Ammunition for ranged weapons"];
      if (dmg) bits.push(`dealing ${dmg}`);
      return bits.join(", ") + ".";
    }
    case "Material":
      return "A crafting material used in the creation of other items.";
    case "Consumable": {
      if (it.healLife) return `A consumable that restores ${it.healLife} health when used.`;
      if (it.healMana) return `A consumable that restores ${it.healMana} mana when used.`;
      return "A consumable item used for a one-time effect.";
    }
    case "Block":
      return "A placeable block used in building and construction.";
    case "Furniture":
      return "A placeable furniture or station item used in building and decoration.";
    default:
      return "A miscellaneous item found in Terraria.";
  }
}

function tags(it, kind, cls, hasRecipe) {
  const t = [];
  if (cls) t.push(cls);
  if (kind === "Weapon") t.push("weapon");
  if (kind === "Tool") t.push("tool");
  if (kind === "Armor") t.push("armor");
  if (kind === "Accessory") t.push("accessory");
  if (kind === "Material") t.push("material");
  if (kind === "Consumable") t.push("consumable");
  if (kind === "Ammo") t.push("ammo");
  if (kind === "Block") t.push("block");
  if (kind === "Furniture") t.push("furniture");
  if (kind === "Other") t.push("other");
  if (it.material) t.push("material");
  if (it.consumable) t.push("consumable");
  if (hasRecipe) t.push("crafted");
  if (it.rare === -12) t.push("expert");
  if (it.rare === -13) t.push("master");
  if (it.rare === -11) t.push("quest");
  if (it.defense) t.push("defense");
  if (it.pick) t.push("mining");
  if (it.axe) t.push("woodcutting");
  if (it.hammer) t.push("hammering");
  if (it.placeable) t.push("placeable");
  if (it.mount) t.push("mount");
  return [...new Set(t)];
}

// ---- build -----------------------------------------------------------------

const items = [];
for (const id of Object.keys(iteminfo)) {
  const it = iteminfo[id];
  if (!it.name) continue;
  const kind = classify(it);
  const cls = classFlag(it);
  const damageStr = it.damage ? `${it.damage} ${cls ?? "melee"}` : null;
  const recipesFor = recipesByResult.get(it.name) ?? null;
  const recipe =
    recipesFor && recipesFor.length > 0
      ? {
          station: recipesFor[0].station,
          ingredients: recipesFor[0].ingredients,
          resultQty: recipesFor[0].resultQty > 1 ? recipesFor[0].resultQty : undefined,
        }
      : null;
  const usedInNames = usedIn.get(it.name);
  const usedInList = usedInNames ? [...usedInNames].sort() : null;
  const obtain = recipe
    ? recipe.station === "By Hand"
      ? "Crafted by hand."
      : `Crafted at a ${recipe.station}.`
    : "Found or dropped during gameplay — see the Official Terraria Wiki for exact sources.";

  const image = imageFor(it.name);
  items.push({
    id: kebab(it.internalName || it.name),
    name: it.name,
    kind,
    rarity: rarityOf(it.rare),
    damage: damageStr,
    obtain,
    ...(recipe ? { recipe } : {}),
    ...(usedInList && usedInList.length ? { usedIn: usedInList } : {}),
    ...(image ? { image } : {}),
    sell: coins(it.value),
    description: describe(it, kind, cls),
    tags: tags(it, kind, cls, Boolean(recipe)),
  });
}

items.sort((a, b) => a.name.localeCompare(b.name));
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(items, null, 2));

const kinds = {};
for (const it of items) kinds[it.kind] = (kinds[it.kind] || 0) + 1;
console.log(`Wrote ${items.length} items -> ${outPath}`);
console.log("Kinds:", JSON.stringify(kinds));
console.log("With recipes:", items.filter((i) => i.recipe).length);
