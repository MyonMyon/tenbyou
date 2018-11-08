/**
 * Creates new instance of pause menu.
 *
 * @constructor
 * @param {ViewPort} viewPort Viewport to display the menu.
 */
function PauseMenu(viewPort) {
    extend(this, new Menu(viewPort));

    this.tree = [
        {
            isVisible: function (viewPort) {
                return viewPort.world && viewPort.world.continuable;
            },
            title: "Resume",
            action: function (viewPort) {
                viewPort.world.pause = false;
                viewPort.pauseMenu.resetLocation();
            }
        },
        {
            title: "Restart",
            action: function (viewPort) {
                var diff = viewPort.world.difficulty;
                var spell = viewPort.world.spell;
                viewPort.world = new World(viewPort);
                if (spell) {
                    viewPort.world.startSpellPractice(diff, spell);
                } else if (DIFF[diff].hidden) {
                    viewPort.world.startExtra(diff);
                } else {
                    viewPort.world.startStage(1, diff);
                }
                viewPort.pauseMenu.resetLocation();
            }
        },
        {
            title: "To Main Menu",
            action: function (viewPort) {
                viewPort.world.destroy();
                viewPort.pauseMenu.resetLocation();
            }
        }
    ];
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
    this.viewPort.context.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.viewPort.context.fillRect(0, 0, this.viewPort.canvas.width, this.viewPort.canvas.height);

    this.$draw();
};
