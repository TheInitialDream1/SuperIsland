import SwiftUI

/// Full-width native stages adapted from the visual language of each Folia mode.
/// Timing belongs to the player clock; only actual QRC intervals light up words.
struct NativeLyricsVisualizer: View {
    let content: NowPlayingLyricsContent
    let style: NativeLyricStyle
    let position: TimeInterval
    let compact: Bool
    let accent: Color
    let audioEnergy: Double
    let reduceMotion: Bool
    let isScrubbing: Bool
    let onSeek: (TimeInterval) -> Void
    var decorationTime: TimeInterval? = nil

    private var active: Int { content.activeIndex(at: position) ?? -1 }
    private var focus: Int { max(0, active) }
    private var phase: Double { reduceMotion ? 0 : (decorationTime ?? position) }
    private var energy: Double { reduceMotion ? 0 : min(1, max(0, audioEnergy)) }
    private var currentText: String { content.lines.indices.contains(focus) ? content.lines[focus].text : "" }

    var body: some View {
        GeometryReader { geometry in
            composition(size: geometry.size)
                .frame(width: geometry.size.width, height: geometry.size.height)
                .clipped()
        }
    }

    private func composition(size: CGSize) -> AnyView {
        switch style {
        case .standard, .luminous: return AnyView(spotlight)
        case .mindscape: return AnyView(mindscape(size: size))
        case .staircase: return AnyView(staircase(size: size))
        case .floating: return AnyView(floating(size: size))
        case .chorus: return AnyView(chorus(size: size))
        case .tilt: return AnyView(tilted(size: size))
        case .orbit: return AnyView(orbit(size: size))
        case .diorama: return AnyView(diorama(size: size))
        case .clockwork: return AnyView(clockwork(size: size))
        case .sonnet: return AnyView(sonnet(size: size))
        case .tempera: return AnyView(tempera(size: size))
        case .lumiere: return AnyView(lumiere)
        case .monet: return AnyView(monet)
        case .still: return AnyView(still)
        }
    }

    private func text(index: Int, size: CGFloat, serif: Bool = false) -> Text {
        let line = content.lines[index]
        let isActive = index == active
        let rendered = isActive && style != .still && !line.words.isEmpty
            ? line.wordSyncedText(at: position + content.offsetSeconds, accent: accent, reduceMotion: reduceMotion)
            : Text(line.text).foregroundColor(isActive ? (style == .still ? .white : accent) : .white.opacity(0.62))
        return rendered.font(.system(size: size, weight: isActive ? .semibold : .regular,
                                     design: serif ? .serif : .default))
    }

