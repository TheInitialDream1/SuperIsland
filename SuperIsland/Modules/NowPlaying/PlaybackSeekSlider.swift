import AppKit
import SwiftUI

/// Native input owns the drag, so an island-level swipe cannot take it over.
/// Previewing never seeks the audio; releasing commits exactly one command.
struct ProgressBar: View {
    let progress: Double
    var trackHeight: CGFloat = 4
    var knobSize: CGFloat = 10
    var duration: TimeInterval = 0
    var context: String = ""
    var onPreview: ((Double?) -> Void)? = nil
    var onSeek: ((Double) -> Void)? = nil

    @Environment(\.isEnabled) private var isEnabled

    var body: some View {
        NativePlaybackSeekSlider(progress: progress, trackHeight: trackHeight,
                                 knobSize: knobSize, duration: duration, context: context,
                                 enabled: isEnabled && onSeek != nil,
                                 onPreview: onPreview, onSeek: onSeek)
            .frame(height: 28)
    }
}

private struct NativePlaybackSeekSlider: NSViewRepresentable {
    let progress: Double
    let trackHeight: CGFloat
    let knobSize: CGFloat
    let duration: TimeInterval
    let context: String
    let enabled: Bool
    let onPreview: ((Double?) -> Void)?
    let onSeek: ((Double) -> Void)?

    func makeNSView(context: Context) -> PlaybackSeekControl { PlaybackSeekControl() }

    func updateNSView(_ control: PlaybackSeekControl, context _: Context) {
        if control.seekContext != context || !enabled { control.cancelScrubbing() }
        control.seekContext = context
        control.duration = duration
        control.trackHeight = trackHeight
        control.knobSize = max(9, knobSize)
        control.isEnabled = enabled
        control.onPreview = onPreview
        control.onSeek = onSeek
        if !control.isScrubbing { control.progress = PlaybackSeekGeometry.clamped(progress) }
        control.needsDisplay = true
    }

    static func dismantleNSView(_ control: PlaybackSeekControl, coordinator: ()) {
        control.cancelScrubbing()
        control.onPreview = nil
        control.onSeek = nil
    }
}

final class PlaybackSeekControl: NSControl {
    var progress: Double = 0
    var duration: TimeInterval = 0
    var trackHeight: CGFloat = 4
    var knobSize: CGFloat = 10
    var seekContext = ""
    var onPreview: ((Double?) -> Void)?
    var onSeek: ((Double) -> Void)?
    private(set) var isScrubbing = false
    private var isHovering = false
    private var pointerTracking: NSTrackingArea?

