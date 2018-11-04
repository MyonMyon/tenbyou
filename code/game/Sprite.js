var SPRITE = {
    player: {
        file: "player.png",
        frameWidth: 32,
        frameHeight: 32
    },
    projectile: {
        file: "projectile.png",
        frameWidth: 32,
        frameHeight: 32,
        orbBlue: {
            x: 0,
            y: 0,
            frames: 4,
            interval: 0.2
        },
        cometPurple: {
            x: 0,
            y: 4,
            hitbox: 0.5,
            rotate: true
        },
        kunaiBlue: {
            x: 0,
            y: 5,
            hitbox: 0.4,
            rotate: true
        },
        kunaiRed: {
            x: 1,
            y: 5,
            hitbox: 0.4,
            rotate: true
        },
        strikeBlue: {
            x: 0,
            y: 6,
            hitbox: 0.75,
            rotate: true
        },
        strikePurple: {
            x: 1,
            y: 6,
            hitbox: 0.75,
            rotate: true
        },
        strikeRed: {
            x: 2,
            y: 6,
            hitbox: 0.75,
            rotate: true
        },
        sealBlue: {
            x: 0,
            y: 7,
            rotate: true
        },
        sealPurple: {
            x: 1,
            y: 7,
            rotate: true
        },
        sealRed: {
            x: 2,
            y: 7,
            rotate: true
        },
        sealGray: {
            x: 3,
            y: 7,
            rotate: true
        },
        coin: {
            x: 1,
            y: 0,
            frames: 4,
            interval: 0.1
        },
        coinSpecial: {
            x: 2,
            y: 0,
            frames: 2,
            interval: 0.3
        },
        eyeRed: {
            x: 3,
            y: 0,
            frames: 7,
            interval: 0.15
        },
        eyeBlue: {
            x: 4,
            y: 0,
            frames: 7,
            interval: 0.15
        },
        catGreen: {
            x: 5,
            y: 0
        },
        catMagenta: {
            x: 5,
            y: 1
        },
        staticRed: {
            x: 6,
            y: 0
        },
        staticBlue: {
            x: 7,
            y: 0
        },
        nuclear: {
            file: "nuclear.png",
            frameWidth: 128,
            frameHeight: 128
        }
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
        frameWidth: 64,
        frameHeight: 64,
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
