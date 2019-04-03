
class Input {
    /**
     * Creates new instance of controls handler.
     *
     * @constructor
     * @param {ViewPort} vp Viewport to handle the input.
     */
    constructor(vp) {
        this.keyAliases = {};
        this.keyCodes = {
            8: "Backspace",
            9: "Tab",
            12: "Clear",
            13: "Enter",
            16: "ShiftLeft",
            17: "ControlLeft",
            18: "AltLeft",
            19: "Pause",
            20: "CapsLock",
            27: "Escape",
            32: "Space",
            33: "PageUp",
            34: "PageDown",
            35: "End",
            36: "Home",
            37: "ArrowLeft",
            38: "ArrowUp",
            39: "ArrowRight",
            40: "ArrowDown",
            42: "PrintScreen",
            45: "Insert",
            46: "Delete",
            59: "Semicolon",
            61: "Equal",
            91: "OSLeft",
            92: "OSRight",
            93: "ContextMenu",
            106: "NumpadMultiply",
            107: "NumpadAdd",
            109: "NumpadSubtract",
            110: "NumpadDecimal",
            111: "NumpadDivide",
            144: "NumLock",
            145: "ScrollLock",
            173: "Minus",
            186: "Semicolon",
            187: "Equal",
            188: "Comma",
            189: "Minus",
            190: "Period",
            191: "Slash",
            192: "Backquote",
            219: "BracketLeft",
            220: "Backslash",
            221: "BracketRight",
            222: "Quote"
        };
        this.defaultMapping = {
            "ArrowLeft": "move_left",
            "ArrowRight": "move_right",
            "ArrowUp": "move_up",
            "ArrowDown": "move_down",
            "Numpad4": "move_left",
            "Numpad6": "move_right",
            "Numpad8": "move_up",
            "Numpad2": "move_down",
            "ShiftLeft": "focus",
            "KeyZ": "attack",
            "KeyX": "bomb",
            "KeyC": "special",
            "KeyA": "bonus",
            "KeyD": "hitbox",
            "KeyF": "god",
            "KeyQ": "slow",
            "KeyW": "bot",
            "KeyE": "substage",
            "KeyR": "stage",
            "KeyT": "time",
            "KeyY": "time_boss",
            "PageUp": "zoom_out",
            "PageDown": "zoom_in",
            "Tab": "perf",
            "KeyO": "perf_snap",
            "KeyP": "screenshot",
            "Escape": "pause"
        };
        this.defaultMappingMenu = {
            "ArrowLeft": "nav_left",
            "ArrowRight": "nav_right",
            "ArrowUp": "nav_up",
            "ArrowDown": "nav_down",
            "KeyZ": "nav_enter",
            "Enter": "nav_enter",
            "KeyX": "nav_back",
            "Escape": "nav_back"
        };
        this.defaultMappingDialogue = {
            "KeyZ": "next"
        };
        this.repeatableMenuActions = new Set(["nav_left", "nav_right", "nav_up", "nav_down"]);
        this.lockBuffer = {};
        this.directions = ["Left", "Right", "Up", "Down"];
        //MODES:
        //keyState:     changes value (true on keyDown, false on keyUp)
        //invert:       inverts value on keyUp
        //execute:      executes function on keyDown, end function on keyUp (ignores keyDown repeat)
        //vp:           if true, func is called from the viewport itself, not the word, also available while in menus
        this.actionsAliases = {
            "move_left": { category: "movement", mode: "keyState", func: "player.moveLeft" },
            "move_right": { category: "movement", mode: "keyState", func: "player.moveRight" },
            "move_up": { category: "movement", mode: "keyState", func: "player.moveUp" },
            "move_down": { category: "movement", mode: "keyState", func: "player.moveDown" },
            "focus": { category: "interaction", mode: "keyState", func: "player.focused" },
            "attack": { category: "interaction", mode: "keyState", func: "player.shooting" },
            "bomb": { category: "interaction", mode: "execute", func: "player.bomb()" },
            "special": { category: "interaction", mode: "execute", func: "player.special()" },
            "screenshot": { category: "misc", mode: "execute", func: "takeScreenShot()", vp: true },
            "bonus": { category: "dev", mode: "execute", func: "randomBonus()" },
            "time": { category: "dev", mode: "execute", func: "addTime(false)" },
            "time_boss": { category: "dev", mode: "execute", func: "addTime(true)" },
            "hitbox": { category: "dev", mode: "invert", func: "drawHitboxes" },
            "bot": { category: "dev", mode: "invert", func: "player.guided" },
            "god": { category: "dev", mode: "execute", func: "player.setGodMode()" },
            "substage": { category: "dev", mode: "execute", func: "nextSubstage()" },
            "stage": { category: "dev", mode: "execute", func: "nextStage()" },
            "slow": { category: "dev", mode: "execute", func: "slowMode()" },
            "perf": { category: "perf", mode: "execute", func: "pChart.nextMode()", vp: true },
            "perf_snap": { category: "perf", mode: "execute", func: "pChart.snap()", vp: true },
            "zoom_out": { category: "menu", mode: "execute", func: "changeZoom(-1)", vp: true },
            "zoom_in": { category: "menu", mode: "execute", func: "changeZoom(1)", vp: true },
            "pause": { category: "menu", mode: "execute", func: "setPause(true)" }
        };
        const eventTypes = ["keyDown", "keyUp", "mouseDown", "mouseUp", "mouseMove", "mouseWheel"];
        for (let eventType of eventTypes) {
            this.addEventListener(eventType);
        }
        this.vp = vp;
        let self = this;
        document.addEventListener("DOMMouseScroll", function (event) {
            self.mouseWheel(event);
        }, false);
        document.addEventListener("contextmenu", function (event) {
            event.preventDefault();
        }, false);
        window.onresize = function() {
            vp.onResize();
        };
        window.onblur = function() {
            if (self.world) {
                self.world.setPause(true);
            }
        };
    }

