import AppKit
import Foundation
import WebKit

@MainActor
final class OrderWebBridge: ObservableObject {
    static let shared = OrderWebBridge()
    static let managedExtensionIDs = [
        "superisland.live-orders",
        "superisland.meituan-delivery",
        "superisland.cainiao-packages"
    ]

    enum ConnectionState: String {
        case idle
        case loading
        case needsLogin
        case connected
        case error
    }

    struct PlatformStatus: Identifiable {
        let platform: LiveOrderPlatform
        var state: ConnectionState
        var statusText: String
        var orders: [LiveOrder]
        var lastSyncAt: Date?
        var lastError: String?

        var id: LiveOrderPlatform { platform }
        var connected: Bool { state == .connected }
        var needsLogin: Bool { state == .needsLogin }
    }

    @Published private(set) var platformStatuses: [LiveOrderPlatform: PlatformStatus] = [:]

    var connectionState: ConnectionState {
        let values = LiveOrderPlatform.allCases.compactMap { platformStatuses[$0]?.state }
        if values.contains(.connected) { return .connected }
        if values.contains(.loading) { return .loading }
        if values.contains(.needsLogin) { return .needsLogin }
        if values.contains(.error) { return .error }
        return .idle
    }

    var statusText: String {
        let connectedCount = platformStatuses.values.filter(\.connected).count
        if connectedCount > 1 { return "\(connectedCount) order services connected" }
        if connectedCount == 1 {
            return platformStatuses.values.first(where: \.connected)?.statusText ?? "Connected"
        }
        return platformStatuses.values.first(where: { $0.state != .idle })?.statusText ?? "Not connected"
    }

    var orders: [LiveOrder] {
        platformStatuses.values
            .flatMap(\.orders)
            .sorted { lhs, rhs in
                if lhs.isActive != rhs.isActive { return lhs.isActive }
                return lhs.updatedAt > rhs.updatedAt
            }
    }

    var lastSyncAt: Date? {
        platformStatuses.values.compactMap(\.lastSyncAt).max()
    }

    var lastError: String? {
        platformStatuses.values.compactMap(\.lastError).first
    }

    private var sessions: [LiveOrderPlatform: OrderPlatformWebSession] = [:]

    private init() {
        for platform in LiveOrderPlatform.allCases {
            let session = OrderPlatformWebSession(platform: platform) { [weak self] status in
                self?.receive(status)
            }
            sessions[platform] = session
            platformStatuses[platform] = session.status
        }
    }

    func status(for platform: LiveOrderPlatform) -> PlatformStatus {
        platformStatuses[platform] ?? PlatformStatus(
            platform: platform,
            state: .idle,
            statusText: "Not connected",
            orders: [],
            lastSyncAt: nil,
            lastError: nil
        )
    }

    func start(platform: LiveOrderPlatform? = nil) {
        selectedSessions(platform).forEach { $0.start() }
    }

    func openLogin(platform: LiveOrderPlatform = .jd) {
        sessions[platform]?.openLogin()
    }

    func refresh(platform: LiveOrderPlatform? = nil, showLoginWindow: Bool = false) {
        selectedSessions(platform).forEach {
            $0.refresh(showLoginWindow: showLoginWindow)
        }
    }

    func disconnect(platform: LiveOrderPlatform? = nil) {
        selectedSessions(platform).forEach { $0.disconnect() }
    }

    func openOrder(id: String) -> Bool {
        for platform in LiveOrderPlatform.allCases {
            guard let status = platformStatuses[platform],
                  status.orders.contains(where: { $0.id == id }),
                  let session = sessions[platform] else {
                continue
            }
            return session.openOrder(id: id)
        }
        return false
    }

