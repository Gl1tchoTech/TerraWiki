#!/usr/bin/env bun
/**
 * Downloads the Official Terraria Wiki data dumps used by generate-items.mjs:
 *  - Module:Iteminfo/data  -> scripts/data/iteminfo.json   (item stats by ID)
 *  - Cargo Recipes table   -> scripts/data/recipes-all.json (current recipes)
 *
 * Usage:
 *   bun scripts/fetch-wiki-data.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
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

// 2) Items cargo table (wiki type classification per item page)
async function fetchItemsTypes() {
  const all = [];
  let offset = 0;
  for (;;) {
    const url = `${API}?action=cargoquery&tables=Items&fields=_pageName,type&limit=500&offset=${offset}&format=json&formatversion=2`;
    const j = await (await fetch(url)).json();
    const rows = (j.cargoquery || []).map((x) => x.title);
    all.push(...rows);
    if (rows.length < 500) break;
    offset += 500;
    if (offset > 30000) throw new Error("Items pagination exceeded 30000 rows");
  }
  writeFileSync(join(dataDir, "items-types.json"), JSON.stringify(all));
  console.log(`items-types.json: ${all.length} item rows`);
}

// 3) Recipes cargo table (current platforms only)
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

await fetchIteminfo();
await fetchItemsTypes();
await fetchRecipes();
console.log("Done. Run: bun scripts/generate-items.mjs");