    /**
     * Attaches a predefined event listener to document.
     *
     * @param {String} eventType Event type which is also a method name for this object. Example: "keyDown", "mouseUp", "mouseWheel".
     */
    addEventListener(eventType) {
        let self = this;
        document.addEventListener(eventType.toLowerCase(), function (event) {
            self[eventType](event);
        }, false);
    }

    /**
     * @param {String} action Action name.
     * @param {Boolean} single Return a string, not an array.
     * @return {String|Array} Key code (abbreviature) or array.
     */
    getKeyByAction(action, single) {
        let resultArray = [];
        for (let k in this.defaultMapping) {
            if (this.defaultMapping[k] === action) {
                if (single)
                    return k;
                resultArray.push(k);
            }
        }
        return single ? "unmapped" : resultArray;
    }

    /**
     * @param {Number} keyCode Key code (numeric).
     * @return {String} Key code (abbreviature).
     */
    getKeyAbbr(keyCode) {
        if (keyCode >= 48 && keyCode <= 57)
            return "Digit" + (keyCode - 48).toString();
        else if (keyCode >= 65 && keyCode <= 90)
            return "Key" + String.fromCharCode(keyCode);
        else if (keyCode >= 96 && keyCode <= 105)
            return "Numpad" + (keyCode - 96);
        else if (keyCode >= 112 && keyCode <= 135)
            return "F" + (keyCode - 111);
        else
            return this.keyCodes[keyCode];
    }

    /**
     * @param {String} code Key code (abbreviature).
     * @return {String} Localized key name.
     */
    getKeyAlias(code) {
        return this.keyAliases[code];
    }

