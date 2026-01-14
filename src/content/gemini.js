chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXECUTE_PROMPT') {
        handlePrompt(request.prompt);
    }
});

async function handlePrompt(text) {
    // Gemini uses a contenteditable div
    // Try multiple selectors
    let inputArea = document.querySelector('div[contenteditable="true"]') ||
        document.querySelector('.ql-editor') ||
        document.querySelector('div[role="textbox"]');

    if (!inputArea) {
        console.error('Gemini input area not found');
        return;
    }

    // Focus and insert text
    inputArea.focus();

    // Use execCommand for contenteditable to ensure internal state updates
    document.execCommand('insertText', false, text);

    // Ensure we dispatch events
    inputArea.dispatchEvent(new Event('input', { bubbles: true }));

    // Wait briefly for UI to react
    await new Promise(r => setTimeout(r, 200));

    // Find and click send button with polling
    try {
        const sendButton = await waitForButton();
        // Sometimes Gemini buttons need a specific event or strict click
        sendButton.click();
    } catch (err) {
        console.error('Gemini send button error:', err);
    }
}

function waitForButton(timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const check = () => {
            // Gemini selectors
            const btn = document.querySelector('button[aria-label="Send message"]') ||
                document.querySelector('button[aria-label="Send"]') ||
                document.querySelector('button[class*="send-button"]');

            // Check if button is enabled
            const isDisabled = btn && (btn.disabled || btn.getAttribute('aria-disabled') === 'true');

            if (btn && !isDisabled) {
                resolve(btn);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error('Gemini send button not found or disabled after timeout'));
            } else {
                setTimeout(check, 500);
            }
        };

        check();
    });
}
