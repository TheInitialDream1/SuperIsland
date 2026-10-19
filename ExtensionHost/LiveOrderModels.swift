import Foundation

enum LiveOrderPlatform: String, Codable, CaseIterable, Identifiable {
    case jd
    case meituan
    case cainiao

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .jd:
            return "京东"
        case .meituan:
            return "美团外卖"
        case .cainiao:
            return "菜鸟包裹"
        }
    }

    var orderCenterURL: URL {
        switch self {
        case .jd:
            return URL(string: "https://order.jd.com/center/list.action")!
        case .meituan:
            return URL(string: "https://waimai.meituan.com/customer/order/list")!
        case .cainiao:
            return URL(string: "https://page.cainiao.com/guoguo/app-myexpress-taobao/")!
        }
    }

    var settingsIcon: String {
        switch self {
        case .jd: return "shippingbox.fill"
        case .meituan: return "takeoutbag.and.cup.and.straw.fill"
        case .cainiao: return "shippingbox.and.arrow.backward.fill"
        }
    }
}

struct LiveOrder: Codable, Equatable, Identifiable {
    let id: String
    let platform: LiveOrderPlatform
    let title: String
    let status: String
    let detail: String?
    let etaText: String?
    let imageURL: String?
    let detailURL: String?
    let progress: Double
    let isActive: Bool
    let updatedAt: Date
}

struct OrderDOMSnapshot: Decodable, Equatable {
    let pageTitle: String?
    let loggedIn: Bool
    let orders: [OrderDOMRecord]
}

struct OrderDOMRecord: Decodable, Equatable {
    let id: String?
    let title: String?
    let status: String?
    let detail: String?
    let etaText: String?
    let imageURL: String?
    let detailURL: String?
}

enum LiveOrderNormalizer {
    static func normalize(
        snapshot: OrderDOMSnapshot,
        platform: LiveOrderPlatform,
        now: Date = Date()
    ) -> [LiveOrder] {
        var seenIDs = Set<String>()
        var normalized: [LiveOrder] = []

        for (index, record) in snapshot.orders.enumerated() {
            let title = clean(record.title) ?? platform.displayName + "订单"
            let status = clean(record.status) ?? "状态更新中"
            let rawIdentifier = clean(record.id) ?? fallbackIdentifier(
                platform: platform,
                title: title,
                status: status,
                index: index
            )
            let identifier = rawIdentifier.hasPrefix("\(platform.rawValue):")
                ? rawIdentifier
                : "\(platform.rawValue):\(rawIdentifier)"
            guard seenIDs.insert(identifier).inserted else { continue }

            normalized.append(
                LiveOrder(
                    id: identifier,
                    platform: platform,
                    title: title,
                    status: status,
                    detail: clean(record.detail),
                    etaText: clean(record.etaText),
                    imageURL: safeWebURL(record.imageURL),
                    detailURL: safeWebURL(record.detailURL),
                    progress: progress(for: status),
                    isActive: !isTerminal(status),
                    updatedAt: now
                )
            )
        }

        return normalized.sorted { lhs, rhs in
            if lhs.isActive != rhs.isActive { return lhs.isActive }
            return lhs.updatedAt > rhs.updatedAt
        }
    }

    static func progress(for status: String) -> Double {
        let normalized = status.lowercased()
        if containsAny(normalized, ["已完成", "已签收", "已送达", "交易完成", "订单完成"]) { return 1 }
        if containsAny(normalized, ["待取件", "已到驿站", "已入柜", "已到站"]) { return 0.94 }
        if containsAny(normalized, ["骑手已取餐", "派送中", "配送中", "正在配送", "配送员", "快递员正在"]) { return 0.84 }
        if containsAny(normalized, ["骑手已接单", "等待骑手取餐", "骑手取餐中"]) { return 0.48 }
        if containsAny(normalized, ["待收货", "运输中", "在途中", "已发货", "已离开", "已到达"]) { return 0.58 }
        if containsAny(normalized, ["出库", "拣货", "打包", "仓库处理中", "已揽收"]) { return 0.32 }
        if containsAny(normalized, ["商家已接单", "备餐中", "制作中"]) { return 0.28 }
        if containsAny(normalized, ["待发货", "等待发货", "已接单", "处理中", "待揽收"]) { return 0.18 }
        if containsAny(normalized, ["等待商家接单", "已提交"]) { return 0.10 }
        if containsAny(normalized, ["待付款", "等待付款", "已下单"]) { return 0.06 }
        if containsAny(normalized, ["已取消", "已关闭", "退款完成", "已退款"]) { return 1 }
        return 0.12
    }

    static func isTerminal(_ status: String) -> Bool {
        containsAny(
            status.lowercased(),
            ["已完成", "已签收", "已送达", "交易完成", "订单完成", "已取消", "已关闭", "退款完成", "已退款"]
        )
    }

    private static func clean(_ value: String?) -> String? {
        guard let value else { return nil }
        let collapsed = value
            .replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespacesAndNewlines)
        return collapsed.isEmpty ? nil : String(collapsed.prefix(240))
    }

    private static func safeWebURL(_ value: String?) -> String? {
        guard let value = clean(value),
              let url = URL(string: value),
              let scheme = url.scheme?.lowercased(),
              scheme == "https" || scheme == "http" else {
            return nil
        }
        return url.absoluteString
    }

    private static func containsAny(_ value: String, _ candidates: [String]) -> Bool {
        candidates.contains { value.contains($0) }
    }

    private static func fallbackIdentifier(
        platform: LiveOrderPlatform,
        title: String,
        status: String,
        index: Int
    ) -> String {
        let source = "\(platform.rawValue)|\(title)|\(status)|\(index)"
        let hash = source.utf8.reduce(UInt64(14_695_981_039_346_656_037)) { partial, byte in
            (partial ^ UInt64(byte)) &* 1_099_511_628_211
        }
        return "\(platform.rawValue)-\(String(hash, radix: 16))"
    }
}
