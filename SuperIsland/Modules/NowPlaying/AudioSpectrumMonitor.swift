import AppKit
import Combine
import CoreMedia
import ScreenCaptureKit

/// Only subscribes to the selected player's audio output. Uses a process tap
/// on macOS 14.2+ and an audio-only ScreenCaptureKit stream on older systems.
@MainActor
final class AudioSpectrumMonitor: NSObject, ObservableObject {
    static let shared = AudioSpectrumMonitor()
    @Published private(set) var bands = [Float](repeating: 0, count: AudioSpectrumAnalyzer.bandCount)
    @Published private(set) var status = "idle"
    @Published private(set) var detail = ""
    @Published private(set) var lastSampleAt = Date.distantPast
    @Published private(set) var isEnabled = UserDefaults.standard.bool(forKey: "nowPlaying.audioSpectrum.enabled")
    private var stream: SCStream?
    private var receiver: AudioSpectrumReceiver?
    private var processCapture: AudioSpectrumCaptureSession?
    private var requestID = UUID()
    private var source = ""
    private var visible = false
    private var playing = false
    private var owners = Set<UUID>()
    private var task: Task<Void, Never>?
    private let preferenceKey = "nowPlaying.audioSpectrum.enabled"
    private var healthTimer: Timer?
    private var startedAt = Date.distantPast
    private var lastAudibleAt = Date.distantPast
    private var retryCount = 0
    private var nextRetryAt = Date.distantPast

#if DEBUG
    private var isolatedForTesting = false
    private let testAnalyzer = AudioSpectrumAnalyzer()

    convenience init(isolatedForTesting: Bool) {
        self.init()
        self.isolatedForTesting = isolatedForTesting
        isEnabled = true
    }

    func consumePCMForTesting(_ samples: [Float], sampleRate: Double) {
        guard isolatedForTesting, visible, playing,
              let measured = testAnalyzer.consume(samples, sampleRate: sampleRate) else { return }
        bands = measured
        lastSampleAt = Date()
        status = "running"
    }
#endif

    func present(id: UUID, bundleIdentifier: String, playing: Bool) {
        owners.insert(id)
        startHealthTimer()
        update(bundleIdentifier: bundleIdentifier, playing: playing)
    }

    func dismiss(id: UUID) {
        owners.remove(id)
        guard owners.isEmpty else { return }
        visible = false
        stop()
        healthTimer?.invalidate()
        healthTimer = nil
    }

    func update(bundleIdentifier: String, playing: Bool) {
        let wasVisible = visible
        let wasPlaying = self.playing
        visible = !owners.isEmpty
        let sourceChanged = source != bundleIdentifier
        source = bundleIdentifier
        self.playing = playing
        if sourceChanged || (!wasPlaying && playing) || (!wasVisible && visible) {
            retryCount = 0
            nextRetryAt = .distantPast
        }
        guard visible, playing else { stop(); return }
#if DEBUG
        if isolatedForTesting { status = "running"; return }
#endif
        if sourceChanged { stop() }
        guard stream == nil, processCapture == nil, task == nil else { return }
        guard UserDefaults.standard.bool(forKey: preferenceKey) else {
            status = "permission"
            return
        }
        guard retryCount < 3, Date() >= nextRetryAt else { return }
        start()
    }

