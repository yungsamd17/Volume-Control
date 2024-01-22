// Get platform specific controls object.
let platform = chrome ? chrome : browser;

document.addEventListener('DOMContentLoaded', function() {
    platform.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        // Get domain.
        let domain = tabs[0].url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];

        // Get the range input and volumerange.
        let rangeInput = document.querySelector('.volume-range');
        let valueDiv = document.querySelector('.value');

        function updateVolume(value) {
            valueDiv.textContent = value + '%';
            platform.runtime.sendMessage({ id: tabs[0].id, volume: value });
        }

        rangeInput.addEventListener('input', function() {
            let value = parseInt(this.value, 10);
            updateVolume(value);

            // Store volume level.
            let items = {};
            items[domain] = value;
            platform.storage.sync.set(items);

            // Update badge.
            const text = String(value);
            chrome.browserAction.setBadgeText({ text, tabId: tabs[0].id });
        });

        // Button click event.
        document.getElementById('resetBtn').addEventListener('click', function() {
            // Set volume to default.
            updateVolume(100);

            // Hide the badge.
            chrome.browserAction.setBadgeText({ text: "", tabId: tabs[0].id });
            // Store default volume level in storage.
            let items = {};
            items[domain] = 100;
            platform.storage.sync.set(items);

            // Exit the window.
            window.close();
        });

        // Get and apply volume level from storage.
        platform.storage.sync.get(domain, function(items) {
            let volume = items[domain];
            if (!volume) {
                volume = 100;
                let items = {};
                items[domain] = 100;
                platform.storage.sync.set(items);
            }

            // Apply volume to interface.
            rangeInput.value = volume;
            valueDiv.textContent = volume + '%';
        });
    });
});