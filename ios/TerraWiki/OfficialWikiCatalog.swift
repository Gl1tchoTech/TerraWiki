import Foundation
import SwiftUI

// MARK: - Official Wiki catalog

enum OfficialCatalogKind: String, CaseIterable, Codable, Identifiable {
    case items
    case npcs
    case mobs
    case bosses
    case mechanics

    var id: String { rawValue }

    var title: String {
        switch self {
        case .items: return "All Items"
        case .npcs: return "NPCs"
        case .mobs: return "Mobs"
        case .bosses: return "Bosses"
        case .mechanics: return "Mechanics"
        }
    }

    var categoryName: String {
        switch self {
        case .items: return "Items"
        case .npcs: return "NPCs"
        case .mobs: return "Enemy NPCs"
        case .bosses: return "Boss NPCs"
        case .mechanics: return "Game mechanics"
        }
    }

    var symbol: String {
        switch self {
        case .items: return "square.grid.2x2.fill"
        case .npcs: return "person.2.fill"
        case .mobs: return "eye.fill"
        case .bosses: return "crown.fill"
        case .mechanics: return "gearshape.2.fill"
        }
    }

    var color: Color {
        switch self {
        case .items: return .wikiGreen
        case .npcs: return .wikiGreen
        case .mobs: return .red
        case .bosses: return .orange
        case .mechanics: return .blue
        }
    }

    var emptyMessage: String {
        "Connect to the internet to sync the complete \(title.lowercased()) catalog."
    }

    var fallbackEntries: [OfficialCatalogEntry] {
        let store = DataStore.shared
        switch self {
        case .items:
            return store.items.enumerated().map { index, item in
                OfficialCatalogEntry(pageID: -(index + 1), title: item.name, kind: self, subtitle: itemSubtitle(item))
            }
        case .npcs:
            return store.npcs.enumerated().map { index, npc in
                OfficialCatalogEntry(pageID: -(index + 1), title: npc.name, kind: self, subtitle: npc.role)
            }
        case .mobs:
            return store.bosses.enumerated().map { index, boss in
                OfficialCatalogEntry(pageID: -(index + 1), title: boss.name, kind: self, subtitle: boss.tier)
            }
        case .bosses:
            return store.bosses.enumerated().map { index, boss in
                OfficialCatalogEntry(pageID: -(index + 1), title: boss.name, kind: self, subtitle: boss.tier)
            }
        case .mechanics:
            return store.mechanics.enumerated().map { index, mechanic in
                OfficialCatalogEntry(pageID: -(index + 1), title: mechanic.name, kind: self, subtitle: mechanic.group)
            }
        }
    }
}

struct OfficialCatalogEntry: Codable, Hashable, Identifiable {
    let pageID: Int
    let title: String
    let kind: OfficialCatalogKind
    let subtitle: String

    var id: String { "\(kind.rawValue)-\(pageID)-\(title)" }

    var pageURL: URL? {
        Self.url(path: "/wiki/\(title)")
    }

    var artworkURL: URL? {
        let fileName = title.replacingOccurrences(of: " ", with: "_") + ".png"
        return Self.url(path: "/wiki/Special:FilePath/\(fileName)", queryItems: [
            URLQueryItem(name: "width", value: "192")
        ])
    }

    private static func url(path: String, queryItems: [URLQueryItem] = []) -> URL? {
        var components = URLComponents()
        components.scheme = "https"
        components.host = "terraria.wiki.gg"
        components.path = path
        components.queryItems = queryItems.isEmpty ? nil : queryItems
        return components.url
    }
}

@MainActor
final class OfficialCatalogStore: ObservableObject {
    let kind: OfficialCatalogKind

    @Published private(set) var entries: [OfficialCatalogEntry]
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?

    private static let apiURL = URL(string: "https://terraria.wiki.gg/api.php")!

    init(kind: OfficialCatalogKind) {
        self.kind = kind
        entries = Self.cachedEntries(for: kind) ?? kind.fallbackEntries
    }

