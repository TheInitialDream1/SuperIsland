import SwiftUI

enum IslandSurfaceAppearance {
    static let defaultsKey = "appearance.backgroundOpacity"
    static let range: ClosedRange<Double> = 0.78...1

    static func resolved(_ value: Double, forceOpaque: Bool = false) -> Double {
        guard !forceOpaque, value.isFinite else { return 1 }
        return min(range.upperBound, max(range.lowerBound, value))
    }
}

struct IslandBackgroundOpacityControl: View {
    @EnvironmentObject private var appState: AppState
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency

    var body: some View {
        HStack(spacing: 12) {
            Text(reduceTransparency ? "Reduce Transparency keeps backgrounds solid." : "Affects backgrounds only. Monet stays opaque.")
                .font(.system(size: 11))
                .foregroundStyle(.secondary)
            Spacer(minLength: 4)
            Slider(value: $appState.backgroundOpacity, in: IslandSurfaceAppearance.range, step: 0.01) {
                Text("Background Opacity")
            }
            .labelsHidden()
            .frame(width: 116)
            .disabled(reduceTransparency)
            Text(IslandSurfaceAppearance.resolved(appState.backgroundOpacity, forceOpaque: reduceTransparency),
                 format: .percent.precision(.fractionLength(0)))
                .monospacedDigit()
                .font(.system(size: 12))
                .frame(minWidth: 36)
        }
    }
}
