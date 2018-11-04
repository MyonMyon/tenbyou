/**
 * Creates new instance of controls handler.
 *
 * @constructor
 * @param {ViewPort} viewPort Viewport to handle the input.
 */
function Input(viewPort) {
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
        "ShiftLeft": "focus",
        "KeyZ": "attack",
        "KeyX": "bomb",
        "KeyA": "bonus",
        "KeyS": "time",
        "KeyD": "hitbox",
        "KeyQ": "slow",
        "KeyW": "bot",
        "KeyE": "substage",
        "KeyR": "stage",
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
    this.pressedBuffer = [];
    this.directions = ["Left", "Right", "Up", "Down"];
    //MODES:
    //keyState:     changes value (true on keyDown, false on keyUp)
    //invert:       inverts value on keyUp
    //execute:      executes function on keyDown, end function on keyUp
    //executeOnce:  same as above, but ignore keyDown repeat
    this.actionsAliases = {
        "move_left": {category: "movement", mode: "keyState", func: "player.moveLeft"},
        "move_right": {category: "movement", mode: "keyState", func: "player.moveRight"},
        "move_up": {category: "movement", mode: "keyState", func: "player.moveUp"},
        "move_down": {category: "movement", mode: "keyState", func: "player.moveDown"},
        "focus": {category: "interaction", mode: "keyState", func: "player.focused"},
        "attack": {category: "interaction", mode: "keyState", func: "player.shooting"},
        "bomb": {category: "interaction", mode: "executeOnce", func: "player.bomb()"},
        "screenshot": {category: "interaction", mode: "executeOnce", func: "vp.takeScreenShot()"},
        "bonus": {category: "dev", mode: "executeOnce", func: "randomBonus()"},
        "time": {category: "dev", mode: "executeOnce", func: "addTime()"},
        "hitbox": {category: "dev", mode: "invert", func: "drawHitboxes"},
        "bot": {category: "dev", mode: "invert", func: "player.guided"},
        "substage": {category: "dev", mode: "executeOnce", func: "nextSubstage()"},
        "stage": {category: "dev", mode: "execute", func: "nextStage()"},
        "slow": {category: "dev", mode: "execute", func: "slowMode()"},
        "pause": {category: "menu", mode: "invert", func: "pause", ignoreModality: true}
    };
    var eventTypes = ["keyDown", "keyUp", "mouseDown", "mouseUp", "mouseMove", "mouseWheel"];
    for (var i in eventTypes) {
        this.addEventListener(eventTypes[i]);
    }
    this.vp = viewPort;
    var self = this;
    document.addEventListener("DOMMouseScroll", function (event) {
        self.mouseWheel(event);
    }, false);
    document.addEventListener("contextmenu", function (event) {
        event.preventDefault();
    }, false);
    window.onblur = function () {
        if (self.world) {
            self.world.pause = true;
        }
    };
}

/**
 * Attaches a predefined event listener to document.
 *
 * @param {String} eventType Event type which is also a method name for this object. Example: "keyDown", "mouseUp", "mouseWheel".
 */
Input.prototype.addEventListener = function (eventType) {
    var self = this;
    document.addEventListener(eventType.toLowerCase(), function (event) {
        self[eventType](event);
    }, false);
};

/**
 * @param {String} action Action name.
 * @param {Boolean} single Return a string, not an array.
 * @return {String|Array} Key code (abbreviature) or array.
 */
Input.prototype.getKeyByAction = function (action, single) {
    var resultArray = [];
    for (var k in this.defaultMapping) {
        if (this.defaultMapping[k] === action) {
            if (single)
                return k;
            resultArray.push(k);
        }
    }
    return single ? "unmapped" : resultArray;
};

/**
 * @param {Number} keyCode Key code (numeric).
 * @return {String} Key code (abbreviature).
 */
Input.prototype.getKeyAbbr = function (keyCode) {
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
};

/**
 * @param {String} code Key code (abbreviature).
 * @return {String} Localized key name.
 */
Input.prototype.getKeyAlias = function (code) {
    return this.keyAliases[code];
};

/**
 * Performs an action in world, menu or whatever it is.
 *
 * @param {String} keyAbbr Key code (abbreviature).
 * @param {Boolean|Number} keyValue 0 is off, 1 is on, values between are for analog keypresses (like gamepads and all).
 * @param {String} displayedChar Used for text input.
 * @return {Boolean} Is action performed.
 */
