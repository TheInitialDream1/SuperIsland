import XCTest
@testable import SuperIsland

@MainActor
final class NowPlayingProgressPresentationTests: XCTestCase {
    func testExtensionPlayerAdvancesProgressWhenBuiltInPlayerIsHidden() {
        let player = NowPlayingManager.shared
        let appState = AppState.shared
        let presentationID = UUID()

        let previousState = appState.currentState
        let previousModule = appState.activeModule
        let previousTab = appState.fullExpandedSelectedTab
        let previousNowPlayingEnabled = appState.nowPlayingEnabled
        let previousIsPlaying = player.isPlaying
        let previousDuration = player.duration
        let previousElapsedTime = player.elapsedTime
        let previousPlaybackRate = player.playbackRate

        defer {
            appState.currentState = previousState
            appState.activeModule = previousModule
            appState.fullExpandedSelectedTab = previousTab
            appState.nowPlayingEnabled = previousNowPlayingEnabled
            player.isPlaying = previousIsPlaying
            player.duration = previousDuration
            player.elapsedTime = previousElapsedTime
            player.playbackRate = previousPlaybackRate
            player.endProgressPresentation(id: presentationID)
        }

        let lyricsModule = ActiveModule.extension_("test.synced-lyrics")
        appState.currentState = .fullExpanded
        appState.activeModule = lyricsModule
        appState.fullExpandedSelectedTab = .module(lyricsModule)
        appState.nowPlayingEnabled = false

        player.isPlaying = true
        player.duration = 180
        player.elapsedTime = 30
        player.playbackRate = 1
        player.beginProgressPresentation(id: presentationID)

        let elapsedTimeBeforeRefresh = player.elapsedTime
        ModuleRefreshScheduler.shared.runNow(id: "nowPlaying.progress")

        XCTAssertGreaterThan(player.elapsedTime, elapsedTimeBeforeRefresh)
    }
}
