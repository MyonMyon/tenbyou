var SPELL = {
    kedamaAlpha: {
        boss: "kedama",
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
    orbAlpha: {
        boss: "orb",
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
        names: [
            "Explosion Sign \"This is broken\"",
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
                var nuclearBall = new Projectile(entity.parentWorld, (Math.random() * (entity.lifetime / 6 % 2 === 0 ? 0.5 : -0.5)) * entity.parentWorld.width, -entity.parentWorld.height / 2 - 5, 0, 6, 0, -0.09);
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

