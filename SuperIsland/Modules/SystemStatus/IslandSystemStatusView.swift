import SwiftUI

struct IslandSystemStatusView: View {
    @State private var cpu: Double?
    @State private var hasSampledCPU = false
    @State private var memory: SystemStatusReader.Memory?
    @State private var disk: SystemStatusReader.Capacity?
    @State private var power: SystemStatusReader.Power?
    @State private var devices: [BluetoothStatusReader.Device]?
    @State private var hasCheckedBluetooth = false

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            Text("System Status")
                .font(.system(size: 17, weight: .semibold))
                .accessibilityAddTraits(.isHeader)

            HStack(alignment: .top, spacing: 8) {
                metric("CPU", icon: "cpu", reading: "CPU In Use", value: cpu.map(percent),
                       fraction: cpu, tint: .cyan,
                       missing: hasSampledCPU ? "Unavailable" : "Sampling CPU…") {
                    detail("CPU Idle", value: cpu.map { percent(1 - $0) })
                    detail("Logical Cores", value: String(ProcessInfo.processInfo.activeProcessorCount))
                }
                metric("Memory", icon: "memorychip", reading: "Memory Used", value: memory.map { memorySize($0.capacity.used) },
                       fraction: memory?.capacity.fraction, tint: .purple) {
                    detail("Total Capacity", value: memory.map { memorySize($0.capacity.total) })
                    detail("Compressed Memory", value: memory.map { memorySize($0.compressed) })
                    detail("Swap Memory Used", value: memory?.swapUsed.map(memorySize))
                }
                metric("Disk", icon: "internaldrive", reading: "Disk Space Available", value: disk.map { size($0.available) },
                       fraction: disk.map { 1 - $0.fraction },
                       tint: (disk?.fraction ?? 0) >= 0.9 ? .orange : .mint) {
                    detail("Disk Space Used", value: disk.map { size($0.used) })
                        .help("Used space includes storage shared with other volumes.")
                    detail("Total Capacity", value: disk.map { size($0.total) })
                    detail("Disk Available Percent", value: disk.map { percent(1 - $0.fraction) })
                }
            }

