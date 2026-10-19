import AppKit
import EventKit
import JavaScriptCore
import SwiftUI

// The gallery never initializes or sends analytics.
enum Analytics {
    static func start() {}
    static func track(_ event: String, properties: [String: Any]? = nil) {}
}

@MainActor
func capture<V: View>(_ view: V, name: String, width: CGFloat = 720,
                      height: CGFloat = 284, in folder: URL) throws {
    let root = view.environmentObject(AppState.shared)
        .environment(\.colorScheme, .dark)
        .frame(width: width, height: height)
        .background(Color.black)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    let host = NSHostingView(rootView: root)
    host.appearance = NSAppearance(named: .darkAqua)
    host.frame = NSRect(x: 0, y: 0, width: width, height: height)
    host.layoutSubtreeIfNeeded()
    let bitmap = host.bitmapImageRepForCachingDisplay(in: host.bounds)!
    host.cacheDisplay(in: host.bounds, to: bitmap)
    try bitmap.representation(using: .png, properties: [:])!
        .write(to: folder.appendingPathComponent(name + ".png"))
    print("Rendered \(name)")
}

@MainActor
func panel<V: View>(_ view: V, name: String, module: ModuleType? = nil, in folder: URL) throws {
    if let module { AppState.shared.activeModule = .builtIn(module) }
    try capture(view.padding(.horizontal, 28).padding(.vertical, 22), name: name, in: folder)
}

