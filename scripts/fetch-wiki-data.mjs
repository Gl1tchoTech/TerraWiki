#!/usr/bin/env bun
/**
 * Downloads the Official Terraria Wiki data dumps used by generate-items.mjs:
 *  - Module:Iteminfo/data  -> scripts/data/iteminfo.json   (item stats by ID)
 *  - Cargo Recipes table   -> scripts/data/recipes-all.json (current recipes)
 *
 * Usage:
 *   bun scripts/fetch-wiki-data.mjs
 */

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "scripts", "data");
mkdirSync(dataDir, { recursive: true });

const API = "https://terraria.wiki.gg/api.php";

// 1) Iteminfo data module (contains a JSON blob in Lua)
async function fetchIteminfo() {
  const url = `${API}?action=raw&title=Module:Iteminfo/data`;
  const res = await fetch(url);
  const src = await res.text();
  const m = src.match(/\["data"\] = \[=====\[([\s\S]*?)\]=====\]/);
  if (!m) throw new Error("Could not locate iteminfo JSON blob");
  const data = JSON.parse(m[1]);
  writeFileSync(join(dataDir, "iteminfo.json"), JSON.stringify(data));
  console.log(`iteminfo.json: ${Object.keys(data).length} items`);
}

// 2) Items cargo table (wiki type classification + exact image file per item page)
async function fetchItemsTypes() {
  const all = [];
  let offset = 0;
  for (;;) {
    const url = `${API}?action=cargoquery&tables=Items&fields=_pageName,type,image&limit=500&offset=${offset}&format=json&formatversion=2`;
    const j = await (await fetch(url)).json();
    const rows = (j.cargoquery || []).map((x) => x.title);
    all.push(...rows);
    if (rows.length < 500) break;
    offset += 500;
    if (offset > 30000) throw new Error("Items pagination exceeded 30000 rows");
  }
  writeFileSync(join(dataDir, "items-types.json"), JSON.stringify(all));
  console.log(`items-types.json: ${all.length} item rows (with image names)`);
}

// 3) Verify which guessed File:<Item Name>.png files exist on the wiki (batched)
async function verifyItemImages() {
  const iteminfo = JSON.parse(readFileSync(join(dataDir, "iteminfo.json"), "utf8"));
  const names = [...new Set(Object.values(iteminfo).map((it) => it.name).filter(Boolean))];
  const exists = {};
  for (let i = 0; i < names.length; i += 50) {
    const titles = names.slice(i, i + 50).map((n) => `File:${n.replace(/ /g, "_")}.png`);
    const url = `${API}?action=query&titles=${encodeURIComponent(titles.join("|"))}&format=json&formatversion=2`;
    const j = await (await fetch(url)).json();
    for (const page of j.query?.pages || []) {
      const file = page.title.replace(/^File:/, "");
      exists[file.replace(/_/g, " ").replace(/\.png$/i, "")] = !page.missing;
    }
    await new Promise((r) => setTimeout(r, 60));
  }
  writeFileSync(join(dataDir, "image-exists.json"), JSON.stringify(exists));
  const missing = names.filter((n) => !exists[n]);
  console.log(`image-exists.json: ${names.length - missing.length}/${names.length} guessed files verified`);
  if (missing.length) console.log(`  guessed missing (overridden by generator): ${missing.join(", ")}`);
}

// 4) Item page intro extracts (plain text for descriptions)
async function fetchItemExtracts() {
  const iteminfo = JSON.parse(readFileSync(join(dataDir, "iteminfo.json"), "utf8"));
  const names = [...new Set(Object.values(iteminfo).map((it) => it.name).filter(Boolean))].sort();
  const extracts = {};
  for (let i = 0; i < names.length; i += 20) {
    const batch = names.slice(i, i + 20);
    const url = `${API}?action=query&prop=extracts&exintro&explaintext&exlimit=20&titles=${encodeURIComponent(batch.join("|"))}&format=json&formatversion=2`;
    const j = await (await fetch(url)).json();
    for (const page of j.query?.pages || []) {
      if (page.extract) extracts[page.title] = page.extract;
    }
    if ((i / 20) % 5 === 0) console.log(`  item extracts: ${i}/${names.length}`);
    await new Promise((r) => setTimeout(r, 200));
  }
  writeFileSync(join(dataDir, "item-extracts.json"), JSON.stringify(extracts));
  console.log(`item-extracts.json: ${Object.keys(extracts).length} extracts`);
}

// 5) Recipes cargo table (current platforms only)
async function fetchRecipes() {
  const where = encodeURIComponent("legacy=0");
  const all = [];
  let offset = 0;
  for (;;) {
    const url = `${API}?action=cargoquery&tables=Recipes&fields=result,station,amount,ings,version&limit=500&offset=${offset}&format=json&formatversion=2&where=${where}`;
    const j = await (await fetch(url)).json();
    const rows = (j.cargoquery || []).map((x) => x.title);
    all.push(...rows);
    if (rows.length < 500) break;
    offset += 500;
    if (offset > 30000) throw new Error("Recipe pagination exceeded 30000 rows");
  }
  writeFileSync(join(dataDir, "recipes-all.json"), JSON.stringify(all));
  console.log(`recipes-all.json: ${all.length} recipes`);
}

const skip = (name) => {
  const p = join(dataDir, name);
  try { return Object.keys(JSON.parse(readFileSync(p, "utf8"))).length > 0; } catch { return false; }
};

if (!skip("iteminfo.json")) await fetchIteminfo();
if (!skip("items-types.json")) await fetchItemsTypes();
if (!skip("image-exists.json")) await verifyItemImages();
if (!skip("item-extracts.json")) await fetchItemExtracts();
if (!skip("recipes-all.json")) await fetchRecipes();
console.log("Done. Run: bun scripts/generate-items.mjs");
