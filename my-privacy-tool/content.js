(async () => {
  const knownTrackers = await fetch(chrome.runtime.getURL("known-trackers.json")).then(r => r.json());
  const currentHost = location.hostname;
  const origin = location.origin;
  const seen = new Set();
  const trackers = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      try {
        const url = new URL(entry.name);
        if (url.hostname === currentHost || seen.has(url.hostname)) continue;
        seen.add(url.hostname);

        let category = "Unknown";
        for (const cat in knownTrackers) {
          if (knownTrackers[cat].some(t => url.hostname.includes(t))) {
            category = cat;
            break;
          }
        }

        trackers.push({ domain: url.hostname, category });
      } catch {}
    }

    if (trackers.length > 0) {
      chrome.runtime.sendMessage({ type: "foundTrackers", origin, trackers });
    }
  });

  observer.observe({ type: "resource", buffered: true });
})();
