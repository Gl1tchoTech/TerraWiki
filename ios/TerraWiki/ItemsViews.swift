import SwiftUI

// MARK: - Items root (category submenu)

struct ItemsView: View {
    private var store: DataStore { .shared }

    var body: some View {
        WikiScreen(title: "Items") {
            ScrollView {
                LazyVStack(spacing: 0) {
                    NavigationLink {
                        OfficialCatalogView(kind: .items)
                    } label: {
                        WikiRow(title: "All items", symbol: "square.grid.2x2.fill")
                    }
                    HairlineDivider()

                    NavigationLink {
                        WeaponsView()
                    } label: {
                        WikiRow(title: "Weapons", symbol: "bolt.fill", symbolColor: .orange)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Armor", items: kind("Armor"))
                    } label: {
                        WikiRow(title: "Armor", symbol: "shield.fill", symbolColor: .red)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Accessories", items: kind("Accessory"))
                    } label: {
                        WikiRow(title: "Accessories", symbol: "star.circle.fill", symbolColor: .purple)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Materials", items: kind("Material"))
                    } label: {
                        WikiRow(title: "Materials", symbol: "cube.fill", symbolColor: .gray)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Consumables", items: kind("Consumable"))
                    } label: {
                        WikiRow(title: "Consumables", symbol: "drop.fill", symbolColor: Color(red: 0.9, green: 0.4, blue: 0.55))
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Furniture", items: kind("Furniture") + kind("Block"))
                    } label: {
                        WikiRow(title: "Furniture", symbol: "sofa.fill", symbolColor: Color(red: 0.55, green: 0.4, blue: 0.25))
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Ammo", items: kind("Ammo"))
                    } label: {
                        WikiRow(title: "Ammo", symbol: "arrow.up.circle.fill", symbolColor: .teal)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Tools", items: kind("Tool"))
                    } label: {
                        WikiRow(title: "Tools", symbol: "hammer.fill", symbolColor: .brown)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Other", items: kind("Other"))
                    } label: {
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
                    NavigationLink {
                        ItemListScreen(title: "All weapons", items: weapons)
                    } label: {
                        WikiRow(title: "All items")
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Melee weapons", items: weapons.filter { $0.tags.contains("melee") })
                    } label: {
                        WikiRow(title: "Melee weapons", symbol: "bolt.fill", symbolColor: .orange)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Ranged weapons", items: weapons.filter { $0.tags.contains("ranged") })
                    } label: {
                        WikiRow(title: "Ranged weapons", symbol: "scope", symbolColor: .blue)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Magic weapons", items: weapons.filter { $0.tags.contains("magic") })
                    } label: {
                        WikiRow(title: "Magic weapons", symbol: "wand.and.stars", symbolColor: .purple)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Summon weapons", items: weapons.filter { $0.tags.contains("summon") })
                    } label: {
                        WikiRow(title: "Summon weapons", symbol: "sparkles", symbolColor: .green)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Misc weapons", items: weapons.filter { miscWeapon($0) })
                    } label: {
                        WikiRow(title: "Misc weapons", symbol: "flame.fill", symbolColor: .pink)
                    }
                    HairlineDivider()

                    NavigationLink {
                        ItemListScreen(title: "Other", items: weapons.filter { otherWeapon($0) })
                    } label: {
                        WikiRow(title: "Other", symbol: "questionmark.circle.fill", symbolColor: .gray)
                    }
                }
            }
        }
    }

    private func miscWeapon(_ item: Item) -> Bool {
        !item.tags.contains("melee") && !item.tags.contains("ranged")
            && !item.tags.contains("magic") && !item.tags.contains("summon")
    }

    private func otherWeapon(_ item: Item) -> Bool {
        item.tags.contains("zenith") || item.tags.contains("legendary")
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
                            NavigationLink {
                                ItemDetailView(item: item)
                            } label: {
                                WikiRow(
                                    title: item.name,
                                    subtitle: itemSubtitle(item),
                                    symbol: itemSymbol(item),
                                    symbolColor: itemColor(item)
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

    var body: some View {
        WikiScreen(title: item.name, favoriteID: item.id) {
            ScrollView {
                header

                SectionHeader(text: "Statistics")
                DetailRow(label: "Type", value: item.kind)
                if let damage = item.damage {
                    DetailRow(label: "Damage", value: damage)
                }
                DetailRow(label: "Max Stack", value: "\(item.maxStack)")
                DetailRow(label: "Sell", value: item.sell ?? "No value")
                DetailRow(label: "Rarity", value: Rarity.label(item.rarity), valueColor: Rarity.color(item.rarity))

                SectionHeader(text: "Description")
                paragraph(item.description)

                SectionHeader(text: "How to obtain")
                paragraph(item.obtain)

                if let recipe = item.recipe {
                    NavigationLink {
                        RecipeView(itemName: item.name, recipe: recipe)
                    } label: {
                        WikiRow(title: "Recipe", symbol: "hammer.fill", symbolColor: .wikiGreen)
                    }
                    HairlineDivider()
                }

                if let usedIn = item.usedIn, !usedIn.isEmpty {
                    SectionHeader(text: "Ingredient in")
                    ForEach(usedIn, id: \.self) { name in
                        if let target = DataStore.shared.item(named: name) {
                            NavigationLink {
                                ItemDetailView(item: target)
                            } label: {
                                WikiRow(title: target.name, subtitle: itemSubtitle(target), symbol: itemSymbol(target), symbolColor: itemColor(target))
                            }
                            HairlineDivider()
                        } else {
                            WikiRow(title: name, showsChevron: false)
                            HairlineDivider()
                        }
                    }
                }

                if let notes = item.notes {
                    SectionHeader(text: "Notes")
                    paragraph(notes)
                }
            }
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            WikiArtwork(
                url: wikiFileURL(for: item.name),
                fallbackSymbol: itemSymbol(item),
                fallbackColor: itemColor(item),
                size: 52
            )
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(Color.primary)
                Text(item.kind)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Color.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(Color.white)
        .overlay(alignment: .bottom) { HairlineDivider() }
    }

    private func paragraph(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 15))
            .foregroundStyle(Color.primary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(Color.white)
            .overlay(alignment: .bottom) { HairlineDivider() }
    }
}

// MARK: - Recipe

struct RecipeView: View {
    let itemName: String
    let recipe: Recipe

    var body: some View {
        WikiScreen(title: "Recipe") {
            ScrollView {
                SectionHeader(text: itemName)

                DetailRow(label: "Crafted at", value: recipe.station)

                if let resultQty = recipe.resultQty, resultQty > 1 {
                    DetailRow(label: "Result", value: "×\(resultQty)")
                }

                SectionHeader(text: "Ingredients")
                ForEach(recipe.ingredients, id: \.self) { ingredient in
                    DetailRow(label: ingredient.name, value: "×\(ingredient.qty)")
                }
            }
        }
    }
}
