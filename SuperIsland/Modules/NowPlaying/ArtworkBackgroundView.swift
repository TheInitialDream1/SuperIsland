import SwiftUI

private struct LyricsUsesIslandBackgroundKey: EnvironmentKey {
    static let defaultValue = false
}

private struct LyricsSurfaceSideInsetsKey: EnvironmentKey {
    static let defaultValue = EdgeInsets()
}

extension EnvironmentValues {
    var lyricsUsesIslandBackground: Bool {
        get { self[LyricsUsesIslandBackgroundKey.self] }
        set { self[LyricsUsesIslandBackgroundKey.self] = newValue }
    }

    var lyricsSurfaceSideInsets: EdgeInsets {
        get { self[LyricsSurfaceSideInsetsKey.self] }
        set { self[LyricsSurfaceSideInsetsKey.self] = newValue }
    }
}

struct ArtworkBackgroundView: View {
    let palette: ArtworkPalette
    var body: some View {
        GeometryReader { geometry in
            LinearGradient(colors: [palette.primary.color, palette.secondary.color],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
                .overlay {
                    RadialGradient(colors: [palette.secondary.color.opacity(0.5), .clear],
                                   center: .bottomLeading, startRadius: 0, endRadius: geometry.size.width * 0.8)
                }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}
