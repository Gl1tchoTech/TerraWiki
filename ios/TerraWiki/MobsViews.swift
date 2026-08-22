import SwiftUI

// MARK: - Mob helpers

func mobSymbol(_ mob: Mob) -> String {
    if mob.tags.contains("servant") { return "dot.circle.fill" }
    if mob.tags.contains("undead") || mob.tags.contains("skeleton") { return "person.crop.circle.badge.xmark" }
    if mob.tags.contains("slime") { return "drop.fill" }
    if mob.tags.contains("worm") { return "arrow.down.circle.fill" }
    if mob.tags.contains("fly") || mob.tags.contains("bat") { return "bird.fill" }
    if mob.tags.contains("plant") { return "leaf.fill" }
    return "eye.fill"
}

func mobColor(_ mob: Mob) -> Color {
    if mob.tier == "Hardmode" { return .red }
    if mob.tags.contains("event") { return .purple }
    return .green
}

func mobSubtitle(_ mob: Mob) -> String {
    var parts = [mob.tier]
    if let hp = mob.damage, !hp.isEmpty { parts.append("\(hp) dmg") }
    if let biome = mob.biome, !biome.isEmpty { parts.append(biome) }
    return parts.joined(separator: " · ")
}

// MARK: - Mob list

struct MobListScreen: View {
    let title: String
    let mobs: [Mob]

    var body: some View {
        WikiScreen(title: title) {
            if mobs.isEmpty {
                WikiEmptyState(title: "No enemies in this category yet.", systemImage: "eye")
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(mobs) { mob in
                            NavigationLink {
                                MobDetailView(mob: mob)
                            } label: {
                                WikiRow(
                                    title: mob.name,
                                    subtitle: mobSubtitle(mob),
                                    symbol: mobSymbol(mob),
                                    symbolColor: mobColor(mob),
                                    thumbnailURL: wikiFileURL(for: mob)
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

// MARK: - Mob detail

struct MobDetailView: View {
    let mob: Mob

    var body: some View {
        WikiScreen(title: mob.name, favoriteID: mob.id) {
            ScrollView {
                header

                SectionHeader(text: "Statistics")
                DetailRow(label: "Tier", value: mob.tier)
                if !mob.hp.isEmpty {
                    DetailRow(label: "Health", value: mob.hp)
                }
                if let damage = mob.damage, !damage.isEmpty {
                    DetailRow(label: "Damage", value: damage)
                }
                if let defense = mob.defense, !defense.isEmpty {
                    DetailRow(label: "Defense", value: defense)
                }
                if let knockback = mob.knockback, !knockback.isEmpty {
                    DetailRow(label: "Knockback resist", value: knockback)
                }
                if let coins = mob.coins, !coins.isEmpty {
                    DetailRow(label: "Coins", value: coins)
                }
                if let ai = mob.ai, !ai.isEmpty {
                    DetailRow(label: "AI", value: ai)
                }
                if let biome = mob.biome, !biome.isEmpty {
                    DetailRow(label: "Environment", value: biome)
                }

                SectionHeader(text: "Description")
                paragraph(mob.description)

                if !mob.drops.isEmpty {
                    SectionHeader(text: "Drops")
                    ForEach(mob.drops, id: \.self) { drop in
                        DetailRow(label: drop, value: "")
                    }
                }
            }
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            WikiArtwork(
                url: wikiFileURL(for: mob),
                fallbackSymbol: mobSymbol(mob),
                fallbackColor: mobColor(mob),
                size: 52
            )
            VStack(alignment: .leading, spacing: 4) {
                Text(mob.name)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(Color.primary)
                Text("\(mob.tier)\(mob.biome.map { " · \($0)" } ?? "")")
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
