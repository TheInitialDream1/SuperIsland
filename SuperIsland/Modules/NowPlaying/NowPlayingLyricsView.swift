import SwiftUI

/// The cover, controls and lyrics all read the same native playback clock.
/// JavaScript only supplies the lyric document, never a second player position.
struct NowPlayingLyricsView: View {
    let content: NowPlayingLyricsContent
    var onRetry: () -> Void = {}
    var onAction: (String) -> Void = { _ in }

    @ObservedObject private var player: NowPlayingManager
    @ObservedObject private var spectrum: AudioSpectrumMonitor
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.lyricsUsesIslandBackground) private var usesIslandBackground
    @Environment(\.lyricsSurfaceSideInsets) private var surfaceSideInsets
    @State private var presentationID = UUID()
    @State private var showsCalibration = false
    @AppStorage("lyrics.nativeVisualStyle") private var nativeStyleRawValue = NativeLyricStyle.luminous.rawValue

    private var nativeStyle: NativeLyricStyle { .resolve(nativeStyleRawValue) }

    init(content: NowPlayingLyricsContent, player: NowPlayingManager? = nil,
         spectrum: AudioSpectrumMonitor? = nil,
         onAction: @escaping (String) -> Void = { _ in },
         onRetry: @escaping () -> Void = {}) {
        self.content = content
        self.onRetry = onRetry
        self.onAction = onAction
        _player = ObservedObject(wrappedValue: player ?? .shared)
        _spectrum = ObservedObject(wrappedValue: spectrum ?? .shared)
    }

    var body: some View {
        GeometryReader { geometry in
            let compact = geometry.size.width < 500 || geometry.size.height < 200
            let horizontalInset: CGFloat = compact ? 22 : 32
            let leadingInset = horizontalInset + surfaceSideInsets.leading
            let trailingInset = horizontalInset + surfaceSideInsets.trailing
            let verticalInset: CGFloat = compact ? 12 : 16
            let available = CGSize(width: max(0, geometry.size.width - leadingInset - trailingInset),
                                   height: max(0, geometry.size.height - verticalInset * 2))
            let columnWidth = min(compact ? 112 : 256, available.width * (compact ? 0.3 : 0.42))
            let spectrumHeight: CGFloat = compact ? 26 : 36
            let coverSize = max(48, min(compact ? 92 : 140,
                                       available.height - spectrumHeight - 44, columnWidth - 12))
            TimelineView(.animation(minimumInterval: reduceMotion ? 1 : (nativeStyle == .still ? 0.5 : 1 / 30),
                                    paused: !player.isPlaying)) { timeline in
                let position = player.presentationElapsedTime(at: timeline.date)
                Group {
                    if nativeStyle == .standard {
                        HStack(alignment: .center, spacing: compact ? 22 : 30) {
                            if content.showArtwork {
                                VStack(spacing: 6) {
                                    artwork(size: coverSize)
                                        .frame(maxWidth: .infinity)
                                    audioSpectrum(at: timeline.date)
                                        .frame(height: spectrumHeight)
                                        .padding(.top, 5)
                                    progress(position: position)
                                }
                                .frame(width: columnWidth)
                                .frame(maxHeight: .infinity, alignment: .center)
                            }
                            VStack(alignment: .leading, spacing: compact ? 10 : 12) {
                                title(compact: compact)
                                lyrics(position: position, compact: compact)
                                    .frame(maxHeight: .infinity)
                                if !content.showArtwork { progress(position: position) }
                                transport(position: position, compact: compact)
                            }
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                        }
                    } else {
                        NativeLyricsScene(content: content, style: nativeStyle, player: player,
                                          spectrum: spectrum, position: position, date: timeline.date,
                                          compact: compact, reduceMotion: reduceMotion,
                                          settings: AnyView(calibrationButton), onRetry: onRetry,
                                          keepControlsVisible: showsCalibration)
                    }
                }
                // Bound the timeline's proposal explicitly. An expanding
                // extension wrapper must not push cover/controls past the panel.
                .frame(width: available.width, height: available.height)
                .padding(.leading, leadingInset)
                .padding(.trailing, trailingInset)
                .padding(.vertical, verticalInset)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
            .background {
                if !usesIslandBackground {
                    NativeLyricsBackdropHost(style: nativeStyle)
                }
            }
        }
        .onAppear {
            player.beginProgressPresentation(id: presentationID)
            spectrum.present(id: presentationID, bundleIdentifier: player.audioSourceBundleIdentifier, playing: player.isPlaying)
        }
        .onDisappear {
            AppState.shared.endPopoverInteraction(id: presentationID)
            player.endProgressPresentation(id: presentationID)
            spectrum.dismiss(id: presentationID)
        }
        .onChange(of: player.isPlaying) { _, _ in updateSpectrum() }
        .onChange(of: player.audioSourceBundleIdentifier) { _, _ in updateSpectrum() }
        .onReceive(NotificationCenter.default.publisher(for: NSApplication.didBecomeActiveNotification)) { _ in updateSpectrum() }
    }

    private func artwork(size: CGFloat) -> some View {
        Group {
            if let image = player.albumArt {
                Image(nsImage: image).resizable().scaledToFill()
            } else {
                Rectangle().fill(.white.opacity(0.08))
                    .overlay {
                        Image(systemName: "music.note")
                            .font(.system(size: size * 0.25, weight: .light))
                            .foregroundStyle(.white.opacity(0.5))
                    }
            }
        }
        .frame(width: size, height: size)
        .clipShape(RoundedRectangle(cornerRadius: size * 0.065, style: .continuous))
        .shadow(color: .black.opacity(0.18), radius: 12, y: 6)
        .accessibilityLabel("专辑封面")
    }

    private func title(compact: Bool) -> some View {
        let name = player.title.isEmpty ? "同步歌词" : player.title
        return (Text(name).fontWeight(.medium)
                + Text(player.artist.isEmpty ? "" : " — ").fontWeight(.regular)
                + Text(player.artist).fontWeight(.regular))
            .font(.system(size: compact ? 17 : 21))
            .foregroundStyle(.white)
            .lineLimit(1)
            .minimumScaleFactor(0.7)
            .frame(maxWidth: .infinity, alignment: .leading)
            .help(player.artist.isEmpty ? name : "\(name) — \(player.artist)")
    }

    private var calibrationButton: some View {
        Button { setCalibrationPresented(!showsCalibration) } label: {
            Image(systemName: "slider.horizontal.3")
                .font(.system(size: 13)).foregroundStyle(.white.opacity(0.75))
                .frame(width: 32, height: 32).contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .help("选择歌词样式与校准")
        .accessibilityLabel("歌词样式与校准")
        .popover(isPresented: Binding(get: { showsCalibration }, set: setCalibrationPresented), arrowEdge: .bottom) {
            calibration
        }
        .onDisappear {
            if showsCalibration { setCalibrationPresented(false) }
        }
    }

    private func setCalibrationPresented(_ presented: Bool) {
        if presented {
            AppState.shared.beginPopoverInteraction(
                id: presentationID, for: .extension_("com.wangxulong.superisland.synced-lyrics"))
        } else {
            AppState.shared.endPopoverInteraction(id: presentationID)
        }
        showsCalibration = presented
    }

    private var calibration: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("歌词样式与同步").font(.headline)
            Picker("歌词样式", selection: $nativeStyleRawValue) {
                ForEach(NativeLyricStyle.allCases) { style in
                    Text(style.title).tag(style.rawValue)
                }
            }
            .pickerStyle(.menu)
            .accessibilityIdentifier("lyrics-style-picker")
            Text(nativeStyle.description)
                .font(.caption).foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            if !spectrum.isEnabled || spectrum.status == "permission" {
                Button("启用实时音频效果") { spectrum.enable() }
            } else if spectrum.status == "silent" || spectrum.status == "unavailable" {
                Button("重试实时音频") { spectrum.retry() }
            }
            Divider()
            Text(content.lyricSource == "qqmusic" ? "歌词来源：QQ 音乐" : "歌词来源：酷狗音乐（备用）")
                .font(.caption).foregroundStyle(.secondary)
            Text(content.hasWordTimings ? "当前为逐字歌词" : "当前为逐行歌词")
                .font(.caption).foregroundStyle(.secondary)
            Text(String(format: "当前偏移：%+.1f 秒", content.offsetSeconds))
                .font(.system(.body, design: .monospaced))
            HStack {
                Button("提前 0.5 秒") { onAction("offset-earlier") }
                Button("延后 0.5 秒") { onAction("offset-later") }
            }
            Text("歌词比歌声慢就提前，比歌声快就延后。调整会记住这首歌。")
                .font(.caption).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
            HStack {
                Button("重置本曲偏移") { onAction("offset-reset") }
                Spacer()
                Button("重新匹配", action: onRetry)
            }
            .font(.caption)
        }
        .padding(16)
        .frame(width: 260)
    }

    @ViewBuilder
    private func lyrics(position: TimeInterval, compact: Bool) -> some View {
        if !content.matches(title: player.title, artist: player.artist, bundleIdentifier: player.audioSourceBundleIdentifier) {
            HStack(spacing: 8) {
                ProgressView().controlSize(.small).tint(.white)
                Text("正在匹配当前歌曲…").font(.system(size: 13)).foregroundStyle(.white.opacity(0.7))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        } else if content.status == "synced", !content.lines.isEmpty {
              let active = content.activeIndex(at: position)
              ScrollViewReader { proxy in
                GeometryReader { viewport in
                    let count: CGFloat = compact ? 3 : 4
                    let rowHeight = max(18, floor(viewport.size.height / count))
                    let readingAnchor = UnitPoint(x: 0, y: 1 / (count - 1))
                    ScrollView(.vertical, showsIndicators: false) {
                        // Fixed row pitch keeps 3–4 full lines readable as the
                        // active font changes. The active line is the second row.
                        LazyVStack(alignment: .leading, spacing: 0) {
                            ForEach(content.lines.indices, id: \.self) { index in
                                lyricRow(index: index, active: active == index,
                                         position: position, compact: compact)
                                    .frame(height: rowHeight, alignment: .leading)
                                    .id(index)
                            }
                        }
                        .padding(.top, rowHeight)
                        .padding(.bottom, rowHeight * (count - 2))
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .clipped()
                    .onAppear { proxy.scrollTo(active ?? 0, anchor: readingAnchor) }
                    .onChange(of: active) { _, next in
                        withAnimation(reduceMotion || player.seekPreviewTime != nil ? nil : .easeInOut(duration: 0.35)) {
                            proxy.scrollTo(next ?? 0, anchor: readingAnchor)
                        }
                    }
                    .onChange(of: content.lines) { _, _ in
                        proxy.scrollTo(content.activeIndex(at: position) ?? 0, anchor: readingAnchor)
                    }
                }
              }
        } else {
            VStack(alignment: .leading, spacing: 9) {
                if content.status == "loading" {
                    ProgressView().controlSize(.small).tint(.white)
                }
                Text(emptyTitle)
                    .font(.system(size: compact ? 15 : 20, weight: .medium))
                    .foregroundStyle(.white.opacity(0.85))
                Text(content.message.isEmpty ? emptyMessage : content.message)
                    .font(.system(size: compact ? 10 : 12))
                    .foregroundStyle(.white.opacity(0.55))
                    .lineLimit(compact ? 2 : 4)
                if content.status == "missing" || content.status == "plain" {
                    Button("重新匹配", action: onRetry)
                        .buttonStyle(.plain)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(.white)
                        .padding(.vertical, 5).padding(.horizontal, 9)
                        .background(.white.opacity(0.12), in: Capsule())
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
    }

    private func lyricRow(index: Int, active: Bool, position: TimeInterval, compact: Bool) -> some View {
        let line = content.lines[index]
        let label = (active && !line.words.isEmpty
            ? line.wordSyncedText(at: position + content.offsetSeconds,
                                  accent: player.artworkPalette.accent.color, reduceMotion: reduceMotion)
            : Text(line.text).foregroundColor(active ? player.artworkPalette.accent.color : .white.opacity(0.7)))
            .font(.system(size: compact ? (active ? 18 : 14) : (active ? 23 : 17),
                          weight: active ? .semibold : .regular))
            .lineLimit(1)
            .minimumScaleFactor(0.65)
        return Button {
            player.seek(to: max(0, line.time - content.offsetSeconds))
        } label: {
            label
                .frame(maxWidth: .infinity, alignment: .leading)
                .frame(maxHeight: .infinity, alignment: .leading)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .help("点击跳转到这句歌词")
        .accessibilityLabel(line.text)
        .accessibilityValue(active ? "当前歌词" : "")
    }

    private func progress(position: TimeInterval) -> some View {
        Group {
            ProgressBar(progress: player.duration > 0 ? position / player.duration : 0,
                        trackHeight: 2.5, knobSize: 9,
                        duration: player.duration, context: player.seekContextIdentifier,
                        onPreview: player.previewSeek) { value in
                player.seek(to: player.duration * value)
            }
            .disabled(player.duration <= 0)
            .accessibilityLabel("播放进度")
            .accessibilityValue(timeText(position: position))
        }
    }

    @ViewBuilder
    private func audioSpectrum(at date: Date) -> some View {
        if spectrum.status == "permission" || !spectrum.isEnabled {
            Button("启用音频频谱") { spectrum.enable() }
                .font(.system(size: 10))
                .foregroundStyle(.white.opacity(0.58))
                .buttonStyle(.plain)
                .help("允许系统音频录制后，分析当前播放器的音频输出")
                .frame(maxHeight: .infinity, alignment: .bottom)
        } else if spectrum.status == "unavailable" || spectrum.status == "silent" {
            Button(spectrum.status == "silent" ? "暂无播放器音频 · 重试" : "重试音频频谱") { spectrum.retry() }
                .font(.system(size: 10)).foregroundStyle(.white.opacity(0.58))
                .buttonStyle(.plain).help(spectrum.detail)
                .frame(maxHeight: .infinity, alignment: .bottom)
        } else {
            let live = player.isPlaying && date.timeIntervalSince(spectrum.lastSampleAt) < 0.4
            Canvas { context, size in
                let count = 56
                let step = size.width / CGFloat(count)
                for index in 0..<count {
                    // Mirror real low-frequency energy at the center and
                    // interpolate neighboring measured bands for fine columns.
                    let distance = abs(Double(index) - Double(count - 1) / 2) / (Double(count - 1) / 2)
                    let band = distance * Double(spectrum.bands.count - 1)
                    let lower = Int(band)
                    let upper = min(spectrum.bands.count - 1, lower + 1)
                    let mix = Float(band - Double(lower))
                    let energy = live ? spectrum.bands[lower] * (1 - mix) + spectrum.bands[upper] * mix : 0
                    let height = max(1, CGFloat(energy) * size.height)
                    let rect = CGRect(x: CGFloat(index) * step, y: size.height - height,
                                      width: max(1, step * 0.48), height: height)
                    context.fill(Path(roundedRect: rect, cornerRadius: 0.8),
                                 with: .color(.white.opacity(live ? 0.82 : 0.25)))
                }
            }
            .frame(maxHeight: .infinity)
            .accessibilityLabel("播放器实时音频频谱")
            .accessibilityValue("\(spectrum.status) · 能量 \(Int((spectrum.bands.max() ?? 0) * 100))%")
        }
    }

    private func updateSpectrum() {
        spectrum.update(bundleIdentifier: player.audioSourceBundleIdentifier, playing: player.isPlaying)
    }

    private func transport(position: TimeInterval, compact: Bool) -> some View {
        HStack(spacing: compact ? 12 : 18) {
            Text(timeText(position: position))
                .font(.system(size: compact ? 11 : 13, weight: .regular, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(.white.opacity(0.8))
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            // Keep this below the hover toolbar: title-row buttons overlap it.
            if content.canCalibrate { calibrationButton }
            Spacer(minLength: 0)
            control("backward.end.fill", label: "上一首", compact: compact, action: player.previousTrack)
            control(player.isPlaying ? "pause.fill" : "play.fill",
                    label: player.isPlaying ? "暂停" : "播放", primary: true,
                    compact: compact, action: player.togglePlayPause)
            control("forward.end.fill", label: "下一首", compact: compact, action: player.nextTrack)
        }
        .disabled(player.title.isEmpty)
    }

    private func control(_ icon: String, label: String, primary: Bool = false,
                         compact: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: primary ? 23 : 15, weight: .semibold))
                .foregroundStyle(.white.opacity(primary ? 1 : 0.9))
                .frame(width: 30, height: 30)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .help(label)
        .accessibilityLabel(label)
    }

    private func timeText(position: TimeInterval) -> String {
        "\(clockText(position)) / \(player.duration > 0 ? clockText(player.duration) : "--:--")"
    }

    private func clockText(_ value: TimeInterval) -> String {
        let seconds = Int(max(0, value))
        return String(format: "%02d:%02d", seconds / 60, seconds % 60)
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

    private var emptyMessage: String {
        switch content.status {
        case "instrumental": return "这是一首纯音乐"
        case "loading": return "歌词会自动跟随播放进度"
        case "missing": return "可以稍后重新匹配"
        default: return "播放一首歌，歌词将在这里出现"
        }
    }
}
