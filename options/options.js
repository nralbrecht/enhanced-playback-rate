const HotkeyList = {
    data() {
        return {
            hotkeys: [],
            actions: {
                INCREASE_PLAYBACK_RATE: {
                    label: "Increase Playback Rate"
                },
                DECREASE_PLAYBACK_RATE: {
                    label: "Decrease Playback Rate"
                },
                SET_PLAYBACK_RATE: {
                    label: "Set Playback Rate To Value",
                    arguments: {
                        newPlaybackRate: {
                            label: "New Playback Rate",
                            placeholder: "eg. 1",
                            defaultValue: "",
                            type: "number"
                        }
                    }
                },
                TOGGLE_PLAY_PAUSE: {
                    label: "Toggle Play Pause"
                },
                TOGGLE_THEATER_MODE: {
                    label: "Toggle Theater Mode"
                },
                FOCUS_CHAT: {
                    label: "Focus Live Stream Chat"
                }
            },
            websites: {
                TWITCH: {
                    label: "Twitch"
                },
                YOUTUBE: {
                    label: "YouTube"
                }
            }
        }
    },
    mounted() {
        chrome.storage.local.get("hotkeys", result => {
            if (result?.hotkeys) {
                this.hotkeys = result.hotkeys;
            }
            else {
                this.resetHotkeys();
            }
        });
    },
    watch: {
        hotkeys: {
            handler(hotkeys) {
                const serializedHotkeys = JSON.parse(JSON.stringify(hotkeys));
                chrome.storage.local.set({
                    "hotkeys": serializedHotkeys
                });
            },
            deep: true
        }
    },
    methods: {
        updateHotkey(index, newHotkey) {
            this.hotkeys[index].hotkey = newHotkey;
        },
        updateAction(index, newAction) {
            this.hotkeys[index].action = newAction;

            if (this.actions[newAction]?.arguments) {
                for (let key in this.actions[newAction].arguments) {
                    const argument = this.actions[newAction].arguments[key];

                    this.hotkeys[index].arguments = {
                        [key]: argument.defaultValue
                    };
                }
            }
            else if (this.hotkeys[index].arguments) {
                delete this.hotkeys[index].arguments;
            }
        },
        updateArgument(index, argumentKey, newValue) {
            this.hotkeys[index].arguments[argumentKey] = newValue;
        },
        updateWebsites(index, website, checked) {
            const websites = this.hotkeys[index].websites;
            const websiteIndex = websites.indexOf(website);

            if (websiteIndex == -1 && checked) {
                websites.push(website);
            }
            else if (websiteIndex != -1 && !checked) {
                websites.splice(websiteIndex, 1);
            }
        },
        removeHotkey(index) {
            this.hotkeys.splice(index, 1);
        },
        resetHotkeys() {
            console.log("loading default hotkeys");
            fetch(chrome.runtime.getURL("default-hotkeys.json"))
                .then(response => response.json())
                .then(hotkeys => {
                    this.hotkeys = hotkeys;
                });
        },
        addNewHotkey() {
            this.hotkeys.push({
                "hotkey": null,
                "action": "",
                "websites": []
            });
        }
    }
}

const KEY_IGNORE_LIST = [
    "OSLeft",
    "OSRight",
    "ControlRight",
    "ControlLeft",
    "ShiftLeft",
    "ShiftRight",
    "AltRight",
    "AltLeft"
];

const HotkeyComponent = {
    props: ["hotkey", "actions", "websites"],
    emits: ["update:hotkey", "update:action", "update:argument", "update:websites", "remove"],
    template: `
        <div class="preference">
            <button class="remove-button"
                    title="Remove this hotkey"
                    @click="$emit('remove')">
                <span>X</span>
            </button>
            <div class="input-wrapper preference-left">
                <label>Hotkey</label>
                <input type="text"
                        placeholder="None"
                        :value="hotkeyToString(hotkey.hotkey)"
                        @keydown="hotkeyOnInput">
            </div>
            <div class="preference-right">
                <div class="input-wrapper">
                    <label>Websites</label>
                    <div class="websites">
                        <div class="input-wrapper row" v-for="(website, key) in websites">
                            <input type="checkbox"
                                :value="key"
                                :checked="hotkey?.websites?.indexOf(key) != -1"
                                @change="websitesOnChange">
                            <label>{{ website.label }}</label>
                        </div>
                    </div>
                </div>
                <div class="input-wrapper">
                    <label>Action</label>
                    <select :value="hotkey.action" @change="actionOnChange">
                        <option v-for="(action, key) in actions" :value="key">
                            {{ action.label }}
                        </option>
                        <option value="">--Choose an action--</option>
                    </select>
                </div>
                <div class="preference-arguments" v-for="(argument, key) in hotkey?.arguments">
                    <div class="input-wrapper" :data-key="key" :data-value="argument">
                        <label>{{ actions[hotkey.action].arguments[key].label }}</label>
                        <input :value="argument"
                            step="any"
                            :type="actions[hotkey.action].arguments[key].type"
                            :pattern="actions[hotkey.action].arguments[key].pattern"
                            :placeholder="actions[hotkey.action].arguments[key].placeholder"
                            @input="argumentOnInput(key, $event.target)">
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        hotkeyToString(hotkey) {
            if (!hotkey?.code) {
                return "";
            }

            let result = "";

            if (hotkey.ctrlKey) result += "Ctrl+";
            if (hotkey.shiftKey) result += "Shift+";
            if (hotkey.altKey) result += "Alt+";
            if (hotkey.meta) result += "Meta+";

            if (!hotkey.key || hotkey.code === "Space") {
                result += hotkey.code;
            }
            else if (hotkey.key.startsWith("Arrow")) {
                result += hotkey.key.substr(5);
            }
            else {
                if (hotkey.code.startsWith("Numpad")) result += "Numpad ";
                result += hotkey.key[0].toUpperCase() + hotkey.key.substr(1);
            }

            return result;
        },
        hotkeyOnInput(event) {
            if (KEY_IGNORE_LIST.indexOf(event.code) !== -1) {
                return;
            }

            event.preventDefault();

            let hotkey = {
                "shiftKey": event.shiftKey,
                "ctrlKey": event.ctrlKey,
                "metaKey": event.metaKey,
                "altKey": event.altKey,
                "code": event.code,
                "key": event.key
            };

            this.$emit("update:hotkey", hotkey);
            event.target.blur();
        },
        argumentOnInput(key, target) {
            if (target.validity.valid) {
                this.$emit("update:argument", {
                    "key": key,
                    "newValue": target.value
                });
            }
        },
        actionOnChange(event) {
            this.$emit("update:action", event.target.value);
        },
        websitesOnChange(event) {
            this.$emit("update:websites", {
                "website": event.target.value,
                "checked": event.target.checked
            });
        }
    },
}

let app = Vue.createApp(HotkeyList)
    .component("hotkey-input", HotkeyComponent)
    .mount("body");
