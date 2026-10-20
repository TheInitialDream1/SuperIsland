import XCTest
@testable import SuperIsland

@MainActor
final class ExtensionPresentationSelectionTests: XCTestCase {
    func testSelectingLyricsPreservesCompactState() {
        let state = AppState.makeIsolatedForTesting()
        state.currentState = .compact
        state.setActiveModule(.extension_("com.wangxulong.superisland.synced-lyrics"))
        XCTAssertEqual(state.activeModule, .extension_("com.wangxulong.superisland.synced-lyrics"))
        XCTAssertEqual(state.currentState, .compact)
    }

    func testSelectingLyricsPreservesExpandedState() {
        let state = AppState.makeIsolatedForTesting()
        state.currentState = .expanded
        state.setActiveModule(.extension_("com.wangxulong.superisland.synced-lyrics"))
        XCTAssertEqual(state.currentState, .expanded)
    }

    func testSelectingLyricsPreservesFullExpandedState() {
        let state = AppState.makeIsolatedForTesting()
        state.currentState = .fullExpanded
        state.setActiveModule(.extension_("com.wangxulong.superisland.synced-lyrics"))
        XCTAssertEqual(state.currentState, .fullExpanded)
    }
}
