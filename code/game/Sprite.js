var SPRITE = {
    player: {
        file: "player.png",
        frameWidth: 32,
        frameHeight: 32
    },
    projectile: {
        file: "projectile.png",
        frameWidth: 32,
        frameHeight: 32
    },
    nuclear: {
        file: "nuclear.png",
        frameWidth: 128,
        frameHeight: 128
    },
    bonus: {
        file: "bonus.png",
        frameWidth: 48,
        frameHeight: 48,
        large: {
            y: 0
        },
        small: {
            y: 1
        },
        power: {
            x: 0
        },
        point: {
            x: 1
        },
        bombs: {
            x: 2
        },
        lives: {
            x: 3
        },
        gauge: {
            x: 4
        },
        offScreen: {
            y: 2
        }
    },
    enemy: {
        file: "enemy.png",
        frameWidth: 32,
        frameHeight: 32
    },
    particle: {
        file: "particle.png",
        frameWidth: 32,
        frameHeight: 32,
        splash: {
            x: 0,
            y: 0,
            frames: 5,
            interval: 0.2
        },
        spark: {
            x: 1,
            y: 0,
            frames: 5,
            interval: 0.1
        }
    },
    gui: {
        file: "gui.png",
        frameWidth: 24,
        frameHeight: 24
    },
    menuBackground: {
        file: "menubg.png"
    },
    uiBackground: {
        file: "uibg.png"
    },
    spellBackground: {
        file: "bgspell.jpg"
    },
    spellStrip: {
        file: "scline.png"
    }
};
