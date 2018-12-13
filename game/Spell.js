var SPELL = {
    nullity: {
        boss: "kedama",
        number: 0,
        names: [
            null,
            null,
            null,
            null,
            null,
            "Nullity Sign \"RIP FPS\""
        ],
        health: 9999,
        time: 99,
        decrTime: 99,
        bonus: 99999,
        bonusBound: 5000,
        init: function (entity) {
            var w = 61;
            var h = 76;
            entity.eventChain.addEvent(function (e, iter) {
                for (var i = iter * 5; i < (iter + 1) * 5; i++) {
                    var x = (i % w) * e.world.width / (w - 1) - e.world.width / 2;
                    var y = Math.floor(i / w) * e.world.height / (h - 1) - e.world.height / 2;
                    var p = new Projectile(
                            e.world, x, y, 0, 0, 0, 0, 1.5, true,
                            ["seal.cyan", "seal.yellow", "seal.magenta"][Math.floor(Math.random() * 3)]);
                    p.behavior = function () {
                        this.angle = this.world.relTime();
                    };
                }
            }, 0.0166, 0.0166, h * w);
        },
        func: function (entity) {
            entity.y1 = 0.02;
        }
    },
    kedamaAlpha: {
        boss: "kedama",
        number: 1,
        names: [
            null,
            "Soft Sign \"Fluffy Revenge\"",
            "Soft Sign \"Not so Fluffy Revenge\"",
            "Soft Sign \"Prepare to Fluff\""
        ],
        health: 400,
        time: 40,
        decrTime: 5,
        bonus: 30000,
        bonusBound: 5000,
        init: function (entity) {
            entity.eventChain.addEvent(function (e, iter) {
                var c = 8;
                var d = e.relTime() * 1.5;
                var bs = e.arcProjectiles(0, null, c, e.width, 1, 0, 2.5, iter % 2 ? "static.blue" : "static.red");
                for (var i in bs) {
                    var a = bs[i].getAngle();
                    bs[i].setVectors(null, null,
                            Math.cos(a + d) * (20 + e.world.difficulty * 5),
                            Math.sin(a + d) * (5 + e.world.difficulty * 20));
                }
            }, 0.4, 0.1, Infinity);
        }
    },
    kedamaBeta: {
        boss: "kedama",
        number: 4,
        names: [
            null,
            "Soft Sign \"Fluffy Thorns\"",
            "Soft Sign \"Not so Fluffy Thorns\"",
            "Soft Sign \"Unfluffiest Thorns\""
        ],
        health: 600,
        time: 40,
        decrTime: 5,
        bonus: 30000,
        bonusBound: 5000,
        init: function (entity) {
            entity.eventChain.addEvent(function (e, iter) {
                var c = 3 + e.world.difficulty * 2;
                var r = e.world.difficulty * 5;
                var bs = e.arcProjectiles(Util.toAngle("s"), null, c, e.width + r, 25, 0, 2.5, iter % 2 ? "static.blue" : "static.red");
                for (var i in bs) {
                    bs[i].eventChain.addEvent(function (proj) {
                        proj.headToEntity(proj.world.player, 0, 60);
                    }, 0.1, 2, Infinity);
                }
            }, 0.4, 0.2, Infinity);
        }
    },
    lilyAlpha: {
        boss: "lily",
        number: 14,
        names: [
            "Solar Sign \"卍\"",
            "Solar Sign \"卍卍\"",
            "Solar Sign \"卍卍卍\"",
            "Solar Sign \"卍卍卍卍\""
        ],
        background: {
            file: "bg/spell/gr.jpg",
            speed: 100
        },
        health: 1200,
        time: 66,
        decrTime: 16,
        bonus: 40000,
        bonusBound: 5000,
        init: function (entity) {
            entity.eventChain.addEvent(
                    function (s, iter) {
                        if (iter % 200 < 80) {
                            var bs = s.arcProjectiles(0, null, 4, s.width * 4, 20, -9, 4, "seal.red");
                            for (var i in bs) {
                                bs[i].eventChain.addEvent(function (e) {
                                    var a = e.getAngle() - Math.PI / 2;
                                    e.setVectors(null, null, Math.cos(a) * 20, Math.sin(a) * 20, Math.cos(a) * 24, Math.sin(a) * 24);
                                }, 2);
                            }
                        }
                        if (iter % 200 === 60) {
                            s.attackAngle = s.world.angleBetweenEntities(s, s.world.player);
                        }
                        if (iter % 200 < 160 && iter % 200 >= 60) {
                            var c = 3 + s.world.difficulty * 2;
                            var bs = s.arcProjectiles(s.attackAngle, null, c, s.width * 2, 30, 1.8, 2, iter % 200 < 70 ? "seal.purple" : "seal");
                            for (var i in bs) {
                                if (iter % 200 < 70) {
                                    bs[i].priority = 1;
                                }
                                bs[i].behavior = function () {
                                    if (this.x < -this.world.width / 2 || this.x > this.world.width / 2) {
                                        this.x1 = -this.x1;
                                        this.x2 = 0;
                                    }
                                    if (this.y < -this.world.height / 2 || this.y > this.world.height / 2) {
                                        this.y1 = -this.y1;
                                        this.y2 = 0;
                                    }
                                };
                            }
                        }
                    },
                    1, 0.1, Infinity);
        }
    },
    orbGamma: {
        boss: "orb",
        number: 42,
        names: [
            "Balance Sign \"Dichotomy Aberration\"",
            "Balance Sign \"Trichotomy Aberration\"",
            "Balance Sign \"Tetrachotomy Aberration\"",
            "Balance Sign \"Pentachotomy Aberration\""
        ],
        health: 500,
        time: 50,
        decrTime: 10,
        bonus: 40000,
        bonusBound: 5000,
        init: function (entity) {
            var count = entity.world.difficulty + 2;
            entity.satellites = [];
            for (var i = 0; i < count; ++i) {
                var satellite = new Enemy(entity.world, entity.x, entity.y, 0, 0, 0, 0, 2, 160, "orbMinion");
                satellite.relAngle = Math.PI * 2 * i / count;
                satellite.parent = entity;
                satellite.headToPointSmoothly(entity.x + 20 * Math.cos(satellite.relAngle), entity.y + 20 * Math.sin(satellite.relAngle), 1);
                satellite.eventChain.addEvent(function (s) {
                    s.behavior = function () {
                        this.relAngle += Math.PI / this.world.ticksPS / 2;
                        this.x = this.parent.x + 20 * Math.cos(this.relAngle);
                        this.y = this.parent.y + 20 * Math.sin(this.relAngle);
                    };
                }, 1);
                satellite.eventChain.addEvent(function (s, iter) {
                    var alt = iter % 60 < 30;
                    if (alt) {
                        s.shootProjectileAt(s.world.player, s.width, 50, -10.5, 2.5, "static.red");
                    } else {
                        s.shootProjectile(s.relAngle, s.width, 25, 0, 4, "static.blue");
                    }
                }, 1, 0.1, Infinity);
                entity.satellites.push(satellite);
            }
        },
        finish: function (entity) {
            for (var i in entity.satellites) {
                entity.satellites[i].remove();
            }
        }
    },
    orbAlpha: {
        boss: "orb",
        number: 46,
        names: [
            "Half-headed Sign \"Regards\"",
            "Half-headed Sign \"Best Regards\"",
            "Hard-headed Sign \"Awww\"",
            "Hard-headed Sign \"Awww Snap\""
        ],
        background: {
            file: "bg/spell/sp.jpg",
            speed: 100
        },
        health: 400,
        time: 45,
        decrTime: 15,
        bonus: 30000,
        bonusBound: 5000,
        init: function (entity) {
            entity.headToPointSmoothly(0, -entity.world.height / 4, 0.5);
            entity.eventChain.addEvent(function (e) {
                e.x = 0;
                e.x1 = 0;
                var c = 2 + e.world.difficulty;
                var r = 24;
                var s = 60;
                var a = Math.PI / 2 - Math.cos(e.relTime() * 0.75);
                var bs = e.arcProjectiles(a, null, c, r, s, 0, 2, "orbBlue");
                for (var i in bs) {
                    bs[i].reflects = 1;
                    bs[i].behavior = function () {
                        if ((this.x > this.world.width / 2 || this.x < -this.world.width / 2) && this.reflects > 0) {
                            this.x1 = -this.x1;
                            --this.reflects;
                        }
                        if ((this.y > this.world.height / 2 || this.y < -this.world.height / 2) && this.reflects > 0) {
                            this.y1 = -this.y1;
                            --this.reflects;
                        }
                    };
                }
            }, 0.8, 0.133, Infinity);
        }
    },
    orbBeta: {
        background: {
            file: "bg/spell/sp.jpg",
            speed: 100
        },
        boss: "orb",
        number: 50,
        names: [
            "Reference Sign \"Mildly Responsive Legacy\"",
            "Reference Sign \"Highly Responsive Legacy\"",
            "Reference Sign \"Ground Zero\"",
            "Reference Sign \"Ground Minus One\""
        ],
        health: 320,
        time: 60,
        decrTime: 20,
        bonus: 40000,
        bonusBound: 5000,
        init: function (entity) {
            entity.headToPointSmoothly(0, -entity.world.height / 4, 0.5);
            entity.eventChain.addEvent(function (e, iter) {
                e.x = 0;
                e.x1 = 0;
                var r = 2;
                var s = 60;
                e.angle = e.relTime() * 2 - Math.PI / 2;
                e.shootProjectile(e.angle, r, s, 0, 4, iter % 2 ? "static.blue" : "static.red");
            }, 0.7, 0.033, Infinity);
            entity.eventChain.addEvent(function (e, iter) {
                if (iter % 25 > 20) {
                    if (iter % 50 > 25) {
                        var s = 90;
                        var r = 2;
                        var c = 5 + e.world.difficulty * 2;
                        var a = e.world.angleBetweenEntities(e, e.world.player);
                        e.arcProjectiles(a, Math.PI / 20 * c, c, r, s, 0, 2, "orbBlue");
                    } else {
                        var p = e.shootProjectileAt(e.world.player, 0, 100, -36, 6, "orbBlue");
                        p.eventChain.addEvent(function (proj) {
                            proj.headToEntity(proj.world.player, 80, -36);
                        }, 0, 1 / (e.world.difficulty + 1), Infinity);
                    }
                }
            }, 0, 0.133, Infinity);
        }
    },
    okuuAlpha: {
        boss: "okuu",
        number: 54,
        names: [
            "Explosion Sign \"Lol Easy Modo\"",
            "Explosion Sign \"Not a Flare at all\"",
            "Explosion Sign \"Not a Flare at all yet\"",
            "Explosion Sign \"Impossible Flare\""
        ],
        health: 750,
        time: 50,
        decrTime: 10,
        bonus: 600000,
        bonusBound: 5000,
        init: function (entity) {
            entity.eventChain.addEvent(function (e) {
                var nuclearBall = new Projectile(e.world,
                        (Math.random() - 0.5) * e.world.width,
                        -e.world.height / 2 - 5,
                        0, 180, 0, -81, 20, false, "nuclear");
                nuclearBall.behavior = function () {
                    if (this.width <= 0.2)
                        this.remove();
                    else
                        this.width = 20 - Math.pow(this.relTime(), 2) * 5;
                };
            }, 0, 0.4 / (entity.world.difficulty + 1), Infinity);
        }
    }
};

