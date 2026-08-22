# TerraWiki

A native **iOS** Terraria wiki app covering everything in the latest update (1.4.5.7): items and recipes, NPCs, bosses, mechanics, achievements, and guides. Written in **Swift + SwiftUI** and built into an **unsigned `.ipa`** via GitHub Actions so you can sign it yourself in [SideStore](https://sidestore.io/) (or AltStore).

- App name: **TerraWiki**
- Bundle ID: **`com.terraria.wiki`**

The `src/` directory also contains an early React/Vite prototype of the same content; the native app in `ios/` is the product.

## App layout

The app follows the classic Terraria DB look:

- Light table-view theme with green accents and a pixel grass/dirt header strip
- Split (master–detail) navigation: `Items · Armor · Enemies · NPCs · Achievements · Mechanics · Guides · Favorites · Videos · News · Remove Ads · About Us`
- Drill-down lists → detail pages with Statistics, Recipe, "Ingredient in", spawn conditions, drops, and strategies
- Global search plus per-screen search, and a persistent **Favorites** star on every entry

## Project structure

```
ios/
  project.yml                 # XcodeGen definition (generates TerraWiki.xcodeproj)
  TerraWiki/                  # SwiftUI app
    Resources/                # Bundled JSON database + asset catalog (incl. app icon)
  TerraWikiTests/             # Unit tests
.github/workflows/ios.yml     # Build, test, and unsigned IPA export
```

The Xcode project is generated from `project.yml` with [XcodeGen](https://github.com/yonaskolb/XcodeGen). The generated `TerraWiki.xcodeproj` and `Info.plist` are gitignored.

## Local development

Requirements: Xcode 15+ and XcodeGen.

```bash
cd ios
brew install xcodegen
xcodegen generate
open TerraWiki.xcodeproj
```

Select the `TerraWiki` scheme and run on a simulator or device.

## Data

The wiki database lives as JSON in `ios/TerraWiki/Resources/`:

- `items.json` — items, weapons, armor, accessories, materials, ammo, and recipes
- `npcs.json` — town and special NPCs
- `bosses.json` — pre-Hardmode and Hardmode bosses
- `mechanics.json` — game systems and guides

Edit those files to expand the database; no code changes are required.

## CI / building the unsigned IPA

On every push to `main` and every pull request, GitHub Actions runs the `Build & Test` job: it generates the project, builds for the iOS Simulator, and runs the unit tests.

To produce an IPA, run the **`Build unsigned IPA`** workflow manually (Actions → "iOS CI" → Run workflow). It compiles the app for device **without signing** and packages `Payload/TerraWiki.app` into a plain `.ipa` artifact — no Apple Developer account or signing secrets required.

### Installing with SideStore

1. Download the `TerraWiki-unsigned.ipa` artifact from the completed workflow run.
2. Import it into SideStore.
3. SideStore re-signs it with your Apple ID and installs it on your device.

> SideStore/AltStore injects their own signature at install time, which is why the exported IPA is deliberately unsigned. If you later want App Store distribution, add a signing identity to the workflow and export through Xcode Organizer instead.

## App icon

The icon in `ios/TerraWiki/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon.png` is the official Terraria game artwork, used as the app icon per this project's request. To use your own artwork, replace `AppIcon.png` (1024×1024, opaque PNG).

## Disclaimer

TerraWiki is not affiliated with Re-Logic. Terraria and its artwork are trademarks/copyright of Re-Logic; all game data and imagery are used for informational purposes.
