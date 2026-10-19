import XCTest
@testable import SuperIsland

final class PlaybackSeekStateTests: XCTestCase {
    private let now = Date(timeIntervalSince1970: 1000)

    func testOldPositionCannotUndoSeekBeforeAcknowledgement() {
        var state = PlaybackSeekState()
        state.begin(context: "track-a", previousPosition: 30, at: now)
        XCTAssertEqual(state.resolve(reported: 31, current: 150, context: "track-a", hasPosition: true,
                                     at: now.addingTimeInterval(0.8)), 150)
        XCTAssertEqual(state.resolve(reported: 151.1, current: 151, context: "track-a", hasPosition: true,
                                     at: now.addingTimeInterval(1)), 151.1)
        XCTAssertNil(state.pending)
        // After confirmation, a seek performed inside the real player is authoritative.
        XCTAssertEqual(state.resolve(reported: 70, current: 152, context: "track-a", hasPosition: true,
                                     at: now.addingTimeInterval(2)), 70)
    }

    func testRejectedSeekRecoversAndMetadataIsNotAnAcknowledgement() {
        var state = PlaybackSeekState()
        state.begin(context: "a", previousPosition: 20, at: now)
        XCTAssertEqual(state.resolve(reported: 20, current: 100, context: "a", hasPosition: false,
                                     at: now.addingTimeInterval(1)), 100)
        XCTAssertNotNil(state.pending)
        XCTAssertEqual(state.resolve(reported: 25, current: 105, context: "a", hasPosition: true,
                                     at: now.addingTimeInterval(5.1)), 25)
        XCTAssertNil(state.pending)
    }

    func testNewSeekSupersedesOldOneAndTrackChangeCancelsWait() {
        var state = PlaybackSeekState()
        let first = state.begin(context: "a", previousPosition: 30, at: now)
        let second = state.begin(context: "a", previousPosition: 150, at: now.addingTimeInterval(1))
        XCTAssertNotEqual(first, second)
        XCTAssertEqual(state.resolve(reported: 150, current: 220, context: "a", hasPosition: true,
                                     at: now.addingTimeInterval(1.2)), 220)
        XCTAssertEqual(state.resolve(reported: 2, current: 220, context: "b", hasPosition: true,
                                     at: now.addingTimeInterval(1.3)), 2)
        XCTAssertNil(state.pending)
    }

    func testPointerMappingUsesEntireTrackAndClampsOutsideRelease() {
        XCTAssertEqual(PlaybackSeekGeometry.fraction(x: 5, width: 110, knobSize: 10), 0)
        XCTAssertEqual(PlaybackSeekGeometry.fraction(x: 55, width: 110, knobSize: 10), 0.5)
        XCTAssertEqual(PlaybackSeekGeometry.fraction(x: 105, width: 110, knobSize: 10), 1)
        XCTAssertEqual(PlaybackSeekGeometry.fraction(x: -200, width: 110, knobSize: 10), 0)
        XCTAssertEqual(PlaybackSeekGeometry.fraction(x: 500, width: 110, knobSize: 10), 1)
        XCTAssertEqual(PlaybackSeekGeometry.fraction(x: 50, width: 0, knobSize: 10), 0)
        XCTAssertEqual(PlaybackSeekGeometry.clamped(.nan), 0)
    }
}