    func load() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let members = try await fetchCategoryTree(named: kind.categoryName)
            let fetched = members
                .filter { $0.namespace == 0 }
                .map { OfficialCatalogEntry(pageID: $0.pageID, title: $0.title, kind: kind, subtitle: Self.subtitle(for: kind)) }
                .filter { !Self.excludedTitles.contains($0.title) }
                .sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }

            var unique = [String: OfficialCatalogEntry]()
            for entry in fetched {
                unique[entry.title.lowercased()] = entry
            }
            let result = Array(unique.values).sorted {
                $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending
            }
            guard !result.isEmpty else {
                errorMessage = kind.emptyMessage
                return
            }
            entries = result
            Self.cache(result, for: kind)
        } catch is CancellationError {
            return
        } catch {
            errorMessage = "Could not sync the Official Terraria Wiki. Showing the saved catalog."
        }
    }

    private func fetchCategoryTree(named name: String) async throws -> [WikiCategoryMember] {
        var pending = [name]
        var visitedCategories = Set<String>()
        var allMembers: [WikiCategoryMember] = []

        while let category = pending.popLast() {
            guard visitedCategories.insert(category).inserted else { continue }
            let members = (try await fetchCategory(named: category)).query?.categoryMembers ?? []
            allMembers.append(contentsOf: members.filter { $0.namespace == 0 })
            pending.append(contentsOf: members
                .filter { $0.namespace == 14 && !$0.title.contains("/") }
                .map { $0.title.replacingOccurrences(of: "Category:", with: "") })
        }

        return allMembers
    }

    private func fetchCategory(named name: String) async throws -> WikiCategoryResponse {
        var continuation: String?
        var members: [WikiCategoryMember] = []

        repeat {
            try Task.checkCancellation()
            var components = URLComponents(url: Self.apiURL, resolvingAgainstBaseURL: false)!
            var queryItems = [
                URLQueryItem(name: "action", value: "query"),
                URLQueryItem(name: "list", value: "categorymembers"),
                URLQueryItem(name: "cmtitle", value: "Category:\(name)"),
                URLQueryItem(name: "cmtype", value: "page|subcat"),
                URLQueryItem(name: "cmlimit", value: "500"),
                URLQueryItem(name: "format", value: "json"),
                URLQueryItem(name: "formatversion", value: "2")
            ]
            if let continuation {
                queryItems.append(URLQueryItem(name: "cmcontinue", value: continuation))
            }
            components.queryItems = queryItems

            let (data, response) = try await URLSession.shared.data(from: components.url!)
            guard let httpResponse = response as? HTTPURLResponse,
                  200..<300 ~= httpResponse.statusCode else {
                throw URLError(.badServerResponse)
            }
            let page = try JSONDecoder().decode(WikiCategoryResponse.self, from: data)
            members.append(contentsOf: page.query?.categoryMembers ?? [])
            continuation = page.continuation?.categoryMembers
        } while continuation != nil

        return WikiCategoryResponse(query: WikiQuery(categoryMembers: members), continuation: nil)
    }

    private static func subtitle(for kind: OfficialCatalogKind) -> String {
        switch kind {
        case .items: return "Item"
        case .npcs: return "NPC"
        case .mobs: return "Enemy"
        case .bosses: return "Boss"
        case .mechanics: return "Game mechanic"
        }
    }

    private static let excludedTitles: Set<String> = [
        "Items", "Item IDs", "Item checklists", "Rarity", "Use time", "Value",
        "Coins", "NPCs", "NPC IDs", "List of NPCs", "NPC spawning", "Enemies",
        "Bosses", "Game mechanics", "Mechanics", "History", "Data IDs"
    ]

    private static func cacheKey(for kind: OfficialCatalogKind) -> String {
        "terrawiki.official-catalog.\(kind.rawValue).v1"
    }

    private static func cachedEntries(for kind: OfficialCatalogKind) -> [OfficialCatalogEntry]? {
        guard let data = UserDefaults.standard.data(forKey: cacheKey(for: kind)) else { return nil }
        return try? JSONDecoder().decode([OfficialCatalogEntry].self, from: data)
    }

    private static func cache(_ entries: [OfficialCatalogEntry], for kind: OfficialCatalogKind) {
        guard let data = try? JSONEncoder().encode(entries) else { return }
        UserDefaults.standard.set(data, forKey: cacheKey(for: kind))
    }
}

