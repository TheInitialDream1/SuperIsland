import SwiftUI

/// Native tools use the extension lifecycle and the island's regular tab bar.
enum NativeUtilityExtension: String, CaseIterable {
    case clipboard = "clipboard-history"
    case note = "quick-note"
    case tasks = "local-tasks"
    case clock
    case countdown
    case progress = "time-progress"
    case system = "system-status"
    case quote = "daily-quote"
    case mascot = "island-mascot"

    var id: String { "com.wangxulong.superisland." + rawValue }
    var module: ActiveModule { .extension_(id) }

    init?(id: String) {
        guard let extensionType = Self.allCases.first(where: { $0.id == id }) else { return nil }
        self = extensionType
    }

    var title: String {
        switch self {
        case .clipboard: return "Clipboard History"
        case .note: return "Quick Note"
        case .tasks: return "Local To-Do"
        case .clock: return "Clock"
        case .countdown: return "Countdown"
        case .progress: return "Time Progress"
        case .system: return "System Status"
        case .quote: return "Daily Quote"
        case .mascot: return "Island Mascot"
        }
    }

    var description: String {
        switch self {
        case .clipboard: return "Search, pin and reuse copied text, links, images and files."
        case .note: return "Write a note that saves as you type."
        case .tasks: return "Add, complete and remove tasks stored on this Mac."
        case .clock: return "See the local time and date."
        case .countdown: return "Start, pause and resume a countdown."
        case .progress: return "See how much of today and this week has passed."
        case .system: return "Monitor CPU, memory, disk, power and Bluetooth batteries."
        case .quote: return "Display a daily quote from your own list."
        case .mascot: return "Show your SuperIsland mascot."
        }
    }

    var icon: String {
        switch self {
        case .clipboard: return "clipboard"
        case .note: return "note.text"
        case .tasks: return "checkmark.circle"
        case .clock: return "clock"
        case .countdown: return "timer"
        case .progress: return "chart.bar"
        case .system: return "gauge.with.dots.needle.50percent"
        case .quote: return "quote.opening"
        case .mascot: return "pawprint"
        }
    }

    var panelHeight: Double {
        switch self {
        case .clipboard: return 302
        case .system: return 336
        case .note, .tasks: return 222
        case .quote, .mascot: return 202
        case .clock, .countdown, .progress: return 164
        }
    }
}

struct NativeUtilityPanel: View {
    let utility: NativeUtilityExtension

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if utility != .clipboard && utility != .system {
                HStack(spacing: 8) {
                    Image(systemName: utility.icon)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.74))
                        .accessibilityHidden(true)
                    Text(L10n.string(utility.title))
                        .font(.system(size: 17, weight: .semibold))
                        .accessibilityAddTraits(.isHeader)
                }
            }

            content
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .foregroundStyle(.white)
        .environment(\.colorScheme, .dark)
    }

    @ViewBuilder private var content: some View {
        switch utility {
        case .clipboard: ClipboardHistoryView()
        case .note: IslandNoteWidget()
        case .tasks: IslandTasksWidget()
        case .clock: IslandClockWidget()
        case .countdown: IslandCountdownWidget()
        case .progress: IslandProgressWidget()
        case .system: IslandSystemStatusView()
        case .quote: IslandQuoteWidget()
        case .mascot: IslandMascotWidget()
        }
    }
}

private struct IslandMascotWidget: View {
    @ObservedObject private var mascot = MascotManager.shared

    var body: some View {
        if let error = mascot.loadError, mascot.currentLoopVideoURL == nil, mascot.thumbnailURL == nil {
            Text(error)
                .font(.callout)
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(12)
        } else {
            GeometryReader { geometry in
                MascotRendererView(size: max(0, min(geometry.size.width, geometry.size.height) - 16), extensionID: nil)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .accessibilityLabel("Island Mascot")
            }
        }
    }
}
