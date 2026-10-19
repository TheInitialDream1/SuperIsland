import Foundation

enum PlaybackSeekGeometry {
    static func clamped(_ progress: Double) -> Double {
        progress.isFinite ? min(1, max(0, progress)) : 0
    }

    static func fraction(x: CGFloat, width: CGFloat, knobSize: CGFloat) -> Double {
        guard x.isFinite, width.isFinite, width > 0 else { return 0 }
        let inset = min(max(0, knobSize / 2), width / 2)
        let travel = width - inset * 2
        guard travel > 0 else { return 0 }
        return clamped(Double((x - inset) / travel))
    }
}

/// A seek is asynchronous. Keep the new position while the player is still
/// reporting its old anchor, then hand the clock back when it acknowledges it.
/// A bounded wait also lets a rejected seek recover to the real player position.
struct PlaybackSeekState {
    struct Request {
        let id = UUID()
        let context: String
        let requestedAt: Date
        let previousPosition: TimeInterval
    }

    private(set) var pending: Request?
    var confirmationTimeout: TimeInterval = 5

    @discardableResult
    mutating func begin(context: String, previousPosition: TimeInterval, at date: Date) -> UUID {
        let request = Request(context: context, requestedAt: date, previousPosition: previousPosition)
        pending = request
        return request.id
    }

    mutating func cancel() { pending = nil }

    mutating func resolve(reported: TimeInterval, current: TimeInterval,
                          context: String, hasPosition: Bool, at date: Date) -> TimeInterval {
        guard let pending else { return reported.isFinite ? reported : current }
        guard pending.context == context else {
            cancel()
            return reported.isFinite ? reported : current
        }
        guard hasPosition, reported.isFinite else { return current }
        if abs(reported - current) <= 1.25 || date.timeIntervalSince(pending.requestedAt) >= confirmationTimeout {
            cancel()
            return reported
        }
        return current
    }
}
