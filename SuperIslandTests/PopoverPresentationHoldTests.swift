import XCTest
@testable import SuperIsland

@MainActor
final class PopoverPresentationHoldTests: XCTestCase {
    private let lyrics = ActiveModule.extension_("com.wangxulong.superisland.synced-lyrics")

    func testOpenMenuCancelsPendingDismissAndClosingResumesIt() async throws {
        let state = AppState.makeIsolatedForTesting()
        state.activeModule = lyrics
        state.currentState = .expanded
        state.scheduleAutoDismiss(after: 0.03)
        let owner = UUID()
        state.beginPopoverInteraction(id: owner, for: lyrics)
        try await Task.sleep(nanoseconds: 120_000_000)
        XCTAssertEqual(state.currentState, .expanded)
        state.endPopoverInteraction(id: owner)
        state.scheduleAutoDismiss(after: 0.03)
        try await Task.sleep(nanoseconds: 120_000_000)
        XCTAssertEqual(state.currentState, .compact)
    }

    func testPopoverHoldsOnlyItsOwnPageAndReleasesOnClose() {
        let state = AppState.makeIsolatedForTesting()
        let owner = UUID()
        state.beginPopoverInteraction(id: owner, for: lyrics)
        XCTAssertTrue(state.isPresentationHeldForTesting(lyrics))
        XCTAssertFalse(state.isPresentationHeldForTesting(.builtIn(.weather)))
        state.endPopoverInteraction(id: owner)
        XCTAssertFalse(state.isPresentationHeldForTesting(lyrics))
    }

    func testMultiplePresentersCannotReleaseEachOthersHold() {
        let state = AppState.makeIsolatedForTesting()
        let first = UUID(), second = UUID()
        state.beginPopoverInteraction(id: first, for: lyrics)
        state.beginPopoverInteraction(id: second, for: lyrics)
        state.endPopoverInteraction(id: first)
        XCTAssertTrue(state.isPresentationHeldForTesting(lyrics))
        state.endPopoverInteraction(id: UUID())
        XCTAssertTrue(state.isPresentationHeldForTesting(lyrics))
        state.endPopoverInteraction(id: second)
        XCTAssertFalse(state.isPresentationHeldForTesting(lyrics))
    }

    func testPopoverDoesNotOverwritePersistentModuleHold() {
        let state = AppState.makeIsolatedForTesting()
        let owner = UUID()
        state.holdPresentation(for: .builtIn(.teleprompter))
        state.beginPopoverInteraction(id: owner, for: lyrics)
        state.endPopoverInteraction(id: owner)
        XCTAssertTrue(state.isPresentationHeldForTesting(.builtIn(.teleprompter)))
        XCTAssertFalse(state.isPresentationHeldForTesting(lyrics))
    }
}
