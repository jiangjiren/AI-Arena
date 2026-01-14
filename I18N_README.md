# AI Arena - 国际化实现说明

## 更新内容

### 1. 插件重命名
- **旧名称**: AI Multi-Chat
- **新名称**: AI Arena (AI竞技场)
- **版本升级**: v1.1 → v1.2

### 2. 国际化支持 (i18n)
插件现已支持中英文双语，会根据浏览器语言自动切换。

#### 支持的语言
- **中文 (简体)**: `zh_CN` (默认)
- **English**: `en`

#### 文件结构
```
_locales/
├── zh_CN/
│   └── messages.json  # 中文翻译
└── en/
    └── messages.json  # 英文翻译
```

#### 实现方式
使用 Chrome Extension 官方 i18n API:
- `chrome.i18n.getMessage(key)` - 获取翻译文本
- `manifest.json` 中使用 `__MSG_extensionName__` 格式
- HTML 中使用 `data-i18n` 属性标记
- JavaScript 中使用 `i18n()` 辅助函数

### 3. UI 主题更新
从深色模式切换到**现代 Apple 风格的亮色模式**:
- 浅灰背景 (#F2F2F7)
- 白色卡片设计
- 柔和阴影
- iOS 风格的分段控制器
- 高对比度黑色按钮

## 如何测试不同语言

### 方法 1: 修改浏览器语言 (推荐)
1. Chrome 设置 → 高级 → 语言
2. 添加并移动目标语言到首位
3. 重启 Chrome
4. 重新加载插件

### 方法 2: 修改默认语言
在 `manifest.json` 中修改:
```json
"default_locale": "en"  // 或 "zh_CN"
```

## 添加新语言步骤

1. 在 `_locales/` 下创建新语言文件夹 (如 `ja` 日语)
2. 复制 `en/messages.json` 到新文件夹
3. 翻译所有 message 内容
4. 重新加载插件即可生效

## 翻译键列表

### 基础信息
- `extensionName`: 插件名称
- `extensionDescription`: 插件描述
- `popupTitle`: 弹窗标题

### 按钮和操作
- `startButton`: 开始按钮
- `sendTooltip`: 发送按钮提示
- `reload`: 刷新
- `openInNewTab`: 在新标签页打开
- `toggleInput`: 切换输入框

### AI 名称
- `chatgpt`: ChatGPT
- `gemini`: Gemini
- `claude`: Claude

### 提示信息
- `hintText`: 提示文字
- `inputPlaceholder`: 输入框占位符
- `emptyTitle`: 空状态标题
- `emptyDescription`: 空状态描述

### 通知消息
- `sentNotification`: 发送成功通知
- `pleaseEnterContent`: 请输入内容
- `noAIWindowAvailable`: 无可用窗口
- `sendFailed`: 发送失败

## 注意事项

1. 所有用户可见的文本都应该使用 i18n
2. 不要硬编码任何语言的文本
3. 添加新文本时，同时更新所有语言文件
4. 使用有意义的键名，便于维护

## 浏览器支持

- Chrome / Edge: 完全支持
- Firefox: 需要使用 browser.i18n 代替 chrome.i18n (兼容层已内置)
