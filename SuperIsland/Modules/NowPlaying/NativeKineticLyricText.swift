import SwiftUI
import AppKit

/// Source word intervals drive the motion. A line-only document keeps the
/// ordinary Text renderer; it never receives fabricated per-character timing.
struct NativeKineticLyricText: View {
    let line: SyncedLyricLine
    let position: Double
    let accent: Color
    let fontSize: CGFloat
    let serif: Bool
    let maximumLines: Int
    let reduceMotion: Bool

    var body: some View {
        GeometryReader { geometry in
            let measured = (line.text as NSString).size(withAttributes: [.font: NSFont.systemFont(ofSize: fontSize, weight: .semibold)]).width
            let rows = geometry.size.height >= fontSize * 2.2 ? maximumLines : 1
            let widthFit = min(fontSize, max(11, fontSize * geometry.size.width * CGFloat(rows) / max(1, measured + CGFloat(line.words.count) * 2)))
            // Short stages still need room for ascenders and the word's lift.
            let fitting = min(widthFit, max(8, geometry.size.height * 0.72))
            KineticWordFlow(spacing: 1, rowSpacing: 3) {
                ForEach(line.words.indices, id: \.self) { index in
                    let word = line.words[index]
                    let progress = word.progress(at: position)
                    let pulse = reduceMotion || progress <= 0 || progress >= 1 ? 0 : sin(progress * .pi)
                    SyncedLyricLine(time: word.time, text: word.text, words: [word])
                        .wordSyncedText(at: position, accent: accent, reduceMotion: reduceMotion)
                        .font(.system(size: fitting, weight: .semibold, design: serif ? .serif : .default))
                        .fixedSize()
                        .scaleEffect(1 + pulse * 0.12, anchor: .bottom)
                        .offset(y: -pulse * 5)
                        .shadow(color: accent.opacity(pulse * 0.6), radius: pulse * 7)
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
        .allowsHitTesting(false).accessibilityHidden(true)
    }
}

private struct KineticWordFlow: Layout {
    var spacing: CGFloat
    var rowSpacing: CGFloat

    private struct Row {
        var items: [(Int, CGSize)] = []
        var width: CGFloat = 0
        var height: CGFloat = 0
    }

    private func rows(_ subviews: Subviews, width: CGFloat) -> [Row] {
        var result: [Row] = [], row = Row()
        for index in subviews.indices {
            let size = subviews[index].sizeThatFits(.unspecified)
            let gap = row.items.isEmpty ? 0 : spacing
            if !row.items.isEmpty, row.width + gap + size.width > width {
                result.append(row); row = Row()
            }
            row.width += (row.items.isEmpty ? 0 : spacing) + size.width
            row.height = max(row.height, size.height)
            row.items.append((index, size))
        }
        if !row.items.isEmpty { result.append(row) }
        return result
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = max(1, proposal.width ?? 600)
        let lines = rows(subviews, width: width)
        let height = lines.reduce(CGFloat(0)) { $0 + $1.height } + CGFloat(max(0, lines.count - 1)) * rowSpacing
        return CGSize(width: width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let lines = rows(subviews, width: max(1, bounds.width))
        let height = lines.reduce(CGFloat(0)) { $0 + $1.height } + CGFloat(max(0, lines.count - 1)) * rowSpacing
        var y = bounds.midY - height / 2
        for row in lines {
            var x = bounds.midX - row.width / 2
            for (index, size) in row.items {
                subviews[index].place(at: CGPoint(x: x, y: y + row.height - size.height), anchor: .topLeading,
                                     proposal: ProposedViewSize(size))
                x += size.width + spacing
            }
            y += row.height + rowSpacing
        }
    }
}
