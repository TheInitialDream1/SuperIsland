import Foundation

/// Looks up strings that are produced dynamically and therefore are not
/// localized automatically by SwiftUI's string-literal initializers.
enum L10n {
    static func string(_ key: String) -> String {
        NSLocalizedString(key, tableName: nil, bundle: .main, value: key, comment: "")
    }

    static func format(_ key: String, _ arguments: CVarArg...) -> String {
        String(format: string(key), locale: Locale.current, arguments: arguments)
    }

    static func weatherCondition(_ key: String) -> String {
        NSLocalizedString(key, tableName: "Weather", bundle: .main, value: key, comment: "")
    }

    /// Bundled extensions produce their views from JavaScript, so their text
    /// does not pass through SwiftUI's localized string-literal initializer.
    /// Only localize bundled extensions whose source text is authored in English.
    /// The synced-lyrics bundle is already authored in Chinese and stays unchanged.
    static func extensionText(_ value: String, extensionID: String) -> String {
        let bundledIDs: Set<String> = [
            "superisland.agents-status",
            "superisland.ai-usage",
            "superisland.lastfm-scrobbler",
            "superisland.linear-mentions",
            "superisland.live-orders",
            "superisland.meituan-delivery",
            "superisland.cainiao-packages",
            "superisland.live-football",
            "superisland.pomodoro",
            "superisland.whatsapp-web"
        ]
        guard bundledIDs.contains(extensionID) else { return value }

        let exact = string(value)
        if exact != value { return exact }

        let numberedSuffixes: [(String, String)] = [
            (" working", " 个任务正在运行"),
            (" done", " 个任务已完成"),
            (" idle", " 个任务空闲"),
            (" active", " 个进行中"),
            (" more", " 个更多项目"),
            ("m left", " 分钟剩余")
        ]
        for (suffix, translatedSuffix) in numberedSuffixes where value.hasSuffix(suffix) {
            let prefix = String(value.dropLast(suffix.count))
            if let number = Int(prefix.trimmingCharacters(in: CharacterSet(charactersIn: "+ "))) {
                return "\(value.hasPrefix("+") ? "+" : "")\(number)\(translatedSuffix)"
            }
        }

        let prefixTranslations: [(String, String)] = [
            ("Option ", "选项 "),
            ("Account: ", "账户："),
            ("Connected to Last.fm as ", "Last.fm 已连接："),
            ("Now playing: ", "正在播放："),
            ("Scrobbled at ", "已记录于 "),
            ("Sent at ", "已发送于 "),
            ("Paused at ", "暂停于 "),
            ("Scrobbles in ", "将在此时间后记录："),
            ("Scrobbles at ", "将在此时间记录：")
        ]
        for (prefix, translatedPrefix) in prefixTranslations where value.hasPrefix(prefix) {
            return translatedPrefix + value.dropFirst(prefix.count)
        }

        return value
    }
}
