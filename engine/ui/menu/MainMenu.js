/**
 * Creates new instance of main menu.
 *
 * @constructor
 * @param {ViewPort} vp Viewport to display the menu.
 */
function MainMenu(vp) {
    extend(this, new Menu(vp));

    this.navSound = SFX.menuNavigate;

    var stageMenu = [];
    for (var i in STAGE) {
        if (!STAGE[i].extra) {
            stageMenu.push({
                id: "stg_" + (+i + 1),
                stage: +i + 1,
                title: "Stage " + (+i + 1),
                action: function (vp) {
                    vp.world = new World(vp);
                    vp.world.startStage(this.stage, vp.mainMenu.getCurrentMenu().diff);
                    vp.mainMenu.resetLocation();
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
                    title: "#" + Util.fillWithLeadingZeros(spellNumber, 3) + " " + SPELL[i].names[j] + " (" + DIFF[j].letter + ")",
                    action: function (vp) {
                        vp.world = new World(vp);
                        vp.world.startSpellPractice(+this.diff, this.spell);
                    }
                });
                ++spellNumber;
            }
        }
    }
    var inputMenu = [];
    var aliases = this.vp.input.actionsAliases;
    for (var i in aliases) {
        if (["interaction", "misc"].indexOf(aliases[i].category) >= 0) {
            inputMenu.push({
                title: i.toTitleCase() + ": " + this.vp.input.getKeyByAction(i, true)
            });
        }
    }

    this.tree = [
        {
            id: "start",
            title: "Game Start",
            submenu: diffMenu
        },
        {
            id: "extra",
            title: "Extra Start",
            isEnabled: function (vp) {
                return false;
            },
            action: function (vp) {
                vp.world = new World(vp);
                vp.world.startExtra(4);
                vp.mainMenu.resetLocation();
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
                window.location = document.referrer || "about:blank";
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
    this.vp.context.drawImage(o, 0, 0, o.width, o.height, 0, 0, WIDTH * this.vp.zoom, HEIGHT * this.vp.zoom);

    this.$draw();
    if (!this.getCurrentMenu().title) {
        this.vp.setFont(FONT.title, {menu: true, fr: true});
        this.vp.drawText(FRANCHISE_TITLE, MENU_X * this.vp.zoom, MENU_TITLE_Y * this.vp.zoom);
    }

    this.vp.setFont(FONT.info, {minor: true});
    this.vp.drawText(
            [this.vp.version, "/", RELEASE_DATE, "/", this.vp.fps.toFixed(2), "FPS"].join(" "),
            MENU_X * this.vp.zoom,
            MENU_VER_Y * this.vp.zoom);
};
