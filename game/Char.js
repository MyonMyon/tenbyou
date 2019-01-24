var CHAR = {
    nBarashou: {
        playable: true,
        name: "Natsuki Barashou",
        color: "#ff8",
        width: 0.5,
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
                        this.headToEntity(this.nearestEntity(Enemy, this.rangeForAim, Math.PI / 4, {isInvulnerable: false}), 480, 0);
                    }).repeat(this.player.focused ? 0.05 : 0.2);
                }
            },
            turretAuto: {
                width: 2,
                onHit: function () {
                    var t = this.relTime();
                    if (this.restoreAt && this.restoreAt > t && this.vulnerableAt < t) {
                        this.destroy();
                    }
                    this.vulnerableAt = t + 1;
                    this.restoreAt = t + 5;
                },
                onShoot: function () {
                    if (this.restoreAt && this.restoreAt > this.relTime()) {
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
                for (var i in this.turrets) {
                    this.turrets[i].remove();
                }
            }
            this.turrets = [];
            var count = power + 1;
            for (var i = 0; i < count; i++) {
                var aimed = count > 3 && (i === 0 || i === count - 1) || count === 3 && i === 1;
                var turret = new Weapon(this, aimed ? "turretAimed" : "turret", true);
                turret.index = i;
                turret.count = count;
                turret.invulnerable = true;
                this.turrets.push(turret);
            }
        },
        onShoot: function () {
            for (var i in this.turrets) {
                this.turrets[i].onShoot();
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
    freyja: {
        name: "Freyja til Folkvang",
        width: 0.66,
        onShoot: function () {
        },
        onBomb: function () {
        }
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
    okuu: {
        name: "Utsuho Reiuji",
        width: 2
    },
    lily: {
        name: "Lily Black",
        width: 2
    }
};