    func enable() {
        isEnabled = true
        UserDefaults.standard.set(true, forKey: preferenceKey)
        if #unavailable(macOS 14.2) {
            guard CGPreflightScreenCaptureAccess() || CGRequestScreenCaptureAccess() else {
                status = "permission"
                return
            }
        }
        retry()
    }

    func retry() {
        stop()
        retryCount = 0
        nextRetryAt = .distantPast
        update(bundleIdentifier: source, playing: playing)
    }

    private func startHealthTimer() {
        guard healthTimer == nil else { return }
        let timer = Timer(timeInterval: 1, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated { self?.checkHealth() }
        }
        timer.tolerance = 0.1
        RunLoop.main.add(timer, forMode: .common)
        healthTimer = timer
    }

    private func checkHealth() {
        guard visible, playing, isEnabled else { return }
#if DEBUG
        if isolatedForTesting { return }
#endif
        if (stream != nil || processCapture != nil), task == nil,
           Date().timeIntervalSince(max(lastSampleAt, startedAt)) > 3 {
            stop()
            status = "unavailable"
            detail = "没有收到播放器音频，请检查当前版本的系统音频录制权限后重试。"
            nextRetryAt = Date().addingTimeInterval(1)
        } else if lastSampleAt > startedAt,
                  Date().timeIntervalSince(max(lastAudibleAt, startedAt)) > 5 {
            status = "silent"
            detail = "未检测到播放器声音，请检查播放器音量、音频输出和本应用的系统音频录制权限。"
        }
        update(bundleIdentifier: source, playing: playing)
    }

    private func receive(_ measured: [Float], token: UUID) {
        guard requestID == token, visible, playing else { return }
        bands = measured
        lastSampleAt = Date()
        if (measured.max() ?? 0) > 0.01 { lastAudibleAt = lastSampleAt }
        if status != "silent" || lastAudibleAt == lastSampleAt { status = "running" }
    }

    private func start() {
        guard task == nil, stream == nil, processCapture == nil else { return }
        retryCount += 1
        let token = UUID()
        requestID = token
        let bundleIdentifier = source
        status = "starting"
        startedAt = Date()
        detail = "正在连接播放器音频"
        task = Task { [weak self] in
            guard let self else { return }
            do {
                if #available(macOS 14.2, *) {
                    let capture = AudioProcessTapCapture()
                    try capture.start(bundleIdentifier: bundleIdentifier) { [weak self] bands in
                        Task { @MainActor in self?.receive(bands, token: token) }
                    }
                    guard self.requestID == token, !Task.isCancelled else { capture.stop(); return }
                    self.processCapture = capture
                    self.task = nil
                    self.detail = "直接读取当前播放器的音频输出"
                    return
                }
                let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
                guard self.requestID == token, !Task.isCancelled else { return }
                let applications = content.applications.filter { $0.bundleIdentifier == bundleIdentifier }
                guard let display = content.displays.first, !applications.isEmpty else {
                    self.status = "unavailable"; self.detail = "找不到当前播放器的音频进程"
                    self.task = nil; self.nextRetryAt = Date().addingTimeInterval(2); return
                }
                let filter = SCContentFilter(display: display, including: applications, exceptingWindows: [])
                let configuration = SCStreamConfiguration()
                configuration.capturesAudio = true
                configuration.excludesCurrentProcessAudio = true
                configuration.sampleRate = 48000
                configuration.channelCount = 2
                configuration.width = 2
                configuration.height = 2
                configuration.minimumFrameInterval = CMTime(seconds: 1, preferredTimescale: 1)
                configuration.showsCursor = false
                let receiver = AudioSpectrumReceiver(onBands: { [weak self] bands in
                    Task { @MainActor in
                        self?.receive(bands, token: token)
                    }
                }, onFailure: { [weak self] in
                    Task { @MainActor in
                        guard let self, self.requestID == token else { return }
                        self.stop()
                        self.status = "unavailable"
                        self.detail = "音频连接中断，请重试"
                        self.nextRetryAt = Date().addingTimeInterval(1)
                    }
                })
                let stream = SCStream(filter: filter, configuration: configuration, delegate: receiver)
                try stream.addStreamOutput(receiver, type: .audio, sampleHandlerQueue: receiver.queue)
                self.receiver = receiver
                self.stream = stream
                try await stream.startCapture()
                guard self.requestID == token else {
                    try? await stream.stopCapture(); return
                }
                self.task = nil
                self.detail = "读取当前播放器的音频输出"
            } catch {
                guard self.requestID == token else { return }
                self.stream = nil; self.receiver = nil; self.task = nil
                self.status = (error as NSError).code == -3801 ? "permission" : "unavailable"
                self.detail = error.localizedDescription
                self.nextRetryAt = Date().addingTimeInterval(2)
            }
        }
    }

    private func stop() {
        requestID = UUID()
        task?.cancel(); task = nil
        if let stream { Task { try? await stream.stopCapture() } }
        processCapture?.stop()
        processCapture = nil
        stream = nil; receiver = nil
        bands = Array(repeating: 0, count: AudioSpectrumAnalyzer.bandCount)
        lastSampleAt = .distantPast
        lastAudibleAt = .distantPast
        status = "idle"
    }
}

private final class AudioSpectrumReceiver: NSObject, SCStreamOutput, SCStreamDelegate {
    let queue = DispatchQueue(label: "superisland.audio-spectrum", qos: .userInitiated)
    private let analyzer = AudioSpectrumAnalyzer()
    private let onBands: ([Float]) -> Void
    private let onFailure: () -> Void
    private var lastEmission = Date.distantPast

    init(onBands: @escaping ([Float]) -> Void, onFailure: @escaping () -> Void) {
        self.onBands = onBands
        self.onFailure = onFailure
    }

    func stream(_ stream: SCStream, didOutputSampleBuffer buffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio, buffer.isValid,
              let format = buffer.formatDescription,
              let description = CMAudioFormatDescriptionGetStreamBasicDescription(format)?.pointee,
              description.mFormatID == kAudioFormatLinearPCM else { return }
        let list = AudioBufferList.allocate(maximumBuffers: max(1, Int(description.mChannelsPerFrame)))
        defer { list.unsafeMutablePointer.deallocate() }
        var retained: CMBlockBuffer?
        let result = CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(buffer,
            bufferListSizeNeededOut: nil, bufferListOut: list.unsafeMutablePointer,
            bufferListSize: MemoryLayout<AudioBufferList>.size + (list.count - 1) * MemoryLayout<AudioBuffer>.size,
            blockBufferAllocator: kCFAllocatorDefault,
            blockBufferMemoryAllocator: kCFAllocatorDefault,
            flags: UInt32(kCMSampleBufferFlag_AudioBufferList_Assure16ByteAlignment),
            blockBufferOut: &retained)
        guard result == noErr else { return }
        defer { withExtendedLifetime(retained) {} }
        guard let mono = AudioPCMDecoder.monoSamples(list.unsafeMutablePointer, format: description),
              let bands = analyzer.consume(mono, sampleRate: description.mSampleRate),
              Date().timeIntervalSince(lastEmission) >= 0.045 else { return }
        lastEmission = Date()
        onBands(bands)
    }

    func stream(_ stream: SCStream, didStopWithError error: Error) {
        onFailure()
    }
}
