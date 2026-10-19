import Foundation

/// Reuse the working media adapter for reads AND controls. The app's direct
/// private-framework symbols may exist while macOS refuses their commands.
final class MediaRemoteAdapterClient: @unchecked Sendable {
    static let shared = MediaRemoteAdapterClient()
    private let queue = DispatchQueue(label: "superisland.media-adapter", qos: .userInitiated)

    private final class CancellationFlag: @unchecked Sendable {
        private let lock = NSLock()
        private var cancelled = false
        func cancel() { lock.lock(); cancelled = true; lock.unlock() }
        var isCancelled: Bool { lock.lock(); defer { lock.unlock() }; return cancelled }
    }

    func run(scriptURL: URL, frameworkURL: URL, arguments: [String]) async -> Data? {
        guard !Task.isCancelled else { return nil }
        let cancellation = CancellationFlag()
        return await withTaskCancellationHandler(operation: {
          await withCheckedContinuation { continuation in
            queue.async {
                // Rapid keyboard seeks can supersede commands still queued
                // behind a snapshot read. Never execute an obsolete command.
                guard !cancellation.isCancelled else {
                    continuation.resume(returning: nil)
                    return
                }
                let process = Process()
                let output = Pipe()
                process.executableURL = URL(fileURLWithPath: "/usr/bin/perl")
                process.arguments = [scriptURL.path, frameworkURL.path] + arguments
                process.standardOutput = output
                process.standardError = FileHandle.nullDevice
                do { try process.run() } catch {
                    continuation.resume(returning: nil)
                    return
                }
                let timeout = DispatchWorkItem {
                    if process.isRunning { process.terminate() }
                }
                DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + 3, execute: timeout)
                let data = output.fileHandleForReading.readDataToEndOfFile()
                process.waitUntilExit()
                timeout.cancel()
                continuation.resume(returning: process.terminationStatus == 0 ? data : nil)
            }
          }
        }, onCancel: { cancellation.cancel() })
    }
}
