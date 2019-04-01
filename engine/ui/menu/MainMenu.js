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

        let aliases = this.vp.input.actionsAliases;
        for (let i in aliases) {
            if (new Set(["interaction", "misc"]).has(aliases[i].category)) {
                MENU.input.text.push(i.toTitleCase() + ": " + this.vp.input.getKeyByAction(i, true));
            }
        }

        if (GameEvent.checkEvent("aprilFools")) {
            //To do: REWRITE THE WHOLE RESOURCE LOADING, that's just a shit of a mess
            SPRITE.menuBackground = EVENT_RES.aprilFools;
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
        let ctx = this.vp.context;
        ctx.globalAlpha = this.getFade();

        let o = SPRITE.menuBackground.object;
        ctx.drawImage(o, 0, 0, o.width, o.height, 0, 0, WIDTH * this.vp.zoom, HEIGHT * this.vp.zoom);

        super.draw();
        if (!this.getCurrentMenu().parent) {
            this.vp.setFont(FONT.title, { menu: true, fr: true });
            this.vp.drawText(FRANCHISE_TITLE, MENU_X * this.vp.zoom, MENU_TITLE_Y * this.vp.zoom);
        }

        let tagline = GameEvent.getCurrentProp("tagline");
        if (tagline) {
            ctx.save();
            ctx.translate(WIDTH * this.vp.zoom * 0.55, HEIGHT * this.vp.zoom * 0.4);
            ctx.rotate(-0.3);
            let z = 1 + Math.sin(Date.now() / 200) * 0.2;
            ctx.scale(z, z);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            this.vp.setFont(FONT.tagline);
            this.vp.drawText(tagline, 0, 0);
            ctx.restore();
        }

        this.vp.setFont(FONT.info, { minor: true });
        this.vp.drawText(
            [this.vp.version, "/", RELEASE_DATE, "/", this.vp.fps.toFixed(2), "FPS"].join(" "),
            MENU_X * this.vp.zoom,
            MENU_VER_Y * this.vp.zoom);
        ctx.globalAlpha = 1;
    }
}
