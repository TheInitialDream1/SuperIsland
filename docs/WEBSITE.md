# 产品官网

官网由本仓库 `custom` 分支的 `/docs` 目录通过 GitHub Pages 发布：

https://theinitialdream1.github.io/SuperIsland/

## 文件

- `index.html`：中文产品介绍、功能说明、快速开始、常见问题与许可入口。
- `site.css`：响应式页面样式，适配桌面与手机并尊重系统减少动画设置。
- `site.js`：15 种歌词样式切换、10 个界面组件预览、总览弹窗与命令复制。
- `site-assets/`：本项目图片的 WebP 优化副本，无第三方网站图片或外部脚本。
- `.nojekyll`：让 GitHub Pages 直接提供静态文件。

网站采用独立设计、文案和项目截图，参考同类产品站的展示结构。没有复制第三方品牌、
角色素材、网页代码或用户评价。界面交互是截图预览，不会在浏览器中模拟实际音频播放。
网站仅链接本仓库的源码、文档和反馈入口，来源声明见仓库的 `ATTRIBUTION.md`。

## 本地预览

```bash
python3 -m http.server 4173 --directory docs
```

然后访问 `http://localhost:4173/`。页面无需 npm、打包器、服务器后端或账号。

## 更新截图

先按 [GALLERY.md](GALLERY.md#重新生成) 更新原生截图，再运行：

```bash
python3 -m pip install Pillow
python3 scripts/prepare-website-assets.py
```

已生成的 WebP 图片随源码提交，访问者和 GitHub Pages 构建都不需要安装 Python 依赖。
提交 `custom` 分支后，GitHub Pages 会自动重新发布。
