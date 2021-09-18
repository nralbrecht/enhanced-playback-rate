// inject player script
const script = document.createElement("script");
script.setAttribute("src", chrome.runtime.getURL("player.js"));
script.addEventListener("load", function() {
    this.remove();
});
(document.head || document.documentElement).appendChild(script);


function doesHotkeyMatchEvent(hotkey, event) {
    return hotkey.code == event.code
        && (!hotkey.ctrlKey || hotkey.ctrlKey == event.ctrlKey)
        && (!hotkey.shiftKey || hotkey.shiftKey == event.shiftKey)
        && (!hotkey.metaKey || hotkey.metaKey == event.metaKey)
        && (!hotkey.altKey || hotkey.altKey == event.altKey);
}

const hotkeys = [
    {
        hotkey: {
            code: "Period"
        },
        action: "INCREASE_PLAYBACK_RATE"
    },
    {
        hotkey: {
            code: "BracketRight"
        },
        action: "INCREASE_PLAYBACK_RATE"
    },
    {
        hotkey: {
            code: "ArrowUp",
            ctrlKey: true
        },
        action: "INCREASE_PLAYBACK_RATE"
    },
    {
        hotkey: {
            code: "Comma"
        },
        action: "DECREASE_PLAYBACK_RATE"
    },
    {
        hotkey: {
            code: "Backslash"
        },
        action: "DECREASE_PLAYBACK_RATE"
    },
    {
        hotkey: {
            code: "ArrowDown",
            ctrlKey: true
        },
        action: "DECREASE_PLAYBACK_RATE"
    },
    {
        hotkey: {
            code: "Digit1"
        },
        action: "SET_PLAYBACK_RATE",
        arguments: {
            newPlaybackRate: 1
        }
    },
    {
        hotkey: {
            code: "Digit2"
        },
        action: "SET_PLAYBACK_RATE",
        arguments: {
            newPlaybackRate: 1.5
        }
    },
    {
        hotkey: {
            code: "Digit3"
        },
        action: "SET_PLAYBACK_RATE",
        arguments: {
            newPlaybackRate: 2
        }
    },
    {
        hotkey: {
            code: "Digit4"
        },
        action: "SET_PLAYBACK_RATE",
        arguments: {
            newPlaybackRate: 4
        }
    },
    {
        hotkey: {
            code: "Digit5"
        },
        action: "SET_PLAYBACK_RATE",
        arguments: {
            newPlaybackRate: 10
        }
    },
    {
        hotkey: {
            code: "Space"
        },
        action: "TOGGLE_PLAY_PAUSE"
    },
    {
        hotkey: {
            code: "KeyT"
        },
        action: "TOGGLE_THEATER_MODE"
    },
    {
        hotkey: {
            code: "Enter"
        },
        action: "FOCUS_CHAT"
    }
];

document.addEventListener("keydown", function(e) {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
        return;
    }

    for (const hotkey of hotkeys) {
        if (doesHotkeyMatchEvent(hotkey.hotkey, e)) {
            window.postMessage({
                "source": "ENHANCED_PLAYBACK_RATE",
                "action": hotkey.action,
                "targetIsBody": e.target === document.body,
                ...hotkey.arguments
            });

            e.preventDefault();
            return;
        }
    }
});
