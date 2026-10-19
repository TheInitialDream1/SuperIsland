import SwiftUI

/// The backdrop is drawn by the island itself, including its top shoulders.
/// Decorative layers never intercept controls or enlarge the input region.
struct NativeLyricsBackdropHost: View {
    let style: NativeLyricStyle
    @ObservedObject private var player = NowPlayingManager.shared
    @ObservedObject private var spectrum = AudioSpectrumMonitor.shared
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var decorationClock = PlaybackPositionClock()

    var body: some View {
        TimelineView(.animation(minimumInterval: 0.1,
                                paused: !player.isPlaying || reduceMotion || style == .still || style == .standard)) { timeline in
            NativeLyricsBackdrop(style: style, palette: player.artworkPalette,
                                 position: reduceMotion ? 0 : decorationClock.position(at: timeline.date),
                                 energy: !reduceMotion && player.isPlaying && timeline.date.timeIntervalSince(spectrum.lastSampleAt) < 0.4
                                     ? Double(spectrum.bands.max() ?? 0) : 0)
        }
        .onAppear { decorationClock.setPlaying(player.isPlaying, at: Date()) }
        .onChange(of: player.isPlaying) { _, playing in decorationClock.setPlaying(playing, at: Date()) }
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.8), value: player.artworkPalette)
        .allowsHitTesting(false).accessibilityHidden(true)
    }
}

