import CoreAudio

enum AudioPCMDecoder {
    /// Supports interleaved and planar linear PCM without assuming Float32.
    static func monoSamples(_ input: UnsafePointer<AudioBufferList>, format: AudioStreamBasicDescription) -> [Float]? {
        guard format.mFormatID == kAudioFormatLinearPCM, format.mSampleRate > 0 else { return nil }
        let isFloat = format.mFormatFlags & kAudioFormatFlagIsFloat != 0
        let signed = format.mFormatFlags & kAudioFormatFlagIsSignedInteger != 0
        let bytes = Int(format.mBitsPerChannel / 8)
        guard (isFloat && (bytes == 4 || bytes == 8)) || (signed && (bytes == 2 || bytes == 4)),
              format.mFormatFlags & kAudioFormatFlagIsBigEndian == 0 else { return nil }
        var mono: [Float] = []
        var channels = 0
        for buffer in UnsafeMutableAudioBufferListPointer(UnsafeMutablePointer(mutating: input)) {
            guard let data = buffer.mData else { continue }
            let count = max(1, Int(buffer.mNumberChannels))
            let frames = Int(buffer.mDataByteSize) / bytes / count
            guard frames > 0 else { continue }
            if mono.isEmpty { mono = Array(repeating: 0, count: frames) }
            for frame in 0..<min(frames, mono.count) {
                for channel in 0..<count {
                    let index = frame * count + channel
                    let value: Float
                    if isFloat && bytes == 4 { value = data.assumingMemoryBound(to: Float.self)[index] }
                    else if isFloat { value = Float(data.assumingMemoryBound(to: Double.self)[index]) }
                    else if bytes == 2 { value = Float(data.assumingMemoryBound(to: Int16.self)[index]) / 32768 }
                    else { value = Float(data.assumingMemoryBound(to: Int32.self)[index]) / 2147483648 }
                    mono[frame] += value.isFinite ? value : 0
                }
            }
            channels += count
        }
        guard channels > 0 else { return nil }
        return mono.map { $0 / Float(channels) }
    }
}
