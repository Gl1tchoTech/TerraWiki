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
                        OfficialCatalogView(kind: .mobs)
                    } label: {
                        WikiRow(title: "All mobs", subtitle: "Every enemy and hostile creature", symbol: "eye.fill", symbolColor: .red)
                    }
                    HairlineDivider()

                    NavigationLink {
                        OfficialCatalogView(kind: .mobs)
                    } label: {
                        WikiRow(title: "Pre-Hardmode Enemies", subtitle: "Filter the complete mob catalog", symbol: "person.fill", symbolColor: .green)
                    }
                    HairlineDivider()

                    NavigationLink {
                        OfficialCatalogView(kind: .mobs)
                    } label: {
                        WikiRow(title: "Hardmode Enemies", subtitle: "Filter the complete mob catalog", symbol: "shield.lefthalf.filled", symbolColor: .red)
                    }
                    HairlineDivider()

                    NavigationLink {
                        OfficialCatalogView(kind: .mobs)
                    } label: {
                        WikiRow(title: "Event Enemies", subtitle: "Filter the complete mob catalog", symbol: "snowflake", symbolColor: .cyan)
                    }
                    HairlineDivider()

                    NavigationLink {
                        BossesView()
                    } label: {
                        WikiRow(title: "Bosses", symbol: "crown.fill", symbolColor: .orange)
                    }
                    HairlineDivider()

                    NavigationLink {
                        OfficialCatalogView(kind: .bosses)
                    } label: {
                        WikiRow(title: "Event Bosses", subtitle: "Filter the complete boss catalog", symbol: "sailboat.fill", symbolColor: .brown)
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
