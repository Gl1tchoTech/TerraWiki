#!/usr/bin/env bun
/**
 * Generates the complete offline NPC/mob/boss/mechanic databases from
 * Official Terraria Wiki data (cached in ./data by fetch-npc-data.mjs).
 *
 * Outputs:
 *   ios/TerraWiki/Resources/mobs.json      — every enemy (with stats, drops, biome)
 *   ios/TerraWiki/Resources/bosses.json    — every boss (with stats, summons, strategy)
 *   ios/TerraWiki/Resources/npcs.json      — every town NPC (wiki data + curated overlay)
 *   ios/TerraWiki/Resources/mechanics.json — every game mechanic (summary + tips)
 *
 * Usage:
 *   bun scripts/generate-catalogs.mjs [dataDir]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.argv[2] ?? join(root, "scripts", "data");
const resDir = join(root, "ios", "TerraWiki", "Resources");

const read = (name, fallback) => {
  try {
    return JSON.parse(readFileSync(join(dataDir, name), "utf8"));
  } catch {
    return fallback;
  }
};

const npcinfo = read("npcinfo.json", {});
const imageExistsNpc = read("image-exists-npc.json", {});
const pages = read("npc-pages.json", {});            // title -> lead wikitext
const enemyList = read("categories-enemies.json", []);
const bossList = read("categories-bosses.json", []);
const partList = read("categories-parts.json", []);
const projList = read("categories-projectiles.json", []);
// Skeleton Merchant is a special friendly NPC not flagged townNPC in the stats DB.
const townList = [...read("categories-town.json", []), "Skeleton Merchant"];
const aiMap = read("ai-map.json", {});
const bossFull = read("boss-pages.json", {});        // title -> full wikitext
const mechIntro = read("mechanic-pages.json", {});
const mechFull = read("mechanic-pages-full.json", {});

// Pure projectile NPC pages that should not appear as mobs (they are not enemies).
const PROJECTILE_SKIP = new Set([
  "Burning Sphere", "Chaos Ball", "Detonating Bubble", "Giant Fungi Bulb",
  "Moon Leech Clot", "Solar Flare", "Solar Fragment (NPC)", "Vile Spit", "Water Sphere",
]);
// Meta / index pages that are not actual entities.
const META_SKIP = new Set(["Bosses", "Enemies", "Mechanical bosses", "Celestial Pillars"]);

const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

// ---- wikitext -> plain text -------------------------------------------------

function plainText(src) {
  if (!src) return "";
  let t = src;
  // Remove comments and <ref>/<section> tags.
  t = t.replace(/<!--[\s\S]*?-->/g, "");
  t = t.replace(/<ref[\s\S]*?<\/ref>/gi, "");
  t = t.replace(/<ref[^>]*\/>/gi, "");
  t = t.replace(/<section[^>]*>/gi, "");
  t = t.replace(/<\/section>/gi, "");
  // Remove files/images.
  t = t.replace(/\[\[File:[^\]]*\]\]/gi, "");
  // Strip templates that wrap text: {{eil|X}}, {{tr|X}}, {{expert|X}}, {{master|X}}, {{modes|X|Y|Z}}, {{eicons|...}} etc.
  // Iterate to handle nesting (max 12 passes).
  for (let i = 0; i < 12; i++) {
    const before = t;
    t = t.replace(/\{\{(eil|etext|expert|master|classic|note|na|tr|item|desktop|mobile|console|old-gen console|switch|3ds|w|js|version|dablink|about|exclusive|infocard|options)\s*\|([^{}]*)\}\}/gi, (m, name, args) => {
      const parts = args.split("|").map((p) => p.trim());
      return parts[0] || "";
    });
    t = t.replace(/\{\{modes\s*\|([^{}]*)\}\}/gi, (m, args) => args.split("|")[0].trim());
    t = t.replace(/\{\{quotation\s*\|([^{}]*)\}\}/gi, (m, args) => args.split("|").slice(-1)[0] || "");
    t = t.replace(/\{\{[^{}]*\}\}/g, ""); // any remaining simple templates
    if (t === before) break;
  }
  // Links: [[Target|Display]] -> Display ; [[Target]] -> Target
  t = t.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2");
  t = t.replace(/\[\[([^\]]+)\]\]/g, "$1");
  // Bold/italic + horizontal rules + nowiki markers.
  t = t.replace(/'''([^']*)'''/g, "$1");
  t = t.replace(/''([^']*)''/g, "$1");
  t = t.replace(/<nowiki>|<\/nowiki>/g, "");
  t = t.replace(/\{\{-\}\}/g, "");
  // Collapse whitespace and trim each line, drop empty lines.
  t = t.replace(/\r/g, "");
  const lines = t
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
  return lines.join("\n");
}

function firstParagraphs(text, max = 2) {
  const blocks = text.split("\n\n").map((b) => b.replace(/\n+/g, " ").trim()).filter(Boolean);
  return blocks.slice(0, max).join(" ").trim();
}

function sentences(text, max) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const parts = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.slice(0, max).join(" ").trim();
}

// ---- infobox parsing ---------------------------------------------------------

function infoboxOf(src) {
  // Find {{npc infobox ... }} with proper {{ }} depth tracking, so both
  // multi-line (ending "\n}}") and single-line infoboxes are captured.
  const start = src.search(/\{\{\s*npc\s*infobox/i);
  if (start < 0) return "";
  let depth = 0;
  for (let i = start; i < src.length - 1; i++) {
    if (src[i] === "{" && src[i + 1] === "{") { depth++; i++; continue; }
    if (src[i] === "}" && src[i + 1] === "}") { depth--; i++; if (depth === 0) return src.slice(start, i + 1); }
  }
  return "";
}

function infoboxParam(box, name) {
  const m = box.match(new RegExp(`^\\|\\s*${name}\\s*=\\s*([^\\n|]+)`, "m"));
  return m ? m[1].trim() : null;
}

function infoboxParams(box, name) {
  const out = [];
  const re = new RegExp(`^\\|\\s*${name}\\s*=\\s*([^\\n|]+)`, "gm");
  let m;
  while ((m = re.exec(box))) out.push(m[1].trim());
  return out;
}function cleanImage(raw) {
  if (!raw) return null;
  let v = raw.trim();
  v = v.replace(/^\{\{.*?\}\}\s*/, ""); // leading template (e.g. {{item|...}})
  const fm = v.match(/([A-Za-z0-9 _%'()\-.,&+ ]+\.(?:png|gif|jpg|jpeg))/i);
  return fm ? fm[1].trim() : v.replace(/\s+/g, " ");
}

// Some entities' File:<Name>.png guesses differ from their page/entry names.
const IMAGE_OVERRIDES = {
  "Cat": "Town Cat.png",
  "Dog": "Town Dog.png",
  "Skeleton Merchant": "Skeleton Merchant.png",
  "Mimics": "Mimic.png",
};

// Verified File:<Name>.png guess, used when the infobox has no explicit image.
function guessedImage(title) {
  if (IMAGE_OVERRIDES[title]) return IMAGE_OVERRIDES[title];
  const name = title.replace(/_/g, " ");
  return imageExistsNpc[name] ? name.replace(/ /g, "_") + ".png" : null;
}

function imageFor(title, box) {
  return cleanImage(infoboxParam(box, "image")) ?? guessedImage(title);
}

// Split a wikitext line on "|" while respecting {{...}} nesting.
function splitPipes(line) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "{" && line[i + 1] === "{") { depth++; cur += c; continue; }
    if (c === "}" && line[i + 1] === "}" && depth > 0) { depth--; cur += c; continue; }
    if (c === "|" && depth === 0) { parts.push(cur); cur = ""; continue; }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

// {{item|Target|Display|...}} -> Display (or Target); also strips [[links]] and leftover templates.
function itemName(cell) {
  let n = cell.trim();
  const item = n.match(/\{\{item\|([^|}]+)(?:\|([^|}]+))?/i);
  if (item) n = (item[2] || item[1]).trim();
  n = n.replace(/\{\{[^{}]*\}\}/g, "").replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1").trim();
  return n;
}

function parseDrops(box) {
  const drops = [];
  for (const line of box.split("\n")) {
    if (!line.startsWith("|")) continue;
    const cells = splitPipes(line.slice(1)).map((s) => s.trim());
    if (cells.length < 2) continue;
    const PARAM = /^(cargo|cargodrops|shownpcid|notab|tabs|boxwidth|name|namesub|image|image2|imagealt|imageother|imagecaption|type|environment|environment2|environment3|auto|damage|damage2|defense|defense2|life|life2|knockback|money|hardmode|ai|banner|debuff|debuffduration|immune1|immune2|immune3|idprojectile|sound1|sound2|sound3|sound4|sound5|soundcaption1|soundcaption2|soundcaption3|soundcaption4|soundcaption5|expert|master|variant)$/i;
    if (PARAM.test(cells[0].split("=")[0].trim())) continue; // infobox params like | cargo = no
    let name = cells[0];
    if (!name || name.includes("<")) continue;
    if (name.startsWith("custom:")) {
      name = name.slice(7).trim();
      name = itemName(name);
    } else if (name.includes(":")) {
      continue; // group markers (:group:start, bonusdrop:...) and other special rows
    } else {
      name = itemName(name);
    }
    if (!name || name.includes("{")) continue;
    const qtyRaw = cells[1] || "";
    const chanceRaw = cells[2] || "";
    // Chance: strip mode wrappers and keep the first plain figure.
    let chance = chanceRaw
      .replace(/\{\{(?:modes|expert|master|classic)\s*\|/gi, "")
      .replace(/\{\{[^{}]*\}\}/g, "")
      .replace(/(?:@normal|@hardmode|@expert|#expert|#master|@master)\b/g, "")
      .trim();
    const cm = chance.match(/(\d+(?:\.\d+)?%|\d+\/\d+)/);
    if (cm) chance = cm[1];
    else chance = "";
    const qm = qtyRaw.match(/(\d+)(?:\s*[-–]\s*(\d+))?/);
    let qty = "";
    if (qm) qty = qm[2] ? `${qm[1]}–${qm[2]}` : qm[1];
    const parts = [name];
    if (qty && qty !== "1") parts.push(`×${qty}`);
    if (chance) parts.push(`(${chance})`);
    drops.push(parts.join(" "));
  }
  return drops;
}

function environment(box) {
  const envs = [...infoboxParams(box, "environment"), ...infoboxParams(box, "environment2"), ...infoboxParams(box, "environment3")];
  const cleaned = envs
    .map((e) => e.replace(/\{\{[^{}]*\}\}/g, "").replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1"))
    .join(" / ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
}

function mainNpcId(title, box) {
  const auto = infoboxParam(box, "auto");
  if (auto && /^-?\d+$/.test(auto)) return parseInt(auto, 10);
  const name = infoboxParam(box, "name");
  if (name) {
    const hit = Object.entries(npcinfo).find(([, v]) => v.name && v.name.toLowerCase() === name.toLowerCase());
    if (hit) return parseInt(hit[0], 10);
  }
  const byName = Object.entries(npcinfo).find(([, v]) => v.name && v.name.toLowerCase() === title.toLowerCase());
  if (byName) return parseInt(byName[0], 10);
  return null;
}

// Synthetic stats for bosses without a dedicated NPC ID in the stats DB.
const STAT_OVERRIDES = {
  Mechdusa: { name: "Mechdusa", lifeMax: 256800, damage: "", defense: "", value: 0, aiStyle: null, townNPC: false, friendly: false },
};

function npcFor(title, box, npcId) {
  if (npcId !== null && npcinfo[npcId]) return npcinfo[npcId];
  return STAT_OVERRIDES[title] || null;
}

function coinsText(copper) {
  if (!copper || copper <= 0) return "";
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

function statOf(npc, field) {
  const v = npc?.[field];
  return v === undefined || v === null ? "" : String(v);
}

// ---- tags --------------------------------------------------------------------

const BIOME_KEYWORDS = [
  ["forest", "Forest"], ["surface", "Surface"], ["underground", "Underground"],
  ["cavern", "Cavern"], ["jungle", "Jungle"], ["desert", "Desert"], ["snow", "Snow"],
  ["ocean", "Ocean"], ["sky", "Sky"], ["space", "Space"], ["underworld", "Underworld"],
  ["corruption", "Corruption"], ["crimson", "Crimson"], ["hallow", "Hallow"],
  ["dungeon", "Dungeon"], ["mushroom", "Mushroom"], ["lunar events", "Lunar"],
  ["beach", "Ocean"],
];

const EVENT_KEYWORDS = [
  ["blood moon", "Blood Moon"], ["goblin army", "Goblin Army"], ["pirate invasion", "Pirate Invasion"],
  ["old one's army", "Old One's Army"], ["solar eclipse", "Solar Eclipse"], ["frost legion", "Frost Legion"],
  ["pumpkin moon", "Pumpkin Moon"], ["frost moon", "Frost Moon"], ["martian madness", "Martian Madness"],
  ["lunar events", "Lunar Events"], ["slime rain", "Slime Rain"], ["sandstorm", "Sandstorm"],
  ["windy", "Windy"], ["torch god", "Torch God"],
];

function biomeTags(envText) {
  const tags = [];
  const low = ` ${envText.toLowerCase()} `;
  for (const [kw, label] of BIOME_KEYWORDS) {
    if (low.includes(` ${kw} `) || low.startsWith(`${kw} `) || low.endsWith(` ${kw}`)) {
      tags.push(kebab(label));
    }
  }
  return tags;
}

function eventTags(envText) {
  const tags = [];
  const low = envText.toLowerCase();
  for (const [kw, label] of EVENT_KEYWORDS) {
    if (low.includes(kw)) tags.push(kebab(label));
  }
  return tags;
}

// ---- descriptions ------------------------------------------------------------

function introFor(title, maxBlocks = 2) {
  const src = pages[title] || "";
  const box = infoboxOf(src);
  let rest = src.replace(box, "").replace(/\{\{\s*npc\s*infobox[\s\S]*?\n\}\}/gi, "");
  const text = plainText(rest);
  const blocks = text.split("\n\n").map((b) => b.replace(/\n+/g, " ").trim()).filter(Boolean);
  // Skip disambiguation/lore templates that may precede the real intro.
  const start = blocks.findIndex((b) => b.includes(title) || b.length > 40);
  const chosen = blocks.slice(Math.max(0, start), start + maxBlocks);
  return chosen.join(" ").trim();
}

// ============================================================================
// MOBS (every enemy)
// ============================================================================

function buildMobs() {
  const mobs = [];
  const seen = new Set();
  const bossSet = new Set(bossList);
  const partSet = new Set(partList);
  const projSet = new Set(PROJECTILE_SKIP);
  const metaSet = new Set(META_SKIP);

  const candidates = [...new Set([...enemyList, ...partList])];
  for (const title of candidates.sort()) {
    if (bossSet.has(title) || metaSet.has(title) || projSet.has(title)) continue;
    const src = pages[title] || "";
    if (src.startsWith("#REDIRECT")) continue;
    const box = infoboxOf(src);
    if (!box) continue;
    const npcId = mainNpcId(title, box);
    let npc = npcFor(title, box, npcId);
    if (!npc && title.endsWith("s")) {
      // Family pages (e.g. "Mimics") store stats under the singular NPC name.
      const singular = title.slice(0, -1);
      npc = npcFor(singular, box, mainNpcId(singular, box));
    }
    if (!npc || !npc.name) continue;
    // Friendly critters (bunnies, beetles, fish, etc.) and town NPCs are not hostile mobs.
    if (npc.friendly || npc.townNPC) continue;

    // Keep the page title for family/variant pages ("Mimics") instead of the singular NPC name.
    const entryName = npc.name === title ? npc.name : title;
    const env = environment(box);
    const hardmode = (infoboxParam(box, "hardmode") || "").toLowerCase() === "yes";
    const img = imageFor(title, box);
    const drops = parseDrops(box);
    const intro = introFor(title);
    const tags = [
      "mob",
      hardmode ? "hardmode" : "pre-hardmode",
      ...biomeTags(env),
      ...eventTags(env),
    ];
    if (partSet.has(title)) tags.push("servant");

    const id = kebab(entryName);
    if (seen.has(id)) continue;
    seen.add(id);

    mobs.push({
      id,
      name: entryName,
      tier: hardmode ? "Hardmode" : "Pre-Hardmode",
      biome: env || undefined,
      hp: statOf(npc, "lifeMax"),
      damage: statOf(npc, "damage"),
      defense: statOf(npc, "defense"),
      knockback: statOf(npc, "knockBackResist") ? `${Math.round((1 - npc.knockBackResist) * 100)}%` : undefined,
      coins: coinsText(npc.value) || undefined,
      ai: aiMap[npc.aiStyle] || undefined,
      drops,
      description: intro || `The ${npc.name} is a ${hardmode ? "Hardmode" : "pre-Hardmode"} enemy.`,
      ...(img ? { image: img } : {}),
      tags,
    });
  }
  mobs.sort((a, b) => a.name.localeCompare(b.name));
  return mobs;
}

// ============================================================================
// BOSSES
// ============================================================================

function bossTier(box, tags) {
  const hm = (infoboxParam(box, "hardmode") || "").toLowerCase() === "yes";
  return hm ? "Hardmode" : "Pre-Hardmode";
}

function extractSection(text, ...names) {
  const re = new RegExp(`^==+\\s*(?:${names.join("|")})\\s*==+\\s*$`, "mi");
  const m = text.match(re);
  if (!m) return "";
  const after = text.slice(m.index + m[0].length);
  const end = after.search(/^==+\s/m);
  return end >= 0 ? after.slice(0, end) : after;
}

function summonFrom(full, intro) {
  const sumSection = extractSection(full, "Summoning", "Summon");
  if (sumSection) {
    const t = sentences(plainText(sumSection).replace(/\n+/g, " "), 3);
    if (t.length > 40) return t;
  }
  // Collect sentences that actually describe summoning/spawning, preferring the intro.
  const text = plainText(full).replace(/^==+[^=\n]*==+$/gm, " ").replace(/\n+/g, " ");
  const parts = text.split(/(?<=[.!?])\s+/);
  const hits = [];
  for (const s of parts) {
    const clean = s.trim();
    if (!clean || /^\d+\.\d+/.test(clean) || /not to be confused/i.test(clean) || clean.length < 40) continue;
    if (/\bsummon\w*\b|\bcan be fought\b|\bwill appear\b|\bspawns? naturally\b|\bcan be encountered\b/i.test(clean)) {
      hits.push(clean);
      if (hits.length >= 2) break;
    }
  }
  if (hits.length) return hits.join(" ");
  return intro;
}

function tipsFrom(full) {
  const tips = extractSection(full, "Tips", "Strategy");
  if (!tips) return "";
  const bullets = tips
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("*"));
  const picked = [];
  for (const b of bullets) {
    const t = plainText(b.replace(/^\*+\s*/, "")).replace(/\s+/g, " ").trim();
    if (t.length > 25) picked.push(t);
    if (picked.length >= 4) break;
  }
  return picked.join(" ");
}

function buildBosses() {
  const bosses = [];
  const seen = new Set();
  const metaSet = new Set(META_SKIP);
  for (const title of bossList.sort()) {
    if (metaSet.has(title)) continue;
    const src = pages[title] || "";
    if (src.startsWith("#REDIRECT")) continue;
    const box = infoboxOf(src);
    if (!box) continue;
    const npcId = mainNpcId(title, box);
    const npc = npcFor(title, box, npcId);
    if (!npc || !npc.name) continue;

    const env = environment(box);
    const img = imageFor(title, box);
    const drops = parseDrops(box);
    const intro = introFor(title, 3);
    const full = bossFull[title] || "";
    const tags = [
      "boss",
      ...eventTags(env),
      ...(env.toLowerCase().includes("surface") ? [] : biomeTags(env)),
    ];
    // Prefer a plain total from the infobox (e.g. {{modes|256,800|...}}), else the primary NPC's HP.
    const lifeParam = (infoboxParam(box, "life") || "").replace(/\{\{modes\s*\|/i, "").split("|")[0].trim();
    const lifeMatch = lifeParam.match(/\d{1,3}(?:,\d{3})+/);
    const hp = lifeMatch ? lifeMatch[0] : npc.lifeMax ? Number(npc.lifeMax).toLocaleString("en-US") : "";

    const id = kebab(npc.name);
    if (seen.has(id)) continue;
    seen.add(id);

    bosses.push({
      id,
      name: npc.name,
      tier: bossTier(box, tags),
      summon: summonFrom(full, intro) || `Fight ${npc.name} in ${env || "the world"}.`,
      hp: hp || "—",
      ...(env ? { biome: env } : {}),
      drops,
      description: intro || `${npc.name} is a boss in Terraria.`,
      strategy: tipsFrom(full) || "Bring your best gear, a well-prepared arena, and plenty of healing potions.",
      ...(img ? { image: img } : {}),
      tags,
    });
  }
  bosses.sort((a, b) => a.name.localeCompare(b.name));
  return bosses;
}

// ============================================================================
// TOWN NPCS (wiki data + curated overlay)
// ============================================================================

function normalizeName(n) {
  return n.toLowerCase().replace("travell", "travel").replace(/[^a-z0-9]/g, "");
}

function roleFromIntro(title, intro) {
  const m = intro.match(/^The\s+[A-Za-z'’\- ]+?\s+is\s+([^.]{10,140})\./i);
  if (m) return m[1].trim();
  return "Town NPC";
}

function spawnFromIntro(intro) {
  const sentencesList = intro.split(/(?<=[.!?])\s+/);
  for (const s of sentencesList) {
    if (/\b(spawns?|moves? in|appears?|arrives?|found|rescued|can be met)\b/i.test(s)) {
      return sentences(s, 1).replace(/^\*+\s*/, "").replace(/:\s*$/, "").trim();
    }
  }
  return "Moves into a suitable house when the required conditions are met.";
}

function buildNpcs() {
  // Hand-curated NPC data (committed at scripts/npcs-curated.json). Entries with
  // rich hand-authored fields (quotes, services, sells, notes) are preserved;
  // everything else comes fresh from the wiki each run.
  let curated = read("../npcs-curated.json", []);
  const curatedByNorm = new Map();
  for (const c of curated) curatedByNorm.set(normalizeName(c.name), c);

  const isCurated = (c) => Boolean(c && (c.services?.length || c.sells?.length || c.quotes?.length || c.notes));

  const npcs = [];
  const seen = new Set();
  for (const title of townList.sort()) {
    const npc = Object.values(npcinfo).find((v) => v.name && v.name.toLowerCase() === title.toLowerCase());
    if (!npc) continue;
    const src = pages[title] || "";
    const box = infoboxOf(src);
    // Redirect pages (e.g. town slimes -> "Town Slimes") have no infobox; the
    // verified <Name>.png sprite still exists, so fall back to the guess.
    const img = box ? imageFor(title, box) : guessedImage(title);
    const isRedirect = src.startsWith("#REDIRECT");
    const intro = isRedirect ? "" : introFor(title);
    const isPet = npc.housingCategory === 1;
    const id = kebab(npc.name);
    if (seen.has(id)) continue;
    seen.add(id);

    const match = curatedByNorm.get(normalizeName(npc.name));
    const existing = isCurated(match) ? match : null;
    const role = existing?.role ?? (isPet ? "Town pet" : roleFromIntro(title, intro).replace(/^./, (c) => c.toUpperCase()));
    const description =
      (existing?.description ??
        (isRedirect
          ? `${npc.name} is a ${isPet ? "town pet" : "town NPC"} that lives in a suitable house and adds life to your town.`
          : intro)) || `${npc.name} is a town NPC in Terraria.`;
    npcs.push({
      id,
      name: npc.name,
      role,
      spawnCondition: existing?.spawnCondition ?? (isRedirect ? "Moves into a suitable house when the required conditions are met." : spawnFromIntro(intro)),
      services: existing?.services ?? [],
      sells: existing?.sells ?? [],
      biome: existing?.biome ?? undefined,
      likes: existing?.likes ?? undefined,
      quotes: existing?.quotes ?? undefined,
      description,
      ...(existing?.notes ? { notes: existing.notes } : {}),
      ...(img ? { image: img } : {}),
      tags: existing?.tags ?? ["town", ...(isPet ? ["pet"] : [])],
    });
  }
  npcs.sort((a, b) => a.name.localeCompare(b.name));
  return npcs;
}

// ============================================================================
// MECHANICS
// ============================================================================

function mechanicGroup(name, intro) {
  const t = `${name} ${intro}`.toLowerCase();
  if (/\b(craft|recipe|smelt|alchemy|potion|forge|anvil)\b/.test(t)) return "Crafting";
  if (/\b(fishing|bait|crate)\b/.test(t)) return "Fishing";
  if (/\b(wiring|mechanism|hoik|teleporter|actuator|logic|sensor)\b/.test(t)) return "Wiring";
  if (/\b(buff|debuff|health|mana|defense|damage reduction|lifesteal|regen)\b/.test(t)) return "Combat";
  if (/\b(combat|damage|weapon|critical|knockback|attack speed|ammo|stealth|dodge|dash|movement|velocity)\b/.test(t)) return "Combat";
  if (/\b(housing|house|town|npc happiness|pylon)\b/.test(t)) return "Town";
  if (/\b(world gen|world generation|biome spread|moon phase|day and night|wind|weather|gravity|teleportation|multiverse|secret world)\b/.test(t)) return "World";
  if (/\b(hardmode|pre-hardmode|progression|journey|classic|expert|master|difficulty|world seed)\b/.test(t)) return "Progression";
  if (/\b(event|invasion|blood moon|solar eclipse|frost moon|pumpkin moon)\b/.test(t)) return "Events";
  if (/\b(inventory|storage|loadout|mount|social|vanity|armor|rarity|minimap|map|camera|chat|emote|multiplayer|server|save)\b/.test(t)) return "Systems";
  return "Systems";
}

function buildMechanics() {
  const mechanics = [];
  const allNames = Object.keys(mechIntro).map((n) => n.toLowerCase());
  for (const title of Object.keys(mechIntro).sort()) {
    const intro = mechIntro[title] || "";
    const clean = plainText(intro).replace(/\s+/g, " ").trim();
    const summary = sentences(clean, 2);
    const how = sentences(clean.slice(summary.length), 4);
    const full = mechFull[title] || "";
    const tips = tipsFrom(full).split(" ").length > 2 ? tipsFrom(full) : "";

    const group = mechanicGroup(title, clean);
    const related = [];
    const low = ` ${clean.toLowerCase()} `;
    for (const n of allNames) {
      if (n === title.toLowerCase()) continue;
      if (low.includes(` ${n} `) || low.includes(` ${n}.`) || low.includes(` ${n},`) || low.endsWith(` ${n}`)) {
        related.push(titleCase(n));
      }
    }

    mechanics.push({
      id: kebab(title),
      name: title,
      group,
      summary: summary || `${title} is a Terraria game mechanic.`,
      howItWorks: how || summary,
      ...(tips ? { tips: tips.split(".").filter((t) => t.trim().length > 20).slice(0, 3).map((t) => t.trim() + ".") } : {}),
      ...(related.length ? { related: [...new Set(related)].slice(0, 6) } : {}),
      tags: ["mechanic", kebab(group), ...eventTags(` ${title} ${clean} `)],
    });
  }
  mechanics.sort((a, b) => a.name.localeCompare(b.name));
  return mechanics;
}

function titleCase(s) {
  return s
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// ---- write -------------------------------------------------------------------

const mobs = buildMobs();
const bosses = buildBosses();
const npcs = buildNpcs();
const mechanics = buildMechanics();

mkdirSync(resDir, { recursive: true });
writeFileSync(join(resDir, "mobs.json"), JSON.stringify(mobs, null, 2));
writeFileSync(join(resDir, "bosses.json"), JSON.stringify(bosses, null, 2));
writeFileSync(join(resDir, "npcs.json"), JSON.stringify(npcs, null, 2));
writeFileSync(join(resDir, "mechanics.json"), JSON.stringify(mechanics, null, 2));

console.log(`mobs.json: ${mobs.length} mobs`);
console.log(`bosses.json: ${bosses.length} bosses`);
console.log(`npcs.json: ${npcs.length} town NPCs`);
console.log(`mechanics.json: ${mechanics.length} mechanics`);

const noDesc = mobs.filter((m) => !m.description || m.description.length < 30).map((m) => m.name);
console.log("mobs with weak description:", noDesc.length ? noDesc.join(", ") : "none");
const noDrop = mobs.filter((m) => !m.drops.length).map((m) => m.name);
console.log("mobs with no drops:", noDrop.length ? noDrop.join(", ") : "none");
const noImg = [...mobs, ...bosses, ...npcs].filter((e) => !e.image).map((e) => e.name);
console.log("entries without image:", noImg.length ? noImg.join(", ") : "none");
