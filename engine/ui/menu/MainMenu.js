class MainMenu extends Menu {
    /**
     * Creates new instance of main menu.
     *
     * @constructor
     * @param {ViewPort} vp Viewport to display the menu.
     */
    constructor(vp) {
        super(vp);
        this.fadeIn = new Date().getTime();

        this.navSound = SFX.menuNavigate;

        this.tree = MENU.main.tree;

        var aliases = this.vp.input.actionsAliases;
        for (let i in aliases) {
            if (["interaction", "misc"].indexOf(aliases[i].category) >= 0) {
                MENU.input.text.push(i.toTitleCase() + ": " + this.vp.input.getKeyByAction(i, true));
            }
        }

        this.updateStates();
        this.loadSettingsStates();
    }

    /**
     * Ultimate function to start the game.
     */
    startGame() {
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
    }

    /**
     * Ultimate function after character selection.
     *
     * @param {Object} charItem Selected menu item representing character.
     */
    onCharSelect(charItem) {
        switch (this.states.gameType) {
            case "standard":
                charItem.submenu = MENU.stage;
                break;
            case "spell":
                charItem.submenu = MENU.spell;
                break;
        }
        this.updateStates(charItem.submenu.tree);
    }

    /**
     * Main menu interface draw function.
     * @override
     */
    draw() {
        this.vp.context.globalAlpha = this.getFade();

        var o = SPRITE.menuBackground.object;
        this.vp.context.drawImage(o, 0, 0, o.width, o.height, 0, 0, WIDTH * this.vp.zoom, HEIGHT * this.vp.zoom);

        super.draw();
        if (!this.getCurrentMenu().parent) {
            this.vp.setFont(FONT.title, { menu: true, fr: true });
            this.vp.drawText(FRANCHISE_TITLE, MENU_X * this.vp.zoom, MENU_TITLE_Y * this.vp.zoom);
        }

        this.vp.setFont(FONT.info, { minor: true });
        this.vp.drawText(
            [this.vp.version, "/", RELEASE_DATE, "/", this.vp.fps.toFixed(2), "FPS"].join(" "),
            MENU_X * this.vp.zoom,
            MENU_VER_Y * this.vp.zoom);
        this.vp.context.globalAlpha = 1;
    }
}
