#!/usr/bin/env bun
/**
 * Generates ios/TerraWiki/Resources/items.json from Official Terraria Wiki data.
 * Produces detailed, human-readable descriptions from item stats + wiki extracts.
 * Stores ALL recipes per item (not just the first one).
 *
 * Usage: bun scripts/generate-items.mjs [dataDir]
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
try { itemsTypes = JSON.parse(readFileSync(join(dataDir, "items-types.json"), "utf8")); } catch { /* ok */ }
let wikiExtracts = {};
try { wikiExtracts = JSON.parse(readFileSync(join(dataDir, "item-extracts.json"), "utf8")); } catch { /* ok */ }

// ---- wiki type / image lookup ------------------------------------------------

const wikiTypeByName = new Map();
const wikiImageByName = new Map();
for (const row of itemsTypes) {
  const name = row._pageName;
  const t = (row.type || "").split("^")[0].trim().toLowerCase();
  if (t === "set") continue;
  const im = (row.image || "").match(/File:([^|\]]+)/);
  if (t && !wikiTypeByName.has(name)) wikiTypeByName.set(name, t);
  if (im && !wikiImageByName.has(name)) wikiImageByName.set(name, decodeEntities(im[1].trim()));
}

const IMAGE_OVERRIDES = {
  "1/2 Second Timer": "1 2 Second Timer.png",
  "1/4 Second Timer": "1 4 Second Timer.png",
  "r/Terraria": "R Terraria.png",
  "r/Terraria 2023": "R Terraria 2023.png",
  "Remix": "Remix (item).png",
  "Format:C": "Format C.png",
  "Advanced Combat Techniques: Volume Two": "Advanced Combat Techniques_Volume Two.png",
};

let imageExists = {};
try { imageExists = JSON.parse(readFileSync(join(dataDir, "image-exists.json"), "utf8")); } catch { /* ok */ }

