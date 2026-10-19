import SwiftUI

struct LiveOrdersSettingsView: View {
    @ObservedObject private var bridge = OrderWebBridge.shared
    @State private var disconnectingPlatform: LiveOrderPlatform?

    let platforms: [LiveOrderPlatform]

    init(platforms: [LiveOrderPlatform] = LiveOrderPlatform.allCases) {
        self.platforms = platforms
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(platforms) { platform in
                platformCard(platform)
            }

            Text("Passwords are never stored. Each service uses its own isolated WebKit login data, and SuperIsland only reads delivery status shown on the visible order page.")
                .font(.system(size: 11))
                .foregroundColor(.secondary)
        }
        .onAppear {
            for platform in platforms {
                bridge.start(platform: platform)
            }
        }
        .confirmationDialog(
            disconnectTitle,
            isPresented: Binding(
                get: { disconnectingPlatform != nil },
                set: { if !$0 { disconnectingPlatform = nil } }
            ),
            titleVisibility: .visible
        ) {
            Button("Disconnect and Clear Login", role: .destructive) {
                if let platform = disconnectingPlatform {
                    bridge.disconnect(platform: platform)
                }
                disconnectingPlatform = nil
            }
            Button("Cancel", role: .cancel) {
                disconnectingPlatform = nil
            }
        }
    }

    private func platformCard(_ platform: LiveOrderPlatform) -> some View {
        let status = bridge.status(for: platform)
        let activeCount = status.orders.filter(\.isActive).count

        return VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: platform.settingsIcon)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(platform.tintColor)
                    .frame(width: 18)

                Circle()
                    .fill(stateColor(status.state))
                    .frame(width: 8, height: 8)

                Text(platform.displayName)
                    .font(.system(size: 12, weight: .semibold))

                Text(L10n.string(stateTitle(status.state)))
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)

                Spacer()

                if let lastSyncAt = status.lastSyncAt {
                    Text(lastSyncAt.formatted(date: .omitted, time: .shortened))
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(.secondary)
                }
            }

            Text(L10n.string(status.statusText))
                .font(.system(size: 12))
                .foregroundColor(.secondary)

            HStack(spacing: 8) {
                Button(status.needsLogin ? platform.signInButtonTitle : platform.openButtonTitle) {
                    bridge.openLogin(platform: platform)
                }
                .buttonStyle(.borderedProminent)
                .tint(platform.tintColor)

                Button("Sync Now") {
                    bridge.refresh(platform: platform, showLoginWindow: false)
                }
                .buttonStyle(.bordered)
                .disabled(status.state == .loading || status.state == .needsLogin)

                if status.state != .idle || !status.orders.isEmpty {
                    Button("Disconnect") {
                        disconnectingPlatform = platform
                    }
                    .buttonStyle(.bordered)
                    .tint(.red)
                }

                Spacer()

                if !status.orders.isEmpty {
                    Label(
                        L10n.format("%d active orders", activeCount),
                        systemImage: "location.fill"
                    )
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
                }
            }

            if let error = status.lastError, !error.isEmpty {
                Text(error)
                    .font(.system(size: 11))
                    .foregroundColor(.red)
                    .textSelection(.enabled)
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(Color.primary.opacity(0.045))
        )
    }

    private var disconnectTitle: String {
        guard let platform = disconnectingPlatform else { return "" }
        return L10n.format("Disconnect %@ and clear its login data?", platform.displayName)
    }

    private func stateTitle(_ state: OrderWebBridge.ConnectionState) -> String {
        switch state {
        case .idle: return "Not Connected"
        case .loading: return "Syncing"
        case .needsLogin: return "Sign-in Required"
        case .connected: return "Connected"
        case .error: return "Error"
        }
    }

    private func stateColor(_ state: OrderWebBridge.ConnectionState) -> Color {
        switch state {
        case .idle: return .secondary
        case .loading: return .orange
        case .needsLogin: return .yellow
        case .connected: return .green
        case .error: return .red
        }
    }
}

private extension LiveOrderPlatform {
    var tintColor: Color {
        switch self {
        case .jd: return .red
        case .meituan: return Color(red: 1.0, green: 0.72, blue: 0.05)
        case .cainiao: return Color(red: 0.12, green: 0.55, blue: 0.98)
        }
    }

    var signInButtonTitle: String {
        switch self {
        case .jd: return L10n.string("Sign in to JD")
        case .meituan: return L10n.string("Sign in to Meituan")
        case .cainiao: return L10n.string("Sign in to Cainiao")
        }
    }

    var openButtonTitle: String {
        switch self {
        case .jd: return L10n.string("Open JD Orders")
        case .meituan: return L10n.string("Open Meituan Delivery")
        case .cainiao: return L10n.string("Open Cainiao Packages")
        }
    }
}
