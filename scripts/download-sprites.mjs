#!/usr/bin/env bun
/**
 * Downloads all item/NPC/mob/boss sprites so they ship inside the app bundle
 * (fully offline). Files keep their exact wiki filename (e.g. "Iron Pickaxe.png");
 * at runtime UIImage(named:) resolves "<name>" from the bundle.
 *
 * Strategy: batch-resolve direct CDN URLs via the Fandom Terraria API
 * (same sprites as the official wiki), burst-download from the global CDN,
 * then fall back to terraria.wiki.gg Special:FilePath for any misses.
 *
 * Checkpointed: safe to rerun; resumes where the last run stopped.
 * Usage: bun scripts/download-sprites.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const spriteDir = join(root, "ios", "TerraWiki", "Resources", "Sprites");
mkdirSync(spriteDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Collect all unique image filenames
const imageFiles = new Set();

function addImages(path) {
  try {
    const data = JSON.parse(readFileSync(path, "utf8"));
    const arr = Array.isArray(data) ? data : [data];
    for (const entry of arr) {
      const img = entry.image;
      if (img && img.endsWith(".png")) imageFiles.add(img);
    }
  } catch { /* skip */ }
}

const items = JSON.parse(readFileSync(join(root, "ios/TerraWiki/Resources/items.json"), "utf8"));
items.forEach((it) => { if (it.image) imageFiles.add(it.image); });
addImages(join(root, "ios/TerraWiki/Resources/npcs.json"));
addImages(join(root, "ios/TerraWiki/Resources/mobs.json"));
addImages(join(root, "ios/TerraWiki/Resources/bosses.json"));

console.log(`Total unique images referenced: ${imageFiles.size}`);

// Checkpoint lives outside the resource folder so it never ships in the app.
const checkpointPath = join(root, "scripts", "data", "sprites-checkpoint.json");
mkdirSync(dirname(checkpointPath), { recursive: true });
let done = new Set();
if (existsSync(checkpointPath)) {
  try { done = new Set(JSON.parse(readFileSync(checkpointPath, "utf8"))); } catch {}
}

// Queue is based on what is actually on disk, not just the checkpoint,
// so files marked "tried" during earlier throttled runs get retried.
const pending = [...imageFiles].filter((f) => !existsSync(join(spriteDir, f)));
console.log(`On disk already: ${imageFiles.size - pending.length}, pending: ${pending.length}`);
if (pending.length === 0) process.exit(0);

// ── Phase 1: resolve CDN URLs in batches of 50 via the Fandom API ──

const urlCachePath = join(root, "scripts", "data", "sprite-urls.json");
let resolved = existsSync(urlCachePath)
  ? JSON.parse(readFileSync(urlCachePath, "utf8"))
  : {};

const unresolved = pending.filter((f) => !resolved[f]);
for (let i = 0; i < unresolved.length; i += 50) {
  const titles = unresolved.slice(i, i + 50).map((f) => `File:${f}`);
  const api = "https://terraria.fandom.com/api.php?action=query&prop=imageinfo&iiprop=url&format=json&formatversion=2&titles=" +
    encodeURIComponent(titles.join("|"));
  try {
    const res = await fetch(api);
    if (res.ok) {
      const j = await res.json();
      for (const page of j.query?.pages ?? []) {
        const file = page.title.replace(/^File:/, "");
        const url = page.imageinfo?.[0]?.url;
        if (url && !page.missing) resolved[file] = url;
      }
    }
  } catch (e) {
    console.log(`  resolve error at ${i}: ${e.message}; waiting 5s`);
    await sleep(5000);
  }
  if ((i / 50) % 20 === 0) writeFileSync(urlCachePath, JSON.stringify(resolved));
}
writeFileSync(urlCachePath, JSON.stringify(resolved));
console.log(`Resolved CDN urls: ${Object.keys(resolved).length}`);

// ── Phase 2: download from the CDN with concurrency, wiki.gg fallback ──

const CONCURRENCY = 6;
const queue = pending.filter((f) => !existsSync(join(spriteDir, f)));

async function fetchCDN(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function downloadOne(file) {
  // Skip files already present on disk from previous runs.
  if (existsSync(join(spriteDir, file))) return;

  let buf = null;
  // MediaWiki normalizes "_" to " " in titles, so try both key forms.
  const cdnUrl = resolved[file] ?? resolved[file.replace(/_/g, " ")];
  if (cdnUrl) {
    try { buf = await fetchCDN(cdnUrl); } catch { /* fall through */ }
  }
  if (!buf || buf.length < 100) {
    // Fallback: official wiki Special:FilePath
    try {
      buf = await fetchCDN(
        `https://terraria.wiki.gg/wiki/Special:FilePath/${encodeURIComponent(file)}?width=128`
      );
    } catch {
      return; // leave unhandled; retried on next run
    }
  }
  writeFileSync(join(spriteDir, file), buf);
}

let cursor = 0;
let completed = 0;
async function worker() {
  while (cursor < queue.length) {
    const file = queue[cursor++];
    await downloadOne(file);
    done.add(file);
    completed++;
    if (completed % 200 === 0) {
      console.log(`  ${completed}/${queue.length} downloaded`);
      writeFileSync(checkpointPath, JSON.stringify([...done]));
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

writeFileSync(checkpointPath, JSON.stringify([...done]));
const have = imageFiles.size - pending.filter((f) => !existsSync(join(spriteDir, f))).length;
console.log(`Done. ${have}/${imageFiles.size} images now bundled.`);
