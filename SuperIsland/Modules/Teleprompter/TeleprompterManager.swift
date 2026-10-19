import Foundation
import Speech
import SwiftUI

enum TeleprompterListeningMode: String, CaseIterable, Identifiable {
    case classic
    case wordTracking

    var id: String { rawValue }

    var label: String {
        switch self {
        case .classic: return L10n.string("Classic")
        case .wordTracking: return L10n.string("Word Tracking")
        }
    }

    var description: String {
        switch self {
        case .classic:
            return L10n.string("Auto-scrolls at a constant speed.")
        case .wordTracking:
            return L10n.string("Highlights words as you read aloud.")
        }
    }

    var iconName: String {
        switch self {
        case .classic: return "arrow.down.circle"
        case .wordTracking: return "text.word.spacing"
        }
    }
}

@MainActor
final class TeleprompterManager: ObservableObject {
    static let shared = TeleprompterManager()
    let speechRecognizer = TeleprompterSpeechRecognizer()

    // MARK: - Script

    @Published var scriptText: String {
        didSet { UserDefaults.standard.set(scriptText, forKey: "teleprompter.script") }
    }

    // MARK: - Playback state

    @Published var isPlaying: Bool = false

    /// Non-nil while the 3-2-1 countdown is running.
    @Published private(set) var countdownValue: Int? = nil

    /// True after a reset — next play() will show the countdown.
    private var pendingCountdown: Bool = true

    /// Incremented on reset so views can snap their scroll offset back to 0.
    @Published private(set) var resetToken: UUID = UUID()

    /// Monotonically-increasing cumulative pixel nudge applied by scroll-wheel input.
    /// The view subtracts the previously-consumed value to get the delta for each tick.
    @Published private(set) var scrollNudge: CGFloat = 0

    @Published var listeningMode: TeleprompterListeningMode {
        didSet {
            UserDefaults.standard.set(listeningMode.rawValue, forKey: "teleprompter.listeningMode")
            guard oldValue != listeningMode else { return }
            pause()
            pendingCountdown = true
            scrollNudge = 0
            speechRecognizer.reset()
            resetToken = UUID()
            if listeningMode == .wordTracking, AppState.shared.teleprompterEnabled {
                PermissionsManager.shared.requestTeleprompterWordTrackingAccess()
            }
        }
    }

    // MARK: - Style settings (persisted)

    /// Pixels per second of scroll speed.
    @Published var scrollSpeed: Double {
        didSet { UserDefaults.standard.set(scrollSpeed, forKey: "teleprompter.scrollSpeed") }
    }

    /// Font size in points.
    @Published var fontSize: Double {
        didSet { UserDefaults.standard.set(fontSize, forKey: "teleprompter.fontSize") }
    }

    /// 0 = leading, 1 = center, 2 = trailing
    @Published var textAlignmentIndex: Int {
        didSet { UserDefaults.standard.set(textAlignmentIndex, forKey: "teleprompter.alignment") }
    }

    @Published var speechLocale: String {
        didSet { UserDefaults.standard.set(speechLocale, forKey: "teleprompter.speechLocale") }
    }

    var textAlignment: TextAlignment {
        switch textAlignmentIndex {
        case 0: return .leading
        case 2: return .trailing
        default: return .center
        }
    }

    // MARK: - Private

    private var countdownTimer: Timer?

    private init() {
        self.scriptText   = UserDefaults.standard.string(forKey: "teleprompter.script") ?? ""
        self.listeningMode = TeleprompterListeningMode(
            rawValue: UserDefaults.standard.string(forKey: "teleprompter.listeningMode") ?? ""
        ) ?? .classic
        let speed         = UserDefaults.standard.double(forKey: "teleprompter.scrollSpeed")
        self.scrollSpeed  = speed > 0 ? speed : 7.0
        let size          = UserDefaults.standard.double(forKey: "teleprompter.fontSize")
        self.fontSize     = size > 0 ? size : 22.0
        let align         = UserDefaults.standard.object(forKey: "teleprompter.alignment") as? Int
        self.textAlignmentIndex = align ?? 1
        self.speechLocale = Self.defaultSpeechLocale(
            stored: UserDefaults.standard.string(forKey: "teleprompter.speechLocale")
        )
    }

