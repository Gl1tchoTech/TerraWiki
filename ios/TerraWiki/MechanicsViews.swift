import SwiftUI

// MARK: - Mechanics list

struct MechanicsView: View {
    private var store: DataStore { .shared }

    var body: some View {
        MechanicListScreen(title: "Mechanics", mechanics: store.mechanics.sorted { $0.name < $1.name })
    }
}

struct MechanicListScreen: View {
    let title: String
    let mechanics: [Mechanic]

    var body: some View {
        WikiScreen(title: title) {
            if mechanics.isEmpty {
                WikiEmptyState(title: "No mechanics in this category yet.", systemImage: "gearshape.2.fill")
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(mechanics) { mechanic in
                            NavigationLink {
                                MechanicDetailView(mechanic: mechanic)
                            } label: {
                                WikiRow(
                                    title: mechanic.name,
                                    subtitle: mechanic.group,
                                    symbol: mechanicSymbol(mechanic),
                                    symbolColor: mechanicColor(mechanic.group),
                                    thumbnailURL: wikiFileURL(for: mechanic)
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

func mechanicSymbol(_ mechanic: Mechanic) -> String {
    if mechanic.tags.contains("crafting") { return "hammer.fill" }
    if mechanic.tags.contains("combat") || mechanic.tags.contains("bosses") { return "bolt.fill" }
    if mechanic.tags.contains("fishing") { return "fish.fill" }
    if mechanic.tags.contains("housing") || mechanic.tags.contains("building") { return "house.fill" }
    if mechanic.tags.contains("progression") { return "flag.fill" }
    if mechanic.tags.contains("wiring") { return "cable.connector" }
    return "gearshape.fill"
}

func mechanicColor(_ group: String) -> Color {
    switch group {
    case "Progression": return .orange
    case "World": return .green
    case "Combat": return .red
    case "Systems": return .blue
    case "Events": return .purple
    case "Building": return Color(red: 0.55, green: 0.4, blue: 0.25)
    default: return .wikiGreen
    }
}

// MARK: - Mechanic detail

struct MechanicDetailView: View {
    let mechanic: Mechanic

    var body: some View {
        WikiScreen(title: mechanic.name, favoriteID: mechanic.id) {
            ScrollView {
                header

                SectionHeader(text: "Summary")
                paragraph(mechanic.summary)

                SectionHeader(text: "How it works")
                paragraph(mechanic.howItWorks)

                if let tips = mechanic.tips, !tips.isEmpty {
                    SectionHeader(text: "Tips")
                    ForEach(tips, id: \.self) { tip in
                        DetailRow(label: tip, value: "")
                    }
                }

                if let related = mechanic.related, !related.isEmpty {
                    SectionHeader(text: "Related")
                    ForEach(related, id: \.self) { name in
                        if let item = DataStore.shared.item(named: name) {
                            NavigationLink {
                                ItemDetailView(item: item)
                            } label: {
                                WikiRow(title: item.name, subtitle: item.kind, symbol: itemSymbol(item), symbolColor: itemColor(item), thumbnailURL: wikiFileURL(for: item))
                            }
                            HairlineDivider()
                        } else if let npc = DataStore.shared.npc(named: name) {
                            NavigationLink {
                                NpcDetailView(npc: npc)
                            } label: {
                                WikiRow(title: npc.name, subtitle: npc.role, symbol: npcSymbol(npc), symbolColor: .wikiGreen, thumbnailURL: wikiFileURL(for: npc))
                            }
                            HairlineDivider()
                        } else {
                            WikiRow(title: name, showsChevron: false)
                            HairlineDivider()
                        }
                    }
                }
            }
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            WikiArtwork(
                url: wikiFileURL(for: mechanic),
                fallbackSymbol: mechanicSymbol(mechanic),
                fallbackColor: mechanicColor(mechanic.group),
                size: 52
            )
            VStack(alignment: .leading, spacing: 4) {
                Text(mechanic.name)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(Color.primary)
                Text(mechanic.group)
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
