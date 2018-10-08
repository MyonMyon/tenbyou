/**
 * Creates new instance of menu.
 *
 * @constructor
 * @param {ViewPort} viewPort Viewport to display the menu.
 */
function Menu(viewPort) {
    this.viewPort = viewPort;

    this.actionDelay = 200;
    this.rowOffset = 0;

    var diffMenu = [];
    for (var i in DIFF) {
        if (!DIFF[i].hidden) {
            diffMenu.push({
                id: "diff_" + i,
                diff: +i,
                title: DIFF[i].name,
                action: function (viewPort) {
                    viewPort.world = new World(viewPort);
                    viewPort.world.difficulty = this.diff;
                    viewPort.menu.resetLocation();
                }
            });
        }
    }

    var spellMenu = [];
    var spellNumber = 0;
    for (var i in SPELL) {
        spellNumber = SPELL[i].number || spellNumber;
        for (var j in SPELL[i].names) {
            if (SPELL[i].names[j]) {
                spellMenu.push({
                    id: "spell_" + spellNumber,
                    diff: +j,
                    spell: SPELL[i],
                    title: "#" + viewPort.fixedInt(spellNumber, 3) + " " + SPELL[i].names[j] + " (" + DIFF[j].letter + ")",
                    action: function (viewPort) {
                        viewPort.world = new World(viewPort);
                        viewPort.world.startSpellPractice(+this.diff, this.spell);
                        viewPort.menu.resetLocation();
                    }
                });
                ++spellNumber;
            }
        }
    }
    var inputMenu = [];
    var aliases = this.viewPort.input.actionsAliases;
    for (var i in aliases) {
        if (aliases[i].category === "interaction") {
            inputMenu.push({
                title: i.toTitleCase() + ": " + this.viewPort.input.getKeyByAction(i, true)
            });
        }
    }

    this.tree = [
        {
            id: "start",
            title: "Start Game",
            submenu: diffMenu
        },
        {
            id: "extra",
            title: "Start Extra",
            action: function (viewPort) {
                viewPort.world = new World(viewPort);
                viewPort.world.startExtra(4);
                viewPort.menu.resetLocation();
            }
        },
        {
            id: "spell",
            title: "Spell Practice",
            compact: true,
            submenu: spellMenu
        },
        {
            id: "controls",
            title: "Controls",
            submenu: inputMenu
        },
        {
            id: "quit",
            title: "Quit",
            action: function () {
                window.location = "about:blank";
            }
        }
    ];

    this.imgBG = new Image();
    this.imgBG.src = RES_FOLDER + IMAGE.menuBackground.file;

    this.pauseTree = [
        {
            isVisible: function (viewPort) {
                return viewPort.world && viewPort.world.continuable;
            },
            title: "Resume",
            action: function (viewPort) {
                viewPort.world.pause = false;
                viewPort.menu.resetLocation();
            }
        },
        {
            title: "Restart",
            action: function (viewPort) {
                var diff = viewPort.world.difficulty;
                var spell = viewPort.world.spell;
                viewPort.world = new World(viewPort);
                if (spell) {
                    viewPort.world.startSpellPractice(diff, spell);
                } else if (DIFF[diff].hidden) {
                    viewPort.world.startExtra(diff);
                } else {
                    viewPort.world.difficulty = diff;
                }
                viewPort.menu.resetLocation();
            }
        },
        {
            title: "To Main Menu",
            action: function (viewPort) {
                viewPort.world.destroy();
                viewPort.menu.resetLocation();
            }
        }
    ];
    this.resetLocation();
}

/**
 * @return {Object} Current menu item object.
 */
Menu.prototype.getCurrentMenu = function () {
    var menu = {submenu: this.viewPort.world ? this.pauseTree : this.tree}; //AKA Pause Menu and Main Menu
    var items;

    for (var level = 0; level < this.location.length; level++) {
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
    this.currentIndex = 0;
};

/**
 * Menu interface draw function.
 *
 * @param {String} code Action code.
 */
Menu.prototype.action = function (code) {
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
            if (item.submenu) {
                this.location.push(item.id);
            }
            if (item.action) {
                item.action(this.viewPort);
            }
            this.rowOffset = this.currentIndex = 0;
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
    if (!this.viewPort.world) {
        context.drawImage(this.imgBG, 0, 0, this.imgBG.width, this.imgBG.height, 0, 0, WIDTH, HEIGHT);
    }

    var m = this.getCurrentMenu();
    var items = m.submenu;
    var title = this.getCurrentTitle();

    context.textAlign = MENU_TEXT_ALIGN;
    context.textBaseline = "top";

    if (!this.viewPort.world) {
        this.viewPort.setFont(FONT.title, {menu: true});
        this.viewPort.drawText(title, MENU_X, MENU_TITLE_Y);
        this.viewPort.setFont(FONT.info, {minor: true});
        this.viewPort.drawText("Tenbyou " + ENGINE_VER + " / " + this.viewPort.fps + " FPS", MENU_X, MENU_VER_Y);
    }
    
    var height = m.compact ? MENU_H_COMPACT : MENU_H;
    var cap = m.compact ? MENU_CAPACITY_COMPACT : MENU_CAPACITY;

    for (var i in items) {
        var row = +i - this.rowOffset;
        if (row >= 0 && row < cap) {
            this.viewPort.setFont(FONT.menu, {selected: this.currentIndex === +i, compact: m.compact});
            this.viewPort.drawText(items[i].title, MENU_X, MENU_Y + height * row);
        }
    }

    var l = items.length;
    if (l > cap) {
        this.viewPort.setFont(FONT.menu, {selected: true});
        context.strokeRect(MENU_SCROLL_X, MENU_Y + this.rowOffset * height * cap / (l - cap + 1), MENU_SCROLL_W, height * cap / (l - cap + 2));
        context.fillRect(MENU_SCROLL_X, MENU_Y + this.rowOffset * height * cap / (l - cap + 1), MENU_SCROLL_W, height * cap / (l - cap + 2));
    }

};
