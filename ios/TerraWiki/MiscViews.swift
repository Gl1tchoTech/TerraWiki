import SwiftUI

// MARK: - Achievements

private struct Achievement: Identifiable {
    let id: String
    let title: String
    let description: String
    let notes: String?
    let symbol: String
}

struct AchievementsView: View {
    @State private var query = ""

    private let achievements: [Achievement] = [
        .init(id: "timber", title: "Timber", description: "Chop down your first tree.",
              notes: "Can also be earned by wood gathered from other sources.", symbol: "tree.fill"),
        .init(id: "no-hobo", title: "No Hobo", description: "Build a house suitable enough for your first town NPC, such as the Guide, to move into.",
              notes: nil, symbol: "house.fill"),
        .init(id: "hammer", title: "Stop! Hammer Time!", description: "Obtain your first hammer via crafting or otherwise.",
              notes: nil, symbol: "hammer.fill"),
        .init(id: "shiny", title: "Ooo! Shiny!", description: "Mine your first nugget of ore with a pickaxe.",
              notes: "Placing an ore back and mining it again also grants the achievement.", symbol: "sparkles"),
        .init(id: "heart-breaker", title: "Heart Breaker", description: "Discover and smash your first heart crystal underground.",
              notes: nil, symbol: "heart.fill"),
        .init(id: "heavy-metal", title: "Heavy Metal", description: "Obtain an anvil made from iron or lead.",
              notes: nil, symbol: "hammer.fill"),
        .init(id: "i-am-loot", title: "I Am Loot!", description: "Discover a golden chest underground and take a peek at its contents.",
              notes: "A reference to the phrase \u{201c}I am Groot\u{201d} from Guardians of the Galaxy.", symbol: "shippingbox.fill")
    ]

    private var filtered: [Achievement] {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !q.isEmpty else { return achievements }
        return achievements.filter {
            $0.title.lowercased().contains(q) || $0.description.lowercased().contains(q)
        }
    }

    var body: some View {
        WikiScreen(title: "Achievements") {
            VStack(spacing: 0) {
                WikiSearchBar(text: $query)
                ScrollView {
                    LazyVStack(spacing: 0) {
                        SectionHeader(text: "Steam and GOG")
                        ForEach(filtered) { achievement in
                            achievementRow(achievement)
                            HairlineDivider()
                        }
                    }
                }
            }
        }
    }

    private func achievementRow(_ achievement: Achievement) -> some View {
        HStack(alignment: .top, spacing: 12) {
            PixelIcon(symbol: achievement.symbol, color: .orange)
            VStack(alignment: .leading, spacing: 3) {
                Text(achievement.title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Color.primary)
                Text(achievement.description)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.secondary)
                if let notes = achievement.notes {
                    Text("Notes: \(notes)")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.secondary)
                        .italic()
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.white)
    }
}

// MARK: - Guides

private struct Guide: Identifiable {
    let id: String
    let title: String
    let symbol: String
    let paragraphs: [String]
}

struct GuidesView: View {
    private let guides: [Guide] = [
        .init(id: "first-night", title: "Your First Night", symbol: "moon.stars.fill", paragraphs: [
            "Gather Wood, craft a Work Bench, then build a small shelter with background walls, a door, a light source, and a chair so the Guide can move in.",
            "Craft Torches and a Wooden Sword before nightfall. Zombies swarm at night, so stay indoors or keep a weapon ready.",
            "Dig for ores during the day and smelt them in a Furnace to unlock better tools and armor."
        ]),
        .init(id: "first-boss", title: "Preparing for Your First Boss", symbol: "eye.fill", paragraphs: [
            "Build a flat arena with wooden platforms to keep your movement unrestricted.",
            "Drink Ironskin and Regeneration potions and place a Campfire nearby for passive healing.",
            "A ranged weapon or a bow with plenty of arrows makes the Eye of Cthulhu much easier to handle."
        ]),
        .init(id: "hardmode", title: "Entering Hardmode", symbol: "flame.fill", paragraphs: [
            "Defeating the Wall of Flesh permanently starts Hardmode. Prepare housing, arenas, and potion farms first.",
            "The Hallow and the existing evil biome spread in a V shape, so dig quarantine tunnels around your base.",
            "New ores appear after breaking Demon or Crimson Altars with the Pwnhammer."
        ]),
        .init(id: "pylons", title: "Town Happiness & Pylons", symbol: "mappin.and.ellipse", paragraphs: [
            "NPCs are happier in biomes they love and near neighbors they like, which lowers shop prices.",
            "Buy a Pylon from a happy NPC and place one in each town to teleport across the world instantly.",
            "Keep towns small — groups of two or three NPCs work best."
        ])
    ]

