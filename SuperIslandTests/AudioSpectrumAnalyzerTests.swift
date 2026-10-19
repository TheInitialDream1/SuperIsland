import XCTest
@testable import SuperIsland

final class AudioSpectrumAnalyzerTests: XCTestCase {
    private func tone(frequency: Double, amplitude: Float = 0.5) -> [Float] {
        (0..<2048).map { amplitude * Float(sin(2 * .pi * frequency * Double($0) / 48000)) }
    }

    func testSilenceDoesNotAnimate() throws {
        let analyzer = AudioSpectrumAnalyzer()
        let levels = try XCTUnwrap(analyzer.consume(Array(repeating: 0, count: 2048), sampleRate: 48000))
        XCTAssertEqual(levels, Array(repeating: 0, count: AudioSpectrumAnalyzer.bandCount))
    }

    func testLowAndHighTonesDriveDifferentBands() throws {
        let low = try XCTUnwrap(AudioSpectrumAnalyzer().consume(tone(frequency: 220), sampleRate: 48000))
        let high = try XCTUnwrap(AudioSpectrumAnalyzer().consume(tone(frequency: 4000), sampleRate: 48000))
        let lowPeak = try XCTUnwrap(low.indices.max { low[$0] < low[$1] })
        let highPeak = try XCTUnwrap(high.indices.max { high[$0] < high[$1] })
        XCTAssertGreaterThan(highPeak, lowPeak + 8)
        XCTAssertGreaterThan(low[lowPeak], 0.4)
    }

    func testAmplitudeAndSilentDecay() throws {
        let analyzer = AudioSpectrumAnalyzer()
        let quiet = try XCTUnwrap(AudioSpectrumAnalyzer().consume(tone(frequency: 1000, amplitude: 0.01), sampleRate: 48000))
        let loud = try XCTUnwrap(analyzer.consume(tone(frequency: 1000), sampleRate: 48000))
        XCTAssertGreaterThan(loud.max()!, quiet.max()!)
        var faded = loud
        for _ in 0..<24 { faded = try XCTUnwrap(analyzer.consume(Array(repeating: 0, count: 2048), sampleRate: 48000)) }
        XCTAssertEqual(faded, Array(repeating: 0, count: AudioSpectrumAnalyzer.bandCount))
    }
}
