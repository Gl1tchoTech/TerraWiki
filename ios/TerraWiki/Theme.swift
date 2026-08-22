import SwiftUI

// MARK: - Colors

extension Color {
    /// Dark forest green used for titles, back chevrons, and accents.
    static let wikiGreen = Color(red: 0.0, green: 0.42, blue: 0.0)
    /// Brighter green used for the grass texture highlights.
    static let wikiGreenBright = Color(red: 0.17, green: 0.55, blue: 0.17)
    /// Light table-view background.
    static let wikiBackground = Color(red: 0.94, green: 0.94, blue: 0.94)
    /// Selected row highlight.
    static let wikiSelected = Color(red: 0.87, green: 0.87, blue: 0.87)
    /// Thin row divider.
    static let wikiDivider = Color(red: 0.86, green: 0.86, blue: 0.86)
    /// Pixel dirt brown.
    static let wikiDirt = Color(red: 0.47, green: 0.32, blue: 0.19)
    /// Darker dirt brown for texture.
    static let wikiDirtDark = Color(red: 0.36, green: 0.24, blue: 0.13)
}

// MARK: - Fonts

extension Font {
    /// The handwritten title font used across the app (a bundled iOS system font).
    static func wikiScript(_ size: CGFloat) -> Font {
        .custom("Bradley Hand", size: size)
    }
}

// MARK: - Grass border

/// A pixel-art grass/dirt strip that runs below the navigation bar.
struct GrassBorder: View {
    private let grassLight = Color(red: 0.42, green: 0.70, blue: 0.33)
    private let grassDark = Color(red: 0.16, green: 0.46, blue: 0.14)

    var body: some View {
        Canvas { context, size in
            let s: CGFloat = 9
            // Dirt base.
            let dirtRect = CGRect(x: 0, y: s * 0.9, width: size.width, height: size.height - s * 0.9)
            context.fill(Path(dirtRect), with: .color(.wikiDirt))

            // Dirt speckles.
            var speckleX: CGFloat = s * 0.5
            while speckleX < size.width {
                let r = CGRect(x: speckleX, y: size.height - s * 0.72, width: s * 0.5, height: s * 0.5)
                context.fill(Path(r), with: .color(.wikiDirtDark))
                speckleX += s * 2.4
            }

            // Jagged grass tufts.
            let heights: [CGFloat] = [1.6, 1.0, 1.35, 0.85, 1.5, 1.1]
            var x: CGFloat = 0
            var i = 0
            while x < size.width {
                let h = s * heights[i % heights.count]
                let rect = CGRect(x: x, y: size.height - h, width: s, height: h)
                context.fill(Path(rect), with: .color(i % 2 == 0 ? grassLight : grassDark))
                x += s
                i += 1
            }
        }
        .frame(height: 15)
        .frame(maxWidth: .infinity)
        .background(Color.wikiGreen)
    }
}

// MARK: - Icon

/// A soft, tinted square icon used in list rows.
struct PixelIcon: View {
    let symbol: String
    var color: Color = .wikiGreen
    var size: CGFloat = 30

    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.2, style: .continuous)
            .fill(color.opacity(0.14))
            .frame(width: size, height: size)
            .overlay {
                Image(systemName: symbol)
                    .font(.system(size: size * 0.46, weight: .semibold))
                    .foregroundStyle(color)
            }
    }
}

struct WikiArtwork: View {
    let url: URL?
    let fallbackSymbol: String
    let fallbackColor: Color
    let size: CGFloat

    var body: some View {
        AsyncImage(url: url) { phase in
            if let image = phase.image {
                image
                    .resizable()
                    .scaledToFit()
                    .frame(width: size, height: size)
            } else {
                PixelIcon(symbol: fallbackSymbol, color: fallbackColor, size: size)
            }
        }
        .frame(width: size, height: size)
    }
}

func wikiFileURL(for name: String) -> URL? {
    let fileName = name.replacingOccurrences(of: " ", with: "_") + ".png"
    var components = URLComponents()
    components.scheme = "https"
    components.host = "terraria.wiki.gg"
    components.path = "/wiki/Special:FilePath/\(fileName)"
    components.queryItems = [URLQueryItem(name: "width", value: "192")]
    return components.url
}

func wikiFileURL(for item: Item) -> URL? {
    // Prefer the exact verified image file from the database; fall back to a name-derived guess.
    let fileName = (item.image ?? (item.name.replacingOccurrences(of: " ", with: "_") + ".png"))
        .replacingOccurrences(of: " ", with: "_")
    var components = URLComponents()
    components.scheme = "https"
    components.host = "terraria.wiki.gg"
    components.path = "/wiki/Special:FilePath/\(fileName)"
    components.queryItems = [URLQueryItem(name: "width", value: "192")]
    return components.url
}

// MARK: - Icon helpers

