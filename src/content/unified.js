// 统一内容脚本 - 支持在 iframe 和普通标签页中运行
// 负责接收消息并在各 AI 网站中输入和发送

let isInIframe = window !== window.top;

console.log('=== AI Multi-Chat Content Script 已加载 ===');
console.log('=== 当前 URL:', window.location.href);
console.log('=== 是否在 iframe 中:', isInIframe);

// AI 网站配置
const AI_CONFIGS = {
    chatgpt: {
        hostnames: ['chatgpt.com', 'chat.openai.com'],
        inputSelector: '#prompt-textarea, div[contenteditable="true"][id="prompt-textarea"]',
        buttonSelector: 'button[data-testid="send-button"]:not([disabled]), button[aria-label*="Send"]:not([disabled])'
    },
    gemini: {
        hostnames: ['gemini.google.com'],
        inputSelector: '.ql-editor[contenteditable="true"], rich-textarea div[contenteditable="true"]',
        // Gemini 的发送按钮在 rich-textarea 的 sibling 或 parent 中
        buttonSelector: 'button.send-button, button[aria-label*="发送"], button[aria-label*="Send"], button[data-at="send"]'
    },
    claude: {
        hostnames: ['claude.ai'],
        inputSelector: 'div[contenteditable="true"].ProseMirror, div[contenteditable="true"]',
        buttonSelector: 'button[aria-label*="Send"]:not([disabled]), button[type="submit"]:not([disabled])'
    },
    grok: {
        hostnames: ['grok.com', 'x.com'],
        inputSelector: 'textarea, div[contenteditable="true"]',
        buttonSelector: 'button[aria-label*="Send"], button[data-testid*="send"], button[aria-label*="Grok"]'
    },
    deepseek: {
        hostnames: ['chat.deepseek.com'],
        inputSelector: 'textarea#chat-input, textarea._27c9245.ds-scroll-area, textarea[placeholder*="DeepSeek"]',
        buttonSelector: 'div[role="button"] .ds-icon > svg path[d*="8.3125 0.981587"], div[role="button"]:has(svg path[d*="14.707 6.83608"]), div[class*="ds-icon-button"]'
    },
    yuanbao: {
        hostnames: ['yuanbao.tencent.com'],
        inputSelector: '.ql-editor[contenteditable="true"], #search-bar .ql-editor',
        buttonSelector: '#yuanbao-send-btn, .style__send-btn___RwTm5, span.icon-send'
    }
};

const HIDE_INPUT_CLASS = 'ai-multi-chat-hide-input';
const HIDE_INPUT_SOFT_CLASS = 'ai-multi-chat-hide-input-soft';
const HIDE_INPUT_STYLE_ID = 'ai-multi-chat-hide-input-style';
let inputHideTarget = null;
let inputHideClass = HIDE_INPUT_CLASS;
let inputHideObserver = null;
let inputHideTick = null;

// 检测当前网站
function detectSite() {
    const hostname = window.location.hostname.toLowerCase();

    for (const [site, config] of Object.entries(AI_CONFIGS)) {
        if (config.hostnames.some(h => hostname.includes(h))) {
            return site;
        }
    }
    return 'unknown';
}

