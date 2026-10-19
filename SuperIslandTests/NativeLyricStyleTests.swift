import XCTest
@testable import SuperIsland

final class NativeLyricStyleTests: XCTestCase {
    func testEveryStyleHasStableUniqueIdentityAndLabel() {
        XCTAssertEqual(NativeLyricStyle.allCases.count, 15)
        XCTAssertEqual(Set(NativeLyricStyle.allCases.map(\.rawValue)).count, 15)
        XCTAssertEqual(Set(NativeLyricStyle.allCases.map(\.title)).count, 15)
        for style in NativeLyricStyle.allCases {
            XCTAssertEqual(NativeLyricStyle.resolve(style.rawValue), style)
            XCTAssertFalse(style.description.isEmpty)
        }
        XCTAssertEqual(NativeLyricStyle.resolve("removed-style"), .luminous)
    }
}
