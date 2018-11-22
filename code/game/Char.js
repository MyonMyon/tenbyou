var CHAR = {
    barashou: {
        name: "Natsuki Barashou",
        width: 0.5,
        onShoot: function () {
            var count = Math.floor(this.power + 1);
            for (var i = 0; i < count; ++i) {
                var special = count > 3 && (i === 0 || i === count - 1) || count === 3 && i === 1;
                var bullet = new Projectile(
                        this.parentWorld,
                        this.x + i * (this.focused ? 2 : 8) - (this.focused ? 1 : 4) * (count - 1),
                        this.y + Math.abs(i + 0.5 - count / 2) * 6 - 8,
                        0, -480, 0, 0, 2, true, special ? "strikeRed" : "strikeBlue");
                bullet.damage = (1 + this.damageInc) / (count + this.damageInc);
                if (special) {
                    if (this.focused) {
                        bullet.damage *= 1.5;
                        bullet.rangeForAim = 20;
                    } else {
                        bullet.rangeForAim = 100;
                    }
                    bullet.eventChain.addEvent(function (b) {
                        b.headToEntity(b.nearestEntity(Enemy, b.rangeForAim, {isInvulnerable: false}), 480, 0);
                    }, 0, 0.2, Infinity);
                }
            }
        },
        onBomb: function () {
            this.parentWorld.clearField(20);
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
