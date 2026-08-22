import XCTest
@testable import TerraWiki

final class TerraWikiTests: XCTestCase {
    private var testStore: DataStore {
        DataStore(bundle: Bundle(for: TerraWikiTests.self))
    }

    func testDataLoads() {
        let store = testStore
        XCTAssertFalse(store.items.isEmpty, "Items should load from the bundle")
        XCTAssertFalse(store.npcs.isEmpty, "NPCs should load from the bundle")
        XCTAssertFalse(store.bosses.isEmpty, "Bosses should load from the bundle")
        XCTAssertFalse(store.mechanics.isEmpty, "Mechanics should load from the bundle")
    }

    func testSearchFindsByName() {
        let results = testStore.search("zenith")
        XCTAssertTrue(results.contains { $0.name == "Zenith" }, "Search should find the Zenith by name")
    }

    func testSearchFindsNpcByRole() {
        let results = testStore.search("healer")
        XCTAssertTrue(results.contains { $0.name == "Nurse" }, "Search should find the Nurse by role text")
    }

    // MARK: Full item database coverage

    func testItemDatabaseCoversFullCatalog() {
        let store = testStore
        XCTAssertGreaterThanOrEqual(store.items.count, 6000, "Item database should include the complete 1.4.5.7 catalog")
    }

    func testRepresentativeItemsExist() {
        let store = testStore
        for name in ["Zenith", "Meowmere", "Iron Pickaxe", "Torch", "Wooden Chair", "Lesser Healing Potion", "Copper Coin"] {
            XCTAssertNotNil(store.item(named: name), "Item '\(name)' should exist in the database")
        }
    }

    func testItemKindsAreClassified() {
        let store = testStore
        XCTAssertTrue(store.items.contains { $0.kind == "Weapon" }, "Database should contain weapons")
        XCTAssertTrue(store.items.contains { $0.kind == "Tool" }, "Database should contain tools")
        XCTAssertTrue(store.items.contains { $0.kind == "Armor" }, "Database should contain armor")
        XCTAssertTrue(store.items.contains { $0.kind == "Accessory" }, "Database should contain accessories")
        XCTAssertTrue(store.items.contains { $0.kind == "Consumable" }, "Database should contain consumables")
        XCTAssertTrue(store.items.contains { $0.kind == "Ammo" }, "Database should contain ammunition")
    }

    func testZenithHasRecipe() {
        guard let zenith = testStore.item(named: "Zenith"), let recipe = zenith.recipe else {
            XCTFail("Zenith should exist with a recipe")
            return
        }
        XCTAssertEqual(recipe.ingredients.count, 10, "Zenith should be crafted from 10 swords")
        XCTAssertTrue(recipe.ingredients.contains { $0.name == "Terra Blade" })
        XCTAssertTrue(recipe.ingredients.contains { $0.name == "Copper Shortsword" })
    }

    func testItemsCarryStats() {
        guard let meowmere = testStore.item(named: "Meowmere") else {
            XCTFail("Meowmere should exist")
            return
        }
        XCTAssertEqual(meowmere.kind, "Weapon")
        XCTAssertNotNil(meowmere.damage, "Weapons should list damage")
        XCTAssertNotNil(meowmere.sell, "Items should list sell value")
        XCTAssertFalse(meowmere.description.isEmpty)
        XCTAssertFalse(meowmere.tags.isEmpty)
    }

    func testEveryItemHasImageReference() {
        let store = testStore
        XCTAssertFalse(store.items.isEmpty)
        for item in store.items {
            XCTAssertNotNil(item.image, "Item '\(item.name)' should carry an image file reference")
        }
    }

    func testItemImageURLsAreBuildable() {
        let store = testStore
        for item in store.items.prefix(200) {
            XCTAssertNotNil(wikiFileURL(for: item), "Item '\(item.name)' should produce a valid image URL")
        }
    }

    func testUsedInLinksAreResolvable() {
        let store = testStore
        guard let terraBlade = store.item(named: "Terra Blade"), let usedIn = terraBlade.usedIn else {
            XCTFail("Terra Blade should list items it is used to craft")
            return
        }
        for name in usedIn {
            XCTAssertNotNil(store.item(named: name), "Used-in entry '\(name)' should resolve to an item in the database")
        }
    }
}
