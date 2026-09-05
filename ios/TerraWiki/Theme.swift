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

// MARK: - Async artwork for recipes

/// Renders a single recipe ingredient or station as a small tappable artwork chip.
/// Bundles the sprite from the app first, falls back to the wiki CDN, then to a system
/// placeholder — so ingredient/station chips load even after scrolling for a while.
struct RecipeArtwork: View {
    let name: String
    let qty: Int
    let size: CGFloat

    var body: some View {
        let store = DataStore.shared
        NavigationLink {
            if let item = store.item(named: name) {
                ItemDetailView(item: item)
            } else {
                WikiScreen(title: name) {
                    WikiEmptyState(title: "No details available.", systemImage: "photo")
                }
            }
        } label: {
            HStack(spacing: 8) {
                WikiArtwork(url: wikiFileURL(for: name), fallbackSymbol: "photo", fallbackColor: .wikiGreen, size: size)
                VStack(alignment: .leading, spacing: 1) {
                    Text(name)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Color.primary)
                        .lineLimit(1)
                    Text("×\(qty)")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.secondary)
                }
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 10).padding(.vertical, 8)
            .background(Color.wikiSelected)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        }
        .buttonStyle(.plain)
    }
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

/// Resolves wiki artwork shipped inside the app bundle (fully offline).
/// Filenames keep their exact wiki names (e.g. "Iron Pickaxe.png"), while URLs use
/// underscores — so lookups normalize between the two and load via explicit paths
/// (UIImage(named:) fails on names containing apostrophes or other punctuation).
enum SpriteLibrary {
    private static let extensions = ["png", "gif"]
    private static var cache: [String: UIImage?] = [:]
    private static let lock = NSLock()

    /// Resolves wiki sprites bundled inside the app.
    /// The sprite bundle stores the wiki's exact filenames where they exist
    /// (e.g. `Iron Pickaxe.png`, `Queen_Slime.png`, `Eye of Cthulhu (Phase 1).gif`),
    /// so the fastest path is the literal database value. We only try a few safe,
    /// reversible variants if that exact form is missing.
    static func image(for fileName: String?) -> UIImage? {
        guard let raw = fileName?.trimmingCharacters(in: .whitespacesAndNewlines), !raw.isEmpty else { return nil }
        let stripped = (raw as NSString).deletingPathExtension
        lock.lock()
        defer { lock.unlock() }
        if let cached = cache[raw] { return cached }

        var found: UIImage? = nil
        func tryFile(_ name: String) -> UIImage? {
            for ext in extensions {
                if let url = Bundle.main.url(forResource: name, withExtension: ext),
                   let img = UIImage(contentsOfFile: url.path) {
                    return img
                }
            }
            return nil
        }

        // 1) Exact value from the database (already includes extension in most rows).
        if let img = tryFile(stripped) { found = img }

        // 2) Also try the exact name without stripping the extension yet, in case the DB
        //    row is `Foo.png` but the lookup passed us `Foo.png` as-is.
        if found == nil {
            if let img = tryFile(raw) { found = img }
        }

        // 3) Underscores <-> spaces. The bundle stores one convention per file, so we only
        //    need the reversible swap for the entries whose wiki filename differs from the
        //    bundled filename.
        if found == nil {
            if let img = tryFile(stripped.replacingOccurrences(of: "_", with: " ")) { found = img }
        }
        if found == nil {
            if let img = tryFile(stripped.replacingOccurrences(of: " ", with: "_")) { found = img }
        }

        // 4) Wiki-only parenthetical disambiguation, e.g. `Eye of Cthulhu (Phase 1).gif`.
        //    If the parenthesized form is missing, try the base name.
        if found == nil {
            let base = stripped
            if let open = base.lastIndex(of: "(") {
                let withoutParens = String(base[..<open]).trimmingCharacters(in: .whitespacesAndNewlines)
                if let img = tryFile(withoutParens) { found = img }
            }
        }

        cache[raw] = found
        return found
    }
}

struct WikiArtwork: View {
    let url: URL?
    let fallbackSymbol: String
    let fallbackColor: Color
    let size: CGFloat

