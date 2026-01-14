chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXECUTE_PROMPT') {
        handlePrompt(request.prompt);
    }
});

// 查找输入框的函数
function findInputElement() {
    // 方法1: 通过 ID 查找 (ChatGPT 新版使用 contenteditable div)
    let inputElement = document.getElementById('prompt-textarea');
    if (inputElement) return inputElement;

    // 方法2: contenteditable div
    inputElement = document.querySelector('#prompt-textarea[contenteditable="true"]');
    if (inputElement) return inputElement;

    // 方法3: 查找任何 contenteditable 的主输入区域
    inputElement = document.querySelector('div[contenteditable="true"][data-placeholder]');
    if (inputElement) return inputElement;

    // 方法4: 查找 ProseMirror 编辑器
    inputElement = document.querySelector('.ProseMirror[contenteditable="true"]');
    if (inputElement) return inputElement;

    // 方法5: 通用 textarea 查找
    inputElement = document.querySelector('textarea[placeholder*="Message"]') ||
        document.querySelector('textarea[placeholder*="message"]');

    return inputElement;
}

// 等待输入框出现（最多等待 maxWaitMs 毫秒）
async function waitForInputElement(maxWaitMs = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
        const element = findInputElement();
        if (element) {
            return element;
        }
        // 每 200ms 检查一次
        await new Promise(r => setTimeout(r, 200));
    }


    return null;
}

async function handlePrompt(text) {

    // 等待输入框出现（最多等待10秒）
    let inputElement = await waitForInputElement(10000);



    if (!inputElement) {
        console.error('[ChatGPT Extension] No input element found');
        return;
    }

    // 1. Focus
    inputElement.focus();

    // 2. 根据元素类型设置内容
    const isContentEditable = inputElement.getAttribute('contenteditable') === 'true';

    if (isContentEditable) {
        // 对于 contenteditable 元素
        inputElement.innerHTML = '';
        inputElement.textContent = text;

        // 创建一个 text node 并设置光标位置
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(inputElement);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    } else {
        // 对于 textarea
        inputElement.value = '';
        inputElement.value = text;
    }

    // 3. Dispatch input event - critical for React
    inputElement.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text
    }));

    // Also standard event for safety
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise(r => setTimeout(r, 500));

    // 4. Send via Enter key
    const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
    });
    inputElement.dispatchEvent(enterEvent);

    // 5. If Enter fails, try clicking the button (but avoid clicking stop button)
    setTimeout(() => {
        // 首先检查输入框是否已经清空（说明消息已经发送成功）
        const currentInput = document.getElementById('prompt-textarea');
        const inputContent = currentInput ?
            (currentInput.textContent || currentInput.value || '').trim() : '';

        if (!inputContent) {
            // 输入框已清空，说明消息已经通过 Enter 键发送成功，不需要再点击按钮
            return;
        }

        // 尝试多种按钮选择器 (ChatGPT 新版使用 #composer-submit-button)
        const btn = document.querySelector('#composer-submit-button') ||
            document.querySelector('button#composer-submit-button') ||
            document.querySelector('[data-testid="send-button"]') ||
            document.querySelector('button[data-testid="send-button"]') ||
            document.querySelector('button[aria-label*="Send"]') ||
            document.querySelector('button[aria-label*="send"]');



        if (btn && !btn.disabled) {
            // 检查按钮是否是"停止"按钮，避免误点
            const ariaLabel = btn.getAttribute('aria-label') || '';
            const btnText = btn.textContent || '';
            const isStopButton = ariaLabel.toLowerCase().includes('stop') ||
                btnText.toLowerCase().includes('stop') ||
                ariaLabel.includes('停止') ||
                btnText.includes('停止');

            if (isStopButton) {
                return;
            }

            btn.click();
        }
    }, 300);
}