@main
struct Gallery {
    @MainActor static func main() throws {
        _ = NSApplication.shared
        let folder = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        // A separate bundle keeps fixture preferences apart from the real app.
        UserDefaults.standard.set(["zh-Hans"], forKey: "AppleLanguages")
        let state = AppState.shared
        state.currentState = .fullExpanded

        let cover = NSImage(size: NSSize(width: 300, height: 300))
        cover.lockFocus()
        NSGradient(starting: NSColor(srgbRed: 0.08, green: 0.28, blue: 0.38, alpha: 1),
                   ending: NSColor(srgbRed: 0.18, green: 0.66, blue: 0.52, alpha: 1))!
            .draw(in: NSRect(x: 0, y: 0, width: 300, height: 300), angle: 45)
        NSColor(srgbRed: 0.94, green: 0.84, blue: 0.51, alpha: 1).setFill()
        NSBezierPath(ovalIn: NSRect(x: 80, y: 90, width: 140, height: 140)).fill()
        NSColor(srgbRed: 0.06, green: 0.24, blue: 0.30, alpha: 1).setFill()
        let mountains = NSBezierPath()
        mountains.move(to: NSPoint(x: 0, y: 0)); mountains.line(to: NSPoint(x: 0, y: 80))
        mountains.line(to: NSPoint(x: 100, y: 150)); mountains.line(to: NSPoint(x: 200, y: 50))
        mountains.line(to: NSPoint(x: 300, y: 115)); mountains.line(to: NSPoint(x: 300, y: 0))
        mountains.close(); mountains.fill(); cover.unlockFocus()
        let player = NowPlayingManager.shared
        player.title = "向光而行"; player.artist = "SuperIsland"; player.album = "岛屿来信"
        player.duration = 240; player.elapsedTime = 18.2; player.isPlaying = false
        player.albumArt = cover
        let palette = ArtworkPalette(
            primary: ArtworkTone(NSColor(srgbRed: 0.10, green: 0.48, blue: 0.40, alpha: 1)),
            secondary: ArtworkTone(NSColor(srgbRed: 0.16, green: 0.48, blue: 0.65, alpha: 1)),
            accent: ArtworkTone(NSColor(srgbRed: 0.95, green: 0.82, blue: 0.40, alpha: 1)))
        let sentences = ["晨风轻轻越过山岗", "把远方写进每扇窗", "我们沿着微光启航",
                         "让每个平凡时刻闪亮", "把心愿收藏在岛上", "下一站仍有新的光"]
        let lines = sentences.enumerated().map { index, text in
            let start = Double(index * 8)
            let words = Array(text).enumerated().map { offset, character in
                SyncedLyricWord(time: start + Double(offset) * 0.8,
                                endTime: start + Double(offset + 1) * 0.8,
                                text: String(character))
            }
            return SyncedLyricLine(time: start, text: text, words: words)
        }
        let content = NowPlayingLyricsContent(lines: lines, status: "synced", canCalibrate: true,
                                              trackTitle: player.title, trackArtist: player.artist)
        let spectrum = AudioSpectrumMonitor(isolatedForTesting: true)
        for compact in [false, true] {
            let width: CGFloat = compact ? 400 : 720, height: CGFloat = compact ? 180 : 240
            for style in NativeLyricStyle.allCases {
                UserDefaults.standard.set(style.rawValue, forKey: "lyrics.nativeVisualStyle")
                let settings = AnyView(Image(systemName: "slider.horizontal.3")
                    .foregroundStyle(.white.opacity(0.8)).frame(width: 32, height: 32))
                let view = Group {
                    if style == .standard {
                        NowPlayingLyricsView(content: content, player: player, spectrum: spectrum)
                            .environment(\.lyricsUsesIslandBackground, true)
                    } else {
                        NativeLyricsScene(content: content, style: style, player: player, spectrum: spectrum,
                                          position: 18.2, date: Date(timeIntervalSince1970: 1000), compact: compact,
                                          reduceMotion: true, settings: settings, onRetry: {}, keepControlsVisible: true)
                            .padding(.horizontal, compact ? 22 : 32).padding(.vertical, compact ? 12 : 16)
                    }
                }.background(NativeLyricsBackdrop(style: style, palette: palette, position: 18.2, energy: 0))
                try capture(view, name: "player-\(style.rawValue)\(compact ? "-compact" : "")",
                            width: width, height: height, in: folder)
            }
        }

        let battery = BatteryManager.shared
        battery.batteryLevel = 82; battery.powerSource = "电池供电"; battery.timeRemaining = "预计可用 6 小时"
        battery.batteryHistory = (0..<24).map { .init(timestamp: Date().addingTimeInterval(Double($0 - 24) * 300), level: 96 - $0 * 14 / 24) }
        let weather = WeatherManager.shared
        weather.weather = WeatherData(temperature: 23, temperatureHigh: 26, temperatureLow: 18,
            condition: "Partly cloudy", conditionIcon: "cloud.sun.fill", locationName: "示例城市",
            hourlyForecast: (14...19).map { .init(hour: "\($0):00", temperature: Double(28 - $0 / 3), conditionIcon: "cloud.sun.fill") },
            feelsLike: 24, humidity: 56, windSpeed: 5, uvIndex: 3, aqi: 28)
        let calendar = CalendarManager.shared
        calendar.hasAccess = true
        let store = EKEventStore()
        let demoCalendar = EKCalendar(for: .event, eventStore: store)
        demoCalendar.title = "示例日历"; demoCalendar.cgColor = NSColor.systemTeal.cgColor
        let events = ["产品设计讨论", "整理本周计划"].enumerated().map { index, title in
            let event = EKEvent(eventStore: store)
            event.title = title; event.calendar = demoCalendar
            event.startDate = Date().addingTimeInterval(Double(index + 1) * 3600)
            event.endDate = event.startDate.addingTimeInterval(1800)
            return event
        }
        calendar.todayEvents = events; calendar.nextEvent = events.first
        calendar.selectedDateEvents = events; calendar.datesWithEvents = [Calendar.current.startOfDay(for: Date())]
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date())!
        let upcoming = EKEvent(eventStore: store)
        upcoming.title = "回顾与新计划"; upcoming.calendar = demoCalendar
        upcoming.startDate = tomorrow; upcoming.endDate = tomorrow.addingTimeInterval(1800)
        calendar.upcomingWeekEvents = [(date: tomorrow, events: [upcoming])]
        let wifi = WiFiManager.shared
        wifi.ssid = "SuperIsland Demo Wi-Fi"; wifi.isConnected = true; wifi.signalStrength = -48
        let bluetooth = BluetoothManager.shared
        let headphones = BluetoothDeviceInfo(id: "demo", name: "示例耳机", isConnected: true, deviceType: .headphones, batteryLevel: 86)
        bluetooth.connectedDevices = [headphones]; bluetooth.lastConnectedDevice = headphones
        let notification = IslandNotification(sourceID: "demo", appName: "SuperIsland", bundleIdentifier: nil,
            appIcon: "bell.fill", appIconURL: nil, title: "专注时间已完成", body: "休息片刻，准备迎接下一个目标。",
            senderName: nil, previewText: nil, avatarURL: nil, timestamp: Date(), tapAction: nil)
        NotificationManager.shared.latestNotification = notification
        NotificationManager.shared.recentNotifications = [notification]
        TeleprompterManager.shared.scriptText = "欢迎来到 SuperIsland。\n\n让音乐、日程和灵感，在屏幕顶端轻轻相遇。\n\n把需要的信息留在眼前，把注意力还给此刻。"
        TeleprompterManager.shared.fontSize = 22
        ShelfStore.shared.items = [
            ShelfItem(kind: .text, displayName: "新的灵感", textValue: "让每个平凡时刻闪亮。", isPinned: true),
            ShelfItem(kind: .link, displayName: "项目主页", urlString: "https://github.com/TheInitialDream1/SuperIsland"),
            ShelfItem(kind: .text, displayName: "今日待办", textValue: "整理笔记，完成设计，听一首歌。")]
        VolumeManager.shared.volume = 0.64; VolumeManager.shared.outputDeviceName = "示例扬声器"
        FocusManager.shared.isActive = true; FocusManager.shared.focusName = "专注工作"

