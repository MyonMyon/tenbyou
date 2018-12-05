var STAGE = [{
        title: "Wonderland Inbound",
        description: "Low entropy and so much microstates.",
        appearanceSecond: 0.2,
        background: {
            file: "bg1.jpg",
            speed: 300
        },
        events: [{
                substage: 0,
                second: 4,
                func: function (world) {
                    world.vp.showItemLine();
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
                func: function (world) {
                    for (var i = 0; i < 2; i++) { //two sides
                        var fairy = new Enemy(world,
                                (i === 0 ? -world.width - 4 : world.width + 4) / 2,
                                -world.height / 2 - 2,
                                (i === 0 ? 20 : -20),
                                25,
                                (i === 0 ? -7.5 : 7.5),
                                0,
                                2, 5, i ? "fairyBlue" : "fairyRed");
                        fairy.addDrops(i ? "point" : "power", !i, 1); //type, size (false — big), amount
                        if (Math.random() < 0.1)
                            fairy.addDrops("power", false, 1); //10% chance of big power item;
                        fairy.bulletSprite = i ? "static.blue" : "static.red"; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
                        fairy.eventChain.addEvent(function (f) { //and now let's code the fairy's shooting event!
                            var bullet = f.shootProjectileAt(world.player, 0, 0, 100, 2, f.bulletSprite);
                            bullet.behavior = function () {
                                if (world.vectorLength(this.x1, this.y1) > 60) {
                                    this.setVectors(null, null, null, null, 0, 0);
                                }
                            };
                        }, 0.7, 1 - world.difficulty * 0.15, Infinity);
                    }
                }
            }, {
                substage: 0,
                second: 16,
                repeatInterval: 1.2,
                repeatCount: 10,
                func: function (world, iter) {
                    var x = world.width * (-1 / 4 + Math.min(iter, 9 - iter) % 5 / 8);
                    var y = -world.height * 0.45;
                    var kedama = new Enemy(world, x, y, 0, 12, 0, 0, 4, 8, "kedamaMinion");
                    kedama.addDrops("point", false, 2);
                    kedama.eventChain.addEvent(function (s, i) {
                        var shootInterval = 30 - s.world.difficulty * 6;
                        if (i % shootInterval >= 8) {
                            //pause every 8 shots
                            return;
                        }
                        if (i % shootInterval === 0) {
                            s.targetPos = {
                                x: s.world.player.x,
                                y: Math.max(s.y, s.world.player.y)};
                        }
                        s.shootProjectileAt(s.targetPos, s.width, 50 + s.world.difficulty * 10, 0, 1.5, "kunai.blue");
                    }, 1.5, 0.1, Infinity);
                    kedama.appearanceTime = 1;
                }
            }, {
                substage: 0,
                second: 32,
                repeatInterval: 1.2,
                repeatCount: 20,
                func: function (world, iter) {
                    var r = (iter % 10 < 5) ? -1 : 1;
                    for (var p = 0; p < 2; ++p) {
                        var y = -world.height / 2 - 5;
                        var x = r * (world.width / 3 + p * 10);
                        var kedamaPaired = new Enemy(world, x, y, -r * 2, 30, -r * 12, 0, 4, 8, "kedamaMinion");
                        kedamaPaired.addDrops(p ? "point" : "power", !p, 1);
                        kedamaPaired.eventChain.addEvent(function (s, i) {
                            s.shootProjectileAt(s.world.player, s.width, 60, 0, 2, "kunai.purple");
                        }, 0.5, 2 - world.difficulty * 0.2, Infinity);
                    }
                }
            }, {
                substage: 0,
                second: 60,
                func: function (world) {
                    eventKedamaMidboss(world, false);
                }
            }, {
                substage: 1,
                second: 4,
                repeatInterval: 1.5,
                repeatCount: 15,
                func: function (world, iter) {
                    var x = Math.random() * (world.width - 40) - world.width / 2 + 20;
                    var y = -world.height / 2 + 20;
                    if (iter % 5 < 3) {
                        var orb = new Enemy(world, x, y, 0, 6, 0, 0, 2, 20, "orbMinion");
                        orb.appearanceTime = 1;
                        orb.addDrops("power", true, 1);
                        orb.addDrops("point", false, 1);
                        orb.eventChain.addEvent(function (s, i) {
                            s.shootProjectileAt(s.world.player, s.width, 50 + s.world.difficulty * 10, 0, 2, "strike.red");
                        }, 1.5, 0.75 - world.difficulty * 0.1, Infinity);
                    } else {
                        var mine = new Enemy(world, x, y, 0, 3, 0, 0, 4, 1, "landMine");
                        mine.appearanceTime = 1;
                        mine.onDestroy = function () {
                            for (var i = 0; i < 8 + this.world.difficulty * 2; i++) {
                                var sx = (Math.random() - 0.5) * 30;
                                var sy = (Math.random() - 0.5) * 30;
                                new Projectile(this.world, this.x, this.y, sx, sy, sx * 1.5, sy * 1.5, 3, false, "strike.purple");
                            }
                        };
                    }
                }
            }, {
                substage: 1,
                second: 36,
                repeatInterval: 0.5,
                repeatCount: 50,
                func: function (world, iter) {
                    if (iter === 0) {
                        world.removeEnemies(); //cleanup after orbs
                    }
                    var stone = new Enemy(world,
                            world.width * (Math.random() - 0.5) * 0.8, -world.height / 2 - 3,
                            0, 30 + world.difficulty * 6,
                            0, 60,
                            4, 2, "stoneFace");
                    stone.addDrops("point", false, 1);
                }
            }, {
                substage: 1,
                second: 40,
                repeatInterval: 1,
                repeatCount: 20,
                func: function (world, iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var x = r * (world.width / 2 - 10);
                    var y = Math.random() * (world.height - 10) - world.height / 2 + 5;
                    var sideFairy = new Enemy(world, x, y, -r * 15, 0, r * 15, 0, 2, 5, "fairyBlue");
                    sideFairy.appearanceTime = 1;
                    sideFairy.addDrops("point", false, 2);
                    sideFairy.eventChain.addEvent(function (e, i) {
                        new Projectile(e.world,
                                e.x, e.y,
                                -r * 30, 0,
                                0, 0,
                                2 + e.world.difficulty * 0.25, false, "strike.blue");
                    }, 1.2, 0.2, Infinity);
                }
            }, {
                substage: 1,
                second: 64,
                repeatInterval: 2,
                repeatCount: 10,
                func: function (world, iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var fairyTurret = new Enemy(world,
                            r * (world.width / 2 + 1), -world.height / 2 - 1,
                            -r * 30, 30,
                            r * 15, -15,
                            2, 10, "fairyRed");
                    fairyTurret.addDrops("power", true, 1);
                    fairyTurret.eventChain.addEvent(function (e, i) {
                        e.savedPoint = {x: e.x, y: e.y};
                    }, 1.7, 0, 0);
                    fairyTurret.eventChain.addEvent(function (e, i) {
                        var a = Math.PI / 2 * -r * ((i - 2) / 12);
                        var p = new Projectile(e.world,
                                e.savedPoint.x, e.savedPoint.y,
                                Math.cos(a) * 10, Math.sin(a) * 10,
                                Math.cos(a) * 15, Math.sin(a) * 15,
                                3 + e.world.difficulty * 0.5, false, "strike.red");

                    }, 1.8, 0.1, 17);
                }
            }, {
                substage: 1,
                second: 86,
                func: function (world) {
                    eventOrb(world);
                }
            }]
    }, {
        title: "Misty Lake",
        description: "Refreshing, cool and good.",
        appearanceSecond: 4,
        background: {
            file: "bg2.jpg",
            speed: 60
        },
        events: [{
                substage: 0,
                second: 4,
                repeatInterval: 1,
                repeatCount: 12,
                func: function (world, iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var fairyTurret = new Enemy(world,
                            r * (world.width / 2 + 1), -world.height / 2 - 1,
                            -r * 30, 30,
                            r * 15, -15,
                            2, 5, "fairyRed");
                    fairyTurret.addDrops("power", true, 1);
                    fairyTurret.eventChain.addEvent(function (e, i) {
                        e.savedPoint = {x: e.world.player.x, y: e.world.player.y};
                        e.setVectors(null, null, 0, 0, 0, 0);
                    }, 0.5, 0, 0);
                    fairyTurret.eventChain.addEvent(function (entity) {
                        var a = entity.shootProjectileAt(entity.savedPoint, 4, 50, 0, 0);
                        for (var i = 0; i < 2; ++i) {
                            var b = new Projectile(entity.world, 0, 0, 0, 0, 0, 0, 2, false, i ? "strike.blue" : "strike.red");
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
                    }, 0.6, 0.0666, 15 + world.difficulty * 5);
                    fairyTurret.eventChain.addEvent(function (e, i) {
                        e.setVectors(null, null, 0, 0, e.x < 0 ? -15 : 15, -15);
                    }, 2.7, 0, 0);
                }
            }, {
                substage: 0,
                second: 19,
                repeatInterval: 2,
                repeatCount: 10,
                func: function (world, iter) {
                    var r = (iter % 2) ? -1 : 1;
                    var eye = new Enemy(world,
                            r * (world.width / 2 + 1), -world.height / 2 - 1,
                            -r * 40, 20,
                            r * 3, -5,
                            3, 10, "eye");
                    eye.addDrops("power", true, 1);
                    eye.addDrops("point", false, 2);
                    eye.eventChain.addEvent(function (entity) {
                        var a = entity.shootProjectileAt(entity.world.player, 5, 50, 0, 0);
                        var count = 4 + entity.world.difficulty * 2;
                        for (var i = 0; i < count; ++i) {
                            var angle = i / count * Math.PI * 2;
                            var b = new Projectile(entity.world, 0, 0,
                                    Math.cos(angle) * 10,
                                    Math.sin(angle) * 10,
                                    0, 0, 2, false, i % 2 ? "static.yellow" : "static.red");
                            b.setAnchor(a);
                        }
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
                func: function (world) {
                    for (var i = 0; i < 2; i++) { //two sides
                        var fairy = new Enemy(world,
                                (i === 0 ? -world.width - 4 : world.width + 4) / 2,
                                -world.height / 2 - 2,
                                (i === 0 ? 20 : -20),
                                25,
                                (i === 0 ? -7.5 : 7.5),
                                0,
                                2, 5, i ? "fairyBlue" : "fairyRed");
                        fairy.addDrops(i ? "point" : "power", !i, 1); //type, size (false — big), amount
                        if (Math.random() < 0.1)
                            fairy.addDrops("power", false, 1); //10% chance of big power item;
                        fairy.bulletSprite = i ? "eyeBlue" : "eyeRed"; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
                        fairy.eventChain.addEvent(function (f) { //and now let's code the fairy's shooting event!
                            var bullet = f.shootProjectileAt(world.player, 0, 0, 75, 2, f.bulletSprite);
                            bullet.behavior = function () { //and bullet's behavior (executes every tick)!
                                if (world.vectorLength(this.x1, this.y1) > 45) //if speed > 45 unit/s
                                    this.setVectors(null, null, null, null, 0, 0); //stop accelerating
                            };
                            bullet.eventChain.addEvent(function (b, iter) {
                                if (iter < 2) {
                                    b.headToEntity(world.player, 0, 60); //stop and refresh directions
                                    b.sprite.set((b.sprite.name === "eyeBlue") ? "eyeRed" : "eyeBlue"); //swap sprites for bullets
                                } else if (iter === 2) {
                                    b.sprite.set("orbBlue");
                                }
                            }, null, 1.7, 3, true);
                        }, 0.7, 1 - world.difficulty * 0.15, Infinity);
                    }
                }
            }, {
                substage: 0,
                second: 55,
                func: function (world) {
                    eventKedamaMidboss(world, true);
                }
            }, {
                substage: 1,
                second: 4,
                func: function (world) {
                    eventOkuu(world);
                }
            }]
    }, {
        extra: 4,
        title: "Test",
        description: "You're not gonna see something here.",
        appearanceSecond: 4,
        background: {
            file: "bg2.jpg",
            speed: 2
        },
        events: [{
                substage: 1,
                second: 4,
                func: function (world) {
                    eventOkuu(world);
                }
            }]
    }];

eventKedamaMidboss = function (world, power) {
    var kedama = new Enemy(world);

    kedama.addNonSpell({
        init: function (entity) {
            entity.eventChain.addEvent(function (e, iter) {
                var c = (power ? 8 : 6) * (e.world.difficulty + 1);
                if (iter % 16 >= 9) {
                    return;
                }
                for (var i = 0; i < c; ++i) {
                    var v = iter % 32 < 16;
                    var a = i / c * Math.PI * 2;
                    var d = (v ? e.relTime() : -e.relTime()) * 1.5;
                    e.shootProjectile(a + d, e.width, 50, 0, 2.5, d > 0 ? "static.red" : "static.blue");
                }
            }, 0.3, 0.1, Infinity);
        },
        health: 800,
        time: 15
    }, world.difficulty);
    if (world.difficulty > 0) {
        if (power)
            kedama.addSpell(SPELL.kedamaBeta);
        else
            kedama.addSpell(SPELL.kedamaAlpha);
    }

    kedama.setBossData("kedama", false);
};

eventOrb = function (world) {
    var nsInit = function (entity) {
        entity.eventChain.addEvent(function (e) {
            var c = 4 * (e.attackGroupCurrent + 1) * (e.world.difficulty + 1);
            for (var i = 0; i < c; ++i) {
                var a = i / c * Math.PI * 2;
                var d = e.relTime() * 3;
                e.shootProjectile(a + d, 0, 30, 0, 2, i % 2 ? "static.blue" : "static.red");
            }
        }, 0, 0.133, Infinity);
    };
    var nsBehavior = function (entity) {
        //~wiggling left and right~
        entity.x1 = Math.cos(entity.relTime() * 1.5) * 30;
    };

    var orb = new Enemy(world);

    orb.addNonSpell({init: nsInit, func: nsBehavior, health: 300, time: 15});
    orb.addSpell(SPELL.orbAlpha);
    orb.addNonSpell({init: nsInit, func: nsBehavior, health: 500, time: 25});
    orb.addSpell(SPELL.orbBeta);

    orb.setBossData("orb", true);
};

eventOkuu = function (world) {
    var okuu = new Enemy(world);

    okuu.addSpell(SPELL.okuuAlpha);

    okuu.setBossData("okuu", true);
};