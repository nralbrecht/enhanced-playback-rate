const HotkeyList = {
    data() {
        return {
            hotkeys: [],
            actions: {
                INCREASE_PLAYBACK_RATE: {
                    description: "Increase Playback Rate"
                },
                DECREASE_PLAYBACK_RATE: {
                    description: "Decrease Playback Rate"
                },
                SET_PLAYBACK_RATE: {
                    description: "Set Playback Rate To Value",
                    arguments: {
                        newPlaybackRate: {
                            description: "New Playback Rate",
                            placeholder: "eg. 1",
                            defaultValue: "",
                            type: "number"
                        }
                    }
                },
                TOGGLE_PLAY_PAUSE: {
                    description: "Toggle Play Pause"
                },
                TOGGLE_THEATER_MODE: {
                    description: "Toggle Theater Mode"
                },
                FOCUS_CHAT: {
                    description: "Focus Twitch Chat"
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
                console.log("updated hotkeys", serializedHotkeys);
            },
            deep: true
        }
    },
    methods: {
        updateHotkey(index, newHotkey) {
            this.hotkeys[index].hotkey = newHotkey;
        },
        updateAction(index, newAction) {
            console.log("update action", index, newAction);

            this.hotkeys[index].action = newAction;

            if (this.actions[newAction]?.arguments) {
                for (let key in this.actions[newAction].arguments) {
                    const argument = this.actions[newAction].arguments[key];

                    console.log(argument);
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
            console.log("updateArgument", index, argumentKey, newValue);
            this.hotkeys[index].arguments[argumentKey] = newValue;
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
                "action": ""
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
    props: ["hotkey", "actions"],
    emits: ["update:hotkey", "update:action", "update:argument", "remove"],
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
                    <label>Action</label>
                    <select :value="hotkey.action" @change="actionOnChange">
                        <option v-for="(action, key) in actions" :value="key">
                            {{ action.description }}
                        </option>
                        <option value="">--Choose an action--</option>
                    </select>
                </div>
                <div class="preference-arguments" v-for="(argument, key) in hotkey?.arguments">
                    <div class="input-wrapper" :data-key="key" :data-value="argument">
                        <label>{{ actions[hotkey.action].arguments[key].description }}</label>
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
        }
    },
}

let app = Vue.createApp(HotkeyList)
    .component("hotkey-input", HotkeyComponent)
    .mount("body");

