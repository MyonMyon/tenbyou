/**
 * Creates new instance of menu.
 *
 * @constructor
 * @param {ViewPort} vp Viewport to display the menu.
 */
function Menu(vp) {
    this.vp = vp;

    this.lastAction = new Date().getTime();
    this.fadeIn = null;
    this.fadeOut = null;
    this.actionDelay = 100;
    this.animationLength = 250;
    this.fadeLength = 150;
    this.rowOffset = 0;

    this.states = {};

    this.resetLocation();
}

/**
 * @return {Number} Fade value from 0 to 1.
 */
Menu.prototype.getFade = function () {
    var t = new Date().getTime();
    if (!this.fadeIn || this.fadeOut && (this.fadeOut + this.fadeLength) < t && (this.fadeOut + this.fadeLength) > this.fadeIn) {
        return 0;
    }
    return Math.min(1, (t - this.fadeIn || t) / this.fadeLength, Math.abs(1 - (t - this.fadeOut || t) / this.fadeLength));
};

/**
 * Recursively updates states of controls in Settings menu.
 *
 * @param {Array} tree Array of menu items. Main tree by default.
 */
Menu.prototype.loadSettingsStates = function (tree) {
    if (!tree) {
        tree = this.tree;
    }
    for (var i in tree) {
        if (tree[i].statePath) {
            var settingValue = Settings.get(tree[i].statePath);
            if (tree[i].control === "radio") {
                tree[i].state = settingValue === tree[i].stateVar;
            } else {
                tree[i].state = settingValue;
            }
            if (tree[i].vpField) {
                eval("this.vp." + tree[i].vpField + " = settingValue;");
            }
        }
        if (tree[i].submenu) {
            var submenu = tree[i].submenu;
            if (typeof submenu === "string") {
                submenu = MENU[submenu];
            }
            this.loadSettingsStates(submenu.tree);
        }
    }
};

/**
 * @param {Number} parent Level offset, 1 for parent menu.
 * @return {Object} Current menu item object.
 */
Menu.prototype.getCurrentMenu = function (parent) {
    var menu = this.currentMenu || {tree: this.tree}; //AKA Pause Menu and Main Menu

    menu.tree = menu.tree.filter(function (item) {
        return item.visible;
    });
    return menu;
};

/**
 * @param {Array} menu Object to recursively process.
 */
Menu.prototype.updateStates = function (menu) {
    if (!menu) {
        menu = this.tree;
    }
    for (var i in menu) {
        menu[i].visible = (!menu[i].isVisible || menu[i].isVisible.apply(this));
        if (menu[i].submenu) {
            var submenu = menu[i].submenu;
            if (typeof submenu === "string") {
                submenu = MENU[submenu];
            }
            this.updateStates(submenu.tree);
        }
    }
};

/**
 * @return {String} Current menu title.
 */
Menu.prototype.getCurrentTitle = function () {
    var menu = this.getCurrentMenu();
    return menu.title || (menu.parent ? menu.parent.tree[menu.indexInParent].title : GAME_TITLE);
};

/**
 * Navigates to main menu.
 */
Menu.prototype.resetLocation = function () {
    this.currentMenu = null;
    this.rowOffset = this.currentIndex = 0;
};

/**
 * Menu interface interaction function.
 *
 * @param {String} code Action code.
 */
Menu.prototype.action = function (code) {
    if (this.lockInput) {
        return;
    }
    if (new Date().getTime() < this.lastAction + this.actionDelay) {
        return;
    }
    var m = this.getCurrentMenu();
    switch (code) {
        case "nav_down":
            this.changeIndex(1);
            break;
        case "nav_up":
            this.changeIndex(-1);
            break;
        case "nav_right":
            if (m.tree[this.currentIndex].control === "slider") {
                this.changeValue(1);
            } else {
                this.changeIndex(m.compact ? MENU_CAPACITY_COMPACT : MENU_CAPACITY);
            }
            break;
        case "nav_left":
            if (m.tree[this.currentIndex].control === "slider") {
                this.changeValue(-1);
            } else {
                this.changeIndex(m.compact ? -MENU_CAPACITY_COMPACT : -MENU_CAPACITY);
            }
            break;
        case "nav_back":
            if (m.parent) {
                this.currentMenu = m.parent;
                this.rowOffset = 0;
                this.currentIndex = m.indexInParent;
                Sound.play(SFX.menuOut);
            }
            break;
        case "nav_enter":
            this.selectItem(m.tree[this.currentIndex], true);
            break;
    }
    this.lastAction = new Date().getTime();
};

