import SwiftUI

struct FullExpandedView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Group {
            if appState.usesArtworkBackground {
                ZStack(alignment: .top) {
                    paddedTabContent
                    if !appState.hasFullExpandedShoulderBarSpace {
                        FullExpandedTopBarView(layout: .inline)
                            .environmentObject(appState)
                    }
                }
            } else {
                // Other extensions own the entire area below their toolbar.
                // Keeping it in the stack preserves both layout and hit tests.
                VStack(spacing: 0) {
                    if !appState.hasFullExpandedShoulderBarSpace {
                        FullExpandedTopBarView(layout: .inline)
                            .environmentObject(appState)
                            .padding(.bottom, 8)
                    }
                    paddedTabContent
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
    }

    private var paddedTabContent: some View {
        currentTabContent
            .padding(.horizontal, contentHorizontalPadding)
            .padding(.bottom, contentBottomPadding)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    @ViewBuilder
    private var currentTabContent: some View {
        switch appState.fullExpandedSelectedTab {
        case .home:
            HomeScreenView()
        case .module(let module):
            if appState.canPresentFullExpandedModule(module) {
                content(for: module)
            } else {
                HomeScreenView()
            }
        }
    }

    @ViewBuilder
    private func content(for module: ActiveModule) -> some View {
        switch module {
        case .builtIn(.volumeHUD):
            SystemHUDExpandedView()
        case .builtIn(.battery):
            BatteryExpandedView()
        case .builtIn(.shelf):
            ShelfFullExpandedView()
        case .builtIn(.calendar):
            CalendarExpandedView()
        case .builtIn(.weather):
            WeatherExpandedView()
        case .builtIn(.notifications):
            NotificationExpandedView()
        case .builtIn(.teleprompter):
            TeleprompterExpandedView()
        case .builtIn(.nowPlaying), .builtIn(.connectivity):
            HomeScreenView()
        case .extension_(let extensionID):
            ExtensionRendererView(extensionID: extensionID, displayMode: .fullExpanded)
        }
    }

    /// The tab actually being rendered — falls back to `.home` when the
    /// selected tab points to a module that can't currently be presented
    /// (e.g. a disabled Notifications module). This keeps the Home view's
    /// padding stable when the fallback to `HomeScreenView()` kicks in.
    private var effectiveSelectedTab: FullExpandedTab {
        switch appState.fullExpandedSelectedTab {
        case .home:
            return .home
        case .module(let module):
            return appState.canPresentFullExpandedModule(module)
                ? .module(module)
                : .home
        }
    }

    private var contentHorizontalPadding: CGFloat {
        if appState.usesArtworkBackground { return 0 }
        switch effectiveSelectedTab {
        case .home:
            return 0
        case .module(.extension_):
            return 2
        case .module(.builtIn(.nowPlaying)):
            return 4
        default:
            return 8
        }
    }

    private var contentBottomPadding: CGFloat {
        if appState.usesArtworkBackground { return 0 }
        switch effectiveSelectedTab {
        case .home:
            return 0
        case .module(.extension_):
            return 2
        default:
            return 4
        }
    }
}

enum FullExpandedTopBarLayout {
    case inline
    case shoulder
}

struct FullExpandedTopBarView: View {
    @EnvironmentObject private var appState: AppState
    @ObservedObject private var batteryManager = BatteryManager.shared
    @ObservedObject private var notificationManager = NotificationManager.shared
    @State private var isToolbarHovered = false

    let layout: FullExpandedTopBarLayout

    private let shoulderHorizontalPadding: CGFloat = 40
    private let shoulderTopPadding: CGFloat = 2
    private let shoulderTabSpacing: CGFloat = 8
    private let iconTabWidth: CGFloat = 36
    private let trailingControlsSlotWidth: CGFloat = 168
    private let shoulderLeadingInset: CGFloat = 0
    private let settingsLeadingInset: CGFloat = 4

    var body: some View {
        Group {
            if appState.usesArtworkBackground {
                immersiveToolbar
            } else if layout == .inline {
                toolbarContent.frame(height: hoverZoneHeight)
            } else {
                toolbarContent
            }
        }
        .onChange(of: appState.usesArtworkBackground) { _, _ in isToolbarHovered = false }
    }

    private var immersiveToolbar: some View {
        ZStack(alignment: .top) {
            Color.clear
                .frame(maxWidth: .infinity)
                .frame(height: hoverZoneHeight)
                .contentShape(Rectangle())

            toolbarContent
                .opacity(isToolbarHovered ? 1 : 0)
                .allowsHitTesting(isToolbarHovered)
        }
        .frame(maxWidth: .infinity, alignment: .top)
        .frame(height: hoverZoneHeight, alignment: .top)
        .contentShape(Rectangle())
        .overlay {
            NativeHoverRegion { hovered in
                withAnimation(.easeOut(duration: hovered ? 0.12 : 0.16)) {
                    isToolbarHovered = hovered
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    @ViewBuilder
    private var toolbarContent: some View {
        Group {
            if layout == .shoulder {
                shoulderBar
            } else {
                inlineBar
            }
        }
    }

    private var hoverZoneHeight: CGFloat {
        layout == .shoulder ? 42 : 48
    }

    private var inlineBar: some View {
        HStack(spacing: 8) {
            ScrollViewReader { proxy in
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(visibleTabs) { tab in
                            FullExpandedTabButton(
                                tab: tab,
                                isSelected: tab == appState.fullExpandedSelectedTab
                            ) {
                                appState.selectFullExpandedTab(tab)
                            }
                            .id(tab.id)
                        }
                    }
                    .padding(.horizontal, 2)
                    .padding(.bottom, 10)
                }
                .onChange(of: appState.fullExpandedSelectedTab) { _, newTab in
                    withAnimation(.easeInOut(duration: 0.22)) {
                        proxy.scrollTo(newTab.id, anchor: .leading)
                    }
                }
                .onChange(of: appState.currentState) { _, newState in
                    if newState == .fullExpanded {
                        proxy.scrollTo(appState.fullExpandedSelectedTab.id, anchor: .leading)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            trailingShoulderControls
                .padding(.bottom, 10)
        }
    }

    private var shoulderBar: some View {
        HStack(spacing: 0) {
            leadingShoulderTabs
                .frame(width: leadingShoulderWidth, alignment: .leading)

            Spacer(minLength: shoulderGapWidth)

            trailingShoulderControls
                .frame(width: trailingControlsSlotWidth, alignment: .trailing)
        }
        .frame(width: shoulderAvailableWidth, alignment: .top)
        .padding(.horizontal, shoulderHorizontalPadding)
        .padding(.top, shoulderTopPadding)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .clipped()
    }

    private var leadingShoulderTabs: some View {
        HStack(spacing: shoulderTabSpacing) {
            FullExpandedTabButton(
                tab: .home,
                isSelected: appState.fullExpandedSelectedTab == .home,
                showsTitle: false
            ) {
                appState.selectFullExpandedTab(.home)
            }
            .frame(width: iconTabWidth)

            ScrollViewReader { proxy in
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: shoulderTabSpacing) {
                        ForEach(moduleTabs) { tab in
                            FullExpandedTabButton(
                                tab: tab,
                                isSelected: tab == appState.fullExpandedSelectedTab,
                                showsTitle: false
                            ) {
                                appState.selectFullExpandedTab(tab)
                            }
                            .frame(width: iconTabWidth)
                            .id(tab.id)
                        }
                    }
                    .padding(.horizontal, 2)
                }
                .frame(width: shoulderModuleViewportWidth, alignment: .leading)
                .clipped()
                .onAppear {
                    scrollShoulderTabs(with: proxy, animated: false)
                }
                .onChange(of: appState.fullExpandedSelectedTab) { _, _ in
                    scrollShoulderTabs(with: proxy, animated: true)
                }
                .onChange(of: appState.currentState) { _, newState in
                    if newState == .fullExpanded {
                        scrollShoulderTabs(with: proxy, animated: false)
                    }
                }
            }
        }
        .frame(width: leadingShoulderWidth, alignment: .leading)
        .padding(.leading, shoulderLeadingInset)
        .clipped()
    }

    private var settingsButton: some View {
        Button {
            AppDelegate.showSettingsWindow()
        } label: {
            Image(systemName: "gearshape.fill")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.white.opacity(0.72))
                .frame(width: 32, height: 32)
                .background(
                    Circle()
                        .fill(islandSurfaceFill)
                        .overlay(
                            Circle()
                                .fill(Color.white.opacity(0.01))
                        )
                )
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(0.035), lineWidth: 1)
                )
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .hoverPointer()
        .help("Settings")
    }

    private var batteryButton: some View {
        let isSelected = appState.fullExpandedSelectedTab == .module(.builtIn(.battery))

        return Button {
            appState.selectFullExpandedTab(.module(.builtIn(.battery)))
        } label: {
            Image(systemName: batteryManager.batteryIconName)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(batteryButtonTint(isSelected: isSelected))
                .frame(width: 32, height: 32)
                .background(
                    Circle()
                        .fill(islandSurfaceFill)
                        .overlay(
                            Circle()
                                .fill(Color.white.opacity(isSelected ? 0.04 : 0.01))
                        )
                )
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(isSelected ? 0.09 : 0.035), lineWidth: 1)
                )
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .hoverPointer()
        .help("Battery")
    }

    private var lockButton: some View {
        let isLocked = appState.lockFullExpandedInPlace

        return Button {
            appState.toggleFullExpandedLock()
        } label: {
            Image(systemName: isLocked ? "lock.fill" : "lock.open")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.white.opacity(isLocked ? 0.92 : 0.72))
                .frame(width: 32, height: 32)
                .background(
                    Circle()
                        .fill(islandSurfaceFill)
                        .overlay(
                            Circle()
                                .fill(Color.white.opacity(isLocked ? 0.05 : 0.01))
                        )
                )
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(isLocked ? 0.11 : 0.035), lineWidth: 1)
                )
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .hoverPointer()
        .help(isLocked ? "Unlock island" : "Lock island open")
    }