    @State private var loadedImage: UIImage? = nil
    @State private var didLoad = false
    var body: some View {
        Group {
            if let img = loadedImage {
                Image(uiImage: img)
                    .resizable()
                    .scaledToFit()
                    .frame(width: size, height: size)
            } else if !didLoad {
                Color.clear
                    .frame(width: size, height: size)
                    .task {
                        // Primary source: the sprite bundled in the app.
                        let lookupName = url.map { $0.lastPathComponent } ?? ""
                        if let bundled = SpriteLibrary.image(for: lookupName) {
                            loadedImage = bundled
                        } else if let url {
                            loadedImage = await loadImage(url: url)
                        }
                        didLoad = true
                    }
            } else {
                PixelIcon(symbol: fallbackSymbol, color: fallbackColor, size: size)
            }
        }
        .frame(width: size, height: size)
    }
}

/// Loads an image from URLCache (disk + memory), falling back to network.
private func loadImage(url: URL) async -> UIImage? {
    let request = URLRequest(url: url, cachePolicy: .returnCacheDataElseLoad, timeoutInterval: 15)
    // Check cache first
    if let cached = URLCache.shared.cachedResponse(for: request),
       let image = UIImage(data: cached.data) {
        return image
    }
    // Fetch from network
    do {
        let (data, response) = try await URLSession.shared.data(for: request)
        if let image = UIImage(data: data) {
            // Store in cache
            let cached = CachedURLResponse(response: response, data: data)
            URLCache.shared.storeCachedResponse(cached, for: request)
            return image
        }
    } catch {}
    return nil
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

private func wikiFileURL(fileName: String) -> URL? {
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
    return wikiFileURL(fileName: fileName)
}

func wikiFileURL(for mob: Mob) -> URL? {
    let fileName = (mob.image ?? (mob.name.replacingOccurrences(of: " ", with: "_") + ".png"))
        .replacingOccurrences(of: " ", with: "_")
    return wikiFileURL(fileName: fileName)
}

func wikiFileURL(for npc: Npc) -> URL? {
    let fileName = (npc.image ?? (npc.name.replacingOccurrences(of: " ", with: "_") + ".png"))
        .replacingOccurrences(of: " ", with: "_")
    return wikiFileURL(fileName: fileName)
}

func wikiFileURL(for boss: Boss) -> URL? {
    let fileName = (boss.image ?? (boss.name.replacingOccurrences(of: " ", with: "_") + ".png"))
        .replacingOccurrences(of: " ", with: "_")
    return wikiFileURL(fileName: fileName)
}

func wikiFileURL(for result: DataStore.SearchResult) -> URL? {
    let store = DataStore.shared
    switch result.category {
    case .items: return store.item(id: result.id).map(wikiFileURL(for:)) ?? nil
    case .npcs: return store.npc(id: result.id).map(wikiFileURL(for:)) ?? nil
    case .mobs: return store.mob(id: result.id).map(wikiFileURL(for:)) ?? nil
    case .bosses: return store.boss(id: result.id).map(wikiFileURL(for:)) ?? nil
    case .mechanics: return store.mechanic(id: result.id).map(wikiFileURL(for:)) ?? nil
    }
}

func wikiFileURL(for mechanic: Mechanic) -> URL? {
    let fileName = (mechanic.image ?? (mechanic.name.replacingOccurrences(of: " ", with: "_") + ".png"))
        .replacingOccurrences(of: " ", with: "_")
    return wikiFileURL(fileName: fileName)
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

/// Small row for a recipe ingredient that shows the item image next to the name/qty.
struct IngredientRow: View {
    let ing: Ingredient

    var body: some View {
        RecipeArtwork(name: ing.name, qty: ing.qty, size: 30)
    }
}

/// Station row for a recipe that shows the station image next to the name.
struct StationRow: View {
    let station: String

    var body: some View {
        RecipeArtwork(name: station, qty: 1, size: 30)
    }
}

/// Generic detail row used on non-recipe screens.
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
    @State private var showingSearch = false
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
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showingSearch = true
                } label: {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 17, weight: .medium))
                        .foregroundStyle(Color.wikiGreen)
                }
            }
        }
        .sheet(isPresented: $showingSearch) {
            SearchView()
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
