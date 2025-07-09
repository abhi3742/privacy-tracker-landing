document.addEventListener("DOMContentLoaded", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const origin = new URL(tab.url).hostname;
  document.getElementById("site-name").innerText = `Site: ${origin}`;

  chrome.runtime.sendMessage({ type: "getTrackers" }, (response) => {
    const trackers = response.trackers || [];
    const count = trackers.length;

    document.getElementById("trackers-count").innerText = `Trackers: ${count}`;
    document.getElementById("privacy-score").innerText = `Privacy Score: ${Math.max(0, 10 - count)}/10`;

    const table = document.getElementById("tracker-table-body");
    table.innerHTML = "";

    if (count === 0) {
      table.innerHTML = "<tr><td colspan='2'>No trackers detected</td></tr>";
    } else {
      for (const t of trackers) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${t.domain}</td><td>${t.category}</td>`;
        table.appendChild(row);
      }
    }
  });
});
