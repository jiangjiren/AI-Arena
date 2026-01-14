<p align="right">
  English | <a href="README_zh.md">中文说明</a>
</p>

<p align="center">
  <img src="icons/icon128.png" alt="AI Arena Logo" width="128" height="128">
</p>

<h1 align="center">AI Arena</h1>

<p align="center">
  <strong>Send questions to multiple AIs simultaneously and compare answers in split-screen</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#screenshot">Screenshots</a> •
  <a href="#tech-stack">Technical Stack</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-blue" alt="Platform">
  <img src="https://img.shields.io/badge/version-1.2-green" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-orange" alt="License">
</p>

---

## 📖 Introduction

**AI Arena** is a Chrome/Edge browser extension that allows you to send the same question to ChatGPT, Gemini, Claude, Grok, DeepSeek, and Yuanbao simultaneously and compare their answers in a split-screen interface.

No more manual switching between multiple AI websites. One question, multiple answers, easily compare different AI's thinking and styles.

> ⚠️ **Important Note**: This extension **does not call any API**. It embeds the official web pages of each AI platform into a single browser tab to achieve unified input and split-screen comparison. You need to **log in to each AI platform** (ChatGPT, Gemini, Claude, etc.) in advance to use it normally.

## ✨ Features

- 🌐 **Official Web Embedding** - Directly use the official interfaces of each AI platform, not API calls.
- 🎯 **One-click Split Screen** - Display multiple AI chat windows simultaneously in one tab.
- 📝 **Unified Input** - Bottom unified input box, send questions to all AIs at once.
- 🔄 **Real-time Comparison** - View answers from different AIs side-by-side.
- 🎨 **Modern UI** - Apple-style light design.
- 🌏 **Multi-language Support** - Automatically follows browser language settings.
- ⚡ **Lightweight & Fast** - No backend server required, pure front-end implementation.
- 🔒 **Privacy & Security** - Use your own account, data does not go through third parties.

## 🤖 Supported AIs

| AI | Website | Status |
|---|---|---|
| ChatGPT | chatgpt.com | ✅ Supported |
| Gemini | gemini.google.com | ✅ Supported |
| Claude | claude.ai | ✅ Supported |
| Grok | grok.com | ✅ Supported |
| DeepSeek | chat.deepseek.com | ✅ Supported |
| Yuanbao | yuanbao.tencent.com | ✅ Supported |

## 📦 Installation

### Method 1: Load Unpacked (Recommended)

1. Download or clone this repository
   ```bash
   git clone https://github.com/jiangjiren/AI-Arena.git
   ```

2. Open Chrome Extension management page
   - Enter `chrome://extensions/` in the address bar
   - Or click Menu → More Tools → Extensions

3. Enable "Developer mode" (top right corner)

4. Click "Load unpacked"

5. Select the project folder

### Method 2: Packaged Installation

1. Click "Pack extension" in the extension management page
2. Select the project directory to generate a `.crx` file
3. Drag the `.crx` file into the extension management page to install

## 🚀 Usage

### Basic Usage

1. **Click extension icon** - Open the popup window
2. **Select AI** - Click cards to select AIs (multiple selection supported)
3. **Start Conversation** - Click the "Start AI Arena" button
4. **Input Question** - Type your question in the bottom input box, press Enter or click send
5. **Compare Answers** - View answers from each AI

### Shortcut Operations

| Shortcut | Description |
|---|---|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| Refresh Button | Refresh individual AI page |
| Home Button | Return to AI home page |
| New Tab Button | Open in a new tab |
| Eye Button | Hide/Show native input field |

### ⚠️ Prerequisites

> **Important**: This extension works by embedding the official web pages of AI platforms, not by calling APIs.

Before using this extension, please ensure:

1. **Logged in to each AI platform** - Please visit and log in to:
   - [ChatGPT](https://chatgpt.com) - OpenAI account required
   - [Gemini](https://gemini.google.com) - Google account required
   - [Claude](https://claude.ai) - Anthropic account required
   - [Grok](https://grok.com) - X (Twitter) account required
   - [DeepSeek](https://chat.deepseek.com) - DeepSeek account required
   - [Yuanbao](https://yuanbao.tencent.com) - Tencent account required

2. **Maintain login status** - The extension uses the login state in your browser.

3. **Usage limits** - Each AI platform may have its own usage quotas and rate limits.

## 📁 Project Structure

```
ai-arena/
├── manifest.json          # Extension configuration
├── _locales/              # Internationalization files
│   ├── zh_CN/            # Chinese
│   └── en/               # English
├── icons/                 # Icon resources
├── src/
│   ├── popup/            # Popup window
│   │   ├── index.html
│   │   ├── style.css
│   │   └── popup.js
│   ├── split/            # Split-screen page
│   │   ├── split.html
│   │   ├── split.css
│   │   └── split.js
│   ├── content/          # Content scripts
│   │   └── unified.js
│   └── background/       # Background script
│       └── service-worker.js
└── README.md
```

## 🛠 Technical Stack

- **Manifest V3** - The latest Chrome extension standard.
- **Official Web Embedding** - Embed official web pages via iframe (not API calls).
- **DeclarativeNetRequest** - Modify response headers to allow iframe embedding.
- **Content Scripts** - Injected scripts to achieve synchronous message sending.
- **Pure JavaScript** - No frameworks, lightweight and efficient.
- **Chrome i18n API** - Internationalization support.
- **PostMessage** - iframe communication.
- **CSS Variables** - Theme variable system.

## 🌐 Internationalization

The extension supports Chinese and English, automatically following your browser's language settings:

- Chinese (`zh_CN`) - Default
- English (`en`)

To add more languages, please refer to the format in the `_locales/` directory.

## 🤝 Contribution

Issue and Pull Requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [ChatGPT](https://chatgpt.com) - OpenAI
- [Gemini](https://gemini.google.com) - Google
- [Claude](https://claude.ai) - Anthropic

---

<p align="center">
  Made with ❤️ for AI enthusiasts
</p>
