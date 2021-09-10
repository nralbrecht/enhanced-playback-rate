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
        20,
        50,
        100
    ];

    class TwitchPlaybackRateIndicator {
        constructor() {
            this.install();
        }

        hide() {
            this.pillContainerElement.style.cssText = "display: none !important";
        }
        show() {
            this.pillContainerElement.style.cssText = "";
        }
        hideTwitchIndicator() {
            for (let containerElement of document.querySelectorAll(".imZUzy")) {
                if (containerElement !== this.pillContainerElement) {
                    containerElement.style.cssText = "display: none !important";
                }
            }
        }

        install() {
            this.pillTextElement = document.createElement("span");
            this.pillTextElement.className = "CoreText-sc-cpl358-0 ScPill-sc-1cbrhuy-0 gAMVPE tw-pill";
            this.pillTextElement.innerText = "1x";

            this.pillContainerElement = document.createElement("div");
            this.pillContainerElement.className = "ScTransitionBase-sc-eg1bd7-0 imZUzy tw-transition";
            this.pillContainerElement.append(this.pillTextElement);

            const controlGroupRight = document.querySelector(".player-controls__right-control-group");
            controlGroupRight.prepend(this.pillContainerElement);

            this.hide();
        }
        update(currentRate) {
            this.pillTextElement.innerText = String(currentRate) + "x*";

            if (currentRate == 1) {
                this.hide();
            }
            else {
                this.show();
            }

            this.hideTwitchIndicator();
            setTimeout(() => {
                this.hideTwitchIndicator();
            }, 250);
            setTimeout(() => {
                this.hideTwitchIndicator();
            }, 500);
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
    }

    class TwitchPlayer extends Player {
        constructor() {
            super();

            this.playbackRateIndicator = new TwitchPlaybackRateIndicator();

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
            this.playbackRateIndicator.update(currentPlaybackRate);
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
        if (event.source != window || !event.data.source && event.data.source != "ENHANCED_PLAYBACK_RATE") {
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
        else if (event.data.action && event.data.action == "PLAY_PAUSE") {
            if (player instanceof YoutubePlayer) {
                // The YouTube play pause implementation is solid so it does not get currently overwritten.
                return;
            }

            player.togglePlayPause();
        }
    }, false);
})();
