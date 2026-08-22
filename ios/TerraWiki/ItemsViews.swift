import SwiftUI

// MARK: - Items root (category submenu)

struct ItemsView: View {
    private var store: DataStore { .shared }

    var body: some View {
        WikiScreen(title: "Items") {
            ScrollView {
                LazyVStack(spacing: 0) {
                    NavigationLink {
                        ItemListScreen(title: "All items", items: store.items.sorted { $0.name < $1.name })
                    } label: {
                        WikiRow(title: "All items", subtitle: "\(store.items.count) items", symbol: "square.grid.2x2.fill")
                    }
                    HairlineDivider()

                    NavigationLink { WeaponsView() } label: {
                        WikiRow(title: "Weapons", symbol: "bolt.fill", symbolColor: .orange)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Armor", items: kind("Armor")) } label: {
                        WikiRow(title: "Armor", symbol: "shield.fill", symbolColor: .red)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Accessories", items: kind("Accessory")) } label: {
                        WikiRow(title: "Accessories", symbol: "star.circle.fill", symbolColor: .purple)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Materials", items: kind("Material")) } label: {
                        WikiRow(title: "Materials", symbol: "cube.fill", symbolColor: .gray)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Consumables", items: kind("Consumable")) } label: {
                        WikiRow(title: "Consumables", symbol: "drop.fill", symbolColor: Color(red: 0.9, green: 0.4, blue: 0.55))
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Furniture", items: kind("Furniture") + kind("Block")) } label: {
                        WikiRow(title: "Furniture", symbol: "sofa.fill", symbolColor: Color(red: 0.55, green: 0.4, blue: 0.25))
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Ammo", items: kind("Ammo")) } label: {
                        WikiRow(title: "Ammo", symbol: "arrow.up.circle.fill", symbolColor: .teal)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Tools", items: kind("Tool")) } label: {
                        WikiRow(title: "Tools", symbol: "hammer.fill", symbolColor: .brown)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Other", items: kind("Other")) } label: {
                        WikiRow(title: "Other", symbol: "square.stack.3d.up.fill", symbolColor: .gray)
                    }
                }
            }
        }
    }

    private func kind(_ k: String) -> [Item] {
        store.items.filter { $0.kind == k }.sorted { $0.name < $1.name }
    }
}

// MARK: - Weapons submenu

struct WeaponsView: View {
    private var store: DataStore { .shared }
    private var weapons: [Item] {
        store.items.filter { $0.kind == "Weapon" }.sorted { $0.name < $1.name }
    }

    var body: some View {
        WikiScreen(title: "Weapons") {
            ScrollView {
                LazyVStack(spacing: 0) {
                    NavigationLink { ItemListScreen(title: "All weapons", items: weapons) } label: {
                        WikiRow(title: "All items")
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Melee weapons", items: weapons.filter { $0.tags.contains("melee") }) } label: {
                        WikiRow(title: "Melee weapons", symbol: "bolt.fill", symbolColor: .orange)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Ranged weapons", items: weapons.filter { $0.tags.contains("ranged") }) } label: {
                        WikiRow(title: "Ranged weapons", symbol: "scope", symbolColor: .blue)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Magic weapons", items: weapons.filter { $0.tags.contains("magic") }) } label: {
                        WikiRow(title: "Magic weapons", symbol: "wand.and.stars", symbolColor: .purple)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Summon weapons", items: weapons.filter { $0.tags.contains("summon") }) } label: {
                        WikiRow(title: "Summon weapons", symbol: "sparkles", symbolColor: .green)
                    }
                    HairlineDivider()
                    NavigationLink { ItemListScreen(title: "Other weapons", items: weapons.filter { !$0.tags.contains("melee") && !$0.tags.contains("ranged") && !$0.tags.contains("magic") && !$0.tags.contains("summon") }) } label: {
                        WikiRow(title: "Other", symbol: "flame.fill", symbolColor: .pink)
                    }
                }
            }
        }
    }
}

// MARK: - Generic item list

struct ItemListScreen: View {
    let title: String
    let items: [Item]

