import AppKit
import Speech
import SwiftUI

final class TeleprompterScriptEditorWindowController {
    private static var windowController: NSWindowController?

    static func show() {
        if let window = windowController?.window {
            window.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            return
        }

        let rootView = TeleprompterScriptEditorView()
        let hostingController = NSHostingController(rootView: rootView)

        let window = NSWindow(contentViewController: hostingController)
        window.title = L10n.string("Teleprompter Script")
        window.styleMask = [.titled, .closable, .miniaturizable, .resizable]
        window.setContentSize(NSSize(width: 560, height: 460))
        window.minSize = NSSize(width: 400, height: 340)
        window.isReleasedWhenClosed = false
        window.backgroundColor = NSColor(white: 0.07, alpha: 1)

        // Open hugged to the top of the screen, just under the menu bar.
        let screen = NSScreen.main ?? NSScreen.screens[0]
        let windowSize = NSSize(width: 560, height: 460)
        let topMargin: CGFloat = 10
        let windowX = screen.visibleFrame.midX - windowSize.width / 2
        let windowY = screen.visibleFrame.maxY - topMargin - windowSize.height
        window.setFrameOrigin(NSPoint(x: windowX, y: windowY))

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        windowController = NSWindowController(window: window)
        windowController?.showWindow(nil)
    }
}

// MARK: - Editor view

struct TeleprompterScriptEditorView: View {
    @ObservedObject private var manager = TeleprompterManager.shared
    @State private var draftText: String = ""
    @FocusState private var focused: Bool

    var body: some View {
        VStack(spacing: 0) {
            toolbar
            controlsBar
            editor
            bottomBar
        }
        .background(Color(white: 0.07))
        .preferredColorScheme(.dark)
        .onAppear {
            draftText = manager.scriptText
            focused = true
        }
    }

    // MARK: Toolbar

    private var toolbar: some View {
        HStack(spacing: 16) {
            // Title + word count
            VStack(alignment: .leading, spacing: 2) {
                Text("Script")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white.opacity(0.82))
                Text(wordCountLabel)
                    .font(.system(size: 11).monospacedDigit())
                    .foregroundColor(.white.opacity(0.28))
            }

            Spacer()

            // Speed
            speedControl

            Divider()
                .frame(height: 20)
                .opacity(0.2)

            // Trash
            toolbarButton(icon: "trash", color: .white.opacity(0.45)) {
                draftText = ""
            }
            .help("Clear")

            // Done (filled circle checkmark — stands out against the dark bg)
            Button { applyAndClose() } label: {
                ZStack {
                    Circle()
                        .fill(.white)
                        .frame(width: 30, height: 30)
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.black)
                }
            }
            .buttonStyle(.plain)
            .hoverPointer()
            .keyboardShortcut(.return, modifiers: .command)
            .help("Done (⌘↩)")
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 11)
        .background(Color(white: 0.095))
    }

    private var modeControl: some View {
        Picker("", selection: $manager.listeningMode) {
            ForEach(TeleprompterListeningMode.allCases) { mode in
                Text(mode.label).tag(mode)
            }
        }
        .pickerStyle(.segmented)
        .labelsHidden()
        .frame(width: 176)
        .dataAnnotationID("teleprompter-listening-mode-control")
    }

    private var speedControl: some View {
        HStack(spacing: 6) {
            Image(systemName: "tortoise.fill")
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.28))
            Slider(value: $manager.scrollSpeed, in: 1...30, step: 0.5)
                .frame(width: 96)
                .tint(.white.opacity(0.4))
            Image(systemName: "hare.fill")
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.28))
            Text(String(format: "%.1f", manager.scrollSpeed))
                .font(.system(size: 11).monospacedDigit())
                .foregroundColor(.white.opacity(0.28))
                .frame(width: 28, alignment: .leading)
        }
    }

    private var controlsBar: some View {
        HStack(spacing: 12) {
            labeledControl("Size") {
                HStack(spacing: 6) {
                    styleButton("textformat.size.smaller") {
                        manager.fontSize = max(12, manager.fontSize - 2)
                    }
                    Text("\(Int(manager.fontSize))")
                        .font(.system(size: 11).monospacedDigit())
                        .foregroundColor(.white.opacity(0.42))
                        .frame(width: 24)
                    styleButton("textformat.size.larger") {
                        manager.fontSize = min(40, manager.fontSize + 2)
                    }
                }
            }

            Divider()
                .frame(height: 22)
                .opacity(0.2)

            labeledControl("Align") {
                Picker("", selection: $manager.textAlignmentIndex) {
                    Image(systemName: "text.alignleft").tag(0)
                    Image(systemName: "text.aligncenter").tag(1)
                    Image(systemName: "text.alignright").tag(2)
                }
                .pickerStyle(.segmented)
                .labelsHidden()
                .frame(width: 108)
            }

            Divider()
                .frame(height: 22)
                .opacity(0.2)

            labeledControl("Speed") {
                speedControl
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 8)
        .background(Color(white: 0.082))
        .dataAnnotationID("teleprompter-style-controls")
    }

    private func labeledControl<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        HStack(spacing: 8) {
            Text(title)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.white.opacity(0.30))
            content()
        }
    }

    private func styleButton(_ icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.48))
                .frame(width: 26, height: 24)
                .background(RoundedRectangle(cornerRadius: 5).fill(.white.opacity(0.06)))
        }
        .buttonStyle(.plain)
        .hoverPointer()
    }

    // MARK: Text area

    private var editor: some View {
        TextEditor(text: $draftText)
            .focused($focused)
            .font(.system(size: 15))
            .scrollContentBackground(.hidden)
            .background(Color(white: 0.065))
            .padding(.horizontal, 14)
            .padding(.vertical, 6)
    }

    // MARK: Bottom bar

    private var bottomBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "info.circle")
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.18))
            Text(bottomHelpText)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.22))
            Spacer()
            if manager.listeningMode == .wordTracking {
                speechLocaleControl
            }
            modeControl
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 8)
        .background(Color(white: 0.095))
    }

    private var speechLocaleControl: some View {
        Picker("", selection: $manager.speechLocale) {
            ForEach(speechLocaleOptions, id: \.identifier) { locale in
                Text(speechLocaleLabel(locale))
                    .tag(locale.identifier)
            }
        }
        .labelsHidden()
        .frame(width: 136)
        .dataAnnotationID("teleprompter-speech-locale-control")
    }

    private var speechLocaleOptions: [Locale] {
        SFSpeechRecognizer.supportedLocales().sorted {
            speechLocaleLabel($0) < speechLocaleLabel($1)
        }
    }

    // MARK: Helpers

    @ViewBuilder
    private func toolbarButton(icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(color)
                .frame(width: 30, height: 30)
                .background(Circle().fill(.white.opacity(0.07)))
        }
        .buttonStyle(.plain)
        .hoverPointer()
    }

    private var wordCountLabel: String {
        let words = draftText.split(whereSeparator: \.isWhitespace).count
        return draftText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            ? "Empty"
            : "\(words) word\(words == 1 ? "" : "s")"
    }

    private var bottomHelpText: String {
        switch manager.listeningMode {
        case .classic:
            return "Classic scrolls upward at a steady speed."
        case .wordTracking:
            return "Word Tracking follows your speech after Teleprompter permissions are granted."
        }
    }

    private func applyAndClose() {
        manager.setScript(draftText)
        NSApp.windows.first(where: { $0.title == "Teleprompter Script" })?.close()
    }

    private func speechLocaleLabel(_ locale: Locale) -> String {
        Locale.current.localizedString(forIdentifier: locale.identifier) ?? locale.identifier
    }
}
