/**
 * Creates new instance of main menu.
 *
 * @constructor
 * @param {ViewPort} vp Viewport to display the menu.
 */
function MainMenu(vp) {
    extend(this, new Menu(vp));
    this.fadeIn = new Date().getTime();

    this.navSound = SFX.menuNavigate;

    var stageMenu = {
        title: "Select Stage",
        tree: []
    };
    for (var i in STAGE) {
        if (!STAGE[i].extra) {
            stageMenu.tree.push({
                id: "stg_" + (+i + 1),
                states: {stage: +i + 1},
                title: "Stage " + (+i + 1),
                action: function () {
                    this.vp.pauseMenu.fadeIn = null;
                    this.fadeOut = new Date().getTime();
                    this.vp.world = new World(this.vp);
                    this.vp.world.setPlayer(this.states.char);
                    this.vp.world.startStage(this.states.stage, this.states.difficulty);
                    this.resetLocation();
                }
            });
        }
    }

    var charMenu = {
        title: "Select Character",
        tree: []
    };
    for (var i in CHAR) {
        if (CHAR[i].playable) {
            charMenu.tree.push({
                id: "char_" + i,
                states: {char: i},
                title: CHAR[i].name,
                submenu: stageMenu
            });
        }
    }

    var diffMenu = {
        title: "Select Difficulty",
        tree: []
    };
    for (var i in DIFF) {
        if (!DIFF[i].hidden) {
            diffMenu.tree.push({
                id: "diff_" + i,
                states: {difficulty: +i},
                title: DIFF[i].name,
                submenu: charMenu
            });
        }
    }

    var spellMenu = {
        title: "Select Spell",
        tree: []
    };
    var spellNumber = 0;
    for (var i in SPELL) {
        spellNumber = SPELL[i].number || spellNumber;
        for (var j in SPELL[i].names) {
            if (SPELL[i].names[j]) {
                spellMenu.tree.push({
                    id: "spell_" + spellNumber,
                    states: {difficulty: +j, spell: SPELL[i], char: "nBarashou"},
                    spell: SPELL[i],
                    title: "#" + Util.fillWithLeadingZeros(spellNumber, 3) + " " + SPELL[i].names[j] + " (" + DIFF[j].letter + ")",
                    action: function () {
                        this.vp.pauseMenu.fadeIn = null;
                        this.fadeOut = new Date().getTime();
                        this.vp.world = new World(this.vp);
                        this.vp.world.setPlayer(this.states.char);
                        this.vp.world.startSpellPractice(this.states.difficulty, this.states.spell);
                    }
                });
                ++spellNumber;
            }
        }
    }
    var inputMenu = {tree: []};
    var aliases = this.vp.input.actionsAliases;
    for (var i in aliases) {
        if (["interaction", "misc"].indexOf(aliases[i].category) >= 0) {
            inputMenu.tree.push({
                title: i.toTitleCase() + ": " + this.vp.input.getKeyByAction(i, true)
            });
        }
    }

    this.tree = [
        {
            id: "start",
            title: "Game Start",
            submenu: diffMenu,
            states: {gameType: "standard"}
        },
        {
            id: "extra",
            title: "Extra Start",
            isEnabled: function () {
                return false;
            },
            action: function () {
                this.vp.pauseMenu.fadeIn = null;
                this.fadeOut = new Date().getTime();
                this.vp.world = new World(this.vp);
                this.vp.world.setPlayer(this.states.char);
                this.vp.world.startExtra(4);
                this.resetLocation();
            }
        },
        {
            id: "spell",
            title: "Spell Practice",
            compact: true,
            submenu: spellMenu,
            states: {gameType: "spell"}
        },
        {
            id: "options",
            title: "Options",
            submenu: {tree: [{
                        id: "sound_on",
                        title: "Sound",
                        control: "toggle",
                        statePath: "sound.enabled"
                    }, {
                        id: "video_gradients",
                        title: "Gradients",
                        control: "toggle",
                        statePath: "video.gradients",
                        vpField: "gradients"
                    }]}
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
    this.updateStates();
    this.loadSettingsStates();
}

/**
 * Main menu interface draw function.
 * @override
 */
MainMenu.prototype.draw = function () {
    this.vp.context.globalAlpha = this.getFade();

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
    this.vp.context.globalAlpha = 1;
};