    var body: some View {
        WikiScreen(title: title) {
            if items.isEmpty {
                WikiEmptyState(title: "No items in this category yet.", systemImage: "square.grid.2x2")
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(items) { item in
                            NavigationLink { ItemDetailView(item: item) } label: {
                                WikiRow(
                                    title: item.name,
                                    subtitle: itemSubtitle(item),
                                    symbol: itemSymbol(item),
                                    symbolColor: itemColor(item),
                                    thumbnailURL: wikiFileURL(for: item)
                                )
                            }
                            HairlineDivider()
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Item detail

struct ItemDetailView: View {
    let item: Item
    private var store: DataStore { .shared }

    var body: some View {
        WikiScreen(title: item.name, favoriteID: item.id) {
            ScrollView {
                header
                statsSection
                descriptionSection
                obtainSection
                recipeSection
                usedInSection
                notesSection
            }
        }
    }

    // ── Header ──

    private var header: some View {
        HStack(spacing: 14) {
            WikiArtwork(url: wikiFileURL(for: item), fallbackSymbol: itemSymbol(item), fallbackColor: itemColor(item), size: 52)
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name).font(.system(size: 20, weight: .bold)).foregroundStyle(Color.primary)
                Text(item.kind).font(.system(size: 13, weight: .medium)).foregroundStyle(Color.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16).padding(.vertical, 14).background(Color.white)
        .overlay(alignment: .bottom) { HairlineDivider() }
    }

    // ── Stats ──

    private var statsSection: some View {
        VStack(spacing: 0) {
            SectionHeader(text: "Statistics")
            DetailRow(label: "Type", value: item.kind)
            if let damage = item.damage { DetailRow(label: "Damage", value: damage) }
            DetailRow(label: "Max Stack", value: "\(item.maxStack)")
            DetailRow(label: "Sell", value: item.sell ?? "No value")
            DetailRow(label: "Rarity", value: Rarity.label(item.rarity), valueColor: Rarity.color(item.rarity))
        }
    }

    // ── Description ──

    private var descriptionSection: some View {
        VStack(spacing: 0) {
            SectionHeader(text: "Description")
            paragraph(item.description)
        }
    }

    // ── Obtain ──

    private var obtainSection: some View {
        VStack(spacing: 0) {
            SectionHeader(text: "How to obtain")
            paragraph(item.obtain)
        }
    }

    // ── Recipe ──

    @ViewBuilder
    private var recipeSection: some View {
        let allRecs = item.allRecipes ?? (item.recipe.map { [$0] } ?? [])
        if allRecs.isEmpty { EmptyView() }
        else if allRecs.count == 1 {
            SectionHeader(text: "Recipe")
            recipeBlock(allRecs[0])
        } else {
            SectionHeader(text: "Recipes (\(allRecs.count))")
            ForEach(Array(allRecs.enumerated()), id: \.offset) { idx, rec in
                recipeBlock(rec, label: "Recipe \(idx + 1)")
            }
        }
    }

    private func recipeBlock(_ recipe: Recipe, label: String = "Recipe") -> some View {
        VStack(spacing: 0) {
            // Station (tappable to view the station's own detail page)
            if let stationItem = store.item(named: recipe.station) {
                NavigationLink { ItemDetailView(item: stationItem) } label: {
                    DetailRow(label: "Crafted at", value: recipe.station, valueColor: .wikiGreen)
                }
            } else {
                DetailRow(label: "Crafted at", value: recipe.station)
            }

            if let qty = recipe.resultQty, qty > 1 {
                DetailRow(label: "Produces", value: "×\(qty)")
            }

            ForEach(recipe.ingredients, id: \.self) { ing in
                if let ingItem = store.item(named: ing.name) {
                    NavigationLink { ItemDetailView(item: ingItem) } label: {
                        DetailRow(label: ing.name, value: "×\(ing.qty)", valueColor: .wikiGreen)
                    }
                } else {
                    DetailRow(label: ing.name, value: "×\(ing.qty)")
                }
            }
        }
    }

    // ── Used in ──

    @ViewBuilder
    private var usedInSection: some View {
        if let usedIn = item.usedIn, !usedIn.isEmpty {
            SectionHeader(text: "Used in (\(usedIn.count))")
            ForEach(usedIn, id: \.self) { name in
                if let target = store.item(named: name) {
                    NavigationLink { ItemDetailView(item: target) } label: {
                        WikiRow(title: target.name, subtitle: itemSubtitle(target), symbol: itemSymbol(target), symbolColor: itemColor(target), thumbnailURL: wikiFileURL(for: target))
                    }
                } else {
                    WikiRow(title: name, showsChevron: false)
                }
                HairlineDivider()
            }
        }
    }

    // ── Notes ──

    @ViewBuilder
    private var notesSection: some View {
        if let notes = item.notes {
            SectionHeader(text: "Notes")
            paragraph(notes)
        }
    }

    private func paragraph(_ text: String) -> some View {
        Text(text).font(.system(size: 15)).foregroundStyle(Color.primary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16).padding(.vertical, 10)
            .background(Color.white)
            .overlay(alignment: .bottom) { HairlineDivider() }
    }
}

// MARK: - Recipe detail (standalone, navigated from other screens)

struct RecipeView: View {
    let itemName: String
    let recipe: Recipe
    private var store: DataStore { .shared }

    var body: some View {
        WikiScreen(title: "Recipe") {
            ScrollView {
                SectionHeader(text: itemName)

                // Station (tappable)
                if let stationItem = store.item(named: recipe.station) {
                    NavigationLink { ItemDetailView(item: stationItem) } label: {
                        DetailRow(label: "Crafted at", value: recipe.station, valueColor: .wikiGreen)
                    }
                } else {
                    DetailRow(label: "Crafted at", value: recipe.station)
                }

                if let qty = recipe.resultQty, qty > 1 {
                    DetailRow(label: "Result", value: "×\(qty)")
                }

                SectionHeader(text: "Ingredients")
                ForEach(recipe.ingredients, id: \.self) { ing in
                    if let ingItem = store.item(named: ing.name) {
                        NavigationLink { ItemDetailView(item: ingItem) } label: {
                            DetailRow(label: ing.name, value: "×\(ing.qty)", valueColor: .wikiGreen)
                        }
                    } else {
                        DetailRow(label: ing.name, value: "×\(ing.qty)")
                    }
                }
            }
        }
    }
}