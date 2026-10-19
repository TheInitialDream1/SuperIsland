# 截图图鉴

[返回项目介绍](../README.md)

## 截图说明

播放器、内置组件和扩展使用真实项目视图渲染。截图工具使用隔离的演示数据和临时服务初始化副本，不采集用户的真实通知、日程、账号、订单或音频。示例歌词《向光而行》、歌手名和专辑封面均为文档演示内容。

扩展截图调用实际 JavaScript 的视图函数，再通过原生 ViewNodeRenderer 绘制，展示初始／未连接状态。图中不验证外部服务的在线可用性。番茄钟的可下载吉祥物未加载。静态截图不会展示完整动画；真实逐字、齿轮和场景过渡需在应用中体验。

用户提供的效果总览：

![用户提供的 15 种效果总览](../assets/player-styles-overview.png)

## 播放器图鉴

15 种样式的离线示例总览：

![全部播放器场景](screenshots/player-styles.png)

### 原版

左侧专辑封面，右侧四行歌词，保留独立进度条。

![原版完整布局](screenshots/player-standard.png)

<details>
<summary>查看原版的紧凑布局</summary>

![原版紧凑布局](screenshots/player-standard-compact.png)

</details>

### 流光

居中逐字歌词、流动专辑色背景和底部胶囊播放器。

![流光完整布局](screenshots/player-luminous.png)

<details>
<summary>查看流光的紧凑布局</summary>

![流光紧凑布局](screenshots/player-luminous-compact.png)

</details>

### 心象

散落字云、焦点光圈和上下文，歌曲信息收在顶部。

![心象完整布局](screenshots/player-mindscape.png)

<details>
<summary>查看心象的紧凑布局</summary>

![心象紧凑布局](screenshots/player-mindscape-compact.png)

</details>

### 云阶

竖排文字列、阶梯偏移和引导线。

![云阶完整布局](screenshots/player-staircase.png)

<details>
<summary>查看云阶的紧凑布局</summary>

![云阶紧凑布局](screenshots/player-staircase-compact.png)

</details>

### 浮名

满幅大字和层叠上下文，强调当前句的视觉重心。

![浮名完整布局](screenshots/player-floating.png)

<details>
<summary>查看浮名的紧凑布局</summary>

![浮名紧凑布局](screenshots/player-floating-compact.png)

</details>

### 群唱

交替的聊天气泡、头像与染色背景。

![群唱完整布局](screenshots/player-chorus.png)

<details>
<summary>查看群唱的紧凑布局</summary>

![群唱紧凑布局](screenshots/player-chorus-compact.png)

</details>

### 倾诉

水平主句与倾斜的上下文歌词。

![倾诉完整布局](screenshots/player-tilt.png)

<details>
<summary>查看倾诉的紧凑布局</summary>

![倾诉紧凑布局](screenshots/player-tilt-compact.png)

</details>

### 回环

椭圆歌词轨道、环绕点和居中播放控制。

![回环完整布局](screenshots/player-orbit.png)

<details>
<summary>查看回环的紧凑布局</summary>

![回环紧凑布局](screenshots/player-orbit-compact.png)

</details>

### 镜台

明亮专辑色、透视走廊和几何层次。

![镜台完整布局](screenshots/player-diorama.png)

<details>
<summary>查看镜台的紧凑布局</summary>

![镜台紧凑布局](screenshots/player-diorama-compact.png)

</details>

### 时计

左侧原生转动齿轮与时钟，右侧歌词。

![时计完整布局](screenshots/player-clockwork.png)

<details>
<summary>查看时计的紧凑布局</summary>

![时计紧凑布局](screenshots/player-clockwork-compact.png)

</details>

### 商籁

海报边框、角标、衬线文字和歌词编号。

![商籁完整布局](screenshots/player-sonnet.png)

<details>
<summary>查看商籁的紧凑布局</summary>

![商籁紧凑布局](screenshots/player-sonnet-compact.png)

</details>

### 凝彩

上下分区色块、巨型索引与分割线。

![凝彩完整布局](screenshots/player-tempera.png)

<details>
<summary>查看凝彩的紧凑布局</summary>

![凝彩紧凑布局](screenshots/player-tempera-compact.png)

</details>

### 绘光

深色舞台、贯穿窗口的光束与音频响应；截图使用零音频能量。

![绘光完整布局](screenshots/player-lumiere.png)

<details>
<summary>查看绘光的紧凑布局</summary>

![绘光紧凑布局](screenshots/player-lumiere-compact.png)

</details>

### 莫奈

左侧歌曲、专辑和歌词，右侧倾斜封面，背景完全不透明。

![莫奈完整布局](screenshots/player-monet.png)