struct NativeLyricsBackdrop: View {
    let style: NativeLyricStyle
    let palette: ArtworkPalette
    var position: Double = 0
    var energy: Double = 0

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                base
                decoration(size: geometry.size)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
            .clipped()
        }
        .allowsHitTesting(false).accessibilityHidden(true)
    }

    @ViewBuilder private var base: some View {
        switch style {
        case .standard, .still:
            ArtworkBackgroundView(palette: palette)
        case .diorama:
            LinearGradient(colors: [palette.primary.color, palette.secondary.color],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            Color.black.opacity(0.12)
        case .lumiere:
            Color(white: 0.045)
            LinearGradient(colors: [palette.primary.color.opacity(0.26), .clear, palette.secondary.color.opacity(0.18)],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
        case .clockwork:
            Color(white: 0.08)
            LinearGradient(colors: [palette.primary.color.opacity(0.5), palette.secondary.color.opacity(0.22)],
                           startPoint: .leading, endPoint: .trailing)
        case .sonnet:
            palette.primary.color
            Color.black.opacity(0.42)
        case .tempera:
            VStack(spacing: 0) {
                palette.primary.color
                palette.secondary.color
            }
            Color.black.opacity(0.2)
        case .monet:
            LinearGradient(colors: [palette.primary.color, palette.secondary.color],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            Color.black.opacity(0.24)
        case .chorus:
            palette.primary.color
            Color.black.opacity(0.46)
        default:
            LinearGradient(colors: [palette.primary.color, palette.secondary.color],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            Color.black.opacity(style == .floating ? 0.24 : 0.17)
        }
    }

    @ViewBuilder private func decoration(size: CGSize) -> some View {
        switch style {
        case .standard, .still: EmptyView()
        case .sonnet:
            Rectangle().strokeBorder(.white.opacity(0.22), lineWidth: 0.6).padding(13)
            Rectangle().strokeBorder(.white.opacity(0.08), lineWidth: 0.5).padding(19)
            grain(size: size, opacity: 0.11)
        case .tempera:
            VStack(spacing: 0) {
                Color.clear
                Rectangle().fill(.white.opacity(0.3)).frame(height: 1)
                Color.clear
            }
            HStack(spacing: 0) {
                Color.white.opacity(0.04).frame(width: size.width * 0.22)
                Color.clear
            }
            grain(size: size, opacity: 0.07)
        case .diorama:
            tunnel(size: size)
        case .lumiere:
            beams(size: size)
        case .clockwork:
            Canvas { context, bounds in
                for i in 0..<80 {
                    let x = CGFloat((i * 67) % 101) / 100 * bounds.width
                    let y = CGFloat((i * 29) % 97) / 96 * bounds.height
                    context.fill(Path(ellipseIn: CGRect(x: x, y: y, width: 1, height: 1)), with: .color(.white.opacity(0.1)))
                }
                NativeLyricsVisualizer.gear(context: &context,
                    center: CGPoint(x: bounds.width * 0.94, y: bounds.height * 0.15),
                    radius: bounds.height * 0.19, teeth: 16, angle: -position * 0.018)
            }.opacity(0.25)
        case .monet:
            grain(size: size, opacity: 0.09)
            Canvas { context, bounds in
                var line = Path()
                line.move(to: CGPoint(x: bounds.width * 0.61, y: 0))
                line.addLine(to: CGPoint(x: bounds.width * 0.66, y: bounds.height))
                context.stroke(line, with: .color(.white.opacity(0.1)), lineWidth: 0.6)
                context.stroke(Path(ellipseIn: CGRect(x: bounds.width * 0.68, y: -bounds.height * 0.4,
                                                       width: bounds.height * 1.2, height: bounds.height * 1.2)),
                               with: .color(.white.opacity(0.12)), lineWidth: 0.8)
            }
        case .chorus:
            RadialGradient(colors: [palette.secondary.color.opacity(0.34), .clear],
                           center: .topTrailing, startRadius: 0, endRadius: size.width * 0.8)
        case .floating:
            grain(size: size, opacity: 0.1)
            fluid(size: size).opacity(0.45)
        default:
            fluid(size: size)
        }
    }

    private func fluid(size: CGSize) -> some View {
        Canvas { context, bounds in
            for i in 0..<4 {
                let phase = position * 0.055 + Double(i) * 1.7
                let center = CGPoint(x: bounds.width * (0.5 + 0.4 * cos(phase)),
                                     y: bounds.height * (0.5 + 0.55 * sin(phase * 0.7)))
                let radius = bounds.width * (0.38 + energy * 0.03)
                let color = i % 2 == 0 ? palette.accent.color : palette.secondary.color
                context.fill(Path(ellipseIn: CGRect(x: center.x - radius, y: center.y - radius,
                                                       width: radius * 2, height: radius * 2)),
                             with: .radialGradient(Gradient(colors: [color.opacity(0.24), .clear]),
                                                   center: center, startRadius: 0, endRadius: radius))
            }
        }
    }

    private func grain(size: CGSize, opacity: Double) -> some View {
        Canvas { context, bounds in
            for i in 0..<450 {
                let x = CGFloat((i * 73) % 997) / 997 * bounds.width
                let y = CGFloat((i * 113) % 991) / 991 * bounds.height
                context.fill(Path(CGRect(x: x, y: y, width: 0.6, height: 0.6)), with: .color(.white.opacity(opacity)))
            }
        }
    }

    private func tunnel(size: CGSize) -> some View {
        Canvas { context, bounds in
            let center = CGPoint(x: bounds.width * 0.5, y: bounds.height * 0.48)
            for i in 0..<6 {
                let t = CGFloat((Double(i) / 6 + position * 0.035).truncatingRemainder(dividingBy: 1))
                let rect = CGRect(x: center.x * t * 0.8, y: center.y * t * 0.75,
                                  width: bounds.width * (1 - t * 0.8), height: bounds.height * (1 - t * 0.75))
                context.stroke(Path(rect), with: .color(palette.accent.color.opacity(0.08 + Double(i) * 0.012)), lineWidth: 0.6)
            }
            for point in [CGPoint.zero, CGPoint(x: bounds.width, y: 0), CGPoint(x: 0, y: bounds.height), CGPoint(x: bounds.width, y: bounds.height)] {
                var path = Path(); path.move(to: point); path.addLine(to: center)
                context.stroke(path, with: .color(.white.opacity(0.08)), lineWidth: 0.5)
            }
            for i in 0..<12 {
                let x = (CGFloat((i * 37 + 7) % 100) / 100 + CGFloat(sin(position * 0.08 + Double(i))) * 0.025) * bounds.width
                let y = (CGFloat((i * 23 + 17) % 100) / 100 + CGFloat(cos(position * 0.06 + Double(i))) * 0.03) * bounds.height
                let side = CGFloat(2 + i % 4) * (1 + energy * 0.8)
                context.stroke(Path(CGRect(x: x, y: y, width: side, height: side)),
                               with: .color(palette.accent.color.opacity(0.24)), lineWidth: 0.7)
            }
        }
    }

    private func beams(size: CGSize) -> some View {
        Canvas { context, bounds in
            for i in 0..<3 {
                let x = bounds.width * (0.2 + Double(i) * 0.3 + sin(position * 0.11 + Double(i)) * 0.1)
                var beam = Path()
                beam.move(to: CGPoint(x: x, y: -10))
                beam.addLine(to: CGPoint(x: x - bounds.width * 0.19, y: bounds.height * 0.88))
                beam.addLine(to: CGPoint(x: x + bounds.width * 0.19, y: bounds.height * 0.88))
                beam.closeSubpath()
                context.fill(beam, with: .linearGradient(Gradient(colors: [palette.accent.color.opacity(0.17 + energy * 0.18), .clear]),
                                                          startPoint: CGPoint(x: x, y: 0), endPoint: CGPoint(x: x, y: bounds.height)))
            }
        }
    }
}
