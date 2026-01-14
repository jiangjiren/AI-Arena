const SPLIT_VIEW_URL = chrome.runtime.getURL('src/split/split.html');

// ????? - ??????????? X-Frame-Options ? CSP
chrome.runtime.onInstalled.addListener(async () => {
  console.log('=== AI Multi-Chat ????? ===');

  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIds = rules.map(rule => rule.id);

    if (ruleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds
      });
    }

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'X-Frame-Options', operation: 'remove' },
              { header: 'Content-Security-Policy', operation: 'remove' },
              { header: 'X-Content-Type-Options', operation: 'remove' }
            ]
          },
          condition: {
            urlFilter: '|https://chatgpt.com/*',
            resourceTypes: ['main_frame', 'sub_frame']
          }
        },
        {
          id: 2,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'X-Frame-Options', operation: 'remove' },
              { header: 'Content-Security-Policy', operation: 'remove' },
              { header: 'X-Content-Type-Options', operation: 'remove' }
            ]
          },
          condition: {
            urlFilter: '|https://gemini.google.com/*',
            resourceTypes: ['main_frame', 'sub_frame']
          }
        },
        {
          id: 3,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'X-Frame-Options', operation: 'remove' },
              { header: 'Content-Security-Policy', operation: 'remove' },
              { header: 'X-Content-Type-Options', operation: 'remove' }
            ]
          },
          condition: {
            urlFilter: '|https://claude.ai/*',
            resourceTypes: ['main_frame', 'sub_frame']
          }
        },
        {
          id: 4,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'X-Frame-Options', operation: 'remove' },
              { header: 'Content-Security-Policy', operation: 'remove' },
              { header: 'X-Content-Type-Options', operation: 'remove' }
            ]
          },
          condition: {
            urlFilter: '|https://accounts.google.com/*',
            resourceTypes: ['main_frame', 'sub_frame']
          }
        },
        {
          id: 5,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'X-Frame-Options', operation: 'remove' },
              { header: 'Content-Security-Policy', operation: 'remove' },
              { header: 'X-Content-Type-Options', operation: 'remove' }
            ]
          },
          condition: {
            urlFilter: 'grok.com',
            resourceTypes: ['main_frame', 'sub_frame']
          }
        },
        {
          id: 6,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'X-Frame-Options', operation: 'remove' },
              { header: 'Content-Security-Policy', operation: 'remove' },
              { header: 'X-Content-Type-Options', operation: 'remove' }
            ]
          },
          condition: {
            urlFilter: 'x.com',
            resourceTypes: ['main_frame', 'sub_frame']
          }
        },
        {
          id: 7,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'X-Frame-Options', operation: 'remove' },
              { header: 'Content-Security-Policy', operation: 'remove' },
              { header: 'X-Content-Type-Options', operation: 'remove' }
            ]
          },
          condition: {
            urlFilter: 'deepseek.com',
            resourceTypes: ['main_frame', 'sub_frame']
          }
        },
        {
          id: 8,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'X-Frame-Options', operation: 'remove' },
              { header: 'Content-Security-Policy', operation: 'remove' },
              { header: 'X-Content-Type-Options', operation: 'remove' }
            ]
          },
          condition: {
            urlFilter: 'yuanbao.tencent.com',
            resourceTypes: ['main_frame', 'sub_frame']
          }
        }
      ]
    });

    console.log('=== ???????????? iframe ?? ===');
  } catch (error) {
    console.error('=== ??????:', error);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OPEN_SPLIT_VIEW') {
    openOrFocusSplitView()
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function openOrFocusSplitView() {
  const tabs = await chrome.tabs.query({ url: SPLIT_VIEW_URL });
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    return;
  }

  await chrome.tabs.create({ url: SPLIT_VIEW_URL });
}
