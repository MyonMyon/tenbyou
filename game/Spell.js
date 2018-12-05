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
            "Nullity"
        ],
        health: 9999,
        time: 99,
        decrTime: 99,
        bonus: 99999,
        bonusBound: 5000,
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
        time: 20,
        decrTime: 2,
        bonus: 30000,
        bonusBound: 5000,
        init: function (entity) {
            entity.eventChain.addEvent(function (e, iter) {
                var c = 8;
                for (var i = 0; i < c; ++i) {
                    var a = i / c * Math.PI * 2;
                    var d = e.relTime() * 1.5;
                    new Projectile(e.world,
                            e.x + e.width * Math.cos(a),
                            e.y + e.width * Math.sin(a),
                            Math.cos(a + d) * (20 + e.world.difficulty * 5),
                            Math.sin(a + d) * (5 + e.world.difficulty * 20),
                            0, 0, 2.5, false, iter % 2 ? "static.blue" : "static.red");
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
        time: 17,
        decrTime: 2,
        bonus: 30000,
        bonusBound: 5000,
        init: function (entity) {
            entity.eventChain.addEvent(function (e, iter) {
                var c = 3 + e.world.difficulty * 2;
                var r = e.world.difficulty * 5;
                for (var i = 0; i < c; ++i) {
                    var a = i / c * Math.PI * 2 + Math.PI / 2;
                    var p = e.shootProjectile(a, e.width + r, 25, 0, 2.5, iter % 2 ? "static.blue" : "static.red");
                    p.eventChain.addEvent(function (proj) {
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
            file: "spell_gr.jpg",
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
                            for (var i = 0; i < Math.PI * 2; i += Math.PI / 2) {
                                var p = s.shootProjectile(i, entity.width * 4, 20, -9, 4, "seal.red");
                                p.nextAngle = i - Math.PI / 2;
                                p.eventChain.addEvent(function (e) {
                                    e.setVectors(null, null,
                                            Math.cos(e.nextAngle) * 20,
                                            Math.sin(e.nextAngle) * 20,
                                            Math.cos(e.nextAngle) * 24,
                                            Math.sin(e.nextAngle) * 24);
                                }, 2);
                            }
                        }
                        if (iter % 200 === 60) {
                            s.attackAngle = Math.atan2(
                                    s.world.player.y - s.y,
                                    s.world.player.x - s.x);
                        }
                        if (iter % 200 < 160 && iter % 200 >= 60) {
                            var c = 3 + s.world.difficulty * 2;
                            for (var i = 0; i < c; i++) {
                                var a = i * Math.PI * 2 / c + s.attackAngle;
                                var p = s.shootProjectile(a, entity.width * 2, 30, 1.8, 2, iter % 200 < 70 ? "seal.purple" : "seal");
                                if (iter % 200 < 70) {
                                    p.priority = 1;
                                }
                                p.behavior = function () {
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
            file: "spell_sp.jpg",
            speed: 100
        },
        health: 400,
        time: 30,
        decrTime: 10,
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
                for (var i = 0; i < c; ++i) {
                    var a = Math.PI / 2 + i / c * Math.PI * 2 - Math.cos(e.relTime() * 0.75);
                    var p = e.shootProjectile(a, r, s, 0, 2, "orbBlue");
                    p.reflects = 1;
                    p.behavior = function () {
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
            file: "spell_sp.jpg",
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
        time: 50,
        decrTime: 10,
        bonus: 40000,
        bonusBound: 5000,
        init: function (entity) {
            entity.headToPointSmoothly(0, -entity.world.height / 4, 0.5);
            entity.eventChain.addEvent(function (e, iter) {
                e.x = 0;
                e.x1 = 0;
                var r = 2;
                var s = 60;
                e.angle = e.relTime() * 2 - Math.PI /2;
                e.shootProjectile(e.angle, r, s, 0, 4, iter % 2 ? "static.blue" : "static.red");
            }, 0.7, 0.033, Infinity);
            entity.eventChain.addEvent(function (e, iter) {
                if (iter % 25 > 20) {
                    if (iter % 50 > 25) {
                        var s = 90;
                        var r = 2;
                        var c = 2 + e.world.difficulty;
                        for (var i = -c; i <= c; ++i) {
                            var a = Math.atan2(e.world.player.y - e.y, e.world.player.x - e.x) + Math.PI / 20 * i;
                            e.shootProjectile(a, r, s, 0, 2, "orbBlue");
                        }
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