/**
 * Selects menu item.
 *
 * @param {Object} menuItem Menu item object.
 * @param {Boolean} manual Is this user-initiated call (play sound).
 * @return {Menu} This menu object.
 */
Menu.prototype.selectItem = function (menuItem, manual) {
    if (menuItem) {
        if (menuItem.isEnabled && !menuItem.isEnabled()) {
            return;
        }
        if (menuItem.control) {
            switch (menuItem.control) {
                case "toggle":
                    menuItem.state = !menuItem.state;
                    break;
                case "toggleThree":
                    if (menuItem.state === false)
                        menuItem.state = null;
                    else
                        menuItem.state = !menuItem.state;
                    break;
            }
            this.applySettingsFor(menuItem);
        }
        if (menuItem.states) {
            for (var i in menuItem.states) {
                this.states[i] = menuItem.states[i];
            }
        }
        if (menuItem.action) {
            var action = menuItem.action;
            if (typeof menuItem.action === "string") {
                action = this[action];
            }
            action.apply(this, [menuItem]);
        }
        if (menuItem.submenu) {
            var submenu = menuItem.submenu;
            if (typeof submenu === "string") {
                submenu = MENU[submenu];
            }
            submenu.parent = this.getCurrentMenu();
            submenu.indexInParent = this.currentIndex;
            this.currentMenu = submenu;
            this.rowOffset = this.currentIndex = 0;
        }
        if (manual) {
            Sound.play(SFX.menuIn);
        }
    }
    return this;
};

/**
 * Menu interface interaction function.
 *
 * @param {String} keyCode Key code.
 */
Menu.prototype.shortcut = function (keyCode) {
    var m = this.getCurrentMenu();
    for (var i in m.tree) {
        if (m.tree[i].shortcut === keyCode) {
            var action = m.tree[i].action;
            if (typeof menuItem.action === "string") {
                action = this[action];
            }
            action.apply(this);
            return true;
        }
    }
    return false;
};

/**
 * Function to navigate through menu.
 *
 * @param {Number} delta Row selection difference.
 */
Menu.prototype.changeIndex = function (delta) {
    var m = this.getCurrentMenu();
    var cap = m.compact ? MENU_CAPACITY_COMPACT : MENU_CAPACITY;
    var l = m.tree.length;
    Sound.play(this.navSound);
    if (Math.abs(delta) > 1) {
        var n = this.currentIndex + delta;
        this.rowOffset = Math.max(0, Math.min(this.rowOffset + delta, l - cap));
        if (n < 0) {
            this.currentIndex = 0;
            return;
        }
        if (n >= l) {
            this.currentIndex = l - 1;
            return;
        }
    }
    this.currentIndex += l;
    this.currentIndex = (this.currentIndex + delta) % l;
    this.rowOffset = Math.min(Math.max(this.rowOffset, this.currentIndex - cap + 1), this.currentIndex);
};

/**
 * Function to change input's value.
 *
 * @param {Number} delta Difference. Usually -1 or +1.
 */
Menu.prototype.changeValue = function (delta) {
    var m = this.getCurrentMenu();
    var menuItem = m.tree[this.currentIndex];
    if (menuItem) {
        if (menuItem.control) {
            if (menuItem.control === "slider") {
                if (menuItem.values) {
                    var index = menuItem.values.indexOf(menuItem.state);
                    index += delta;
                    index = Util.bound(0, index, menuItem.values.length - 1);
                    menuItem.state = menuItem.values[index];
                } else {
                    menuItem.state += (menuItem.step || 10) * delta;
                    menuItem.state = Util.bound(menuItem.min || 0, menuItem.state, menuItem.max || 100);
                }
            }
            Settings.set(menuItem.statePath, menuItem.state);
            if (menuItem.control === "slider") {
                Sound.play(this.navSound);
            }
        }
    }
};

/**
 * Applies settings for certain menu item (control).
 *
 * @param {Object} menuItem Menu item object.
 */
