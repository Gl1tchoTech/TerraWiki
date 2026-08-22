import SwiftUI

// MARK: - Armor

struct ArmorView: View {
    private var store: DataStore { .shared }

    var body: some View {
        ItemListScreen(
            title: "Armor",
            items: store.items.filter { $0.kind == "Armor" }.sorted { $0.name < $1.name }
        )
    }
}

// MARK: - Enemies submenu

struct EnemiesView: View {
    private var store: DataStore { .shared }

    private var mobs: [Mob] { store.mobs.sorted { $0.name < $1.name } }
    private var bosses: [Boss] { store.bosses.sorted { $0.name < $1.name } }

    var body: some View {
        WikiScreen(title: "Enemies") {
            ScrollView {
                LazyVStack(spacing: 0) {
                    NavigationLink {
                        MobListScreen(title: "All mobs", mobs: mobs)
                    } label: {
                        WikiRow(title: "All mobs", subtitle: "\(mobs.count) enemies and hostile creatures", symbol: "eye.fill", symbolColor: .red)
                    }
                    HairlineDivider()

                    NavigationLink {
                        MobListScreen(title: "Pre-Hardmode Enemies", mobs: tierMobs("Pre-Hardmode"))
                    } label: {
                        WikiRow(title: "Pre-Hardmode Enemies", subtitle: "\(tierMobs("Pre-Hardmode").count) enemies", symbol: "person.fill", symbolColor: .green)
                    }
                    HairlineDivider()

                    NavigationLink {
                        MobListScreen(title: "Hardmode Enemies", mobs: tierMobs("Hardmode"))
                    } label: {
                        WikiRow(title: "Hardmode Enemies", subtitle: "\(tierMobs("Hardmode").count) enemies", symbol: "shield.lefthalf.filled", symbolColor: .red)
                    }
                    HairlineDivider()

                    NavigationLink {
                        MobListScreen(title: "Event Enemies", mobs: eventMobs)
                    } label: {
                        WikiRow(title: "Event Enemies", subtitle: "\(eventMobs.count) invasion and event mobs", symbol: "snowflake", symbolColor: .cyan)
                    }
                    HairlineDivider()

                    NavigationLink {
                        BossesView()
                    } label: {
                        WikiRow(title: "Bosses", subtitle: "\(bosses.count) bosses", symbol: "crown.fill", symbolColor: .orange)
                    }
                    HairlineDivider()

                    NavigationLink {
                        BossListScreen(title: "Event Bosses", bosses: eventBosses)
                    } label: {
                        WikiRow(title: "Event Bosses", subtitle: "\(eventBosses.count) event and invasion bosses", symbol: "sailboat.fill", symbolColor: .brown)
                    }
                    HairlineDivider()

                    NavigationLink {
                        MobListScreen(title: "Bosses Servants", mobs: servantMobs)
                    } label: {
                        WikiRow(title: "Bosses Servants", subtitle: "\(servantMobs.count) minions and boss parts", symbol: "dot.circle.fill", symbolColor: .gray)
                    }
                }
            }
        }
    }

    private func tierMobs(_ t: String) -> [Mob] {
        mobs.filter { $0.tier == t }
    }

    private var eventMobs: [Mob] {
        mobs.filter { mob in
            mob.tags.contains { $0.contains("moon") || $0.contains("army") || $0.contains("invasion") || $0.contains("eclipse") || $0.contains("legion") || $0.contains("madness") || $0.contains("rain") || $0.contains("sandstorm") }
        }
    }

    private var servantMobs: [Mob] {
        mobs.filter { $0.tags.contains("servant") }
    }

    private var eventBosses: [Boss] {
        bosses.filter { $0.tags.contains("event") || $0.tags.contains("crossover") || $0.tags.contains("invasion") }
    }
}
