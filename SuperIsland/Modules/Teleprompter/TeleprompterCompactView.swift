import SwiftUI

struct TeleprompterCompactView: View {
    @ObservedObject private var manager = TeleprompterManager.shared
    @ObservedObject private var speech = TeleprompterManager.shared.speechRecognizer

    var body: some View {
        HStack(spacing: 7) {
            Image(systemName: iconName)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.white.opacity(manager.isPlaying ? 0.9 : 0.45))
                .symbolEffect(.pulse, isActive: manager.isPlaying)

            Text(L10n.string(label))
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.white.opacity(manager.hasScript ? 0.8 : 0.35))
                .lineLimit(1)
        }
    }

    private var iconName: String {
        if speech.error != nil { return "exclamationmark.triangle.fill" }
        return manager.listeningMode.iconName
    }

    private var label: String {
        guard manager.hasScript else { return "No script" }
        if let error = speech.error, manager.listeningMode == .wordTracking {
            return error
        }
        if manager.isPlaying, manager.listeningMode == .wordTracking {
            guard speech.isListening else { return "Starting" }
            if !speech.lastSpokenText.isEmpty {
                return "\(diagnosticLabel) · \(speech.lastSpokenText.prefix(12))"
            }
            return speech.inputLevel > 0.006 ? "Listening · \(diagnosticLabel)" : "Waiting · \(diagnosticLabel)"
        }
        if manager.isPlaying { return "Playing" }
        return manager.listeningMode.label
    }

    private var diagnosticLabel: String {
        speech.matchConfidenceLabel.isEmpty ? progressLabel : speech.matchConfidenceLabel
    }

    private var progressLabel: String {
        let total = max(manager.wordTrackingDisplayText.count, 1)
        let clamped = min(max(speech.recognizedCharCount, 0), total)
        return "\(Int((Double(clamped) / Double(total)) * 100))%"
    }
}
