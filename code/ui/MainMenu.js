/**
 * Creates new instance of main menu.
 *
 * @constructor
 * @param {ViewPort} viewPort Viewport to display the menu.
 */
function MainMenu(viewPort) {
    extend(this, new Menu(viewPort));

    var diffMenu = [];
    for (var i in DIFF) {
        if (!DIFF[i].hidden) {
            diffMenu.push({
                id: "diff_" + i,
                diff: +i,
                title: DIFF[i].name,
                action: function (viewPort) {
                    viewPort.world = new World(viewPort);
                    viewPort.world.startStage(1, this.diff);
                    viewPort.mainMenu.resetLocation();
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

    this.imgBG = new Image();
    this.imgBG.src = IMAGE_FOLDER + IMAGE.menuBackground.file;

}

/**
 * Main menu interface draw function.
 * @override
 */
MainMenu.prototype.draw = function () {
    this.viewPort.context.drawImage(this.imgBG, 0, 0, this.imgBG.width, this.imgBG.height, 0, 0, WIDTH, HEIGHT);

    this.$draw();

    this.viewPort.setFont(FONT.info, {minor: true});
    this.viewPort.drawText("Tenbyou " + ENGINE_VER + " / " + this.viewPort.fps + " FPS", MENU_X, MENU_VER_Y);
};
