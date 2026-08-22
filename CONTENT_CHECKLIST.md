# TerraWiki content checklist

This is the working roadmap for filling TerraWiki in manageable content batches. We will complete one section or batch per message, verify it, and then continue with the next one. The app is a native SwiftUI iOS app with bundled JSON fallback data and Official Terraria Wiki syncing.

## How we will work

- [ ] Use the Official Terraria Wiki (`terraria.wiki.gg`) as the reference source for each batch.
- [ ] Record the target game/platform version for every batch; currently target Desktop Terraria **1.4.5.7**.
- [ ] Add content in small, reviewable batches instead of attempting one giant data commit.
- [ ] Keep the app usable offline: every completed batch needs bundled fallback data or a clearly documented offline limitation.
- [ ] Give every entry a stable ID, category, search tags, source page, and artwork when the wiki provides suitable artwork.
- [ ] Add the appropriate detail fields, related-entry links, and navigation before marking a batch complete.
- [ ] Add/update fixture and UI/data tests for counts, decoding, search, links, and important representative entries.
- [ ] Preserve the existing unsigned IPA workflow; each completed batch must pass the simulator tests and unsigned device IPA build.

## Baseline already present

- [x] Native iOS SwiftUI product shell and TerraWiki branding.
- [x] Split navigation and smaller reference-style list rows.
- [x] Stable domain models for starter items, NPCs, bosses, and mechanics.
- [x] Official Wiki catalog discovery for items, NPCs, mobs, bosses, and mechanics.
- [x] On-device catalog caching and offline starter-data fallback.
- [x] Search, favorites, source links, and artwork loading hooks.
- [x] GitHub Actions simulator tests and unsigned IPA packaging on every push and pull request.
- [ ] Replace generic live-catalog detail pages with complete parsed, structured details for each catalog type.
- [x] Grow the small bundled starter database into a complete offline database (6,180 items with stats, rarity, sell value, recipes, and used-in links).

---

## Batch 01 — Data foundation and version coverage

- [ ] Define the canonical schema for items, recipes, NPCs, enemies, bosses, projectiles, buffs/debuffs, biomes, events, mechanics, achievements, and guides.
- [ ] Add schema/version metadata and a visible “Data version” label in the app.
- [ ] Define stable IDs and aliases for renamed, platform-specific, legacy, and multi-form entries.
- [ ] Add source URL and last-verified metadata to every entry type.
- [ ] Add a consistent artwork reference field with an SF Symbol fallback.
- [ ] Add validation for duplicate IDs, duplicate names, broken related links, empty required fields, and invalid references.
- [ ] Document inclusion rules for Desktop 1.4.5.7 versus Console/Mobile/platform-exclusive content.

## Batch 02 — Items: core catalog and materials

- [x] Blocks and placed tiles (3,002 block items).
- [x] Ores, bars, gems, dyes, paints, and other raw materials (344 material items).
- [x] Crafting materials and enemy/boss drop materials.
- [x] Plants, seeds, herbs, mushrooms, and harvestable resources.
- [x] Potions, flasks, food, drinks, and consumables (350 consumable items).
- [x] Coins, currency, crates, bags, presents, and treasure containers.
- [x] Tools, pickaxes, drills, axes, hammers, fishing tools, and multifunction tools (165 tool items).
- [x] Item IDs, stack sizes, rarity, sell value, and tool power.
- [ ] Research count, use time, and use animation fields surfaced on detail pages.
- [x] Complete item detail pages with source art, acquisition, recipes, uses, and related entries.

## Batch 03 — Items: weapons and combat equipment

- [x] Melee weapons, yoyos, boomerangs, flails, and launchers (468 weapon items).
- [x] Bows, repeaters, guns, launchers, and other ranged weapons.
- [x] Magic weapons and spell tomes.
- [x] Minion-summoning weapons, sentries, whips, and summon accessories.
- [x] Explosives, thrown weapons, and miscellaneous weapons.
- [x] Ammunition and special ammunition types (83 ammo items).
- [x] Weapon damage, knockback, use time, critical chance, mana use, autoswing, and rarity.
- [x] Weapon class filters and class progression tags.
- [ ] Projectile or alternate-function information where applicable.

## Batch 04 — Items: armor, accessories, mounts, and vanity

- [x] Head, body, and leg armor pieces (649 armor items).
- [ ] Complete armor sets, set bonuses, and class associations.
- [x] Wings and flight accessories.
- [x] Movement, combat, defensive, informational, and utility accessories (507 accessories).
- [x] Hooks, minecarts, mounts, mount-summoning items, and pets (425 other items).
- [x] Light pets, vanity armor, dyes, hairstyles, and vanity accessories.
- [ ] Loadout, social-slot, equip-slot, and modifier information.
- [x] Armor defense values.
- [ ] Armor set effects and progression grouping.