func itemSymbol(_ item: Item) -> String {
    switch item.kind {
    case "Weapon":
        if item.tags.contains("melee") { return "bolt.fill" }
        if item.tags.contains("ranged") { return "scope" }
        if item.tags.contains("magic") { return "wand.and.stars" }
        if item.tags.contains("summon") { return "sparkles" }
        return "flame.fill"
    case "Tool": return "hammer.fill"
    case "Armor": return "shield.fill"
    case "Accessory": return "star.circle.fill"
    case "Material": return "cube.fill"
    case "Consumable": return "drop.fill"
    case "Block": return "square.grid.3x3.fill"
    case "Furniture": return "sofa.fill"
    case "Ammo": return "arrow.up.circle.fill"
    default: return "square.grid.2x2"
    }
}

func itemColor(_ item: Item) -> Color {
    switch item.kind {
    case "Weapon": return .orange
    case "Tool": return Color(red: 0.6, green: 0.42, blue: 0.2)
    case "Armor": return .red
    case "Accessory": return .purple
    case "Material": return .gray
    case "Consumable": return Color(red: 0.9, green: 0.4, blue: 0.55)
    case "Block", "Furniture": return Color(red: 0.55, green: 0.4, blue: 0.25)
    case "Ammo": return .teal
    default: return .wikiGreen
    }
}

func itemSubtitle(_ item: Item) -> String {
    var parts = [item.kind]
    if let damage = item.damage { parts.append(damage) }
    if item.hardmode == true { parts.append("Hardmode") }
    return parts.joined(separator: " · ")
}

// MARK: - Rows & dividers

struct HairlineDivider: View {
    var body: some View {
        Rectangle()
            .fill(Color.wikiDivider)
            .frame(height: 0.5)
    }
}

struct WikiRow: View {
    let title: String
    var subtitle: String? = nil
    var symbol: String? = nil
    var symbolColor: Color = .wikiGreen
    var isSelected: Bool = false
    var showsChevron: Bool = true
    var thumbnailURL: URL? = nil

    var body: some View {
        HStack(spacing: 12) {
            if let thumbnailURL {
                WikiArtwork(url: thumbnailURL, fallbackSymbol: symbol ?? "photo", fallbackColor: symbolColor, size: 30)
            } else if let symbol {
                PixelIcon(symbol: symbol, color: symbolColor)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 16, weight: isSelected ? .bold : .semibold))
                    .foregroundStyle(Color.primary)
                    .multilineTextAlignment(.leading)
                if let subtitle {
                    Text(subtitle)
                        .font(.system(size: 13))
                        .foregroundStyle(Color.secondary)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                }
            }
            Spacer(minLength: 0)
            if showsChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color(.systemGray3))
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(isSelected ? Color.wikiSelected : Color.white)
    }
}

struct SectionHeader: View {
    let text: String

    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(Color.secondary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16)
            .padding(.top, 20)
            .padding(.bottom, 6)
    }
}

// MARK: - Detail row

struct DetailRow: View {
    let label: String
    let value: String
    var valueColor: Color = .primary

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 12) {
            Rectangle()
                .fill(Color.wikiGreen)
                .frame(width: 7, height: 7)
            Text(label)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(Color.primary)
            Spacer(minLength: 8)
            Text(value)
                .font(.system(size: 15))
                .foregroundStyle(valueColor)
                .multilineTextAlignment(.trailing)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.white)
        .overlay(alignment: .bottom) { HairlineDivider() }
    }
}

// MARK: - Screen scaffold

/// Shared header treatment: script title, optional star, and a pinned grass border.
struct WikiScreen<Content: View>: View {
    let title: String
    var favoriteID: String? = nil
    @EnvironmentObject private var favorites: Favorites
    @ViewBuilder var content: Content

    var body: some View {
        VStack(spacing: 0) {
            GrassBorder()
            content
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        }
        .background(Color.wikiBackground)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text(title)
                    .font(.wikiScript(23))
                    .foregroundStyle(Color.wikiGreen)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            if let favoriteID {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        favorites.toggle(favoriteID)
                    } label: {
                        Image(systemName: favorites.contains(favoriteID) ? "star.fill" : "star")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundStyle(Color.wikiGreen)
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.white, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .tint(Color.wikiGreen)
    }
}

// MARK: - Search bar

struct WikiSearchBar: View {
    @Binding var text: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Color.secondary)
            TextField("Search", text: $text)
                .font(.system(size: 16))
                .autocorrectionDisabled()
            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Color.secondary)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 9)
        .background(Color(.systemGray5))
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}

// MARK: - Empty state

struct WikiEmptyState: View {
    let title: String
    var systemImage: String = "square.grid.2x2"

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: systemImage)
                .font(.system(size: 34, weight: .light))
                .foregroundStyle(Color.secondary)
            Text(title)
                .font(.system(size: 15))
                .foregroundStyle(Color.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }
}
