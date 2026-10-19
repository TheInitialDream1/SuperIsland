# 参与 SuperIsland 中文增强版

本仓库默认开发分支为 `custom`，`main` 保留上游历史。请从 `custom` 创建功能分支，并将 Pull Request 提交到 `custom`。

## 本地运行

```bash
git clone https://github.com/TheInitialDream1/SuperIsland.git
cd SuperIsland
xcodegen generate
open SuperIsland.xcodeproj
```

需要 macOS 14+、完整 Xcode 和 XcodeGen。当前随包 MediaRemote Adapter 为 arm64；Intel 支持尚未在此分支验证。具体环境、权限和构建说明见 [README](README.md#从源码运行)。

## 提交变更

- 一次提交聚焦一个功能或问题，描述具体触发条件、改动和验证结果。
- Swift 代码遵循现有结构；模块状态由 Manager 提供，界面由紧凑／展开视图组成，涉及 UI 的代码按需使用 MainActor。
- 简单扩展可直接编写 JavaScript；修改同步歌词后，执行 `./Extensions/synced-lyrics/build.sh` 并提交更新的 `bundle.js`。
- 界面改动请更新对应截图及说明。可以用 `python3 scripts/screenshots/render.py` 重建离线图鉴；不要提交真实账号、消息、日程、订单或桌面截图中的个人资料。
- 保留第三方版权声明；许可范围见 [LICENSE.md](LICENSE.md) 和 [ATTRIBUTION.md](docs/ATTRIBUTION.md)。

## 相关验证

```bash
node --test Extensions/synced-lyrics/tests/*.test.js
xcodegen generate
xcodebuild test -project SuperIsland.xcodeproj -scheme SuperIsland -destination 'platform=macOS'
git diff --check
```

只运行与改动相关的检查。外部账号集成需要按对应扩展 README 配置，离线截图与单元测试不会证明第三方服务在线可用。

## 报告问题

请通过本仓库的 [Issues](https://github.com/TheInitialDream1/SuperIsland/issues) 提供 macOS 版本、应用构建号、显示器类型、复现步骤和预期结果。播放器问题请同时注明播放器、歌曲版本、是否有逐字时间及是否已校准；日志先去除敏感内容。
