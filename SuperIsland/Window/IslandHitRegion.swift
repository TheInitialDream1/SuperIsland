import SwiftUI

/// Interactive geometry in top-left window coordinates. Shadows and the
/// animation viewport deliberately do not take part in mouse hit testing.
struct IslandHitRegion {
    var surfaceFrame: CGRect
    var shape: PillShape
    var cycleButtonFrames: [CGRect] = []

    func contains(_ point: CGPoint) -> Bool {
        if shape.path(in: surfaceFrame).contains(point) { return true }
        return cycleButtonFrames.contains { frame in
            let radius = min(frame.width, frame.height) / 2
            return hypot(point.x - frame.midX, point.y - frame.midY) <= radius
        }
    }
}