    var body: some View {
        WikiScreen(title: "Guides") {
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(guides) { guide in
                        NavigationLink {
                            GuideDetailView(guide: guide)
                        } label: {
                            WikiRow(title: guide.title, subtitle: guide.paragraphs.first, symbol: guide.symbol, symbolColor: .wikiGreen)
                        }
                        HairlineDivider()
                    }
                }
            }
        }
    }
}

private struct GuideDetailView: View {
    let guide: Guide

    var body: some View {
        WikiScreen(title: guide.title) {
            ScrollView {
                ForEach(guide.paragraphs, id: \.self) { paragraph in
                    Text(paragraph)
                        .font(.system(size: 15))
                        .foregroundStyle(Color.primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(Color.white)
                        .overlay(alignment: .bottom) { HairlineDivider() }
                }
            }
        }
    }
}

// MARK: - Favorites

struct FavoritesView: View {
    @EnvironmentObject private var favorites: Favorites
    private var store: DataStore { .shared }

    var body: some View {
        WikiScreen(title: "Favorites") {
            let itemFavs = store.items.filter { favorites.contains($0.id) }
            let npcFavs = store.npcs.filter { favorites.contains($0.id) }
            let mobFavs = store.mobs.filter { favorites.contains($0.id) }
            let bossFavs = store.bosses.filter { favorites.contains($0.id) }
            let mechFavs = store.mechanics.filter { favorites.contains($0.id) }

            if itemFavs.isEmpty && npcFavs.isEmpty && mobFavs.isEmpty && bossFavs.isEmpty && mechFavs.isEmpty {
                WikiEmptyState(title: "No favorites yet.\nTap the star on any entry to save it.", systemImage: "star")
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        if !itemFavs.isEmpty {
                            SectionHeader(text: "Items")
                            ForEach(itemFavs) { item in
                            NavigationLink { ItemDetailView(item: item) } label: {
                                WikiRow(title: item.name, subtitle: itemSubtitle(item), symbol: itemSymbol(item), symbolColor: itemColor(item), thumbnailURL: wikiFileURL(for: item))
                            }
                                HairlineDivider()
                            }
                        }
                        if !npcFavs.isEmpty {
                            SectionHeader(text: "NPCs")
                            ForEach(npcFavs) { npc in
                                NavigationLink { NpcDetailView(npc: npc) } label: {
                                    WikiRow(title: npc.name, subtitle: npc.role, symbol: npcSymbol(npc), symbolColor: .wikiGreen, thumbnailURL: wikiFileURL(for: npc))
                                }
                                HairlineDivider()
                            }
                        }
                        if !mobFavs.isEmpty {
                            SectionHeader(text: "Mobs")
                            ForEach(mobFavs) { mob in
                                NavigationLink { MobDetailView(mob: mob) } label: {
                                    WikiRow(title: mob.name, subtitle: mobSubtitle(mob), symbol: mobSymbol(mob), symbolColor: mobColor(mob), thumbnailURL: wikiFileURL(for: mob))
                                }
                                HairlineDivider()
                            }
                        }
                        if !bossFavs.isEmpty {
                            SectionHeader(text: "Bosses")
                            ForEach(bossFavs) { boss in
                                NavigationLink { BossDetailView(boss: boss) } label: {
                                    WikiRow(title: boss.name, subtitle: bossSubtitle(boss), symbol: bossSymbol(boss), symbolColor: bossColor(boss), thumbnailURL: wikiFileURL(for: boss))
                                }
                                HairlineDivider()
                            }
                        }
                        if !mechFavs.isEmpty {
                            SectionHeader(text: "Mechanics")
                            ForEach(mechFavs) { mechanic in
                                NavigationLink { MechanicDetailView(mechanic: mechanic) } label: {
                                    WikiRow(title: mechanic.name, subtitle: mechanic.summary, symbol: mechanicSymbol(mechanic), symbolColor: mechanicColor(mechanic.group), thumbnailURL: wikiFileURL(for: mechanic))
                                }
                                HairlineDivider()
                            }
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Placeholder & about

struct PlaceholderView: View {
    let title: String
    let symbol: String
    let message: String

    var body: some View {
        WikiScreen(title: title) {
            WikiEmptyState(title: message, systemImage: symbol)
        }
    }
}

struct AboutView: View {
    var body: some View {
        WikiScreen(title: "About Us") {
            ScrollView {
                VStack(spacing: 12) {
                    PixelIcon(symbol: "bolt.fill", color: .wikiGreen, size: 64)
                    Text("TerraWiki")
                        .font(.wikiScript(30))
                        .foregroundStyle(Color.wikiGreen)
                    Text("Version 1.0.0")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)

                SectionHeader(text: "About")
                infoParagraph("A community field guide to Terraria 1.4.5.7 — items, recipes, NPCs, bosses, mechanics, and achievements.")

                SectionHeader(text: "Disclaimer")
                infoParagraph("TerraWiki is not affiliated with Re-Logic. Terraria is a trademark of Re-Logic. All game data is used for informational purposes.")
            }
        }
    }

    private func infoParagraph(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 15))
            .foregroundStyle(Color.primary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.white)
            .overlay(alignment: .bottom) { HairlineDivider() }
    }
}

// MARK: - Global search

struct SearchView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var query = ""

    private var results: [DataStore.SearchResult] {
        DataStore.shared.search(query)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                WikiSearchBar(text: $query)
                if query.trimmingCharacters(in: .whitespaces).isEmpty {
                    WikiEmptyState(title: "Search items, NPCs, bosses, and mechanics.", systemImage: "magnifyingglass")
                } else if results.isEmpty {
                    WikiEmptyState(title: "No results for \u{201c}\(query)\u{201d}.", systemImage: "magnifyingglass")
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(results) { result in
                                NavigationLink {
                                    destination(for: result)
                                } label: {
                                    WikiRow(
                                        title: result.name,
                                        subtitle: "\(result.category.label) · \(result.group)",
                                        symbol: symbol(for: result),
                                        symbolColor: color(for: result),
                                        thumbnailURL: wikiFileURL(for: result)
                                    )
                                }
                                HairlineDivider()
                            }
                        }
                    }
                }
            }
            .background(Color.wikiBackground)
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .tint(Color.wikiGreen)
        }
    }

    private func symbol(for result: DataStore.SearchResult) -> String {
        switch result.category {
        case .items:
            if let item = DataStore.shared.item(id: result.id) { return itemSymbol(item) }
            return "cube.fill"
        case .npcs: return "person.fill"
        case .mobs: return "eye.fill"
        case .bosses: return "crown.fill"
        case .mechanics: return "gearshape.fill"
        }
    }

    private func color(for result: DataStore.SearchResult) -> Color {
        switch result.category {
        case .items:
            if let item = DataStore.shared.item(id: result.id) { return itemColor(item) }
            return .wikiGreen
        case .npcs: return .wikiGreen
        case .mobs: return .red
        case .bosses: return .orange
        case .mechanics: return .blue
        }
    }

    @ViewBuilder
    private func destination(for result: DataStore.SearchResult) -> some View {
        switch result.category {
        case .items:
            if let item = DataStore.shared.item(id: result.id) {
                ItemDetailView(item: item)
            }
        case .npcs:
            if let npc = DataStore.shared.npc(id: result.id) {
                NpcDetailView(npc: npc)
            }
        case .mobs:
            if let mob = DataStore.shared.mob(id: result.id) {
                MobDetailView(mob: mob)
            }
        case .bosses:
            if let boss = DataStore.shared.boss(id: result.id) {
                BossDetailView(boss: boss)
            }
        case .mechanics:
            if let mechanic = DataStore.shared.mechanic(id: result.id) {
                MechanicDetailView(mechanic: mechanic)
            }
        }
    }
}