    func snapshot(limit: Int, platform: LiveOrderPlatform? = nil) -> [String: Any] {
        let resolvedLimit = max(1, min(50, limit))
        let selectedOrders = (platform.map { status(for: $0).orders } ?? orders)
            .prefix(resolvedLimit)
            .map(Self.orderPayload)
        let selectedStatuses = platform.map { [status(for: $0)] }
            ?? LiveOrderPlatform.allCases.map { status(for: $0) }

        let states = selectedStatuses.map(\.state)
        let connected = states.contains(.connected)
        let state: ConnectionState
        if connected {
            state = .connected
        } else if states.contains(.loading) {
            state = .loading
        } else if states.contains(.needsLogin) {
            state = .needsLogin
        } else if states.contains(.error) {
            state = .error
        } else {
            state = .idle
        }

        let statusesPayload: [[String: Any]] = selectedStatuses.map { status in
            [
                "id": status.platform.rawValue,
                "name": status.platform.displayName,
                "state": status.state.rawValue,
                "statusText": status.statusText,
                "connected": status.connected,
                "needsLogin": status.needsLogin,
                "lastSyncAt": status.lastSyncAt.map { Int($0.timeIntervalSince1970) } as Any,
                "lastError": status.lastError as Any,
                "orderCount": status.orders.count,
                "activeOrderCount": status.orders.filter(\.isActive).count
            ]
        }

        return [
            "state": state.rawValue,
            "statusText": selectedStatuses.first(where: \.connected)?.statusText
                ?? selectedStatuses.first(where: { $0.state != .idle })?.statusText
                ?? "Not connected",
            "connected": connected,
            "needsLogin": !connected && states.contains(.needsLogin),
            "lastSyncAt": selectedStatuses.compactMap(\.lastSyncAt).max()
                .map { Int($0.timeIntervalSince1970) } as Any,
            "lastError": selectedStatuses.compactMap(\.lastError).first as Any,
            "platforms": statusesPayload,
            "orders": Array(selectedOrders)
        ]
    }

    private func selectedSessions(_ platform: LiveOrderPlatform?) -> [OrderPlatformWebSession] {
        if let platform, let session = sessions[platform] { return [session] }
        return LiveOrderPlatform.allCases.compactMap { sessions[$0] }
    }

    private func receive(_ status: PlatformStatus) {
        platformStatuses[status.platform] = status
        for extensionID in Self.managedExtensionIDs {
            ExtensionManager.shared.scheduleImmediateRefresh(extensionID: extensionID)
        }
    }

    private static func orderPayload(_ order: LiveOrder) -> [String: Any] {
        [
            "id": order.id,
            "platform": order.platform.rawValue,
            "platformName": order.platform.displayName,
            "title": order.title,
            "status": order.status,
            "detail": order.detail as Any,
            "etaText": order.etaText as Any,
            "imageURL": order.imageURL as Any,
            "detailURL": order.detailURL as Any,
            "progress": order.progress,
            "isActive": order.isActive,
            "updatedAt": Int(order.updatedAt.timeIntervalSince1970)
        ]
    }
}

@MainActor
private final class OrderPlatformWebSession: NSObject {
    typealias PlatformStatus = OrderWebBridge.PlatformStatus
    typealias ConnectionState = OrderWebBridge.ConnectionState

    private(set) var status: PlatformStatus

    private let platform: LiveOrderPlatform
    private let dataStore: WKWebsiteDataStore
    private let onChange: (PlatformStatus) -> Void
    private var webView: WKWebView?
    private var windowController: NSWindowController?
    private var refreshTimer: Timer?
    private var didStart = false
    private var extractionGeneration = 0

    init(platform: LiveOrderPlatform, onChange: @escaping (PlatformStatus) -> Void) {
        self.platform = platform
        self.dataStore = WKWebsiteDataStore(forIdentifier: platform.dataStoreIdentifier)
        self.onChange = onChange
        self.status = PlatformStatus(
            platform: platform,
            state: .idle,
            statusText: "Not connected",
            orders: [],
            lastSyncAt: nil,
            lastError: nil
        )
        super.init()
        restoreCachedOrders()
    }

    deinit {
        refreshTimer?.invalidate()
    }

    func start() {
        guard !didStart else { return }
        didStart = true
        _ = ensureWebView()
        scheduleRefreshTimer()
        refresh(showLoginWindow: false)
    }

    func openLogin() {
        didStart = true
        let webView = ensureWebView()
        showWindow()

        if let currentURL = webView.url,
           platform.acceptsNavigationHost(currentURL.host),
           currentURL.absoluteString != "about:blank" {
            webView.reload()
        } else {
            webView.load(URLRequest(url: platform.orderCenterURL))
        }
        scheduleRefreshTimer()
    }

    func refresh(showLoginWindow: Bool) {
        didStart = true
        let webView = ensureWebView()
        if showLoginWindow { showWindow() }
        updateState(.loading, status: platform.syncingStatus, error: nil)
        webView.load(URLRequest(
            url: platform.orderCenterURL,
            cachePolicy: .reloadIgnoringLocalAndRemoteCacheData,
            timeoutInterval: 30
        ))
        scheduleRefreshTimer()
    }

    func disconnect() {
        extractionGeneration += 1
        webView?.stopLoading()
        windowController?.close()
        windowController = nil
        webView = nil
        didStart = false
        refreshTimer?.invalidate()
        refreshTimer = nil
        status.orders = []
        status.lastSyncAt = nil
        UserDefaults.standard.removeObject(forKey: platform.cacheKey)
        updateState(.idle, status: "Not connected", error: nil)

        dataStore.removeData(
            ofTypes: WKWebsiteDataStore.allWebsiteDataTypes(),
            modifiedSince: .distantPast
        ) { [weak self] in
            Task { @MainActor [weak self] in
                self?.publish()
            }
        }
    }

