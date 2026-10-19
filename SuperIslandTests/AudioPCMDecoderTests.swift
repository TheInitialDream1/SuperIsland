import CoreAudio
import XCTest
@testable import SuperIsland

final class AudioPCMDecoderTests: XCTestCase {
    private func decode<T>(_ values: [T], channels: UInt32, bits: UInt32, flags: UInt32) -> [Float]? {
        var copy = values
        return copy.withUnsafeMutableBytes { bytes in
            var list = AudioBufferList(mNumberBuffers: 1,
                mBuffers: AudioBuffer(mNumberChannels: channels, mDataByteSize: UInt32(bytes.count), mData: bytes.baseAddress))
            let format = AudioStreamBasicDescription(mSampleRate: 48000, mFormatID: kAudioFormatLinearPCM,
                mFormatFlags: flags, mBytesPerPacket: bits / 8 * channels, mFramesPerPacket: 1,
                mBytesPerFrame: bits / 8 * channels, mChannelsPerFrame: channels, mBitsPerChannel: bits, mReserved: 0)
            return withUnsafePointer(to: &list) { AudioPCMDecoder.monoSamples($0, format: format) }
        }
    }

    func testInterleavedStereoFloatAndInvalidSamples() throws {
        let samples: [Float] = [0.25, 0.75, -0.5, -0.5, .nan, 0]
        let mono = try XCTUnwrap(decode(samples, channels: 2, bits: 32, flags: kAudioFormatFlagIsFloat))
        XCTAssertEqual(mono, [0.5, -0.5, 0])
    }

    func testIntegerAndDoublePCMDoNotDisappear() throws {
        XCTAssertEqual(try XCTUnwrap(decode([Int16(-16384), 16384], channels: 1, bits: 16,
                                           flags: kAudioFormatFlagIsSignedInteger)), [-0.5, 0.5])
        XCTAssertEqual(try XCTUnwrap(decode([Int32(-1073741824), 1073741824], channels: 1, bits: 32,
                                           flags: kAudioFormatFlagIsSignedInteger)), [-0.5, 0.5])
        XCTAssertEqual(try XCTUnwrap(decode([Double(-0.25), 0.25], channels: 1, bits: 64,
                                           flags: kAudioFormatFlagIsFloat)), [-0.25, 0.25])
    }

    func testPlanarStereoBuffersAreCombined() throws {
        var left: [Float] = [0.2, -0.6]
        var right: [Float] = [0.6, -0.2]
        let result = left.withUnsafeMutableBytes { l in
            right.withUnsafeMutableBytes { r -> [Float]? in
                let list = AudioBufferList.allocate(maximumBuffers: 2)
                defer { list.unsafeMutablePointer.deallocate() }
                list[0] = AudioBuffer(mNumberChannels: 1, mDataByteSize: UInt32(l.count), mData: l.baseAddress)
                list[1] = AudioBuffer(mNumberChannels: 1, mDataByteSize: UInt32(r.count), mData: r.baseAddress)
                var format = AudioStreamBasicDescription()
                format.mFormatID = kAudioFormatLinearPCM; format.mSampleRate = 48000
                format.mFormatFlags = kAudioFormatFlagIsFloat | kAudioFormatFlagIsNonInterleaved
                format.mBitsPerChannel = 32; format.mChannelsPerFrame = 2
                return AudioPCMDecoder.monoSamples(list.unsafeMutablePointer, format: format)
            }
        }
        let mono = try XCTUnwrap(result)
        XCTAssertEqual(mono[0], 0.4, accuracy: 0.0001)
        XCTAssertEqual(mono[1], -0.4, accuracy: 0.0001)
    }

    func testUnsupportedFormatDoesNotInterpretArbitraryBytesAsSamples() {
        XCTAssertNil(decode([Int16(100)], channels: 1, bits: 16, flags: kAudioFormatFlagIsFloat))
        XCTAssertNil(decode([Float(0.5)], channels: 1, bits: 32,
                            flags: kAudioFormatFlagIsFloat | kAudioFormatFlagIsBigEndian))
    }
}
