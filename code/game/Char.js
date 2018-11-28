var CHAR = {
    barashou: {
        name: "Natsuki Barashou",
        width: 0.5,
        weapons: {
            turret: {
                width: 2,
                behavior: function () {
                    var a = -Math.PI - (this.count - 1) * Math.PI / 8 + this.index * Math.PI / 4;
                    this.x0 = Math.sin(a) * (this.player.focused ? 6 : 12);
                    this.y0 = Math.cos(a) * 6;
                },
                onShoot: function () {
                    var bullet = this.shootProjectile(-Math.PI, 4, 480, 0, 2, "strike.blue");
                    bullet.playerSide = true;
                    bullet.damage = (1 + this.player.damageInc) / (this.count + this.player.damageInc);
                }
            },
            turretAimed: {
                width: 2,
                behavior: function () {
                    var a = -Math.PI - (this.count - 1) * Math.PI / 8 + this.index * Math.PI / 4;
                    this.x0 = Math.sin(a) * (this.player.focused ? 6 : 12);
                    this.y0 = Math.cos(a) * 6;
                },
                onShoot: function () {
                    var bullet = this.shootProjectile(-Math.PI, 4, 480, 0, 2, "strike.red");
                    bullet.playerSide = true;
                    bullet.damage = 1.5 * (1 + this.player.damageInc) / (this.count + this.player.damageInc);
                    if (this.player.focused) {
                        bullet.rangeForAim = 10;
                    } else {
                        bullet.rangeForAim = 100;
                    }
                    bullet.eventChain.addEvent(function (b) {
                        b.headToEntity(b.nearestEntity(Enemy, b.rangeForAim, {isInvulnerable: false}), 480, 0);
                    }, 0, this.player.focused ? 0.05 : 0.2, Infinity);
                }
            },
            turretAuto: {
                width: 2,
                onShoot: function () {
                    var bullet = this.shootProjectile(-Math.PI, 4, 480, 0, 2, "strike.yellow");
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
            this.parentWorld.clearField(20);
        },
        onSpecial: function () {
            var turret = new Weapon(this, "turretAuto", false);
            turret.eventChain.addEvent(function () {
                turret.onShoot();
            }, this.shotCooldownDefault, this.shotCooldownDefault, Infinity);
            turret.damage = (1 + this.damageInc) / (Math.floor(this.power) + 1 + this.damageInc);
        }
    },
    freyja: {
        name: "Freyja til Folkvang",
        width: 0.66,
        onShoot: function () {
        },
        onBomb: function () {
        }
    }
};
