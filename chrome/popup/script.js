// Get platform specific controls object.
let platform = chrome ? chrome : browser;

// Setup extension.
document.addEventListener('DOMContentLoaded', function() {
  platform.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    // Get domain.
    let domain = tabs[0].url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];

    // Get input fields.
    let input = document.getElementById('controls').children;

    // Add input change event.
    for (let i = 0; i < input.length; i++) {
      input[i].addEventListener('change', function() {
        // Set value to other input field.
        for (let j = 0; j < input.length; j++) {
          if (input[j] === this) {
            continue;
          }
          input[j].value = this.value;
        }

        // Set volume level of tab.
        platform.runtime.sendMessage({ id: tabs[0].id, volume: this.value });

        // Store value level.
        let items = {};
        items[domain] = this.value;
        platform.storage.sync.set(items);

        // Update badge
        const text = String(this.value);
        chrome.browserAction.setBadgeText({ text, tabId: tabs[0].id });
      });
    }

    // Add button click event.
    document.getElementById('stopBtn').addEventListener('click', function() {
      // Set volume to default 100 to disable the system.
      platform.runtime.sendMessage({ id: tabs[0].id, volume: 100 });

      // Hide the badge
      chrome.browserAction.setBadgeText({ text: "", tabId: tabs[0].id });

      // Store default volume level in storage.
      let items = {};
      items[domain] = 100;
      platform.storage.sync.set(items);

      // Exit the window.
      window.close();
    });

    // Get volume level from storage.
    platform.storage.sync.get(domain, function(items) {
      // Apply volume level.
      let volume = items[domain];
      if (volume) {
        platform.runtime.sendMessage({ id: tabs[0].id, volume: volume });
      } else {
        // If no volume level given, set default to 100 and store it in storage.
        volume = 100;
        let items = {};
        items[domain] = 100;
        platform.storage.sync.set(items);
      }

      // Apply volume to interface.
      for (let k = 0; k < input.length; k++) {
        input[k].value = volume;
      }
    });
  });
});