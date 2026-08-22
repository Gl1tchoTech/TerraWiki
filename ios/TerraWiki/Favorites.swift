import Foundation
import SwiftUI

/// Persists starred wiki entries across launches.
final class Favorites: ObservableObject {
    @Published private(set) var ids: Set<String>

    private let key = "terrawiki.favorites.v1"

    init() {
        if let saved = UserDefaults.standard.string(forKey: key) {
            ids = Set(saved.split(separator: ",").map(String.init).filter { !$0.isEmpty })
        } else {
            ids = []
        }
    }

    func contains(_ id: String) -> Bool {
        ids.contains(id)
    }

    func toggle(_ id: String) {
        if ids.contains(id) {
            ids.remove(id)
        } else {
            ids.insert(id)
        }
        persist()
    }

    private func persist() {
        UserDefaults.standard.set(ids.sorted().joined(separator: ","), forKey: key)
    }
}