    func openOrder(id: String) -> Bool {
        guard let order = status.orders.first(where: { $0.id == id }) else { return false }
        let destination = order.detailURL.flatMap(URL.init(string:)) ?? platform.orderCenterURL
        guard platform.acceptsNavigationHost(destination.host) else { return false }
        let webView = ensureWebView()
        showWindow()
        webView.load(URLRequest(url: destination))
        return true
    }

    private func ensureWebView() -> WKWebView {
        if let webView { return webView }

        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = dataStore
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsMagnification = true
        self.webView = webView
        return webView
    }

    private func showWindow() {
        if let window = windowController?.window {
            window.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            return
        }

        let webView = ensureWebView()
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1080, height: 760),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = L10n.string(platform.connectWindowTitle)
        window.isReleasedWhenClosed = false
        window.minSize = NSSize(width: 760, height: 560)
        window.center()
        window.contentView = webView

        let controller = NSWindowController(window: window)
        windowController = controller
        controller.showWindow(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    private func scheduleRefreshTimer() {
        guard refreshTimer == nil else { return }
        refreshTimer = Timer.scheduledTimer(
            withTimeInterval: platform.refreshInterval,
            repeats: true
        ) { [weak self] _ in
            Task { @MainActor [weak self] in
                guard let self, self.didStart, self.status.state == .connected else { return }
                self.refresh(showLoginWindow: false)
            }
        }
        if let refreshTimer {
            RunLoop.main.add(refreshTimer, forMode: .common)
        }
    }

    private func handleNavigationFinished(_ url: URL?) {
        guard let url else {
            updateState(.error, status: platform.pageUnavailableStatus, error: "The order page did not provide a URL.")
            return
        }

        guard url.scheme == "http" || url.scheme == "https" else { return }

        if platform.isOrderPageURL(url) {
            scheduleExtractionPasses()
            return
        }

        checkAuthentication { [weak self] authenticated in
            guard let self else { return }

            if self.platform.isLoginURL(url), !authenticated {
                self.updateState(.needsLogin, status: self.platform.signInStatus, error: nil)
                return
            }

            guard self.platform.acceptsNavigationHost(url.host) else {
                self.updateState(.loading, status: self.platform.completeSignInStatus, error: nil)
                return
            }

            if authenticated {
                self.updateState(.loading, status: self.platform.signInCompleteStatus, error: nil)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) { [weak self] in
                    guard let self, self.webView?.isLoading == false else { return }
                    self.webView?.load(URLRequest(url: self.platform.orderCenterURL))
                }
            } else {
                self.updateState(.needsLogin, status: self.platform.signInStatus, error: nil)
            }
        }
    }

    private func checkAuthentication(completion: @escaping @MainActor (Bool) -> Void) {
        dataStore.httpCookieStore.getAllCookies { [platform] cookies in
            let authenticated = cookies.contains { cookie in
                platform.authenticationCookieNames.contains(cookie.name.lowercased())
                    && !cookie.value.isEmpty
            }
            Task { @MainActor in
                completion(authenticated)
            }
        }
    }

    private func scheduleExtractionPasses() {
        extractionGeneration += 1
        let generation = extractionGeneration
        for delay in platform.extractionDelays {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                guard let self, generation == self.extractionGeneration else { return }
                self.extractOrders()
            }
        }
    }

    private func extractOrders() {
        guard let webView,
              platform.isOrderPageURL(webView.url),
              !webView.isLoading else {
            return
        }

        webView.evaluateJavaScript(platform.extractionScript) { [weak self] result, error in
            Task { @MainActor [weak self] in
                guard let self else { return }
                if let error {
                    self.updateState(.error, status: self.platform.readFailureStatus, error: error.localizedDescription)
                    return
                }

                guard let json = result as? String,
                      let data = json.data(using: .utf8),
                      let snapshot = try? JSONDecoder().decode(OrderDOMSnapshot.self, from: data) else {
                    self.updateState(
                        .error,
                        status: self.platform.readFailureStatus,
                        error: self.platform.unsupportedPageMessage
                    )
                    return
                }

                guard snapshot.loggedIn else {
                    self.updateState(.needsLogin, status: self.platform.signInStatus, error: nil)
                    return
                }

                let newOrders = LiveOrderNormalizer.normalize(
                    snapshot: snapshot,
                    platform: self.platform
                )
                self.status.orders = newOrders
                self.status.lastSyncAt = Date()
                self.persistOrders()
                self.updateState(
                    .connected,
                    status: newOrders.isEmpty
                        ? self.platform.connectedEmptyStatus
                        : self.platform.syncedStatus,
                    error: nil
                )
            }
        }
    }

    private func updateState(_ state: ConnectionState, status statusText: String, error: String?) {
        status.state = state
        status.statusText = statusText
        status.lastError = error
        publish()
    }

    private func publish() {
        onChange(status)
    }

    private func persistOrders() {
        guard let data = try? JSONEncoder().encode(status.orders) else { return }
        UserDefaults.standard.set(data, forKey: platform.cacheKey)
    }

    private func restoreCachedOrders() {
        guard let data = UserDefaults.standard.data(forKey: platform.cacheKey),
              let cached = try? JSONDecoder().decode([LiveOrder].self, from: data) else {
            return
        }
        status.orders = cached
        status.lastSyncAt = cached.map(\.updatedAt).max()
    }
}

