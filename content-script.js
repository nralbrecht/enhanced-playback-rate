// inject player script
const script = document.createElement("script");
script.setAttribute("src", chrome.runtime.getURL("player.js"));
script.addEventListener("load", function() {
    this.remove();
});
(document.head || document.documentElement).appendChild(script);

let hotkeys = [];
chrome.storage.onChanged.addListener(function(changes) {
    if (changes?.hotkeys?.newValue) {
        hotkeys = changes.hotkeys.newValue;
    }
});
chrome.storage.local.get("hotkeys", function(result) {
    if (result?.hotkeys) {
        hotkeys = result.hotkeys;
    }
    else {
        fetch(chrome.runtime.getURL("default-hotkeys.json"))
            .then(response => response.json())
            .then(data => {
                chrome.storage.local.set({
                    "hotkeys": data
                });
            });
    }
});

function doesHotkeyMatchEvent(hotkey, event) {
    return hotkey
        && hotkey.code == event.code
        && (!hotkey.ctrlKey || hotkey.ctrlKey == event.ctrlKey)
        && (!hotkey.shiftKey || hotkey.shiftKey == event.shiftKey)
        && (!hotkey.metaKey || hotkey.metaKey == event.metaKey)
        && (!hotkey.altKey || hotkey.altKey == event.altKey);
}

document.addEventListener("keydown", function(event) {
    if (event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT") {
        return;
    }

    for (const hotkey of hotkeys) {
        if (hotkey?.action && doesHotkeyMatchEvent(hotkey?.hotkey, event)) {
            window.postMessage({
                "source": "ENHANCED_PLAYBACK_RATE",
                "action": hotkey.action,
                "targetIsBody": event.target === document.body,
                ...hotkey.arguments
            });

            event.preventDefault();
        }
    }
});
