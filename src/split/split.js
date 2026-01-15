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
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  openNew: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  // 键盘图标：表示输入框可见
  keyboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6" y2="8"></line><line x1="10" y1="8" x2="10" y2="8"></line><line x1="14" y1="8" x2="14" y2="8"></line><line x1="18" y1="8" x2="18" y2="8"></line><line x1="6" y1="12" x2="6" y2="12"></line><line x1="10" y1="12" x2="10" y2="12"></line><line x1="14" y1="12" x2="14" y2="12"></line><line x1="18" y1="12" x2="18" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>`,
  // 禁用键盘图标：表示输入框隐藏
  keyboardOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="6" y1="8" x2="6" y2="8"></line><line x1="10" y1="8" x2="10" y2="8"></line><line x1="14" y1="8" x2="14" y2="8"></line><line x1="7" y1="16" x2="17" y2="16"></line><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
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
let defaultHideInputs = true; // 默认隐藏输入框

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

  chrome.storage.local.get([STORAGE_KEYS.selection, STORAGE_KEYS.prompt, STORAGE_KEYS.hideInputs], (result) => {
    if (result.hideIframeInputs !== undefined) {
      defaultHideInputs = result.hideIframeInputs;
    }
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

// 渲染分屏（增量更新模式，保留现有iframe不重建）
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

  // 获取当前DOM中存在的split-item的siteKey
  const existingElements = new Map();
  container.querySelectorAll('.split-item').forEach(el => {
    const siteKey = el.dataset.site;
    if (siteKey) {
      existingElements.set(siteKey, el);
    }
  });

  // 获取目标的siteKey集合
  const targetSiteKeys = new Set(splitItems.map(item => item.siteKey));

  // 移除不再需要的元素
  existingElements.forEach((el, siteKey) => {
    if (!targetSiteKeys.has(siteKey)) {
      el.remove();
      existingElements.delete(siteKey);
    }
  });

  // 清空空状态提示（如果有）
  const emptyState = container.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }

  // 按顺序重新排列或添加元素
  splitItems.forEach((item, index) => {
    let element = existingElements.get(item.siteKey);

    if (!element) {
      // 创建新元素
      element = createSplitElement(item);
      initSplitElement(element, item);
    }

    // 更新 data-id（因为 splitItem 可能被重新创建）
    element.dataset.id = item.id;

    // 确保元素在正确的位置
    const currentChildren = Array.from(container.children);
    if (currentChildren[index] !== element) {
      if (index < currentChildren.length) {
        container.insertBefore(element, currentChildren[index]);
      } else {
        container.appendChild(element);
      }
    }
  });
}

// 创建分屏元素的DOM
function createSplitElement(item) {
  const div = document.createElement('div');
  div.className = 'split-item';
  div.dataset.id = item.id;
  div.dataset.site = item.siteKey;
  div.innerHTML = `
    <!-- 顶部工具栏 -->
    <div class="split-toolbar">
        <div class="toolbar-left">
            <span class="ai-name" style="--ai-color: ${item.color}">${item.name}</span>
            <button class="toolbar-btn reload" data-id="${item.id}" title="${i18n('reload', '刷新')}">
                ${ICONS.refresh}
            </button>
        </div>
        <div class="toolbar-right">
            <button class="toolbar-btn toggle-input" data-id="${item.id}" title="${i18n('toggleInput', '切换原生输入框')}">
                ${ICONS.keyboard}
            </button>
            <button class="toolbar-btn home" data-id="${item.id}" data-url="${item.url}" title="${i18n('home', '返回首页')}">
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
  `;
  return div;
}

// 初始化分屏元素的事件监听
function initSplitElement(element, item) {
  const id = item.id;

  // 刷新按钮
  const reloadBtn = element.querySelector('.toolbar-btn.reload');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => reloadSplit(id));
  }

  // 返回首页按钮
  const homeBtn = element.querySelector('.toolbar-btn.home');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      const url = homeBtn.dataset.url;
      const iframe = element.querySelector('iframe');
      const loader = element.querySelector('.loading-overlay');
      if (iframe && url) {
        if (loader) loader.style.display = 'flex';
        iframe.src = url;
      }
    });
  }

  // 新窗口打开按钮
  const openNewBtn = element.querySelector('.toolbar-btn.open-new');
  if (openNewBtn) {
    openNewBtn.addEventListener('click', () => {
      const iframe = element.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        // 通过 postMessage 通知 iframe 内的 content script 打开当前页面
        try {
          iframe.contentWindow.postMessage({
            type: 'OPEN_IN_NEW_TAB'
          }, '*');
        } catch (e) {
          // 如果发送失败，回退到打开首页
          console.log('=== 发送新标签页打开消息失败，回退到首页:', e);
          const url = openNewBtn.dataset.url;
          if (url) window.open(url, '_blank');
        }
      } else {
        // 如果 iframe 不可用，打开首页
        const url = openNewBtn.dataset.url;
        if (url) window.open(url, '_blank');
      }
    });
  }

  // 隐藏/显示输入框按钮
  const toggleInputBtn = element.querySelector('.toolbar-btn.toggle-input');
  if (toggleInputBtn) {
    // 初始化状态（默认隐藏）
    if (hideInputsState[id] === undefined) {
      hideInputsState[id] = defaultHideInputs; // 默认根据设置隐藏
    }
    updateToggleInputBtn(toggleInputBtn, hideInputsState[id]);

    toggleInputBtn.addEventListener('click', () => {
      const iframe = element.querySelector('iframe');
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

  const iframe = element.querySelector('iframe');
  const loader = element.querySelector('.loading-overlay');

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

      // Apply initial input visibility state
      try {
        iframe.contentWindow.postMessage({
          type: 'TOGGLE_INPUT_VISIBILITY',
          data: { hide: hideInputsState[id] }
        }, '*');
      } catch (e) {
        console.log('=== Failed to sync input visibility:', e);
      }
    });

    iframe.addEventListener('error', () => {
      console.error('Iframe error:', id);
      loader.style.display = 'none';
    });
  }
}

// 更新隐藏/显示输入框按钮的图标
function updateToggleInputBtn(btn, isHidden) {
  if (!btn) return;
  btn.innerHTML = isHidden ? ICONS.keyboardOff : ICONS.keyboard;
  btn.title = isHidden ? i18n('toggleInput', '切换原生输入框') : i18n('toggleInput', '切换原生输入框');
  btn.classList.toggle('active', isHidden);
}

function reloadSplit(id) {
  const item = document.querySelector(`.split-item[data-id="${id}"]`);
  if (item) {
    const iframe = item.querySelector('iframe');
    const loader = item.querySelector('.loading-overlay');
    if (loader) loader.style.display = 'flex';

    // 通过 postMessage 通知 iframe 内的 content script 执行刷新
    // 这样可以刷新当前页面（保留对话），而不是跳回首页
    try {
      iframe.contentWindow.postMessage({
        type: 'RELOAD_PAGE'
      }, '*');
    } catch (e) {
      console.log('=== 发送刷新消息失败，回退到 src 重置:', e);
      iframe.src = iframe.src;
    }
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
