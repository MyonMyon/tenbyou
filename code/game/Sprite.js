var SPRITE = {
    player: {
        file: "player.png",
        frameWidth: 32,
        frameHeight: 32,
        barashou: {
            x: 0,
            y: 0,
            frames: 4,
            interval: 0.05
        }
    },
    projectile: {
        file: "projectile.png",
        frameWidth: 32,
        frameHeight: 32,
        frameMargin: 1,
        orbBlue: {
            x: 0,
            y: 0,
            frames: 4,
            interval: 0.2
        },
        catGreen: {
            x: 0,
            y: 4
        },
        catMagenta: {
            x: 0,
            y: 5
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
        staticBlue: {
            x: 5,
            y: 0
        },
        staticPurple: {
            x: 6,
            y: 0
        },
        staticRed: {
            x: 7,
            y: 0
        },
        staticLime: {
            x: 8,
            y: 0
        },
        kunaiBlue: {
            x: 5,
            y: 1,
            hitbox: 0.4,
            rotate: true
        },
        kunaiPurple: {
            x: 6,
            y: 1,
            hitbox: 0.4,
            rotate: true
        },
        kunaiRed: {
            x: 7,
            y: 1,
            hitbox: 0.4,
            rotate: true
        },
        strikeBlue: {
            x: 5,
            y: 2,
            hitbox: 0.75,
            rotate: true
        },
        strikePurple: {
            x: 6,
            y: 2,
            hitbox: 0.75,
            rotate: true
        },
        strikeRed: {
            x: 7,
            y: 2,
            hitbox: 0.75,
            rotate: true
        },
        sealBlue: {
            x: 5,
            y: 3,
            rotate: true
        },
        sealPurple: {
            x: 6,
            y: 3,
            rotate: true
        },
        sealRed: {
            x: 7,
            y: 3,
            rotate: true
        },
        sealGray: {
            x: 9,
            y: 3,
            rotate: true
        },
        cometBlue: {
            x: 5,
            y: 4,
            height: 2,
            rotate: true
        },
        cometPurple: {
            x: 6,
            y: 4,
            height: 2,
            rotate: true
        },
        cometRed: {
            x: 7,
            y: 4,
            height: 2,
            rotate: true
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
        frameHeight: 32,
        kedama: {
            file: "g_kedama.png",
            frameWidth: 128,
            frameHeight: 128,
            x: 0,
            y: 0,
            frames: 4,
            interval: 0.2,
            hitbox: 1
        },
        kedamaMinion: {
            x: 0,
            y: 0,
            frames: 4,
            interval: 0.2,
            hitbox: 1
        },
        orb: {
            file: "orb.png",
            frameWidth: 128,
            frameHeight: 128,
            x: 0,
            y: 0
        },
        orbMinion: {
            x: 1,
            y: 0,
            frames: 3,
            interval: 0.2,
            hitbox: 0.5
        },
        landMine: {
            x: 1,
            y: 3,
            hitbox: 1
        },
        fairyRed: {
            x: 2,
            y: 0,
            frames: 2,
            interval: 0.3,
            hitbox: 0.5,
            mirror: true
        },
        fairyBlue: {
            x: 3,
            y: 0,
            frames: 2,
            interval: 0.3,
            hitbox: 0.5,
            mirror: true
        },
        crow: {
            x: 4,
            y: 0,
            frames: 2,
            interval: 0.3
        },
        okuu: {
            file: "okuu.png",
            frameWidth: 64,
            frameHeight: 64,
            x: 0,
            y: 0,
            hitbox: 0.25
        },
        lily: {
            file: "lily.png",
            frameWidth: 64,
            frameHeight: 64,
            x: 0,
            y: 0,
            hitbox: 0.25
        },
        stoneFace: {
            x: 5,
            y: 0,
            width: 2,
            height: 2,
            hitbox: 0.75
        }
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
