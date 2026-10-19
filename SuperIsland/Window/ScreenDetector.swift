import AppKit

enum ScreenDetector {
    struct CompactIslandMetrics {
        let size: CGSize
        let bottomCornerRadius: CGFloat
    }

    /// Check if the given screen has a notch (MacBook Pro 14"/16" etc.)
    static func hasNotch(screen: NSScreen) -> Bool {
        if #available(macOS 12.0, *) {
            guard let _ = screen.auxiliaryTopLeftArea,
                  let _ = screen.auxiliaryTopRightArea else {
                return false
            }
            return true
        }
        return false
    }

    /// Get the notch rectangle area for positioning
    static func notchRect(screen: NSScreen) -> NSRect? {
        if #available(macOS 12.0, *) {
            guard let topLeft = screen.auxiliaryTopLeftArea,
                  let topRight = screen.auxiliaryTopRightArea else {
                return nil
            }

            let screenFrame = screen.frame
            // The notch is between the two auxiliary areas
            let notchX = screenFrame.origin.x + topLeft.width
            let notchWidth = screenFrame.width - topLeft.width - topRight.width
            let notchY = screenFrame.maxY - max(topLeft.height, topRight.height)
            let notchHeight = max(topLeft.height, topRight.height)

            return NSRect(x: notchX, y: notchY, width: notchWidth, height: notchHeight)
        }
        return nil
    }

    static func compactIslandMetrics(screen: NSScreen) -> CompactIslandMetrics? {
        guard let notch = notchRect(screen: screen) else {
            return nil
        }

        let width = max(
            Constants.compactNotchMinimumWidth,
            notch.width - (Constants.compactNotchHorizontalInset * 2)
        )
        let height = max(
            Constants.compactNotchMinimumHeight,
            notch.height - Constants.compactNotchHeightInset
        )
        let bottomCornerRadius = min(Constants.compactNotchBottomCornerRadius, height / 2)

        return CompactIslandMetrics(
            size: CGSize(width: width, height: height),
            bottomCornerRadius: bottomCornerRadius
        )
    }

    /// Get the screen that the mouse cursor is currently on
    static var activeScreen: NSScreen? {
        let mouseLocation = NSEvent.mouseLocation
        return NSScreen.screens.first { screen in
            screen.frame.contains(mouseLocation)
        }
    }

    /// Get the primary screen
    static var primaryScreen: NSScreen? {
        // NSScreen.main follows the key window and changes as apps gain focus.
        // The first connected screen contains the menu bar and is stable.
        NSScreen.screens.first
    }

    /// A display UUID survives reconnects/relaunches, unlike a transient display ID.
    static func displayIDString(for screen: NSScreen) -> String? {
        let key = NSDeviceDescriptionKey("NSScreenNumber")
        guard let number = screen.deviceDescription[key] as? NSNumber else {
            return nil
        }
        let displayID = number.uint32Value
        if let uuid = CGDisplayCreateUUIDFromDisplayID(displayID)?.takeRetainedValue() {
            return "uuid:" + (CFUUIDCreateString(nil, uuid) as String)
        }
        return String(displayID)
    }

    /// Find a screen by the identifier produced by `displayIDString`.
    static func screen(withIDString id: String) -> NSScreen? {
        guard !id.isEmpty else { return nil }
        return NSScreen.screens.first {
            if displayIDString(for: $0) == id { return true }
            // Read older saved numeric IDs and migrate them when connected.
            let number = $0.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber
            return number.map { String($0.uint32Value) == id } ?? false
        }
    }

    /// Sentinel id for the "show on every connected display" mode.
    static let allDisplaysIdentifier = "all"

    /// Human-readable list of the connected screens for the display picker.
    /// An empty choice uses the fixed menu-bar display, never the cursor screen.
    struct ScreenOption: Identifiable, Hashable {
        let id: String           // "" for primary, "all" for every display, otherwise display UUID
        let name: String
    }

    static func availableScreenOptions() -> [ScreenOption] {
        var options: [ScreenOption] = [ScreenOption(id: "", name: "主显示器（固定）"),
                                      ScreenOption(id: allDisplaysIdentifier, name: "所有显示器")]
        for screen in NSScreen.screens {
            guard let id = displayIDString(for: screen) else { continue }
            let name: String
            if #available(macOS 14.0, *), !screen.localizedName.isEmpty {
                name = screen.localizedName
            } else {
                let size = screen.frame.size
                name = "Display (\(Int(size.width))×\(Int(size.height)))"
            }
            let suffix = hasNotch(screen: screen) ? " — notch" : ""
            options.append(ScreenOption(id: id, name: name + suffix))
        }
        return options
    }
}
