import Darwin
import Foundation
import IOKit.ps

struct SystemStatusReader {
    struct CPUTicks: Equatable {
        let user: UInt32
        let system: UInt32
        let idle: UInt32
        let nice: UInt32

        func load(since previous: Self) -> Double? {
            let busy = UInt64(user &- previous.user) + UInt64(system &- previous.system)
                + UInt64(nice &- previous.nice)
            let total = busy + UInt64(idle &- previous.idle)
            return total > 0 ? Double(busy) / Double(total) : nil
        }
    }

    struct Capacity {
        let used: Int64
        let total: Int64
        var fraction: Double { Double(used) / Double(total) }
        var available: Int64 { total - used }
    }

    struct Memory {
        let capacity: Capacity
        let compressed: Int64
        let swapUsed: Int64?
    }

    struct Power {
        let externalPower: Bool
        let batteryLevel: Int?
        let charging: Bool
        let lowPowerMode: Bool
        let thermalState: ProcessInfo.ThermalState
    }

    static func cpuTicks() -> CPUTicks? {
        var data = host_cpu_load_info_data_t()
        var count = mach_msg_type_number_t(MemoryLayout.size(ofValue: data) / MemoryLayout<integer_t>.stride)
        let host = mach_host_self()
        defer { mach_port_deallocate(mach_task_self_, host) }
        let result = withUnsafeMutablePointer(to: &data) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
                host_statistics(host, HOST_CPU_LOAD_INFO, $0, &count)
            }
        }
        guard result == KERN_SUCCESS else { return nil }
        let ticks = data.cpu_ticks
        return CPUTicks(user: ticks.0, system: ticks.1, idle: ticks.2, nice: ticks.3)
    }

    static func memory() -> Memory? {
        var data = vm_statistics64_data_t()
        var count = mach_msg_type_number_t(MemoryLayout.size(ofValue: data) / MemoryLayout<integer_t>.stride)
        let host = mach_host_self()
        defer { mach_port_deallocate(mach_task_self_, host) }
        let result = withUnsafeMutablePointer(to: &data) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
                host_statistics64(host, HOST_VM_INFO64, $0, &count)
            }
        }
        guard result == KERN_SUCCESS else { return nil }

        let pageBytes = Int64(vm_kernel_page_size)
        let compressed = Int64(data.compressor_page_count) * pageBytes
        let wired = Int64(data.wire_count) * pageBytes
        let application = max(0, Int64(data.internal_page_count) - Int64(data.purgeable_count)) * pageBytes
        let total = Int64(clamping: ProcessInfo.processInfo.physicalMemory)
        guard total > 0, pageBytes > 0 else { return nil }

        return Memory(capacity: Capacity(used: min(total, application + wired + compressed), total: total),
                      compressed: compressed, swapUsed: swapUsed())
    }

    static func swapUsed() -> Int64? {
        var usage = xsw_usage()
        var size = MemoryLayout.size(ofValue: usage)
        guard sysctlbyname("vm.swapusage", &usage, &size, nil, 0) == 0,
              size == MemoryLayout.size(ofValue: usage) else { return nil }
        return Int64(clamping: usage.xsu_used)
    }

    static func disk() -> Capacity? {
        // The home directory is on the writable data volume on an ordinary macOS installation.
        let keys: Set<URLResourceKey> = [.volumeTotalCapacityKey, .volumeAvailableCapacityKey]
        guard let values = try? URL.homeDirectory.resourceValues(forKeys: keys),
              let total = values.volumeTotalCapacity, total > 0,
              let available = values.volumeAvailableCapacity, available >= 0 else { return nil }
        return Capacity(used: Int64(max(0, total - available)), total: Int64(total))
    }

    static func power() -> Power? {
        guard let snapshot = IOPSCopyPowerSourcesInfo()?.takeRetainedValue() else { return nil }
        let provider = IOPSGetProvidingPowerSourceType(snapshot)?.takeUnretainedValue() as String?
        let sources = IOPSCopyPowerSourcesList(snapshot)?.takeRetainedValue() as? [CFTypeRef] ?? []
        let internalBattery = sources.compactMap {
            IOPSGetPowerSourceDescription(snapshot, $0)?.takeUnretainedValue() as? [String: Any]
        }.first { $0[kIOPSTypeKey] as? String == kIOPSInternalBatteryType }
        let current = internalBattery?[kIOPSCurrentCapacityKey] as? Int
        let maximum = internalBattery?[kIOPSMaxCapacityKey] as? Int
        let level: Int?
        if let current, let maximum, current >= 0, maximum > 0 {
            level = Int((min(1, Double(current) / Double(maximum)) * 100).rounded())
        } else {
            level = nil
        }
        return Power(externalPower: provider == kIOPSACPowerValue, batteryLevel: level,
                     charging: internalBattery?[kIOPSIsChargingKey] as? Bool == true,
                     lowPowerMode: ProcessInfo.processInfo.isLowPowerModeEnabled,
                     thermalState: ProcessInfo.processInfo.thermalState)
    }
}
