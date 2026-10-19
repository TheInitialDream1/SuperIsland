"use strict";

var PLATFORM = "meituan";
var ACCENT = { r: 1.0, g: 0.78, b: 0.04, a: 1 };
var GREEN = { r: 0.30, g: 0.82, b: 0.49, a: 1 };
var WHITE_88 = { r: 1, g: 1, b: 1, a: 0.88 };
var WHITE_60 = { r: 1, g: 1, b: 1, a: 0.60 };
var WHITE_42 = { r: 1, g: 1, b: 1, a: 0.42 };
var PANEL = { r: 1, g: 1, b: 1, a: 0.055 };

var bridge = {
  state: "idle",
  statusText: "Not connected",
  connected: false,
  needsLogin: false,
  orders: [],
  lastError: null
};

function syncSnapshot() {
  if (!SuperIsland.system || typeof SuperIsland.system.getLiveOrders !== "function") return bridge;
  var next = SuperIsland.system.getLiveOrders(20);
  if (!next || typeof next !== "object") return bridge;
  next.orders = (Array.isArray(next.orders) ? next.orders : []).filter(function (order) {
    return order && order.platform === PLATFORM;
  });
  var platforms = Array.isArray(next.platforms) ? next.platforms : [];
  var status = platforms.find(function (item) { return item && item.id === PLATFORM; });
  if (status) {
    next.state = status.state;
    next.statusText = status.statusText;
    next.connected = status.connected;
    next.needsLogin = status.needsLogin;
    next.lastSyncAt = status.lastSyncAt;
    next.lastError = status.lastError;
  }
  bridge = next;
  return bridge;
}

function activeOrders() {
  return bridge.orders.filter(function (order) { return order && order.isActive; });
}

function primaryOrder() {
  var active = activeOrders();
  return active[0] || bridge.orders[0] || null;
}

function orderColor(order) {
  if (!order || !order.isActive || Number(order.progress) >= 1) return GREEN;
  return ACCENT;
}

function compact() {
  syncSnapshot();
  var order = primaryOrder();
  if (!bridge.connected || !order) {
    return View.hstack([
      View.icon("takeoutbag.and.cup.and.straw.fill", { size: 14, color: ACCENT }),
      View.text(bridge.state === "loading" ? "Syncing delivery" : (bridge.needsLogin ? "Connect Meituan" : "No active delivery"), {
        style: "caption", color: WHITE_88, lineLimit: 1
      })
    ], { spacing: 7, align: "center" });
  }
  return View.hstack([
    View.icon("takeoutbag.and.cup.and.straw.fill", { size: 14, color: orderColor(order) }),
    View.vstack([
      View.text(order.status || "Delivery update", { style: "caption", color: WHITE_88, lineLimit: 1 }),
      View.text(order.etaText || order.title || "Meituan", { style: "footnote", color: WHITE_42, lineLimit: 1 })
    ], { spacing: 1, align: "leading" })
  ], { spacing: 7, align: "center" });
}

function connectionPrompt() {
  var loading = bridge.state === "loading";
  return View.hstack([
    View.frame(
      View.cornerRadius(
        View.background(
          View.frame(View.icon(loading ? "arrow.triangle.2.circlepath" : "link", { size: 22, color: ACCENT }), { width: 48, height: 48 }),
          PANEL
        ),
        12
      ),
      { width: 48, height: 48 }
    ),
    View.vstack([
      View.text(loading ? "Syncing Meituan delivery" : "Connect Meituan Delivery", { style: "headline", color: WHITE_88, lineLimit: 1 }),
      View.text(bridge.lastError || bridge.statusText || "Sign in once to read rider progress.", { style: "caption", color: WHITE_60, lineLimit: 2 }),
      loading
        ? View.progress(0.38, { total: 1, color: ACCENT })
        : View.button(View.text("Open secure login", { style: "caption", color: ACCENT }), "connect")
    ], { spacing: 5, align: "leading" }),
    View.spacer(4)
  ], { spacing: 12, align: "center" });
}