extension OrderPlatformWebSession: WKNavigationDelegate, WKUIDelegate {
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        extractionGeneration += 1
        updateState(.loading, status: platform.loadingStatus, error: nil)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        handleNavigationFinished(webView.url)
    }

    func webView(
        _ webView: WKWebView,
        didFail navigation: WKNavigation!,
        withError error: Error
    ) {
        updateState(.error, status: platform.pageUnavailableStatus, error: error.localizedDescription)
    }

    func webView(
        _ webView: WKWebView,
        didFailProvisionalNavigation navigation: WKNavigation!,
        withError error: Error
    ) {
        updateState(.error, status: platform.pageUnavailableStatus, error: error.localizedDescription)
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        let scheme = url.scheme?.lowercased() ?? ""
        if scheme == "http" || scheme == "https" || scheme == "about" {
            decisionHandler(.allow)
            return
        }
        NSWorkspace.shared.open(url)
        decisionHandler(.cancel)
    }

    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let url = navigationAction.request.url {
            webView.load(URLRequest(url: url))
        }
        return nil
    }
}

private extension LiveOrderPlatform {
    var dataStoreIdentifier: UUID {
        switch self {
        case .jd:
            return UUID(uuidString: "438DD394-6B31-4B4F-A83F-6131E9696A2A")!
        case .meituan:
            return UUID(uuidString: "438DD394-6B31-4B4F-A83F-6131E9696A2B")!
        case .cainiao:
            return UUID(uuidString: "438DD394-6B31-4B4F-A83F-6131E9696A2C")!
        }
    }

    var cacheKey: String {
        "liveOrders.\(rawValue).cache.v2"
    }

    var refreshInterval: TimeInterval {
        switch self {
        case .jd: return 90
        case .meituan: return 45
        case .cainiao: return 120
        }
    }

    var extractionDelays: [TimeInterval] {
        switch self {
        case .jd: return [0.8, 2.4]
        case .meituan: return [1.0, 3.0, 6.0]
        case .cainiao: return [1.2, 3.5, 7.0]
        }
    }

    var authenticationCookieNames: Set<String> {
        switch self {
        case .jd:
            return ["pt_key", "pt_pin", "pin", "thor"]
        case .meituan:
            return ["token", "userid", "user_id", "passport", "mt_c_token"]
        case .cainiao:
            return ["cookie2", "tracknick", "lgc", "unb", "munb", "sgcookie"]
        }
    }

    func acceptsNavigationHost(_ host: String?) -> Bool {
        guard let host = host?.lowercased() else { return false }
        switch self {
        case .jd:
            return host == "jd.com" || host.hasSuffix(".jd.com")
                || host == "3.cn" || host.hasSuffix(".3.cn")
        case .meituan:
            return host == "meituan.com" || host.hasSuffix(".meituan.com")
                || host == "dianping.com" || host.hasSuffix(".dianping.com")
        case .cainiao:
            return host == "cainiao.com" || host.hasSuffix(".cainiao.com")
                || host == "taobao.com" || host.hasSuffix(".taobao.com")
                || host == "tmall.com" || host.hasSuffix(".tmall.com")
                || host == "alibaba.com" || host.hasSuffix(".alibaba.com")
    }
    }

    func isOrderPageURL(_ url: URL?) -> Bool {
        guard let url else { return false }
        let host = url.host?.lowercased() ?? ""
        let path = url.path.lowercased()
        switch self {
        case .jd:
            return host == "order.jd.com" && path.contains("/center/")
        case .meituan:
            return (host == "waimai.meituan.com" || host == "i.waimai.meituan.com")
                && path.contains("order")
        case .cainiao:
            return host == "page.cainiao.com" && path.contains("app-myexpress-taobao")
        }
    }

