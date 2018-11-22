/**
 * Creates new instance of menu.
 *
 * @constructor
 * @param {ViewPort} viewPort Viewport to display the menu.
 */
function Menu(viewPort) {
    this.viewPort = viewPort;

    this.actionDelay = 100;
    this.rowOffset = 0;

    this.resetLocation();
}

/**
 * @param {Number} parent Level offset, 1 for parent menu.
 * @return {Object} Current menu item object.
 */
Menu.prototype.getCurrentMenu = function (parent) {
    var menu = {submenu: this.tree}; //AKA Pause Menu and Main Menu
    var items;

    for (var level = 0; level < this.location.length - (parent || 0); level++) {
        items = menu.submenu;
        for (var i in items) {
            if (items[i].id === this.location[level]) {
                menu = items[i];
                break;
            }
            menu = null;
        }
    }
    menu.submenu = menu.submenu.filter(item => !item.isVisible || item.isVisible(this.viewPort));
    return menu;
};

/**
 * @return {String} Current menu title.
 */
Menu.prototype.getCurrentTitle = function () {
    var menu = this.getCurrentMenu();
    if (!menu.title)
        return GAME_TITLE;
    return menu.titleInner || menu.title;
};

/**
 * Navigates to main menu.
 */
Menu.prototype.resetLocation = function () {
    this.location = [];
    this.rowOffset = this.currentIndex = 0;
};

/**
 * Menu interface draw function.
 *
 * @param {String} code Action code.
 */
Menu.prototype.action = function (code) {
    if (code === "nav_null") {
        this.lastAction = 0;
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
            this.changeIndex(m.compact ? MENU_CAPACITY_COMPACT : MENU_CAPACITY);
            break;
        case "nav_left":
            this.changeIndex(m.compact ? -MENU_CAPACITY_COMPACT : -MENU_CAPACITY);
            break;
        case "nav_back":
            if (this.location.length) {
                var last = this.location.length - 1;
                var id = this.location[last];
                this.location.splice(last, 1);
                this.rowOffset = this.currentIndex = 0;
                var m = this.getCurrentMenu();
                for (var i in m.submenu) {
                    if (m.submenu[i].id === id) {
                        this.currentIndex = +i;
                        break;
                    }
                }
            }
            break;
        case "nav_enter":
            var item = m.submenu[this.currentIndex];
            if (item.isEnabled && !item.isEnabled()) {
                break;
            }
            if (item.submenu) {
                this.location.push(item.id);
                this.rowOffset = this.currentIndex = 0;
            }
            if (item.action) {
                item.action(this.viewPort);
            }
            break;
    }
    this.lastAction = new Date().getTime();
};

/**
 * Function to navigate through menu.
 *
 * @param {Number} delta Row selection difference.
 */
Menu.prototype.changeIndex = function (delta) {
    var m = this.getCurrentMenu();
    var cap = m.compact ? MENU_CAPACITY_COMPACT : MENU_CAPACITY;
    var l = m.submenu.length;
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
 * Menu interface draw function.
 */
Menu.prototype.draw = function () {
    var context = this.viewPort.context;

    var m = this.getCurrentMenu();
    var items = m.submenu;

    context.textAlign = MENU_TEXT_ALIGN;
    context.textBaseline = "top";

    var height = m.compact ? MENU_H_COMPACT : MENU_H;
    var cap = m.compact ? MENU_CAPACITY_COMPACT : MENU_CAPACITY;

    for (var i in items) {
        var row = +i - this.rowOffset;
        if (row >= 0 && row < cap) {
            this.viewPort.setFont(FONT.menu, {selected: this.currentIndex === +i, compact: m.compact, disabled: items[i].isEnabled && !items[i].isEnabled()});
            this.viewPort.drawText(items[i].title, MENU_X + (this.currentIndex === +i) * MENU_SELECTION_OFFSET_X, MENU_Y + height * row);
        }
    }

    var l = items.length;
    if (l > cap) {
        this.viewPort.setFont(FONT.menu, {selected: true});
        context.strokeRect(MENU_SCROLL_X, MENU_Y + this.rowOffset * height * cap / (l - cap + 1), MENU_SCROLL_W, height * cap / (l - cap + 2));
        context.fillRect(MENU_SCROLL_X, MENU_Y + this.rowOffset * height * cap / (l - cap + 1), MENU_SCROLL_W, height * cap / (l - cap + 2));
    }

    var title = this.getCurrentTitle();
    this.viewPort.setFont(FONT.title, {menu: true});
    this.viewPort.drawText(title, MENU_X, MENU_SUBTITLE_Y);
};
