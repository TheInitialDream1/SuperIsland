"use strict";
const styles = [
  ["standard", "原版", "左侧封面、右侧四行歌词，保留独立进度条。"],
  ["luminous", "流光", "居中逐字歌词、流动专辑色背景和底部胶囊播放器。"],
  ["mindscape", "心象", "散落的字云与焦点光圈，把歌词铺满整幅画布。"],
  ["staircase", "云阶", "竖排文字列、阶梯偏移和轻盈的引导线。"],
  ["floating", "浮名", "满幅大字与层叠上下文，把当下这一句放在心上。"],
  ["chorus", "群唱", "交替的聊天气泡与头像，像一场旋律里的对话。"],
  ["tilt", "倾诉", "水平主句与倾斜上下文，在错落间表达情绪。"],
  ["orbit", "回环", "椭圆歌词轨道与环绕点，让每一句循光而来。"],
  ["diorama", "镜台", "明亮专辑色与透视歌词走廊，层次在小窗中展开。"],
  ["clockwork", "时计", "原生转动齿轮、时钟与歌词，听见时间的步伐。"],
  ["sonnet", "商籁", "海报边框、衬线文字与编号，把歌词排成诗。"],
  ["tempera", "凝彩", "分区色块、巨型索引与分割线，简洁而鲜明。"],
  ["lumiere", "绘光", "深色舞台与贯穿窗口的光束，支持真实音频响应。"],
  ["monet", "莫奈", "一侧歌曲与歌词，一侧倾斜封面，像一张唱片海报。"],
  ["still", "静止", "专辑渐变与三行静态歌词，安静地陪你听完一首歌。"],
];
const modules = [
  [
    "home",
    "主页",
    "一眼看全的主页",
    "把正在播放、日历与天气放在一起，首页槽位可以自由调整。",
  ],
  [
    "now-playing",
    "音乐",
    "音乐，始终在眼前",
    "专辑封面、播放控制和原生进度条。支持系统媒体与应用级回退。",
  ],
  [
    "calendar",
    "日历",
    "重要安排，不用翻找",
    "月历、当天事件与近期安排，支持来源筛选和会议链接。",
  ],
  [
    "weather",
    "天气",
    "抬眼，知道窗外",
    "当前天气、小时预报、体感、湿度、风速、紫外线与空气质量。",
  ],
  [
    "shelf",
    "暂存架",
    "给灵感一个临时落点",
    "收纳文件、文件夹、图片、链接或文字，支持置顶、搜索与保留期限。",
  ],
  [
    "teleprompter",
    "提词器",
    "把表达，留在视线前方",
    "滚动稿件、调节速度、字号与对齐，也可按需启用语音跟读模式。",
  ],
  [
    "battery",
    "电池",
    "心里有电，工作有数",
    "电量、供电状态、预计可用时间和电量趋势，在同一处呈现。",
  ],
  [
    "connectivity",
    "连接",
    "连接状态，一看就懂",
    "Wi-Fi 信号与蓝牙设备列表，及时了解身边设备的连接状态。",
  ],
  [
    "notifications",
    "通知",
    "需要知道的，轻轻提醒",
    "汇集扩展、WhatsApp 集成与兼容应用广播，不是全量系统通知镜像。",
  ],
  [
    "volume",
    "音量",
    "声音大小，随手掌握",
    "系统音量、音频输出设备，以及受支持媒体应用的相关音量入口。",
  ],
];
const extensions = [
  ["synced-lyrics", "同步歌词", "逐字与逐行同步，15 种原生场景"],
  ["pomodoro", "番茄钟", "在专注与休息之间，找到节奏"],
  ["ai-usage", "AI 额度", "本机可用的 Codex / Claude 额度信息"],
  ["agents-status", "代理任务", "通过本地桥接与 hooks 关注任务状态"],
  ["whatsapp-web", "WhatsApp", "连接自己的账号，查看消息与操作"],
  ["linear-mentions", "Linear", "让提及与任务更新离你更近"],
  ["lastfm-scrobbler", "Last.fm", "把正在听的音乐记入自己的账号"],
  ["live-orders", "京东订单", "关注订单与配送进度"],
  ["meituan-delivery", "美团配送", "查看订单与配送状态"],
  ["cainiao-packages", "菜鸟包裹", "让包裹物流有一个自己的位置"],
];