Menu.prototype.applySettingsFor = function (menuItem) {
    if (!menuItem.control) {
        console.log("Trying to apply settings to non-control menu item!");
        return;
    }
    var settingValue = menuItem.control === "radio" ? menuItem.stateVar : menuItem.state;
    Settings.set(menuItem.statePath, settingValue);
    if (menuItem.vpField) {
        eval("this.vp." + menuItem.vpField + " = settingValue;");
    }
};

/**
 * Menu interface draw function.
 */
Menu.prototype.draw = function () {
    var context = this.vp.context;

    if (GameEvent.checkEvent("valentine")) {
        var obj = EVENT.valentine.res.object;
        var z = EVENT.valentine.res.zoom * this.vp.zoom;
        var c = 42;
        for (var i = 0; i < c; i++) {
            var xD = this.vp.zoom * Math.sin(new Date().getTime() / 200 + Math.sin(i) * 42) * 5;
            var y = (new Date().getTime() + Math.pow(Math.sin(i) * 420, 2)) % 4000 / 4000;
            context.drawImage(
                    obj,
                    this.vp.width * (i + 0.5) / c + xD - obj.width / 2 * z,
                    this.vp.height * (y - 0.1) * 1.2 - obj.height / 2 * z,
                    obj.width * z,
                    obj.height * z);
        }
    }

    var m = this.getCurrentMenu();
    var items = m.tree;

    context.textAlign = MENU_TEXT_ALIGN;
    context.textBaseline = "top";

    var height = this.vp.zoom * (m.compact ? MENU_H_COMPACT : MENU_H);
    var cap = m.compact ? MENU_CAPACITY_COMPACT : MENU_CAPACITY;

    for (var i in items) {
        var row = +i - this.rowOffset;
        if (row >= 0 && row < cap) {
            this.vp.setFont(FONT.menu, {selected: this.currentIndex === +i, compact: m.compact, disabled: items[i].isEnabled && !items[i].isEnabled.apply(this)});
            this.vp.drawText(items[i].title,
                    this.vp.zoom * (MENU_X + (this.currentIndex === +i) * MENU_SELECTION_OFFSET_X * Math.min(1, (new Date().getTime() - this.lastAction) / this.actionDelay)),
                    this.vp.zoom * MENU_Y + height * row);
            switch (items[i].control) {
                case "toggle":
                case "toggleThree":
                    var stateName = items[i].state === null ? "Partial" : items[i].state ? "On" : "Off";
                    if (items[i].stateNames) {
                        stateName = items[i].stateNames[stateName] || stateName;
                    }
                    this.vp.drawText(
                            stateName,
                            this.vp.zoom * (MENU_X + MENU_OPTION_OFFSET_X),
                            this.vp.zoom * MENU_Y + height * row);
                    break;
                case "slider":
                    var stateName = items[i].state + "";
                    if (items[i].stateNames) {
                        stateName = items[i].stateNames[stateName] || stateName;
                    }
                    this.vp.drawText(
                            //TODO: replace with something better:
                            "◀ " + stateName + " ▶",
                            this.vp.zoom * (MENU_X + MENU_OPTION_OFFSET_X),
                            this.vp.zoom * MENU_Y + height * row);
                    break;
            }
        }
    }

    var l = items.length;
    if (l > cap) {
        this.vp.setFont(FONT.menu, {selected: true});
        context.strokeRect(this.vp.zoom * MENU_SCROLL_X,
                this.vp.zoom * MENU_Y + this.rowOffset * height * cap / (l - cap + 1),
                this.vp.zoom * MENU_SCROLL_W, height * cap / (l - cap + 2));
        context.fillRect(this.vp.zoom * MENU_SCROLL_X,
                this.vp.zoom * MENU_Y + this.rowOffset * height * cap / (l - cap + 1),
                this.vp.zoom * MENU_SCROLL_W, height * cap / (l - cap + 2));
    }

    var description = items[this.currentIndex].description;
    if (description) {
        this.vp.setFont(FONT.menu, {description: true});
        this.vp.context.globalAlpha = Math.min(1, (new Date().getTime() - this.lastAction) / this.actionDelay);
        this.vp.drawText(description,
                this.vp.zoom * MENU_X,
                this.vp.zoom * MENU_DESC_Y);
        this.vp.context.globalAlpha = 1;
    }

    var title = this.getCurrentTitle();
    this.vp.setFont(FONT.title, {menu: true});
    this.vp.drawText(title, this.vp.zoom * MENU_X, this.vp.zoom * MENU_SUBTITLE_Y);
};
