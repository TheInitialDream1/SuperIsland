<p align="center">
  <a href="https://theinitialdream1.github.io/SuperIsland/">产品官网</a> ·
  <img src="assets/logo.png" width="88" height="88" alt="SuperIsland 图标" />
</p>

<h1 align="center">SuperIsland · 中文增强版</h1>

<p align="center">把 Mac 屏幕顶端变成音乐、信息与效率工具的灵动岛。</p>
<p align="center">SwiftUI 原生界面 · 15 种歌词播放器样式 · 逐字同步 · 可扩展组件</p>
<p align="center">
  <a href="#播放器样式">播放器样式</a> ·
  <a href="#组件截图">组件截图</a> ·
  <a href="#从源码运行">从源码运行</a> ·
  <a href="docs/GALLERY.md">完整截图图鉴</a> ·
  <a href="LICENSE.md">许可与致谢</a>
</p>

![15 种歌词播放器效果总览](assets/player-styles-overview.png)

> 上图为用户提供的播放器效果总览。下文及图鉴中的独立截图由项目真实 SwiftUI 组件使用离线示例数据渲染；示例歌曲、封面、通知和日程不代表真实账号内容。静态图片展示布局，动画效果请运行应用体验。

## 这是什么项目

SuperIsland 是一个 macOS 菜单栏应用：在刘海附近或普通显示器顶部，以紧凑、展开、完整展开三种状态呈现正在播放的音乐、系统状态和常用工具。鼠标移入、点击、手势和模块切换让信息随时可见；固定显示器设置适合多屏工作。

