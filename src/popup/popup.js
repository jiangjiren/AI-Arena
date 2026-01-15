document.addEventListener('DOMContentLoaded', () => {
  // Initialize i18n
  initI18n();

  const openSplitBtn = document.getElementById('open-split-btn');
  const statusDiv = document.getElementById('status');

  const siteOrder = ['chatgpt', 'gemini', 'claude', 'grok', 'deepseek', 'yuanbao'];

  const controlButtons = {
    chatgpt: document.getElementById('btnToggleChatGPT'),
    gemini: document.getElementById('btnToggleGemini'),
    claude: document.getElementById('btnToggleClaude'),
    grok: document.getElementById('btnToggleGrok'),
    deepseek: document.getElementById('btnToggleDeepSeek'),
    yuanbao: document.getElementById('btnToggleYuanbao')
  };

  function getSelectedAIs() {
    return siteOrder.filter(key => {
      const btn = controlButtons[key];
      return btn && btn.classList.contains('active');
    });
  }

  function syncSelectionUI(selected) {
    siteOrder.forEach(key => {
      const isSelected = selected.includes(key);
      const btn = controlButtons[key];
      if (btn) {
        if (isSelected) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  function saveSelection(selected) {
    chrome.storage.local.set({ selectedAIs: selected });
    syncSelectionUI(selected);
  }

  // 为每个AI卡片添加点击事件
  Object.entries(controlButtons).forEach(([key, btn]) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const selected = new Set(getSelectedAIs());
      if (selected.has(key)) {
        selected.delete(key);
      } else {
        if (selected.size >= 3) {
          setStatus(chrome.i18n.getMessage('maxSelectionError') || '最多只能选择 3 个 AI', 'error');
          return;
        }
        selected.add(key);
      }
      saveSelection(siteOrder.filter(site => selected.has(site)));
    });
  });

  // 打开分屏按钮
  if (openSplitBtn) {
    openSplitBtn.addEventListener('click', () => {
      const selectedAIs = getSelectedAIs();
      if (selectedAIs.length === 0) {
        const errorMsg = chrome.i18n.getMessage('emptyTitle') || '请至少选择一个 AI';
        setStatus(errorMsg, 'error');
        return;
      }
      chrome.runtime.sendMessage({ action: 'OPEN_SPLIT_VIEW' });
    });
  }

  // 加载保存的选择状态
  chrome.storage.local.get(['selectedAIs', 'hideIframeInputs'], (result) => {
    const saved = Array.isArray(result.selectedAIs) ? result.selectedAIs : [];
    if (saved.length > 0) {
      syncSelectionUI(saved);
    } else {
      // 默认选中 ChatGPT 和 Gemini
      saveSelection(['chatgpt', 'gemini']);
    }

    // Load hide inputs setting
    const hideInputsCheckbox = document.getElementById('hide-inputs-checkbox');
    if (hideInputsCheckbox) {
      if (result.hideIframeInputs !== undefined) {
        hideInputsCheckbox.checked = result.hideIframeInputs;
      } else {
        // Default checked
        hideInputsCheckbox.checked = true;
        chrome.storage.local.set({ hideIframeInputs: true });
      }

      // Add change listener
      hideInputsCheckbox.addEventListener('change', (e) => {
        chrome.storage.local.set({ hideIframeInputs: e.target.checked });
      });
    }
  });

  function setStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = type || '';
    if (type === 'error') {
      setTimeout(() => setStatus('', ''), 2000);
    }
  }
});

// i18n initialization function
function initI18n() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      element.textContent = message;
    }
  });
}
