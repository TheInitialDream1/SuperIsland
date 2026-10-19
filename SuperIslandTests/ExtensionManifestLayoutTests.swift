import XCTest
@testable import SuperIsland

final class ExtensionManifestLayoutTests: XCTestCase {
    func testDecodesOptionalLayoutHeights() throws {
        let data = try XCTUnwrap(
            """
            {
              "id": "com.example.compact-panel",
              "name": "Compact Panel",
              "version": "1.0.0",
              "layout": {
                "expandedHeight": 138,
                "fullExpandedHeight": 132
              }
            }
            """.data(using: .utf8)
        )

        let manifest = try JSONDecoder().decode(ExtensionManifest.self, from: data)

        XCTAssertEqual(manifest.layout.expandedHeight, 138)
        XCTAssertEqual(manifest.layout.fullExpandedHeight, 132)
    }

    func testLayoutRemainsOptionalForExistingExtensions() throws {
        let data = try XCTUnwrap(
            """
            {
              "id": "com.example.legacy",
              "name": "Legacy",
              "version": "1.0.0"
            }
            """.data(using: .utf8)
        )

        let manifest = try JSONDecoder().decode(ExtensionManifest.self, from: data)

        XCTAssertTrue(manifest.layout.isEmpty)
    }
}
