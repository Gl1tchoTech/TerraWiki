import SwiftUI

// MARK: - NPC list

struct NpcsView: View {
    @State private var query = ""
    private var store: DataStore { .shared }

    private var filtered: [Npc] {
        let sorted = store.npcs.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !q.isEmpty else { return sorted }
        return sorted.filter {
            $0.name.lowercased().contains(q)
                || $0.role.lowercased().contains(q)
                || $0.description.lowercased().contains(q)
        }
    }

    var body: some View {
        WikiScreen(title: "NPCs") {
            VStack(spacing: 0) {
                WikiSearchBar(text: $query)
                ScrollView {
                    LazyVStack(spacing: 0) {
                        SectionHeader(text: "Town NPCs")
                        ForEach(filtered) { npc in
                            NavigationLink {
                                NpcDetailView(npc: npc)
                            } label: {
                                WikiRow(
                                    title: npc.name,
                                    subtitle: npc.description,
                                    symbol: npcSymbol(npc),
                                    symbolColor: .wikiGreen
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

func npcSymbol(_ npc: Npc) -> String {
    if npc.tags.contains("special") { return "person.crop.circle.badge.questionmark" }
    return "person.fill"
}

// MARK: - NPC detail

struct NpcDetailView: View {
    let npc: Npc

    var body: some View {
        WikiScreen(title: npc.name, favoriteID: npc.id) {
            ScrollView {
                header

                SectionHeader(text: "Role")
                paragraph(npc.role)

                SectionHeader(text: "Description")
                paragraph(npc.description)

                SectionHeader(text: "Spawn condition")
                paragraph(npc.spawnCondition)

                if let biome = npc.biome {
                    DetailRow(label: "Preferred biome", value: biome)
                }

                if !npc.services.isEmpty {
                    SectionHeader(text: "Services")
                    ForEach(npc.services, id: \.self) { service in
                        DetailRow(label: service, value: "")
                    }
                }

                if !npc.sells.isEmpty {
                    SectionHeader(text: "Sells")
                    ForEach(npc.sells, id: \.self) { item in
                        DetailRow(label: item, value: "")
                    }
                }

                if let likes = npc.likes, !likes.isEmpty {
                    SectionHeader(text: "Likes")
                    ForEach(likes, id: \.self) { like in
                        DetailRow(label: like, value: "")
                    }
                }

                if let quotes = npc.quotes, !quotes.isEmpty {
                    SectionHeader(text: "Quotes")
                    ForEach(quotes, id: \.self) { quote in
                        Text("“\(quote)”")
                            .font(.system(size: 15))
                            .italic()
                            .foregroundStyle(Color.primary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(Color.white)
                            .overlay(alignment: .bottom) { HairlineDivider() }
                    }
                }

                if let notes = npc.notes {
                    SectionHeader(text: "Notes")
                    paragraph(notes)
                }
            }
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            PixelIcon(symbol: npcSymbol(npc), color: .wikiGreen, size: 52)
            VStack(alignment: .leading, spacing: 4) {
                Text(npc.name)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(Color.primary)
                Text(npc.role)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Color.secondary)
                    .lineLimit(2)
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