    func isLoginURL(_ url: URL) -> Bool {
        let host = url.host?.lowercased() ?? ""
        let path = url.path.lowercased()
        switch self {
        case .jd:
            return host == "passport.jd.com" || host == "plogin.m.jd.com"
                || path.contains("login")
        case .meituan:
            return host == "passport.meituan.com" || path.contains("login")
        case .cainiao:
            return host.contains("login.") || host == "passport.alibaba.com"
                || path.contains("login")
        }
    }

    var connectWindowTitle: String {
        switch self {
        case .jd: return "Connect JD Orders"
        case .meituan: return "Connect Meituan Delivery"
        case .cainiao: return "Connect Cainiao Packages"
        }
    }

    var syncingStatus: String {
        switch self {
        case .jd: return "Syncing JD orders..."
        case .meituan: return "Syncing Meituan delivery..."
        case .cainiao: return "Syncing Cainiao packages..."
        }
    }

    var loadingStatus: String {
        switch self {
        case .jd: return "Loading JD..."
        case .meituan: return "Loading Meituan..."
        case .cainiao: return "Loading Cainiao..."
        }
    }

    var pageUnavailableStatus: String {
        switch self {
        case .jd: return "JD page unavailable"
        case .meituan: return "Meituan page unavailable"
        case .cainiao: return "Cainiao page unavailable"
        }
    }

    var readFailureStatus: String {
        switch self {
        case .jd: return "Could not read JD orders"
        case .meituan: return "Could not read Meituan delivery"
        case .cainiao: return "Could not read Cainiao packages"
        }
    }

    var signInStatus: String {
        switch self {
        case .jd: return "Sign in to JD in the login window"
        case .meituan: return "Sign in to Meituan in the login window"
        case .cainiao: return "Sign in to Taobao or Cainiao in the login window"
        }
    }

    var completeSignInStatus: String {
        switch self {
        case .jd: return "Complete JD sign-in in the login window"
        case .meituan: return "Complete Meituan sign-in in the login window"
        case .cainiao: return "Complete Cainiao sign-in in the login window"
        }
    }

    var signInCompleteStatus: String {
        switch self {
        case .jd: return "JD sign-in complete. Loading orders..."
        case .meituan: return "Meituan sign-in complete. Loading delivery..."
        case .cainiao: return "Cainiao sign-in complete. Loading packages..."
        }
    }

    var connectedEmptyStatus: String {
        switch self {
        case .jd: return "JD connected. No recent orders found."
        case .meituan: return "Meituan connected. No recent delivery found."
        case .cainiao: return "Cainiao connected. No recent packages found."
        }
    }

    var syncedStatus: String {
        switch self {
        case .jd: return "JD orders synced"
        case .meituan: return "Meituan delivery synced"
        case .cainiao: return "Cainiao packages synced"
        }
    }

    var unsupportedPageMessage: String {
        switch self {
        case .jd: return "JD returned an unsupported order page format."
        case .meituan: return "Meituan returned an unsupported delivery page format."
        case .cainiao: return "Cainiao returned an unsupported package page format."
        }
    }

    var extractionScript: String {
        switch self {
        case .jd: return Self.jdExtractionScript
        case .meituan: return Self.meituanExtractionScript
        case .cainiao: return Self.cainiaoExtractionScript
        }
    }