    /**
     * Performs an action in world, menu or whatever it is.
     *
     * @param {String} keyAbbr Key code (abbreviature).
     * @param {Boolean|Number} keyValue 0 is off, 1 is on, values between are for analog keypresses (like gamepads and all).
     * @param {String} displayedChar Used for text input.
     * @return {Boolean} Is action performed.
     */
    action(keyAbbr, keyValue, displayedChar) {
        if (this.vp.rolls) {
            //Don't do anything while rolling
            return;
        }
        if (!this.vp.splashComplete) {
            if (this.vp.loaded) {
                this.vp.initMenu();
                this.vp.mainMenu.lockInput = true;
                this.vp.splashComplete = true;
            }
            return;
        }
        if (!keyAbbr) {
            return false;
        }

        let inMenu = !this.vp.world || this.vp.world.pause;

        if (keyValue) {
            if (this.lockBuffer[keyAbbr]) {
                return true;
            } else if (!inMenu || !this.repeatableMenuActions.has(this.defaultMappingMenu[keyAbbr])) {
                this.lockBuffer[keyAbbr] = true;
            }
        } else if (this.lockBuffer[keyAbbr]) {
            this.lockBuffer[keyAbbr] = false;
        }

        if (inMenu) {
            let menu = this.vp.world ? this.vp.pauseMenu : this.vp.mainMenu;
            if (keyValue && menu.shortcut(keyAbbr)) {
                return true;
            }
            let action = this.defaultMappingMenu[keyAbbr];
            if (action && keyValue) {
                menu.action(action);
                return true;
            }
            if (!keyValue) {
                menu.lockInput = false;
            }
        }

        if (this.vp.world && this.vp.world.dialogue) {
            let action = this.defaultMappingDialogue[keyAbbr];
            if (action && keyValue) {
                this.vp.world.dialogue[action]();
                return true;
            }
        }

        let action = this.actionsAliases[this.defaultMapping[keyAbbr]];
        let ignoreModality = action && action.vp;
        if (this.vp.world && !this.vp.world.pause || ignoreModality) {
            if (action) {
                let objString = "this.vp.";
                if (!ignoreModality) {
                    objString += "world.";
                }
                if (action.category === "dev" && !this.vp.inDev) {
                    return false;
                }
                switch (action.mode) {
                    case "keyState":
                        eval(objString + action.func + "=" + !!keyValue);
                        break;
                    case "keyValue":
                        eval(objString + action.func + "=" + +keyValue);
                        break;
                    case "execute":
                        if (keyValue) {
                            eval(objString + action.func);
                        } else if (action.funcEnd) {
                            eval(objString + action.funcEnd);
                        }
                        break;
                    case "invert":
                        if (this.gamepadMode ? !!keyValue : !keyValue)
                            eval(objString + action.func + "=!" + objString + action.func);
                        break;
                    default:
                        console.log("Undefined Action Mode");
                        return false;
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Resets every key state to false.
     */
    stopAll() {
        if (this.vp.world) {
            for (let i in this.actionsAliases) {
                let alias = this.actionsAliases[i];
                if (alias.mode === "keyState" && eval(this.vp.world[alias.func.split(".")[0]])) {
                    eval("this.vp.world." + alias.func + "=" + false);
                }
            }
        }
    }

    /**
     * Event listener (combined for keyboard events).
     *
     * @param {Event} event The event object to process.
     * @param {Boolean} keyDown Is key pressed (or unpressed).
     */
    keyEvent(event, keyDown) {
        let keyCodes = [event.code];

        // Fallback key code
        let keyG = this.getKeyAbbr(event.keyCode);
        if (keyG !== keyCodes[0]) {
            keyCodes[1] = keyG;
        }

        for (let keyCode of keyCodes) {
            if (this.action(keyCode, keyDown, event.key)) {
                event.preventDefault();
                return;
            }
        }
    }

    /**
     * Event listener.
     *
     * @param {Event} event The event object to process.
     */
    keyDown(event) {
        this.keyEvent(event, true);
    }

    /**
     * Event listener.
     *
     * @param {Event} event The event object to process.
     */
    keyUp(event) {
        this.keyEvent(event, false);
    }

    /**
     * Event listener.
     *
     * @param {Event} event The event object to process.
     */
    mouseDown(event) {
        if (this.action("Mouse" + event.button, true))
            event.preventDefault();
    }

    /**
     * Event listener.
     *
     * @param {Event} event The event object to process.
     */
    mouseUp(event) {
        if (this.action("Mouse" + event.button, false))
            event.preventDefault();
    }

    /**
     * Event listener.
     *
     * @param {Event} event The event object to process.
     */
    mouseMove(event) {
    }

    /**
     * Event listener.
     *
     * @param {Event} event The event object to process.
     */
    mouseWheel(event) {
        let direction = "undef";
        if (event.wheelDelta !== undefined)
            direction = event.wheelDelta > 0 ? "up" : "down";
        else
            direction = event.detail < 0 ? "up" : "down";
        if (this.action("Wheel" + direction.toTitleCase(), true))
            event.preventDefault();
    }
}