function ensureHideInputStyles() {
    if (document.getElementById(HIDE_INPUT_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = HIDE_INPUT_STYLE_ID;
    style.textContent = `
.${HIDE_INPUT_CLASS} {
  position: fixed !important;
  left: -10000px !important;
  top: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
.${HIDE_INPUT_SOFT_CLASS} {
  opacity: 0 !important;
  pointer-events: none !important;
}
`;
    document.documentElement.appendChild(style);
}

function resolveHideTarget(site, inputElement) {
    const candidates = [];

    if (site === 'claude') {
        candidates.push(
            inputElement.closest('[data-chat-input-container="true"]'),
            document.querySelector('[data-chat-input-container="true"]')
        );
    }

    if (site === 'gemini') {
        candidates.push(
            inputElement.closest('input-container'),
            document.querySelector('input-container'),
            inputElement.closest('.input-area-container'),
            document.querySelector('.input-area-container'),
            document.querySelector('[data-node-type="input-area"]')
        );
    }

    if (site === 'gemini') {
        const richTextarea = inputElement.closest('rich-textarea');
        if (richTextarea && richTextarea.parentElement) {
            candidates.push(richTextarea.parentElement);
        }
        candidates.push(richTextarea);
    }

    if (site === 'deepseek') {
        candidates.push(
            document.querySelector('._871cbca'), // User provided outermost container
            document.querySelector('.ec4f5d61'),
            document.querySelector('.aaff8b8f'),
            inputElement.closest('._871cbca')
        );
    }

    if (site === 'yuanbao') {
        candidates.push(
            document.querySelector('.style__text-area___JRVgQ'), // User provided container
            inputElement.closest('.style__text-area___JRVgQ'),
            document.querySelector('.agent-input-text-area')
        );
    }

    candidates.push(
        inputElement.closest('form'),
        inputElement.closest('[data-testid*="composer"]'),
        inputElement.closest('[class*="composer"]'),
        inputElement.closest('footer'),
        inputElement.parentElement
    );

    const target = candidates.find(Boolean);
    if (!target) return null;
    if (target === document.body || target === document.documentElement) {
        return inputElement;
    }
    return target;
}

function getHideClass(site) {
    return site === 'claude' ? HIDE_INPUT_SOFT_CLASS : HIDE_INPUT_CLASS;
}

function applyInputHiding() {
    if (!isInIframe) return;

    const site = detectSite();
    const config = AI_CONFIGS[site];
    if (!config) return;

    ensureHideInputStyles();
    inputHideClass = getHideClass(site);

    if (inputHideTarget && document.contains(inputHideTarget)) {
        inputHideTarget.classList.remove(HIDE_INPUT_CLASS, HIDE_INPUT_SOFT_CLASS);
        inputHideTarget.classList.add(inputHideClass);
        return;
    }

    const inputElement = document.querySelector(config.inputSelector);
    if (!inputElement) return;

    const target = resolveHideTarget(site, inputElement);
    if (!target) return;

    target.classList.remove(HIDE_INPUT_CLASS, HIDE_INPUT_SOFT_CLASS);
    target.classList.add(inputHideClass);
    inputHideTarget = target;
}

function startInputHider() {
    if (!isInIframe) return;

    applyInputHiding();

    if (inputHideObserver) return;
    inputHideObserver = new MutationObserver(() => {
        if (inputHideTick) return;
        inputHideTick = setTimeout(() => {
            inputHideTick = null;
            applyInputHiding();
        }, 200);
    });
    inputHideObserver.observe(document.documentElement, { childList: true, subtree: true });
}

// 显示输入框
function showInput() {
    if (!isInIframe) return;

    // 停止观察器
    stopInputHider();

    // 移除隐藏类
    if (inputHideTarget) {
        inputHideTarget.classList.remove(HIDE_INPUT_CLASS, HIDE_INPUT_SOFT_CLASS);
        inputHideTarget = null;
    }
}

// 停止输入框隐藏器
function stopInputHider() {
    if (inputHideObserver) {
        inputHideObserver.disconnect();
        inputHideObserver = null;
    }
    if (inputHideTick) {
        clearTimeout(inputHideTick);
        inputHideTick = null;
    }
}

// 切换输入框显示/隐藏
function toggleInputVisibility(hide) {
    if (hide) {
        startInputHider();
    } else {
        showInput();
    }
}

if (isInIframe) {
    try {
        chrome.storage.local.get(['hideIframeInputs'], (result) => {
            const shouldHide = result.hideIframeInputs !== undefined ? result.hideIframeInputs : true;
            if (shouldHide) {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', startInputHider);
                } else {
                    startInputHider();
                }
            }
        });
    } catch (e) {
        // Fallback if storage access fails (shouldn't happen in extension context)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startInputHider);
        } else {
            startInputHider();
        }
    }
}

// 等待元素出现
async function waitForElement(selector, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await new Promise(r => setTimeout(r, 300));
    }
    return null;
}

// 模拟真实的键盘输入
function simulateTyping(element, text, site) {
    element.focus();

    // 触发 focus 事件
    element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    // 对于 Gemini 的 Quill 编辑器，使用特殊方式
    if (site === 'gemini' && element.classList.contains('ql-editor')) {
        console.log('=== 使用 Gemini Quill 编辑器输入方式');

        // 清空并设置内容
        element.innerHTML = `<p>${text}</p>`;

        // 移除 ql-blank 类（表示编辑器不再为空）
        element.classList.remove('ql-blank');

        // 触发多种事件让 Quill 识别变化
        element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

        // 触发 compositionend 事件（模拟 IME 输入完成）
        element.dispatchEvent(new CompositionEvent('compositionend', {
            bubbles: true,
            cancelable: true,
            data: text
        }));

        // 将光标移到末尾
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        return;
    }

    // 清空现有内容
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = '';
    } else {
        element.innerHTML = '';
    }

    // 对于 contenteditable，使用 insertText
    if (element.hasAttribute('contenteditable')) {
        // 先选中所有内容
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        // 删除选中内容
        document.execCommand('delete', false, null);

        // 插入新文本
        document.execCommand('insertText', false, text);

        // 触发 input 事件
        element.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            inputType: 'insertText',
            data: text
        }));
    } else {
        // 对于 input/textarea
        try {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype,
                'value'
            ) || Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            );
            nativeInputValueSetter.set.call(element, text);
        } catch (e) {
            element.value = text;
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// 查找 Gemini 的发送按钮
function findGeminiSendButton() {
    // Gemini 的发送按钮可能在多个位置
    const selectors = [
        'button.send-button',
        'button[aria-label*="发送"]',
        'button[aria-label*="Send"]',
        'button[data-at="send"]',
        '.input-area-container button[aria-label]',
        'rich-textarea ~ button',
        '.input-buttons button:last-child'
    ];

    for (const selector of selectors) {
        const btn = document.querySelector(selector);
        if (btn && !btn.disabled) {
            console.log('=== Gemini 发送按钮选择器:', selector);
            return btn;
        }
    }

    // 备选：查找包含发送图标的按钮
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
        // 检查按钮是否包含发送图标（通常是箭头）
        if (btn.querySelector('svg') && !btn.disabled) {
            const rect = btn.getBoundingClientRect();
            // 发送按钮通常在输入框附近
            if (rect.width > 0 && rect.height > 0) {
                const ariaLabel = btn.getAttribute('aria-label') || '';
                if (ariaLabel.includes('发送') || ariaLabel.includes('Send') || ariaLabel.includes('submit')) {
                    console.log('=== 通过 aria-label 找到 Gemini 发送按钮');
                    return btn;
                }
            }
        }
    }

    return null;
}

