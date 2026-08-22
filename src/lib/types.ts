export type Category = "items" | "npcs" | "bosses" | "mechanics";

export type ItemKind =
  | "Weapon"
  | "Tool"
  | "Armor"
  | "Accessory"
  | "Material"
  | "Consumable"
  | "Block"
  | "Furniture"
  | "Ammo";

export interface Recipe {
  station: string;
  ingredients: { name: string; qty: number }[];
  resultQty?: number;
}

export interface Item {
  id: string;
  name: string;
  kind: ItemKind;
  rarity: number;
  hardmode?: boolean;
  tier?: "Pre-Hardmode" | "Hardmode" | "Endgame";
  damage?: string;
  obtain: string;
  recipe?: Recipe;
  usedIn?: string[];
  sell?: string;
  description: string;
  notes?: string;
  tags: string[];
}

export interface Npc {
  id: string;
  name: string;
  role: string;
  spawnCondition: string;
  services: string[];
  sells?: string[];
  biome?: string;
  likes?: string[];
  quotes?: string[];
  description: string;
  notes?: string;
  tags: string[];
}

export interface Boss {
  id: string;
  name: string;
  tier: "Pre-Hardmode" | "Hardmode";
  summon: string;
  hp: string;
  biome?: string;
  drops: string[];
  description: string;
  strategy: string;
  tags: string[];
}

export interface Mechanic {
  id: string;
  name: string;
  group:
    | "Progression"
    | "World"
    | "Combat"
    | "Systems"
    | "Events"
    | "Building";
  summary: string;
  howItWorks: string;
  tips?: string[];
  related?: string[];
  tags: string[];
}

export interface WikiEntry {
  id: string;
  name: string;
  category: Category;
  blurb: string;
  tags: string[];
  tier?: string;
  group?: string;
}