    @ViewBuilder private func line(_ index: Int, size: CGFloat, alignment: Alignment = .center,
                                   lines: Int = 1, serif: Bool = false) -> some View {
        if content.lines.indices.contains(index) {
            Button { onSeek(max(0, content.lines[index].time - content.offsetSeconds)) } label: {
                ZStack {
                  Group {
                    if index == active, content.lines[index].words.count > 1,
                       content.lines[index].words.count <= 100, alignment == .center,
                       [.luminous, .tilt, .orbit, .diorama, .sonnet, .lumiere].contains(style) {
                        NativeKineticLyricText(line: content.lines[index], position: position + content.offsetSeconds,
                                              accent: accent, fontSize: size, serif: serif,
                                              maximumLines: lines, reduceMotion: reduceMotion || isScrubbing)
                    } else {
                        text(index: index, size: size, serif: serif)
                            .multilineTextAlignment(alignment == .leading ? .leading : .center)
                            .lineLimit(lines).minimumScaleFactor(0.55)
                    }
                  }
                  .id(index)
                  .transition(lyricTransition)
                }
                    .animation(lyricAnimation, value: index)
                    .clipped()
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: alignment)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain).help("点击跳转到这句歌词")
            .accessibilityLabel(content.lines[index].text)
            .accessibilityValue(index == active ? "当前歌词" : "")
        } else {
            Color.clear.accessibilityHidden(true)
        }
    }

    private var lyricAnimation: Animation? {
        reduceMotion || isScrubbing || style == .still ? nil : .timingCurve(0.2, 0.8, 0.2, 1, duration: 0.6)
    }

    private var lyricTransition: AnyTransition {
        .asymmetric(insertion: .modifier(active: NativeLyricTurn(phase: 1), identity: NativeLyricTurn(phase: 0)),
                    removal: .modifier(active: NativeLyricTurn(phase: -1), identity: NativeLyricTurn(phase: 0)))
    }

    private func rail(font: CGFloat, alignment: Alignment = .center) -> some View {
        NativeLyricRail(content: content, style: style, position: position, fontSize: font,
                        alignment: alignment, accent: accent, reduceMotion: reduceMotion,
                        isScrubbing: isScrubbing, onSeek: onSeek)
    }

    private var spotlight: some View {
        rail(font: compact ? 25 : 34)
            .padding(.horizontal, compact ? 8 : 24)
            .shadow(color: accent.opacity(0.18), radius: 2 + energy * 4)
    }

    /// Each glyph retains its source QRC interval, including unvoiced gaps.

    private func glyphProgress(_ offset: Int) -> Double {
        guard content.lines.indices.contains(focus), focus == active else { return 0 }
        let lyric = content.lines[focus]
        if lyric.words.isEmpty { return 0 }
        var cursor = 0
        for word in lyric.words {
            let end = cursor + word.text.count
            if offset < end {
                return word.progress(at: position + content.offsetSeconds)
            }
            cursor = end
        }
        return 0
    }

    private func glyphColor(_ offset: Int) -> Color {
        let progress = glyphProgress(offset)
        if content.lines.indices.contains(focus), content.lines[focus].words.isEmpty, focus == active { return accent }
        return progress > 0 ? accent.opacity(0.55 + 0.45 * progress) : .white.opacity(0.65)
    }

    private func mindscape(size: CGSize) -> some View {
        let glyphs = Array(currentText)
        let cloud = Array(content.lines.prefix(8).map(\.text).joined())
        let font = min(compact ? 26.0 : 34.0, max(12, size.width / CGFloat(max(1, glyphs.count)) * 0.85))
        return ZStack {
            ForEach(0..<min(10, cloud.count), id: \.self) { i in
                Text(String(cloud[i])).font(.system(size: CGFloat(22 + i % 3 * 9), weight: .light))
                    .foregroundStyle(.white.opacity(0.09))
                    .rotationEffect(.degrees(Double((i * 17) % 40 - 20)))
                    .position(x: size.width * CGFloat((i * 31 + 9) % 100) / 100,
                              y: size.height * CGFloat(i % 2 == 0 ? 0.13 : 0.88))
                    .allowsHitTesting(false).accessibilityHidden(true)
            }
            VStack(spacing: 10) {
                Spacer(minLength: 0)
                Button { seekCurrent() } label: {
                    HStack(spacing: compact ? 2 : 4) {
                        ForEach(glyphs.indices, id: \.self) { i in
                            mindscapeGlyph(glyphs[i], index: i, font: font)
                        }
                    }
                    .frame(maxWidth: .infinity, minHeight: 46).contentShape(Rectangle())
                }.buttonStyle(.plain).accessibilityLabel(currentText).help("点击跳转到这句歌词")
                    .id(focus).transition(lyricTransition)
                line(focus + 1, size: compact ? 10 : 12).frame(height: 20)
                Spacer(minLength: 0)
            }.animation(lyricAnimation, value: focus)
        }
    }

    private func mindscapeGlyph(_ glyph: Character, index: Int, font: CGFloat) -> some View {
        let pulse = reduceMotion || isScrubbing ? 0.0 : sin(glyphProgress(index) * .pi)
        let lift: CGFloat = reduceMotion ? 0 : CGFloat(sin(Double(index) * 1.6) * 9 - pulse * 7)
        let scale = CGFloat(1 + pulse * 0.18)
        let tint = glyphColor(index)
        return Text(String(glyph)).font(.system(size: font, weight: .medium))
            .foregroundStyle(tint).padding(2)
            .overlay(Circle().strokeBorder(tint.opacity(index % 4 == 0 ? 0.38 : 0), lineWidth: 1))
            .rotationEffect(.degrees(reduceMotion ? 0 : Double((index * 7) % 15 - 7)))
            .offset(y: lift).scaleEffect(scale)
            .shadow(color: accent.opacity(pulse * 0.6), radius: CGFloat(pulse * 8))
    }

    private func staircase(size: CGSize) -> some View {
        let glyphs = Array(currentText)
        let columns = min(4, max(1, glyphs.count))
        let perColumn = max(1, Int(ceil(Double(glyphs.count) / Double(columns))))
        let font = min(compact ? 21.0 : 26.0, max(11, (size.height - 25) / CGFloat(perColumn) - 2))
        return VStack(spacing: 2) {
            Button { seekCurrent() } label: {
                HStack(alignment: .center, spacing: compact ? 12 : 22) {
                    ForEach(0..<columns, id: \.self) { column in
                        VStack(spacing: 2) {
                            ForEach(0..<perColumn, id: \.self) { row in
                                let index = column * perColumn + row
                                if glyphs.indices.contains(index) {
                                    let pulse = reduceMotion || isScrubbing ? 0 : sin(glyphProgress(index) * .pi)
                                    Text(String(glyphs[index])).font(.system(size: font, weight: .medium))
                                        .foregroundStyle(glyphColor(index))
                                        .scaleEffect(1 + pulse * 0.15)
                                        .offset(x: pulse * 3)
                                }
                            }
                        }
                        .padding(.leading, 7)
                        .offset(y: CGFloat(column - columns / 2) * (compact ? 4 : 6))
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity).contentShape(Rectangle())
            }.buttonStyle(.plain).accessibilityLabel(currentText).help("点击跳转到这句歌词")
                .id(focus).transition(lyricTransition).animation(lyricAnimation, value: focus)
            line(focus + 1, size: compact ? 10 : 12).frame(height: 20)
        }
        .padding(.horizontal, 12)
        .background {
            Canvas { context, bounds in
                for i in 0..<4 {
                    let x = bounds.width * (0.35 + CGFloat(i) * 0.1)
                    var path = Path(); path.move(to: CGPoint(x: x, y: 4))
                    path.addLine(to: CGPoint(x: x, y: bounds.height - 25))
                    context.stroke(path, with: .color(.white.opacity(0.14)), lineWidth: 0.5)
                }
            }.allowsHitTesting(false).accessibilityHidden(true)
        }
    }

    private func floating(size: CGSize) -> some View {
        rail(font: compact ? 31 : 42, alignment: .leading)
            .padding(.horizontal, compact ? 6 : 16)
    }

    private func chorus(size: CGSize) -> some View {
        let start = min(max(0, focus - 2), max(0, content.lines.count - 4))
        return VStack(spacing: 4) {
            ForEach(start..<min(content.lines.count, start + (compact ? 3 : 4)), id: \.self) { index in
                let right = index % 2 == 1
                HStack(spacing: 7) {
                    if right { Spacer(minLength: size.width * 0.15) }
                    if !right { avatar(index) }
                    line(index, size: index == active ? (compact ? 15 : 17) : (compact ? 11 : 12), alignment: .leading)
                        .padding(.horizontal, 10).padding(.vertical, 3)
                        .background(index == active ? accent.opacity(0.19) : .white.opacity(0.07),
                                    in: RoundedRectangle(cornerRadius: 10))
                        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(.white.opacity(0.12)).allowsHitTesting(false))
                    if right { avatar(index) }
                    if !right { Spacer(minLength: size.width * 0.15) }
                }
                .transition(.asymmetric(insertion: .move(edge: .bottom).combined(with: .opacity),
                                        removal: .move(edge: .top).combined(with: .opacity)))
            }
        }
        .animation(lyricAnimation, value: focus)
        .padding(.horizontal, compact ? 3 : 18)
    }

    private func avatar(_ index: Int) -> some View {
        Text(String(content.lines[index].text.prefix(1)))
            .font(.system(size: 10, weight: .semibold)).foregroundStyle(.white.opacity(0.9))
            .frame(width: compact ? 18 : 22, height: compact ? 18 : 22).background(accent.opacity(0.22), in: Circle())
            .allowsHitTesting(false).accessibilityHidden(true)
    }

    private func tilted(size: CGSize) -> some View {
        rail(font: compact ? 29 : 38).padding(.horizontal, size.width * 0.07)
    }

    private func orbit(size: CGSize) -> some View {
        ZStack {
            Ellipse().strokeBorder(.white.opacity(0.18), lineWidth: 0.7)
                .frame(width: size.width * 0.83, height: size.height * 0.85)
                .rotationEffect(.degrees(-9)).allowsHitTesting(false)
            rail(font: compact ? 25 : 32).padding(.horizontal, size.width * 0.06)
            Circle().fill(accent).frame(width: 4, height: 4)
                .position(x: size.width * (0.5 + 0.41 * cos(phase * 0.12)),
                          y: size.height * (0.5 + 0.4 * sin(phase * 0.12)))
                .allowsHitTesting(false).accessibilityHidden(true)
        }
    }

    private func diorama(size: CGSize) -> some View {
        rail(font: compact ? 27 : 35).padding(.horizontal, 14)
    }

    private func clockwork(size: CGSize) -> some View {
        HStack(spacing: compact ? 12 : 24) {
            Canvas { context, bounds in
                let radius = min(bounds.width * 0.4, bounds.height * 0.46)
                let center = CGPoint(x: bounds.width * 0.44, y: bounds.height * 0.5)
                Self.gear(context: &context, center: center, radius: radius, teeth: 20, angle: phase * 0.16)
                Self.gear(context: &context, center: CGPoint(x: center.x + radius * 1.1, y: center.y - radius * 0.5),
                          radius: radius * 0.45, teeth: 12, angle: -phase * 0.28)
                context.draw(Text(clock(position)).font(.system(size: compact ? 10 : 13, design: .monospaced))
                    .foregroundColor(.white.opacity(0.8)), at: center)
            }
            .frame(width: min(size.width * 0.3, size.height * 1.25))
            .allowsHitTesting(false).accessibilityHidden(true)
            rail(font: compact ? 22 : 28, alignment: .leading)
        }
    }

    private func sonnet(size: CGSize) -> some View {
        VStack(spacing: 3) {
            HStack {
                Text("LYRIC / \(String(format: "%02d", focus + 1))")
                Spacer()
                Text(String(format: "%02d", content.lines.count))
            }
            .font(.system(size: 8, weight: .medium, design: .monospaced))
            .tracking(2).foregroundStyle(.white.opacity(0.6)).frame(height: compact ? 10 : 13)
            line(focus, size: compact ? 27 : 37, lines: 2, serif: true)
            HStack {
                Rectangle().fill(accent).frame(width: 24, height: 2)
                line(focus + 1, size: compact ? 9 : 12, alignment: .leading, serif: true)
            }.frame(height: compact ? 14 : 22)
        }
        .padding(.horizontal, compact ? 14 : 28).padding(.vertical, compact ? 3 : 7)
        .overlay {
            Canvas { context, bounds in
                var path = Path()
                for p in [CGPoint(x: 0, y: 0), CGPoint(x: bounds.width, y: 0), CGPoint(x: 0, y: bounds.height), CGPoint(x: bounds.width, y: bounds.height)] {
                    let dx: CGFloat = p.x == 0 ? 1 : -1, dy: CGFloat = p.y == 0 ? 1 : -1
                    path.move(to: CGPoint(x: p.x, y: p.y + dy * 12)); path.addLine(to: p)
                    path.addLine(to: CGPoint(x: p.x + dx * 12, y: p.y))
                }
                context.stroke(path, with: .color(.white.opacity(0.6)), lineWidth: 1)
            }.allowsHitTesting(false).accessibilityHidden(true)
        }
    }

    private func tempera(size: CGSize) -> some View {
        HStack(spacing: compact ? 12 : 22) {
            Text(String(format: "%02d", focus + 1))
                .font(.system(size: compact ? 48 : 70, weight: .black, design: .rounded))
                .foregroundStyle(.white.opacity(0.2)).frame(width: size.width * 0.2)
                .allowsHitTesting(false).accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 7) {
                line(focus, size: compact ? 25 : 34, alignment: .leading, lines: 2)
                Rectangle().fill(.white.opacity(0.6)).frame(height: 1)
                line(focus + 1, size: compact ? 10 : 12, alignment: .leading).frame(height: 22)
            }
        }.padding(.horizontal, compact ? 8 : 20).padding(.vertical, 6)
    }

    private var lumiere: some View {
        GeometryReader { geometry in
            ZStack {
                rail(font: compact ? 28 : 37)
                Rectangle().fill(LinearGradient(colors: [.clear, accent.opacity(0.55), .clear],
                                                 startPoint: .leading, endPoint: .trailing))
                    .frame(height: 1).position(x: geometry.size.width / 2, y: geometry.size.height * 0.72)
                    .allowsHitTesting(false)
            }
        }.padding(.horizontal, compact ? 12 : 30)
    }

    private var monet: some View {
        rail(font: compact ? 18 : 23, alignment: .leading)
    }

    private var still: some View {
        rail(font: compact ? 23 : 30).padding(.horizontal, compact ? 12 : 30)
    }

    private func seekCurrent() {
        guard content.lines.indices.contains(focus) else { return }
        onSeek(max(0, content.lines[focus].time - content.offsetSeconds))
    }

    static func gear(context: inout GraphicsContext, center: CGPoint, radius: CGFloat,
                     teeth: Int, angle: Double) {
        var path = Path()
        for i in 0..<(teeth * 4) {
            let theta = Double(i) * .pi * 2 / Double(teeth * 4) + angle
            let r = radius * (i % 4 < 2 ? 1 : 0.87)
            let point = CGPoint(x: center.x + CGFloat(cos(theta)) * r, y: center.y + CGFloat(sin(theta)) * r)
            if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
        }
        path.closeSubpath()
        context.stroke(path, with: .color(.white.opacity(0.42)), lineWidth: 1)
        for scale in [0.4, 0.7] {
            context.stroke(Path(ellipseIn: CGRect(x: center.x - radius * scale, y: center.y - radius * scale,
                                                  width: radius * scale * 2, height: radius * scale * 2)),
                           with: .color(.white.opacity(0.25)), lineWidth: 0.7)
        }
        for i in 0..<8 {
            let theta = Double(i) * .pi / 4 + angle
            var spoke = Path()
            spoke.move(to: CGPoint(x: center.x + CGFloat(cos(theta)) * radius * 0.43,
                                  y: center.y + CGFloat(sin(theta)) * radius * 0.43))
            spoke.addLine(to: CGPoint(x: center.x + CGFloat(cos(theta)) * radius * 0.67,
                                     y: center.y + CGFloat(sin(theta)) * radius * 0.67))
            context.stroke(spoke, with: .color(.white.opacity(0.25)), lineWidth: 1)
        }
    }

    private func clock(_ time: Double) -> String {
        let value = Int(max(0, time))
        return String(format: "%02d:%02d", value / 60, value % 60)
    }
}
