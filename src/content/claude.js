// Claude AI content script - 处理向 Claude 发送消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXECUTE_PROMPT') {
        handlePrompt(request.prompt);
    }
});

async function handlePrompt(text) {
    // Claude 使用 ProseMirror/Tiptap 编辑器
    const inputSelectors = [
        'div.ProseMirror[contenteditable="true"]',
        'div.tiptap[contenteditable="true"]',
        'div[contenteditable="true"].ProseMirror',
        'div[contenteditable="true"]'
    ];

    let inputArea = null;
    for (const selector of inputSelectors) {
        inputArea = document.querySelector(selector);
        if (inputArea) break;
    }

    if (!inputArea) {
        console.error('[Claude] Input area not found');
        return;
    }

    // Focus the input
    inputArea.focus();
    await new Promise(r => setTimeout(r, 100));

    // 使用 execCommand 插入文本（对 contenteditable 更可靠）
    document.execCommand('insertText', false, text);

    // 触发事件以确保 React/ProseMirror 检测到变化
    inputArea.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text
    }));

    // 等待 React 状态更新
    await new Promise(r => setTimeout(r, 300));

    // 查找并点击发送按钮
    try {
        const sendButton = await waitForButton();
        sendButton.click();
    } catch (err) {
        console.error('[Claude] Send button error:', err);
    }
}

function waitForButton(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const check = () => {
            // 查找发送按钮
            const btn = document.querySelector('button[aria-label*="Send" i]') ||
                document.querySelector('button[aria-label*="send" i]');

            if (btn) {
                // 检查是否禁用
                const isDisabled = btn.disabled || btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true';

                if (!isDisabled) {
                    resolve(btn);
                    return;
                }
            }

            if (Date.now() - startTime > timeout) {
                // 超时后即使禁用也返回按钮
                if (btn) {
                    resolve(btn);
                } else {
                    reject(new Error('Claude send button not found'));
                }
            } else {
                setTimeout(check, 200);
            }
        };

        check();
    });
}