<details>
<summary>查看莫奈的紧凑布局</summary>

![莫奈紧凑布局](screenshots/player-monet-compact.png)

</details>

### 静止

原版专辑渐变与三行静态歌词，减少装饰运动。

![静止完整布局](screenshots/player-still.png)

<details>
<summary>查看静止的紧凑布局</summary>

![静止紧凑布局](screenshots/player-still-compact.png)

</details>

## 内置组件图鉴

### 主页

音乐、日历、天气三栏；可在设置中调整首页槽位。

![主页](screenshots/home.png)

### 音乐播放器

系统媒体、封面、播放控制和原生进度条。

![音乐播放器](screenshots/now-playing.png)

### 系统音量

系统音量与音频输出设备，支持媒体应用的相关音量入口。

![系统音量](screenshots/volume.png)

### 电池

电量、供电状态、预计时间和历史趋势。

![电池](screenshots/battery.png)

### 连接状态

Wi-Fi 信号和蓝牙设备列表；截图设备名为演示内容。

![连接状态](screenshots/connectivity.png)

### 日历

月历、所选日期事件和近期安排。

![日历](screenshots/calendar.png)

### 天气

当前天气、小时预报、体感、湿度、风速、紫外线和 AQI。

![天气](screenshots/weather.png)

### 通知

来自扩展、WhatsApp 集成和兼容广播的通知卡片；不是全量系统通知镜像。

![通知](screenshots/notifications.png)

### 文件暂存架

保存链接、文字、文件、文件夹或图片；支持搜索与置顶。

![文件暂存架](screenshots/shelf.png)

### 提词器

滚动稿件、播放／暂停、字号、对齐、速度与编辑入口。

![提词器](screenshots/teleprompter.png)

### 专注状态

紧凑状态指示；这里使用演示中的专注名称。

![专注状态](screenshots/focus.png)

### 设置

通用、模块、外观、扩展、高级设置；截图展示通用页。

![设置](screenshots/settings.png)

## 扩展组件图鉴

### 番茄钟

工作／休息阶段、倒计时和会话统计。

![番茄钟初始或未连接界面](screenshots/extension-pomodoro.png)

### AI 额度

通过宿主读取本机可用额度数据；未连接状态不代表额度为零。

![AI 额度初始或未连接界面](screenshots/extension-ai-usage.png)

### 代理任务状态

连接本地桥接服务和 hooks 后显示任务状态。

![代理任务状态初始或未连接界面](screenshots/extension-agents-status.png)

### WhatsApp

需要用户自己的 WhatsApp 登录与 Node.js provider。

![WhatsApp初始或未连接界面](screenshots/extension-whatsapp-web.png)

### Linear Mentions

需要用户连接自己的 Linear 账号。

![Linear Mentions初始或未连接界面](screenshots/extension-linear-mentions.png)

### Last.fm

连接用户自己的账号后提交播放记录。

![Last.fm初始或未连接界面](screenshots/extension-lastfm-scrobbler.png)

### 京东订单

网页登录后的订单与配送状态；此图为未连接界面。

![京东订单初始或未连接界面](screenshots/extension-live-orders.png)

### 美团配送

展示订单与配送进度；此图为未连接界面。

![美团配送初始或未连接界面](screenshots/extension-meituan-delivery.png)

### 菜鸟包裹

展示物流与包裹状态；此图为未连接界面。

![菜鸟包裹初始或未连接界面](screenshots/extension-cainiao-packages.png)

### Live Football

保留的 2026 世界杯赛事扩展示例，未加入默认应用打包列表。

![Live Football初始或未连接界面](screenshots/extension-live-football.png)

## 重新生成

要求 macOS 14+、Swift 5.9+、Python 3、Node.js 18+。无需安装 Python 第三方包。

```bash
python3 scripts/screenshots/render.py
```

在仓库根目录执行上述命令。工具会：

1. 将 Swift 源文件复制到临时目录，替换服务管理器的初始化以停用真实数据读取和后台采集。生产源文件不会被更改。
2. 使用不同于实际应用的 Bundle ID 隔离示例偏好设置；不启动 AppDelegate 或统计服务。
3. 在离线 JavaScript VM 中执行扩展视图函数，屏蔽账号、网络、文件、子进程和定时器。
4. 通过 NSHostingView 渲染真实 SwiftUI 组件，写入 `docs/screenshots/`，并生成 15 样式总览。

首页用户提供的总览图独立保存在 `assets/player-styles-overview.png`，重新生成不会覆盖它。

截图依照当前源代码生成，不包含系统刘海、窗口外部桌面或用户的菜单栏。组件图与播放器图使用便于文档阅读的固定画布。
