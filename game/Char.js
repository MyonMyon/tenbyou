const CHAR = {
    freyja: {
        playable: true,
        name: "Freyja til Folkvang",
        description: "Posseses a huge light beam emitter",
        width: 0.66,
        speed: 150,
        speedFocused: 36,
        onShootStart: function () {
            if (this.projectile) {
                this.projectile.remove();
            }
            this.projectile = new Beam(this.world, 0, -10, 200, this.beamAngle || Util.toAngle("n"), 0, 0, 0, 0, 0, 2 + Math.floor(this.power) / 2, true, "beamBlue");
            this.projectile.damagePS = 40 + Math.floor(this.power) * 8;
            this.projectile.setAnchor(this);
            this.projectile.behavior = function () {
                if (Math.abs(this.anchor.x1) > 0.1) {
                    this.aTarget = Util.toAngle(this.anchor.x1 > 0 ? "nnw" : "nne");
                } else {
                    this.aTarget = Util.toAngle("n");
                }
                if (this.anchor.focused) {
                    this.a1 = 0;
                } else if (Math.abs(this.aTarget - this.a0) > 0.02) {
                    this.a1 = this.aTarget > this.a0 ? 3 : -3;
                } else {
                    this.a1 = 0;
                    this.a0 = this.aTarget;
                }
            };
        },
        onShootEnd: function () {
            if (this.projectile) {
                this.beamAngle = this.projectile.a0;
                this.projectile.remove();
                this.projectile = null;
            }
        },
        onSpecial: function () {
            this.projectileSpecial = new Beam(this.world, 0, -10, 200, Util.toAngle("s"), 0, Math.PI * (Random.nextBool() ? 2 : -2), 0, 0, 0, 10, true, "beamBlueSpecial");
            this.projectileSpecial.damagePS = 500;
            this.projectileSpecial.breakable = false;
            this.projectileSpecial.removeTime = 1;
            this.projectileSpecial.setAnchor(this);
        },
        onBomb: function () {
            this.world.clearField(20);
        },
        onPowerChange: function (power) {
            if (this.projectile) {
                this.onShootEnd();
                this.onShootStart();
            }
        },
        onDeath: function () {
            if (this.projectile) {
                this.projectile.remove();
                this.projectile = null;
            }
        }
    },
    nBarashou: {
        playable: true,
        name: "Natsuki Barashou",
        description: "Equiped with an arsenal of sentry turrets",
        color: "#ff8",
        width: 0.5,
        speed: 100,
        speedFocused: 40,
        weapons: {
            turret: {
                width: 2,
                behavior: function () {
                    var a = -Math.PI / 2 - (this.count - 1) * Math.PI / 8 + this.index * Math.PI / 4;
                    this.x0 = Math.cos(a) * (this.player.focused ? 6 : 12);
                    this.y0 = Math.sin(a) * 6;
                },
                onShoot: function () {
                    var bullet = this.shootProjectile(-Math.PI / 2, 4, 480, 0, 2, "strike.blue");
                    bullet.playerSide = true;
                    bullet.damage = (1 + this.player.damageInc) / (this.count + this.player.damageInc);
                }
            },
            turretAimed: {
                width: 2,
                behavior: function () {
                    var a = -Math.PI / 2 - (this.count - 1) * Math.PI / 8 + this.index * Math.PI / 4;
                    this.x0 = Math.cos(a) * (this.player.focused ? 6 : 12);
                    this.y0 = Math.sin(a) * 6;
                },
                onShoot: function () {
                    var bullet = this.shootProjectile(-Math.PI / 2, 4, 480, 0, 2, "strike.red");
                    bullet.playerSide = true;
                    bullet.damage = 1.5 * (1 + this.player.damageInc) / (this.count + this.player.damageInc);
                    if (this.player.focused) {
                        bullet.rangeForAim = 10;
                    } else {
                        bullet.rangeForAim = 100;
                    }
                    bullet.on(0, function () {
                        this.headToEntity(this.nearestEntity(Enemy, this.rangeForAim, Math.PI / 4, { isInvulnerable: false }), 480, 0);
                    }).repeat(this.player.focused ? 0.05 : 0.2);
                }
            },
            turretAuto: {
                width: 2,
                onHit: function () {
                    var t = this.lifetime;
                    if (this.restoreAt && this.restoreAt > t && this.vulnerableAt < t) {
                        this.destroy();
                    }
                    this.vulnerableAt = t + 1;
                    this.restoreAt = t + 5;
                },
                onShoot: function () {
                    if (this.restoreAt && this.restoreAt > this.lifetime) {
                        return;
                    }
                    var bullet = this.shootProjectile(this.angle, 4, 480, 0, 2, "strike.yellow");
                    bullet.playerSide = true;
                    bullet.damage = this.damage;
                }
            }
        },
        onPowerChange: function (power) {
            if (this.turrets) {
                for (let turret of this.turrets) {
                    turret.remove();
                }
            }
            this.turrets = [];
            var count = power + 1;
            for (let i = 0; i < count; i++) {
                var aimed = count > 3 && (i === 0 || i === count - 1) || count === 3 && i === 1;
                var turret = new Weapon(this, aimed ? "turretAimed" : "turret", true);
                turret.index = i;
                turret.count = count;
                turret.invulnerable = true;
                this.turrets.push(turret);
            }
        },
        onShoot: function () {
            for (let turret of this.turrets) {
                turret.onShoot();
            }
        },
        onBomb: function () {
            this.world.clearField(20);
        },
        onSpecial: function () {
            var turret = new Weapon(this, "turretAuto", false);
            turret.on(this.shotCooldownDefault, function () {
                this.onShoot();
            }).repeat(this.shotCooldownDefault);
            turret.damage = (1 + this.damageInc) / (Math.floor(this.power) + 1 + this.damageInc);
            turret.angle = this.isMaxBonus() ? Math.PI / 2 : -Math.PI / 2;
            turret.addDrops("power", 3);
        }
    },
    rBarashou: {
        name: "Ryou Barashou",
        color: "#f40"
    },
    kedama: {
        name: "The Kedama",
        color: "#fff",
        width: 12
    },
    orb: {
        name: "O.R.B.",
        width: 6
    },
    marisa: {
        name: "Marisa Kirisame",
        width: 2
    },
    okuu: {
        name: "Utsuho Reiuji",
        width: 2
    },
    lily: {
        name: "Lily Black",
        width: 2
    }
};
