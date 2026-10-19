import SwiftUI

/// A complete player composition, rather than an effect clipped inside the old
/// right-hand lyric column. The compact controls retain the native seek input.
struct NativeLyricsScene: View {
    let content: NowPlayingLyricsContent
    let style: NativeLyricStyle
    @ObservedObject var player: NowPlayingManager
    @ObservedObject var spectrum: AudioSpectrumMonitor
    let position: TimeInterval
    let date: Date
    let compact: Bool
    let reduceMotion: Bool
    let settings: AnyView
    let onRetry: () -> Void
    var keepControlsVisible = false
    @State private var isSceneHovered = false
    @State private var keyboardControlsVisible = false
    @State private var decorationClock = PlaybackPositionClock()
    @FocusState private var controlsKeyboardFocused: Bool

    private var liveAudio: Bool {
        player.isPlaying && date.timeIntervalSince(spectrum.lastSampleAt) < 0.4
    }
    private var energy: Double { liveAudio ? Double(spectrum.bands.max() ?? 0) : 0 }
    private var name: String { player.title.isEmpty ? "同步歌词" : player.title }
    private var showsControls: Bool {
        isSceneHovered || !player.isPlaying || player.seekPreviewTime != nil
            || keepControlsVisible || keyboardControlsVisible
    }
    private var matches: Bool {
        content.matches(title: player.title, artist: player.artist,
                        bundleIdentifier: player.audioSourceBundleIdentifier)
    }

