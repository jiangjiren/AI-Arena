<p align="center">
  <img src="icons/icon128.png" alt="AI Arena Logo" width="128" height="128">
</p>

<h1 align="center">AI Arena</h1>

<p align="center">
  <strong>同时向多个 AI 发送问题，分屏对比回答</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#安装方法">安装方法</a> •
  <a href="#使用说明">使用说明</a> •
  <a href="#截图展示">截图展示</a> •
  <a href="#技术实现">技术实现</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-blue" alt="Platform">
  <img src="https://img.shields.io/badge/version-1.2-green" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-orange" alt="License">
</p>

---

## 📖 简介

**AI Arena** 是一款 Chrome/Edge 浏览器扩展，让你可以同时向 ChatGPT、Gemini 和 Claude 发送同一个问题，并在分屏界面中对比它们的回答。

不再需要手动在多个 AI 网站之间切换，一次提问，三份回答，轻松比较不同 AI 的思路和风格。

## ✨ 功能特性

- 🎯 **一键分屏** - 同时打开多个 AI 对话窗口
- 📝 **统一输入** - 底部输入框一次发送到所有 AI
- 🔄 **实时对比** - 并排查看不同 AI 的回答
- 🎨 **现代 UI** - Apple 风格的亮色设计
- 🌐 **中英双语** - 自动跟随浏览器语言
- ⚡ **轻量快速** - 无需后端，纯前端实现

## 🤖 支持的 AI

| AI | 网站 | 状态 |
|---|---|---|
| ChatGPT | chatgpt.com | ✅ 支持 |
| Gemini | gemini.google.com | ✅ 支持 |
| Claude | claude.ai | ✅ 支持 |

## 📦 安装方法

### 方法一：开发者模式加载（推荐）

1. 下载或克隆本仓库
   ```bash
   git clone https://github.com/jiangjiren/AI-Arena.git
   ```

2. 打开 Chrome 扩展管理页面
   - 地址栏输入 `chrome://extensions/`
   - 或点击菜单 → 更多工具 → 扩展程序

3. 开启「开发者模式」（右上角开关）

4. 点击「加载已解压的扩展程序」

5. 选择项目文件夹

### 方法二：打包安装

1. 在扩展管理页面点击「打包扩展程序」
2. 选择项目目录，生成 `.crx` 文件
3. 将 `.crx` 文件拖入扩展管理页面安装

## 🚀 使用说明

### 基本使用

1. **点击扩展图标** - 打开弹出窗口
2. **选择 AI** - 点击卡片选择要使用的 AI（可多选）
3. **开始对话** - 点击「开始多 AI 对话」按钮
4. **输入问题** - 在底部输入框输入问题，按 Enter 或点击发送
5. **对比回答** - 查看各个 AI 的回答

### 快捷操作

| 操作 | 说明 |
|---|---|
| `Enter` | 发送消息 |
| `Shift + Enter` | 换行 |
| 刷新按钮 | 刷新单个 AI 页面 |
| 主页按钮 | 返回 AI 首页 |
| 新窗口按钮 | 在新标签页打开 |
| 眼睛按钮 | 隐藏/显示原生输入框 |

### 注意事项

- 首次使用需要分别登录各个 AI 网站
- 部分 AI 可能有使用限制（如速率限制）
- 建议在稳定的网络环境下使用

## 📁 项目结构

```
ai-arena/
├── manifest.json          # 扩展配置文件
├── _locales/              # 国际化文件
│   ├── zh_CN/            # 中文
│   └── en/               # 英文
├── icons/                 # 图标资源
├── src/
│   ├── popup/            # 弹出窗口
│   │   ├── index.html
│   │   ├── style.css
│   │   └── popup.js
│   ├── split/            # 分屏页面
│   │   ├── split.html
│   │   ├── split.css
│   │   └── split.js
│   ├── content/          # 内容脚本
│   │   └── unified.js
│   └── background/       # 后台脚本
│       └── service-worker.js
└── README.md
```

## 🛠 技术实现

- **Manifest V3** - 最新的 Chrome 扩展标准
- **纯 JavaScript** - 无需框架，轻量高效
- **Chrome i18n API** - 国际化支持
- **PostMessage** - iframe 通信
- **CSS Variables** - 主题变量系统

## 🌐 国际化

插件支持中英双语，会自动跟随浏览器语言设置：

- 中文 (`zh_CN`) - 默认
- English (`en`)

如需添加更多语言，请参考 `_locales/` 目录下的文件格式。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [ChatGPT](https://chatgpt.com) - OpenAI
- [Gemini](https://gemini.google.com) - Google
- [Claude](https://claude.ai) - Anthropic

---

<p align="center">
  Made with ❤️ for AI enthusiasts
</p>
