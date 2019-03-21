class PauseMenu extends Menu {
    constructor(vp) {
        super(vp);

        this.navSound = SFX.menuPauseNavigate;

        this.tree = MENU.pause.tree;
    }

    /**
     * @return {String} Current menu title.
     * @override
     */
    getCurrentTitle() {
        return "Pause";
    }

    /**
     * Pause menu interface draw function.
     * @override
     */
    draw() {
        this.vp.context.globalAlpha = this.getFade();

        this.vp.context.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.vp.context.fillRect(0, 0, this.vp.width, this.vp.height);

        super.draw();
        this.vp.context.globalAlpha = 1;
    }
}
