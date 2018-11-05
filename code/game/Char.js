var CHAR = {
    barashou: {
        name: "Natsuki Barashou",
        width: 0.5,
        onShoot: function () {
            var count = Math.floor(this.power + 1);
            for (var i = 0; i < count; ++i) {
                var special = count >= 3 && (i === 0 || i === count - 1);
                var bullet = new Projectile(
                        this.parentWorld,
                        this.x + i * (this.focused ? 2 : 8) - (this.focused ? 1 : 4) * (count - 1),
                        this.y + Math.abs(i + 0.5 - count / 2) * 6 - 8,
                        0, -240, 0, 0, 2, true, special ? "coinSpecial" : "coin");
                bullet.damage = (1 + this.damageInc) / (count + this.damageInc);
                if (special) {
                    if (this.focused) {
                        bullet.damage *= 1.5;
                    } else {
                        bullet.behavior = function () {
                            if (this.lifetime % 6 === 1) {
                                this.headToEntity(this.nearestEntity(Enemy, 200), 200, 0);
                            }
                        };
                    }
                }
            }
        },
        onBomb: function () {
            this.invulnTime = 100;
            this.parentWorld.clearField(20);
            this.autoGatherTime = 5;
        }
    },
    freyja: {
        name: "Freyja til Folkvang",
        width: 0.66,
        sprite: {
            //file: "freyja.png",
            width: 64,
            height: 64,
            frame: 0,
            frameCount: 4,
            animPeriod: 2,
            size: 1,
            dir: false
        },
        onShoot: function () {
        },
        onBomb: function () {
        }
    }
};
