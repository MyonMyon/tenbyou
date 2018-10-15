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
                    var p = new Projectile(entity.parentWorld);
                    p.setVectors(entity.x + entity.width * Math.sin(a), entity.y + entity.width * Math.cos(a), Math.sin(a + d) * 25, Math.cos(a + d) * 25);
                    p.width = 2.5;
                    p.setSprite(entity.lifetime % 2 + 6, 1, 6, 1, true);
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
                    var p = new Projectile(entity.parentWorld);
                    p.setVectors(entity.x + entity.width * Math.sin(a), entity.y + entity.width * Math.cos(a), Math.sin(a) * 25, Math.cos(a) * 25);
                    p.width = 2.5;
                    p.behavior = function () {
                        if (this.lifetime % 60 === 10)
                            this.headToEntity(entity.parentWorld.player, 0, 2);
                    };
                    p.setSprite(entity.lifetime / 6 % 2 + 6, 1, 6, 1, true);
                }
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
        health: 160,
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
                    var p = new Projectile(s.parentWorld);
                    p.setVectors(s.x + s.width * Math.sin(s.relAngle), s.y + entity.width * Math.cos(s.relAngle), Math.sin(s.relAngle) * 25, Math.cos(s.relAngle) * 25);
                    if (Math.floor(s.lifetime / s.parentWorld.ticksPS) % 6 < 3) {
                        p.headToEntity(s.parentWorld.player, 50, -0.35);
                        p.setSprite(6, 1, 6, 1, true);
                    } else {
                        p.setSprite(7, 1, 6, 1, true);
                    }
                    p.width = 2.5;
                }, 1, 0.2, Infinity);
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
                var s = 2;
                for (var i = 0; i < c; ++i) {
                    var a = i / c * Math.PI * 2 + Math.cos(entity.lifetime / 40);
                    var p = new Projectile(entity.parentWorld, entity.x + Math.sin(a) * r, entity.y + Math.cos(a) * r, Math.sin(a) * s, Math.cos(a) * s);
                    p.setSprite(0, 1);
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
                var s = 2;
                var a = Math.PI - entity.lifetime / 15;
                entity.angle = entity.lifetime / 15 - Math.PI / 2;
                var p = new Projectile(entity.parentWorld, entity.x + Math.sin(a) * r, entity.y + Math.cos(a) * r, Math.sin(a) * s, Math.cos(a) * s);
                p.width = 4;
                p.setSprite(6 + entity.lifetime % 2, 1);
                if (entity.lifetime % 100 > 80) {
                    if (entity.lifetime % 200 > 100) {
                        if (entity.lifetime % 4 === 0) {
                            s = 3;
                            var c = 2 + difficulty;
                            for (var i = -c; i <= c; ++i) {
                                a = -Math.atan2(entity.y - entity.parentWorld.player.y, entity.x - entity.parentWorld.player.x) - Math.PI / 2 + Math.PI / 20 * i;
                                p = new Projectile(entity.parentWorld, entity.x + Math.sin(a) * r, entity.y + Math.cos(a) * r, Math.sin(a) * s, Math.cos(a) * s);
                                p.setSprite(0, 1);
                                p.width = 2;
                            }
                        }
                    } else {
                        if (entity.lifetime % 4 === 0) {
                            p = new Projectile(entity.parentWorld, entity.x, entity.y);
                            p.headToEntity(entity.parentWorld.player, 100, -1.2);
                            p.width = 6;
                            p.behavior = function () {
                                if (this.lifetime % (32 / (difficulty + 1)) === 0)
                                    this.headToEntity(this.parentWorld.player, 80, -1.2);
                            };
                            p.setSprite(0, 1);
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
        customSpriteFiles: [
            "nuclear.png"
        ],
        func: function (entity, difficulty) {
            if (entity.lifetime % Math.floor(12 / (difficulty + 1)) === 0) {
                var nuclearBall = new Projectile(entity.parentWorld, (Math.random() - 0.5) * entity.parentWorld.width, -entity.parentWorld.height / 2 - 5, 0, 6, 0, -0.09);
                nuclearBall.setCustomSpriteFile("nuclear.png", 128, 128);
                nuclearBall.setSprite(0, 1, 1, 1, false);
                nuclearBall.width = 20;
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

