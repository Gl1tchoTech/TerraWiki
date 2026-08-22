import SwiftUI

@main
struct TerraWikiApp: App {
    @StateObject private var favorites = Favorites()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(favorites)
                .tint(Color.wikiGreen)
        }
    }
}

// MARK: - Sidebar model

enum SidebarItem: String, CaseIterable, Identifiable, Hashable {
    case items, armor, enemies, npcs, achievements, mechanics, guides
    case favorites
    case videos, news, removeAds, about

    var id: String { rawValue }

    var title: String {
        switch self {
        case .items: return "Items"
        case .armor: return "Armor"
        case .enemies: return "Enemies"
        case .npcs: return "NPCs"
        case .achievements: return "Achievements"
        case .mechanics: return "Mechanics"
        case .guides: return "Guides"
        case .favorites: return "Favorites"
        case .videos: return "Videos"
        case .news: return "News"
        case .removeAds: return "Remove Ads"
        case .about: return "About Us"
        }
    }

    var symbol: String {
        switch self {
        case .items: return "bolt.fill"
        case .armor: return "shield.fill"
        case .enemies: return "eye.fill"
        case .npcs: return "person.2.fill"
        case .achievements: return "trophy.fill"
        case .mechanics: return "gearshape.2.fill"
        case .guides: return "book.fill"
        case .favorites: return "star.fill"
        case .videos: return "film.fill"
        case .news: return "dot.radiowaves.left.and.right"
        case .removeAds: return "xmark.circle.fill"
        case .about: return "info.circle.fill"
        }
    }
}

// MARK: - Root split view

struct RootView: View {
    @State private var selection: SidebarItem? = .items

    var body: some View {
        NavigationSplitView {
            SidebarView(selection: $selection)
        } detail: {
            if let selection {
                NavigationStack {
                    destination(for: selection)
                }
            } else {
                ContentUnavailableView("Pick a category", systemImage: "square.grid.2x2")
            }
        }
    }

    @ViewBuilder
    private func destination(for item: SidebarItem) -> some View {
        switch item {
        case .items: ItemsView()
        case .armor: ArmorView()
        case .enemies: EnemiesView()
        case .npcs: NpcsView()
        case .achievements: AchievementsView()
        case .mechanics: MechanicsView()
        case .guides: GuidesView()
        case .favorites: FavoritesView()
        case .videos:
            PlaceholderView(title: "Videos", symbol: "film.fill",
                            message: "Gameplay videos and build guides will live here.")
        case .news:
            PlaceholderView(title: "News", symbol: "dot.radiowaves.left.and.right",
                            message: "Patch notes and update news will appear here.")
        case .removeAds:
            PlaceholderView(title: "Remove Ads", symbol: "xmark.circle.fill",
                            message: "Support TerraWiki and browse without ads.")
        case .about: AboutView()
        }
    }
}

struct SidebarView: View {
    @Binding var selection: SidebarItem?
    @State private var showingSearch = false
    @EnvironmentObject private var favorites: Favorites

    private let primary: [SidebarItem] = [.items, .armor, .enemies, .npcs, .achievements, .mechanics, .guides]
    private let secondary: [SidebarItem] = [.favorites]
    private let tertiary: [SidebarItem] = [.videos, .news, .removeAds, .about]

    var body: some View {
        List(selection: $selection) {
            Section {
                ForEach(primary) { item in
                    Label(item.title, systemImage: item.symbol)
                        .tag(item)
                }
            }
            Section {
                ForEach(secondary) { item in
                    Label(item.title, systemImage: item.symbol)
                        .tag(item)
                }
            }
            Section {
                ForEach(tertiary) { item in
                    Label(item.title, systemImage: item.symbol)
                        .tag(item)
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("TerraWiki")
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("TerraWiki")
                    .font(.wikiScript(24))
                    .foregroundStyle(Color.wikiGreen)
                    .lineLimit(1)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showingSearch = true
                } label: {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(Color.wikiGreen)
                }
            }
        }
        .sheet(isPresented: $showingSearch) {
            SearchView()
                .environmentObject(favorites)
        }
    }
}
