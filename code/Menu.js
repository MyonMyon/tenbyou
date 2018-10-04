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
        diffMenu.push({
            id: "diff_" + i,
            diff: +i,
            title: DIFF[i],
            action: function (viewPort) {
                viewPort.world = new World(viewPort);
                viewPort.world.difficulty = this.diff;
                viewPort.menu.resetLocation();
            }
        });
    }

    var spellMenu = [];
    var spellNumber = 0;
    for (var i in SPELL) {
        for (var j in SPELL[i].names) {
            if (SPELL[i].names[j]) {
                spellMenu.push({
                    id: "spell_" + ++spellNumber,
                    diff: +j,
                    spell: SPELL[i],
                    title: "#" + viewPort.fixedInt(spellNumber, 3) + " " + SPELL[i].names[j] + " (" + DIFF[j][0] + ")",
                    action: function (viewPort) {
                        viewPort.world = new World(viewPort);
                        viewPort.world.stage = 0;
                        viewPort.world.player.power = 4;
                        viewPort.world.difficulty = +this.diff;
                        var boss = new Enemy(viewPort.world);
                        boss.addSpell(this.spell, this.diff);
                        boss.setBossData(BOSS[this.spell.boss], true);
                        viewPort.menu.resetLocation();
                    }
                });
            }
        }
    }
    var inputMenu = [];
    var aliases = this.viewPort.input.actionsAliases;
    console.log(aliases)
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
            id: "spell",
            title: "Spell Practice",
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
    this.imgBG.src = RES_FOLDER + IMAGE_MENU_BG;

    this.pauseTree = [
        {
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
                viewPort.world = new World(viewPort);
                viewPort.world.difficulty = diff;
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
    switch (code) {
        case "nav_down":
            this.changeIndex(1);
            break;
        case "nav_up":
            this.changeIndex(-1);
            break;
        case "nav_right":
            this.changeIndex(MENU_CAPACITY);
            break;
        case "nav_left":
            this.changeIndex(-MENU_CAPACITY);
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
            var menu = this.getCurrentMenu();
            var item = menu.submenu[this.currentIndex];
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
    var l = m.submenu.length;
    if (Math.abs(delta) > 1) {
        var n = this.currentIndex + delta;
        this.rowOffset = Math.max(0, Math.min(this.rowOffset + delta, l - MENU_CAPACITY));
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
    this.rowOffset = Math.min(Math.max(this.rowOffset, this.currentIndex - MENU_CAPACITY + 1), this.currentIndex);
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
    this.viewPort.setFont(FONT.title);

    if (!this.viewPort.world) {
        this.viewPort.drawText(title, MENU_X, MENU_TITLE_Y);
        this.viewPort.drawText(ENGINE_VER + " / " + this.viewPort.fps + " FPS", MENU_X, MENU_VER_Y);
    }

    for (var i in items) {
        var row = +i - this.rowOffset;
        if (row >= 0 && row < MENU_CAPACITY) {
            this.viewPort.setFont((this.currentIndex === +i) ? FONT.titleSelected : FONT.title);
            this.viewPort.drawText(items[i].title, MENU_X, MENU_Y + MENU_H * row);
        }
    }
    if (items.length > MENU_CAPACITY) {
        this.viewPort.setFont(FONT.titleSelected);
        context.strokeRect(MENU_SCROLL_X, MENU_Y + this.rowOffset * MENU_H * MENU_CAPACITY / (items.length - MENU_CAPACITY + 1), MENU_SCROLL_W, MENU_H * MENU_CAPACITY / (items.length - MENU_CAPACITY + 2));
        context.fillRect(MENU_SCROLL_X, MENU_Y + this.rowOffset * MENU_H * MENU_CAPACITY / (items.length - MENU_CAPACITY + 1), MENU_SCROLL_W, MENU_H * MENU_CAPACITY / (items.length - MENU_CAPACITY + 2));
    }

};
