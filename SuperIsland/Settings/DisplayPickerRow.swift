import AppKit
import SwiftUI

/// Shared by General and Advanced settings. Disconnection never erases a choice.
struct DisplayPickerRow: View {
    @EnvironmentObject private var appState: AppState
    @State private var options = ScreenDetector.availableScreenOptions()

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("固定显示器").font(.system(size: 13))
                Text("选定后保持在这块屏幕，不跟随鼠标或当前应用")
                    .font(.system(size: 11)).foregroundStyle(.secondary)
            }
            Spacer(minLength: 8)
            Picker("固定显示器", selection: $appState.displayIdentifier) {
                ForEach(options) { option in
                    Text(option.name).tag(option.id)
                }
            }
            .labelsHidden()
            .frame(maxWidth: 240)
        }
        .padding(.horizontal, 16).padding(.vertical, 11)
        .onAppear(perform: refresh)
        .onReceive(NotificationCenter.default.publisher(for: NSApplication.didChangeScreenParametersNotification)) { _ in refresh() }
    }

    private func refresh() {
        let selected = appState.displayIdentifier
        var updated = ScreenDetector.availableScreenOptions()
        if !selected.isEmpty, selected != ScreenDetector.allDisplaysIdentifier {
            if let screen = ScreenDetector.screen(withIDString: selected),
               let stableID = ScreenDetector.displayIDString(for: screen), stableID != selected {
                appState.displayIdentifier = stableID
            } else if !updated.contains(where: { $0.id == selected }) {
                updated.append(.init(id: selected, name: "已选显示器（未连接）"))
            }
        }
        options = updated
    }
}