Input.prototype.action = function (keyAbbr, keyValue, displayedChar) {
    if (!keyAbbr) {
        return false;
    }
    if (!this.vp.world || this.vp.world.pause) {
        var menu = this.vp.world ? this.vp.pauseMenu : this.vp.mainMenu;
        var action = this.defaultMappingMenu[keyAbbr];
        if (!action) {
            return false;
        }
        if (!keyValue) {
            menu.action("nav_null");
            return true;
        }
        menu.action(action);
        return true;
    }
    var action = this.actionsAliases[this.defaultMapping[keyAbbr]];
    var ignoreModality = action && action.ignoreModality;
    if (!this.vp.world.pause || ignoreModality) {
        if (action) {
            //if (action.category === "dev" && !Settings.get("dev.controls")) {
            //    return false;
            //}
            if (this.defaultMapping[keyAbbr] === "pause") {
                this.stopAll();
            }
            switch (action.mode) {
                case "keyState":
                    eval("this.vp.world." + action.func + "=" + !!keyValue);
                    break;
                case "keyValue":
                    eval("this.vp.world." + action.func + "=" + +keyValue);
                    break;
                case "executeOnce":
                    if (keyValue && !action.lock) {
                        eval("this.vp.world." + action.func);
                        action.lock = true;
                    } else if (action.funcEnd) {
                        eval("this.vp.world." + action.funcEnd);
                    }
                    if (!keyValue) {
                        action.lock = false;
                    }
                    break;
                case "execute":
                    if (keyValue)
                        eval("this.vp.world." + action.func);
                    else if (action.funcEnd) {
                        eval("this.vp.world." + action.funcEnd);
                    }
                    break;
                case "invert":
                    if (this.gamepadMode ? !!keyValue : !keyValue)
                        eval("this.vp.world." + action.func + "=!this.vp.world." + action.func);
                    break;
                default:
                    console.log("Undefined Action Mode");
                    return false;
            }
            return true;
        }
    }
    return false;
};

/**
 * Resets every key state to false.
 */
Input.prototype.stopAll = function () {
    if (this.vp.world) {
        for (var i in this.actionsAliases) {
            var alias = this.actionsAliases[i];
            if (alias.mode === "keyState" && eval(this.vp.world[alias.func.split(".")[0]])) {
                eval("this.vp.world." + alias.func + "=" + false);
            }
        }
    }
};

/**
 * Event listener (combined for keyboard events).
 *
 * @param {Event} event The event object to process.
 * @param {Boolean} keyDown Is key pressed (or unpressed).
 */
Input.prototype.keyEvent = function (event, keyDown) {
    var keyCodes = [event.code];

    // Fallback key code
    var keyG = this.getKeyAbbr(event.keyCode);
    if (keyG !== keyCodes[0]) {
        keyCodes[1] = keyG;
    }

    for (var i in keyCodes) {
        if (this.action(keyCodes[i], keyDown, event.key)) {
            event.preventDefault();
            return;
        }
    }
};

/**
 * Event listener.
 *
 * @param {Event} event The event object to process.
 */
Input.prototype.keyDown = function (event) {
    this.keyEvent(event, true);
};

/**
 * Event listener.
 *
 * @param {Event} event The event object to process.
 */
Input.prototype.keyUp = function (event) {
    this.keyEvent(event, false);
};

/**
 * Event listener.
 *
 * @param {Event} event The event object to process.
 */
Input.prototype.mouseDown = function (event) {
    if (this.action("Mouse" + event.button, true))
        event.preventDefault();
};

/**
 * Event listener.
 *
 * @param {Event} event The event object to process.
 */
Input.prototype.mouseUp = function (event) {
    if (this.action("Mouse" + event.button, false))
        event.preventDefault();
};

/**
 * Event listener.
 *
 * @param {Event} event The event object to process.
 */
Input.prototype.mouseMove = function (event) {
};

/**
 * Event listener.
 *
 * @param {Event} event The event object to process.
 */
Input.prototype.mouseWheel = function (event) {
    var direction = "undef";
    if (event.wheelDelta !== undefined)
        direction = event.wheelDelta > 0 ? "up" : "down";
    else
        direction = event.detail < 0 ? "up" : "down";
    if (this.action("Wheel" + direction.toTitleCase(), true))
        event.preventDefault();
};
