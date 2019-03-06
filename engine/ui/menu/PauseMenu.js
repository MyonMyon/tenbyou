/**
 * Creates new instance of pause menu.
 *
 * @constructor
 * @param {ViewPort} vp Viewport to display the menu.
 */
function PauseMenu(vp) {
    extend(this, new Menu(vp));

    this.navSound = SFX.menuPauseNavigate;

    this.tree = MENU.pause.tree;
}

/**
 * @return {String} Current menu title.
 * @override
 */
PauseMenu.prototype.getCurrentTitle = function () {
    return "Pause";
};

/**
 * Pause menu interface draw function.
 * @override
 */
PauseMenu.prototype.draw = function () {
    this.vp.context.globalAlpha = this.getFade();

    this.vp.context.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.vp.context.fillRect(0, 0, this.vp.width, this.vp.height);

    this.$draw();
    this.vp.context.globalAlpha = 1;
};
