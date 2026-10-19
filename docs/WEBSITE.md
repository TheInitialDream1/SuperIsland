# 产品官网

官网由 `custom` 分支 `/docs` 目录通过 GitHub Pages 发布：

https://theinitialdream1.github.io/SuperIsland/

## 页面与交互

- `index.html`：产品介绍、真实组件演示、功能卡片、15 种样式、扩展、下载与常见问题。
- `hero-scene.css`：参考站悬灯与角色场景的视觉样式。
- `site.css`：悬浮导航、桌面壁纸、MacBook 展示、响应式布局。
- `site.js`：鼠标驱动的惯性悬灯、光晕跟随、角色视线与漂浮、眨眼、悬停回应；
  15 种歌词样式、10 个功能组件与 5 个桌面预览切换，总览弹窗与完整原生窗口放大预览。
- `site-assets/`：项目真实截图的 WebP 副本，以及带来源说明的参考站静态视觉素材。

所有下载按钮使用本仓库 Release 的同一真实 DMG 地址；顶部和页脚提供项目 GitHub 链接。
页面不加载参考站脚本或热链图片，不在浏览器中模拟实际音频播放。
动画尊重系统“减少动态效果”，离屏或标签页不可见时暂停逐帧鼠标动画。

## 视觉参考与许可

按本次复刻要求，布局和黑色/紫色/暖光首屏参考 ChatNotch；电脑与组件预览按最新要求使用桌面壁纸，
功能说明与应用截图替换为 SuperIsland 的真实内容。来源与授权范围见
[ATTRIBUTION.md](ATTRIBUTION.md#产品官网视觉来源)，第三方素材不纳入本仓库原创 MIT 授权。

## 本地预览

```bash
python3 -m http.server 4173 --directory docs
```

无需 npm 或构建步骤。截图生成与 WebP 更新方式见 `scripts/screenshots/render.py`
和 `scripts/prepare-website-assets.py`。提交后 GitHub Pages 自动发布。

## 完整窗口截图

官网的 25 张窗口图位于 `docs/screenshots/windows/`，由生产 SwiftUI 视图与
生产 `PillShape` 渲染，保留左右外翻肩角和透明外侧。播放器为 658×277 逻辑像素
（658×240 内容加 37 像素肩部），其余面板为 658×217；输出为 2 倍分辨率。
网页按原始宽高比缩放，图片不叠加圆角裁切。切换按钮位于桌面演示外。
样式区可放大查看当前完整窗口。

```bash
python3 scripts/screenshots/render.py --website-only
python3 scripts/prepare-website-assets.py
```

生成器只在临时副本设置模拟刘海几何，不修改应用的生产逻辑。

## 播放器轮播

15 个完整 MacBook 场景置于同一条横向轨道，播放器、边框与桌面壁纸共同移动，
不再原地替换图片。支持左右按钮、键盘方向键、鼠标拖动和触摸横滑；首尾连续循环，
连续点击按队列执行，选择样式可直接滑到目标。系统“减少动态效果”开启时即时切换。
