(function(){
    class TwitchMenuPlaybackRateIndicator {
        update(currentRate) {
            const pillTextElement = document.querySelector(".gAMVPE");

            if (pillTextElement) {
                pillTextElement.innerText = String(currentRate) + "X";
            }
        }
    }

    class TwitchChatHeaderPlaybackRateIndicator {
        update(currentRate) {
            if (this.chatHeaderPlaybackRateElement) {
                this.chatHeaderPlaybackRateElement.innerText = String(currentRate) + "x";
            }
            else {
                const chatHeaderElement = document.querySelector(".video-chat__header");

                if (chatHeaderElement) {
                    const chatHeaderTextElement = chatHeaderElement.querySelector("span");

                    this.chatHeaderPlaybackRateElement = chatHeaderTextElement.cloneNode(true);
                    this.chatHeaderPlaybackRateElement.style.cssText = "position: absolute; right: 1rem;";
                    this.chatHeaderPlaybackRateElement.innerText = "1x";

                    chatHeaderElement.appendChild(this.chatHeaderPlaybackRateElement);
                }
            }
        }
    }

    class Player {
        constructor() {
            this.PLAYBACK_RATES = [
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
            this.playbackRate = 1;
        }

        get playbackRate() {
            return this.PLAYBACK_RATES[this.currentPlaybackRateIndex];
        }
        set playbackRate(playbackRate) {
            const closestRate = this.PLAYBACK_RATES.reduce((previous, current) => {
                if (Math.abs(current - playbackRate) < Math.abs(previous - playbackRate)) {
                    return current;
                }
                else {
                    return previous;
                }
            });

            this.currentPlaybackRateIndex = this.PLAYBACK_RATES.indexOf(closestRate);
        }

        increasePlaybackRate() {
            if (this.currentPlaybackRateIndex >= this.PLAYBACK_RATES.length - 1) {
                // cant increase further
                return;
            }

            this.currentPlaybackRateIndex += 1;
            this.applyPlaybackRate();
        }
        decreasePlaybackRate() {
            if (this.currentPlaybackRateIndex <= 0) {
                // cant decrease further
                return;
            }

            this.currentPlaybackRateIndex -= 1;
            this.applyPlaybackRate();
        }
        setPlaybackRate(playbackRate) {
            this.playbackRate = playbackRate;
            this.applyPlaybackRate();
        }
        applyPlaybackRate() {
            throw new Exception("not implemented");
        }
    }

    class TwitchPlayer extends Player {
        constructor() {
            super();

            this.playbackRateIndicatorMenu = new TwitchMenuPlaybackRateIndicator();
            this.playbackRateIndicatorChatHeader = new TwitchChatHeaderPlaybackRateIndicator();

            this.setPlaybackRate(this.playbackRate);

            window.addEventListener("message", event => {
                if (event.source != window || event.data?.source !== "ENHANCED_PLAYBACK_RATE") {
                    return;
                }

                if (event.data.action && event.data.action == "INCREASE_PLAYBACK_RATE") {
                    this.increasePlaybackRate();
                }
                else if (event.data.action && event.data.action == "DECREASE_PLAYBACK_RATE") {
                    this.decreasePlaybackRate();
                }
                else if (event.data.action && event.data.action == "SET_PLAYBACK_RATE" && event.data.value) {
                    this.setPlaybackRate(event.data.value);
                }
                else if (event.data.action && event.data.action == "TOGGLE_PLAY_PAUSE") {
                    this.togglePlayPause();
                }
                else if (event.data.action && event.data.action == "TOGGLE_THEATER_MODE") {
                    this.toggleTheaterMode();
                }
                else if (event.data.action && event.data.action == "FOCUS_CHAT") {
                    this.focusChat();
                }
            }, false);
        }

        get playerElement() {
            return document.querySelector("video");
        }

        setPlaybackRate(playbackRate) {
            if (window.FrankerFaceZ && this.playerElement.setFFZPlaybackRate) {
                super.setPlaybackRate(playbackRate);
            }
            else {
                // FrankerFaceZ not yet initialized
                const intervalHandle = setInterval(() => {
                    if (this.playerElement.setFFZPlaybackRate) {
                        super.setPlaybackRate(playbackRate);
                        clearInterval(intervalHandle);
                    }
                }, 250);
            }
        }
        applyPlaybackRate() {
            this.playerElement.setFFZPlaybackRate(this.playbackRate);
            this.playbackRateIndicatorMenu.update(this.playbackRate);
            this.playbackRateIndicatorChatHeader.update(this.playbackRate);
        }

        play() {
            return this.playerElement.play();
        }
        pause() {
            return this.playerElement.pause();
        }
        get paused() {
            return this.playerElement.paused;
        }
        togglePlayPause() {
            if (this.paused) {
                this.play();
            }
            else {
                this.pause();
            }
        }

        toggleTheaterMode() {
            for (let button of document.querySelectorAll(".player-controls__right-control-group button")) {
                if (button.dataset["aTarget"] === "player-theatre-mode-button") {
                    button.click();
                    break;
                }
            }
        }

        focusChat() {
            const chatInputElement = document.querySelector(".chat-input__textarea textarea");

            if (chatInputElement) {
                chatInputElement.focus();
            }
        }
    }

    class YoutubePlayer extends Player {
        constructor() {
            super();

            this.setPlaybackRate(this.playbackRate);

            window.addEventListener("message", event => {
                if (event.source != window || event.data?.source !== "ENHANCED_PLAYBACK_RATE") {
                    return;
                }

                if (event.data.action && event.data.action == "INCREASE_PLAYBACK_RATE") {
                    this.increasePlaybackRate();
                }
                else if (event.data.action && event.data.action == "DECREASE_PLAYBACK_RATE") {
                    this.decreasePlaybackRate();
                }
            }, false);
        }

        get playerElement() {
            return document.getElementById("movie_player");
        }

        applyPlaybackRate() {
            this.playerElement.setPlaybackRate(this.playbackRate);
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
})();
