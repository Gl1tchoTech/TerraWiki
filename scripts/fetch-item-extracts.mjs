#!/usr/bin/env bun
/**
 * Fetches item extracts with very conservative rate limiting.
 * Run multiple times until all extracts are fetched.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "scripts", "data");
mkdirSync(dataDir, { recursive: true });

const API = "https://terraria.wiki.gg/api.php";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const iteminfo = JSON.parse(readFileSync(join(dataDir, "iteminfo.json"), "utf8"));
const names = [...new Set(Object.values(iteminfo).map((it) => it.name).filter(Boolean))].sort();

const outPath = join(dataDir, "item-extracts.json");
let extracts = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {};

const remaining = names.filter((n) => !extracts[n]);
console.log(`Have ${Object.keys(extracts).length}, need ${remaining.length}`);

// Fetch only 500 per run to stay under time limit
const LIMIT = 500;
const batch = remaining.slice(0, LIMIT);

for (let i = 0; i < batch.length; i += 10) {
  const titles = batch.slice(i, i + 10);
  const url = `${API}?action=query&prop=extracts&exintro&explaintext&exlimit=10&titles=${encodeURIComponent(titles.join("|"))}&format=json&formatversion=2`;
  
  let ok = false;
  for (let attempt = 0; attempt < 3 && !ok; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.log(`  rate-limited; waiting ${5 + attempt * 5}s`);
        await sleep((5 + attempt * 5) * 1000);
        continue;
      }
      const j = await res.json();
      for (const page of j.query?.pages || []) {
        if (page.extract && !page.missing) extracts[page.title] = page.extract;
      }
      ok = true;
    } catch (e) {
      console.log(`  err: ${e.message}; retrying`);
      await sleep(3000);
    }
  }

  if (i % 100 === 0) {
    console.log(`  ${i + 10}/${batch.length} (total: ${Object.keys(extracts).length})`);
    writeFileSync(outPath, JSON.stringify(extracts));
  }
  await sleep(800); // 0.8s between batches
}

writeFileSync(outPath, JSON.stringify(extracts));
console.log(`Saved: ${Object.keys(extracts).length} extracts`);