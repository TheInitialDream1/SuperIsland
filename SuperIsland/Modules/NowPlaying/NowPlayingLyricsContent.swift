import Foundation

struct SyncedLyricWord: Equatable {
    let time: TimeInterval
    let endTime: TimeInterval
    let text: String

    func progress(at position: TimeInterval) -> Double {
        guard position.isFinite, position >= time else { return 0 }
        guard endTime > time else { return 1 }
        return min(1, max(0, (position - time) / (endTime - time)))
    }
}

struct SyncedLyricLine: Equatable {
    let time: TimeInterval
    let text: String
    var words: [SyncedLyricWord] = []
}

struct NowPlayingLyricsContent: Equatable {
    var lines: [SyncedLyricLine] = []
    var status = "idle"
    var message = ""
    var offsetSeconds: Double = 0
    var lyricSource = ""
    var canCalibrate = false
    var showArtwork = true
    var trackTitle = ""
    var trackArtist = ""
    var sourceBundleIdentifier = ""

    var hasWordTimings: Bool { lines.contains { $0.words.count > 1 } }

    func matches(title: String, artist: String, bundleIdentifier: String) -> Bool {
        func normalized(_ value: String) -> String {
            value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        }
        return normalized(trackTitle) == normalized(title)
            && normalized(trackArtist) == normalized(artist)
            && (sourceBundleIdentifier.isEmpty || sourceBundleIdentifier == bundleIdentifier)
    }

    func activeIndex(at position: TimeInterval) -> Int? {
        let target = position + offsetSeconds
        var low = 0, high = lines.count
        while low < high {
            let middle = (low + high) / 2
            if lines[middle].time <= target { low = middle + 1 } else { high = middle }
        }
        return low > 0 ? low - 1 : nil
    }
}
