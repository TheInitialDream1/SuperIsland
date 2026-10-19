import XCTest
@testable import SuperIsland

final class NowPlayingLyricsContentTests: XCTestCase {
    func testRealWordIntervalsAndPausesArePreserved() {
        let word = SyncedLyricWord(time: 10, endTime: 12, text: "hello")
        XCTAssertEqual(word.progress(at: 9.9), 0)
        XCTAssertEqual(word.progress(at: 11), 0.5)
        XCTAssertEqual(word.progress(at: 20), 1)
        XCTAssertEqual(SyncedLyricWord(time: 10, endTime: 10, text: "!").progress(at: 10), 1)
        // The silence before the second word stays silent, without distributing
        // the sentence duration evenly over its characters.
        let second = SyncedLyricWord(time: 14, endTime: 15, text: " world")
        XCTAssertEqual(second.progress(at: 13), 0)
        let line = SyncedLyricLine(time: 10, text: "hello world", words: [word, second])
        let content = NowPlayingLyricsContent(lines: [line], offsetSeconds: 0.5)
        XCTAssertTrue(content.hasWordTimings)
        XCTAssertEqual(word.progress(at: 10.5 + content.offsetSeconds), 0.5)
        XCTAssertFalse(NowPlayingLyricsContent(lines: [SyncedLyricLine(time: 10, text: "plain")]).hasWordTimings)
    }
    func testDefaultDoesNotAdvanceLyricsBeforeTheirTimestamp() {
        let content = NowPlayingLyricsContent(lines: [SyncedLyricLine(time: 10, text: "first")])
        XCTAssertNil(content.activeIndex(at: 9.9))
        XCTAssertEqual(content.activeIndex(at: 10), 0)
    }
    func testRejectsLyricsFromAnotherTrackOrSource() {
        let content = NowPlayingLyricsContent(trackTitle: "伤心太平洋", trackArtist: "任贤齐", sourceBundleIdentifier: "test.player")
        XCTAssertEqual(content.matches(title: "伤心太平洋", artist: "任贤齐", bundleIdentifier: "test.player"), true)
        XCTAssertEqual(content.matches(title: "启程", artist: "水木年华", bundleIdentifier: "test.player"), false)
        XCTAssertEqual(content.matches(title: "伤心太平洋", artist: "任贤齐", bundleIdentifier: "another.player"), false)
        XCTAssertEqual(NowPlayingLyricsContent().matches(title: "伤心太平洋", artist: "任贤齐", bundleIdentifier: "test.player"), false)
    }
    func testPreludeBoundariesAndLastLine() {
        let content = NowPlayingLyricsContent(lines: [
            SyncedLyricLine(time: 10, text: "first"),
            SyncedLyricLine(time: 20, text: "second"),
            SyncedLyricLine(time: 30, text: "third")
        ], offsetSeconds: 0)
        XCTAssertNil(content.activeIndex(at: 0))
        XCTAssertEqual(content.activeIndex(at: 10), 0)
        XCTAssertEqual(content.activeIndex(at: 20), 1)
        XCTAssertEqual(content.activeIndex(at: 100), 2)
    }

    func testOffsetAndSeekBackwards() {
        let content = NowPlayingLyricsContent(lines: [
            SyncedLyricLine(time: 10, text: "first"),
            SyncedLyricLine(time: 20, text: "second")
        ], offsetSeconds: 0.4)
        XCTAssertEqual(content.activeIndex(at: 19.7), 1)
        XCTAssertEqual(content.activeIndex(at: 9.7), 0)
        XCTAssertNil(content.activeIndex(at: 8))
    }
}
