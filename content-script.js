// inject player script
const script = document.createElement("script");
script.setAttribute("src", chrome.runtime.getURL("player.js"));
script.addEventListener("load", function() {
    this.remove();
});
(document.head || document.documentElement).appendChild(script);


document.addEventListener("keydown", function(e) {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
        return;
    }

    if (e.code == "Period"
            || e.code == "BracketRight"
            || (e.code == "ArrowUp" && e.ctrlKey)) {

        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "INCREASE_PLAYBACK_RATE"
        });

        e.preventDefault();
    }
    else if (e.code == "Comma"
            || e.code == "Backslash"
            || (e.code == "ArrowDown" && e.ctrlKey)) {

        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "DECREASE_PLAYBACK_RATE"
        });

        e.preventDefault();
    }
    else if (e.code == "Digit1") {
        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "SET_PLAYBACK_RATE",
            "value": 1
        });

        e.preventDefault();
    }
    else if (e.code == "Digit2") {
        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "SET_PLAYBACK_RATE",
            "value": 1.5
        });

        e.preventDefault();
    }
    else if (e.code == "Digit3") {
        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "SET_PLAYBACK_RATE",
            "value": 2
        });

        e.preventDefault();
    }
    else if (e.code == "Digit4") {
        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "SET_PLAYBACK_RATE",
            "value": 4
        });

        e.preventDefault();
    }
    else if (e.code == "Digit5") {
        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "SET_PLAYBACK_RATE",
            "value": 10
        });

        e.preventDefault();
    }
    else if (e.code == "Space"
            && e.target !== document.body) {

        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "TOGGLE_PLAY_PAUSE"
        });

        e.preventDefault();
    }
    else if (e.code == "KeyT") {
        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "TOGGLE_THEATER_MODE"
        });

        e.preventDefault();
    }
    else if (e.code == "Enter") {
        window.postMessage({
            "source": "ENHANCED_PLAYBACK_RATE",
            "action": "FOCUS_CHAT"
        });

        e.preventDefault();
    }
});
