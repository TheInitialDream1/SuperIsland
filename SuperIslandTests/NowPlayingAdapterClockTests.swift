import XCTest
@testable import SuperIsland

@MainActor
final class NowPlayingAdapterClockTests: XCTestCase {
    func testDragPreviewDoesNotChangeClockOrSeekAudio() {
        let player = NowPlayingManager(isolatedForTesting: true)
        player.title = "test"
        player.duration = 300
        player.elapsedTime = 30
        player.previewSeek(0.5)
        XCTAssertEqual(player.presentationElapsedTime(), 150)
        XCTAssertEqual(player.currentElapsedTime(), 30, accuracy: 0.01)
        player.previewSeek(nil)
        XCTAssertEqual(player.presentationElapsedTime(), 30, accuracy: 0.01)
        XCTAssertTrue(player.isInteractingWithPlaybackProgress)
    }

    func testStalePlayerSnapshotsDoNotPullNewSeekBack() async throws {
        let player = NowPlayingManager(isolatedForTesting: true)
        let stamp = Date().timeIntervalSince1970 * 1_000_000
        let old = "{\"title\":\"test\",\"durationMicros\":300000000,\"elapsedTimeMicros\":30000000,\"timestampEpochMicros\":\(stamp),\"playbackRate\":0,\"playing\":false}"
        try await player.applyMediaSnapshotForTesting(old)
        player.seek(to: 150)
        try await player.applyMediaSnapshotForTesting(old)
        XCTAssertEqual(player.currentElapsedTime(), 150, accuracy: 0.01)
        let ack = "{\"title\":\"test\",\"durationMicros\":300000000,\"elapsedTimeMicros\":150000000,\"timestampEpochMicros\":\(stamp+1000),\"playbackRate\":0,\"playing\":false}"
        try await player.applyMediaSnapshotForTesting(ack)
        XCTAssertEqual(player.currentElapsedTime(), 150, accuracy: 0.01)
        try await player.applyMediaSnapshotForTesting(old)
        XCTAssertEqual(player.currentElapsedTime(), 30, accuracy: 0.01)
    }

    func testChangingTracksCancelsSeekAndPreview() async throws {
        let player = NowPlayingManager(isolatedForTesting: true)
        player.title = "old"
        player.duration = 300
        player.seek(to: 150)
        player.previewSeek(0.8)
        try await player.applyMediaSnapshotForTesting("{\"title\":\"new\",\"duration\":200,\"elapsedTime\":10,\"playbackRate\":0,\"playing\":false}")
        XCTAssertNil(player.seekPreviewTime)
        XCTAssertEqual(player.currentElapsedTime(), 10, accuracy: 0.01)
    }
    func testRepeatedPausedSnapshotsWithPositiveRateDoNotAdvance() async throws {
        let player = NowPlayingManager(isolatedForTesting: true)
        let timestamp = Date().addingTimeInterval(-63).timeIntervalSince1970 * 1_000_000
        let anchor = "\"title\":\"test\",\"durationMicros\":300000000,\"elapsedTimeMicros\":0,\"timestampEpochMicros\":\(timestamp),\"playbackRate\":1"
        try await player.applyMediaSnapshotForTesting("{\(anchor),\"playing\":true}")
        player.isPlaying = false
        let stopped = player.currentElapsedTime()
        try await player.applyMediaSnapshotForTesting("{\(anchor),\"playing\":false}")
        try await player.applyMediaSnapshotForTesting("{\(anchor),\"playing\":false}")
        XCTAssertEqual(player.currentElapsedTime(at: Date().addingTimeInterval(60)), stopped, accuracy: 0.001)

        // A real paused seek replaces the anchor and must still be honored.
        let seekTimestamp = Date().timeIntervalSince1970 * 1_000_000
        try await player.applyMediaSnapshotForTesting("""
        {"title":"test","durationMicros":300000000,"elapsedTimeMicros":10500000,
          "timestampEpochMicros":\(seekTimestamp),"playbackRate":1,"playing":false}
        """)
        XCTAssertEqual(player.currentElapsedTime(at: Date().addingTimeInterval(60)), 10.5, accuracy: 0.1)
    }
    func testSnapshotRepairsOptimisticPauseAfterRejectedControl() async throws {
        let player = NowPlayingManager(isolatedForTesting: true)
        player.title = "test"
        player.duration = 300
        player.elapsedTime = 60
        player.isPlaying = false
        let timestamp = Date().addingTimeInterval(-0.25).timeIntervalSince1970 * 1_000_000
        try await player.applyMediaSnapshotForTesting("""
        {"title":"test","artist":"artist","durationMicros":300000000,
          "elapsedTimeMicros":120000000,"timestampEpochMicros":\(timestamp),
          "playbackRate":1,"playing":true}
        """)
        XCTAssertTrue(player.isPlaying)
        XCTAssertEqual(player.duration, 300)
        XCTAssertGreaterThanOrEqual(player.currentElapsedTime(), 120.2)
        XCTAssertLessThan(player.currentElapsedTime(), 120.5)
    }

    func testMicrosecondSnapshotKeepsPausedPosition() async throws {
        let player = NowPlayingManager(isolatedForTesting: true)
        let timestamp = Date().addingTimeInterval(-30).timeIntervalSince1970 * 1_000_000
        try await player.applyMediaSnapshotForTesting("""
        {"title":"test","durationMicros":300000000,"elapsedTimeMicros":10500000,
          "timestampEpochMicros":\(timestamp),"playbackRate":0,"playing":false}
        """)
        XCTAssertEqual(player.currentElapsedTime(at: Date().addingTimeInterval(60)), 10.5, accuracy: 0.001)
    }

    func testAlreadyPlayingTrackDoesNotResetToZero() async throws {
        let player = NowPlayingManager(isolatedForTesting: true)
        let timestamp = ISO8601DateFormatter().string(from: Date().addingTimeInterval(-63))
        try await player.applyMediaUpdateForTesting("""
        {"payload":{"title":"test","artist":"artist","duration":227,
          "elapsedTime":0,"timestamp":"\(timestamp)","playbackRate":1,"playing":true}}
        """)
        XCTAssertGreaterThanOrEqual(player.currentElapsedTime(), 63)
        XCTAssertLessThan(player.currentElapsedTime(), 65)
    }

    func testMetadataOnlyPauseDoesNotDoubleCountElapsedTime() async throws {
        let player = NowPlayingManager(isolatedForTesting: true)
        player.title = "test"
        player.artist = "artist"
        player.duration = 227
        player.elapsedTime = 63
        player.playbackRate = 1
        player.isPlaying = true
        try await player.applyMediaUpdateForTesting("""
        {"diff":true,"payload":{"playing":false}}
        """)
        let pausedPosition = player.currentElapsedTime()
        XCTAssertEqual(player.currentElapsedTime(at: Date().addingTimeInterval(60)), pausedPosition, accuracy: 0.001)
        XCTAssertLessThan(pausedPosition, 64)
    }
}
