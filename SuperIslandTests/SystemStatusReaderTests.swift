import Foundation
import XCTest
@testable import SuperIsland

final class SystemStatusReaderTests: XCTestCase {
    func testCPUUsesIntervalAndHandlesCounterWrap() throws {
        let before = SystemStatusReader.CPUTicks(user: UInt32.max - 3, system: 100, idle: 900, nice: 0)
        let after = SystemStatusReader.CPUTicks(user: 6, system: 105, idle: 930, nice: 5)
        XCTAssertNil(before.load(since: before))
        XCTAssertEqual(try XCTUnwrap(after.load(since: before)), 0.4, accuracy: 0.0001)
    }

    func testBluetoothReportKeepsOnlyConnectedDevicesAndValidBatteryValues() throws {
        let report = Data("""
        {"SPBluetoothDataType": [{
            "device_connected": [
                {"Headphones": {"device_address": "00:00:00:00:00:01", "device_batteryLevelLeft": "0%",
                 "device_batteryLevelRight": 74, "device_batteryLevelCase": "110%", "device_minorType": "Headphones"}},
                {"Keyboard": {"device_address": "00-00-00-00-00-02", "device_batteryLevelMain": "52%"}}
            ],
            "device_not_connected": [{"Spare": {"device_batteryLevelMain": "100%"}}]
        }]}
        """.utf8)

        let devices = try XCTUnwrap(BluetoothStatusReader.parseReport(report))
        XCTAssertEqual(devices.map(\.name), ["Headphones", "Keyboard"])
        XCTAssertEqual(devices[0].leftBattery, 0)
        XCTAssertEqual(devices[0].rightBattery, 74)
        XCTAssertNil(devices[0].caseBattery)
        XCTAssertEqual(devices[1].battery, 52)
        XCTAssertNil(BluetoothStatusReader.parseReport(Data("{}".utf8)))
    }
}
