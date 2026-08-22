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
}
