var SPRITE = {
    player: {
        nBarashou: {
            file: "player/nb.png",
            frameWidth: 32,
            frameHeight: 32,
            x: 0,
            y: 0,
            frames: 4,
            interval: 0.05,
            states: {
                idle: {
                    x: 0,
                    y: 0
                },
                focused: {
                    x: 1,
                    y: 0
                },
                moveLeft: {
                    x: 3,
                    y: 0
                },
                moveRight: {
                    x: 2,
                    y: 0
                }
            },
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
        },
        freyja: {
            file: "player/ff.png",
            frameWidth: 32,
            frameHeight: 32,
            x: 0,
            y: 0,
            frames: 1,
            interval: 0.05,
            states: {
                idle: {
                    x: 0,
                    y: 0
                },
                focused: {
                    x: 0,
                    y: 0
                },
                moveLeft: {
                    x: 0,
                    y: 0
                },
                moveRight: {
                    x: 0,
                    y: 0
                }
            }
        }
    },
    projectile: {
        file: "projectile/projectile.png",
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
            file: "projectile/nuclear.png",
            frameWidth: 128,
            frameHeight: 128
        }
    },
    beam: {
        file: "projectile/beam.png",
        frameWidth: 64,
        frameHeight: 64,
        frameMargin: 1,
        beamBlue: {
            x: 0,
            y: 0,
            frames: 2,
            interval: 0.05,
            hitbox: 0.5
        },
        beamBlueSpecial: {
            x: 0,
            y: 0,
            hitbox: 2
        }
    },
    bonus: {
        file: "bonus.png",
        frameWidth: 48,
        frameHeight: 48,
        powerLarge: {
            x: 0,
            y: 1
        },
        power: {
            x: 0,
            y: 1
        },
        point: {
            x: 1,
            y: 0
        },
        pointSmall: {
            x: 1,
            y: 1
        },
        bomb: {
            x: 2,
            y: 0
        },
        bombPart: {
            x: 2,
            y: 1
        },
        life: {
            x: 3,
            y: 0
        },
        lifePart: {
            x: 3,
            y: 1
        },
        gauge: {
            x: 4,
            y: 0
        },
        debuff: {
            x: 6,
            y: 0
        },
        debuffSmall: {
            x: 6,
            y: 1
        },
        offScreen: {
            y: 2
        }
    },
    enemy: {
        file: "enemy/enemy.png",
        frameWidth: 32,
        frameHeight: 32,
        kedama: {
            file: "enemy/g_kedama.png",
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
            file: "enemy/orb.png",
            frameWidth: 128,
            frameHeight: 128,
            x: 0,
            y: 0
        },
        orbMinion: {
            x: 1,
            y: 0,
            frames: 3,
            interval: 0.08,
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
            file: "enemy/okuu.png",
            frameWidth: 64,
            frameHeight: 64,
            x: 0,
            y: 0,
            hitbox: 0.25
        },
        lily: {
            file: "enemy/lily.png",
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
        file: "bg/menu.png"
    },
    uiBackground: {
        file: "bg/ui.png"
    },
    spellBackground: {
        file: "bg/spell/default.jpg",
        speed: 30
    },
    spellStrip: {
        file: "bg/spell/scline.png"
    }
};