function decodeEntities(s) {
  return s.replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function imageFor(name) {
  return wikiImageByName.get(name) ?? IMAGE_OVERRIDES[name]
    ?? (imageExists[name] ? name.replace(/ /g, "_") + ".png" : null);
}

// ---- recipe index (ALL recipes per result) -----------------------------------

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();

function parseIngs(ings) {
  if (!ings) return [];
  return ings.split("^").map(seg => {
    const parts = seg.split("¦").filter(Boolean);
    if (parts.length < 2) return null;
    const name = parts[0].trim(), qty = parseInt(parts[1], 10);
    return (name && !Number.isNaN(qty)) ? { name, qty } : null;
  }).filter(Boolean);
}

const desktopRecipes = recipes.filter(r => { const v = r.version || ""; return v === "" || v.includes("desktop"); });

const recipesByResult = new Map();
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
// Convert usedIn sets to sorted arrays
const usedInArr = new Map();
for (const [name, set] of usedIn) usedInArr.set(name, [...set].sort());

// ---- helpers ------------------------------------------------------------------

function coins(copper) {
  if (!copper || copper <= 0) return null;
  const p = Math.floor(copper / 1000000), g = Math.floor((copper % 1000000) / 10000);
  const s = Math.floor((copper % 10000) / 100), c = copper % 100;
  const parts = [];
  if (p) parts.push(`${p} platinum`); if (g) parts.push(`${g} gold`);
  if (s) parts.push(`${s} silver`); if (c) parts.push(`${c} copper`);
  return parts.join(" ") || `${copper} copper`;
}

function classFlag(it) {
  if (it.melee) return "melee"; if (it.ranged) return "ranged";
  if (it.magic) return "magic"; if (it.summon) return "summon"; return null;
}

const WIKI_KIND = {
  weapon: "Weapon", armor: "Armor", vanity: "Armor", accessory: "Accessory",
  shield: "Accessory", boots: "Accessory", ammunition: "Ammo", tool: "Tool",
  block: "Block", wall: "Block", furniture: "Furniture", "crafting station": "Furniture",
  storage: "Furniture", mechanism: "Furniture", "light source": "Furniture",
  "light Source": "Furniture", "background object": "Furniture", ore: "Material",
  bar: "Material", brick: "Material", gem: "Material", "crafting material": "Material",
  seeds: "Material", potion: "Consumable", food: "Consumable", consumable: "Consumable",
  "permanent booster": "Consumable", "grab bag": "Consumable", crate: "Consumable",
  bait: "Consumable", key: "Consumable", "boss summon": "Consumable", "event summon": "Consumable",
  "item summon": "Consumable", "mount summon": "Other", "pet summon": "Other",
  "light pet": "Other", dye: "Other", "hair dye": "Other", miscellaneous: "Other",
};

function classify(it) {
  const w = wikiTypeByName.get(it.name);
  if (w && WIKI_KIND[w]) return WIKI_KIND[w];
  if (it.ammo) return "Ammo"; if (it.accessory) return "Accessory";
  if (it.headSlot || it.bodySlot || it.legSlot) return "Armor";
  if (it.pick || it.axe || it.hammer) return "Tool";
  if (it.damage && classFlag(it)) return "Weapon";
  if ((it.createTile || it.createWall) && /(Ore|Bar|Brick|Gem)$/.test(it.name)) return "Material";
  if (it.createTile || it.createWall) return "Block";
  if (it.material) return "Material"; if (it.consumable) return "Consumable";
  return "Other";
}

function rarityOf(rare) {
  if (rare === undefined || rare === null) return 1;
  if (rare === -1) return 0; if (rare === -11) return 4;
  if (rare === -12 || rare === -13) return 11;
  return Math.max(0, Math.min(11, (rare + 1)));
}

function ucfirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

const DAMAGE_CLASS = { melee: "melee", ranged: "ranged", magic: "magic", summon: "summon" };

// ---- RICH DESCRIPTION GENERATOR -----------------------------------------------

function describe(it, kind, cls) {
  const name = it.name;
  const dmg = it.damage;
  const kb = it.knockBack;
  const crit = it.crit;
  const mana = it.mana;
  const defense = it.defense ?? 0;
  const useTime = it.useTime;
  const healLife = it.healLife;
  const healMana = it.healMana;
  const pick = it.pick;
  const axe = it.axe;
  const hammer = it.hammer;
  const shoot = it.shoot;
  const fishingPole = it.fishingPole;
  const bait = it.bait;
  const buffType = it.buffType;
  const buffTime = it.buffTime;
  const lifeRegen = it.lifeRegen;
  const armorPenetration = it.armorPenetration;
  const mountType = it.mountType;
  const maxStack = it.maxStack;
  const createTile = it.createTile;
  const createWall = it.createWall;
  const potion = it.potion;
  const dye = it.dye;
  const hairDye = it.hairDye;
  const manaIncrease = it.manaIncrease;

  const paragraph = (s) => s;

  // ── Weapons ──
  if (kind === "Weapon") {
    const parts = [];
    const dc = cls ? `${ucfirst(cls)} weapon` : "Weapon";
    parts.push(`${name} is a ${dc} that deals ${dmg} base damage`);
    if (kb) parts.push(`, has ${kb} knockback`);
    if (crit) parts.push(`, and has a ${crit}% critical strike chance`);
    parts[parts.length - 1] += ". ";

    if (shoot) {
      if (it.shootSpeed) parts.push(`It fires a projectile at a speed of ${it.shootSpeed}. `);
      else parts.push(`It fires a projectile. `);
    }
    if (mana) parts.push(`Each use consumes ${mana} mana. `);
    if (useTime) {
      const speed = useTime <= 19 ? "very fast" : useTime <= 24 ? "fast" : useTime <= 29 ? "average" : useTime <= 39 ? "slow" : "very slow";
      parts.push(`It has a ${speed} use time of ${useTime}. `);
    }
    if (it.autoReuse) parts.push("It can be used continuously by holding the attack button. ");
    if (armorPenetration) parts.push(`It ignores ${armorPenetration} enemy defense. `);
    if (it.noMelee && cls === "melee" && shoot) parts.push("The blade itself does not deal contact damage; all damage comes from the projectile. ");

    return parts.join("").trim();
  }

  // ── Tools ──
  if (kind === "Tool") {
    const parts = [`${name} is a tool that can `];
    const abilities = [];
    if (pick) abilities.push(`mine blocks with ${pick}% pickaxe power`);
    if (axe) abilities.push(`chop trees with ${axe}% axe power`);
    if (hammer) abilities.push(`break walls and shape blocks with ${hammer}% hammer power`);
    parts.push(abilities.join(", ") + ". ");
    if (dmg) {
      const combatBits = [`It also deals ${dmg} ${cls || "melee"} damage when used as a weapon`];
      if (kb) combatBits.push(`with ${kb} knockback`);
      if (useTime) combatBits.push(`and a use time of ${useTime}`);
      parts.push(combatBits.join(", ") + ". ");
    }
    return parts.join("").trim();
  }

  // ── Armor ──
  if (kind === "Armor") {
    const parts = [];
    const slot = it.headSlot ? "helmet" : it.bodySlot ? "chestplate" : it.legSlot ? "leggings" : "armor piece";
    parts.push(`${name} is a ${slot} that provides ${defense} defense`);
    if (dmg && cls) parts.push(`, increases ${cls} damage by ${dmg}%`);
    if (crit) parts.push(`, with +${crit}% critical strike chance`);
    parts[parts.length - 1] += ". ";
    if (lifeRegen) parts.push(`It grants +${lifeRegen} life regeneration per second. `);
    if (manaIncrease) parts.push(`It increases maximum mana by ${manaIncrease}. `);
    if (it.bodySlot && it.setBonus) parts.push(`As part of a set, it may grant additional bonuses. `);
    if (!dmg && !crit && !lifeRegen && !manaIncrease && !it.setBonus && defense === 0) {
      parts.push(`It is a vanity item worn in the ${slot} slot for cosmetic purposes. `);
    }
    return parts.join("").trim();
  }

  // ── Accessories ──
  if (kind === "Accessory") {
    const parts = [`${name} is an accessory that can be equipped to provide various bonuses. `];
    const bonuses = [];
    if (defense) bonuses.push(`+${defense} defense`);
    if (dmg && cls) bonuses.push(`+${dmg}% ${cls} damage`);
    if (crit) bonuses.push(`+${crit}% critical strike chance`);
    if (lifeRegen) bonuses.push(`+${lifeRegen} life regen`);
    if (manaIncrease) bonuses.push(`+${manaIncrease} max mana`);
    if (armorPenetration) bonuses.push(`${armorPenetration} armor penetration`);
    if (it.moveSpeed) bonuses.push(`increased movement speed`);
    if (it.wingSlot) bonuses.push(`flight capability`);
    if (bonuses.length) parts.push(`Known bonuses: ${bonuses.join(", ")}.`);
    return parts.join(" ").trim();
  }

  // ── Ammo ──
  if (kind === "Ammo") {
    const parts = [`${name} is a type of ammunition used with ranged weapons. `];
    if (dmg) parts.push(`It deals ${dmg} damage per shot`);
    if (kb) parts.push(`, with ${kb} knockback`);
    parts[parts.length - 1] += ". ";
    if (maxStack) parts.push(`It stacks up to ${maxStack}. `);
    return parts.join("").trim();
  }

  // ── Consumable ──
  if (kind === "Consumable") {
    const parts = [`${name} is a consumable `];
    if (potion) parts.push("potion ");
    if (healLife) parts.push(`that restores ${healLife} health`);
    if (healMana) parts.push(`that restores ${healMana} mana`);
    if (buffType) {
      parts.push(`that grants a ${buffTime ? `${Math.round(buffTime / 60)} minute` : ""} buff`);
    }
    if (!healLife && !healMana && !buffType && !potion)
      parts.push("item used for a one-time effect");
    parts[parts.length - 1] += ". ";
    if (buffTime && buffType) parts.push(`The buff lasts for ${Math.round(buffTime / 60)} ${Math.round(buffTime / 60) === 1 ? "minute" : "minutes"}. `);
    if (maxStack) parts.push(`It stacks up to ${maxStack}. `);
    return parts.join("").trim();
  }

  // ── Fishing / Bait ──
  if (fishingPole) return `${name} is a fishing pole with ${fishingPole}% fishing power. It can be used to fish in any body of water.`;
  if (bait) return `${name} is bait with ${bait}% bait power. It can be used with a fishing pole to catch fish and crates.`;

  // ── Mount / Pet ──
  if (mountType !== undefined) return `${name} summons a rideable mount that allows the player to travel in unique ways. Each mount has different speed, flight, and abilities.`;
  if (it.buffType && it.buffType > 0 && kind === "Other") return `${name} summons a pet that follows the player around. Pets are purely cosmetic companions.`;

  // ── Dye ──
  if (dye || hairDye) return `${name} is a ${hairDye ? "hair " : ""}dye that changes the color of equipped ${hairDye ? "hair styles" : "armor and accessories"} when applied in a dye slot.`;

  // ── Material ──
  if (kind === "Material") {
    if (/Ore$/i.test(name)) return `${name} is an ore found underground. It can be smelted into bars at a Furnace and is used in many crafting recipes.`;
    if (/Bar$/i.test(name)) return `${name} is a metal bar refined from ore. It is a key crafting material for weapons, armor, tools, and furniture.`;
    if (/Gem$/i.test(name)) return `${name} is a gemstone found underground embedded in stone. It is used in crafting magical items, hooks, and gem-related equipment.`;
    return `${name} is a crafting material used in the creation of other items.`;
  }

  // ── Block ──
  if (kind === "Block") {
    if (createWall) return `${name} is a placeable background wall used for building and NPC housing. Walls prevent enemy spawns when fully enclosed.`;
    return `${name} is a placeable block used in building and construction. It can be placed to create structures, arenas, and housing for NPCs.`;
  }

  // ── Furniture ──
  if (kind === "Furniture") {
    return `${name} is a placeable furniture item. It can be used to decorate buildings, craft items (if it acts as a crafting station), or store items.`;
  }

  return `${name} is an item found in the world of Terraria.`;
}

// ---- tags -----------------------------------------------------------------------

function tags(it, kind, cls, hasRecipe) {
  const t = [];
  if (cls) t.push(cls);
  t.push(kind.toLowerCase());
  if (it.material) t.push("material");
  if (it.consumable) t.push("consumable");
  if (hasRecipe) t.push("crafted");
  if (it.rare === -12) t.push("expert"); if (it.rare === -13) t.push("master"); if (it.rare === -11) t.push("quest");
  if (it.defense) t.push("defense");
  if (it.pick) t.push("mining"); if (it.axe) t.push("woodcutting"); if (it.hammer) t.push("hammering");
  if (it.createTile || it.createWall) t.push("placeable");
  if (it.mountType !== undefined) t.push("mount");
  if (it.hardmode) t.push("hardmode");
  return [...new Set(t)];
}

// ---- build -----------------------------------------------------------------------

const items = [];
for (const id of Object.keys(iteminfo)) {
  const it = iteminfo[id];
  if (!it.name) continue;
  const kind = classify(it);
  const cls = classFlag(it);
  const damageStr = it.damage ? `${it.damage} ${cls ?? "melee"}` : null;

  // ALL recipes for this item
  const rawRecipes = recipesByResult.get(it.name) ?? [];
  const itemRecipes = rawRecipes.map(r => ({
    station: r.station,
    ingredients: r.ingredients,
    ...(r.resultQty > 1 ? { resultQty: r.resultQty } : {}),
  }));

  const usedInNames = usedInArr.get(it.name) ?? null;
  const isCrafted = itemRecipes.length > 0;

  const obtain = isCrafted
    ? itemRecipes.length === 1
      ? `Crafted at a ${itemRecipes[0].station}.`
      : `Crafted (${itemRecipes.length} recipes).`
    : "Obtained through world generation, enemy drops, fishing, or purchase from NPCs.";

  // Wiki extract as notes (if available)
  const extract = wikiExtracts[it.name];
  const notes = (extract && extract.length > 60) ? extract : undefined;

  // Clean wiki extract (remove ref markers, extra whitespace)
  const cleanExtract = extract
    ? extract.replace(/\[\d+\]/g, "").replace(/\{[^}]+\{[^}]+\}[^}]*\}/g, "").replace(/\s+/g, " ").trim()
    : null;

  // Description: use wiki extract if good, else rich auto-generated
  let description;
  if (cleanExtract && cleanExtract.length > 80) {
    description = cleanExtract;
  } else {
    description = describe(it, kind, cls);
  }

  const image = imageFor(it.name);

  items.push({
    id: kebab(it.internalName || it.name),
    name: it.name,
    kind,
    rarity: rarityOf(it.rare),
    damage: damageStr,
    obtain,
    ...(itemRecipes.length > 0 ? { recipe: itemRecipes[0], allRecipes: itemRecipes } : {}),
    ...(usedInNames && usedInNames.length ? { usedIn: usedInNames } : {}),
    ...(image ? { image } : {}),
    sell: coins(it.value),
    description,
    ...(notes ? { notes } : {}),
    tags: tags(it, kind, cls, isCrafted),
  });
}

items.sort((a, b) => a.name.localeCompare(b.name));
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(items, null, 2));

const kinds = {};
for (const it of items) kinds[it.kind] = (kinds[it.kind] || 0) + 1;
const withRecipes = items.filter(i => i.recipe).length;
const withNotes = items.filter(i => i.notes).length;
console.log(`Wrote ${items.length} items (${withRecipes} with recipes, ${withNotes} with wiki notes) -> ${outPath}`);
console.log("Kinds:", JSON.stringify(kinds));