var SPELL = {
    fodder: {
        boss: "marisa",
        number: -1,
        names: [
            null,
            null,
            null,
            null,
            null,
            "FODDER"
        ],
        health: 9001,
        time: 42,
        decrTime: 2,
        bonus: 99999,
        bonusBound: 5000
    },
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
        init: function () {
            var w = 61;
            var h = 76;
            this.on(0.0166, function (iter) {
                for (var i = iter * 5; i < (iter + 1) * 5; i++) {
                    var x = (i % w) * this.world.width / (w - 1) - this.world.width / 2;
                    var y = Math.floor(i / w) * this.world.height / (h - 1) - this.world.height / 2;
                    var p = new Projectile(
                            this.world, x, y, 0, 0, 0, 0, 1.5, true,
                            Random.nextArrayElement(["seal.cyan", "seal.yellow", "seal.magenta"]));
                    p.behavior = function () {
                        this.angle = this.world.relTime();
                    };
                }
            }).repeat(0.0166, h * w);
        },
        func: function () {
            this.y1 = 0.02;
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
        init: function () {
            this.on(0.4, function (iter) {
                var c = 8;
                var d = this.lifetime * 1.5;
                var bs = this.arcProjectiles(0, null, c, this.width, 1, 0, 2.5, iter % 2 ? "static.blue" : "static.red");
                for (var i in bs) {
                    var a = bs[i].getAngle();
                    bs[i].setVectors(null, null,
                            Math.cos(a + d) * (20 + this.world.difficulty * 5),
                            Math.sin(a + d) * (5 + this.world.difficulty * 20));
                }
            }).repeat(0.1);
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
        init: function () {
            this.on(0.4, function (iter) {
                var c = 3 + this.world.difficulty * 2;
                var r = this.world.difficulty * 5;
                var bs = this.arcProjectiles(Util.toAngle("s"), null, c, this.width + r, 25, 0, 2.5, iter % 2 ? "static.blue" : "static.red");
                for (var i in bs) {
                    bs[i].on(0.1, function () {
                        this.headToEntity(this.world.player, 0, 60);
                    }).repeat(2);
                }
            }).repeat(0.2);
        }
    },
    finalSpark: {
        boss: "marisa",
        number: 13,
        names: [
            null,
            null,
            null,
            "Magicannon \"Final Master Spark\""
        ],
        health: 750,
        time: 64,
        decrTime: 16,
        bonus: 2400000,
        bonusBound: 400000,
        init: function () {
            this.on(1, function (iter) {
                if (iter % 40 === 0) {
                    this.headToPointSmoothly(this.world.width * Random.nextFloat(0.4) * ((iter % 80 < 40) ? 1 : -1), -this.world.height * (0.15 + Random.nextFloat(0.2)), 2);
                }
                if (iter % 40 < 10) {
                    return;
                }
                if (iter % 40 === 10) {
                    this.angleToPlayer = Util.angleBetweenEntities(this, this.world.player);
                    var msPre = new Beam(this.world, 0, 0, 1, this.angleToPlayer, 0, 0, 0, 0, 0, 0.6, false, "masterSpark");
                    msPre.setAnchor(this);
                    msPre.harmless = true;
                    msPre.removeTime = 1.5;
                    msPre.behavior = function() {
                        this.maxLength += 200 / this.world.ticksPS;
                    };
                }
                if (iter % 40 === 16) {
                    this.masterSpark = new Beam(this.world, 0, 0, 200, this.angleToPlayer, 75, 0, 0, 0, 0, 50, false, "masterSpark");
                    this.masterSpark.setAnchor(this);
                    this.masterSpark.removeTime = 3;
                    this.masterSpark.breakable = false;
                    this.world.startShake(3, 1.5);
                }
                if (iter % 40 === 18) {
                    var oldAngle = this.angleToPlayer;
                    this.angleToPlayer = Util.angleBetweenEntities(this, this.world.player);
                    this.masterSpark.a1 = Util.isClockwiseNearest(oldAngle, this.angleToPlayer) ? 0.4 : -0.4;
                }
                var starCircle = this.arcProjectiles(iter * Math.PI / 24, null, 8, 0, 30, -15, 3, ["star.red", "star.blue"][iter % 2], false);
                starCircle.forEach(function(s) {
                    s.a1 = (iter % 2) ? -1 : 1;
                    s.preserve = true;
                    s.removeTime = 7;
                }, this);
            }).repeat(0.25);
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
        init: function () {
            this.on(1, function (iter) {
                if (iter % 200 < 80) {
                    var bs = this.arcProjectiles(0, null, 4, this.width * 4, 20, -9, 4, "seal.red");
                    for (var i in bs) {
                        bs[i].on(2, function () {
                            var a = this.getAngle() - Math.PI / 2;
                            this.setVectors(null, null, Math.cos(a) * 20, Math.sin(a) * 20, Math.cos(a) * 24, Math.sin(a) * 24);
                        });
                    }
                }
                if (iter % 200 === 60) {
                    this.attackAngle = Util.angleBetweenEntities(this, this.world.player);
                }
                if (iter % 200 < 160 && iter % 200 >= 60) {
                    var c = 3 + this.world.difficulty * 2;
                    var bs = this.arcProjectiles(this.attackAngle, null, c, this.width * 2, 30, 1.8, 2, iter % 200 < 70 ? "seal.purple" : "seal");
                    for (var i in bs) {
                        if (iter % 200 < 70) {
                            bs[i].priority = 1;
                        }
                        bs[i].reflects = 5;
                        bs[i].onReflect = function (type) {
                            this[type + "2"] = 0;
                        };
                    }
                }
            }).repeat(0.1);
        }
    },
    lilySpring: {
        boss: "lily",
        number: 18,
        names: [
            null,
            null,
            null,
            "Spring Sign \"Surprise Spring\""
        ],
        background: {
            file: "bg/spell/gr.jpg",
            speed: 100
        },
        health: 800,
        time: 22,
        decrTime: 6,
        bonus: 600000,
        bonusBound: 200000,
        init: function () {
            this.on(1, function (iter) {
                var angleR = Util.toAngle("w") - iter * 0.14;
                var angleB = Util.toAngle("e") + iter * 0.42;
                var angleG = Util.toAngle("n") - iter * 0.28;
                var angleY = Util.toAngle("n") + iter * 0.42;
                this.arcProjectiles(angleR, Math.PI / 3, 8, 30, 20, 0, 2, "strike.red");
                this.arcProjectiles(angleB, Math.PI / 3, 8, 24, 30, 0, 2, "strike.blue");
                this.arcProjectiles(angleG, Math.PI / 3, 8, 0, 40, 0, 2, "strike.lime");
                this.arcProjectiles(angleY, Math.PI / 3, 12, 18, 50, 0, 2, "strike.yellow");
            }).repeat(0.166);
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
        init: function () {
            var count = this.world.difficulty + 2;
            this.satellites = [];
            for (var i = 0; i < count; ++i) {
                var satellite = new Enemy(this.world, this.x, this.y, 0, 0, 0, 0, 2, 160, "orbMinion");
                satellite.relAngle = Math.PI * 2 * i / count;
                satellite.parent = this;
                satellite.headToPointSmoothly(this.x + 20 * Math.cos(satellite.relAngle), this.y + 20 * Math.sin(satellite.relAngle), 1);
                satellite.on(1, function () {
                    this.behavior = function () {
                        this.relAngle += Math.PI / this.world.ticksPS / 2;
                        this.x = this.parent.x + 20 * Math.cos(this.relAngle);
                        this.y = this.parent.y + 20 * Math.sin(this.relAngle);
                    };
                });
                satellite.on(1, function (iter) {
                    var alt = iter % 60 < 30;
                    if (alt) {
                        this.shootProjectileAt(this.world.player, this.width, 50, -10.5, 2.5, "static.red");
                    } else {
                        this.shootProjectile(this.relAngle, this.width, 25, 0, 4, "static.blue");
                    }
                }).repeat(0.1);
                this.satellites.push(satellite);
            }
        },
        finish: function () {
            for (var i in this.satellites) {
                this.satellites[i].remove();
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
        init: function () {
            this.headToPointSmoothly(0, -this.world.height / 4, 0.5);
            this.on(0.8, function () {
                this.x = 0;
                this.x1 = 0;
                var c = 2 + this.world.difficulty;
                var r = 24;
                var s = 60;
                var a = Math.PI / 2 - Math.cos(this.lifetime * 0.75);
                var bs = this.arcProjectiles(a, null, c, r, s, 0, 2, "orbBlue");
                for (var i in bs) {
                    bs[i].reflects = 1;
                }
            }).repeat(0.133);
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
        init: function () {
            this.headToPointSmoothly(0, -this.world.height / 4, 0.5);
            this.on(0.7, function (iter) {
                this.x = 0;
                this.x1 = 0;
                var r = 2;
                var s = 60;
                this.angle = this.lifetime * 2 - Math.PI / 2;
                this.shootProjectile(this.angle, r, s, 0, 4, iter % 2 ? "static.blue" : "static.red");
            }).repeat(0.033);
            this.on(0, function (iter) {
                if (iter % 25 > 20) {
                    if (iter % 50 > 25) {
                        var s = 90;
                        var r = 2;
                        var c = 5 + this.world.difficulty * 2;
                        var a = Util.angleBetweenEntities(this, this.world.player);
                        this.arcProjectiles(a, Math.PI / 20 * c, c, r, s, 0, 2, "orbBlue");
                    } else {
                        var p = this.shootProjectileAt(this.world.player, 0, 100, -36, 6, "orbBlue");
                        p.on(0, function () {
                            this.headToEntity(this.world.player, 80, -36);
                        }).repeat(1 / (this.world.difficulty + 1));
                    }
                }
            }).repeat(0.133);
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
        init: function () {
            this.on(0, function () {
                var nuclearBall = new Projectile(this.world,
                        (Random.nextFloat() - 0.5) * this.world.width,
                        -this.world.height / 2 - 5,
                        0, 180, 0, -81, 20, false, "nuclear");
                nuclearBall.behavior = function () {
                    if (this.width <= 0.2)
                        this.remove();
                    else
                        this.width = 20 - Math.pow(this.lifetime, 2) * 5;
                };
            }).repeat(0.4 / (this.world.difficulty + 1));
        }
    }
};

var NON_SPELL = {
    fodder: {
        health: 50,
        time: 15
    },
    kedamaSpam: {
        init: function (power) {
            this.on(0.3, function (iter) {
                var c = (power ? 8 : 6) * (this.world.difficulty + 1);
                if (iter % 16 >= 9) {
                    return;
                }
                var v = iter % 32 < 16;
                var d = (v ? this.lifetime : -this.lifetime) * 1.5;
                this.arcProjectiles(d, null, c, this.width, 50, 0, 2.5, d > 0 ? "static.red" : "static.blue");
            }).repeat(0.1);
        },
        health: 800,
        time: 15
    },
    orbSpam: {
        init: function () {
            this.on(0, function () {
                var c = 2 * (this.attackGroupCurrent + 3) * (this.world.difficulty + 1);
                var d = this.lifetime * 3;
                this.arcProjectiles(d, null, c, 0, 30, 0, 2, ["static.red", "static.blue"]);
            }).repeat(0.133);
        },
        func: function () {
            //~wiggling left and right~
            this.x1 = Math.cos(this.lifetime * 1.5) * 30;
        },
        health: function (power) {
            return power ? 500 : 300;
        },
        time: function (power) {
            return power ? 25 : 15;
        }
    }
};
