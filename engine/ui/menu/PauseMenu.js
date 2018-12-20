/**
 * Creates new instance of pause menu.
 *
 * @constructor
 * @param {ViewPort} vp Viewport to display the menu.
 */
function PauseMenu(vp) {
    extend(this, new Menu(vp));

    this.tree = [
        {
            isVisible: function (vp) {
                return vp.world && vp.world.continueMode && vp.world.continuable;
            },
            title: "Continue",
            action: function (vp) {
                vp.world.setPause(false);
                vp.world.player.useContinue();
                vp.pauseMenu.resetLocation();
            }
        },
        {
            isVisible: function (vp) {
                return vp.world && !vp.world.continueMode;
            },
            title: "Resume",
            shortcut: "Escape",
            action: function (vp) {
                vp.world.setPause(false);
                vp.pauseMenu.resetLocation();
            }
        },
        {
            title: "Restart",
            shortcut: "KeyR",
            action: function (vp) {
                var diff = vp.world.difficulty;
                var spell = vp.world.spell;
                vp.pauseMenu.fadeOut = new Date().getTime();
                vp.world = new World(vp);
                if (spell) {
                    vp.world.startSpellPractice(diff, spell);
                } else if (DIFF[diff].hidden) {
                    vp.world.startExtra(diff);
                } else {
                    vp.world.startStage(1, diff);
                }
                vp.pauseMenu.resetLocation();
            }
        },
        {
            title: "To Main Menu",
            shortcut: "KeyQ",
            action: function (vp) {
                vp.world.destroy();
                vp.pauseMenu.resetLocation();
                vp.mainMenu.fadeIn = new Date().getTime();
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
    this.vp.context.globalAlpha = this.getFade();

    this.vp.context.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.vp.context.fillRect(0, 0, this.vp.width, this.vp.height);

    this.$draw();
    this.vp.context.globalAlpha = 1;
};
