#!/usr/bin/env bun
/**
 * Downloads Official Terraria Wiki data for the NPC/mob/boss/mechanic catalogs:
 *  - Module:Npcinfo/data        -> scripts/data/npcinfo.json       (stats for every NPC ID)
 *  - Category trees             -> scripts/data/categories-*.json  (enemy/boss page lists)
 *  - NPC lead sections          -> scripts/data/npc-pages.json     (infobox + intro per page)
 *  - NPC page categories        -> scripts/data/npc-page-cats.json (tier/biome/event flags)
 *  - Mechanic page intros       -> scripts/data/mechanic-pages.json
 *  - Boss + town NPC full text  -> scripts/data/boss-pages.json    (for tips/strategy sections)
 *
 * Usage:
 *   bun scripts/fetch-npc-data.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "scripts", "data");
mkdirSync(dataDir, { recursive: true });

const API = "https://terraria.wiki.gg/api.php";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch with polite backoff; the wiki rate-limits aggressive scripts.
async function fetchJSON(url, retries = 6) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) {
      const j = await res.json();
      if (j?.error?.code === "ratelimited") {
        // fall through to backoff
      } else {
        return j;
      }
    }
    if (attempt >= retries) throw new Error(`fetch failed after ${retries} retries: ${res.status}`);
    const wait = 3000 * 2 ** attempt + Math.random() * 1000;
    console.log(`  rate-limited (${res.status}); waiting ${Math.round(wait / 1000)}s (attempt ${attempt + 1})`);
    await sleep(wait);
  }
}

// ---- 1) NPC stats ----------------------------------------------------------

async function fetchNpcinfo() {
  const res = await fetch("https://terraria.wiki.gg/wiki/Module:Npcinfo/data?action=raw");
  const src = await res.text();
  let start = src.indexOf("DATA START");
  if (start < 0) throw new Error("npcinfo DATA START not found");
  start = src.indexOf("\n", start) + 1;
  const end = src.indexOf("DATA END");
  if (end < 0) throw new Error("npcinfo DATA END not found");
  let lua = src.slice(start, end);
  lua = lua.slice(0, lua.lastIndexOf("}") + 1).trim();
  lua = "{" + lua.replace(/,\s*$/, "") + "}";

  let out = "";
  let inDq = false;
  let inSq = false;
  for (let i = 0; i < lua.length; i++) {
    const c = lua[i];
    if (c === '"' && !inSq && lua[i - 1] !== "\\") { inDq = !inDq; out += c; continue; }
    if (c === "'" && !inDq && lua[i - 1] !== "\\") { inSq = !inSq; out += '"'; continue; }
    if (c === "=" && !inDq && !inSq) { out += ":"; continue; }
    if (c === "," && !inDq && !inSq) {
      let j = i + 1;
      while (j < lua.length && /\s/.test(lua[j])) j++;
      if (lua[j] === "}" || lua[j] === "]") continue;
      out += c;
      continue;
    }
    if (c === "[" && !inDq && !inSq) {
      const num = lua.slice(i).match(/^\[(-?\d+)\]\s*=/);
      if (num) { out += `"${num[1]}":`; i += num[0].length - 1; continue; }
      const str = lua.slice(i).match(/^\[("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\]\s*=/);
      if (str) {
        const inner = str[1].startsWith("'") ? `"${str[1].slice(1, -1).replace(/"/g, '\\"')}"` : str[1];
        out += `${inner}:`;
        i += str[0].length - 1;
        continue;
      }
    }
    out += c;
  }
  const data = JSON.parse(out);
  writeFileSync(join(dataDir, "npcinfo.json"), JSON.stringify(data));
  console.log(`npcinfo.json: ${Object.keys(data).length} NPC entries`);
}

// ---- 2) Category trees -----------------------------------------------------

async function categoryPages(name) {
  const pending = [name];
  const visited = new Set();
  const pages = new Set();
  while (pending.length) {
    const cat = pending.pop();
    if (visited.has(cat)) continue;
    visited.add(cat);
    let cont;
    do {
    const u = `${API}?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(cat)}&cmtype=page%7Csubcat&cmlimit=500&format=json&formatversion=2${cont ? `&cmcontinue=${encodeURIComponent(cont)}` : ""}`;
    const j = await fetchJSON(u);
      for (const m of j.query?.categorymembers || []) {
        if (m.ns === 0) pages.add(m.title);
        else if (m.ns === 14 && !m.title.includes("/")) {
          const sub = m.title.replace(/^Category:/, "");
          pending.push(sub);
        }
      }
      cont = j.continue?.cmcontinue;
    } while (cont);
    await sleep(1500);
  }
  return [...pages].sort();
}

async function fetchCategories() {
  const enemyPages = await categoryPages("Enemy NPCs");
  const bossPages = await categoryPages("Boss NPCs");
  const partPages = await categoryPages("Boss Part NPCs");
  const projectilePages = await categoryPages("Projectile NPCs");
  writeFileSync(join(dataDir, "categories-enemies.json"), JSON.stringify(enemyPages));
  writeFileSync(join(dataDir, "categories-bosses.json"), JSON.stringify(bossPages));
  writeFileSync(join(dataDir, "categories-parts.json"), JSON.stringify(partPages));
  writeFileSync(join(dataDir, "categories-projectiles.json"), JSON.stringify(projectilePages));
  console.log(`enemy pages: ${enemyPages.length}, boss pages: ${bossPages.length}, parts: ${partPages.length}, projectiles: ${projectilePages.length}`);

  // Town NPCs come from the npcinfo townNPC flag (no direct category members).
  const npcinfo = JSON.parse(readJson("npcinfo.json"));
  const townNames = Object.values(npcinfo)
    .filter((v) => v.townNPC && v.name)
    .map((v) => v.name);
  writeFileSync(join(dataDir, "categories-town.json"), JSON.stringify([...new Set(townNames)]));
  console.log(`town NPC names: ${new Set(townNames).size}`);
}

// ---- 2b) Verify File:<Name>.png guesses for NPC pages ------------------------

async function verifyNpcImages() {
  const enemy = JSON.parse(readJson("categories-enemies.json"));
  const boss = JSON.parse(readJson("categories-bosses.json"));
  const town = JSON.parse(readJson("categories-town.json"));
  const names = [...new Set([...enemy, ...boss, ...town])].filter((n) => !n.includes("/"));
  const exists = {};
  for (let i = 0; i < names.length; i += 50) {
    const titles = names.slice(i, i + 50).map((n) => `File:${n.replace(/ /g, "_")}.png`);
    const u = `${API}?action=query&titles=${encodeURIComponent(titles.join("|"))}&format=json&formatversion=2`;
    const j = await fetchJSON(u);
    for (const page of j.query?.pages || []) {
      const file = page.title.replace(/^File:/, "").replace(/_/g, " ").replace(/\.png$/i, "");
      exists[file] = !page.missing;
    }
    await sleep(1500);
  }
  writeFileSync(join(dataDir, "image-exists-npc.json"), JSON.stringify(exists));
  const missing = names.filter((n) => !exists[n]);
  console.log(`image-exists-npc.json: ${names.length - missing.length}/${names.length} name-guessed sprites verified`);
  if (missing.length) console.log(`  missing guesses: ${missing.join(", ")}`);
}

// ---- 2c) AI style map -------------------------------------------------------

async function fetchAiMap() {
  const res = await fetch("https://terraria.wiki.gg/wiki/Template:Npc_infobox/AI?action=raw");
  const src = await res.text();
  const map = {};
  for (const m of src.matchAll(/__ai:name:(\d+)\|([^}]+)/g)) {
    map[m[1]] = m[2].trim();
  }
  writeFileSync(join(dataDir, "ai-map.json"), JSON.stringify(map));
  console.log(`ai-map.json: ${Object.keys(map).length} AI styles`);
}

// ---- 3) Page lead sections + categories ------------------------------------

async function queryBatched(params, key) {
  const titles = params.titles;
  const batchSize = params.batchSize ?? 50;
  const results = {};
  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize);
    let cont;
    do {
      const u = `${API}?action=query&format=json&formatversion=2&${key}=${encodeURIComponent(batch.join("|"))}&${params.rest}${cont ? `&${params.contKey}=${encodeURIComponent(cont)}` : ""}`;
      const j = await fetchJSON(u);
      for (const page of j.query?.pages || []) {
        results[page.title] = page;
      }
      cont = j.continue?.[params.contKey];
    } while (cont);
    await sleep(1500);
  }
  return results;
}

async function fetchPages() {
  const enemy = JSON.parse(readJson("categories-enemies.json"));
  const boss = JSON.parse(readJson("categories-bosses.json"));
  const town = JSON.parse(readJson("categories-town.json"));
  const all = [...new Set([...enemy, ...boss, ...town])].sort();

  // Lead sections (infobox + intro wikitext)
  const leads = await queryBatched(
    { titles: all, rest: "prop=revisions&rvslots=main&rvprop=content&rvsection=0" },
    "titles"
  );
  const leadText = {};
  for (const [title, page] of Object.entries(leads)) {
    const rev = page.revisions?.[0];
    leadText[title] = rev?.slots?.main?.content ?? "";
  }
  writeFileSync(join(dataDir, "npc-pages.json"), JSON.stringify(leadText));
  console.log(`npc-pages.json: ${Object.keys(leadText).length} lead sections`);

  // Per-page categories (tier / biome / event)
  const cats = await queryBatched(
    { titles: all, rest: "prop=categories&cllimit=200", contKey: "clcontinue" },
    "titles"
  );
  const pageCats = {};
  for (const [title, page] of Object.entries(cats)) {
    pageCats[title] = (page.categories || []).map((c) => c.title.replace(/^Category:/, ""));
  }
  writeFileSync(join(dataDir, "npc-page-cats.json"), JSON.stringify(pageCats));
  console.log(`npc-page-cats.json: ${Object.keys(pageCats).length} pages`);
}

// ---- 4) Mechanics ----------------------------------------------------------

const MECHANIC_EXCLUDED = new Set([
  "Game mechanics", "Data IDs", "List of drops", "List of tooltips", "Config.json settings",
  "Command-line parameters", "Credits", "Crossover content", "Drunk", "For the Worthy",
  "Celebration Mk 10", "Game platform", "User:Gearzein/Hardmode draft", "Bestiary",
  "Achievements", "Modifiers", "Recipes", "Crafting stations", "Buffs", "Debuffs", "Liquids",
]);

async function fetchMechanics() {
  // Direct pages of Category:Game mechanics (no subcategory recursion).
  const pages = [];
  let cont;
  do {
    const u = `${API}?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent("Game mechanics")}&cmtype=page&cmlimit=500&format=json&formatversion=2${cont ? `&cmcontinue=${encodeURIComponent(cont)}` : ""}`;
    const j = await fetchJSON(u);
    pages.push(...(j.query?.categorymembers || []).map((m) => m.title));
    cont = j.continue?.cmcontinue;
  } while (cont);
  const filtered = pages.filter((t) => !MECHANIC_EXCLUDED.has(t)).sort();
  writeFileSync(join(dataDir, "categories-mechanics.json"), JSON.stringify(filtered));
  console.log(`mechanic pages: ${filtered.length}`);

  // Intro plain-text extracts
  const extracts = await queryBatched(
    { titles: filtered, rest: "prop=extracts&exintro&explaintext&exlimit=20", batchSize: 20 },
    "titles"
  );
  const intros = {};
  for (const [title, page] of Object.entries(extracts)) {
    intros[title] = page.extract ?? "";
  }
  writeFileSync(join(dataDir, "mechanic-pages.json"), JSON.stringify(intros));
  console.log(`mechanic-pages.json: ${Object.keys(intros).length} intros`);

  // Full wikitext (for the Tips section)
  const full = await queryBatched(
    { titles: filtered, rest: "prop=revisions&rvslots=main&rvprop=content" },
    "titles"
  );
  const fullText = {};
  for (const [title, page] of Object.entries(full)) {
    fullText[title] = page.revisions?.[0]?.slots?.main?.content ?? "";
  }
  writeFileSync(join(dataDir, "mechanic-pages-full.json"), JSON.stringify(fullText));
  console.log(`mechanic-pages-full.json: ${Object.keys(fullText).length} full wikitext`);
}

// ---- 5) Full text for bosses (strategy/tips) -------------------------------

async function fetchBossFullText() {
  const boss = JSON.parse(readJson("categories-bosses.json"));
  const town = JSON.parse(readJson("categories-town.json"));
  const targets = [...new Set([...boss, ...town])].sort();
  const wikis = await queryBatched(
    { titles: targets, rest: "prop=revisions&rvslots=main&rvprop=content" },
    "titles"
  );
  const full = {};
  for (const [title, page] of Object.entries(wikis)) {
    full[title] = page.revisions?.[0]?.slots?.main?.content ?? "";
  }
  writeFileSync(join(dataDir, "boss-pages.json"), JSON.stringify(full));
  console.log(`boss-pages.json: ${Object.keys(full).length} full wikitext`);
}

function readJson(name) {
  return readFileSync(join(dataDir, name), "utf8");
}

import { readFileSync, existsSync, statSync } from "node:fs";

// Skip steps whose output already exists with real data (resumable reruns).
function done(name) {
  const p = join(dataDir, name);
  if (!existsSync(p)) return false;
  try {
    const d = JSON.parse(readFileSync(p, "utf8"));
    const n = Array.isArray(d) ? d.length : Object.keys(d).length;
    return n > 0;
  } catch {
    return false;
  }
}

await fetchNpcinfo();
if (!done("categories-enemies.json")) await fetchCategories();
if (!done("image-exists-npc.json")) await verifyNpcImages();
if (!done("ai-map.json")) await fetchAiMap();
if (!done("npc-pages.json")) await fetchPages();
if (!done("mechanic-pages.json")) await fetchMechanics();
if (!done("boss-pages.json")) await fetchBossFullText();
console.log("Done. Run: bun scripts/generate-catalogs.mjs");
