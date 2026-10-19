import AppKit
import XCTest
@testable import SuperIsland

final class ArtworkPaletteTests: XCTestCase {
    private func palette(_ color: NSColor) throws -> ArtworkPalette {
        let context = try XCTUnwrap(CGContext(data: nil, width: 32, height: 32,
                                             bitsPerComponent: 8, bytesPerRow: 128,
                                             space: CGColorSpaceCreateDeviceRGB(),
                                             bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue))
        context.setFillColor(color.cgColor)
        context.fill(CGRect(x: 0, y: 0, width: 32, height: 32))
        return ArtworkPalette.extract(from: try XCTUnwrap(context.makeImage()))
    }

    func testGreenAndRedCoversProduceDifferentThemes() throws {
        let green = try palette(NSColor(srgbRed: 0.2, green: 0.65, blue: 0.3, alpha: 1))
        let red = try palette(NSColor(srgbRed: 0.8, green: 0.15, blue: 0.2, alpha: 1))
        XCTAssertGreaterThan(green.primary.green, green.primary.red)
        XCTAssertGreaterThan(red.primary.red, red.primary.green)
        XCTAssertNotEqual(green, red)
    }

    func testMonochromeCoverStaysNeutral() throws {
        let gray = try palette(NSColor(white: 0.4, alpha: 1))
        XCTAssertEqual(gray.primary.red, gray.primary.green, accuracy: 0.02)
        XCTAssertEqual(gray.primary.green, gray.primary.blue, accuracy: 0.02)
    }
}
