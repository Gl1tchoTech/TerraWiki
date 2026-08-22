import type { Item } from "../types";

export const items: Item[] = [
  // ── Basic tools & utility ─────────────────────────────────────────────
  {
    id: "torch",
    name: "Torch",
    kind: "Furniture",
    rarity: 0,
    obtain: "Crafted anywhere, no station required.",
    recipe: {
      station: "Hand",
      ingredients: [
        { name: "Wood", qty: 1 },
        { name: "Gel", qty: 1 },
      ],
      resultQty: 3,
    },
    sell: "10 copper",
    description:
      "A simple source of light that can be placed on walls and blocks. The backbone of every early cave dive.",
    notes: "Holding Torches increases passive light. Different woods craft tinted variants.",
    tags: ["light", "crafting", "basic"],
  },
  {
    id: "campfire",
    name: "Campfire",
    kind: "Furniture",
    rarity: 0,
    obtain: "Crafted at a Work Bench.",
    recipe: {
      station: "Work Bench",
      ingredients: [
        { name: "Wood", qty: 10 },
        { name: "Torch", qty: 5 },
      ],
    },
    description:
      "A crackling fire that grants the Cozy Fire buff, rapidly regenerating health while you stand near it.",
    notes: "The buff lingers for 30 seconds after leaving. A lifesaver during boss arenas.",
    tags: ["buff", "healing", "utility"],
  },
  {
    id: "work-bench",
    name: "Work Bench",
    kind: "Furniture",
    rarity: 0,
    obtain: "Crafted by hand from 10 Wood.",
    recipe: {
      station: "Hand",
      ingredients: [{ name: "Wood", qty: 10 }],
    },
    description:
      "The first crafting station and the gateway to nearly everything you build.",
    tags: ["station", "crafting", "basic"],
  },
  {
    id: "furnace",
    name: "Furnace",
    kind: "Furniture",
    rarity: 0,
    obtain: "Crafted at a Work Bench.",
    recipe: {
      station: "Work Bench",
      ingredients: [
        { name: "Stone Block", qty: 20 },
        { name: "Wood", qty: 4 },
        { name: "Torch", qty: 3 },
      ],
    },
    usedIn: ["Iron Bar", "Glass", "Brick"],
    description:
      "Smelts ore into bars and cooks sand into glass. Required before you can forge any metal equipment.",
    tags: ["station", "crafting", "smelting"],
  },
  {
    id: "iron-anvil",
    name: "Iron Anvil",
    kind: "Furniture",
    rarity: 0,
    obtain: "Crafted at a Work Bench.",
    recipe: {
      station: "Work Bench",
      ingredients: [{ name: "Iron Bar", qty: 5 }],
    },
    description:
      "The primary forging station for metal weapons, tools, and armor throughout the whole game.",
    notes: "The Lead Anvil (5 Lead Bars) is the equivalent in worlds with Lead ore.",
    tags: ["station", "crafting", "metal"],
  },
  {
    id: "hellforge",
    name: "Hellforge",
    kind: "Furniture",
    rarity: 2,
    obtain: "Found inside Ruined Houses in The Underworld.",
    usedIn: ["Hellstone Bar"],
    description:
      "An infernal forge that smelts Hellstone and Obsidian into Hellstone Bars — the key to pre-Hardmode's strongest gear.",
    tags: ["station", "underworld", "smelting"],
  },
  {
    id: "sawmill",
    name: "Sawmill",
    kind: "Furniture",
    rarity: 0,
    obtain: "Crafted at a Work Bench.",
    recipe: {
      station: "Work Bench",
      ingredients: [
        { name: "Wood", qty: 10 },
        { name: "Iron Bar", qty: 2 },
        { name: "Chain", qty: 1 },
      ],
    },
    description:
      "Crafts advanced wooden furniture and beds. Beds let you set your spawn point.",
    tags: ["station", "crafting", "furniture"],
  },

  // ── Weapons ───────────────────────────────────────────────────────────
  {
    id: "wooden-sword",
    name: "Wooden Sword",
    kind: "Weapon",
    rarity: 0,
    damage: "7 melee",
    obtain: "Crafted at a Work Bench.",
    recipe: {
      station: "Work Bench",
      ingredients: [{ name: "Wood", qty: 7 }],
    },
    description:
      "Your first real weapon. A trusty plank with an edge — upgrade the moment you find metal.",
    tags: ["melee", "basic", "weapon"],
  },
  {
    id: "copper-shortsword",
    name: "Copper Shortsword",
    kind: "Weapon",
    rarity: 0,
    damage: "5 melee",
    obtain: "Crafted at an Iron or Lead Anvil, or given to every new character.",
    recipe: {
      station: "Iron / Lead Anvil",
      ingredients: [{ name: "Copper Bar", qty: 7 }],
    },
    description:
      "A short, stabbing blade. Infamously part of the recipe for the ultimate sword, Zenith.",
    tags: ["melee", "basic", "weapon", "zenith"],
  },
  {
    id: "wooden-bow",
    name: "Wooden Bow",
    kind: "Weapon",
    rarity: 0,
    damage: "4 ranged",
    obtain: "Crafted at a Work Bench.",
    recipe: {
      station: "Work Bench",
      ingredients: [{ name: "Wood", qty: 10 }],
    },
    description:
      "The starter ranged weapon. Converts Wooden Arrows into a steady stream of damage.",
    tags: ["ranged", "basic", "weapon"],
  },
  {
    id: "fiery-greatsword",
    name: "Fiery Greatsword",
    kind: "Weapon",
    rarity: 2,
    damage: "40 melee",
    tier: "Pre-Hardmode",
    obtain: "Crafted at a Hellforge.",
    recipe: {
      station: "Hellforge",
      ingredients: [{ name: "Hellstone Bar", qty: 20 }],
    },
    usedIn: ["Night's Edge"],
    description:
      "A blazing two-hander that ignites enemies. One of the four swords fused into the Night's Edge.",
    notes: "In worlds with no Corruption/Crimson variant, it was historically swapped into the Volcano recipe.",
    tags: ["melee", "underworld", "weapon", "nights-edge"],
  },
  {
    id: "lights-bane",
    name: "Light's Bane",
    kind: "Weapon",
    rarity: 1,
    damage: "18 melee",
    tier: "Pre-Hardmode",
    obtain: "Crafted at an Iron or Lead Anvil.",
    recipe: {
      station: "Iron / Lead Anvil",
      ingredients: [{ name: "Demonite Bar", qty: 10 }],
    },
    usedIn: ["Night's Edge"],
    description:
      "The Corruption's corruption-touched blade, carved from Demonite. A Night's Edge ingredient.",
    notes: "The Blood Butcherer (10 Crimtane Bars) is the Crimson counterpart.",
    tags: ["melee", "corruption", "weapon", "nights-edge"],
  },
  {
    id: "muramasa",
    name: "Muramasa",
    kind: "Weapon",
    rarity: 2,
    damage: "24 melee",
    tier: "Pre-Hardmode",
    obtain: "Found in Locked Gold Chests inside the Dungeon.",
    usedIn: ["Night's Edge"],
    description:
      "A fast, glowing katana with long reach. Prized for its swing speed and a Night's Edge ingredient.",
    tags: ["melee", "dungeon", "weapon", "nights-edge"],
  },
  {
    id: "blade-of-grass",
    name: "Blade of Grass",
    kind: "Weapon",
    rarity: 2,
    damage: "28 melee",
    tier: "Pre-Hardmode",
    obtain: "Crafted at an Iron or Lead Anvil.",
    recipe: {
      station: "Iron / Lead Anvil",
      ingredients: [
        { name: "Stinger", qty: 12 },
        { name: "Jungle Spores", qty: 15 },
      ],
    },
    usedIn: ["Night's Edge"],
    description:
      "A leaf-green sword that poisons on hit. Crafted from Jungle spoils and a Night's Edge ingredient.",
    tags: ["melee", "jungle", "weapon", "nights-edge"],
  },
  {
    id: "nights-edge",
    name: "Night's Edge",
    kind: "Weapon",
    rarity: 3,
    damage: "40 melee",
    tier: "Pre-Hardmode",
    obtain: "Crafted at a Demon or Crimson Altar.",
    recipe: {
      station: "Demon / Crimson Altar",
      ingredients: [
        { name: "Muramasa", qty: 1 },
        { name: "Blade of Grass", qty: 1 },
        { name: "Fiery Greatsword", qty: 1 },
        { name: "Light's Bane / Blood Butcherer", qty: 1 },
      ],
    },
    usedIn: ["True Night's Edge"],
    description:
      "The legendary fusion of four pre-Hardmode blades. The heart of the True Night's Edge and, later, the Terra Blade.",
    tags: ["melee", "weapon", "nights-edge", "legendary"],
  },
  {
    id: "excalibur",
    name: "Excalibur",
    kind: "Weapon",
    rarity: 5,
    damage: "66 melee",
    tier: "Hardmode",
    hardmode: true,
    obtain: "Crafted at a Mythril or Orichalcum Anvil.",
    recipe: {
      station: "Mythril / Orichalcum Anvil",
      ingredients: [{ name: "Hallowed Bar", qty: 12 }],
    },
    usedIn: ["True Excalibur"],
    description:
      "A radiant Hallowed blade. Forged from the metal dropped by the mechanical bosses.",
    tags: ["melee", "hallowed", "weapon", "hardmode"],
  },
  {
    id: "true-nights-edge",
    name: "True Night's Edge",
    kind: "Weapon",
    rarity: 7,
    damage: "70 melee",
    tier: "Hardmode",
    hardmode: true,
    obtain: "Crafted at a Mythril or Orichalcum Anvil.",
    recipe: {
      station: "Mythril / Orichalcum Anvil",
      ingredients: [
        { name: "Night's Edge", qty: 1 },
        { name: "Broken Hero Sword", qty: 1 },
      ],
    },
    usedIn: ["Terra Blade"],
    description:
      "The Night's Edge tempered by a Broken Hero Sword, unlocking its true potential.",
    tags: ["melee", "weapon", "hardmode", "nights-edge"],
  },
  {
    id: "true-excalibur",
    name: "True Excalibur",
    kind: "Weapon",
    rarity: 7,
    damage: "72 melee",
    tier: "Hardmode",
    hardmode: true,
    obtain: "Crafted at a Mythril or Orichalcum Anvil.",
    recipe: {
      station: "Mythril / Orichalcum Anvil",
      ingredients: [
        { name: "Excalibur", qty: 1 },
        { name: "Broken Hero Sword", qty: 1 },
      ],
    },
    usedIn: ["Terra Blade"],
    description:
      "Excalibur reforged with a Broken Hero Sword, emitting brilliant light waves on swings.",
    tags: ["melee", "weapon", "hardmode", "hallowed"],
  },
  {
    id: "terra-blade",
    name: "Terra Blade",
    kind: "Weapon",
    rarity: 8,
    damage: "85 melee",
    tier: "Hardmode",
    hardmode: true,
    obtain: "Crafted at a Mythril or Orichalcum Anvil.",
    recipe: {
      station: "Mythril / Orichalcum Anvil",
      ingredients: [
        { name: "True Excalibur", qty: 1 },
        { name: "True Night's Edge", qty: 1 },
        { name: "Broken Hero Sword", qty: 1 },
      ],
    },
    usedIn: ["Zenith"],
    description:
      "A gleaming green blade that fires piercing projectiles. The iconic sword of Terraria and a Zenith ingredient.",
    tags: ["melee", "weapon", "hardmode", "legendary", "zenith"],
  },
  {
    id: "zenith",
    name: "Zenith",
    kind: "Weapon",
    rarity: 11,
    damage: "190 melee",
    tier: "Endgame",
    hardmode: true,
    obtain: "Crafted at a Mythril or Orichalcum Anvil after defeating the Moon Lord.",
    recipe: {
      station: "Mythril / Orichalcum Anvil",
      ingredients: [
        { name: "Terra Blade", qty: 1 },
        { name: "Meowmere", qty: 1 },
        { name: "Star Wrath", qty: 1 },
        { name: "Influx Waver", qty: 1 },
        { name: "The Horseman's Blade", qty: 1 },
        { name: "Seedler", qty: 1 },
        { name: "Starfury", qty: 1 },
        { name: "Bee Keeper", qty: 1 },
        { name: "Enchanted Sword", qty: 1 },
        { name: "Copper Shortsword", qty: 1 },
      ],
    },
    description:
      "The ultimate melee weapon. Every sword you ever swung rains down on your enemies at once.",
    tags: ["melee", "weapon", "endgame", "zenith", "legendary"],
  },
  {
    id: "meowmere",
    name: "Meowmere",
    kind: "Weapon",
    rarity: 11,
    damage: "200 melee",
    tier: "Endgame",
    hardmode: true,
    obtain: "Dropped by the Moon Lord.",
    usedIn: ["Zenith"],
    description:
      "A cat-shaped sword that fires rainbow-meowing projectiles. The Moon Lord's parting gift and a Zenith ingredient.",
    tags: ["melee", "weapon", "endgame", "moon-lord", "zenith"],
  },
  {
    id: "starfury",
    name: "Starfury",
    kind: "Weapon",
    rarity: 3,
    damage: "22 melee",
    tier: "Pre-Hardmode",
    obtain: "Found in Skyware Chests on Floating Islands.",
    usedIn: ["Zenith"],
    description:
      "Summons falling stars wherever you strike. Excellent for lighting caves and a Zenith ingredient.",
    tags: ["melee", "weapon", "sky", "zenith"],
  },
  {
    id: "enchanted-sword",
    name: "Enchanted Sword",
    kind: "Weapon",
    rarity: 3,
    damage: "24 melee",
    tier: "Pre-Hardmode",
    obtain: "Found in Enchanted Sword Shrines or Golden Crates.",
    usedIn: ["Zenith"],
    description:
      "A sword that fires a piercing magic bolt. A rare surface find and a Zenith ingredient.",
    tags: ["melee", "weapon", "zenith"],
  },

  // ── Materials & bars ─────────────────────────────────────────────────
  {
    id: "iron-bar",
    name: "Iron Bar",
    kind: "Material",
    rarity: 1,
    obtain: "Smelt 3 Iron Ore at a Furnace.",
    recipe: {
      station: "Furnace",
      ingredients: [{ name: "Iron Ore", qty: 3 }],
    },
    usedIn: ["Iron Anvil", "Chain", "Ironskin Potion"],
    description:
      "Refined iron, used for early armor, tools, and countless crafting recipes.",
    notes: "Lead Bar is the counterpart in worlds containing Lead ore.",
    tags: ["material", "metal", "smelting"],
  },
  {
    id: "demonite-bar",
    name: "Demonite Bar",
    kind: "Material",
    rarity: 1,
    obtain: "Smelt 3 Demonite Ore at a Furnace.",
    recipe: {
      station: "Furnace",
      ingredients: [{ name: "Demonite Ore", qty: 3 }],
    },
    usedIn: ["Light's Bane", "Demon Bow", "Shadow Armor"],
    description:
      "Corruption-touched metal dropped by the Eye of Cthulhu and Eater of Worlds.",
    notes: "Crimtane Bar is the Crimson equivalent.",
    tags: ["material", "corruption", "metal"],
  },
  {
    id: "hellstone-bar",
    name: "Hellstone Bar",
    kind: "Material",
    rarity: 2,
    obtain: "Smelt 3 Hellstone and 1 Obsidian at a Hellforge.",
    recipe: {
      station: "Hellforge",
      ingredients: [
        { name: "Hellstone", qty: 3 },
        { name: "Obsidian", qty: 1 },
      ],
    },
    usedIn: ["Fiery Greatsword", "Molten Armor", "Molten Pickaxe"],
    description:
      "Underworld-forged metal that powers the strongest pre-Hardmode equipment.",
    tags: ["material", "underworld", "metal"],
  },

  // ── Armor ─────────────────────────────────────────────────────────────
  {
    id: "wooden-armor",
    name: "Wooden Armor",
    kind: "Armor",
    rarity: 0,
    obtain: "Crafted at a Work Bench.",
    recipe: {
      station: "Work Bench",
      ingredients: [
        { name: "Wood (Helmet)", qty: 20 },
        { name: "Wood (Breastplate)", qty: 30 },
        { name: "Wood (Greaves)", qty: 25 },
      ],
    },
    description:
      "A full set of basic wood protection. Better than nothing — barely.",
    tags: ["armor", "basic", "defense"],
  },

  // ── Accessories ───────────────────────────────────────────────────────
  {
    id: "obsidian-shield",
    name: "Obsidian Shield",
    kind: "Accessory",
    rarity: 4,
    obtain: "Crafted at a Tinkerer's Workshop.",
    recipe: {
      station: "Tinkerer's Workshop",
      ingredients: [
        { name: "Cobalt Shield", qty: 1 },
        { name: "Obsidian Skull", qty: 1 },
      ],
    },
    usedIn: ["Ankh Shield"],
    description:
      "Grants immunity to knockback and to the Burning debuff from hot blocks.",
    tags: ["accessory", "defense", "immunity"],
  },
  {
    id: "ankh-shield",
    name: "Ankh Shield",
    kind: "Accessory",
    rarity: 7,
    tier: "Hardmode",
    hardmode: true,
    obtain: "Crafted at a Tinkerer's Workshop.",
    recipe: {
      station: "Tinkerer's Workshop",
      ingredients: [
        { name: "Ankh Charm", qty: 1 },
        { name: "Obsidian Shield", qty: 1 },
      ],
    },
    description:
      "The legendary all-rounder: immunity to knockback and nearly every debuff, plus extra defense.",
    notes: "The Ankh Charm itself combines nine separate debuff-immunity accessories.",
    tags: ["accessory", "defense", "immunity", "hardmode", "legendary"],
  },
  {
    id: "terraspark-boots",
    name: "Terraspark Boots",
    kind: "Accessory",
    rarity: 7,
    tier: "Hardmode",
    hardmode: true,
    obtain: "Crafted at a Tinkerer's Workshop.",
    recipe: {
      station: "Tinkerer's Workshop",
      ingredients: [
        { name: "Frostspark Boots", qty: 1 },
        { name: "Lava Waders", qty: 1 },
      ],
    },
    description:
      "The ultimate mobility boots: super speed, flight, ice skates, and immunity to lava and hot blocks.",
    notes: "One of the longest crafting chains in the game — worth every step.",
    tags: ["accessory", "movement", "hardmode", "legendary"],
  },
  {
    id: "bundle-of-balloons",
    name: "Bundle of Balloons",
    kind: "Accessory",
    rarity: 6,
    obtain: "Crafted at a Tinkerer's Workshop.",
    recipe: {
      station: "Tinkerer's Workshop",
      ingredients: [
        { name: "Cloud in a Balloon", qty: 1 },
        { name: "Sandstorm in a Balloon", qty: 1 },
        { name: "Blizzard in a Balloon", qty: 1 },
      ],
    },
    description:
      "Three balloons for triple jump height. A staple of high-mobility exploration builds.",
    tags: ["accessory", "movement"],
  },
  {
    id: "shield-of-cthulhu",
    name: "Shield of Cthulhu",
    kind: "Accessory",
    rarity: 4,
    obtain: "Dropped by the Eye of Cthulhu in Expert Mode (Treasure Bag).",
    description:
      "Lets you dash into enemies, dealing damage and granting brief invulnerability frames.",
    notes: "One of the best Expert-exclusive accessories for mobility in combat.",
    tags: ["accessory", "expert", "movement", "combat"],
  },
  {
    id: "cell-phone",
    name: "Cell Phone",
    kind: "Accessory",
    rarity: 4,
    tier: "Pre-Hardmode",
    obtain: "Crafted at a Tinkerer's Workshop.",
    recipe: {
      station: "Tinkerer's Workshop",
      ingredients: [
        { name: "PDA", qty: 1 },
        { name: "Magic Mirror or Ice Mirror", qty: 1 },
      ],
    },
    description:
      "Displays every piece of info imaginable and lets you teleport home. The informational endgame.",
    notes: "The PDA combines the GPS, R.E.K. 3000, Goblin Tech, and Fish Finder.",
    tags: ["accessory", "info", "utility", "legendary"],
  },

  // ── Ammo ──────────────────────────────────────────────────────────────
  {
    id: "wooden-arrow",
    name: "Wooden Arrow",
    kind: "Ammo",
    rarity: 0,
    obtain: "Crafted at a Work Bench.",
    recipe: {
      station: "Work Bench",
      ingredients: [
        { name: "Wood", qty: 1 },
        { name: "Stone Block", qty: 1 },
      ],
      resultQty: 25,
    },
    usedIn: ["Flaming Arrow", "Frostburn Arrow", "Jester's Arrow"],
    description:
      "The basic arrow for every bow. Plentiful, cheap, and upgradeable.",
    tags: ["ammo", "ranged", "basic"],
  },

  // ── Consumables / potions ─────────────────────────────────────────────
  {
    id: "bottled-water",
    name: "Bottled Water",
    kind: "Consumable",
    rarity: 0,
    obtain: "Craft near a water source with a Bottle.",
    description:
      "The base ingredient for almost every potion in Terraria.",
    tags: ["consumable", "potion", "crafting"],
  },
  {
    id: "lesser-healing-potion",
    name: "Lesser Healing Potion",
    kind: "Consumable",
    rarity: 0,
    obtain: "Crafted at a Placed Bottle or Alchemy Table.",
    recipe: {
      station: "Placed Bottle / Alchemy Table",
      ingredients: [
        { name: "Bottled Water", qty: 1 },
        { name: "Mushroom", qty: 1 },
        { name: "Gel", qty: 1 },
      ],
    },
    description: "Restores 50 health on use. The workhorse of early-game healing.",
    tags: ["consumable", "potion", "healing"],
  },
  {
    id: "ironskin-potion",
    name: "Ironskin Potion",
    kind: "Consumable",
    rarity: 0,
    obtain: "Crafted at a Placed Bottle or Alchemy Table.",
    recipe: {
      station: "Placed Bottle / Alchemy Table",
      ingredients: [
        { name: "Bottled Water", qty: 1 },
        { name: "Daybloom", qty: 1 },
        { name: "Iron Ore or Lead Ore", qty: 1 },
      ],
    },
    description:
      "Grants +8 defense for 8 minutes. A pre-boss ritual for nearly every player.",
    tags: ["consumable", "potion", "buff", "combat"],
  },
  {
    id: "spelunker-potion",
    name: "Spelunker Potion",
    kind: "Consumable",
    rarity: 0,
    obtain: "Crafted at a Placed Bottle or Alchemy Table.",
    recipe: {
      station: "Placed Bottle / Alchemy Table",
      ingredients: [
        { name: "Bottled Water", qty: 1 },
        { name: "Blinkroot", qty: 1 },
        { name: "Moonglow", qty: 1 },
        { name: "Gold Ore or Platinum Ore", qty: 1 },
      ],
    },
    description:
      "Highlights nearby ores, chests, and treasure through walls for 5 minutes.",
    tags: ["consumable", "potion", "buff", "exploration"],
  },
];
