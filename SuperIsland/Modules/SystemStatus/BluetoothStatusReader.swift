import Foundation
import IOKit

enum BluetoothStatusReader {
    struct Device: Identifiable, Sendable {
        let id: String
        let name: String
        let icon: String
        let battery: Int?
        let leftBattery: Int?
        let rightBattery: Int?
        let caseBattery: Int?
    }

    private struct HIDBattery {
        let name: String
        let level: Int
    }

    static func connectedDevices() -> [Device]? {
        let hid = hidBatteries()
        if let report = systemReport(), let devices = parseReport(report, hid: hid) {
            return devices
        }
        return hid.isEmpty ? nil : sorted(hid.map { hidDevice(id: $0.key, battery: $0.value) })
    }

    static func parseReport(_ data: Data) -> [Device]? {
        parseReport(data, hid: [:])
    }

    private static func parseReport(_ data: Data, hid: [String: HIDBattery]) -> [Device]? {
        guard let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let controllers = root["SPBluetoothDataType"] as? [[String: Any]],
              !controllers.isEmpty else { return nil }
        var devices: [String: Device] = [:]
        for controller in controllers {
            let connected = controller["device_connected"] as? [[String: [String: Any]]] ?? []
            for entry in connected {
                for (name, info) in entry {
                    let address = normalizedAddress(info["device_address"] as? String)
                    let id = address ?? name
                    let main = percent(info["device_batteryLevelMain"]) ?? percent(info["device_batteryLevel"])
                    devices[id] = Device(
                        id: id, name: name, icon: icon(for: name, type: info["device_minorType"] as? String),
                        battery: main ?? hid[id]?.level,
                        leftBattery: percent(info["device_batteryLevelLeft"]),
                        rightBattery: percent(info["device_batteryLevelRight"]),
                        caseBattery: percent(info["device_batteryLevelCase"])
                    )
                }
            }
        }
        for (address, reading) in hid where devices[address] == nil {
            devices[address] = hidDevice(id: address, battery: reading)
        }
        return sorted(Array(devices.values))
    }

    private static func systemReport() -> Data? {
        let process = Process()
        let pipe = Pipe()
        process.executableURL = URL(fileURLWithPath: "/usr/sbin/system_profiler")
        process.arguments = ["SPBluetoothDataType", "-json", "-detailLevel", "basic", "-timeout", "5"]
        process.standardOutput = pipe
        process.standardError = FileHandle.nullDevice
        do { try process.run() } catch { return nil }
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        process.waitUntilExit()
        return process.terminationStatus == 0 ? data : nil
    }

    private static func hidBatteries() -> [String: HIDBattery] {
        guard let matching = IOServiceMatching("AppleDeviceManagementHIDEventService") else { return [:] }
        var iterator: io_iterator_t = 0
        guard IOServiceGetMatchingServices(kIOMainPortDefault, matching, &iterator) == KERN_SUCCESS else { return [:] }
        defer { IOObjectRelease(iterator) }

        var result: [String: HIDBattery] = [:]
        while case let service = IOIteratorNext(iterator), service != 0 {
            defer { IOObjectRelease(service) }
            guard (property(service, "Transport") as? String)?.lowercased() == "bluetooth",
                  let address = normalizedAddress(property(service, "DeviceAddress") as? String),
                  let level = percent(property(service, "BatteryPercent")),
                  let name = property(service, "Product") as? String, !name.isEmpty else { continue }
            result[address] = HIDBattery(name: name, level: level)
        }
        return result
    }

    private static func property(_ service: io_service_t, _ key: String) -> Any? {
        IORegistryEntryCreateCFProperty(service, key as CFString, kCFAllocatorDefault, 0)?.takeRetainedValue()
    }

    private static func normalizedAddress(_ address: String?) -> String? {
        guard let address else { return nil }
        let hex = address.replacingOccurrences(of: ":", with: "").replacingOccurrences(of: "-", with: "")
        guard hex.count == 12, hex.allSatisfy(\.isHexDigit) else { return nil }
        return hex.uppercased()
    }

    private static func percent(_ value: Any?) -> Int? {
        let number = value as? Int ?? (value as? String).flatMap {
            Int($0.trimmingCharacters(in: .whitespacesAndNewlines)
                .trimmingCharacters(in: CharacterSet(charactersIn: "%")))
        }
        guard let number, (0...100).contains(number) else { return nil }
        return number
    }

    private static func hidDevice(id: String, battery: HIDBattery) -> Device {
        Device(id: id, name: battery.name, icon: icon(for: battery.name, type: nil), battery: battery.level,
               leftBattery: nil, rightBattery: nil, caseBattery: nil)
    }

    private static func sorted(_ devices: [Device]) -> [Device] {
        devices.sorted { $0.name.localizedStandardCompare($1.name) == .orderedAscending }
    }

    private static func icon(for name: String, type: String?) -> String {
        let name = name.lowercased()
        let type = (type ?? "").lowercased()
        if name.contains("airpod") { return "airpods" }
        if name.contains("trackpad") || type.contains("trackpad") { return "rectangle.and.hand.point.up.left" }
        if name.contains("keyboard") || type.contains("keyboard") { return "keyboard" }
        if name.contains("mouse") || type.contains("mouse") { return "magicmouse" }
        if type.contains("head") || name.contains("headphone") || name.contains("beats") { return "headphones" }
        if type.contains("speaker") || name.contains("speaker") { return "hifispeaker" }
        return "wave.3.right.circle"
    }
}
