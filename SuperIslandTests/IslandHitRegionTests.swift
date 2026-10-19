import SwiftUI
import XCTest
@testable import SuperIsland

final class IslandHitRegionTests: XCTestCase {
    func testLyricsViewportPaddingAndShadowPassThrough() {
        let region = IslandHitRegion(
            surfaceFrame: CGRect(x: 52, y: 0, width: 658, height: 283),
            shape: PillShape(topLeadingRadius: 21.5, topTrailingRadius: 21.5,
                             bottomLeadingRadius: 40, bottomTrailingRadius: 40,
                             outwardTopCorners: true)
        )
        XCTAssertTrue(region.contains(CGPoint(x: 100, y: 100)))
        XCTAssertTrue(region.contains(CGPoint(x: 650, y: 260)))
        // Unused animation height, the shadow, both side gutters and corners.
        for point in [CGPoint(x: 380, y: 400), CGPoint(x: 380, y: 300),
                      CGPoint(x: 20, y: 100), CGPoint(x: 740, y: 100),
                      CGPoint(x: 60, y: 100), CGPoint(x: 702, y: 100),
                      CGPoint(x: 77, y: 280), CGPoint(x: 684, y: 280)] {
            XCTAssertFalse(region.contains(point), "Unexpected hit at \(point)")
        }
    }

    func testCompactRoundedCornersAndNotchCutoutPassThrough() {
        let rounded = IslandHitRegion(surfaceFrame: CGRect(x: 0, y: 0, width: 220, height: 28),
                                      shape: PillShape(cornerRadius: 12))
        XCTAssertTrue(rounded.contains(CGPoint(x: 110, y: 14)))
        XCTAssertFalse(rounded.contains(CGPoint(x: 1, y: 27)))
        let cutout = IslandHitRegion(
            surfaceFrame: CGRect(x: 0, y: 0, width: 400, height: 120),
            shape: PillShape(topLeadingRadius: 12, topTrailingRadius: 12,
                             bottomLeadingRadius: 22, bottomTrailingRadius: 22,
                             topCutoutWidth: 100, topCutoutDepth: 30, topCutoutCornerRadius: 6)
        )
        XCTAssertFalse(cutout.contains(CGPoint(x: 200, y: 10)))
        XCTAssertTrue(cutout.contains(CGPoint(x: 200, y: 50)))
    }

    func testOptionalCyclersReceiveClicksWithoutCapturingTheGutters() {
        let surface = CGRect(x: 52, y: 0, width: 408, height: 120)
        let region = IslandHitRegion(
            surfaceFrame: surface, shape: PillShape(cornerRadius: 22),
            cycleButtonFrames: [CGRect(x: 14, y: 48, width: 24, height: 24),
                                CGRect(x: 474, y: 48, width: 24, height: 24)]
        )
        XCTAssertTrue(region.contains(CGPoint(x: 26, y: 60)))
        XCTAssertTrue(region.contains(CGPoint(x: 486, y: 60)))
        XCTAssertFalse(region.contains(CGPoint(x: 44, y: 60)))
        XCTAssertFalse(region.contains(CGPoint(x: 468, y: 60)))
        XCTAssertFalse(region.contains(CGPoint(x: 14, y: 48)))
        let hidden = IslandHitRegion(surfaceFrame: surface, shape: PillShape(cornerRadius: 22))
        XCTAssertFalse(hidden.contains(CGPoint(x: 26, y: 60)))
        XCTAssertFalse(hidden.contains(CGPoint(x: 486, y: 60)))
    }
}
