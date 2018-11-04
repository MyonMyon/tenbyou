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
        health: 1,
        time: 600,
        decrTime: 50,
        bonus: 99999,
        bonusBound: 5000,
        func: function (entity) {
            entity.y1 = 0.1;
        }
    },
    kedamaAlpha: {
        boss: "kedama",
        number: 1,
        names: [
            null,
            "Soft Sign \"Fluffy Revenge\"",
            "Soft Sign \"Not so Fluffy Revenge\""
        ],
        health: 200,
        time: 600,
        decrTime: 50,
        bonus: 30000,
        bonusBound: 5000,
        func: function (entity) {
            var c = 8;
            if (entity.lifetime > 10 && entity.lifetime % 3 === 0)
                for (var i = 0; i < c; ++i) {
                    var a = i / c * Math.PI * 2;
                    var d = entity.lifetime / 20;
                    new Projectile(entity.parentWorld,
                            entity.x + entity.width * Math.sin(a),
                            entity.y + entity.width * Math.cos(a),
                            Math.sin(a + d) * 25,
                            Math.cos(a + d) * 25,
                            0, 0, 2.5, false, entity.lifetime % 2 ? "staticBlue" : "staticRed");
                }
        }
    },
    kedamaBeta: {
        boss: "kedama",
        number: 4,
        names: [
            null,
            "Soft Sign \"Fluffy Thorns\"",
            "Soft Sign \"Not so Fluffy Thorns\""
        ],
        health: 400,
        time: 500,
        decrTime: 50,
        bonus: 30000,
        bonusBound: 5000,
        func: function (entity) {
            var c = 5;
            if (entity.lifetime > 10 && entity.lifetime % 6 === 0)
                for (var i = 0; i < c; ++i) {
                    var a = i / c * Math.PI * 2;
                    var p = new Projectile(entity.parentWorld,
                            entity.x + entity.width * Math.sin(a),
                            entity.y + entity.width * Math.cos(a),
                            Math.sin(a) * 25,
                            Math.cos(a) * 25,
                            0, 0, 2.5, false, entity.lifetime / 6 % 2 ? "staticBlue" : "staticRed");
                    p.behavior = function () {
                        if (this.lifetime % 60 === 10)
                            this.headToEntity(entity.parentWorld.player, 0, 2);
                    };
                }
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
        health: 1200,
        time: 2000,
        decrTime: 200,
        bonus: 40000,
        bonusBound: 5000,
        init: function (entity) {
            entity.eventChain.addEvent(
                    function (s, iter) {
                        if (iter % 200 < 80) {
                            for (var i = 0; i < Math.PI * 2; i += Math.PI / 2) {
                                var p = new Projectile(s.parentWorld,
                                        s.x + entity.width * Math.sin(i) * 4,
                                        s.y + entity.width * Math.cos(i) * 4,
                                        Math.sin(i) * 20,
                                        Math.cos(i) * 20,
                                        -Math.sin(i) * 0.3,
                                        -Math.cos(i) * 0.3,
                                        4, false, "sealRed");
                                p.nextAngle = i + Math.PI / 2;
                                p.eventChain.addEvent(function (e) {
                                    e.setVectors(null, null,
                                            Math.sin(e.nextAngle) * 20,
                                            Math.cos(e.nextAngle) * 20,
                                            Math.sin(e.nextAngle) * 0.8,
                                            Math.cos(e.nextAngle) * 0.8);
                                }, 2);
                            }
                        }
                        if (iter % 200 === 60) {
                            s.attackAngle = -Math.atan2(
                                    s.y - s.parentWorld.player.y,
                                    s.x - s.parentWorld.player.x)
                                    - Math.PI / 2;
                        }
                        if (iter % 200 < 160 && iter % 200 >= 60) {
                            var c = 3 + s.parentWorld.difficulty * 2;
                            for (var i = 0; i < c; i++) {
                                var a = i * Math.PI * 2 / c  + s.attackAngle;
                                var p = new Projectile(s.parentWorld,
                                        s.x + entity.width * Math.sin(a) * 2,
                                        s.y + entity.width * Math.cos(a) * 2,
                                        Math.sin(a) * 30,
                                        Math.cos(a) * 30,
                                        Math.sin(a) * 0.06,
                                        Math.cos(a) * 0.06,
                                        2, false, iter % 200 < 70 ? "sealPurple" : "sealGray");
                                p.behavior = function() {
                                    if (this.x < -this.parentWorld.width / 2 || this.x > this.parentWorld.width / 2) {
                                        this.x1 = -this.x1;
                                        this.x2 = 0;
                                    }
                                    if (this.y < -this.parentWorld.height / 2 || this.y > this.parentWorld.height / 2) {
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
        time: 1500,
        decrTime: 200,
        bonus: 40000,
        bonusBound: 5000,
        init: function (entity) {
            var count = entity.parentWorld.difficulty + 2;
            entity.satellites = [];
            for (var i = 0; i < count; ++i) {
                var satellite = new Enemy(entity.parentWorld, entity.x, entity.y, 0, 0, 0, 0, 1, 160);
                satellite.setSprite(1, 1, 0, 1, false);
                satellite.relAngle = Math.PI * 2 * i / count;
                satellite.parent = entity;
                satellite.headToPointSmoothly(entity.x + 20 * Math.sin(satellite.relAngle), entity.y + 20 * Math.cos(satellite.relAngle), 1);
                satellite.eventChain.addEvent(function (s) {
                    s.behavior = function () {
                        this.relAngle += Math.PI / this.parentWorld.ticksPS / 2;
                        this.x = this.parent.x + 20 * Math.sin(this.relAngle);
                        this.y = this.parent.y + 20 * Math.cos(this.relAngle);
                    };
                }, 1);
                satellite.eventChain.addEvent(function (s) {
                    var alt = Math.floor(s.lifetime / s.parentWorld.ticksPS) % 6 < 3;
                    var p = new Projectile(s.parentWorld,
                            s.x + s.width * Math.sin(s.relAngle),
                            s.y + s.width * Math.cos(s.relAngle),
                            Math.sin(s.relAngle) * 25,
                            Math.cos(s.relAngle) * 25,
                            0, 0, alt ? 2.5 : 4, false, alt ? "staticRed" : "staticBlue");
                    if (alt) {
                        p.headToEntity(s.parentWorld.player, 50, -0.35);
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
            "Hard-headed Sign \"Awww\""
        ],
        health: 200,
        time: 1000,
        decrTime: 200,
        bonus: 30000,
        bonusBound: 5000,
        func: function (entity, difficulty) {
            if (entity.lifetime === 1)
                entity.headToPointSmoothly(0, -entity.parentWorld.height / 4, 0.5);
            if (entity.lifetime % 4 === 0 && entity.lifetime > 20) {
                entity.x = 0;
                entity.x1 = 0;
                var c = 2 + difficulty;
                var r = 24;
                var s = 60;
                for (var i = 0; i < c; ++i) {
                    var a = i / c * Math.PI * 2 + Math.cos(entity.lifetime / 40);
                    var p = new Projectile(entity.parentWorld,
                            entity.x + Math.sin(a) * r,
                            entity.y + Math.cos(a) * r,
                            Math.sin(a) * s,
                            Math.cos(a) * s,
                            0, 0, 2, false, "orbBlue");
                    p.reflects = 1;
                    p.behavior = function () {
                        if ((this.x > this.parentWorld.width / 2 || this.x < -this.parentWorld.width / 2) && this.reflects > 0) {
                            this.x1 = -this.x1;
                            --this.reflects;
                        }
                        if ((this.y > this.parentWorld.height / 2 || this.y < -this.parentWorld.height / 2) && this.reflects > 0) {
                            this.y1 = -this.y1;
                            --this.reflects;
                        }
                    };
                }
            }
        }
    },
    orbBeta: {
        boss: "orb",
        number: 50,
        names: [
            "Reference Sign \"Midly Responsive Legacy\"",
            "Reference Sign \"Highly Responsive Legacy\"",
            "Reference Sign \"Nope\""
        ],
        health: 160,
        time: 1500,
        decrTime: 200,
        bonus: 40000,
        bonusBound: 5000,
        func: function (entity, difficulty) {
            if (entity.lifetime < 20) {
                entity.headToPointSmoothly(0, -entity.parentWorld.height / 4, 0.5);
            } else {
                entity.x = 0;
                entity.x1 = 0;
                var r = 2;
                var s = 60;
                var a = Math.PI - entity.lifetime / 15;
                entity.angle = entity.lifetime / 15 - Math.PI / 2;
                var p = new Projectile(entity.parentWorld,
                        entity.x + Math.sin(a) * r,
                        entity.y + Math.cos(a) * r,
                        Math.sin(a) * s,
                        Math.cos(a) * s,
                        0, 0, 4, false, entity.lifetime % 2 ? "staticBlue" : "staticRed");
                if (entity.lifetime % 100 > 80) {
                    if (entity.lifetime % 200 > 100) {
                        if (entity.lifetime % 4 === 0) {
                            s = 90;
                            var c = 2 + difficulty;
                            for (var i = -c; i <= c; ++i) {
                                a = -Math.atan2(entity.y - entity.parentWorld.player.y, entity.x - entity.parentWorld.player.x) - Math.PI / 2 + Math.PI / 20 * i;
                                p = new Projectile(entity.parentWorld,
                                        entity.x + Math.sin(a) * r,
                                        entity.y + Math.cos(a) * r,
                                        Math.sin(a) * s,
                                        Math.cos(a) * s,
                                        0, 0, 2, false, "orbBlue");
                            }
                        }
                    } else {
                        if (entity.lifetime % 4 === 0) {
                            p = new Projectile(entity.parentWorld,
                                    entity.x,
                                    entity.y,
                                    0, 0, 0, 0, 6, false, "orbBlue");
                            p.headToEntity(entity.parentWorld.player, 100, -1.2);
                            p.behavior = function () {
                                if (this.lifetime % (32 / (difficulty + 1)) === 0)
                                    this.headToEntity(this.parentWorld.player, 80, -1.2);
                            };
                        }
                    }
                }
            }
        }
    },
    okuuAlpha: {
        boss: "okuu",
        number: 54,
        names: [
            "Explosion Sign \"Lol Easy Modo\"",
            "Explosion Sign \"Not a Flare at all\"",
            "Explosion Sign \"Not a Flare at all yet\""
        ],
        health: 300,
        time: 1500,
        decrTime: 200,
        bonus: 600000,
        bonusBound: 5000,
        func: function (entity, difficulty) {
            if (entity.lifetime % Math.floor(12 / (difficulty + 1)) === 0) {
                var nuclearBall = new Projectile(entity.parentWorld,
                        (Math.random() - 0.5) * entity.parentWorld.width,
                        -entity.parentWorld.height / 2 - 5,
                        0, 180, 0, -2.7, 20, false, "nuclear");
                nuclearBall.behavior = function () {
                    if (this.width <= 0.2)
                        this.remove();
                    else
                        this.width -= this.lifetime / 100;
                };
            }
        }
    }
};

