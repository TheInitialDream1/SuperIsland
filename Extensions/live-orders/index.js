"use strict";

var ACCENT = { r: 0.93, g: 0.23, b: 0.16, a: 1 };
var ORANGE = { r: 1.0, g: 0.58, b: 0.12, a: 1 };
var GREEN = { r: 0.30, g: 0.82, b: 0.49, a: 1 };
var WHITE_85 = { r: 1, g: 1, b: 1, a: 0.85 };
var WHITE_60 = { r: 1, g: 1, b: 1, a: 0.60 };
var WHITE_42 = { r: 1, g: 1, b: 1, a: 0.42 };
var PANEL = { r: 1, g: 1, b: 1, a: 0.055 };

var bridge = {
  state: "idle",
  statusText: "Not connected",
  connected: false,
  needsLogin: false,
  orders: [],
  lastSyncAt: null,
  lastError: null
};

function objectOr(value, fallback) {
  return value && typeof value === "object" ? value : fallback;
}

function syncSnapshot() {
  if (!SuperIsland.system || typeof SuperIsland.system.getLiveOrders !== "function") return bridge;
  var next = objectOr(SuperIsland.system.getLiveOrders(12), null);
  if (next) {
    next.orders = (Array.isArray(next.orders) ? next.orders : []).filter(function (order) {
      return order && order.platform === "jd";
    });
    var platforms = Array.isArray(next.platforms) ? next.platforms : [];
    var jd = platforms.find(function (item) { return item && item.id === "jd"; });
    if (jd) {
      next.state = jd.state;
      next.statusText = jd.statusText;
      next.connected = jd.connected;
      next.needsLogin = jd.needsLogin;
      next.lastSyncAt = jd.lastSyncAt;
      next.lastError = jd.lastError;
    }
    bridge = next;
  }
  return bridge;
}

function activeOrders() {
  return bridge.orders.filter(function (order) { return order && order.isActive; });
}

function primaryOrder() {
  var active = activeOrders();
  return active.length > 0 ? active[0] : (bridge.orders[0] || null);
}

function statusColor(order) {
  if (!order) return WHITE_60;
  if (!order.isActive || Number(order.progress) >= 1) return GREEN;
  if (Number(order.progress) >= 0.75) return ORANGE;
  return ACCENT;
}

function compact() {
  syncSnapshot();
  var order = primaryOrder();

  if (!bridge.connected || !order) {
    var label = bridge.state === "loading"
      ? "Syncing orders"
      : (bridge.needsLogin ? "Connect JD" : "No active orders");
    return View.hstack([
      View.icon(bridge.needsLogin ? "link.badge.plus" : "shippingbox.fill", { size: 14, color: bridge.needsLogin ? ORANGE : ACCENT }),
      View.text(label, { style: "caption", color: WHITE_85, lineLimit: 1 })
    ], { spacing: 7, align: "center" });
  }

  return View.hstack([
    View.icon("shippingbox.fill", { size: 14, color: statusColor(order) }),
    View.vstack([
      View.text(order.status || "Order update", { style: "caption", color: WHITE_85, lineLimit: 1 }),
      View.text(order.etaText || order.platformName || "JD", { style: "footnote", color: WHITE_42, lineLimit: 1 })
    ], { spacing: 1, align: "leading" })
  ], { spacing: 7, align: "center" });
}

function connectionPrompt() {
  var loading = bridge.state === "loading";
  var title = loading ? "Syncing JD orders" : "Connect JD Orders";
  var detail = bridge.lastError || bridge.statusText || "Sign in once to read delivery progress.";
  return View.hstack([
    View.frame(
      View.cornerRadius(
        View.background(
          View.frame(View.icon(loading ? "arrow.triangle.2.circlepath" : "link", { size: 23, color: loading ? ORANGE : ACCENT }), { width: 50, height: 50 }),
          PANEL
        ),
        12
      ),
      { width: 50, height: 50 }
    ),
    View.vstack([
      View.text(title, { style: "headline", color: WHITE_85, lineLimit: 1 }),
      View.text(detail, { style: "caption", color: WHITE_60, lineLimit: 2 }),
      loading
        ? View.progress(0.36, { total: 1, color: ORANGE })
        : View.button(View.text("Open secure login", { style: "caption", color: ACCENT }), "connect")
    ], { spacing: 5, align: "leading" }),
    View.spacer(4)
  ], { spacing: 12, align: "center" });
}

