import AppKit
import CoreAudio

protocol AudioSpectrumCaptureSession: AnyObject {
    func stop()
}

/// A private, unmuted tap of only the Now Playing application's output.
/// Uses system-audio permission; no display or microphone stream is opened.
@available(macOS 14.2, *)
final class AudioProcessTapCapture: AudioSpectrumCaptureSession {
    private var tapID = AudioObjectID(kAudioObjectUnknown)
    private var deviceID = AudioObjectID(kAudioObjectUnknown)
    private var ioProc: AudioDeviceIOProcID?
    private let queue = DispatchQueue(label: "superisland.audio-process-tap", qos: .userInitiated)
    private let analyzer = AudioSpectrumAnalyzer()
    private var lastEmission = Date.distantPast

    func start(bundleIdentifier: String, onBands: @escaping ([Float]) -> Void) throws {
        let processes = try Self.processes(for: bundleIdentifier)
        guard !processes.isEmpty else { throw CaptureError(stage: "找不到播放器音频进程", code: 0) }
        let description = CATapDescription(stereoMixdownOfProcesses: processes)
        description.name = "SuperIsland 播放器频谱"
        description.isPrivate = true
        description.muteBehavior = .unmuted
        do {
            try check(AudioHardwareCreateProcessTap(description, &tapID), "创建音频采集")
            var format = AudioStreamBasicDescription()
            var address = Self.address(kAudioTapPropertyFormat)
            var size = UInt32(MemoryLayout<AudioStreamBasicDescription>.size)
            try check(AudioObjectGetPropertyData(tapID, &address, 0, nil, &size, &format), "读取音频格式")
            let captureFormat = format
            let composition: [String: Any] = [
                kAudioAggregateDeviceNameKey: "SuperIsland 私有音频输入",
                kAudioAggregateDeviceUIDKey: UUID().uuidString,
                kAudioAggregateDeviceIsPrivateKey: true,
                kAudioAggregateDeviceTapAutoStartKey: true,
                kAudioAggregateDeviceTapListKey: [[
                    kAudioSubTapUIDKey: description.uuid.uuidString,
                    kAudioSubTapDriftCompensationKey: true
                ]]
            ]
            try check(AudioHardwareCreateAggregateDevice(composition as CFDictionary, &deviceID), "连接音频输入")
            try check(AudioDeviceCreateIOProcIDWithBlock(&ioProc, deviceID, queue) { [weak self] _, input, _, _, _ in
                guard let self,
                      let mono = AudioPCMDecoder.monoSamples(input, format: captureFormat),
                      let bands = self.analyzer.consume(mono, sampleRate: captureFormat.mSampleRate),
                      Date().timeIntervalSince(self.lastEmission) >= 0.045 else { return }
                self.lastEmission = Date()
                onBands(bands)
            }, "订阅播放器音频")
            try check(AudioDeviceStart(deviceID, ioProc), "启动播放器音频")
        } catch {
            stop()
            throw error
        }
    }

    func stop() {
        if let ioProc {
            AudioDeviceStop(deviceID, ioProc)
            AudioDeviceDestroyIOProcID(deviceID, ioProc)
        }
        ioProc = nil
        if deviceID != kAudioObjectUnknown { AudioHardwareDestroyAggregateDevice(deviceID) }
        if tapID != kAudioObjectUnknown { AudioHardwareDestroyProcessTap(tapID) }
        deviceID = AudioObjectID(kAudioObjectUnknown)
        tapID = AudioObjectID(kAudioObjectUnknown)
    }

    private static func processes(for bundleIdentifier: String) throws -> [AudioObjectID] {
        guard !bundleIdentifier.isEmpty else { return [] }
        var address = address(kAudioHardwarePropertyProcessObjectList)
        var size: UInt32 = 0
        try check(AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &size), "查找音频进程")
        var objects = [AudioObjectID](repeating: 0, count: Int(size) / MemoryLayout<AudioObjectID>.size)
        guard !objects.isEmpty else { return [] }
        try objects.withUnsafeMutableBytes {
            try check(AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &size, $0.baseAddress!), "读取音频进程")
        }
        return objects.filter { object in
            var property = Self.address(kAudioProcessPropertyBundleID)
            var value: CFString = "" as CFString
            var valueSize = UInt32(MemoryLayout<CFString>.size)
            let result = withUnsafeMutablePointer(to: &value) {
                AudioObjectGetPropertyData(object, &property, 0, nil, &valueSize, $0)
            }
            guard result == noErr else { return false }
            let identifier = value as String
            return identifier == bundleIdentifier || identifier.hasPrefix(bundleIdentifier + ".")
        }
    }

    private static func address(_ selector: AudioObjectPropertySelector) -> AudioObjectPropertyAddress {
        AudioObjectPropertyAddress(mSelector: selector, mScope: kAudioObjectPropertyScopeGlobal,
                                   mElement: kAudioObjectPropertyElementMain)
    }

    private static func check(_ status: OSStatus, _ stage: String) throws {
        guard status == noErr else { throw CaptureError(stage: stage, code: status) }
    }

    private func check(_ status: OSStatus, _ stage: String) throws { try Self.check(status, stage) }

    struct CaptureError: LocalizedError {
        let stage: String
        let code: OSStatus
        var errorDescription: String? { code == 0 ? stage : "\(stage)失败（\(code)）" }
    }

    deinit { stop() }
}
