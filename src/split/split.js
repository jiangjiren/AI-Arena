// 分屏页面逻辑

const AI_SITES = {
  chatgpt: {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    color: '#10a37f'
  },
  gemini: {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: '#4285f4'
  },
  claude: {
    name: 'Claude',
    url: 'https://claude.ai',
    color: '#cc785c'
  },
  grok: {
    name: 'Grok',
    url: 'https://grok.com',
    color: '#333333'
  },
  deepseek: {
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com',
    color: '#4d6bfe'
  },
  yuanbao: {
    name: '元宝',
    url: 'https://yuanbao.tencent.com',
    color: '#ffb800'
  }
};

const AI_INPUT_SELECTORS = {
  chatgpt: '#prompt-textarea, div[contenteditable="true"][id="prompt-textarea"]',
  gemini: 'rich-textarea div[contenteditable="true"], .ql-editor[contenteditable="true"]',
  claude: 'div[contenteditable="true"].ProseMirror, div[contenteditable="true"]',
  grok: 'textarea, div[contenteditable="true"]',
  deepseek: 'textarea#chat-input, textarea._27c9245.ds-scroll-area, textarea[placeholder*="DeepSeek"]',
  yuanbao: '.ql-editor[contenteditable="true"], #search-bar .ql-editor'
};

const ICONS = {
  refresh: `<svg viewBox="0 0 24 24"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  openNew: `<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
  home: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  eyeOpen: `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  eyeClosed: `<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
};

const SITE_ORDER = ['chatgpt', 'gemini', 'claude', 'grok', 'deepseek', 'yuanbao'];
const STORAGE_KEYS = {
  selection: 'selectedAIs',
  prompt: 'splitPrompt',
  hideInputs: 'hideIframeInputs'
};

let splitItems = [];
let lastPromptId = null;
let hideInputsState = {}; // 记录每个分屏的输入框隐藏状态

// i18n helper function
function i18n(key, fallback = '') {
  return chrome.i18n.getMessage(key) || fallback;
}

// Initialize i18n for static elements
function initI18n() {
  // Update title
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      element.textContent = message;
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      element.placeholder = message;
    }
  });

  // Update titles
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      element.title = message;
    }
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== 分屏页面已加载 ===');

  // Initialize i18n
  initI18n();

  chrome.storage.local.get([STORAGE_KEYS.selection, STORAGE_KEYS.prompt], (result) => {
    const selected = Array.isArray(result.selectedAIs) ? result.selectedAIs : [];
    applySelection(selected);

    if (result.splitPrompt) {
      handleSplitPrompt(result.splitPrompt);
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;

    if (changes.selectedAIs) {
      const selected = Array.isArray(changes.selectedAIs.newValue)
        ? changes.selectedAIs.newValue
        : [];
      applySelection(selected);
    }

    if (changes.splitPrompt && changes.splitPrompt.newValue) {
      handleSplitPrompt(changes.splitPrompt.newValue);
    }
  });

  // 初始化底部统一输入框
  initUnifiedInput();
});

// 初始化底部统一输入框
function initUnifiedInput() {
  const textarea = document.getElementById('unifiedInput');
  const sendBtn = document.getElementById('sendBtn');

  if (!textarea || !sendBtn) return;

  // 自动调整textarea高度
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    updateSendButtonState();
  });

  // 更新发送按钮状态
  function updateSendButtonState() {
    const hasText = textarea.value.trim().length > 0;
    sendBtn.disabled = !hasText;
  }

  // 发送按钮点击
  sendBtn.addEventListener('click', () => {
    sendFromUnifiedInput();
  });

  // Enter键发送（Shift+Enter换行）
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendFromUnifiedInput();
    }
  });

  // 初始状态
  updateSendButtonState();
}