function orderSummary(order, showButton) {
  var color = statusColor(order);
  var subtitle = order.detail || order.etaText || (order.platformName || "JD") + " · just updated";
  var rows = [
    View.hstack([
      View.icon("shippingbox.fill", { size: 17, color: color }),
      View.vstack([
        View.text(order.title || "JD Order", { style: "headline", color: WHITE_85, lineLimit: 1 }),
        View.text(order.status || "Order update", { style: "caption", color: color, lineLimit: 1 })
      ], { spacing: 2, align: "leading" }),
      View.spacer(4),
      View.text(order.etaText || "", { style: "caption", color: WHITE_60, lineLimit: 1 })
    ], { spacing: 9, align: "center" }),
    View.progress(Math.max(0, Math.min(1, Number(order.progress) || 0)), { total: 1, color: color }),
    View.hstack([
      View.text(subtitle, { style: "footnote", color: WHITE_42, lineLimit: 1 }),
      View.spacer(4),
      showButton
        ? View.button(View.text("Details", { style: "caption", color: color }), "open/" + encodeURIComponent(order.id || ""))
        : View.text("", { style: "footnote", color: WHITE_42 })
    ], { spacing: 6, align: "center" })
  ];
  return View.vstack(rows, { spacing: 6, align: "leading" });
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

  var active = activeOrders();
  var visible = (active.length > 0 ? active : bridge.orders).slice(0, 3);
  var cards = visible.map(function (order) {
    return View.cornerRadius(
      View.background(
        View.padding(orderSummary(order, true), { edges: "all", amount: 9 }),
        PANEL
      ),
      11
    );
  });

  return View.vstack([
    View.hstack([
      View.icon("shippingbox.fill", { size: 17, color: ACCENT }),
      View.text("JD Orders", { style: "title", color: WHITE_85 }),
      View.text(String(active.length) + " active", { style: "caption", color: WHITE_60 }),
      View.spacer(4),
      View.button(View.icon("arrow.clockwise", { size: 14, color: WHITE_60 }), "refresh")
    ], { spacing: 8, align: "center" }),
    View.scroll(View.vstack(cards, { spacing: 8, align: "leading" }), { axes: "vertical", showsIndicators: false })
  ], { spacing: 9, align: "leading" });
}

function minimalLeading() {
  syncSnapshot();
  var order = primaryOrder();
  return View.icon("shippingbox.fill", { size: 12, color: order ? statusColor(order) : WHITE_42 });
}

function minimalTrailing() {
  syncSnapshot();
  var count = activeOrders().length;
  return View.text(count > 0 ? String(count) : "—", { style: "caption", color: count > 0 ? ORANGE : WHITE_42 });
}

SuperIsland.registerModule({
  onActivate: function () {
    if (SuperIsland.system && typeof SuperIsland.system.startLiveOrderPlatform === "function") {
      SuperIsland.system.startLiveOrderPlatform("jd");
    } else if (SuperIsland.system && typeof SuperIsland.system.startLiveOrders === "function") {
      SuperIsland.system.startLiveOrders();
    }
    syncSnapshot();
  },
  compact: compact,
  expanded: expanded,
  fullExpanded: fullExpanded,
  minimalCompact: {
    leading: minimalLeading,
    trailing: minimalTrailing,
    precedence: 1
  },
  onAction: function (actionID) {
    if (!SuperIsland.system) return;
    if (actionID === "connect" && typeof SuperIsland.system.openLiveOrderPlatform === "function") {
      SuperIsland.system.openLiveOrderPlatform("jd");
      return;
    }
    if (actionID === "connect" && typeof SuperIsland.system.openLiveOrdersLogin === "function") {
      SuperIsland.system.openLiveOrdersLogin();
      return;
    }
    if (actionID === "refresh" && typeof SuperIsland.system.refreshLiveOrderPlatform === "function") {
      SuperIsland.system.refreshLiveOrderPlatform("jd");
      return;
    }
    if (actionID === "refresh" && typeof SuperIsland.system.refreshLiveOrders === "function") {
      SuperIsland.system.refreshLiveOrders();
      return;
    }
    if (actionID.indexOf("open/") === 0 && typeof SuperIsland.system.openLiveOrder === "function") {
      SuperIsland.system.openLiveOrder(decodeURIComponent(actionID.slice(5)));
    }
  }
});
