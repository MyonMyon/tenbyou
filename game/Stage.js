var STAGE = [{
        title: "Wonderland Inbound",
        description: "Low entropy and large quantity of microstates.",
        appearanceSecond: 0.2,
        background: {
            file: "bg/stage/1.jpg",
            speed: 300
        },
        events: [{
                substage: 0,
                second: 4,
                func: function () {
                    this.vp.showItemLine();
                }
            }, {
                substage: 0,
                second: 4,
                repeatInterval: function (world) {
                    return 2 - (world.difficulty) * 0.4;
                },
                repeatCount: function (world) {
                    return 3 + 2 * (world.difficulty + 1);
                },
                func: function () {
                    for (var i = 0; i < 2; i++) { //two sides
                        var fairy = new Enemy(this,
                                (i === 0 ? -this.width - 4 : this.width + 4) / 2,
                                -this.height / 2 - 2,
                                (i === 0 ? 20 : -20),
                                25,
                                (i === 0 ? -7.5 : 7.5),
                                0,
                                2, 1, i ? "fairyBlue" : "fairyRed");
                        fairy.addDrops(i ? "point" : "power"); //type, amount (optional)
                        if (Math.random() < 0.1) {
                            fairy.addDrops("powerLarge"); //10% chance of big power item;
                        }
                        fairy.bulletSprite = i ? "static.blue" : "static.red"; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
                        fairy.eventChain.addEvent(function () { //and now let's code the fairy's shooting event!
                            var bullet = this.shootProjectileAt(this.world.player, 0, 0, 100, 2, this.bulletSprite);
                            bullet.behavior = function () {
                                if (this.world.vectorLength(this.x1, this.y1) > 60) {
                                    this.setVectors(null, null, null, null, 0, 0);
                                }
                            };
                        }, 0.7, 1 - this.difficulty * 0.15, Infinity);
                    }
                }
            }, {
                substage: 0,
                second: 16,
                repeatInterval: 1.2,
                repeatCount: 10,
                func: function (iter) {
                    var x = this.width * (-1 / 4 + Math.min(iter, 9 - iter) % 5 / 8);
                    var y = -this.height * 0.45;
                    var kedama = new Enemy(this, x, y, 0, 12, 0, 0, 4, 12, "kedamaMinion");
                    kedama.addDrops("point", 2);
                    kedama.eventChain.addEvent(function (i) {
                        var shootInterval = 30 - this.world.difficulty * 6;
                        if (i % shootInterval >= 8) {
                            //pause every 8 shots
                            return;
                        }
                        if (i % shootInterval === 0) {
                            this.targetAngle = this.world.angleBetweenEntities(this, {
                                x: this.world.player.x,
                                y: Math.max(this.y, this.world.player.y)});
                        }
                        this.shootProjectile(this.targetAngle, this.width, 50 + this.world.difficulty * 10, 0, 1.5, "kunai.blue", true);
                    }, 1.5, 0.1, Infinity);
                    kedama.appearanceTime = 1;
                }
            }, {
                substage: 0,
                second: 32,
                repeatInterval: 1.2,
                repeatCount: 20,
                func: function (iter) {
                    var r = (iter % 10 < 5) ? -1 : 1;
                    for (var p = 0; p < 2; ++p) {
                        var y = -this.height / 2 - 5;
                        var x = r * (this.width / 3 + p * 10);
                        var kedamaPaired = new Enemy(this, x, y, -r * 2, 30, -r * 12, 0, 4, 12, "kedamaMinion");
                        kedamaPaired.addDrops(p ? "point" : "power");
                        kedamaPaired.eventChain.addEvent(function (i) {
                            this.shootProjectileAt(this.world.player, this.width, 60, 0, 2, "kunai.purple");
                        }, 0.5, 2 - this.difficulty * 0.2, Infinity);
                    }
                }
            }, {
                substage: 0,
                second: 60,
                boss: {
                    char: "kedama",
                    attacks: [
                        [NON_SPELL.kedamaSpam, false],
                        [SPELL.kedamaBeta]
                    ]
                }
            }, {
                substage: 1,
                second: 4,
                repeatInterval: 1.5,
                repeatCount: 15,
                func: function (iter) {
                    var x = Math.random() * (this.width - 40) - this.width / 2 + 20;
                    var y = -this.height / 2 + 20;
                    if (iter % 5 < 3) {
                        var orb = new Enemy(this, x, y, 0, 6, 0, 0, 2, 25, "orbMinion");
                        orb.appearanceTime = 1;
                        orb.addDrops("power");
                        orb.addDrops("point");
                        orb.eventChain.addEvent(function (i) {
                            this.shootProjectileAt(this.world.player, this.width, 50 + this.world.difficulty * 10, 0, 2, "strike.red");
                        }, 1.5, 0.75 - this.difficulty * 0.1, Infinity);
                    } else {
                        var mine = new Enemy(this, x, y, 0, 3, 0, 0, 4, 1, "landMine");
                        mine.appearanceTime = 1;
                        mine.onDestroy = function () {
                            this.arcProjectiles(function () {
                                return Math.random() * Math.PI * 2;
                            }, null, 8 + this.world.difficulty * 2, 0, function () {
                                return Math.random() * 15 + 2;
                            }, 30, 3, "strike.purple");
                        };
                    }
                }
            }, {
                substage: 1,
                second: 36,
                repeatInterval: 0.5,
                repeatCount: 50,
                func: function (iter) {
                    if (iter === 0) {
                        this.removeEnemies(); //cleanup after orbs
                    }
                    var stone = new Enemy(this,
                            this.width * (Math.random() - 0.5) * 0.8, -this.height / 2 - 3,
                            0, 30 + this.difficulty * 6,
                            0, 60,
                            4, 2, "stoneFace");
                    stone.addDrops("point");
                }
            }, {
                substage: 1,
                second: 40,
                repeatInterval: 1,
                repeatCount: 20,
                func: function (iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var x = r * (this.width / 2 - 10);
                    var y = Math.min(this.height / 2 - 2,
                            Math.max(-this.height / 2 + 2,
                                    this.player.y - 15 + Math.random() * 30));
                    var sideFairy = new Enemy(this, x, y, -r * 15, 0, r * 15, 0, 2, 1, "fairyBlue");
                    sideFairy.appearanceTime = 1;
                    sideFairy.addDrops("point", 2);
                    sideFairy.eventChain.addEvent(function (i) {
                        new Projectile(this.world,
                                this.x, this.y,
                                -r * 30, 0,
                                0, 0,
                                2 + this.world.difficulty * 0.25, false, "strike.blue");
                    }, 1.2, 0.2, Infinity);
                }
            }, {
                substage: 1,
                second: 64,
                repeatInterval: 2,
                repeatCount: 10,
                func: function (iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var fairyTurret = new Enemy(this,
                            r * (this.width / 2 + 1), -this.height / 2 - 1,
                            -r * 30, 30,
                            r * 15, -15,
                            2, 1, "fairyRed");
                    fairyTurret.addDrops("power");
                    fairyTurret.eventChain.addEvent(function (i) {
                        this.savedPoint = {x: this.x, y: this.y};
                    }, 1.7, 0, 0);
                    fairyTurret.eventChain.addEvent(function (i) {
                        var a = Util.toAngle((iter % 2) ? "e" : "w") + Math.PI / 2 * -r * ((i - 2) / 12);
                        var p = new Projectile(this.world,
                                this.savedPoint.x, this.savedPoint.y,
                                Math.cos(a) * 10, Math.sin(a) * 10,
                                Math.cos(a) * 15, Math.sin(a) * 15,
                                3 + this.world.difficulty * 0.5, false, "strike.red");
                    }, 1.8, 0.1, 17);
                }
            }, {
                substage: 1,
                second: 86,
                boss: {
                    char: "orb",
                    attacks: [
                        [NON_SPELL.orbSpam],
                        [SPELL.orbAlpha],
                        [NON_SPELL.orbSpamCopyPasta],
                        [SPELL.orbBeta]
                    ],
                    last: true
                }
            }]
    }, {
        title: "Misty Lake",
        description: "Refreshing, cool and good.",
        appearanceSecond: 4,
        background: {
            file: "bg/stage/2.jpg",
            speed: 60
        },
        events: [{
                substage: 0,
                second: 4,
                repeatInterval: 1,
                repeatCount: 12,
                func: function (iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var fairyTurret = new Enemy(this,
                            r * (this.width / 2 + 1), -this.height / 2 - 1,
                            -r * 30, 30,
                            r * 15, -15,
                            2, 1, "fairyRed");
                    fairyTurret.addDrops("power");
                    fairyTurret.eventChain.addEvent(function (i) {
                        this.savedPoint = {x: this.world.player.x, y: this.world.player.y};
                        this.setVectors(null, null, 0, 0, 0, 0);
                    }, 0.5, 0, 0);
                    fairyTurret.eventChain.addEvent(function () {
                        var a = this.shootProjectileAt(this.savedPoint, 4, 50, 0, 0);
                        for (var i = 0; i < 2; ++i) {
                            var b = new Projectile(this.world, 0, 0, 0, 0, 0, 0, 2, false, i ? "strike.blue" : "strike.red");
                            b.setAnchor(a, true);
                            b.maxDistance = i ? -10 : 10;
                            b.behavior = function () {
                                if (this.anchor) {
                                    var angle = this.anchor.getAngle();
                                    var d = Math.sin(this.relTime() * 4) * this.maxDistance;
                                    this.x0 = Math.cos(angle - Math.PI / 2) * d;
                                    this.y0 = Math.sin(angle - Math.PI / 2) * d;
                                }
                            };
                        }
                    }, 0.6, 0.0666, 15 + this.difficulty * 5);
                    fairyTurret.eventChain.addEvent(function (i) {
                        this.setVectors(null, null, 0, 0, this.x < 0 ? -15 : 15, -15);
                    }, 2.7, 0, 0);
                }
            }, {
                substage: 0,
                second: 19,
                repeatInterval: 2,
                repeatCount: 10,
                func: function (iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var eye = new Enemy(this,
                            r * (this.width / 2 + 1), -this.height / 2 - 1,
                            -r * 40, 20,
                            r * 3, -5,
                            3, 10, "eye");
                    eye.addDrops("power");
                    eye.addDrops("point", 2);
                    eye.eventChain.addEvent(function () {
                        var a = this.shootProjectileAt(this.world.player, 5, 50, 0, 0);
                        var count = 4 + this.world.difficulty * 2;
                        a.arcProjectiles(Util.toAngle("s"), null, count, 0, 10, 0, 2, ["static.yellow", "static.red"], true);
                    }, 0.2, 1, Infinity);
                }
            }, {
                substage: 0,
                second: 43,
                repeatInterval: function (world) {
                    return 2 - (world.difficulty) * 0.4;
                },
                repeatCount: function (world) {
                    return 3 + 2 * (world.difficulty + 1);
                },
                func: function () {
                    for (var i = 0; i < 2; i++) { //two sides
                        var fairy = new Enemy(this,
                                (i === 0 ? -this.width - 4 : this.width + 4) / 2,
                                -this.height / 2 - 2,
                                (i === 0 ? 20 : -20),
                                25,
                                (i === 0 ? -7.5 : 7.5),
                                0,
                                2, 1, i ? "fairyBlue" : "fairyRed");
                        fairy.addDrops(i ? "point" : "power"); //type, amount (optional)
                        if (Math.random() < 0.1) {
                            fairy.addDrops("powerLarge"); //10% chance of big power item;
                        }
                        fairy.bulletSprite = i ? "eyeBlue" : "eyeRed"; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
                        fairy.eventChain.addEvent(function () { //and now let's code the fairy's shooting event!
                            var bullet = this.shootProjectileAt(this.world.player, 0, 0, 75, 2, this.bulletSprite);
                            bullet.behavior = function () { //and bullet's behavior (executes every tick)!
                                if (this.world.vectorLength(this.x1, this.y1) > 45) //if speed > 45 unit/s
                                    this.setVectors(null, null, null, null, 0, 0); //stop accelerating
                            };
                            bullet.eventChain.addEvent(function (iter) {
                                if (iter < 2) {
                                    this.headToEntity(this.world.player, 0, 60); //stop and refresh directions
                                    this.sprite.set((this.sprite.name === "eyeBlue") ? "eyeRed" : "eyeBlue"); //swap sprites for bullets
                                } else if (iter === 2) {
                                    this.sprite.set("orbBlue");
                                }
                            }, null, 1.7, 3, true);
                        }, 0.7, 1 - this.difficulty * 0.15, Infinity);
                    }
                }
            }, {
                substage: 0,
                second: 55,
                boss: {
                    char: "kedama",
                    attacks: [
                        [NON_SPELL.kedamaSpam, true],
                        [SPELL.kedamaAlpha]
                    ]
                }
            }, {
                substage: 1,
                second: 2,
                repeatInterval: 2,
                repeatCount: 5,
                func: function (iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var eye = new Enemy(this,
                            r * (this.width / 2 + 1), -this.height / 2 - 1,
                            -r * 40, 20,
                            r * 3, -5,
                            3, 10, "eye");
                    eye.addDrops("power", 2);
                    eye.addDrops("point", 3);
                    eye.eventChain.addEvent(function ( iter) {
                        var a = this.shootProjectileAt(this.world.player, 5, 50, 0, 0);
                        var count = 4 + this.world.difficulty * 2;
                        var b = a.arcProjectiles(Util.toAngle("s"), null, count, 0, 0, 0, 2, ["static.yellow", "static.red"], true);
                        for (var i in b) {
                            var angle = i / count * Math.PI * 2;
                            b[i].setPolarVectors(angle, 1, 0, 20, Math.PI / 4 * (iter % 2 ? -1 : 1), -10);
                        }
                    }, 0.2, 1, Infinity);
                }
            }, {
                substage: 1,
                second: 18,
                boss: {
                    char: "okuu",
                    attacks: [
                        [SPELL.okuuAlpha]
                    ],
                    last: true
                }
            }]
    }, {
        title: "TEST",
        description: "There is nothing here. Be patient.",
        appearanceSecond: 4,
        background: {
            file: "bg/stage/2.jpg",
            speed: 60
        },
        events: [{
                substage: 0,
                second: 4,
                repeatInterval: 1,
                repeatCount: 12,
                func: function (iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var fairyTurret = new Enemy(this,
                            r * (this.width / 2 + 1), -this.height / 2 - 1,
                            -r * 30, 30,
                            r * 15, -15,
                            2, 1, "fairyRed");
                    fairyTurret.addDrops("power");
                    fairyTurret.eventChain.addEvent(function (iter) {
                        this.setVectors(null, null, 0, 0, 0, 0);
                        var p = this.shootProjectileAt(this.world.player, 5, 0, 0, 2, "strike.red");
                        p.approachEntity(this.world.player, 60 + this.world.difficulty * 20);
                        p.behavior = function () {
                            if (this.getSpeed() < 1) {
                                var px = this.shootProjectile(0, 0, 0, 0, 0, "nuclear");
                                px.setWidthVectors(2, 20, -32 + this.world.difficulty * 6);
                                px.behavior = function () {
                                    if (this.width < 0) {
                                        this.remove();
                                    }
                                };
                                this.remove();
                            }
                        };
                        if (iter === 2) {
                            e.setVectors(null, null, 0, 0, e.x < 0 ? -15 : 15, -15);
                        }
                    }, 1.5, 0.5, 3);
                }
            }, {
                substage: 0,
                second: 20,
                repeatInterval: 1,
                repeatCount: 12,
                func: function (iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var fairyTurret = new Enemy(this,
                            r * (this.width / 2 + 1), -this.height / 2 - 1,
                            -r * 30, 30,
                            r * 15, -15,
                            2, 1, "fairyBlue");
                    fairyTurret.addDrops("point");
                    fairyTurret.eventChain.addEvent(function (iter) {
                        this.setVectors(null, null, 0, 0, 0, 0);
                        this.arcProjectiles(
                                Util.toAngle(this.x > 0 ? "sw" : "se"),
                                3 * Math.PI / 2, 9 + 8 * this.world.difficulty,
                                5, [45, 35, 25, 35], 0, 2.5,
                                ["static.red", "static.lime", "static.blue", "static.lime"]);
                        if (iter === 2) {
                            this.setVectors(null, null, 0, 0, this.x < 0 ? -15 : 15, -15);
                        }
                    }, 1.5, 0.3, 3);
                }
            }, {
                substage: 0,
                second: 24,
                boss: {
                    char: "lily",
                    attacks: [],
                    last: true
                }
            }]
    }, {
        extra: 4,
        title: "Test",
        description: "You're not gonna see something here.",
        appearanceSecond: 4,
        background: {
            file: "bg/stage/2.jpg",
            speed: 2
        },
        events: [{
                substage: 1,
                second: 4,
                boss: {
                    char: "okuu",
                    attacks: [
                        [SPELL.okuuAlpha]
                    ],
                    last: true
                }
            }]
    }];
