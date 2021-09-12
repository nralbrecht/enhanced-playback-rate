(function(){
    const PLAYBACK_RATES = [
        0.05,
        0.1,
        0.25,
        0.5,
        0.75,
        1,
        1.25,
        1.5,
        2,
        3,
        4,
        10,
        20
    ];

    class TwitchMenuPlaybackRateIndicator {
        update(currentRate) {
            const pillTextElement = document.querySelector(".gAMVPE");

            if (pillTextElement) {
                pillTextElement.innerText = String(currentRate) + "X";
            }
        }
    }

    class TwitchChatHeaderPlaybackRateIndicator {
        constructor() {
            const chatHeaderElement = document.querySelector(".video-chat__header");
            const chatHeaderTextElement = chatHeaderElement.querySelector("span");

            this.chatHeaderPlaybackRateElement = chatHeaderTextElement.cloneNode(true);
            this.chatHeaderPlaybackRateElement.style.cssText = "position: absolute; right: 1rem;";
            this.chatHeaderPlaybackRateElement.innerText = "1x";

            chatHeaderElement.appendChild(this.chatHeaderPlaybackRateElement);
        }

        update(currentRate) {
            this.chatHeaderPlaybackRateElement.innerText = String(currentRate) + "x";
        }
    }

    class Player {
        constructor() {
            this.currentPlaybackRateIndex = 5;
        }

        increasePlaybackRate() {
            if (this.currentPlaybackRateIndex >= PLAYBACK_RATES.length - 1) {
                // cant increase further
                return;
            }

            this.setPlaybackRate(this.currentPlaybackRateIndex + 1);
        }
        decreasePlaybackRate() {
            if (this.currentPlaybackRateIndex <= 0) {
                // cant decrease further
                return;
            }

            this.setPlaybackRate(this.currentPlaybackRateIndex - 1);
        }
        setPlaybackRate(playbackRateIndex) {
            throw new Exception("not implemented");
        }

        play() {
            throw new Exception("not implemented");
        }
        pause() {
            throw new Exception("not implemented");
        }
        isPaused() {
            throw new Exception("not implemented");
        }
        togglePlayPause() {
            if (this.isPaused()) {
                this.play();
            }
            else {
                this.pause();
            }
        }

        toggleTheaterMode() {
            throw new Exception("not implemented");
        }
    }

    class TwitchPlayer extends Player {
        constructor() {
            super();

            this.playbackRateIndicatorMenu = new TwitchMenuPlaybackRateIndicator();
            this.playbackRateIndicatorChatHeader = new TwitchChatHeaderPlaybackRateIndicator();

            const intervalHandle = setInterval(() => {
                if (window.FrankerFaceZ && this.playerElement.setFFZPlaybackRate) {
                    this.setPlaybackRate(this.currentPlaybackRateIndex);
                    clearInterval(intervalHandle);
                }
            }, 250);
        }

        get playerElement() {
            return document.querySelector("video");
        }

        setPlaybackRate(playbackRateIndex) {
            if (playbackRateIndex < 0 || playbackRateIndex >= PLAYBACK_RATES.length) {
                // out of bounds
                return;
            }

            this.currentPlaybackRateIndex = playbackRateIndex;
            const currentPlaybackRate = PLAYBACK_RATES[playbackRateIndex];

            this.playerElement.setFFZPlaybackRate(currentPlaybackRate);
            this.playbackRateIndicatorMenu.update(currentPlaybackRate);
            this.playbackRateIndicatorChatHeader.update(currentPlaybackRate);
        }

        play() {
            return this.playerElement.play();
        }
        pause() {
            return this.playerElement.pause();
        }
        isPaused() {
            return this.playerElement.paused;
        }

        toggleTheaterMode() {
            for (let button of document.querySelectorAll(".player-controls__right-control-group button")) {
                if (button.dataset["aTarget"] === "player-theatre-mode-button") {
                    button.click();
                    break;
                }
            }
        }
    }

    class YoutubePlayer extends Player {
        get playerElement() {
            return document.getElementById("movie_player");
        }

        increasePlaybackRate() {
            if (this.currentPlaybackRateIndex >= PLAYBACK_RATES.length - 1) {
                // cant increase further
                return;
            }

            this.setPlaybackRate(this.currentPlaybackRateIndex + 1);
        }

        decreasePlaybackRate() {
            if (this.currentPlaybackRateIndex <= 0) {
                // cant decrease further
                return;
            }

            this.setPlaybackRate(this.currentPlaybackRateIndex - 1);
        }

        setPlaybackRate(playbackRateIndex) {
            if (playbackRateIndex < 0 || playbackRateIndex >= PLAYBACK_RATES.length) {
                // out of bounds
                return;
            }

            this.currentPlaybackRateIndex = playbackRateIndex;
            const currentPlaybackRate = PLAYBACK_RATES[playbackRateIndex];

            this.playerElement.setPlaybackRate(currentPlaybackRate);
        }

        play() {
            return this.playerElement.playVideo();
        }
        pause() {
            return this.playerElement.pauseVideo();
        }
        isPaused() {
            return this.playerElement.getPlayerState() == 2;
        }

        toggleTheaterMode() {
            document.querySelector(".ytp-size-button").click();
        }
    }

    let player = null;

    const hostNameComponents = document.location.hostname.split(".");
    if (hostNameComponents[hostNameComponents.length - 2] == "twitch") {
        player = new TwitchPlayer();
    }
    else if (hostNameComponents[hostNameComponents.length - 2] == "youtube") {
        player = new YoutubePlayer();
    }

    window.addEventListener("message", function(event) {
        if (event.source != window || event.data?.source !== "ENHANCED_PLAYBACK_RATE") {
            return;
        }

        if (event.data.action && event.data.action == "INCREASE_PLAYBACK_RATE") {
            player.increasePlaybackRate();
        }
        else if (event.data.action && event.data.action == "DECREASE_PLAYBACK_RATE") {
            player.decreasePlaybackRate();
        }
        else if (event.data.action && event.data.action == "SET_PLAYBACK_RATE" && event.data.value) {
            player.decreasePlaybackRate();
            player.setPlaybackRate(event.data.value);
        }
        else if (event.data.action && event.data.action == "TOGGLE_PLAY_PAUSE") {
            if (player instanceof YoutubePlayer) {
                // The YouTube play pause implementation is solid so it does not get currently overwritten.
                return;
            }

            player.togglePlayPause();
        }
        else if (event.data.action && event.data.action == "TOGGLE_THEATER_MODE") {
            if (player instanceof YoutubePlayer) {
                // The YouTube theater mode implementation is solid so it does not get currently overwritten.
                return;
            }

            player.toggleTheaterMode();
        }
    }, false);
})();