private struct WikiCategoryResponse: Decodable {
    let query: WikiQuery?
    let continuation: WikiContinuation?

    enum CodingKeys: String, CodingKey {
        case query
        case continuation = "continue"
    }
}

private struct WikiQuery: Decodable {
    let categoryMembers: [WikiCategoryMember]

    enum CodingKeys: String, CodingKey {
        case categoryMembers = "categorymembers"
    }
}

private struct WikiContinuation: Decodable {
    let categoryMembers: String

    enum CodingKeys: String, CodingKey {
        case categoryMembers = "cmcontinue"
    }
}

private struct WikiCategoryMember: Decodable {
    let pageID: Int
    let namespace: Int
    let title: String

    enum CodingKeys: String, CodingKey {
        case pageID = "pageid"
        case namespace = "ns"
        case title
    }
}

// MARK: - Catalog screens

struct OfficialCatalogView: View {
    let kind: OfficialCatalogKind
    @StateObject private var store: OfficialCatalogStore
    @State private var query = ""

    init(kind: OfficialCatalogKind) {
        self.kind = kind
        _store = StateObject(wrappedValue: OfficialCatalogStore(kind: kind))
    }

    private var filteredEntries: [OfficialCatalogEntry] {
        let search = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !search.isEmpty else { return store.entries }
        return store.entries.filter {
            $0.title.lowercased().contains(search) || $0.subtitle.lowercased().contains(search)
        }
    }

    var body: some View {
        WikiScreen(title: kind.title) {
            VStack(spacing: 0) {
                WikiSearchBar(text: $query)
                HStack(spacing: 8) {
                    Image(systemName: "globe.americas.fill")
                    Text(store.isLoading ? "Syncing Official Terraria Wiki…" : "Official Terraria Wiki · \(store.entries.count) entries")
                    Spacer()
                    if store.isLoading {
                        ProgressView()
                            .controlSize(.small)
                    }
                }
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Color.secondary)
                .padding(.horizontal, 16)
                .padding(.bottom, 8)

                if filteredEntries.isEmpty {
                    WikiEmptyState(title: store.errorMessage ?? kind.emptyMessage, systemImage: kind.symbol)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(filteredEntries) { entry in
                                NavigationLink {
                                    OfficialEntryDetailView(entry: entry)
                                } label: {
                                    WikiRow(
                                        title: entry.title,
                                        subtitle: entry.subtitle,
                                        symbol: kind.symbol,
                                        symbolColor: kind.color
                                    )
                                }
                                HairlineDivider()
                            }
                        }
                    }
                }
            }
        }
        .task {
            await store.load()
        }
    }
}

struct OfficialEntryDetailView: View {
    let entry: OfficialCatalogEntry

    var body: some View {
        WikiScreen(title: entry.title) {
            ScrollView {
                VStack(spacing: 10) {
                    WikiArtwork(
                        url: entry.artworkURL,
                        fallbackSymbol: entry.kind.symbol,
                        fallbackColor: entry.kind.color,
                        size: 96
                    )
                    Text(entry.title)
                        .font(.system(size: 21, weight: .bold))
                        .multilineTextAlignment(.center)
                    Text(entry.kind.title)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Color.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 18)
                .background(Color.white)
                .overlay(alignment: .bottom) { HairlineDivider() }

                SectionHeader(text: "Official catalog")
                DetailRow(label: "Category", value: entry.kind.title)
                Text("This entry is synced from the latest data available on the Official Terraria Wiki. Open the source page for complete statistics, recipes, drops, and version history.")
                    .font(.system(size: 15))
                    .foregroundStyle(Color.primary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.white)
                    .overlay(alignment: .bottom) { HairlineDivider() }

                if let pageURL = entry.pageURL {
                    Link(destination: pageURL) {
                        WikiRow(title: "Open on Official Terraria Wiki", symbol: "safari.fill", symbolColor: .wikiGreen)
                    }
                    HairlineDivider()
                }
            }
        }
    }
}
