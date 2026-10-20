import JavaScriptCore
import XCTest
@testable import SuperIsland

final class ExtensionViewNodeTests: XCTestCase {
    func testWordTimingsSurviveBridgeAndInvalidWordsFallBackToText() throws {
        let context = try XCTUnwrap(JSContext())
        let value = context.evaluateScript("""
        ({type:'now-playing-lyrics',lines:[
          {time:10,text:'你好',words:[{time:10,endTime:11,text:'你'},{time:12,endTime:13,text:'好'}]},
          {time:20,text:'bad',words:[{time:20,endTime:19,text:'bad'}]},
          {time:30,text:'unmatched',words:[{time:30,endTime:31,text:'other'}]}
        ]})
        """)
        guard case .nowPlayingLyrics(let content) = ViewNode.from(value) else {
            XCTFail("Expected native lyrics content"); return
        }
        XCTAssertEqual(content.lines[0].words, [SyncedLyricWord(time: 10, endTime: 11, text: "你"),
                                              SyncedLyricWord(time: 12, endTime: 13, text: "好")])
        XCTAssertTrue(content.lines[1].words.isEmpty)
        XCTAssertTrue(content.lines[2].words.isEmpty)
    }
    func testParsesSyncedLyricsAndRejectsInvalidTimestamps() throws {
        let context = try XCTUnwrap(JSContext())
        let value = context.evaluateScript("""
        ({ type: 'now-playing-lyrics', status: 'synced', offsetSeconds: 0.5,
           showArtwork: false, trackTitle: '伤心太平洋', trackArtist: '任贤齐',
           sourceBundleIdentifier: 'test.player', lines: [
             { time: 20, text: 'second' }, { time: -1, text: 'invalid' },
             { time: 10, text: 'first' }, { time: NaN, text: 'invalid' }
           ] })
        """)
        XCTAssertEqual(ViewNode.from(value), .nowPlayingLyrics(content: NowPlayingLyricsContent(
            lines: [SyncedLyricLine(time: 10, text: "first"), SyncedLyricLine(time: 20, text: "second")],
            status: "synced", message: "", offsetSeconds: 0.5, showArtwork: false,
            trackTitle: "伤心太平洋", trackArtist: "任贤齐", sourceBundleIdentifier: "test.player"
        )))
    }

    func testParsesNativeNowPlayingPlayer() throws {
        let context = try XCTUnwrap(JSContext())
        let value = context.evaluateScript("({ type: 'now-playing-player', artworkSize: 54 })")

        XCTAssertEqual(
            ViewNode.from(value),
            .nowPlayingPlayer(artworkSize: 54, showArtwork: true)
        )
    }

    func testClampsNowPlayingArtworkSize() throws {
        let context = try XCTUnwrap(JSContext())

        XCTAssertEqual(
            ViewNode.from(context.evaluateScript("({ type: 'now-playing-player', artworkSize: 999 })")),
            .nowPlayingPlayer(artworkSize: 78, showArtwork: true)
        )
        XCTAssertEqual(
            ViewNode.from(context.evaluateScript("({ type: 'now-playing-player', artworkSize: 1 })")),
            .nowPlayingPlayer(artworkSize: 36, showArtwork: true)
        )
    }

    func testParsesHiddenArtworkOption() throws {
        let context = try XCTUnwrap(JSContext())

        XCTAssertEqual(
            ViewNode.from(context.evaluateScript("({ type: 'now-playing-player', showArtwork: false })")),
            .nowPlayingPlayer(artworkSize: 54, showArtwork: false)
        )
    }

    func testParsesCinematicNowPlayingNodes() throws {
        let context = try XCTUnwrap(JSContext())

        XCTAssertEqual(
            ViewNode.from(context.evaluateScript("({ type: 'now-playing-artwork', size: 999, cornerRadius: 11 })")),
            .nowPlayingArtwork(size: 180, cornerRadius: 11)
        )
        XCTAssertEqual(
            ViewNode.from(context.evaluateScript("({ type: 'now-playing-transport', showProgress: false })")),
            .nowPlayingTransport(showProgress: false)
        )
        XCTAssertEqual(
            ViewNode.from(context.evaluateScript("({ type: 'now-playing-backdrop', child: { type: 'text', value: 'Lyrics' } })")),
            .nowPlayingBackdrop(child: .text("Lyrics", style: .body, color: .named("white"), lineLimit: nil))
        )
    }

    func testCompactArtworkKeepsSmallDimensions() throws {
        let context = try XCTUnwrap(JSContext())
        XCTAssertEqual(
            ViewNode.from(context.evaluateScript("({ type: 'now-playing-artwork', size: 18, cornerRadius: 4 })")),
            .nowPlayingArtwork(size: 18, cornerRadius: 4)
        )
        XCTAssertEqual(
            ViewNode.from(context.evaluateScript("({ type: 'now-playing-artwork', size: -5, cornerRadius: 4 })")),
            .nowPlayingArtwork(size: 16, cornerRadius: 4)
        )
    }

    func testParsesCinematicLyricTextStyles() throws {
        let context = try XCTUnwrap(JSContext())

        XCTAssertEqual(
            ViewNode.from(context.evaluateScript("({ type: 'text', value: 'Lyrics', style: 'lyricActive' })")),
            .text("Lyrics", style: .lyricActive, color: .named("white"), lineLimit: nil)
        )
    }
}
