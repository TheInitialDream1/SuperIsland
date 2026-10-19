import AppKit
import XCTest
@testable import SuperIsland

@MainActor
final class PlaybackSeekControlTests: XCTestCase {
    private func mouse(_ type: NSEvent.EventType, x: CGFloat, y: CGFloat = 14) -> NSEvent {
        NSEvent.mouseEvent(with: type, location: NSPoint(x: x, y: y), modifierFlags: [],
                          timestamp: 0, windowNumber: 0, context: nil, eventNumber: 0,
                          clickCount: 1, pressure: 1)!
    }

    func testDragPreviewsContinuouslyButCommitsOnceAtRelease() {
        let control = PlaybackSeekControl(frame: NSRect(x: 0, y: 0, width: 110, height: 28))
        var previews: [Double?] = [], commits: [Double] = []
        control.onPreview = { previews.append($0) }
        control.onSeek = { commits.append($0) }
        control.mouseDown(with: mouse(.leftMouseDown, x: 25, y: 2))
        control.mouseDragged(with: mouse(.leftMouseDragged, x: 55))
        XCTAssertTrue(control.isScrubbing)
        XCTAssertEqual(previews.last!, 0.5)
        XCTAssertTrue(commits.isEmpty)
        control.mouseUp(with: mouse(.leftMouseUp, x: 200))
        XCTAssertEqual(commits, [1])
        XCTAssertNil(previews.last!)
        XCTAssertFalse(control.isScrubbing)
        // A duplicate mouse-up or cancelled drag must not submit another seek.
        control.mouseUp(with: mouse(.leftMouseUp, x: 20))
        XCTAssertEqual(commits, [1])
    }

    func testCancellationAndDisabledControlDoNotSeek() {
        let control = PlaybackSeekControl(frame: NSRect(x: 0, y: 0, width: 110, height: 28))
        var commits = 0
        control.onSeek = { _ in commits += 1 }
        control.mouseDown(with: mouse(.leftMouseDown, x: 30))
        control.cancelScrubbing()
        control.mouseUp(with: mouse(.leftMouseUp, x: 80))
        XCTAssertEqual(commits, 0)
        control.isEnabled = false
        control.mouseDown(with: mouse(.leftMouseDown, x: 80))
        control.mouseUp(with: mouse(.leftMouseUp, x: 80))
        XCTAssertEqual(commits, 0)
    }

    func testPointerScrubbingDoesNotShowKeyboardFocusRing() {
        let control = PlaybackSeekControl(frame: NSRect(x: 0, y: 0, width: 110, height: 28))
        control.onSeek = { _ in }
        control.focusRingType = .exterior
        control.mouseDown(with: mouse(.leftMouseDown, x: 50))
        XCTAssertEqual(control.focusRingType, .none)
        control.mouseUp(with: mouse(.leftMouseUp, x: 70))
        XCTAssertEqual(control.focusRingType, .none)
    }

    func testKeyboardAccessibilityUsesFiveSecondSteps() {
        let control = PlaybackSeekControl(frame: NSRect(x: 0, y: 0, width: 110, height: 28))
        control.duration = 200
        control.progress = 0.5
        var committed: Double = 0
        control.onSeek = { committed = $0 }
        XCTAssertTrue(control.acceptsFirstMouse(for: nil))
        XCTAssertTrue(control.accessibilityPerformIncrement())
        XCTAssertEqual(committed, 0.525, accuracy: 0.0001)
        XCTAssertTrue(control.accessibilityPerformDecrement())
        XCTAssertEqual(committed, 0.5, accuracy: 0.0001)
        control.setAccessibilityValue(NSNumber(value: 75))
        XCTAssertEqual(committed, 0.75)
        XCTAssertEqual(control.accessibilityValueDescription(), "02:30 / 03:20")
    }
}