本仓库基于 [shobhit99/SuperIsland](https://github.com/shobhit99/SuperIsland) 的 `5619541` 版本开发，保留上游历史。中文增强版重点加入原生歌词场景、QQ 音乐逐字歌词、播放进度与拖动修正、中文界面、扩展自定义高度以及京东／美团／菜鸟订单组件。当前定制宿主版本为 `1.0.10`、构建号 `29`，歌词扩展版本为 `0.11.0`。

### 这一版的重点

- **15 种完整播放器构图**：原版双栏，以及流光、字云、竖排、聊天气泡、轨道、透视、齿轮、海报、光束等场景；封面、歌词、背景和控制条一起变化。
- **真实逐字同步**：QQ 音乐优先匹配同一录音版本的 QRC；不可用时回退逐行 LRC。使用原始时间数据，不根据字数编造逐字进度。
- **统一播放时钟**：原生播放器、歌词和进度共用时钟；支持拖动预览、松手提交、点击歌词跳转、逐曲偏移校准。
- **专辑色与真实频谱**：提取封面配色；可选捕获播放器音频做 FFT。暂停、静音或无采样时归零，频谱需要单独启用和授权。
- **日常效率组件**：主页、音量、电池、日历、天气、连接状态、通知、文件暂存和提词器。
- **JavaScript 扩展**：通过 JavaScriptCore 运行；支持扩展权限、配置、通知、原生媒体视图，以及静态／运行时窗口高度。

## 播放器样式

展开“同步歌词”，点击播放器的 **歌词样式与校准** 按钮，即可选择样式。样式与歌曲偏移分别保存。

| 样式 | 界面特点 | 样式 | 界面特点 |
| --- | --- | --- | --- |
| 原版 | 左封面、右侧四行歌词和独立进度条 | 流光 | 居中大字、专辑色背景、底部胶囊播放器 |
| 心象 | 散落字云与焦点光圈 | 云阶 | 竖排文字与阶梯引导线 |
| 浮名 | 满幅大字、层叠歌词上下文 | 群唱 | 左右交替的对话气泡与头像 |
| 倾诉 | 水平主句与倾斜上下文 | 回环 | 椭圆歌词轨道与环绕点 |
| 镜台 | 明亮专辑色、透视歌词走廊 | 时计 | 原生转动齿轮、时钟与歌词 |
| 商籁 | 海报边框、衬线文字与编号 | 凝彩 | 分区色块、巨型编号与分割线 |
| 绘光 | 深色舞台、光束与音频响应 | 莫奈 | 左侧信息与歌词、右侧倾斜封面 |
| 静止 | 原版专辑渐变、三行歌词、减少装饰运动 | | |

| 流光 | 原版 |
| --- | --- |
| ![流光播放器](docs/screenshots/player-luminous.png) | ![原版播放器](docs/screenshots/player-standard.png) |
| 时计 | 莫奈 |
| ![时计播放器](docs/screenshots/player-clockwork.png) | ![莫奈播放器](docs/screenshots/player-monet.png) |

**[查看全部 15 种样式、每种独立大图和紧凑布局 →](docs/GALLERY.md#播放器图鉴)**

播放器使用系统媒体信息，针对 Apple Music、Spotify 提供应用级回退；QQ 音乐通过 MediaRemote Adapter 识别和控制。Chrome／Chrome Canary 媒体检测需要在设置中主动开启，兼容性取决于播放器是否发布系统媒体信息。歌词服务可能因歌曲版本、网络和接口变化而无法匹配，具体机制见 [Now Playing 文档](docs/NOW_PLAYING.md)。

## 组件截图

### 主页与系统状态

主页把音乐、日历和天气放进同一个面板；首页槽位可以在设置中调整。音量、电池和连接状态可独立展开。

![主页：音乐、日历和天气](docs/screenshots/home.png)

| 音乐播放器 | 系统音量 |
| --- | --- |
| 封面、播放控制、进度和当前媒体信息。 | 系统音量、输出设备及受支持媒体应用的音量入口。 |
| ![音乐播放器](docs/screenshots/now-playing.png) | ![系统音量](docs/screenshots/volume.png) |
| 电池 | Wi-Fi 与蓝牙 |
| 电量、供电状态、预计时间和电量趋势。 | 网络连接状态、信号信息和蓝牙设备。 |
| ![电池组件](docs/screenshots/battery.png) | ![连接状态组件](docs/screenshots/connectivity.png) |

### 日程与信息

| 日历 | 天气 |
| --- | --- |
| 月历、当天事件、近期安排；支持来源筛选和会议链接。 | 当前天气、小时预报、体感、湿度、风速、紫外线和空气质量。 |
| ![日历组件](docs/screenshots/calendar.png) | ![天气组件](docs/screenshots/weather.png) |
| 通知 | 文件暂存架 |
| 汇集扩展、WhatsApp 集成和兼容应用广播；并非所有应用的系统通知镜像。 | 拖入文件、文件夹、图片、链接或文字，支持置顶、搜索和保留期限。 |
| ![通知组件](docs/screenshots/notifications.png) | ![文件暂存架](docs/screenshots/shelf.png) |

### 提词器与设置

提词器支持滚动、速度、字号、对齐和稿件编辑，还提供需要麦克风与语音识别授权的跟读模式。设置包含模块开关、外观、固定显示器、扩展和电源策略；普通、智能、低功耗模式可调整后台刷新。

![提词器](docs/screenshots/teleprompter.png)

<details>
<summary>查看设置界面与专注状态</summary>

![设置界面](docs/screenshots/settings.png)

专注状态为紧凑状态指示组件：

![专注状态](docs/screenshots/focus.png)

</details>

## 扩展组件

扩展在 **设置 → 扩展** 中启用。下图展示真实扩展代码的初始／未连接界面，不表示已完成对应服务的在线连接。除同步歌词外，其他集成需要自己的账号、配置或本机桥接服务。

| 扩展 | 用途及说明 |
| --- | --- |
| [同步歌词](Extensions/synced-lyrics/README.md) | QQ 音乐 QRC／LRC、酷狗备用源、简体转换、缓存与逐曲校准；上方播放器截图即此扩展。 |
| [AI Usage](Extensions/ai-usage/README.md) | 展示本机可读取的 Codex／Claude 使用额度信息。 |
| [Agents Status](Extensions/agents-status/README.md) | 通过本地桥接与 hooks 展示代理任务状态。 |
| [Pomodoro](Extensions/pomodoro/README.md) | 番茄钟、工作／休息倒计时、会话统计。 |
| [WhatsApp](Extensions/whatsapp-web/README.md) | 通过 Node.js provider 连接 WhatsApp，展示消息及快捷操作。 |
| [Linear Mentions](Extensions/linear-mentions/README.md) | 连接 Linear 后查看提及和相关任务。 |
| [Last.fm](Extensions/lastfm-scrobbler/README.md) | 将播放记录提交到用户自己的 Last.fm 账号。 |
| [京东订单](Extensions/live-orders) | 从登录后的网页读取订单与配送进度。 |
| [美团配送](Extensions/meituan-delivery) | 展示美团订单及配送状态。 |
| [菜鸟包裹](Extensions/cainiao-packages) | 展示包裹与物流进度。 |
| [Live Football](Extensions/live-football/README.md) | 仓库保留的赛事扩展示例，未加入默认打包列表；赛程配置针对 2026 世界杯。 |

| 番茄钟 | AI 额度 |
| --- | --- |
| ![番茄钟初始界面](docs/screenshots/extension-pomodoro.png) | ![AI 额度初始界面](docs/screenshots/extension-ai-usage.png) |
| 代理任务状态 | 京东订单 |
| ![代理任务未连接界面](docs/screenshots/extension-agents-status.png) | ![京东订单未连接界面](docs/screenshots/extension-live-orders.png) |

**[查看每个扩展的单独截图 →](docs/GALLERY.md#扩展组件图鉴)**

扩展开发参考 [EXTENSIONS.md](EXTENSIONS.md)、[EXTENSIONS-API.md](EXTENSIONS-API.md) 和 [自定义高度说明](CUSTOM_HEIGHT_BUILD.md)。

## 从源码运行

### 环境要求

- **macOS 14 Sonoma 或更高版本**。有刘海和无刘海显示器均有对应布局。
- **Apple Silicon Mac**：当前随包 MediaRemote Adapter 为 arm64。Intel 构建需要重新编译适配器并核对全部依赖，尚未在本分支验证。
- **完整 Xcode 15 或更新版本**，仅安装 Command Line Tools 无法执行 `xcodebuild`；XcodeGen 2.35+。
- **Node.js 18+**：修改／重打包歌词扩展、运行 JavaScript 测试或使用 WhatsApp provider 时需要。普通歌词功能在 JavaScriptCore 中运行，不需要额外歌词服务。

```bash
brew install xcodegen
git clone https://github.com/TheInitialDream1/SuperIsland.git
cd SuperIsland
xcodegen generate
open SuperIsland.xcodeproj
```

在 Xcode 中选择 `SuperIsland` scheme 和当前 Mac，设置自己的签名团队后运行。Xcode 会通过 Swift Package Manager 获取 Aptabase 依赖；使用的宿主、媒体适配器与内置扩展由 `project.yml` 一起打包。

如果 `xcodebuild` 提示当前目录是 Command Line Tools，请先在 Xcode → Settings → Locations 选择 Command Line Tools 对应的 Xcode。

### 启用歌词

1. 打开应用设置，在“扩展”中启用“同步歌词”。
2. 使用 QQ 音乐、Apple Music 或其他受支持播放器播放音乐，再打开歌词组件。
3. 点击 **歌词样式与校准** 选择样式，必要时微调本曲歌词偏移。
4. 需要真实音频频谱时，在原版界面主动启用，并按 macOS 提示授权系统音频采集。

**歌词扩展依赖本仓库定制宿主的原生视图 API**；仅把 `synced-lyrics` 复制到旧版上游应用不能得到全部功能。构建时内置扩展会复制到应用资源目录；本机已安装的旧扩展可能优先被发现，排查时请核对设置里显示的扩展版本。

修改歌词扩展后重新打包：

```bash
./Extensions/synced-lyrics/build.sh
```

### 权限按功能启用

| 功能 | 可能需要的权限或配置 |
| --- | --- |
| 媒体控制、快捷键和应用交互 | 辅助功能；部分播放器需要自动化权限 |
| Chrome 媒体检测 | 主动开启检测、自动化权限、浏览器允许 Apple Events JavaScript |
| 日历 | 日历读取权限 |
| 天气／Wi-Fi 名称 | 定位权限；天气通过 Open-Meteo 请求位置对应预报 |
| 蓝牙状态 | 蓝牙权限 |
| 实时频谱 | 系统音频／屏幕录制相关权限；14.2+ 使用 Core Audio 进程 Tap，14.0–14.1 使用音频专用 ScreenCaptureKit 流 |
| 语音跟读提词 | 麦克风、语音识别权限 |
| 外部服务扩展 | 对应服务登录或配置；订单组件依赖网页登录态与页面结构 |

频谱采集路径不注册麦克风或视频输出，不写音频文件、不上传音频。歌词按需从 QQ 音乐／酷狗请求，不在仓库分发完整歌曲或歌词库。上游应用保留了 Aptabase 匿名使用统计，入口为 [Analytics.swift](SuperIsland/Utilities/Analytics.swift)；本项目不能被描述为所有功能完全离线。订单登录态、通知、缓存和扩展账号数据留在本机运行数据中，未包含在仓库或示例截图中。

## 构建与验证

```bash
# JavaScript 歌词回归测试（包含原始 smoke 测试）
node --test Extensions/synced-lyrics/tests/*.test.js

# Xcode 单元测试
xcodegen generate
xcodebuild test -project SuperIsland.xcodeproj -scheme SuperIsland \
  -destination 'platform=macOS'
```

生成本地 DMG：

```bash
./scripts/build-dmg.sh
```

脚本会清空并重建仓库中的 `build/`，生成 `build/SuperIsland.dmg`，供本地安装测试。没有自己的 Developer ID 签名和公证时，不能将它当成经过 Apple 公证的发布包。签名发布参考 [RELEASE.md](docs/RELEASE.md)，凭据请仅保存在被 Git 忽略的 `.env` 中。

此定制构建启用了 `SUPERISLAND_CUSTOM_HEIGHT`，关闭上游自动更新，避免定制功能被官方版本覆盖；后续更新请从此仓库获取代码并重新构建。当前仓库先提供源码，下载地址以本仓库实际发布的 Releases 为准。

重新生成示例截图：

```bash
python3 scripts/screenshots/render.py
```

脚本编译真实 SwiftUI 视图，使用离线数据替换临时源文件中的服务初始化，仅输出到 `docs/screenshots/`；不会操控正在运行的应用。播放器效果总览原图保存在 `assets/player-styles-overview.png`。详见 [截图图鉴与生成说明](docs/GALLERY.md)。

## 项目结构

```text
SuperIsland/                     原生应用、模块、播放器、窗口与设置
  Modules/NowPlaying/            播放时钟、进度、歌词、音频频谱与场景
ExtensionHost/                   JavaScriptCore 扩展宿主、权限与原生视图桥接
Extensions/                     内置扩展与保留的扩展示例
  synced-lyrics/                 歌词源码、打包文件、vendor 许可与回归测试
SuperIslandTests/                Swift 单元测试
assets/                         项目标志与播放器总览
scripts/                        构建、发布与离线截图工具
docs/                           功能说明、图鉴和截图
  index.html                    GitHub Pages 产品官网
project.yml                     XcodeGen 工程配置
```

## 来源、许可与贡献

产品官网部署与更新说明见 [WEBSITE.md](docs/WEBSITE.md)。

感谢 [shobhit99/SuperIsland](https://github.com/shobhit99/SuperIsland) 的原始宿主与扩展系统，以及 MediaRemote Adapter、OpenCC、qrc-decoder、pako 等项目。14 种新增歌词场景参考了 [Folia](https://github.com/chthollyphile/folia-major) 的视觉构思，使用 SwiftUI 独立实现，没有打包其代码、字体、模型或 GPU 渲染器。

**许可按来源区分**：本分支原创新增代码与原创修改采用 MIT；不覆盖上游和第三方代码。发布准备时，上游宿主仓库未提供根目录许可证，因此本仓库不会把整个宿主重新标为 MIT。歌词扩展和各 vendor 的具体许可、第三方来源及适用范围见 [LICENSE.md](LICENSE.md) 与 [ATTRIBUTION.md](docs/ATTRIBUTION.md)。

欢迎提交问题、改进文档和截图，或贡献播放器与组件功能。提交步骤见 [CONTRIBUTING.md](CONTRIBUTING.md)。
