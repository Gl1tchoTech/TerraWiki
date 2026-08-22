import Foundation
import SwiftUI

// MARK: - Domain models

enum WikiCategory: String, Codable, CaseIterable, Identifiable {
    case items, npcs, bosses, mechanics
    var id: String { rawValue }

    var label: String {
        switch self {
        case .items: return "Item"
        case .npcs: return "NPC"
        case .bosses: return "Boss"
        case .mechanics: return "Mechanic"
        }
    }
}

struct Ingredient: Codable, Hashable {
    let name: String
    let qty: Int
}

struct Recipe: Codable, Hashable {
    let station: String
    let ingredients: [Ingredient]
    let resultQty: Int?
}

struct Item: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let kind: String
    let rarity: Int
    let hardmode: Bool?
    let tier: String?
    let damage: String?
    let obtain: String
    let recipe: Recipe?
    let usedIn: [String]?
    let sell: String?
    let description: String
    let notes: String?
    let tags: [String]

    var maxStack: Int {
        switch kind {
        case "Ammo", "Material": return 999
        case "Consumable": return 99
        case "Block", "Furniture": return 999
        default: return 1
        }
    }
}

struct Npc: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let role: String
    let spawnCondition: String
    let services: [String]
    let sells: [String]
    let biome: String?
    let likes: [String]?
    let quotes: [String]?
    let description: String
    let notes: String?
    let tags: [String]
}

struct Boss: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let tier: String
    let summon: String
    let hp: String
    let biome: String?
    let drops: [String]
    let description: String
    let strategy: String
    let tags: [String]
}

struct Mechanic: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let group: String
    let summary: String
    let howItWorks: String
    let tips: [String]?
    let related: [String]?
    let tags: [String]
}

// MARK: - Rarity

enum Rarity {
    private static let labels: [Int: String] = [
        0: "Gray", 1: "White", 2: "Blue", 3: "Green", 4: "Orange",
        5: "Light Red", 6: "Pink", 7: "Light Purple", 8: "Lime",
        9: "Yellow", 10: "Cyan", 11: "Red"
    ]

    static func label(_ tier: Int) -> String {
        labels[tier] ?? "Gray"
    }

    static func color(_ tier: Int) -> Color {
        switch tier {
        case 0: return .gray
        case 1: return Color(white: 0.45)
        case 2: return .blue
        case 3: return Color(red: 0.2, green: 0.55, blue: 0.25)
        case 4: return .orange
        case 5: return Color(red: 0.85, green: 0.35, blue: 0.38)
        case 6: return Color(red: 0.9, green: 0.4, blue: 0.65)
        case 7: return .purple
        case 8: return Color(red: 0.45, green: 0.75, blue: 0.25)
        case 9: return Color(red: 0.85, green: 0.7, blue: 0.15)
        case 10: return .cyan
        case 11: return .red
        default: return .gray
        }
    }
}
