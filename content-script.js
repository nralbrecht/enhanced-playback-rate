// inject player script
const script = document.createElement("script");
script.setAttribute("src", chrome.runtime.getURL("player.js"));
script.addEventListener("load", function() {
    this.remove();
});
(document.head || document.documentElement).appendChild(script);

let hotkeys = [];
function hotkeySpecificity(hotkey) {
    let specificity = 0;

    if (hotkey.hotkey.ctrlKey) {
        specificity |= 1;
    }
    else if (hotkey.hotkey.shiftKey) {
        specificity |= 2;
    }
    else if (hotkey.hotkey.metaKey) {
        specificity |= 4;
    }
    else if (hotkey.hotkey.altKey) {
        specificity |= 8;
    }

    return specificity;
}
function sortHotkeys() {
    hotkeys.sort((a, b) => {
        if (!a?.hotkey) {
            return -1;
        }
        else if (!b?.hotkey) {
            return 1;
        }
        else if (a.hotkey.code === b.hotkey.code) {
            return hotkeySpecificity(b) - hotkeySpecificity(a);
        }
        else {
            if (a.hotkey.code > b.hotkey.code) {
                return -1;
            }
            else {
                return 1;
            }
        }
    });
}
chrome.storage.onChanged.addListener(function(changes) {
    if (changes?.hotkeys?.newValue) {
        hotkeys = changes.hotkeys.newValue;
        sortHotkeys();
    }
});
chrome.storage.local.get("hotkeys", function(result) {
    if (result?.hotkeys) {
        hotkeys = result.hotkeys;
        sortHotkeys();
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
        && hotkey?.hotkey
        && hotkey.hotkey.code == event.code
        && (!hotkey.hotkey.ctrlKey || hotkey.hotkey.ctrlKey == event.ctrlKey)
        && (!hotkey.hotkey.shiftKey || hotkey.hotkey.shiftKey == event.shiftKey)
        && (!hotkey.hotkey.metaKey || hotkey.hotkey.metaKey == event.metaKey)
        && (!hotkey.hotkey.altKey || hotkey.hotkey.altKey == event.altKey);
}

const website = [
    { key: "TWITCH", pattern: /.*:\/\/.*\.twitch\.tv\/.*/ },
    { key: "YOUTUBE", pattern: /.*:\/\/.*\.youtube\.com\/.*/ }
].filter(site => {
    return site.pattern.test(document.location.href);
}).map(site => {
    return site.key;
})?.[0];

function doesHotkeyMatchWebsite(hotkey) {
    return hotkey?.websites
        && hotkey.websites.indexOf(website) != -1;
}

document.addEventListener("keydown", function(event) {
    if (event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT") {
        return;
    }

    for (const hotkey of hotkeys) {
        if (hotkey?.action
                && doesHotkeyMatchWebsite(hotkey)
                && doesHotkeyMatchEvent(hotkey, event)) {

            window.postMessage({
                "source": "ENHANCED_PLAYBACK_RATE",
                "action": hotkey.action,
                "targetIsBody": event.target === document.body,
                ...hotkey.arguments
            });

            event.preventDefault();
            break;
        }
    }
});
