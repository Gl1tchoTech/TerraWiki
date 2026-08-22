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

    private var bosses: [Boss] { store.bosses.sorted { $0.name < $1.name } }

    var body: some View {
        WikiScreen(title: "Enemies") {
            ScrollView {
                LazyVStack(spacing: 0) {
                    NavigationLink {
                        BossListScreen(title: "All enemies", bosses: bosses)
                    } label: {
                        WikiRow(title: "All enemies", subtitle: "Bosses & minibosses", symbol: "eye.fill")
                    }
                    HairlineDivider()

                    NavigationLink {
                        BossListScreen(title: "Pre-Hardmode Enemies", bosses: tier("Pre-Hardmode"))
                    } label: {
                        WikiRow(title: "Pre-Hardmode Enemies", symbol: "person.fill", symbolColor: .green)
                    }
                    HairlineDivider()

                    NavigationLink {
                        BossListScreen(title: "Hardmode Enemies", bosses: tier("Hardmode"))
                    } label: {
                        WikiRow(title: "Hardmode Enemies", symbol: "shield.lefthalf.filled", symbolColor: .red)
                    }
                    HairlineDivider()

                    NavigationLink {
                        BossListScreen(title: "Event Enemies", bosses: eventBosses)
                    } label: {
                        WikiRow(title: "Event Enemies", symbol: "snowflake", symbolColor: .cyan)
                    }
                    HairlineDivider()

                    NavigationLink {
                        BossesView()
                    } label: {
                        WikiRow(title: "Bosses", symbol: "crown.fill", symbolColor: .orange)
                    }
                    HairlineDivider()

                    NavigationLink {
                        BossListScreen(title: "Event Bosses", bosses: eventBosses)
                    } label: {
                        WikiRow(title: "Event Bosses", symbol: "sailboat.fill", symbolColor: .brown)
                    }
                    HairlineDivider()

                    NavigationLink {
                        BossListScreen(title: "Bosses Servants", bosses: [])
                    } label: {
                        WikiRow(title: "Bosses Servants", symbol: "dot.circle.fill", symbolColor: .gray)
                    }
                }
            }
        }
    }

    private func tier(_ t: String) -> [Boss] {
        bosses.filter { $0.tier == t }
    }

    private var eventBosses: [Boss] {
        bosses.filter { $0.tags.contains("event") || $0.tags.contains("crossover") || $0.tags.contains("invasion") }
    }
}
