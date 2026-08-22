import SwiftUI

// MARK: - Boss list

struct BossesView: View {
    private var store: DataStore { .shared }

    var body: some View {
        BossListScreen(title: "Bosses", bosses: store.bosses.sorted { $0.name < $1.name })
    }
}

struct BossListScreen: View {
    let title: String
    let bosses: [Boss]

    var body: some View {
        WikiScreen(title: title) {
            if bosses.isEmpty {
                WikiEmptyState(title: "No entries in this category yet.", systemImage: "eye")
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(bosses) { boss in
                            NavigationLink {
                                BossDetailView(boss: boss)
                            } label: {
                                WikiRow(
                                    title: boss.name,
                                    subtitle: bossSubtitle(boss),
                                    symbol: bossSymbol(boss),
                                    symbolColor: bossColor(boss),
                                    thumbnailURL: wikiFileURL(for: boss)
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

func bossSymbol(_ boss: Boss) -> String {
    if boss.tags.contains("mechanical") { return "gearshape.fill" }
    if boss.tags.contains("worm") { return "arrow.down.circle.fill" }
    if boss.tags.contains("eye") { return "eye.fill" }
    if boss.tags.contains("slime") { return "drop.fill" }
    if boss.tags.contains("plant") { return "leaf.fill" }
    if boss.tags.contains("final") { return "crown.fill" }
    return "crown.fill"
}

func bossColor(_ boss: Boss) -> Color {
    boss.tier == "Hardmode" ? .red : .green
}

func bossSubtitle(_ boss: Boss) -> String {
    "\(boss.tier) · HP \(boss.hp)"
}

// MARK: - Boss detail

struct BossDetailView: View {
    let boss: Boss

    var body: some View {
        WikiScreen(title: boss.name, favoriteID: boss.id) {
            ScrollView {
                header

                SectionHeader(text: "Statistics")
                DetailRow(label: "Tier", value: boss.tier)
                DetailRow(label: "Health", value: boss.hp)
                if let biome = boss.biome {
                    DetailRow(label: "Biome", value: biome)
                }

                SectionHeader(text: "How to summon")
                paragraph(boss.summon)

                SectionHeader(text: "Description")
                paragraph(boss.description)

                SectionHeader(text: "Strategy")
                paragraph(boss.strategy)

                SectionHeader(text: "Drops")
                ForEach(boss.drops, id: \.self) { drop in
                    DetailRow(label: drop, value: "")
                }
            }
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            WikiArtwork(
                url: wikiFileURL(for: boss),
                fallbackSymbol: bossSymbol(boss),
                fallbackColor: bossColor(boss),
                size: 52
            )
            VStack(alignment: .leading, spacing: 4) {
                Text(boss.name)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(Color.primary)
                Text(boss.tier)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(bossColor(boss))
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