    static let jdExtractionScript = #"""
    (() => {
      const normalized = value => String(value || "").replace(/\s+/g, " ").trim();
      const clean = value => normalized(value).slice(0, 240);
      const textOf = (root, selectors) => {
        for (const selector of selectors) {
          const node = root.querySelector(selector);
          const value = clean(node && (node.innerText || node.textContent));
          if (value) return value;
        }
        return "";
      };
      const attrOf = (root, selectors, attribute) => {
        for (const selector of selectors) {
          const node = root.querySelector(selector);
          const value = clean(node && node.getAttribute(attribute));
          if (value) return value;
        }
        return "";
      };
      const absoluteURL = value => {
        if (!value) return "";
        try { return new URL(value, location.href).href; } catch (_) { return ""; }
      };
      const bodyText = normalized(document.body && document.body.innerText);
      const loginForm = Boolean(document.querySelector(
        "#loginname, #nloginpwd, .login-tab, form[action*='login'], [class*='login-form']"
      ));
      const onOrderHost = location.hostname === "order.jd.com";
      const loggedIn = onOrderHost && !loginForm && (
        bodyText.includes("我的订单") ||
        bodyText.includes("订单中心") ||
        Boolean(document.querySelector(".order-tb, [data-orderid], [data-order-id], #order02"))
      );

      const selectorList = [
        "table.order-tb", "tbody[id^='tb-']", ".order-item", "[data-orderid]",
        "[data-order-id]", ".order-list-item"
      ];
      const containers = [];
      const seenNodes = new Set();
      for (const selector of selectorList) {
        for (const node of document.querySelectorAll(selector)) {
          if (!seenNodes.has(node)) {
            seenNodes.add(node);
            containers.push(node);
          }
        }
      }
      if (containers.length === 0) {
        for (const link of document.querySelectorAll("a[href*='orderId='], a[href*='orderid=']")) {
          const parent = link.closest("table, tbody, li, article, section, div[class*='order']");
          if (parent && !seenNodes.has(parent)) {
            seenNodes.add(parent);
            containers.push(parent);
          }
        }
      }

      const records = [];
      const seenOrderIDs = new Set();
      for (const root of containers) {
        const text = normalized(root.innerText || root.textContent).slice(0, 5000);
        if (!text) continue;
        const rawID = clean(
          root.getAttribute("data-orderid") || root.getAttribute("data-order-id") ||
          root.id || attrOf(root, ["input[name='orderId']", "input[name='orderid']"], "value")
        );
        const detailLink = root.querySelector(
          "a[href*='orderDetail'], a[href*='orderId='], a[href*='orderid='], a[href*='track'], a[href*='logistic']"
        );
        const detailURL = absoluteURL(detailLink && detailLink.getAttribute("href"));
        const labeledIDMatch = text.match(/(?:订单号|订单编号)\s*[：:#]?\s*(\d{8,30})/);
        const rawIDMatch = rawID.match(/(\d{8,30})/);
        let linkedID = "";
        if (detailURL) {
          try {
            const detailLocation = new URL(detailURL);
            linkedID = detailLocation.searchParams.get("orderId") || detailLocation.searchParams.get("orderid") || "";
          } catch (_) {}
        }
        const orderID = clean((labeledIDMatch && labeledIDMatch[1]) || (rawIDMatch && rawIDMatch[1]) || linkedID);
        if (orderID && seenOrderIDs.has(orderID)) continue;
        if (orderID) seenOrderIDs.add(orderID);
        const title = textOf(root, [
          ".p-name a", ".p-name", ".goods-item .name", ".goods-item a[href*='item.jd.com']",
          ".product-name", ".order-product-name", "[class*='productName']", "[class*='goods-name']"
        ]);
        let status = textOf(root, [
          ".order-status", ".status", ".state", ".order-state", "[class*='orderStatus']",
          "[class*='status-name']", "[class*='state-txt']"
        ]);
        const statusMatch = text.match(/(配送中|派送中|正在配送|待收货|运输中|已发货|正在出库|等待发货|待发货|待付款|已完成|已签收|已取消|已关闭|退款完成)/);
        if (!status || !/(待|已|配送|派送|运输|出库|发货|退款)/.test(status)) {
          status = statusMatch ? statusMatch[1] : "";
        }
        const detail = textOf(root, [
          ".track-latest", ".logistics", ".delivery-info", ".order-track", "[class*='logistics']",
          "[class*='delivery']", "[class*='track-message']"
        ]);
        const etaMatch = text.match(/((?:预计|预计送达|送达时间)[^\n，。]{0,28})/);
        const etaText = etaMatch ? clean(etaMatch[1]) : "";
        const imageNode = root.querySelector(".p-img img, .goods-item img, img[data-lazy-img], img");
        const imageURL = absoluteURL(imageNode && (
          imageNode.currentSrc || imageNode.src || imageNode.getAttribute("data-lazy-img") || imageNode.getAttribute("data-src")
        ));
        if (!orderID && !title && !status) continue;
        records.push({
          id: orderID || null, title: title || null, status: status || null,
          detail: detail || null, etaText: etaText || null,
          imageURL: imageURL || null, detailURL: detailURL || null
        });
        if (records.length >= 30) break;
      }
      return JSON.stringify({
        pageTitle: clean(document.title) || null,
        loggedIn,
        orders: records
      });
    })();
    """#

    static let meituanExtractionScript = #"""
    (() => {
      const normalized = value => String(value || "").replace(/\s+/g, " ").trim();
      const clean = value => normalized(value).slice(0, 240);
      const textOf = (root, selectors) => {
        for (const selector of selectors) {
          const node = root.querySelector(selector);
          const value = clean(node && (node.innerText || node.textContent));
          if (value) return value;
        }
        return "";
      };
      const absoluteURL = value => {
        if (!value) return "";
        try { return new URL(value, location.href).href; } catch (_) { return ""; }
      };
      const selectors = [
        ".order-list-item", ".order-item", "[data-order-id]", "[data-orderid]",
        "[class*='order-card']", "[class*='OrderCard']", ".order-list > li",
        "[class*='orderList'] > div"
      ];
      const containers = [];
      const seenNodes = new Set();
      for (const selector of selectors) {
        for (const node of document.querySelectorAll(selector)) {
          if (!seenNodes.has(node)) {
            seenNodes.add(node);
            containers.push(node);
          }
        }
      }
      if (containers.length === 0) {
        for (const link of document.querySelectorAll(
          "a[href*='/customer/order/'], a[href*='orderId='], a[href*='order_id=']"
        )) {
          const parent = link.closest("li, article, section, div[class*='order']");
          if (parent && !seenNodes.has(parent)) {
            seenNodes.add(parent);
            containers.push(parent);
          }
        }
      }

      const bodyText = normalized(document.body && document.body.innerText);
      const loginForm = location.hostname === "passport.meituan.com" || Boolean(document.querySelector(
        "input[type='password'], input[name*='mobile'], form[action*='login'], [class*='login-form']"
      ));
      const onOrderPage = /(^|\.)waimai\.meituan\.com$/.test(location.hostname)
        && location.pathname.toLowerCase().includes("order");
      const loggedIn = onOrderPage && !loginForm && (
        containers.length > 0 || bodyText.includes("我的订单") ||
        bodyText.includes("暂无订单") || bodyText.includes("全部订单")
      );

      const records = [];
      const seenIDs = new Set();
      for (const root of containers) {
        const text = normalized(root.innerText || root.textContent).slice(0, 5000);
        if (!text || text.length < 4) continue;
        const detailLink = root.querySelector(
          "a[href*='/customer/order/'], a[href*='orderId='], a[href*='order_id='], a[href*='detail']"
        );
        const detailURL = absoluteURL(detailLink && detailLink.getAttribute("href"));
        const rawID = clean(
          root.getAttribute("data-order-id") || root.getAttribute("data-orderid") || root.id
        );
        let linkedID = "";
        if (detailURL) {
          try {
            const detailLocation = new URL(detailURL);
            linkedID = detailLocation.searchParams.get("orderId")
              || detailLocation.searchParams.get("order_id")
              || (detailLocation.pathname.match(/order\/(\d{6,30})/) || [])[1]
              || "";
          } catch (_) {}
        }
        const labeledID = (text.match(/(?:订单号|订单编号)\s*[：:#]?\s*([A-Za-z0-9_-]{6,40})/) || [])[1] || "";
        const rawIDMatch = (rawID.match(/([A-Za-z0-9_-]{6,40})/) || [])[1] || "";
        const orderID = clean(labeledID || linkedID || rawIDMatch);
        if (orderID && seenIDs.has(orderID)) continue;
        if (orderID) seenIDs.add(orderID);

        const title = textOf(root, [
          ".restaurant-name", ".poi-name", ".shop-name", ".order-title",
          "[class*='poiName']", "[class*='restaurantName']", "[class*='shopName']",
          "[class*='orderTitle']", "h3", "h4"
        ]);
        let status = textOf(root, [
          ".order-status", ".delivery-status", ".status", "[class*='orderStatus']",
          "[class*='deliveryStatus']", "[class*='statusText']", "[class*='status-name']"
        ]);
        const statusMatch = text.match(/(订单已送达|已送达|订单完成|已完成|配送中|正在配送|骑手已取餐|骑手取餐中|等待骑手取餐|骑手已接单|商家已接单|备餐中|制作中|等待商家接单|订单已提交|已提交|已取消|退款完成|已退款)/);
        if (!status || !/(送达|完成|配送|骑手|商家|备餐|制作|提交|取消|退款)/.test(status)) {
          status = statusMatch ? statusMatch[1] : "";
        }
        const detail = textOf(root, [
          ".delivery-info", ".delivery-desc", ".order-desc", ".rider-info",
          "[class*='deliveryInfo']", "[class*='statusDesc']", "[class*='rider']"
        ]);
        const etaMatch = text.match(/((?:预计|预计送达|送达时间|约)[^，。]{0,30}(?:送达|到达|分钟|:\d{2}))/);
        const etaText = etaMatch ? clean(etaMatch[1]) : "";
        const imageNode = root.querySelector(".restaurant-logo img, .poi-logo img, img");
        const imageURL = absoluteURL(imageNode && (
          imageNode.currentSrc || imageNode.src || imageNode.getAttribute("data-src")
        ));
        if (!orderID && !title && !status) continue;
        records.push({
          id: orderID || null, title: title || "美团外卖订单", status: status || null,
          detail: detail || null, etaText: etaText || null,
          imageURL: imageURL || null, detailURL: detailURL || null
        });
        if (records.length >= 20) break;
      }
      return JSON.stringify({
        pageTitle: clean(document.title) || null,
        loggedIn,
        orders: records
      });
    })();
    """#

    static let cainiaoExtractionScript = #"""
    (() => {
      const normalized = value => String(value || "").replace(/\s+/g, " ").trim();
      const clean = value => normalized(value).slice(0, 240);
      const textOf = (root, selectors) => {
        for (const selector of selectors) {
          const node = root.querySelector(selector);
          const value = clean(node && (node.innerText || node.textContent));
          if (value) return value;
        }
        return "";
      };
      const absoluteURL = value => {
        if (!value) return "";
        try { return new URL(value, location.href).href; } catch (_) { return ""; }
      };
      const selectors = [
        ".express-list .list-item", ".express-info", ".package-item",
        "[data-package-id]", "[class*='packageItem']", "[class*='express-item']"
      ];
      const containers = [];
      const seenNodes = new Set();
      for (const selector of selectors) {
        for (const node of document.querySelectorAll(selector)) {
          if (!seenNodes.has(node)) {
            seenNodes.add(node);
            containers.push(node);
          }
        }
      }

      const bodyText = normalized(document.body && document.body.innerText);
      const loginForm = /(^|\.)login\./.test(location.hostname)
        || location.hostname === "passport.alibaba.com"
        || Boolean(document.querySelector("input[type='password'], form[action*='login']"));
      const onPackagePage = location.hostname === "page.cainiao.com"
        && location.pathname.includes("app-myexpress-taobao");
      const loggedIn = onPackagePage && !loginForm && (
        containers.length > 0 || bodyText.includes("最近好像没有什么包裹")
        || bodyText.includes("待收包裹") || bodyText.includes("已收包裹")
      );

      const records = [];
      const seenIDs = new Set();
      for (const root of containers) {
        const text = normalized(root.innerText || root.textContent).slice(0, 4000);
        if (!text || text.includes("{{item.")) continue;
        const labeledMailNo = (text.match(/(?:快递单号|运单号|物流单号)\s*[：:]?\s*([A-Za-z0-9_-]{6,40})/) || [])[1] || "";
        const rawID = clean(
          root.getAttribute("data-package-id") || root.getAttribute("data-mail-no") || root.id
        );
        const rawIDMatch = (rawID.match(/([A-Za-z0-9_-]{6,40})/) || [])[1] || "";
        const orderID = clean(labeledMailNo || rawIDMatch);
        if (orderID && seenIDs.has(orderID)) continue;
        if (orderID) seenIDs.add(orderID);

        const title = textOf(root, [
          ".express-info_title", ".package-title", ".item-title",
          "[class*='packageTitle']", "[class*='itemTitle']", "h3", "h4"
        ]);
        let status = textOf(root, [
          ".logistics-status", ".express-status", "[class*='status-desc']",
          "[class*='statusDesc']", ".express-info_detail div:last-child"
        ]);
        const statusMatch = text.match(/(已签收|已送达|待取件|已到驿站|已入柜|已到站|派送中|正在派送|运输中|在途中|已揽收|待揽收|商家已发货|已发货|异常|已取消)/);
        if (!status || !/(签收|送达|取件|驿站|入柜|到站|派送|运输|途中|揽收|发货|异常|取消)/.test(status)) {
          status = statusMatch ? statusMatch[1] : "";
        }
        const detail = textOf(root, [
          ".express-info_detail", ".logistics-desc", ".latest-trace",
          "[class*='logisticsDesc']", "[class*='latestTrace']"
        ]);
        const etaMatch = text.match(/((?:预计|预计送达|预计到达)[^，。]{0,32})/);
        const etaText = etaMatch ? clean(etaMatch[1]) : "";
        const imageNode = root.querySelector(".express-info_thumb img, img");
        const imageURL = absoluteURL(imageNode && (
          imageNode.currentSrc || imageNode.src || imageNode.getAttribute("data-src")
        ));
        if (!orderID && !title && !status) continue;
        records.push({
          id: orderID || null, title: title || "菜鸟包裹", status: status || null,
          detail: detail || null, etaText: etaText || null,
          imageURL: imageURL || null, detailURL: location.href
        });
        if (records.length >= 30) break;
      }
      return JSON.stringify({
        pageTitle: clean(document.title) || null,
        loggedIn,
        orders: records
      });
    })();
    """#
}