const asset = (name) => `site-assets/${name}.webp`;
const $ = (selector) => document.querySelector(selector);
function setPressed(container, selected) {
  container
    .querySelectorAll("button")
    .forEach((b) => b.setAttribute("aria-pressed", String(b === selected)));
}
let selectedStyle = 1;
const styleTrack = $("#style-track");
const carouselShell = $(".carousel-shell");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const slideIndices = [
  styles.length - 2,
  styles.length - 1,
  ...styles.map((_, i) => i),
  0,
  1,
];
let slidePosition = selectedStyle + 2;
let carouselBusy = false;
let carouselTimer;
let pendingSelection = null;
const slideQueue = [];

slideIndices.forEach((styleIndex) => {
  const [key, name, description] = styles[styleIndex];
  const card = document.createElement("article");
  card.className = "showcase-card";
  card.setAttribute("aria-hidden", "true");
  const copy = document.createElement("div");
  copy.className = "showcase-description";
  const counter = document.createElement("span");
  counter.dataset.role = "counter";
  counter.textContent = `${String(styleIndex + 1).padStart(2, "0")} / 15`;
  const title = document.createElement("h3");
  title.dataset.role = "name";
  title.textContent = name;
  const text = document.createElement("p");
  text.dataset.role = "description";
  text.textContent = description;
  copy.append(counter, title, text);
  const computer = document.createElement("div");
  computer.className = "macbook";
  const frame = document.createElement("img");
  frame.className = "macbook-frame";
  frame.src = "site-assets/macbook-frame.png";
  frame.alt = "MacBook 展示模型";
  frame.draggable = false;
  const screen = document.createElement("div");
  screen.className = "macbook-screen";
  const player = document.createElement("img");
  player.dataset.role = "preview";
  player.src = asset(`player-${key}`);
  player.alt = `${name}完整原生歌词窗口`;
  player.width = 1316;
  player.height = 554;
  player.draggable = false;
  screen.append(player);
  computer.append(frame, screen);
  card.append(copy, computer);
  styleTrack.append(card);
});
function slideStride() {
  return (
    carouselShell.clientWidth +
    parseFloat(getComputedStyle(styleTrack).columnGap)
  );
}
function positionTrack(extra = 0) {
  styleTrack.style.transform = `translate3d(${-slidePosition * slideStride() + extra}px,0,0)`;
}
function updateSelectedSlide() {
  for (const id of [
    "style-counter",
    "style-name",
    "style-description",
    "style-preview",
  ]) {
    document.getElementById(id)?.removeAttribute("id");
  }
  [...styleTrack.children].forEach((card, i) => {
    card.setAttribute("aria-hidden", String(i !== slidePosition));
    card.classList.toggle("is-current", i === slidePosition);
  });
  const card = styleTrack.children[slidePosition];
  for (const role of ["counter", "name", "description", "preview"]) {
    card.querySelector(`[data-role="${role}"]`).id = `style-${role}`;
  }
  setPressed($("#style-options"), $("#style-options").children[selectedStyle]);
  $("#style-announcement").textContent =
    `${styles[selectedStyle][1]}，第 ${selectedStyle + 1} 种，共 15 种`;
}
function finishSlide() {
  if (!carouselBusy) return;
  clearTimeout(carouselTimer);
  carouselBusy = false;
  if (slidePosition < 2 || slidePosition >= styles.length + 2) {
    styleTrack.classList.add("is-repositioning");
    slidePosition = selectedStyle + 2;
    positionTrack();
    updateSelectedSlide();
    void styleTrack.offsetWidth;
    styleTrack.classList.remove("is-repositioning");
  }
  if (pendingSelection !== null) {
    const targetIndex = pendingSelection;
    pendingSelection = null;
    showStyle(targetIndex);
  } else if (slideQueue.length) {
    const direction = slideQueue.shift();
    animateSlide(selectedStyle + direction, slidePosition + direction);
  }
}
function animateSlide(index, position) {
  const distance = Math.abs(position - slidePosition);
  selectedStyle = (index + styles.length) % styles.length;
  slidePosition = position;
  carouselBusy = true;
  styleTrack.style.setProperty(
    "--slide-duration",
    `${Math.min(900, 450 + distance * 55)}ms`,
  );
  updateSelectedSlide();
  positionTrack();
  if (motionPreference.matches || distance === 0) {
    finishSlide();
  } else {
    // Fallback also settles the queue when the tab is hidden during a transition.
    carouselTimer = setTimeout(
      finishSlide,
      Math.min(900, 450 + distance * 55) + 90,
    );
  }
}
function showStyle(index) {
  const next = (index + styles.length) % styles.length;
  slideQueue.length = 0;
  if (carouselBusy) {
    pendingSelection = next;
    return;
  }
  animateSlide(next, next + 2);
}
function moveStyle(direction) {
  pendingSelection = null;
  if (carouselBusy) {
    slideQueue.push(direction);
    return;
  }
  animateSlide(selectedStyle + direction, slidePosition + direction);
}
styles.forEach(([, name], i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = name;
  b.setAttribute("aria-pressed", String(i === selectedStyle));
  b.addEventListener("click", () => showStyle(i));
  $("#style-options").append(b);
});
styleTrack.classList.add("is-repositioning");
positionTrack();
updateSelectedSlide();
void styleTrack.offsetWidth;
styleTrack.classList.remove("is-repositioning");
styleTrack.addEventListener("transitionend", (e) => {
  if (e.target === styleTrack && e.propertyName === "transform") finishSlide();
});
$("#previous-style").addEventListener("click", () => moveStyle(-1));
$("#next-style").addEventListener("click", () => moveStyle(1));
carouselShell.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    moveStyle(e.key === "ArrowLeft" ? -1 : 1);
  }
});
new ResizeObserver(() => {
  styleTrack.classList.add("is-repositioning");
  positionTrack();
  void styleTrack.offsetWidth;
  styleTrack.classList.remove("is-repositioning");
}).observe(carouselShell);
motionPreference.addEventListener("change", () => {
  if (motionPreference.matches) finishSlide();
});
let drag = null;
styleTrack.addEventListener("pointerdown", (e) => {
  if (carouselBusy || e.button !== 0) return;
  drag = {
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    dx: 0,
    horizontal: false,
  };
});
styleTrack.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x,
    dy = e.clientY - drag.y;
  if (!drag.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
    drag.horizontal = true;
    styleTrack.setPointerCapture(e.pointerId);
    styleTrack.classList.add("is-dragging");
  }
  if (!drag.horizontal) return;
  drag.dx = dx;
  positionTrack(dx);
});
function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const ended = drag;
  drag = null;
  if (!ended.horizontal) return;
  styleTrack.classList.remove("is-dragging");
  if (styleTrack.hasPointerCapture(e.pointerId))
    styleTrack.releasePointerCapture(e.pointerId);
  if (
    e.type !== "pointercancel" &&
    Math.abs(ended.dx) > Math.min(80, carouselShell.clientWidth * 0.15)
  ) {
    moveStyle(ended.dx < 0 ? 1 : -1);
  } else {
    animateSlide(selectedStyle, slidePosition);
  }
}
styleTrack.addEventListener("pointerup", endDrag);
styleTrack.addEventListener("pointercancel", endDrag);
styleTrack.addEventListener("lostpointercapture", (e) => {
  if (drag) endDrag(e);
});
modules.forEach(([key, name, title, description], i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = name;
  b.setAttribute("aria-pressed", String(i === 0));
  b.addEventListener("click", () => {
    setPressed($("#module-options"), b);
    $("#module-preview").src = asset(key);
    $("#module-preview").alt = title;
    $("#module-name").textContent = title;
    $("#module-description").textContent = description;
  });
  $("#module-options").append(b);
});
document.querySelectorAll("[data-demo]").forEach((b) =>
  b.addEventListener("click", () => {
    setPressed(b.parentElement, b);
    $("#demo-preview").src = asset(b.dataset.demo);
    $("#demo-preview").alt = `SuperIsland ${b.textContent}真实组件预览`;
  }),
);
extensions.forEach(([key, name, description], i) => {
  const a = document.createElement("a");
  a.className = "extension-item";
  a.href = `https://github.com/TheInitialDream1/SuperIsland/tree/custom/Extensions/${key}`;
  const n = document.createElement("span");
  n.textContent = `EXT / ${String(i + 1).padStart(2, "0")}`;
  const h = document.createElement("h3");
  h.textContent = name;
  const p = document.createElement("p");
  p.textContent = description;
  a.append(n, h, p);
  $("#extension-list").append(a);
});
const overview = $("#overview-dialog");
$("#open-overview").addEventListener("click", () => overview.showModal());
$("#close-overview").addEventListener("click", () => overview.close());
overview.addEventListener("click", (e) => {
  const r = overview.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  )
    overview.close();
});
// Pointer-driven pendulum and character motion, matching the reference scene.
const hero = $(".cn-home-hero"),
  mascot = $(".cn-home-mascot");
