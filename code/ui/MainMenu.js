/**
 * Creates new instance of main menu.
 *
 * @constructor
 * @param {ViewPort} viewPort Viewport to display the menu.
 */
function MainMenu(viewPort) {
    extend(this, new Menu(viewPort));

    var stageMenu = [];
    for (var i in STAGE) {
        if (!STAGE[i].extra) {
            stageMenu.push({
                id: "stg_" + (+i + 1),
                stage: +i + 1,
                title: "Stage " + (+i + 1),
                action: function (viewPort) {
                    viewPort.world = new World(viewPort);
                    viewPort.world.startStage(this.stage, viewPort.mainMenu.getCurrentMenu().diff);
                    viewPort.mainMenu.resetLocation();
                }
            });
        }
    }

    var diffMenu = [];
    for (var i in DIFF) {
        if (!DIFF[i].hidden) {
            diffMenu.push({
                id: "diff_" + i,
                diff: +i,
                title: DIFF[i].name,
                submenu: stageMenu
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
            isEnabled: function (viewPort) {
                return false;
            },
            action: function (viewPort) {
                viewPort.world = new World(viewPort);
                viewPort.world.startExtra(4);
                viewPort.mainMenu.resetLocation();
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
}

/**
 * Main menu interface draw function.
 * @override
 */
MainMenu.prototype.draw = function () {
    var o = SPRITE.menuBackground.object;
    this.viewPort.context.drawImage(o, 0, 0, o.width, o.height, 0, 0, WIDTH, HEIGHT);

    this.$draw();
    if (!this.getCurrentMenu().title) {
        this.viewPort.setFont(FONT.title, {menu: true, fr: true});
        this.viewPort.drawText(FRANCHISE_TITLE, MENU_X, MENU_TITLE_Y);
    }

    this.viewPort.setFont(FONT.info, {minor: true});
    this.viewPort.drawText(
            [this.viewPort.version, "/", RELEASE_DATE, "/", this.viewPort.fps, "FPS"].join(" "),
            MENU_X,
            MENU_VER_Y);
};
