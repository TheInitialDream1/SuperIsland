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
  ["still", "静止", "专辑渐变与三行静态歌词，安静地陪你听完一首歌。"]
];
const modules = [
  ["home", "主页", "一眼看全的主页", "把正在播放、日历与天气放在一起，首页槽位可以自由调整。"],
  ["now-playing", "音乐", "音乐，始终在眼前", "专辑封面、播放控制和原生进度条。支持系统媒体与应用级回退。"],
  ["calendar", "日历", "重要安排，不用翻找", "月历、当天事件与近期安排，支持来源筛选和会议链接。"],
  ["weather", "天气", "抬眼，知道窗外", "当前天气、小时预报、体感、湿度、风速、紫外线与空气质量。"],
  ["shelf", "暂存架", "给灵感一个临时落点", "收纳文件、文件夹、图片、链接或文字，支持置顶、搜索与保留期限。"],
  ["teleprompter", "提词器", "把表达，留在视线前方", "滚动稿件、调节速度、字号与对齐，也可按需启用语音跟读模式。"],
  ["battery", "电池", "心里有电，工作有数", "电量、供电状态、预计可用时间和电量趋势，在同一处呈现。"],
  ["connectivity", "连接", "连接状态，一看就懂", "Wi-Fi 信号与蓝牙设备列表，及时了解身边设备的连接状态。"],
  ["notifications", "通知", "需要知道的，轻轻提醒", "汇集扩展、WhatsApp 集成与兼容应用广播，不是全量系统通知镜像。"],
  ["volume", "音量", "声音大小，随手掌握", "系统音量、音频输出设备，以及受支持媒体应用的相关音量入口。"]
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
  ["cainiao-packages", "菜鸟包裹", "让包裹物流有一个自己的位置"]
];

const asset = name => `site-assets/${name}.webp`;
function setPressed(container, selected) {
  container.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button === selected)));
}
const styleOptions = document.querySelector("#style-options");
styles.forEach(([key, name, description], index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = name;
  button.setAttribute("aria-pressed", String(key === "luminous"));
  button.addEventListener("click", () => {
    setPressed(styleOptions, button);
    document.querySelector("#style-preview").src = asset(`player-${key}`);
    document.querySelector("#style-preview").alt = `${name}样式：${description}`;
    document.querySelector("#style-name").textContent = name;
    document.querySelector("#style-description").textContent = description;
    document.querySelector("#style-counter").textContent = `${String(index + 1).padStart(2, "0")} / 15`;
  });
  styleOptions.append(button);
});
const moduleOptions = document.querySelector("#module-options");
modules.forEach(([key, name, title, description], index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span>`;
  button.append(document.createTextNode(name));
  button.setAttribute("aria-pressed", String(index === 0));
  button.addEventListener("click", () => {
    setPressed(moduleOptions, button);
    document.querySelector("#module-preview").src = asset(key);
    document.querySelector("#module-preview").alt = `${title}：${description}`;
    document.querySelector("#module-name").textContent = title;
    document.querySelector("#module-description").textContent = description;
    document.querySelector("#module-index").textContent = `${String(index + 1).padStart(2, "0")} / 10`;
  });
  moduleOptions.append(button);
});
document.querySelectorAll("[data-hero]").forEach(button => {
  button.addEventListener("click", () => {
    setPressed(button.parentElement, button);
    document.querySelector("#hero-preview").src = asset(button.dataset.hero);
    document.querySelector("#hero-preview").alt = `SuperIsland ${button.textContent}界面预览`;
  });
});
extensions.forEach(([key, name, description], index) => {
  const link = document.createElement("a");
  link.className = "extension-item";
  link.href = `https://github.com/TheInitialDream1/SuperIsland/tree/custom/Extensions/${key}`;
  const number = document.createElement("span");
  number.textContent = `EXT / ${String(index + 1).padStart(2, "0")}`;
  const title = document.createElement("h3"); title.textContent = name;
  const text = document.createElement("p"); text.textContent = description;
  link.append(number, title, text);
  document.querySelector("#extension-list").append(link);
});
const overview = document.querySelector("#overview-dialog");
document.querySelector("#open-overview").addEventListener("click", () => overview.showModal());
document.querySelector("#close-overview").addEventListener("click", () => overview.close());
overview.addEventListener("click", event => {
  const bounds = overview.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) overview.close();
});
document.querySelector("#copy-command").addEventListener("click", async () => {
  const feedback = document.querySelector("#copy-feedback");
  try {
    await navigator.clipboard.writeText(document.querySelector("#install-command").textContent);
    feedback.textContent = "命令已复制，可粘贴到终端。";
  } catch {
    const selection = window.getSelection();
    const range = document.createRange(); range.selectNodeContents(document.querySelector("#install-command"));
    selection.removeAllRanges(); selection.addRange(range);
    feedback.textContent = "请复制已选中的命令。";
  }
});
