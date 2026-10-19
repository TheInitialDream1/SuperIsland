import Foundation

/// A media position is an anchor, not a counter. Timer frequency and view
/// visibility must never affect how much audio has actually played.
struct PlaybackPositionClock {
    private var anchorPosition: TimeInterval = 0
    private var anchorDate = Date()
    private var playing = false
    private var rate: Double = 1

    func position(at date: Date, duration: TimeInterval = 0) -> TimeInterval {
        let delta = playing ? max(0, date.timeIntervalSince(anchorDate)) * rate : 0
        let value = max(0, anchorPosition + delta)
        return duration.isFinite && duration > 0 ? min(value, duration) : value
    }

    mutating func seek(to position: TimeInterval, at date: Date) {
        anchorPosition = position.isFinite ? max(0, position) : 0
        anchorDate = date
    }

    mutating func setPlaying(_ value: Bool, at date: Date) {
        seek(to: position(at: date), at: date)
        playing = value
    }

    mutating func setRate(_ value: Double, at date: Date) {
        seek(to: position(at: date), at: date)
        rate = value.isFinite && value > 0 ? value : 1
    }

    static func projectedPosition(_ position: TimeInterval, capturedAt: Date,
                                  now: Date, playing: Bool, rate: Double,
                                  duration: TimeInterval) -> TimeInterval {
        var clock = PlaybackPositionClock()
        clock.seek(to: position, at: capturedAt)
        clock.setRate(rate, at: capturedAt)
        clock.setPlaying(playing, at: capturedAt)
        return clock.position(at: now, duration: duration)
    }
}