const reduce = matchMedia("(prefers-reduced-motion: reduce)"),
  fine = matchMedia("(pointer: fine)");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const target = { angle: 0, x: 50, y: 57, mx: 0, my: 0, tilt: 0, ex: 0, ey: 0 };
const current = { ...target };
let velocity = 0,
  frame = 0,
  visible = true;
function resetMotion() {
  Object.assign(target, {
    angle: 0,
    x: 50,
    y: 57,
    mx: 0,
    my: 0,
    tilt: 0,
    ex: 0,
    ey: 0,
  });
}
function onPointer(e) {
  if (reduce.matches || !fine.matches) return;
  const r = hero.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  ) {
    resetMotion();
    return;
  }
  const dx = e.clientX - (r.left + r.width / 2),
    dy = Math.max(210, e.clientY - r.top - 8),
    m = mascot.getBoundingClientRect(),
    mx = e.clientX - m.left - m.width / 2,
    my = e.clientY - m.top - m.height / 2;
  Object.assign(target, {
    angle: clamp(((-Math.atan2(dx, dy) * 180) / Math.PI) * 0.56, -14, 14),
    x: clamp(((e.clientX - r.left) / r.width) * 100, 14, 86),
    y: clamp(((e.clientY - r.top) / r.height) * 100, 30, 84),
    mx: clamp(mx * 0.014, -6, 6),
    my: clamp(my * 0.008, -3, 3),
    tilt: clamp(mx * 0.008, -3.2, 3.2),
    ex: clamp(mx * 0.025, -7, 7),
    ey: clamp(my * 0.02, -5, 5),
  });
}
function tick() {
  frame = 0;
  if (!visible || document.hidden || reduce.matches || !fine.matches) return;
  velocity += (target.angle - current.angle) * 0.045;
  velocity *= 0.87;
  current.angle += velocity;
  for (const k of ["x", "y", "mx", "my"])
    current[k] += (target[k] - current[k]) * 0.085;
  current.tilt += (target.tilt - current.tilt) * 0.075;
  current.ex += (target.ex - current.ex) * 0.16;
  current.ey += (target.ey - current.ey) * 0.16;
  hero.style.setProperty("--cn-lamp-angle", `${current.angle.toFixed(3)}deg`);
  hero.style.setProperty("--cn-spot-x", `${current.x.toFixed(2)}%`);
  hero.style.setProperty("--cn-spot-y", `${current.y.toFixed(2)}%`);
  for (const [key, css] of [
    ["mx", "x"],
    ["my", "y"],
    ["tilt", "tilt"],
  ])
    mascot.style.setProperty(
      `--cn-mascot-${css}`,
      `${current[key].toFixed(2)}${key === "tilt" ? "deg" : "px"}`,
    );
  mascot.style.setProperty("--cn-eye-x", `${current.ex.toFixed(2)}px`);
  mascot.style.setProperty("--cn-eye-y", `${current.ey.toFixed(2)}px`);
  frame = requestAnimationFrame(tick);
}
function startMotion() {
  if (!frame) frame = requestAnimationFrame(tick);
}
document.addEventListener("pointermove", onPointer, { passive: true });
hero.addEventListener("pointerleave", resetMotion);
document.documentElement.addEventListener("pointerleave", resetMotion);
document.addEventListener("visibilitychange", startMotion);
reduce.addEventListener("change", () => {
  resetMotion();
  if (reduce.matches) {
    cancelAnimationFrame(frame);
    frame = 0;
    hero.style.removeProperty("--cn-lamp-angle");
    hero.style.removeProperty("--cn-spot-x");
    hero.style.removeProperty("--cn-spot-y");
    mascot.removeAttribute("style");
  } else startMotion();
});
fine.addEventListener("change", () => {
  resetMotion();
  startMotion();
});
window.addEventListener("resize", resetMotion, { passive: true });
new IntersectionObserver(
  ([entry]) => {
    visible = entry.isIntersecting;
    if (visible) startMotion();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  },
  { threshold: 0 },
).observe(hero);
startMotion();

// Match the reference's gentle section entrance without hiding content when JS is unavailable.
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting) {
        entry.target.classList.add("is-inview");
        revealObserver.unobserve(entry.target);
      }
  },
  { threshold: 0.08 },
);
for (const el of document.querySelectorAll(
  ".bento,.workflow-panel,.lyrics-feature,.extension-item",
)) {
  el.classList.add("scroll-reveal");
  revealObserver.observe(el);
}

const playerDialog = document.querySelector("#player-dialog");
document.querySelector("#open-player").addEventListener("click", () => {
  const [key, name] = styles[selectedStyle];
  document.querySelector("#player-detail-image").src = asset(`player-${key}`);
  document.querySelector("#player-detail-image").alt =
    `${name}播放器完整原生窗口，包含两侧外翻弧角`;
  document.querySelector("#player-dialog-title").textContent =
    `${name} · 完整原生窗口`;
  playerDialog.showModal();
});
document
  .querySelector("#close-player")
  .addEventListener("click", () => playerDialog.close());
