import AppKit
import SwiftUI

extension SyncedLyricLine {
    /// A single Text preserves native shaping, spaces and font fitting. Each
    /// source word changes color across its own real interval; no duration is
    /// estimated from character count or the next line's timestamp.
    func wordSyncedText(at position: TimeInterval, accent: Color, reduceMotion: Bool = false) -> Text {
        guard !words.isEmpty else { return Text(text).foregroundColor(accent) }
        let color = NSColor(accent).usingColorSpace(.sRGB) ?? .white
        return words.reduce(Text("")) { result, word in
            let amount = reduceMotion ? (position >= word.time ? 1.0 : 0.0) : word.progress(at: position)
            let tint = Color(.sRGB,
                             red: 1 + (color.redComponent - 1) * amount,
                             green: 1 + (color.greenComponent - 1) * amount,
                             blue: 1 + (color.blueComponent - 1) * amount,
                             opacity: 0.6 + amount * 0.4)
            return result + Text(word.text).foregroundColor(tint)
        }
    }
}