    private var trailingShoulderControls: some View {
        HStack(spacing: 8) {
            lockButton
            if appState.batteryEnabled {
                batteryButton
            }
            if appState.notificationsEnabled {
                notificationButton
            }
            settingsButton
        }
        .padding(.leading, settingsLeadingInset)
    }

    private var notificationButton: some View {
        let isSelected = appState.fullExpandedSelectedTab == .module(.builtIn(.notifications))

        return Button {
            appState.selectFullExpandedTab(.module(.builtIn(.notifications)))
        } label: {
            Image(systemName: "bell.fill")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.white.opacity(isSelected ? 0.88 : 0.74))
                .frame(width: 32, height: 32)
                .background(
                    Circle()
                        .fill(islandSurfaceFill)
                        .overlay(
                            Circle()
                                .fill(Color.white.opacity(isSelected ? 0.04 : 0.01))
                        )
                )
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(isSelected ? 0.09 : 0.035), lineWidth: 1)
                )
                .overlay(alignment: .topTrailing) {
                    if notificationManager.recentNotifications.isEmpty {
                        EmptyView()
                    } else {
                        notificationCountBadge
                    }
                }
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .hoverPointer()
        .help("Notifications")
    }

    private var notificationCountBadge: some View {
        Text(notificationCountText)
            .font(.system(size: 7, weight: .bold, design: .rounded))
            .foregroundStyle(.white)
            .padding(.horizontal, 5)
            .padding(.vertical, 2)
            .background(
                Capsule(style: .continuous)
                    .fill(Color.green.opacity(0.82))
            )
            .overlay(
                Capsule(style: .continuous)
                    .stroke(Color.green.opacity(0.28), lineWidth: 1)
            )
            .offset(x: 3, y: -2)
    }

    private var moduleTabs: [FullExpandedTab] {
        visibleTabs.filter { $0 != .home }
    }

    private var visibleTabs: [FullExpandedTab] {
        appState.fullExpandedTabs.filter { tab in
            if case .module(.builtIn(.notifications)) = tab {
                return false
            }
            return true
        }
    }

    private var shoulderModuleViewportWidth: CGFloat {
        let visibleModuleCount: CGFloat = 3
        let contentWidth = (iconTabWidth * visibleModuleCount) + (shoulderTabSpacing * max(0, visibleModuleCount - 1)) + 4
        return min(leadingScrollableWidth, contentWidth)
    }

    private var shoulderAvailableWidth: CGFloat {
        max(0, appState.currentContentSize.width - (shoulderHorizontalPadding * 2))
    }

    private var shoulderGapWidth: CGFloat {
        min(
            appState.fullExpandedShoulderGapWidth,
            max(0, shoulderAvailableWidth - trailingControlsSlotWidth - settingsLeadingInset)
        )
    }

    private var leadingShoulderWidth: CGFloat {
        max(0, shoulderAvailableWidth - shoulderGapWidth - trailingControlsSlotWidth - shoulderLeadingInset)
    }

    private var leadingScrollableWidth: CGFloat {
        max(0, leadingShoulderWidth - iconTabWidth - shoulderTabSpacing)
    }

    private var islandSurfaceFill: LinearGradient {
        LinearGradient(
            colors: [
                appState.usesArtworkBackground ? Color.white.opacity(0.08) : Color.black.opacity(0.98),
                appState.usesArtworkBackground ? Color.white.opacity(0.04) : Color.black.opacity(0.94)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    private var notificationCountText: String {
        let count = notificationManager.recentNotifications.count
        if count > 99 {
            return "99+"
        }
        return "\(count)"
    } 

    private func scrollShoulderTabs(with proxy: ScrollViewProxy, animated: Bool) {
        guard case .module(let module) = appState.fullExpandedSelectedTab else { return }
        let targetTab = FullExpandedTab.module(module)
        guard moduleTabs.contains(targetTab) else { return }
        let target = targetTab.id

        if animated {
            withAnimation(.easeInOut(duration: 0.22)) {
                proxy.scrollTo(target, anchor: .leading)
            }
        } else {
            proxy.scrollTo(target, anchor: .leading)
        }
    }

    private func batteryButtonTint(isSelected: Bool) -> Color {
        if batteryManager.isCharging {
            return Color.green.opacity(isSelected ? 0.96 : 0.84)
        }
        if batteryManager.batteryLevel <= 10 {
            return Color.red.opacity(isSelected ? 0.96 : 0.82)
        }
        if batteryManager.batteryLevel <= 20 {
            return Color.yellow.opacity(isSelected ? 0.96 : 0.82)
        }
        return Color.white.opacity(isSelected ? 0.9 : 0.74)
    }
}

@MainActor
private struct FullExpandedTabButton: View {
    @Environment(\.lyricsUsesIslandBackground) private var usesArtworkBackground
    let tab: FullExpandedTab
    let isSelected: Bool
    var showsTitle: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                tabIcon
                    .foregroundColor(.white.opacity(isSelected ? 0.96 : 0.72))

                if showsTitle && isSelected {
                    Text(tab.title)
                        .font(.system(size: 11, weight: .semibold))
                        .lineLimit(1)
                }
            }
            .padding(.horizontal, showsTitle && isSelected ? 11 : 10)
            .padding(.vertical, 6)
            .frame(minWidth: showsTitle ? 32 : 36, minHeight: 32)
            .background(
                Capsule(style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                usesArtworkBackground ? Color.white.opacity(0.08) : Color.black.opacity(0.98),
                                usesArtworkBackground ? Color.white.opacity(0.04) : Color.black.opacity(0.94)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .overlay(
                        Capsule(style: .continuous)
                            .fill(Color.white.opacity(isSelected ? 0.05 : 0.02))
                    )
            )
            .overlay(
                Capsule(style: .continuous)
                    .stroke(Color.white.opacity(isSelected ? 0.12 : 0.08), lineWidth: 1)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .hoverPointer()
        .help(tab.title)
    }

    @ViewBuilder
    private var tabIcon: some View {
        if let iconImage = tab.iconImage {
            Image(nsImage: iconImage)
                .renderingMode(.original)
                .resizable()
                .scaledToFit()
                .frame(width: 11, height: 11)
        } else {
            Image(systemName: tab.iconName)
                .font(.system(size: 11, weight: .semibold))
        }
    }
}

/// Tracks the full toolbar rectangle without becoming a mouse-event target.
/// Child buttons can rebuild their tracking areas without hiding the toolbar.
struct NativeHoverRegion: NSViewRepresentable {
    var onHover: (Bool) -> Void

    func makeNSView(context: Context) -> TrackingView {
        let view = TrackingView()
        view.onHover = onHover
        return view
    }

    func updateNSView(_ view: TrackingView, context: Context) {
        view.onHover = onHover
    }

    final class TrackingView: NSView {
        var onHover: ((Bool) -> Void)?
        private var tracking: NSTrackingArea?
        private var eventMonitor: Any?
        private var hovered = false

        override func hitTest(_ point: NSPoint) -> NSView? { nil }

        override func updateTrackingAreas() {
            if let tracking { removeTrackingArea(tracking) }
            let area = NSTrackingArea(rect: bounds,
                                      options: [.mouseEnteredAndExited, .mouseMoved, .activeAlways, .enabledDuringMouseDrag],
                                      owner: self, userInfo: nil)
            addTrackingArea(area)
            tracking = area
            super.updateTrackingAreas()
            refreshHover()
        }

        override func viewDidMoveToWindow() {
            super.viewDidMoveToWindow()
            if let eventMonitor { NSEvent.removeMonitor(eventMonitor) }
            eventMonitor = nil
            guard window != nil else { return }
            // Observe the window's events even when a SwiftUI child owns the
            // event target. Returning the event preserves normal button clicks.
            eventMonitor = NSEvent.addLocalMonitorForEvents(matching: [
                .mouseMoved, .leftMouseDragged, .rightMouseDragged,
                .mouseEntered, .mouseExited, .leftMouseDown, .leftMouseUp
            ]) { [weak self] event in
                guard let self else { return event }
                if event.window === self.window {
                    self.refreshHover(at: event.locationInWindow)
                }
                return event
            }
        }

        deinit {
            if let eventMonitor { NSEvent.removeMonitor(eventMonitor) }
        }

        override func mouseEntered(with event: NSEvent) { refreshHover(at: event.locationInWindow) }
        override func mouseExited(with event: NSEvent) { refreshHover(at: event.locationInWindow) }
        override func mouseMoved(with event: NSEvent) { refreshHover(at: event.locationInWindow) }

        private func refreshHover(at location: NSPoint? = nil) {
            guard let window else { return }
            let point = convert(location ?? window.mouseLocationOutsideOfEventStream, from: nil)
            let next = !isHiddenOrHasHiddenAncestor && bounds.contains(point) && visibleRect.contains(point)
            guard hovered != next else { return }
            hovered = next
            // Tracking areas are also rebuilt during SwiftUI layout.
            DispatchQueue.main.async { [weak self] in self?.onHover?(next) }
        }
    }
}