            HStack(alignment: .top, spacing: 8) {
                powerCard
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .modifier(StatusCard())
                bluetoothCard
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .modifier(StatusCard())
            }
        }
        .task {
            var previous = SystemStatusReader.cpuTicks()
            var nextDiskUpdate = ContinuousClock.now
            var nextSampleDelay = Duration.milliseconds(300)
            while !Task.isCancelled {
                memory = SystemStatusReader.memory()
                power = SystemStatusReader.power()
                if ContinuousClock.now >= nextDiskUpdate {
                    disk = SystemStatusReader.disk()
                    nextDiskUpdate = ContinuousClock.now + .seconds(15)
                }
                do { try await Task.sleep(for: nextSampleDelay) } catch { return }
                guard !Task.isCancelled else { return }
                let ticks = SystemStatusReader.cpuTicks()
                if let ticks, let previous, let load = ticks.load(since: previous) { cpu = load }
                previous = ticks ?? previous
                hasSampledCPU = true
                nextSampleDelay = .seconds(1)
            }
        }
        .task {
            while !Task.isCancelled {
                let snapshot = await Task.detached(priority: .utility) {
                    BluetoothStatusReader.connectedDevices()
                }.value
                guard !Task.isCancelled else { return }
                devices = snapshot
                hasCheckedBluetooth = true
                do { try await Task.sleep(for: .seconds(20)) } catch { return }
            }
        }
    }

    private func metric(_ title: LocalizedStringKey, icon: String, reading: LocalizedStringKey,
                        value: String?, fraction: Double?, tint: Color,
                        missing: String = "Unavailable",
                        @ViewBuilder details: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Label(title, systemImage: icon)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(tint)

            VStack(alignment: .leading, spacing: 2) {
                Text(reading)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(.white.opacity(0.76))
                Text(value ?? "—")
                    .font(.system(size: 23, weight: .medium, design: .rounded).monospacedDigit())
                    .lineLimit(1)
                    .minimumScaleFactor(0.72)
                    .accessibilityLabel(value ?? L10n.string(missing))
            }

            GeometryReader { geometry in
                Capsule().fill(.white.opacity(0.12))
                if let fraction, fraction > 0 {
                    Capsule().fill(tint)
                        .frame(width: geometry.size.width * fraction)
                }
            }
            .frame(height: 5)
            .padding(.vertical, 5)
            .accessibilityHidden(true)

            VStack(spacing: 3, content: details)
                .padding(.top, 2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .frame(height: 125, alignment: .topLeading)
        .modifier(StatusCard())
        .accessibilityElement(children: .contain)
        .accessibilityLabel(title)
    }

    private func detail(_ label: LocalizedStringKey, value: String?) -> some View {
        HStack(spacing: 5) {
            Text(label)
                .foregroundStyle(.white.opacity(0.68))
            Spacer(minLength: 0)
            Text(value ?? "—")
                .fontWeight(.medium)
                .monospacedDigit()
                .accessibilityLabel(value ?? L10n.string("Unavailable"))
        }
        .font(.system(size: 11))
        .lineLimit(1)
        .minimumScaleFactor(0.8)
        .accessibilityElement(children: .combine)
    }

    private var powerCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Power and Thermal", systemImage: "bolt")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.orange)
            if let power {
                HStack(spacing: 12) {
                    if let level = power.batteryLevel {
                        BatteryRing(icon: power.charging ? "bolt.fill" : "laptopcomputer", level: level)
                            .accessibilityLabel("Mac Battery")
                    }
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 4) {
                            Text(power.externalPower ? "Connected to Power" : "Battery")
                                .fontWeight(.semibold)
                            if power.charging {
                                Text("Charging")
                                    .foregroundStyle(.white.opacity(0.67))
                            }
                        }
                        detail("Thermal State", value: thermalLabel(power.thermalState))
                        detail("Low Power Mode", value: L10n.string(power.lowPowerMode ? "On" : "Off"))
                    }
                }
                .font(.system(size: 11))
            } else {
                Text("Unavailable").foregroundStyle(.white.opacity(0.65))
            }
        }
    }

    private var bluetoothCard: some View {
        VStack(alignment: .leading, spacing: 7) {
            Label("Bluetooth Devices", systemImage: "wave.3.right.circle")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.cyan)
                .accessibilityAddTraits(.isHeader)
            if let devices, !devices.isEmpty {
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        let singleBatteryDevices = devices.filter { !hasBatteryParts($0) }
                        if !singleBatteryDevices.isEmpty {
                            LazyVGrid(columns: [GridItem(.adaptive(minimum: 73), spacing: 6)], spacing: 9) {
                                ForEach(singleBatteryDevices) { device in
                                    batteryTile(device.name, icon: device.icon, level: device.battery)
                                }
                            }
                        }
                        ForEach(devices.filter(hasBatteryParts)) { device in
                            batteryGroup(device)
                        }
                    }
                }
                .scrollBounceBehavior(.basedOnSize)
            } else {
                Group {
                    if !hasCheckedBluetooth {
                        Text("Reading Bluetooth devices…")
                    } else if devices == nil {
                        Text("Bluetooth status unavailable.")
                    } else {
                        Text("No connected Bluetooth devices.")
                    }
                }
                .font(.system(size: 11))
                .foregroundStyle(.white.opacity(0.66))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            }
        }
    }

    private func hasBatteryParts(_ device: BluetoothStatusReader.Device) -> Bool {
        device.leftBattery != nil || device.rightBattery != nil || device.caseBattery != nil
    }

    private func batteryGroup(_ device: BluetoothStatusReader.Device) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(device.name)
                .font(.system(size: 11, weight: .medium))
                .lineLimit(1)
                .help(device.name)
            HStack(alignment: .top, spacing: 5) {
                if let left = device.leftBattery {
                    batteryTile(L10n.string("Left Earbud"), icon: "airpod.left", level: left)
                }
                if let right = device.rightBattery {
                    batteryTile(L10n.string("Right Earbud"), icon: "airpod.right", level: right)
                }
                if let chargeCase = device.caseBattery {
                    batteryTile(L10n.string("Charging Case"), icon: "airpods.chargingcase", level: chargeCase)
                }
                if let level = device.battery {
                    batteryTile(L10n.string("Device Battery"), icon: device.icon, level: level)
                }
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(device.name)
    }

    private func batteryTile(_ name: String, icon: String, level: Int?) -> some View {
        VStack(spacing: 3) {
            BatteryRing(icon: icon, level: level)
            Text(name)
                .font(.system(size: 10))
                .foregroundStyle(.white.opacity(0.74))
                .lineLimit(2)
                .minimumScaleFactor(0.85)
                .truncationMode(.head)
                .multilineTextAlignment(.center)
                .help(name)
        }
        .frame(maxWidth: .infinity, alignment: .top)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(name)
        .accessibilityValue(level.map { percent(Double($0) / 100) } ?? L10n.string("Battery unavailable"))
    }

    private func percent(_ fraction: Double) -> String {
        fraction.formatted(.percent.precision(.fractionLength(0)))
    }

    private func size(_ bytes: Int64) -> String {
        ByteCountFormatter.string(fromByteCount: bytes, countStyle: .file)
    }

    private func memorySize(_ bytes: Int64) -> String {
        ByteCountFormatter.string(fromByteCount: bytes, countStyle: .memory)
    }

    private func thermalLabel(_ state: ProcessInfo.ThermalState) -> String {
        switch state {
        case .nominal: return L10n.string("Thermal Normal")
        case .fair: return L10n.string("Thermal Elevated")
        case .serious: return L10n.string("Thermal High")
        case .critical: return L10n.string("Thermal Critical")
        @unknown default: return L10n.string("Unavailable")
        }
    }
}

private struct StatusCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(10)
            .background(.white.opacity(0.065), in: RoundedRectangle(cornerRadius: 11))
            .overlay {
                RoundedRectangle(cornerRadius: 11)
                    .strokeBorder(.white.opacity(0.085), lineWidth: 1)
                    .allowsHitTesting(false)
            }
    }
}

private struct BatteryRing: View {
    let icon: String
    let level: Int?

    private var tint: Color {
        guard let level else { return .white.opacity(0.5) }
        return level <= 20 ? .orange : .green
    }

    var body: some View {
        let reading = level.map { (Double($0) / 100).formatted(.percent.precision(.fractionLength(0))) }
        VStack(spacing: 4) {
            ZStack {
                Circle().strokeBorder(.white.opacity(0.15), lineWidth: 3.5)
                if let level, level > 0 {
                    Circle()
                        .trim(from: 0, to: Double(level) / 100)
                        .stroke(tint, style: StrokeStyle(lineWidth: 3.5, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                        .padding(1.75)
                }
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.white.opacity(0.85))
            }
            .frame(width: 37, height: 37)
            Text(reading ?? L10n.string("Not Reported"))
                .font(.system(size: 11, weight: .semibold).monospacedDigit())
                .foregroundStyle(.white.opacity(level == nil ? 0.55 : 0.95))
        }
        .accessibilityElement(children: .ignore)
        .accessibilityValue(reading ?? L10n.string("Battery unavailable"))
        .help(reading ?? L10n.string("Battery unavailable"))
    }
}