## Batch 05 — Recipes, crafting, and item relationships

- [x] Every craftable item and all alternate recipes (3,412 craftable items, 3,954 recipe rows).
- [x] Crafting stations and station upgrade relationships.
- [x] Ingredient quantities and interchangeable ingredients.
- [x] “Used to craft” and “crafted from” reverse lookups.
- [x] Shimmer transmutations and decrafting relationships (station “Shimmer” recipes included).
- [ ] Extractinator, Chlorophyte Extractinator, and other special conversion sources.
- [x] Angler quest items and fishing catches.
- [ ] Recipe search by item, ingredient, station, and progression stage.

## Batch 06 — Town NPCs and friendly characters

- [ ] All town NPCs and their alternate forms.
- [ ] Guide, Merchant, Nurse, Demolitionist, Dye Trader, Angler, and other early-game NPCs.
- [ ] Hardmode town NPCs and progression-unlocked NPCs.
- [ ] Old Man, Clothier, Tax Collector, Skeleton Merchant, Traveling Merchant, and other special friendly NPCs.
- [ ] Town pets and pet licenses.
- [ ] NPC unlock conditions, housing requirements, services, inventories, and biome preferences.
- [ ] Happiness likes/dislikes, pylons, quotes, and named variants.
- [ ] NPC sprite/artwork support and variant navigation.

## Batch 07 — Enemies and hostile mobs

- [ ] Surface enemies by biome.
- [ ] Underground, Cavern, Underworld, and dungeon enemies.
- [ ] Corruption, Crimson, Hallow, Jungle, Snow, Desert, Ocean, and Mushroom enemies.
- [ ] Hardmode enemies and biome-specific Hardmode variants.
- [ ] Event waves and invasion enemies.
- [ ] Critters, hostile critters, town slimes, and transformation variants.
- [ ] Enemy health, damage, defense, knockback resistance, AI/behavior, banners, and drops.
- [ ] Spawn conditions, time/weather requirements, biome requirements, and rare variants.
- [ ] Filters for biome, difficulty, event, progression, and enemy type.

## Batch 08 — Bosses, mini-bosses, and boss servants

- [ ] Pre-Hardmode bosses and their forms.
- [ ] Hardmode bosses and their forms.
- [ ] Event bosses and invasion bosses.
- [ ] Mini-bosses and rare encounter bosses.
- [ ] Boss servants, hands, parts, minions, and phase-specific forms.
- [ ] Summoning items, summon conditions, despawn rules, and arena requirements.
- [ ] Boss health, defense, damage, phases, immunities, and behavior.
- [ ] Drops, treasure bags, relics, trophies, masks, pets, and expert/master rewards.
- [ ] Boss progression order, preparation guides, and strategy sections.

## Batch 09 — World generation, biomes, and environments

- [ ] Forest, Underground, Cavern, and Underworld.
- [ ] Desert, Underground Desert, Snow, Ice, Jungle, and Underground Jungle.
- [ ] Ocean, Sky, Space, Glowing Mushroom, and Granite/Marble caves.
- [ ] Corruption, Crimson, Hallow, and their underground variants.
- [ ] Dungeon, Temple, Shimmer, Aether, and special structures.
- [ ] Floating Islands, Living Trees, Pyramid, Spider Caves, and generated structures.
- [ ] Biome keys, artificial biomes, biome detection, and music/background rules.
- [ ] World evil, world seed settings, difficulty modes, and secret seeds.
- [ ] World generation objects, chests, traps, statues, paintings, and ambient objects.

## Batch 10 — Game systems and progression mechanics

- [ ] Character creation, health, mana, defense, stats, modifiers, and damage classes.
- [ ] Difficulty modes: Classic, Expert, Master, and Journey.
- [ ] Game progression, boss milestones, Hardmode transition, and event unlocks.
- [ ] NPC housing, happiness, pylons, town management, and spawn rules.
- [ ] Inventory, chests, storage, sorting, quick stack, favorite, research, and Journey duplication.
- [ ] Buffs, debuffs, immunity frames, healing, mana, death, respawn, and spawn points.
- [ ] Rarity, prefixes, reforging, modifiers, and value calculations.
- [ ] Time, moon phases, weather, wind, rain, sandstorms, and fishing conditions.
- [ ] Luck, torch luck, shimmer, transmutation, and permanent upgrades.

## Batch 11 — Building, wiring, farming, and fishing

