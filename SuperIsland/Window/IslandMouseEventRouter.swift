import AppKit

/// Returning nil from NSView.hitTest does not forward a click to another app.
/// Switch the panel's native mouse transparency before the click is dispatched.
/// Movement monitors also restore interaction when entering an ignored panel.
@MainActor
final class IslandMouseEventRouter {
    private let panels: () -> [IslandPanel]
    private let hoverChanged: (Bool) -> Void
    private var globalMonitor: Any?
    private var localMonitor: Any?
    private var timer: Timer?
    private weak var capturedPanel: IslandPanel?

    init(panels: @escaping () -> [IslandPanel], hoverChanged: @escaping (Bool) -> Void) {
        self.panels = panels
        self.hoverChanged = hoverChanged
    }

    func start() {
        guard timer == nil else { return }
        let movement: NSEvent.EventTypeMask = [
            .mouseMoved, .leftMouseDragged, .rightMouseDragged, .otherMouseDragged
        ]
        globalMonitor = NSEvent.addGlobalMonitorForEvents(matching: movement) { [weak self] _ in
            self?.refresh()
        }
        localMonitor = NSEvent.addLocalMonitorForEvents(matching: movement.union([
            .leftMouseDown, .rightMouseDown, .otherMouseDown,
            .leftMouseUp, .rightMouseUp, .otherMouseUp
        ])) { [weak self] event in
            self?.handle(event)
            return event
        }
        // Also handle a stationary pointer when a panel resizes or changes
        // screens. The fallback doesn't need Accessibility or Input Monitoring.
        let timer = Timer(timeInterval: 0.1, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated { self?.refresh() }
        }
        timer.tolerance = 0.02
        RunLoop.main.add(timer, forMode: .common)
        self.timer = timer
        refresh()
    }

    func stop() {
        if let globalMonitor { NSEvent.removeMonitor(globalMonitor) }
        if let localMonitor { NSEvent.removeMonitor(localMonitor) }
        globalMonitor = nil
        localMonitor = nil
        timer?.invalidate()
        timer = nil
        capturedPanel = nil
    }

    func refresh() {
        if NSEvent.pressedMouseButtons == 0 { capturedPanel = nil }
        let pointer = NSEvent.mouseLocation
        var isInside = false
        for panel in panels() {
            let contains = panel.isVisible && panel.containsInteractivePoint(pointer)
            isInside = isInside || contains || (panel === capturedPanel)
            let ignores = !contains && panel !== capturedPanel
            if panel.ignoresMouseEvents != ignores { panel.ignoresMouseEvents = ignores }
        }
        hoverChanged(isInside)
    }

    private func handle(_ event: NSEvent) {
        switch event.type {
        case .leftMouseDown, .rightMouseDown, .otherMouseDown:
            if let panel = event.window as? IslandPanel,
               panel.containsInteractivePoint(panel.convertPoint(toScreen: event.locationInWindow)) {
                // Keep receiving the entire drag, including a mouse-up outside
                // the surface, so seeking and island gestures cannot get stuck.
                capturedPanel = panel
            }
        case .leftMouseUp, .rightMouseUp, .otherMouseUp:
            // Finish dispatching the mouse-up before making the panel ignore it.
            DispatchQueue.main.async { [weak self] in self?.refresh() }
            return
        default:
            break
        }
        refresh()
    }

    deinit {
        if let globalMonitor { NSEvent.removeMonitor(globalMonitor) }
        if let localMonitor { NSEvent.removeMonitor(localMonitor) }
        timer?.invalidate()
    }
}