    // MARK: - Computed

    var hasScript: Bool {
        !scriptText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var isCountingDown: Bool { countdownValue != nil }

    var wordTrackingDisplayText: String {
        TeleprompterTextTokenizer.displayText(from: scriptText)
    }

    // MARK: - Script

    func setScript(_ text: String) {
        scriptText = text
        reset()
    }

    // MARK: - Playback

    func play() {
        guard hasScript else { return }
        presentTeleprompter()
        if pendingCountdown {
            pendingCountdown = false
            startCountdown()
        } else {
            beginPlayback()
        }
    }

    func pause() {
        cancelCountdown()
        isPlaying = false
        speechRecognizer.stop()
        releaseTeleprompterPresentation()
    }

    func reset() {
        cancelCountdown()
        isPlaying = false
        pendingCountdown = true
        scrollNudge = 0
        resetToken = UUID()
        speechRecognizer.reset()
        releaseTeleprompterPresentation()
    }

    func togglePlayPause() {
        if isPlaying || isCountingDown { pause() } else { play() }
    }

    /// Seek the scroll position by `delta` pixels. Positive = forward (toward end).
    /// Additive to ongoing auto-scroll — does NOT pause playback.
    func nudgeOffset(by delta: CGFloat) {
        guard hasScript else { return }
        scrollNudge += delta
    }

    // MARK: - Countdown

    private func startCountdown() {
        cancelCountdown()
        countdownValue = 3
        var remaining = 3
        countdownTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                guard let self else { return }
                remaining -= 1
                if remaining > 0 {
                    self.countdownValue = remaining
                } else {
                    self.cancelCountdown()
                    self.beginPlayback()
                }
            }
        }
        countdownTimer?.tolerance = 0.1
    }

    private func beginPlayback() {
        if listeningMode == .wordTracking {
            speechRecognizer.start(with: scriptText, localeIdentifier: speechLocale)
            if speechRecognizer.error != nil, !speechRecognizer.isListening {
                isPlaying = false
                pendingCountdown = true
                releaseTeleprompterPresentation()
                return
            }
        }
        isPlaying = true
    }

    private func cancelCountdown() {
        countdownTimer?.invalidate()
        countdownTimer = nil
        countdownValue = nil
    }

    private func presentTeleprompter() {
        let appState = AppState.shared
        guard appState.teleprompterEnabled else { return }
        let module = ActiveModule.builtIn(.teleprompter)
        appState.holdPresentation(for: module)
        if appState.currentState == .fullExpanded {
            appState.selectFullExpandedTab(.module(module))
            appState.cancelFullExpandedDismiss()
        } else {
            appState.showHUD(module: module, autoDismiss: false)
            appState.cancelAutoDismiss()
        }
    }

    private func releaseTeleprompterPresentation() {
        AppState.shared.releasePresentationHold(for: .builtIn(.teleprompter))
    }

    private static func defaultSpeechLocale(stored: String?) -> String {
        let supported = Set(SFSpeechRecognizer.supportedLocales().map(\.identifier))
        let candidates = [stored].compactMap { $0 }
            + [Locale.current.identifier]
            + Locale.preferredLanguages
            + ["zh-CN", "en-US"]

        for candidate in candidates {
            if supported.contains(candidate) { return candidate }

            let normalized = candidate.replacingOccurrences(of: "_", with: "-")
            if supported.contains(normalized) { return normalized }

            if normalized.hasPrefix("zh-Hans") || normalized.hasPrefix("zh-CN") {
                if supported.contains("zh-CN") { return "zh-CN" }
            }
            if normalized.hasPrefix("zh-Hant") || normalized.hasPrefix("zh-TW") {
                if supported.contains("zh-TW") { return "zh-TW" }
            }
            if normalized.hasPrefix("zh-HK") {
                if supported.contains("zh-HK") { return "zh-HK" }
            }
            if normalized.hasPrefix("en") {
                if supported.contains("en-US") { return "en-US" }
            }
        }

        return supported.sorted().first ?? "en-US"
    }
}
