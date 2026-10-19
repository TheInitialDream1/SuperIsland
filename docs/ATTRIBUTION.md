# 来源与第三方声明

## 上游宿主与分支历史

本项目是 [shobhit99/SuperIsland](https://github.com/shobhit99/SuperIsland) 的公开分支。
定制开发基于提交 `5619541`。原项目的应用结构、扩展机制、已有模块、标志与资源
继续保留原来源；Git 历史记录上游与定制修改。GitHub 中的 `main` 保留上游分支，
`custom` 为本仓库默认的中文增强版分支。

2026-10-19 准备发布时，上游仓库未提供根目录许可证。本分支不将继承的宿主代码
重新授予 MIT 或其他统一开源许可。维护者原创新增代码及原创修改的 MIT 授权范围
见 [LICENSE.md](../LICENSE.md)。已有扩展的 manifest 可能单独声明许可，请按其来源
判断范围。

## 随包依赖

| 组件 | 来源／版本 | 许可和说明 |
| --- | --- | --- |
| MediaRemote Adapter | [ungive/mediaremote-adapter v0.7.5](https://github.com/ungive/mediaremote-adapter/tree/v0.7.5)，`cc5d90aa0b633acc34a8c44197b5fcb309958935` | BSD-3-Clause；[LICENSE](../SuperIsland/Resources/MediaRemoteAdapter/LICENSE) 与 [构建来源](../SuperIsland/Resources/MediaRemoteAdapter/UPSTREAM.md)。当前随包框架为 arm64。 |
| 同步歌词扩展 | `Extensions/synced-lyrics`，0.11.0 | [MIT](../Extensions/synced-lyrics/LICENSE)。 |
| opencc-js | [nk2028/opencc-js](https://github.com/nk2028/opencc-js) | [MIT notice](../Extensions/synced-lyrics/vendor/opencc-js-LICENSE.txt)；字典数据的 Apache-2.0 等声明见 [THIRD_PARTY_LICENSES](../Extensions/synced-lyrics/vendor/opencc-js-THIRD_PARTY_LICENSES.md)。 |
| qrc-decoder | [apoint123/qrc-decoder](https://github.com/apoint123/qrc-decoder)，1.0.2 | [MIT](../Extensions/synced-lyrics/vendor/qrc-decoder-LICENSE.txt)；本地移植与修改见 [NOTICE](../Extensions/synced-lyrics/vendor/qrc-decoder-NOTICE.txt)。 |
| pako | [nodeca/pako](https://github.com/nodeca/pako)，2.1.0 | [MIT AND Zlib](../Extensions/synced-lyrics/vendor/pako-LICENSE.txt)，同时保留源文件头声明。 |
| Aptabase Swift SDK | [aptabase/aptabase-swift](https://github.com/aptabase/aptabase-swift) | Swift Package Manager 依赖，由 Xcode 按 `project.yml` 解析；适用许可证随上游包提供。应用保留上游匿名统计初始化。 |

## 视觉参考

14 种新增歌词场景参考 [Folia](https://github.com/chthollyphile/folia-major) 的视觉构思，
源分析固定参考提交为 `08eda1fe057793463e7fd5b43781081cdcd8b800`。Folia 源码采用
AGPL-3.0；本仓库没有复制或打包其代码、GPU 渲染器、字体、模型、贴图或其他素材，
场景由现有 SwiftUI／AppKit 代码独立实现。复杂场景是适合小窗口的原生视觉改编。
实现对应表见 [NOW_PLAYING.md](NOW_PLAYING.md#native-player-scenes-build-29)。

## 截图

- `assets/player-styles-overview.png`：用户为本次仓库介绍提供的 15 种播放器效果总览。
- `docs/screenshots/`：通过真实项目视图和离线示例数据生成。示例封面为代码绘制，
  示例歌词为本次文档编写的演示文字；通知、城市、日程和设备名均为示例。
- 外部服务扩展图为初始／未连接界面，没有使用真实账号、消息、订单、Cookie 或 Token。
- 截图不打包音频文件，也不构成对第三方音乐内容或品牌的授权。

## 产品官网视觉来源

根据本次页面复刻要求，官网首页场景、悬灯造型与鼠标跟随参数参考并改编自
[ChatNotch](https://chatnotch.com/)（2026-10-19 访问）。`docs/hero-scene.css`
保留了对应场景的 CSS 结构。以下静态素材从该站实际加载的资源复制为本地文件：

- `reference-mascot.webp`：紫色角色；原路径 `chatnotch/home-hero-mascot.webp`。
- `desktop-wallpaper.jpg`：桌面展示壁纸；原路径 `chatnotch/golden-gate.jpg`。
- `macbook-frame.png`：MacBook 展示框；原路径 `macmockup.png`。
- `dock-{finder,safari,messages,mail}.png`：Dock 应用图标；原路径 `chatnotch/screen-studio/`。

上述原路径均位于 `https://chatnotch.com/chatnotch-support/website/` 下。
这些第三方视觉资源及场景样式不属于本分支原创 MIT 授权范围，权利归原权利人，
本仓库不声称获得其统一开源授权。SuperIsland 应用标志继承自上游。产品功能文案、
播放器及组件截图使用本项目内容，没有采用参考站的软件包、歌曲音频、账号、评价或联系信息。