// 通用的输入和发送函数
async function inputAndSend(message, retry = false) {
    const site = detectSite();
    const config = AI_CONFIGS[site];

    if (!config) {
        console.log('=== 不支持的网站:', site);
        return false;
    }

    console.log('=== 开始处理网站:', site, '是否在iframe中:', isInIframe);

    try {
        // 等待输入框出现
        const element = await waitForElement(config.inputSelector);

        if (!element) {
            console.log('=== 未找到输入框，选择器:', config.inputSelector);
            return false;
        }

        console.log('=== 找到输入框:', element);

        // 聚焦并输入文本
        simulateTyping(element, message, site);

        console.log('=== 文本已输入:', message);

        // 等待编辑器处理输入
        await new Promise(r => setTimeout(r, 500));

        // 在 iframe 中（分屏模式），优先使用 Enter 键发送
        // 因为 iframe 中 click() 可能因跨域限制无法正常工作
        if (isInIframe) {
            console.log('=== iframe 模式，使用 Enter 键发送');

            element.focus();

            // 发送完整的 Enter 键事件序列
            element.dispatchEvent(new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                composed: true,
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13
            }));

            element.dispatchEvent(new KeyboardEvent('keypress', {
                bubbles: true,
                cancelable: true,
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                charCode: 13
            }));

            element.dispatchEvent(new KeyboardEvent('keyup', {
                bubbles: true,
                cancelable: true,
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13
            }));
        } else {
            // 非 iframe（多窗口模式），使用按钮点击
            let sendButton = null;

            if (site === 'gemini') {
                sendButton = findGeminiSendButton();
            } else {
                sendButton = document.querySelector(config.buttonSelector);
            }

            if (sendButton && !sendButton.disabled) {
                console.log('=== 找到发送按钮，点击发送');
                sendButton.focus();
                sendButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                sendButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                sendButton.click();
                console.log('=== 发送按钮已点击');
            } else {
                console.log('=== 未找到可用发送按钮，尝试 Enter 键');
                element.focus();
                element.dispatchEvent(new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13
                }));
            }
        }

        console.log('=== 发送完成');
        return true;

    } catch (error) {
        console.error('=== 输入发送失败:', error);
        return false;
    }
}

// 页面加载完成通知父窗口
window.addEventListener('load', () => {
    console.log('=== 页面已加载');

    const site = detectSite();

    // 通知父窗口页面已加载（如果在 iframe 中）
    if (isInIframe && site !== 'unknown') {
        window.parent.postMessage({
            type: 'WINDOW_LOADED',
            data: {
                site: site,
                url: window.location.href
            }
        }, '*');
    }
});

// 监听来自父窗口的消息（用于分屏模式）
window.addEventListener('message', async (event) => {
    console.log('=== 收到 postMessage:', event.data);

    if (!event.data) return;

    // 忽略非主页面的 iframe（如 bscframe）
    const site = detectSite();
    if (site === 'unknown') {
        console.log('=== 忽略非 AI 页面');
        return;
    }

    // 处理 SEARCH_MESSAGE 类型（分屏页面发送）
    if (event.data.type === 'SEARCH_MESSAGE' && event.data.data) {
        const message = event.data.data.searchText;
        console.log('=== 收到分屏消息:', message, '网站:', site);

        const success = await inputAndSend(message);
        console.log('=== 分屏消息发送结果:', success);
    }

    // 处理手动检测
    if (event.data.action === 'MANUAL_DETECT') {
        console.log('=== 收到手动检测请求');
        window.parent.postMessage({
            type: 'DETECT_RESULT',
            data: {
                site: site,
                url: window.location.href,
                ready: true
            }
        }, '*');
    }

    // 处理隐藏/显示输入框切换
    if (event.data.type === 'TOGGLE_INPUT_VISIBILITY' && event.data.data) {
        const shouldHide = event.data.data.hide;
        console.log('=== 切换输入框显示状态:', shouldHide ? '隐藏' : '显示');
        toggleInputVisibility(shouldHide);
    }
});

// 监听来自 background 的消息（用于多窗口模式）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('=== 收到来自 background 的消息:', request);

    if (request.action === 'EXECUTE_PROMPT') {
        inputAndSend(request.prompt)
            .then((success) => {
                sendResponse({ success });
            });
        return true; // 异步响应
    }

    return true;
});