    override var acceptsFirstResponder: Bool { isEnabled && onSeek != nil }
    override var intrinsicContentSize: NSSize { NSSize(width: NSView.noIntrinsicMetric, height: 28) }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    override init(frame: NSRect) {
        super.init(frame: frame)
        focusRingType = .none
        setAccessibilityElement(true)
        toolTip = "点击或拖动跳转；方向键调整 5 秒，Esc 取消拖动"
        setAccessibilityLabel("播放进度")
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func becomeFirstResponder() -> Bool {
        let accepted = super.becomeFirstResponder()
        if accepted { focusRingType = .exterior }
        return accepted
    }

    override func resignFirstResponder() -> Bool {
        let accepted = super.resignFirstResponder()
        if accepted { focusRingType = .none }
        return accepted
    }

    override func draw(_ dirtyRect: NSRect) {
        let diameter = min(knobSize, bounds.width)
        let inset = diameter / 2
        let travel = max(0, bounds.width - diameter)
        let centerX = inset + CGFloat(PlaybackSeekGeometry.clamped(progress)) * travel
        let track = NSRect(x: inset, y: bounds.midY - trackHeight / 2,
                           width: travel, height: trackHeight)
        NSColor.white.withAlphaComponent(isEnabled ? 0.3 : 0.15).setFill()
        NSBezierPath(roundedRect: track, xRadius: trackHeight / 2, yRadius: trackHeight / 2).fill()
        var fill = track
        fill.size.width = max(0, centerX - inset)
        NSColor.white.withAlphaComponent(isEnabled ? 0.95 : 0.35).setFill()
        NSBezierPath(roundedRect: fill, xRadius: trackHeight / 2, yRadius: trackHeight / 2).fill()
        if isEnabled {
            NSColor.white.withAlphaComponent(isHovering || isScrubbing ? 1 : 0.75).setFill()
            NSBezierPath(ovalIn: NSRect(x: centerX - inset, y: bounds.midY - inset,
                                       width: diameter, height: diameter)).fill()
        }
    }

    override var focusRingMaskBounds: NSRect { bounds.insetBy(dx: 1, dy: 3) }
    override func drawFocusRingMask() {
        NSBezierPath(roundedRect: focusRingMaskBounds, xRadius: 5, yRadius: 5).fill()
    }

    override func resetCursorRects() {
        if isEnabled { addCursorRect(bounds, cursor: .pointingHand) }
    }

    override func updateTrackingAreas() {
        if let pointerTracking { removeTrackingArea(pointerTracking) }
        let area = NSTrackingArea(rect: .zero,
                                  options: [.mouseEnteredAndExited, .activeAlways, .inVisibleRect],
                                  owner: self, userInfo: nil)
        addTrackingArea(area)
        pointerTracking = area
        super.updateTrackingAreas()
    }

    override func mouseEntered(with event: NSEvent) { isHovering = true; needsDisplay = true }
    override func mouseExited(with event: NSEvent) { isHovering = false; needsDisplay = true }

    override func mouseDown(with event: NSEvent) {
        guard isEnabled, onSeek != nil else { return }
        window?.makeFirstResponder(self)
        // Pointer scrubbing needs keyboard ownership for Escape/arrow keys,
        // but must not paint a keyboard-navigation ring around the whole track.
        focusRingType = .none
        isScrubbing = true
        preview(event)
    }

    override func mouseDragged(with event: NSEvent) {
        guard isScrubbing else { return }
        preview(event)
    }

    override func mouseUp(with event: NSEvent) {
        guard isScrubbing else { return }
        preview(event)
        let value = progress
        isScrubbing = false
        onSeek?(value)
        onPreview?(nil)
        needsDisplay = true
    }

    private func preview(_ event: NSEvent) {
        let point = convert(event.locationInWindow, from: nil)
        progress = PlaybackSeekGeometry.fraction(x: point.x, width: bounds.width, knobSize: knobSize)
        onPreview?(progress)
        needsDisplay = true
    }

    func cancelScrubbing() {
        guard isScrubbing else { return }
        isScrubbing = false
        onPreview?(nil)
        needsDisplay = true
    }

    override func keyDown(with event: NSEvent) {
        guard isEnabled else { return }
        focusRingType = .exterior
        let step = duration > 0 ? 5 / duration : 0.02
        switch event.keyCode {
        case 53: cancelScrubbing()
        case 123, 125: commit(progress - step)
        case 124, 126: commit(progress + step)
        case 115: commit(0)
        case 119: commit(1)
        default: super.keyDown(with: event)
        }
    }

    private func commit(_ value: Double) {
        guard isEnabled, let onSeek else { return }
        cancelScrubbing()
        progress = PlaybackSeekGeometry.clamped(value)
        onSeek(progress)
        needsDisplay = true
        NSAccessibility.post(element: self, notification: .valueChanged)
    }

    override func accessibilityRole() -> NSAccessibility.Role? { .slider }
    override func accessibilityValue() -> Any? { NSNumber(value: progress * 100) }
    override func accessibilityMinValue() -> Any? { NSNumber(value: 0) }
    override func accessibilityMaxValue() -> Any? { NSNumber(value: 100) }
    override func accessibilityValueDescription() -> String? {
        guard duration > 0 else { return String(format: "%.0f%%", progress * 100) }
        let seconds = Int(progress * duration)
        return String(format: "%02d:%02d / %02d:%02d", seconds / 60, seconds % 60,
                      Int(duration) / 60, Int(duration) % 60)
    }
    override func setAccessibilityValue(_ value: Any?) {
        if let number = value as? NSNumber { commit(number.doubleValue / 100) }
    }
    override func accessibilityPerformIncrement() -> Bool {
        guard isEnabled, onSeek != nil else { return false }
        commit(progress + (duration > 0 ? 5 / duration : 0.02)); return true
    }
    override func accessibilityPerformDecrement() -> Bool {
        guard isEnabled, onSeek != nil else { return false }
        commit(progress - (duration > 0 ? 5 / duration : 0.02)); return true
    }
}