// 从统一输入框发送消息
function sendFromUnifiedInput() {
  const textarea = document.getElementById('unifiedInput');
  if (!textarea) return;

  const text = textarea.value.trim();
  if (!text) return;

  // 发送到所有AI
  sendMessageToAll(text);

  // 清空输入框
  textarea.value = '';
  textarea.style.height = 'auto';

  // 更新按钮状态
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) sendBtn.disabled = true;
}

function createSplitItem(siteKey) {
  const site = AI_SITES[siteKey];
  if (!site) return null;
  return {
    id: `split-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    siteKey,
    ...site
  };
}

function applySelection(siteKeys) {
  const normalized = SITE_ORDER.filter(key => siteKeys.includes(key) && AI_SITES[key]);
  const existingByKey = new Map(splitItems.map(item => [item.siteKey, item]));

  splitItems = normalized
    .map(key => existingByKey.get(key) || createSplitItem(key))
    .filter(Boolean);

  renderSplits();
}

// 渲染分屏
function renderSplits() {
  const container = document.getElementById('splitContainer');

  container.className = 'split-container';
  if (splitItems.length === 1) container.classList.add('single');
  else if (splitItems.length === 2) container.classList.add('two');
  else if (splitItems.length === 3) container.classList.add('three');

  if (splitItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🤖</div>
        <h2>${i18n('emptyTitle', '未选择 AI 对话模型')}</h2>
        <p>${i18n('emptyDescription', '请在插件弹窗中选择 AI 模型开始对话。')}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = splitItems.map(item => `
    <div class="split-item" data-id="${item.id}" data-site="${item.siteKey}">
        <!-- 顶部工具栏 -->
        <div class="split-toolbar">
            <div class="toolbar-left">
                <span class="ai-name" style="--ai-color: ${item.color}">${item.name}</span>
            </div>
            <div class="toolbar-center">
                <button class="toolbar-btn reload" data-id="${item.id}" title="${i18n('reload', '刷新')}">
                    ${ICONS.refresh}
                </button>
            </div>
            <div class="toolbar-right">
                <button class="toolbar-btn toggle-input" data-id="${item.id}" title="${i18n('toggleInput', '切换原生输入框')}">
                    ${ICONS.eyeOpen}
                </button>
                <button class="toolbar-btn home" data-id="${item.id}" data-url="${item.url}" title="${i18n('reload', '刷新')}">
                    ${ICONS.home}
                </button>
                <button class="toolbar-btn open-new" data-url="${item.url}" title="${i18n('openInNewTab', '在新标签页打开')}">
                    ${ICONS.openNew}
                </button>
            </div>
        </div>

        <div class="split-item-content">
            <div class="loading-overlay" id="loading-${item.id}">
                <div class="spinner"></div>
            </div>
            <iframe
                id="iframe-${item.id}"
                name="${item.siteKey}-iframe"
                src="${item.url}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                data-site="${item.siteKey}"
            ></iframe>
        </div>
    </div>
  `).join('');

  container.querySelectorAll('.split-item').forEach(item => {
    const id = item.dataset.id;

    // 刷新按钮
    const reloadBtn = item.querySelector('.toolbar-btn.reload');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => reloadSplit(id));
    }

    // 返回首页按钮
    const homeBtn = item.querySelector('.toolbar-btn.home');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        const url = homeBtn.dataset.url;
        const iframe = item.querySelector('iframe');
        const loader = item.querySelector('.loading-overlay');
        if (iframe && url) {
          if (loader) loader.style.display = 'flex';
          iframe.src = url;
        }
      });
    }

    // 新窗口打开按钮
    const openNewBtn = item.querySelector('.toolbar-btn.open-new');
    if (openNewBtn) {
      openNewBtn.addEventListener('click', () => {
        const url = openNewBtn.dataset.url;
        if (url) window.open(url, '_blank');
      });
    }

    // 隐藏/显示输入框按钮
    const toggleInputBtn = item.querySelector('.toolbar-btn.toggle-input');
    if (toggleInputBtn) {
      // 初始化状态（默认隐藏）
      if (hideInputsState[id] === undefined) {
        hideInputsState[id] = true; // 默认隐藏iframe内的输入框
      }
      updateToggleInputBtn(toggleInputBtn, hideInputsState[id]);

      toggleInputBtn.addEventListener('click', () => {
        const iframe = item.querySelector('iframe');
        if (!iframe) return;

        // 切换状态
        hideInputsState[id] = !hideInputsState[id];
        const shouldHide = hideInputsState[id];

        // 更新按钮图标
        updateToggleInputBtn(toggleInputBtn, shouldHide);

        // 向iframe发送消息
        try {
          iframe.contentWindow.postMessage({
            type: 'TOGGLE_INPUT_VISIBILITY',
            data: { hide: shouldHide }
          }, '*');
        } catch (e) {
          console.log('=== 发送隐藏输入框消息失败:', e);
        }
      });
    }

    const iframe = item.querySelector('iframe');
    const loader = item.querySelector('.loading-overlay');

    if (iframe && loader) {
      try {
        if (iframe.contentWindow && iframe.contentWindow.document.readyState === 'complete') {
          loader.style.display = 'none';
        }
      } catch (e) {
        // Cross-origin, ignore
      }

      iframe.addEventListener('load', () => {
        console.log('Iframe loaded:', id);
        loader.style.display = 'none';
      });

      iframe.addEventListener('error', () => {
        console.error('Iframe error:', id);
        loader.style.display = 'none';
      });
    }
  });
}

// 更新隐藏/显示输入框按钮的图标
function updateToggleInputBtn(btn, isHidden) {
  if (!btn) return;
  btn.innerHTML = isHidden ? ICONS.eyeClosed : ICONS.eyeOpen;
  btn.title = isHidden ? i18n('toggleInput', '切换原生输入框') : i18n('toggleInput', '切换原生输入框');
  btn.classList.toggle('active', isHidden);
}

function reloadSplit(id) {
  const item = document.querySelector(`.split-item[data-id="${id}"]`);
  if (item) {
    const iframe = item.querySelector('iframe');
    const loader = item.querySelector('.loading-overlay');
    if (loader) loader.style.display = 'flex';
    iframe.src = iframe.src;
  }
}

function handleSplitPrompt(prompt) {
  if (!prompt || !prompt.text) return;
  if (prompt.id && prompt.id === lastPromptId) return;

  lastPromptId = prompt.id || lastPromptId;
  sendMessageToAll(prompt.text, prompt.targets);

  chrome.storage.local.set({ splitPrompt: null });
}

function sendMessageToAll(message, targets) {
  const text = typeof message === 'string' ? message.trim() : '';
  if (!text) {
    showNotification(i18n('pleaseEnterContent', '请输入内容'));
    return;
  }

  const targetSet = Array.isArray(targets) && targets.length
    ? new Set(targets)
    : null;

  const targetItems = targetSet
    ? splitItems.filter(item => targetSet.has(item.siteKey))
    : splitItems;

  if (targetItems.length === 0) {
    showNotification(i18n('noAIWindowAvailable', '没有可用的 AI 对话窗口'));
    return;
  }

  let successCount = 0;

  targetItems.forEach(item => {
    const iframe = document.getElementById(`iframe-${item.id}`);
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage({
          type: 'SEARCH_MESSAGE',
          data: {
            searchText: text,
            instanceId: item.siteKey,
            entrance: 'split_screen',
            jsSelect: AI_INPUT_SELECTORS[item.siteKey],
            retry: false
          }
        }, '*');
        successCount++;
      } catch (e) {
        console.log(`=== 发送到 ${item.siteKey} 失败:`, e);
      }
    }
  });

  if (successCount === 0) {
    showNotification(i18n('sendFailed', '发送失败，请刷新页面重试'));
  }
}

function showNotification(message) {
  const existing = document.querySelector('.split-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = 'split-notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
