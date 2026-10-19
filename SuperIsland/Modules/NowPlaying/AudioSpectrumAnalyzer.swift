import Accelerate
import Foundation

/// Consumes real PCM samples. No elapsed-time animation or random values.
final class AudioSpectrumAnalyzer {
    static let bandCount = 24
    private let size = 2048
    private var samples: [Float] = []
    private var levels = [Float](repeating: 0, count: bandCount)
    private let setup: OpaquePointer?

    init() {
        setup = vDSP_DFT_zop_CreateSetup(nil, vDSP_Length(size), .FORWARD)
    }

    deinit { if let setup { vDSP_DFT_DestroySetup(setup) } }

    func consume(_ input: [Float], sampleRate: Double) -> [Float]? {
        samples.append(contentsOf: input)
        guard samples.count >= size, sampleRate > 0, let setup else { return nil }
        let window = Array(samples.suffix(size))
        samples.removeAll(keepingCapacity: true)
        var real = [Float](repeating: 0, count: size)
        let imaginary = [Float](repeating: 0, count: size)
        var outReal = real, outImaginary = real
        for index in 0..<size {
            real[index] = window[index] * Float(0.5 - 0.5 * cos(2 * .pi * Double(index) / Double(size - 1)))
        }
        vDSP_DFT_Execute(setup, real, imaginary, &outReal, &outImaginary)
        for band in 0..<Self.bandCount {
            let low = 60 * pow(220.0, Double(band) / Double(Self.bandCount))
            let high = 60 * pow(220.0, Double(band + 1) / Double(Self.bandCount))
            let first = max(1, Int(low * Double(size) / sampleRate))
            let last = min(size / 2 - 1, max(first, Int(high * Double(size) / sampleRate)))
            var peak: Float = 0
            if first <= last {
                for bin in first...last {
                    let magnitude = hypot(outReal[bin], outImaginary[bin]) * 4 / Float(size)
                    peak = max(peak, magnitude)
                }
            }
            let decibels = 20 * log10(max(peak, 0.000001))
            let target = min(1, max(0, (decibels + 66) / 60))
            let smoothing: Float = target > levels[band] ? 0.72 : 0.28
            levels[band] += (target - levels[band]) * smoothing
            if levels[band] < 0.002 { levels[band] = 0 }
        }
        return levels
    }
}
