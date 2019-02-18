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

    this.stageMenu = {
        title: "Select Stage",
        tree: []
    };
    for (var i in STAGE) {
        if (!STAGE[i].extra) {
            this.stageMenu.tree.push({
                id: "stg_" + (+i + 1),
                states: {stage: +i + 1},
                title: "Stage " + (+i + 1),
                description: STAGE[i].title,
                action: this.startGame
            });
        }
    }

    this.charMenu = {
        title: "Select Character",
        tree: []
    };
    for (var i in CHAR) {
        if (CHAR[i].playable) {
            this.charMenu.tree.push({
                id: "char_" + i,
                states: {char: i},
                title: CHAR[i].name,
                description: CHAR[i].description,
                action: this.onCharSelect
            });
        }
    }

    this.diffMenu = {
        title: "Select Difficulty",
        tree: []
    };
    for (var i in DIFF) {
        if (!DIFF[i].hidden) {
            this.diffMenu.tree.push({
                id: "diff_" + i,
                states: {difficulty: +i},
                title: DIFF[i].name,
                description: DIFF[i].description,
                submenu: this.charMenu
            });
        }
    }

    this.spellMenu = {
        compact: true,
        title: "Select Spell",
        tree: []
    };
    var spellNumber = 0;
    for (var i in SPELL) {
        spellNumber = SPELL[i].number || spellNumber;
        for (var j in SPELL[i].names) {
            if (SPELL[i].names[j]) {
                this.spellMenu.tree.push({
                    id: "spell_" + spellNumber,
                    states: {difficulty: +j, spell: SPELL[i]},
                    spell: SPELL[i],
                    title: "#" + Util.fillWithLeadingZeros(spellNumber, 3) + " " + SPELL[i].names[j] + " (" + DIFF[j].letter + ")",
                    action: this.startGame
                });
                ++spellNumber;
            }
        }
    }
    this.inputMenu = {tree: []};
    var aliases = this.vp.input.actionsAliases;
    for (var i in aliases) {
        if (["interaction", "misc"].indexOf(aliases[i].category) >= 0) {
            this.inputMenu.tree.push({
                title: i.toTitleCase() + ": " + this.vp.input.getKeyByAction(i, true)
            });
        }
    }

    this.tree = [
        {
            id: "start",
            title: "Game Start",
            description: "Start playing the main game",
            submenu: this.diffMenu,
            states: {gameType: "standard"}
        },
        {
            id: "extra",
            title: "Extra Start",
            description: "Not yet",
            isEnabled: function () {
                return false;
            },
            action: this.startGame,
            states: {gameType: "extra", char: "nBarashou"}
        },
        {
            id: "spell",
            title: "Spell Practice",
            description: "Start practicing spell attacks",
            submenu: this.charMenu,
            states: {gameType: "spell"}
        },
        {
            id: "options",
            title: "Options",
            description: "Just a couple of tweaks",
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
            description: "See key bindings",
            submenu: this.inputMenu
        },
        {
            id: "quit",
            title: "Quit",
            description: "Back to the reality",
            action: function () {
                window.location = document.referrer || "about:blank";
            }
        }
    ];
    this.updateStates();
    this.loadSettingsStates();
}

/**
 * Ultimate function to start the game.
 */
MainMenu.prototype.startGame = function () {
    this.vp.pauseMenu.fadeIn = null;
    this.fadeOut = new Date().getTime();
    this.vp.world = new World(this.vp);
    this.vp.world.setPlayer(this.states.char);
    switch (this.states.gameType) {
        case "standard":
            this.vp.world.startStage(this.states.stage, this.states.difficulty);
            this.resetLocation();
            break;
        case "extra":
            this.vp.world.setPlayer(this.states.char);
            this.vp.world.startExtra(4);
            break;
        case "spell":
            this.vp.world.startSpellPractice(this.states.difficulty, this.states.spell);
            break;
    }
};

/**
 * Ultimate function after character selection.
 *
 * @param {Object} charItem Selected menu item representing character.
 */
MainMenu.prototype.onCharSelect = function (charItem) {
    switch (this.states.gameType) {
        case "standard":
            charItem.submenu = this.stageMenu;
            break;
        case "spell":
            charItem.submenu = this.spellMenu;
            break;
    }
    this.updateStates(charItem.submenu.tree);
};

/**
 * Main menu interface draw function.
 * @override
 */
MainMenu.prototype.draw = function () {
    this.vp.context.globalAlpha = this.getFade();

    var o = SPRITE.menuBackground.object;
    this.vp.context.drawImage(o, 0, 0, o.width, o.height, 0, 0, WIDTH * this.vp.zoom, HEIGHT * this.vp.zoom);

    this.$draw();
    if (!this.getCurrentMenu().parent) {
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
