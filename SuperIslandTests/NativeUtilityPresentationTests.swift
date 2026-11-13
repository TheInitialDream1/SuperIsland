import XCTest
@testable import SuperIsland

@MainActor
final class NativeUtilityPresentationTests: XCTestCase {
    func testUtilitiesHaveSeparateFullExpandedTabsAndOptInManifests() {
        let utilities = NativeUtilityExtension.allCases
        XCTAssertEqual(Set(utilities.map(\.id)).count, utilities.count)
        XCTAssertEqual(Set(utilities.map { FullExpandedTab.module($0.module).id }).count, utilities.count)
        for utility in utilities {
            let manifest = ExtensionManifest(nativeUtility: utility)
            XCTAssertEqual(NativeUtilityExtension(id: manifest.id), utility)
            XCTAssertFalse(manifest.defaultEnabled)
            XCTAssertTrue(manifest.capabilities.fullExpanded)
            XCTAssertFalse(manifest.capabilities.compact)
            XCTAssertFalse(manifest.capabilities.expanded)
            XCTAssertFalse(manifest.capabilities.backgroundRefresh)
            XCTAssertEqual(manifest.layout.fullExpandedHeight, utility.panelHeight)
        }
    }

    func testRemovingSelectedUtilityReturnsHomeAndClearsStaleModule() {
        let state = AppState.makeIsolatedForTesting()
        state.currentState = .fullExpanded
        let tab = FullExpandedTab.module(NativeUtilityExtension.note.module)
        state.selectFullExpandedTab(tab)
        state.removeUtilitySelection(NativeUtilityExtension.tasks.module)
        XCTAssertEqual(state.fullExpandedSelectedTab, tab)
        state.removeUtilitySelection(NativeUtilityExtension.note.module)
        XCTAssertEqual(state.fullExpandedSelectedTab, .home)
        XCTAssertNil(state.activeModule)
    }

    func testCollapsingUtilityRestoresCompactModuleSelection() {
        let state = AppState.makeIsolatedForTesting()
        state.currentState = .fullExpanded
        state.selectFullExpandedTab(.module(NativeUtilityExtension.clock.module))
        state.currentState = .compact
        XCTAssertNil(state.activeModule)
    }
}
