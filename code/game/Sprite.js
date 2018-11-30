var SPRITE = {
    player: {
        file: "player.png",
        frameWidth: 32,
        frameHeight: 32,
        barashou: {
            x: 0,
            y: 0,
            frames: 4,
            interval: 0.05,
            weapons: {
                turret: {
                    x: 0,
                    y: 4,
                    width: 0.5,
                    height: 0.5
                },
                turretAimed: {
                    x: 0.5,
                    y: 4,
                    width: 0.5,
                    height: 0.5
                },
                turretAuto: {
                    x: 1,
                    y: 4,
                    width: 0.5,
                    height: 0.5
                }
            }
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
        static: {
            x: 5,
            y: 0
        },
        kunai: {
            x: 5,
            y: 1,
            hitbox: 0.4,
            rotate: true
        },
        strike: {
            x: 5,
            y: 2,
            hitbox: 0.75,
            rotate: true
        },
        seal: {
            x: 5,
            y: 3,
            rotate: true
        },
        comet: {
            x: 5,
            y: 4,
            height: 2,
            rotate: true
        },
        red: {
            x: 1
        },
        yellow: {
            x: 2
        },
        lime: {
            x: 3
        },
        cyan: {
            x: 4
        },
        blue: {
            x: 5
        },
        purple: {
            x: 6
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
        eye: {
            x: 0,
            y: 4,
            width: 2,
            height: 2,
            frames: 3,
            interval: 0.5,
            hitbox: 0.6,
            frameReverse: true
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
        snoop: {
            file: "sg.png",
            frameWidth: 48,
            frameHeight: 48,
            x: 0,
            y: 0,
            frames: 8,
            interval: 0.1,
            hitbox: 0.2,
            frameReverse: true
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
        file: "bgspell.jpg",
        speed: 30
    },
    spellStrip: {
        file: "scline.png"
    }
};
