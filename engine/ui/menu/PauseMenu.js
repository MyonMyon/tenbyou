/**
 * Creates new instance of pause menu.
 *
 * @constructor
 * @param {ViewPort} vp Viewport to display the menu.
 */
function PauseMenu(vp) {
    extend(this, new Menu(vp));

    this.navSound = SFX.menuPauseNavigate;

    this.tree = [
        {
            isVisible: function () {
                return this.vp.world && this.vp.world.continueMode && this.vp.world.continuable;
            },
            title: "Continue",
            action: function () {
                this.vp.world.setPause(false);
                this.vp.world.player.useContinue();
                this.resetLocation();
            }
        },
        {
            isVisible: function () {
                return this.vp.world && !this.vp.world.continueMode;
            },
            title: "Resume",
            shortcut: "Escape",
            action: function () {
                this.vp.world.setPause(false);
                this.resetLocation();
            }
        },
        {
            title: "Restart",
            shortcut: "KeyR",
            action: function () {
                var diff = this.vp.world.difficulty;
                var spell = this.vp.world.spell;
                this.fadeOut = new Date().getTime();
                this.vp.world = new World(this.vp);
                if (spell) {
                    this.vp.world.startSpellPractice(diff, spell);
                } else if (DIFF[diff].hidden) {
                    this.vp.world.startExtra(diff);
                } else {
                    this.vp.world.startStage(1, diff);
                }
                this.resetLocation();
            }
        },
        {
            title: "To Main Menu",
            shortcut: "KeyQ",
            action: function () {
                this.vp.world.destroy();
                this.resetLocation();
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