    var body: some View {
        VStack(spacing: compact ? 6 : 8) {
            if style == .monet {
                poster
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                masthead
                stage
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            controlCapsule
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityIdentifier("lyrics-scene-\(style.rawValue)")
        .onAppear { decorationClock.setPlaying(player.isPlaying, at: date) }
        .onChange(of: player.isPlaying) { _, playing in decorationClock.setPlaying(playing, at: date) }
        .overlay {
            NativeHoverRegion { hovered in
                isSceneHovered = hovered
                if !hovered { keyboardControlsVisible = false }
            }
        }
    }

    private var masthead: some View {
        HStack(spacing: 9) {
            if content.showArtwork { cover(size: compact ? 25 : 30, radius: 5) }
            VStack(alignment: .leading, spacing: 2) {
                Text(name + (player.artist.isEmpty ? "" : " — \(player.artist)"))
                    .font(.system(size: compact ? 11 : 12, weight: .medium))
                    .foregroundStyle(.white.opacity(0.95))
                    .lineLimit(1).minimumScaleFactor(0.75)
                if !player.album.isEmpty {
                    Text(player.album).font(.system(size: compact ? 9 : 10))
                        .foregroundStyle(.white.opacity(0.62)).lineLimit(1)
                }
            }
            Spacer(minLength: 8)
        }
        .frame(height: compact ? 27 : 32)
    }

    private var poster: some View {
        GeometryReader { geometry in
            HStack(spacing: compact ? 14 : 22) {
                VStack(alignment: .leading, spacing: 5) {
                    Text(player.artist).italic()
                        .font(.system(size: compact ? 11 : 13, design: .serif))
                        .foregroundStyle(.white.opacity(0.8)).lineLimit(1)
                    Text(name).font(.system(size: compact ? 22 : 29, weight: .semibold, design: .serif))
                        .foregroundStyle(.white).lineLimit(1).minimumScaleFactor(0.6)
                    Text(player.album).font(.system(size: compact ? 8 : 9)).tracking(1.5)
                        .foregroundStyle(.white.opacity(0.6)).lineLimit(1)
                    Rectangle().fill(.white.opacity(0.4)).frame(width: 24, height: 1).padding(.vertical, 2)
                    stage.frame(maxHeight: .infinity)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                if content.showArtwork {
                    let side = min(geometry.size.height - 4, geometry.size.width * 0.36)
                    cover(size: max(40, side), radius: compact ? 10 : 15)
                        .rotationEffect(.degrees(reduceMotion ? 0 : -3))
                        .overlay(alignment: .topTrailing) {
                            RoundedRectangle(cornerRadius: 2).fill(player.artworkPalette.accent.color)
                                .frame(width: 5, height: 20).offset(x: -16, y: -5)
                                .allowsHitTesting(false)
                        }
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
    }

    @ViewBuilder private var stage: some View {
        if matches, content.status == "synced", !content.lines.isEmpty {
            NativeLyricsVisualizer(content: content, style: style, position: position,
                                   compact: compact, accent: player.artworkPalette.accent.color,
                                   audioEnergy: energy, reduceMotion: reduceMotion,
                                   isScrubbing: player.seekPreviewTime != nil,
                                   onSeek: { player.seek(to: $0) },
                                   decorationTime: decorationClock.position(at: date))
        } else {
            VStack(spacing: 8) {
                if !matches || content.status == "loading" {
                    ProgressView().controlSize(.small).tint(.white)
                }
                Text(!matches ? "正在匹配当前歌曲…" : emptyTitle)
                    .font(.system(size: compact ? 17 : 23, weight: .medium))
                    .foregroundStyle(.white.opacity(0.9))
                if matches, !content.message.isEmpty {
                    Text(content.message).font(.caption).foregroundStyle(.white.opacity(0.65)).lineLimit(2)
                }
                if matches && (content.status == "missing" || content.status == "plain") {
                    Button("重新匹配", action: onRetry).buttonStyle(.plain).font(.caption)
                        .foregroundStyle(.white).padding(8)
                        .background(.white.opacity(0.1), in: Capsule())
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    /// Folia's player chrome uses a centered capsule: primary play at the left,
    /// song/progress in the middle and navigation at the right. Fading the chrome
    /// never changes the track geometry or its generous hit target.
    private var controlCapsule: some View {
        HStack(spacing: compact ? 6 : 10) {
            Button(action: player.togglePlayPause) {
                Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                    .font(.system(size: compact ? 14 : 16, weight: .semibold))
                    .foregroundStyle(.black.opacity(0.85))
                    .frame(width: compact ? 32 : 36, height: compact ? 32 : 36)
                    .background(.white.opacity(0.95), in: Circle())
                    .contentShape(Circle())
            }
            .buttonStyle(.plain).help(player.isPlaying ? "暂停" : "播放")
            .accessibilityLabel(player.isPlaying ? "暂停" : "播放")
            .opacity(showsControls ? 1 : 0).allowsHitTesting(showsControls)
            .accessibilityHidden(!showsControls)
            VStack(spacing: 0) {
                HStack(spacing: 8) {
                    Text(clock(position)).monospacedDigit()
                    Spacer(minLength: 4)
                    Text(name).fontWeight(.medium).lineLimit(1).minimumScaleFactor(0.7)
                    Spacer(minLength: 4)
                    Text(player.duration > 0 ? clock(player.duration) : "--:--").monospacedDigit()
                }
                .font(.system(size: compact ? 8 : 9)).foregroundStyle(.white.opacity(0.8))
                .opacity(showsControls ? 1 : 0).accessibilityHidden(!showsControls)
                ProgressBar(progress: player.duration > 0 ? position / player.duration : 0,
                            trackHeight: 2, knobSize: 9, duration: player.duration,
                            context: player.seekContextIdentifier, onPreview: player.previewSeek) {
                    player.seek(to: player.duration * $0)
                }
                .disabled(player.duration <= 0)
                .opacity(showsControls ? 1 : 0.45)
            }
            .frame(maxWidth: .infinity)
            HStack(spacing: 2) {
                navigation("backward.end.fill", label: "上一首", action: player.previousTrack)
                navigation("forward.end.fill", label: "下一首", action: player.nextTrack)
                settings
            }
            .opacity(showsControls ? 1 : 0).allowsHitTesting(showsControls)
            .accessibilityHidden(!showsControls)
        }
        .padding(.horizontal, compact ? 9 : 12).padding(.vertical, compact ? 5 : 6)
        .frame(maxWidth: compact ? 420 : 480)
        .background(.black.opacity(showsControls ? (style == .still ? 0.14 : 0.25) : 0), in: Capsule())
        .overlay(Capsule().strokeBorder(.white.opacity(showsControls ? 0.16 : 0), lineWidth: 0.6).allowsHitTesting(false))
        .frame(maxWidth: .infinity)
        .disabled(player.title.isEmpty)
        // Geometry stays fixed while fading. Revealing chrome cannot move the
        // progress track underneath the first click or interrupt a live drag.
        .animation(reduceMotion || player.seekPreviewTime != nil ? nil : .easeOut(duration: 0.18), value: showsControls)
        .focusable().focused($controlsKeyboardFocused).focusEffectDisabled(true)
        .onChange(of: controlsKeyboardFocused) { _, focused in
            if focused { keyboardControlsVisible = true }
        }
        .accessibilityAction(named: "显示播放控制") { keyboardControlsVisible = true }
    }

    private func navigation(_ icon: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon).font(.system(size: compact ? 11 : 12, weight: .medium))
                .foregroundStyle(.white.opacity(0.9)).frame(width: 28, height: 32)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain).help(label).accessibilityLabel(label)
    }

    private func cover(size: CGFloat, radius: CGFloat) -> some View {
        Group {
            if let image = player.albumArt { Image(nsImage: image).resizable().scaledToFill() }
            else { Rectangle().fill(.white.opacity(0.12)).overlay(Image(systemName: "music.note").foregroundStyle(.white)) }
        }
        .frame(width: size, height: size).clipShape(RoundedRectangle(cornerRadius: radius))
        .shadow(color: .black.opacity(0.2), radius: 8, y: 4).accessibilityLabel("专辑封面")
    }

    private var emptyTitle: String {
        switch content.status {
        case "loading": return "正在寻找歌词…"
        case "instrumental": return "让旋律说话"
        case "plain": return "暂无同步歌词"
        case "missing": return "没有找到这首歌的歌词"
        default: return "听见音乐，也看见歌词"
        }
    }

    private func clock(_ time: Double) -> String {
        let seconds = Int(max(0, time.isFinite ? time : 0))
        return String(format: "%02d:%02d", seconds / 60, seconds % 60)
    }
}
