import XCTest
@testable import SuperIsland

final class PlaybackPositionClockTests: XCTestCase {
    private let start = Date(timeIntervalSince1970: 1000)

    func testOpeningMidTrackPreservesRealPosition() {
        XCTAssertEqual(PlaybackPositionClock.projectedPosition(
            63, capturedAt: start, now: start.addingTimeInterval(2),
            playing: true, rate: 1, duration: 227
        ), 65, accuracy: 0.001)
    }

    func testHiddenOrDelayedTimerDoesNotLoseElapsedTime() {
        var clock = PlaybackPositionClock()
        clock.seek(to: 0, at: start)
        clock.setPlaying(true, at: start)
        XCTAssertEqual(clock.position(at: start.addingTimeInterval(60)), 60, accuracy: 0.001)
    }

    func testPauseResumeAndPlaybackRate() {
        var clock = PlaybackPositionClock()
        clock.seek(to: 30, at: start)
        clock.setRate(0.5, at: start)
        clock.setPlaying(true, at: start)
        clock.setPlaying(false, at: start.addingTimeInterval(10))
        XCTAssertEqual(clock.position(at: start.addingTimeInterval(60)), 35, accuracy: 0.001)
        clock.setPlaying(true, at: start.addingTimeInterval(60))
        clock.setRate(2, at: start.addingTimeInterval(60))
        XCTAssertEqual(clock.position(at: start.addingTimeInterval(65)), 45, accuracy: 0.001)
    }

    func testSeekBackToZeroAndTrackDurationClamp() {
        var clock = PlaybackPositionClock()
        clock.seek(to: 100, at: start)
        clock.setPlaying(true, at: start)
        clock.seek(to: 0, at: start.addingTimeInterval(60))
        XCTAssertEqual(clock.position(at: start.addingTimeInterval(61)), 1, accuracy: 0.001)
        XCTAssertEqual(clock.position(at: start.addingTimeInterval(600), duration: 227), 227)
    }
}
