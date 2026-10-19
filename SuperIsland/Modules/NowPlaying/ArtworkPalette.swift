import AppKit
import SwiftUI

struct ArtworkTone: Equatable {
    let red: Double
    let green: Double
    let blue: Double

    init(_ color: NSColor) {
        let rgb = color.usingColorSpace(.sRGB) ?? .darkGray
        red = Double(rgb.redComponent)
        green = Double(rgb.greenComponent)
        blue = Double(rgb.blueComponent)
    }

    var color: Color { Color(red: red, green: green, blue: blue) }
    var nsColor: NSColor { NSColor(red: red, green: green, blue: blue, alpha: 1) }
}

struct ArtworkPalette: Equatable {
    let primary: ArtworkTone
    let secondary: ArtworkTone
    let accent: ArtworkTone

    static let fallback = ArtworkPalette(
        primary: ArtworkTone(NSColor(srgbRed: 0.24, green: 0.42, blue: 0.65, alpha: 1)),
        secondary: ArtworkTone(NSColor(srgbRed: 0.14, green: 0.58, blue: 0.55, alpha: 1)),
        accent: ArtworkTone(NSColor(srgbRed: 0.73, green: 0.91, blue: 0.91, alpha: 1))
    )

    /// Small hue clusters preserve the cover's dominant colors; a plain average
    /// tends to turn a colorful cover with white text into muddy gray.
    static func extract(from image: CGImage) -> ArtworkPalette {
        let size = 32
        var pixels = [UInt8](repeating: 0, count: size * size * 4)
        let rendered = pixels.withUnsafeMutableBytes { buffer -> Bool in
            guard let context = CGContext(data: buffer.baseAddress, width: size, height: size,
                                          bitsPerComponent: 8, bytesPerRow: size * 4,
                                          space: CGColorSpaceCreateDeviceRGB(),
                                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return false }
            context.draw(image, in: CGRect(x: 0, y: 0, width: size, height: size))
            return true
        }
        guard rendered else { return .fallback }
        struct Cluster {
            var weight = 0.0
            var red = 0.0
            var green = 0.0
            var blue = 0.0
            var color: NSColor { NSColor(srgbRed: red / weight, green: green / weight, blue: blue / weight, alpha: 1) }
        }
        var clusters: [Int: Cluster] = [:]
        var average = Cluster()
        for index in stride(from: 0, to: pixels.count, by: 4) {
            let alpha = Double(pixels[index + 3]) / 255
            guard alpha > 0.5 else { continue }
            let red = min(1, Double(pixels[index]) / 255 / alpha)
            let green = min(1, Double(pixels[index + 1]) / 255 / alpha)
            let blue = min(1, Double(pixels[index + 2]) / 255 / alpha)
            let color = NSColor(srgbRed: red, green: green, blue: blue, alpha: 1)
            var hue: CGFloat = 0, saturation: CGFloat = 0, brightness: CGFloat = 0, a: CGFloat = 0
            color.getHue(&hue, saturation: &saturation, brightness: &brightness, alpha: &a)
            average.weight += 1; average.red += red; average.green += green; average.blue += blue
            guard saturation > 0.16, brightness > 0.12, brightness < 0.98 else { continue }
            let key = Int(hue * 24) % 24
            let weight = 0.25 + Double(saturation) * Double(brightness)
            var cluster = clusters[key] ?? Cluster()
            cluster.weight += weight
            cluster.red += red * weight; cluster.green += green * weight; cluster.blue += blue * weight
            clusters[key] = cluster
        }
        guard average.weight > 0 else { return .fallback }
        let ranked = clusters.sorted { $0.value.weight > $1.value.weight }
        let source = ranked.first?.value.color ?? average.color
        var hue: CGFloat = 0, saturation: CGFloat = 0, brightness: CGFloat = 0, alpha: CGFloat = 0
        source.getHue(&hue, saturation: &saturation, brightness: &brightness, alpha: &alpha)
        var secondaryHue = (hue + 0.065).truncatingRemainder(dividingBy: 1)
        if let dominant = ranked.first,
           let second = ranked.dropFirst().first(where: {
               let distance = abs($0.key - dominant.key)
               return min(distance, 24 - distance) >= 3 && $0.value.weight > dominant.value.weight * 0.25
           }) {
            secondaryHue = CGFloat(second.key) / 24
        }
        let muted = saturation < 0.16
        // Yellow-green foliage otherwise becomes a desaturated olive wash.
        // Keep its green family while giving colored covers a vivid surface.
        let primaryHue = !muted && hue > 0.18 && hue < 0.28 ? hue + 0.055 : hue
        let baseSaturation = muted ? saturation : min(max(saturation * 1.15, 0.64), 0.78)
        let baseBrightness = muted ? min(max(brightness, 0.38), 0.6)
            : min(max(brightness * 0.15 + 0.55, 0.64), 0.72)
        return ArtworkPalette(
            primary: ArtworkTone(NSColor(hue: primaryHue, saturation: baseSaturation, brightness: baseBrightness, alpha: 1)),
            secondary: ArtworkTone(NSColor(hue: secondaryHue, saturation: baseSaturation * 0.94, brightness: baseBrightness * 0.98, alpha: 1)),
            accent: ArtworkTone(NSColor(hue: (primaryHue + 0.015).truncatingRemainder(dividingBy: 1), saturation: muted ? 0.05 : 0.7, brightness: 1, alpha: 1))
        )
    }
}