        try panel(HomeScreenView(), name: "home", in: folder)
        try panel(NowPlayingExpandedView(), name: "now-playing", module: .nowPlaying, in: folder)
        try panel(BatteryExpandedView(), name: "battery", module: .battery, in: folder)
        try panel(WeatherExpandedView(), name: "weather", module: .weather, in: folder)
        try panel(CalendarExpandedView(), name: "calendar", module: .calendar, in: folder)
        try panel(ConnectivityExpandedView(), name: "connectivity", module: .connectivity, in: folder)
        try panel(NotificationExpandedView(), name: "notifications", module: .notifications, in: folder)
        try panel(ShelfFullExpandedView(), name: "shelf", module: .shelf, in: folder)
        try panel(TeleprompterExpandedView(), name: "teleprompter", module: .teleprompter, in: folder)
        try panel(SystemHUDExpandedView(), name: "volume", module: .volumeHUD, in: folder)
        try capture(FocusCompactView().padding(20), name: "focus", width: 240, height: 72, in: folder)
        try capture(SettingsView(), name: "settings", width: 960, height: 680, in: folder)
        let fixtures = Bundle.main.url(forResource: "extension-previews", withExtension: "json")!
        let previews = try JSONSerialization.jsonObject(with: Data(contentsOf: fixtures)) as! [[String: Any]]
        let context = JSContext()!
        for item in previews {
            let value = JSValue(object: item["node"], in: context)
            guard let node = ViewNode.from(value) else { fatalError("Invalid extension fixture") }
            try panel(ViewNodeRenderer(node: node, extensionID: item["id"] as! String),
                      name: "extension-" + (item["name"] as! String), in: folder)
        }
        // A compact contact sheet for the README; originals remain linked in the gallery.
        let sheet = NSImage(size: NSSize(width: 1440, height: 1020))
        sheet.lockFocus()
        NSColor(srgbRed: 0.055, green: 0.065, blue: 0.085, alpha: 1).setFill()
        NSRect(x: 0, y: 0, width: 1440, height: 1020).fill()
        for (index, style) in NativeLyricStyle.allCases.enumerated() {
            let x = CGFloat(index % 3) * 480 + 16
            let y = CGFloat(4 - index / 3) * 204 + 18
            NSImage(contentsOf: folder.appendingPathComponent("player-\(style.rawValue).png"))!
                .draw(in: NSRect(x: x, y: y + 30, width: 448, height: 149.3))
            (style.title as NSString).draw(at: NSPoint(x: x + 4, y: y + 3),
                withAttributes: [.font: NSFont.systemFont(ofSize: 16, weight: .medium), .foregroundColor: NSColor.white])
        }
        sheet.unlockFocus()
        let sheetBitmap = NSBitmapImageRep(data: sheet.tiffRepresentation!)!
        try sheetBitmap.representation(using: .png, properties: [:])!.write(to: folder.appendingPathComponent("player-styles.png"))
        print("Gallery complete. All content is synthetic; no live data was captured.")
    }
}
