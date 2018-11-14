var STAGE = [{
        title: "Wonderland Inbound",
        description: "Low entropy and so much microstates.",
        appearanceSecond: 0.2,
        background: {
            file: "bg1.jpg",
            speed: 10
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
                                (i === 0 ? -0.25 : 0.25),
                                0,
                                2, 10, i ? "fairyBlue" : "fairyRed");
                        fairy.addDrops(i === 0 ? "power" : "point", i === 0, 5); //type, size (false — big), amount
                        if (Math.random() < 0.1)
                            fairy.addDrops("power", false, 1); //10% chance of big power item;
                        fairy.bulletSprite = i ? "staticBlue" : "staticRed"; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
                        fairy.eventChain.addEvent(function (f) { //and now let's code the fairy's shooting event!
                            var bullet = new Projectile(world, f.x, f.y, 0, 0, 0, 0, 2, false, f.bulletSprite); //new bullet here
                            bullet.followCounter = 0;
                            bullet.headToEntity(world.player, 0, 3.5);
                            bullet.behavior = function() {
                                if (world.vectorLength(this.x1, this.y1) > 2) {
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
                    var kedama = new Enemy(world, x, y, 0, 12, 0, 0, 4, 15, "kedamaMinion");
                    kedama.addDrops("point", false, 7);
                    kedama.eventChain.addEvent(function (s, i) {
                        var shootInterval = 30 - s.parentWorld.difficulty * 6;
                        if (i % shootInterval >= 8) {
                            //pause every 8 shots
                            return;
                        }
                        if (i % shootInterval === 0) {
                            s.targetPos = {
                                x: s.parentWorld.player.x,
                                y: Math.max(s.y, s.parentWorld.player.y)};
                        }
                        var p = new Projectile(s.parentWorld,
                                s.x,
                                s.y,
                                0, 0, 0, 0, 1.5, false, "kunaiBlue");
                        p.headToEntity(s.targetPos, 50 + s.parentWorld.difficulty * 10, 0);
                    }, 1.5, 0.1, Infinity);
                    kedama.appearanceTime = 1;
                }
            }, {
                substage: 0,
                second: 36,
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
                        var orb = new Enemy(world, x, y, 0, 6, 0, 0, 2, 30, "orbMinion");
                        orb.appearanceTime = 1;
                        orb.addDrops("power", true, 5);
                        orb.addDrops("point", false, 5);
                        orb.eventChain.addEvent(function (s, i) {
                            var p = new Projectile(s.parentWorld, s.x, s.y, 0, 0, 0, 0, 2, false, "strikeRed");
                            p.headToEntity(s.parentWorld.player, 50 + s.parentWorld.difficulty * 10, 0);
                        }, 1.5, 0.75, Infinity);
                    } else {
                        var mine = new Enemy(world, x, y, 0, 3, 0, 0, 4, 1, "landMine");
                        mine.appearanceTime = 1;
                        mine.onDestroy = function () {
                            for (var i = 0; i < 8 + this.parentWorld.difficulty * 2; i++) {
                                var sx = (Math.random() - 0.5) * 30;
                                var sy = (Math.random() - 0.5) * 30;
                                new Projectile(this.parentWorld, this.x, this.y, sx, sy, sx / 20, sy / 20, 3, false, "strikePurple");
                            }
                        };
                    }
                }
            }, {
                substage: 1,
                second: 36,
                repeatInterval: 0.5,
                repeatCount: 20,
                func: function (world, iter) {
                    if (iter === 0) {
                        world.removeEnemies(); //cleanup after orbs
                    }
                    var stone = new Enemy(world,
                            world.width * (Math.random() - 0.5) * 0.8, -world.height / 2 - 3,
                            0, 30 + world.difficulty * 6,
                            0, 2,
                            4, 3, "stoneFace");
                    stone.addDrops("point", false, 3);
                }
            }, {
                substage: 1,
                second: 48,
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
            speed: 2
        },
        events: [{
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
                                (i === 0 ? -0.25 : 0.25),
                                0,
                                2, 10, i ? "fairyBlue" : "fairyRed");
                        fairy.addDrops(i === 0 ? "power" : "point", i === 0, 5); //type, size (false — big), amount
                        if (Math.random() < 0.1)
                            fairy.addDrops("power", false, 1); //10% chance of big power item;
                        fairy.bulletSprite = i ? "eyeBlue" : "eyeRed"; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
                        fairy.eventChain.addEvent(function (f) { //and now let's code the fairy's shooting event!
                            var bullet = new Projectile(world, f.x, f.y, 0, 0, 0, 0, 2, false, f.bulletSprite); //new bullet here
                            bullet.followCounter = 0;
                            bullet.headToEntity(world.player, 0, 2.5); //starting moving to the player (comment to easy graze), parameters: target entity, initial speed, acceleration
                            bullet.behavior = function () { //and bullet's behavior (executes every tick)!
                                if (world.vectorLength(this.x1, this.y1) > 1.5) //if speed > 1.5
                                    this.setVectors(null, null, null, null, 0, 0); //stop accelerating
                            };
                            bullet.eventChain.addEvent(function (b, iter) {
                                if (iter < 2) {
                                    b.headToEntity(world.player, 0, 2); //stop and refresh directions
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
                second: 16,
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
                var c = (power ? 8 : 6) * (e.parentWorld.difficulty + 1);
                if (iter % 16 >= 9) {
                    return;
                }
                for (var i = 0; i < c; ++i) {
                    var v = iter % 32 < 16;
                    var a = i / c * Math.PI * 2;
                    var d = (v ? e.relTime() : -e.relTime()) * 1.5;
                    new Projectile(e.parentWorld,
                            e.x + e.width * Math.sin(a + d),
                            e.y + e.width * Math.cos(a + d),
                            Math.sin(a + d) * 50,
                            Math.cos(a + d) * 50,
                            0, 0, 2.5, false, d > 0 ? "staticRed" : "staticBlue");
                }
            }, 0.3, 0.1, Infinity);
        },
        health: 400,
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
            var c = 4 * (e.attackGroupCurrent + 1) * (e.parentWorld.difficulty + 1);
            for (var i = 0; i < c; ++i) {
                var a = i / c * Math.PI * 2;
                var d = e.relTime() * 3;
                new Projectile(e.parentWorld,
                        e.x + Math.sin(a),
                        e.y + Math.cos(a),
                        Math.sin(a + d) * 30,
                        Math.cos(a + d) * 30,
                        0, 0, 2, false, i % 2 ? "staticBlue" : "staticRed");
            }
        }, 0, 0.133, Infinity);
    };
    var nsBehavior = function (entity) {
        //~wiggling left and right~
        entity.x1 = Math.cos(entity.relTime() * 1.5);
    };

    var orb = new Enemy(world);

    orb.addNonSpell({init: nsInit, func: nsBehavior, health: 100, time: 15});
    orb.addSpell(SPELL.orbAlpha);
    orb.addNonSpell({init: nsInit, func: nsBehavior, health: 150, time: 25});
    orb.addSpell(SPELL.orbBeta);

    orb.setBossData("orb", true);
};

eventOkuu = function (world) {
    var okuu = new Enemy(world);

    okuu.addSpell(SPELL.okuuAlpha);

    okuu.setBossData("okuu", true);
};
