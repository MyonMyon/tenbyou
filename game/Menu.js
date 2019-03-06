var MENU = {
    stage: {
        title: "Select Stage",
        tree: []
    },
    char: {
        title: "Select Character",
        tree: []
    },
    diff: {
        title: "Select Difficulty",
        tree: []
    },
    spell: {
        compact: true,
        title: "Select Spell",
        tree: []
    },
    input: {
        tree: []
    },
    main: {
        tree: [{
            id: "start",
            title: "Game Start",
            description: "Start playing the main game",
            submenu: "diff",
            states: { gameType: "standard" }
        }, {
            id: "extra",
            title: "Extra Start",
            description: "Not yet",
            isEnabled: function () {
                return false;
            },
            action: function () {
                this.startGame()
            },
            states: { gameType: "extra", char: "nBarashou" }
        }, {
            id: "spell",
            title: "Spell Practice",
            description: "Start practicing spell attacks",
            submenu: "char",
            states: { gameType: "spell" }
        }, {
            id: "options",
            title: "Options",
            description: "Just a couple of tweaks",
            submenu: {
                tree: [{
                    id: "sound_on",
                    title: "Sound",
                    description: "Enable sounds",
                    control: "toggle",
                    statePath: "sound.enabled"
                }, {
                    id: "volume",
                    title: "SFX Volume",
                    description: "Volume of sound effects",
                    control: "slider",
                    statePath: "sound.volume_sfx",
                    stateNames: {
                        "0": "Off"
                    }
                }, {
                    id: "video_gradients",
                    title: "Gradients",
                    description: "Enable gradients in text (causes lower framerate)",
                    control: "toggleThree",
                    statePath: "video.gradients",
                    stateNames: {
                        "Partial": "Auto"
                    },
                    vpField: "gradients"
                }, {
                    id: "video_world_sync",
                    title: "Timer Sync",
                    description: "Synchronise world timer with the framerate",
                    control: "toggle",
                    statePath: "video.world_sync"
                }]
            }
        }, {
            id: "controls",
            title: "Controls",
            description: "See key bindings",
            submenu: "input"
        }, {
            id: "quit",
            title: "Quit",
            description: "Back to the reality",
            action: function () {
                window.location = document.referrer || "about:blank";
            }
        }],
    },
    pause: {
        tree: [{
            isVisible: function () {
                return this.vp.world && this.vp.world.continueMode && this.vp.world.continuable;
            },
            title: "Continue",
            action: function () {
                this.vp.world.setPause(false);
                this.vp.world.player.useContinue();
                this.resetLocation();
            }
        }, {
            isVisible: function () {
                return this.vp.world && !this.vp.world.continueMode;
            },
            title: "Resume",
            shortcut: "Escape",
            action: function () {
                this.vp.world.setPause(false);
                this.resetLocation();
            }
        }, {
            title: "Restart",
            shortcut: "KeyR",
            action: function () {
                var diff = this.vp.world.difficulty;
                var spell = this.vp.world.spell;
                var char = this.vp.world.player.name;
                this.fadeOut = new Date().getTime();
                this.vp.world = new World(this.vp);
                this.vp.world.setPlayer(char);
                if (spell) {
                    this.vp.world.startSpellPractice(diff, spell);
                } else if (DIFF[diff].hidden) {
                    this.vp.world.startExtra(diff);
                } else {
                    this.vp.world.startStage(1, diff);
                }
                this.resetLocation();
            }
        }, {
            title: "To Main Menu",
            shortcut: "KeyQ",
            action: function () {
                this.vp.world.destroy();
                this.resetLocation();
            }
        }]
    }
};


for (var i in STAGE) {
    if (!STAGE[i].extra) {
        MENU.stage.tree.push({
            id: "stg_" + (+i + 1),
            states: {stage: +i + 1},
            title: "Stage " + (+i + 1),
            description: STAGE[i].title,
            action: "startGame"
        });
    }
}
for (var i in CHAR) {
    if (CHAR[i].playable) {
        MENU.char.tree.push({
            id: "char_" + i,
            states: {char: i},
            title: CHAR[i].name,
            description: CHAR[i].description,
            action: "onCharSelect"
        });
    }
}
for (var i in DIFF) {
    if (!DIFF[i].hidden) {
        MENU.diff.tree.push({
            id: "diff_" + i,
            states: {difficulty: +i},
            title: DIFF[i].name,
            description: DIFF[i].description,
            submenu: MENU.char
        });
    }
}
var spellNumber = 0;
for (var i in SPELL) {
    spellNumber = SPELL[i].number || spellNumber;
    for (var j in SPELL[i].names) {
        if (SPELL[i].names[j]) {
            MENU.spell.tree.push({
                id: "spell_" + spellNumber,
                states: {difficulty: +j, spell: SPELL[i]},
                spell: SPELL[i],
                title: "#" + Util.fillWithLeadingZeros(spellNumber, 3) + " " + SPELL[i].names[j] + " (" + DIFF[j].letter + ")",
                action: "startGame"
            });
            ++spellNumber;
        }
    }
}
