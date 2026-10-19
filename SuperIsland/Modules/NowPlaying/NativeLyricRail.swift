import SwiftUI

/// Rows retain their source index while moving through the viewport. A new
/// active line changes row transforms, not the identity of the surrounding scene.
struct NativeLyricRail: View {
    let content: NowPlayingLyricsContent
    let style: NativeLyricStyle
    let position: Double
    let fontSize: CGFloat
    let alignment: Alignment
    let accent: Color
    let reduceMotion: Bool
    let isScrubbing: Bool
    let onSeek: (TimeInterval) -> Void

    private var active: Int { content.activeIndex(at: position) ?? -1 }
    private var focus: Int { max(0, active) }
    private var animation: Animation? {
        reduceMotion || isScrubbing || style == .still ? nil
            : .timingCurve(0.2, 0.8, 0.2, 1, duration: 0.6)
    }

    var body: some View {
        GeometryReader { geometry in
            let first = max(0, focus - 3)
            let end = min(content.lines.count, focus + 4)
            ZStack {
                ForEach(first..<max(first, end), id: \.self) { index in
                    row(index, size: geometry.size)
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
            .clipped()
            .animation(animation, value: focus)
        }
    }

    private func row(_ index: Int, size: CGSize) -> some View {
        let distance = Double(index - focus)
        let fittedFont = min(fontSize, max(12, size.height * 0.32))
        let current = index == active
        let isStill = style == .still
        let scale: CGFloat = distance == 0 ? 1 : (style == .diorama ? 0.6 : 0.5)
        let y: CGFloat = style == .orbit
            ? size.height * CGFloat(0.5 + sin(distance * 0.65) * 0.56)
            : size.height * CGFloat(0.5 + distance * 0.38)
        let x: CGFloat = style == .diorama
            ? size.width * CGFloat(0.5 + distance * -0.07) : size.width / 2
        let tilt = style == .tilt && !reduceMotion ? max(-3, min(3, distance * 3)) : 0
        let depth = style == .diorama && !reduceMotion ? max(-24, min(24, distance * -20)) : 0
        let lyric = content.lines[index]
        return Button { onSeek(max(0, lyric.time - content.offsetSeconds)) } label: {
            Group {
                if current, !isStill, lyric.words.count > 1, lyric.words.count <= 100, alignment == .center {
                    NativeKineticLyricText(line: lyric, position: position + content.offsetSeconds,
                                          accent: accent, fontSize: fittedFont, serif: style == .monet,
                                          maximumLines: 2, reduceMotion: reduceMotion || isScrubbing)
                } else {
                    (current && !isStill && !lyric.words.isEmpty
                     ? lyric.wordSyncedText(at: position + content.offsetSeconds, accent: accent, reduceMotion: reduceMotion)
                     : Text(lyric.text).foregroundColor(current && !isStill ? accent : .white))
                        .font(.system(size: fittedFont, weight: .semibold, design: style == .monet ? .serif : .default))
                        .lineLimit(1).minimumScaleFactor(0.5)
                }
            }
            .frame(width: size.width, height: size.height * 0.48, alignment: alignment)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .help("点击跳转到这句歌词").accessibilityLabel(lyric.text)
        .accessibilityValue(current ? "当前歌词" : "")
        .scaleEffect(scale, anchor: alignment == .leading ? .leading : .center)
        .rotationEffect(.degrees(tilt))
        .rotation3DEffect(.degrees(depth), axis: (x: 1, y: 0.15, z: 0), perspective: 0.25)
        .opacity(abs(distance) > 1.1 ? 0 : (distance == 0 ? 1 : 0.62))
        .position(x: x, y: y)
        .allowsHitTesting(abs(distance) <= 1)
        .accessibilityHidden(abs(distance) > 1)
        .transition(.opacity)
    }
}

struct NativeLyricTurn: AnimatableModifier {
    var phase: CGFloat
    var animatableData: CGFloat {
        get { phase }
        set { phase = newValue }
    }
    func body(content: Content) -> some View {
        content.opacity(1 - Double(abs(phase)))
            .offset(y: phase * 18)
            .rotation3DEffect(.degrees(Double(phase) * -18), axis: (x: 1, y: 0, z: 0), perspective: 0.25)
    }
}
