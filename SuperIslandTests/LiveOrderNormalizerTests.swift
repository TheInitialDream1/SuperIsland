import XCTest
@testable import SuperIsland

final class LiveOrderNormalizerTests: XCTestCase {
    func testNormalizesJDDeliveryProgressAndTerminalState() {
        let now = Date(timeIntervalSince1970: 1_700_000_000)
        let snapshot = OrderDOMSnapshot(
            pageTitle: "我的订单",
            loggedIn: true,
            orders: [
                OrderDOMRecord(
                    id: "123456789012",
                    title: "显示器支架",
                    status: "配送中",
                    detail: "快递员正在派送",
                    etaText: "预计 18:30 前送达",
                    imageURL: "https://img.example.test/item.png",
                    detailURL: "https://order.jd.com/center/detail.action?orderId=123456789012"
                ),
                OrderDOMRecord(
                    id: "998877665544",
                    title: "键盘",
                    status: "已签收",
                    detail: nil,
                    etaText: nil,
                    imageURL: nil,
                    detailURL: nil
                )
            ]
        )

        let orders = LiveOrderNormalizer.normalize(snapshot: snapshot, platform: .jd, now: now)

        XCTAssertEqual(orders.count, 2)
        XCTAssertEqual(orders[0].id, "jd:123456789012")
        XCTAssertEqual(orders[0].progress, 0.84, accuracy: 0.001)
        XCTAssertTrue(orders[0].isActive)
        XCTAssertEqual(orders[0].updatedAt, now)
        XCTAssertEqual(orders[1].progress, 1, accuracy: 0.001)
        XCTAssertFalse(orders[1].isActive)
    }

    func testDeduplicatesNestedDOMRecordsByOrderID() {
        let duplicate = OrderDOMRecord(
            id: "123456789012",
            title: "同一个订单",
            status: "运输中",
            detail: nil,
            etaText: nil,
            imageURL: nil,
            detailURL: nil
        )
        let snapshot = OrderDOMSnapshot(
            pageTitle: "我的订单",
            loggedIn: true,
            orders: [duplicate, duplicate]
        )

        let orders = LiveOrderNormalizer.normalize(snapshot: snapshot, platform: .jd)

        XCTAssertEqual(orders.count, 1)
    }

    func testRejectsNonWebResourceURLs() {
        let snapshot = OrderDOMSnapshot(
            pageTitle: "我的订单",
            loggedIn: true,
            orders: [
                OrderDOMRecord(
                    id: "123456789012",
                    title: "测试订单",
                    status: "待发货",
                    detail: nil,
                    etaText: nil,
                    imageURL: "file:///tmp/private.png",
                    detailURL: "javascript:alert(1)"
                )
            ]
        )

        let order = LiveOrderNormalizer.normalize(snapshot: snapshot, platform: .jd).first

        XCTAssertNil(order?.imageURL)
        XCTAssertNil(order?.detailURL)
    }

    func testMeituanAndCainiaoProgressStates() {
        XCTAssertEqual(LiveOrderNormalizer.progress(for: "骑手已接单，等待取餐"), 0.48, accuracy: 0.001)
        XCTAssertEqual(LiveOrderNormalizer.progress(for: "骑手已取餐，配送中"), 0.84, accuracy: 0.001)
        XCTAssertEqual(LiveOrderNormalizer.progress(for: "包裹已到驿站，待取件"), 0.94, accuracy: 0.001)
        XCTAssertFalse(LiveOrderNormalizer.isTerminal("待取件"))
        XCTAssertTrue(LiveOrderNormalizer.isTerminal("订单已送达"))
    }

    func testPlatformPrefixPreventsCrossServiceIdentifierCollisions() {
        let record = OrderDOMRecord(
            id: "123456789012",
            title: "同一个编号",
            status: "配送中",
            detail: nil,
            etaText: nil,
            imageURL: nil,
            detailURL: nil
        )
        let snapshot = OrderDOMSnapshot(pageTitle: "订单", loggedIn: true, orders: [record])

        let meituan = LiveOrderNormalizer.normalize(snapshot: snapshot, platform: .meituan).first
        let cainiao = LiveOrderNormalizer.normalize(snapshot: snapshot, platform: .cainiao).first

        XCTAssertEqual(meituan?.id, "meituan:123456789012")
        XCTAssertEqual(cainiao?.id, "cainiao:123456789012")
        XCTAssertNotEqual(meituan?.id, cainiao?.id)
    }
}