function orderSummary(order, showButton) {
  var color = orderColor(order);
  return View.vstack([
    View.hstack([
      View.icon("takeoutbag.and.cup.and.straw.fill", { size: 17, color: color }),
      View.vstack([
        View.text(order.title || "Meituan Delivery", { style: "headline", color: WHITE_88, lineLimit: 1 }),
        View.text(order.status || "Delivery update", { style: "caption", color: color, lineLimit: 1 })
      ], { spacing: 2, align: "leading" }),
      View.spacer(4),
      View.text(order.etaText || "", { style: "caption", color: WHITE_60, lineLimit: 1 })
    ], { spacing: 9, align: "center" }),
    View.progress(Math.max(0, Math.min(1, Number(order.progress) || 0)), { total: 1, color: color }),
    View.hstack([
      View.text(order.detail || "Meituan · just updated", { style: "footnote", color: WHITE_42, lineLimit: 1 }),
      View.spacer(4),
      showButton
        ? View.button(View.text("Details", { style: "caption", color: color }), "open/" + encodeURIComponent(order.id || ""))
        : View.text("", { style: "footnote", color: WHITE_42 })
    ], { spacing: 6, align: "center" })
  ], { spacing: 6, align: "leading" });
}

function expanded() {
  syncSnapshot();
  var order = primaryOrder();
  if (!bridge.connected || !order) return connectionPrompt();
  return View.hstack([
    View.frame(orderSummary(order, true), { maxWidth: 9999, alignment: "leading" }),
    View.button(View.icon("arrow.clockwise", { size: 14, color: WHITE_60 }), "refresh")
  ], { spacing: 12, align: "center" });
}

function fullExpanded() {
  syncSnapshot();
  if (!bridge.connected || bridge.orders.length === 0) return connectionPrompt();
  var visible = (activeOrders().length ? activeOrders() : bridge.orders).slice(0, 3);
  var cards = visible.map(function (order) {
    return View.cornerRadius(
      View.background(View.padding(orderSummary(order, true), { edges: "all", amount: 9 }), PANEL),
      11
    );
  });
  return View.vstack([
    View.hstack([
      View.icon("takeoutbag.and.cup.and.straw.fill", { size: 17, color: ACCENT }),
      View.text("Meituan Delivery", { style: "title", color: WHITE_88 }),
      View.spacer(4),
      View.button(View.icon("arrow.clockwise", { size: 14, color: WHITE_60 }), "refresh")
    ], { spacing: 8, align: "center" }),
    View.scroll(View.vstack(cards, { spacing: 8, align: "leading" }), { axes: "vertical", showsIndicators: false })
  ], { spacing: 9, align: "leading" });
}

SuperIsland.registerModule({
  onActivate: function () {
    if (SuperIsland.system && typeof SuperIsland.system.startLiveOrderPlatform === "function") {
      SuperIsland.system.startLiveOrderPlatform(PLATFORM);
    }
    syncSnapshot();
  },
  compact: compact,
  expanded: expanded,
  fullExpanded: fullExpanded,
  minimalCompact: {
    leading: function () { return View.icon("takeoutbag.and.cup.and.straw.fill", { size: 12, color: ACCENT }); },
    trailing: function () {
      syncSnapshot();
      var count = activeOrders().length;
      return View.text(count > 0 ? String(count) : "—", { style: "caption", color: count > 0 ? ACCENT : WHITE_42 });
    },
    precedence: 1
  },
  onAction: function (actionID) {
    if (!SuperIsland.system) return;
    if (actionID === "connect" && typeof SuperIsland.system.openLiveOrderPlatform === "function") {
      SuperIsland.system.openLiveOrderPlatform(PLATFORM);
      return;
    }
    if (actionID === "refresh" && typeof SuperIsland.system.refreshLiveOrderPlatform === "function") {
      SuperIsland.system.refreshLiveOrderPlatform(PLATFORM);
      return;
    }
    if (actionID.indexOf("open/") === 0 && typeof SuperIsland.system.openLiveOrder === "function") {
      SuperIsland.system.openLiveOrder(decodeURIComponent(actionID.slice(5)));
    }
  }
});
