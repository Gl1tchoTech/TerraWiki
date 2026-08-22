import Foundation
import SwiftUI

/// Loads the bundled JSON database and provides cross-category search.
final class DataStore {
    static let shared = DataStore()

    let items: [Item]
    let npcs: [Npc]
    let bosses: [Boss]
    let mechanics: [Mechanic]

    init(bundle: Bundle = .main) {
        items = Self.load("items.json", from: bundle, default: [])
        npcs = Self.load("npcs.json", from: bundle, default: [])
        bosses = Self.load("bosses.json", from: bundle, default: [])
        mechanics = Self.load("mechanics.json", from: bundle, default: [])
    }

    // MARK: Lookups

    func item(named name: String) -> Item? {
        items.first { $0.name.caseInsensitiveCompare(name) == .orderedSame }
    }

    func npc(named name: String) -> Npc? {
        npcs.first { $0.name.caseInsensitiveCompare(name) == .orderedSame }
    }

    func boss(named name: String) -> Boss? {
        bosses.first { $0.name.caseInsensitiveCompare(name) == .orderedSame }
    }

    func item(id: String) -> Item? { items.first { $0.id == id } }
    func npc(id: String) -> Npc? { npcs.first { $0.id == id } }
    func boss(id: String) -> Boss? { bosses.first { $0.id == id } }
    func mechanic(id: String) -> Mechanic? { mechanics.first { $0.id == id } }

    // MARK: Search

    struct SearchResult: Identifiable, Hashable {
        let id: String
        let name: String
        let category: WikiCategory
        let blurb: String
        let group: String
    }

    func search(_ query: String) -> [SearchResult] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !q.isEmpty else { return [] }
        let terms = q.split(separator: " ").map(String.init)

        func score(name: String, blurb: String, tags: [String]) -> Int {
            let n = name.lowercased()
            let b = blurb.lowercased()
            let t = tags.joined(separator: " ").lowercased()
            var s = 0
            for term in terms {
                if n == term { s += 10 }
                else if n.hasPrefix(term) { s += 6 }
                else if n.contains(term) { s += 4 }
                if b.contains(term) { s += 2 }
                if t.contains(term) { s += 3 }
            }
            return s
        }

        struct Ranked {
            let result: SearchResult
            let score: Int
        }

        var ranked: [Ranked] = []
        for i in items {
            let s = score(name: i.name, blurb: i.description, tags: i.tags)
            if s > 0 { ranked.append(.init(result: .init(id: i.id, name: i.name, category: .items, blurb: i.description, group: i.kind), score: s)) }
        }
        for n in npcs {
            let s = score(name: n.name, blurb: n.description, tags: n.tags)
            if s > 0 { ranked.append(.init(result: .init(id: n.id, name: n.name, category: .npcs, blurb: n.description, group: "NPC"), score: s)) }
        }
        for b in bosses {
            let s = score(name: b.name, blurb: b.description, tags: b.tags)
            if s > 0 { ranked.append(.init(result: .init(id: b.id, name: b.name, category: .bosses, blurb: b.description, group: b.tier), score: s)) }
        }
        for m in mechanics {
            let s = score(name: m.name, blurb: m.summary, tags: m.tags)
            if s > 0 { ranked.append(.init(result: .init(id: m.id, name: m.name, category: .mechanics, blurb: m.summary, group: m.group), score: s)) }
        }

        return ranked.sorted { lhs, rhs in
            if lhs.score != rhs.score { return lhs.score > rhs.score }
            return lhs.result.name.localizedCaseInsensitiveCompare(rhs.result.name) == .orderedAscending
        }
        .map(\.result)
    }

    // MARK: Favorites

    func favorite(_ id: String) -> WikiCategory? {
        if items.contains(where: { $0.id == id }) { return .items }
        if npcs.contains(where: { $0.id == id }) { return .npcs }
        if bosses.contains(where: { $0.id == id }) { return .bosses }
        if mechanics.contains(where: { $0.id == id }) { return .mechanics }
        return nil
    }

    // MARK: Loading

    private static func load<T: Decodable>(_ name: String, from bundle: Bundle, default defaultValue: T) -> T {
        let resourceName = (name as NSString).deletingPathExtension
        guard
            let url = bundle.url(forResource: resourceName, withExtension: "json")
                ?? bundle.url(forResource: resourceName, withExtension: "json", subdirectory: "Resources"),
            let data = try? Data(contentsOf: url),
            let decoded = try? JSONDecoder().decode(T.self, from: data)
        else {
            assertionFailure("Could not load \(name)")
            return defaultValue
        }
        return decoded
    }
}
