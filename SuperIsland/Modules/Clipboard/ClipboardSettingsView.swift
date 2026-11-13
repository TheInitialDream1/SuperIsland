import SwiftUI

struct ClipboardSettingsView: View {
    @EnvironmentObject private var appState: AppState
    @ObservedObject private var history = ClipboardHistoryStore.shared
    @AppStorage(ClipboardHistoryStore.retentionKey) private var retentionDays = 7
    @State private var confirmClear = false

    var body: some View {
        SettingGroup {
            SettingToggleRow(
                title: "Record Clipboard History",
                description: "Keep copied text, links, images and files on this Mac. Pausing keeps saved history.",
                isOn: $appState.clipboardRecordingEnabled
            )
            .accessibilityLabel("Record Clipboard History")
            SettingRowDivider()
            HStack(spacing: 12) {
                Picker("Keep Unpinned History", selection: $retentionDays) {
                    ForEach(ClipboardHistoryStore.retentionOptions, id: \.self) { days in
                        Text(L10n.format("ClipboardRetentionDays", days)).tag(days)
                    }
                }
                .fixedSize()
                Spacer(minLength: 0)
                Button("Clear Clipboard History") { confirmClear = true }
                    .disabled(history.records.isEmpty)
            }
            .padding(.horizontal, 16).padding(.vertical, 11)
        }
        .onChange(of: retentionDays) { _, _ in history.prune() }
        .confirmationDialog("Clear Clipboard History", isPresented: $confirmClear) {
            Button("Clear Unpinned Items", role: .destructive) { history.clear(keepingPinned: true) }
            Button("Clear All Items", role: .destructive) { history.clear(keepingPinned: false) }
            Button("Cancel", role: .cancel) {}
        }
    }
}
