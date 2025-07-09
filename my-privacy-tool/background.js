let trackerDB = {};
let knownTrackers = {};

fetch(chrome.runtime.getURL("known-trackers.json"))
  .then(res => res.json())
  .then(json => {
    knownTrackers = json;
  });

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const domain = (new URL(details.url)).hostname;
    const tabId = details.tabId;

    if (tabId < 0) return;

    if (!trackerDB[tabId]) trackerDB[tabId] = [];

    let category = "Unknown";
    for (const cat in knownTrackers) {
      if (knownTrackers[cat].some(k => domain.includes(k))) {
        category = cat;
        break;
      }
    }

    trackerDB[tabId].push({ domain, category });
  },
  { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "getTrackers") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      const trackers = trackerDB[tabId] || [];
      const unique = [];

      const seen = new Set();
      for (let t of trackers) {
        if (!seen.has(t.domain)) {
          seen.add(t.domain);
          unique.push(t);
        }
      }

      sendResponse({ trackers: unique });
    });
    return true;
  }
});