- [ ] Building blocks, walls, platforms, furniture, decorations, and painting.
- [ ] Actuators, wires, switches, timers, logic gates, mechanisms, and teleporters.
- [ ] Traps, dart/flame/spear mechanisms, statues, and automated farms.
- [ ] NPC housing construction and valid-room rules.
- [ ] Herb, tree, mushroom, bait, critter, and enemy farms.
- [ ] Fishing power, bait, fishing quests, biome fishing, lava fishing, honey fishing, and mechanics.
- [ ] Fishing catches, crates, quest fish, fishing poles, and rewards.
- [ ] Hoiks, teleportation, liquid manipulation, and other advanced building techniques.

## Batch 12 — Events, invasions, and seasonal content

- [ ] Blood Moon, Goblin Army, Pirate Invasion, and Martian Madness.
- [ ] Old One’s Army and Eternia Crystal progression.
- [ ] Solar Eclipse, Pumpkin Moon, Frost Moon, and Lunar Events.
- [ ] Slime Rain, Sandstorm, Windy Day, and other natural events.
- [ ] Frost Legion, Christmas, Halloween, and seasonal drops.
- [ ] Tavernkeep event enemies, event tiers, wave progression, and rewards.
- [ ] Event summons, start conditions, duration, announcements, and completion effects.
- [ ] Event-specific NPCs, shops, banners, trophies, and vanity rewards.

## Batch 13 — Buffs, debuffs, status effects, and immunity

- [ ] Positive buffs and their sources/durations.
- [ ] Debuffs, damage-over-time effects, crowd-control effects, and cure methods.
- [ ] Environmental hazards and immunity accessories.
- [ ] Potion sickness, mana sickness, cooldowns, and temporary restrictions.
- [ ] Boss and enemy-specific immunities and status interactions.
- [ ] Buff/debuff search by effect, source, duration, and stack behavior.

## Batch 14 — Achievements, collections, and completion tracking

- [ ] All achievements with descriptions and unlock conditions.
- [ ] Achievement categories and progression grouping.
- [ ] Bestiary entries, kill counts, completion rules, and filters.
- [ ] Fishing collection and Angler quest tracking references.
- [ ] Item research/duplication checklist references.
- [ ] Boss checklist and event completion checklist.
- [ ] Optional local progress tracking with reset/export behavior.

## Batch 15 — Guides and reference tools

- [ ] New-character progression guide.
- [ ] Boss order and preparation guide.
- [ ] Class guides for melee, ranged, magic, summon, and hybrid builds.
- [ ] Armor and accessory progression guides.
- [ ] Mining, crafting, fishing, farming, and wiring guides.
- [ ] NPC housing, happiness, and pylon guide.
- [ ] Biome spread, purification, and world maintenance guide.
- [ ] Secret seeds, difficulty modes, and Journey mode guide.
- [ ] Searchable formulas, tables, drop chances, and comparison views.

## Batch 16 — Artwork, attribution, and offline quality

- [ ] Add artwork references for every item, NPC, mob, boss, and major mechanic where available.
- [ ] Handle alternate sprites, animation sheets, transparent backgrounds, and missing files.
- [ ] Cache artwork safely and show a consistent fallback when offline.
- [ ] Add source attribution and an “Open on Official Terraria Wiki” action to every detail page.
- [ ] Confirm that no copyrighted asset is bundled without the appropriate project attribution/usage note.
- [ ] Verify loading performance and memory usage with the full catalog.

## Batch 17 — Final QA and release readiness

- [ ] Validate every bundled JSON file and every generated catalog response.
- [ ] Test offline launch, cached catalog launch, first online sync, and interrupted sync.
- [ ] Test search across names, aliases, tags, descriptions, drops, recipes, and mechanics.
- [ ] Test split view, full-screen navigation, iPhone layouts, iPad layouts, Dynamic Type, and VoiceOver labels.
- [ ] Test favorites and deep links for every content type.
- [ ] Test artwork failures, source links, empty states, and API errors.
- [ ] Confirm app name `TerraWiki`, bundle ID `com.terraria.wiki`, and unsigned IPA packaging.
- [ ] Run simulator build and unit tests.
- [ ] Run unsigned device build and inspect the IPA artifact.
- [ ] Push the completed batch and verify the GitHub workflow finishes successfully.

## Suggested next messages

1. **Batch 01:** strengthen the schema and validation foundation.
2. **Batch 02:** expand the offline item/material database. ✅ Items catalog complete (6,180 items).
3. **Batch 03:** add the weapon and ammunition database. ✅ Complete.
4. **Batch 04:** add armor, accessories, mounts, and vanity. ✅ Mostly complete — set bonuses remaining.
5. **Batch 05:** recipes and item relationships. ✅ Complete — Extractinator edge cases remaining.
6. Continue through the numbered batches until the full offline wiki is complete.
