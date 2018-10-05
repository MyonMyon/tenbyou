var CHAR = {
    barashou: {
        name: "Natsuki Barashou",
        width: 1,
        sprite: {
            //file: "barashou.png",
            width: 64,
            height: 64,
            frame: 0,
            frameCount: 4,
            animPeriod: 2,
            size: 1,
            dir: false
        },
        onShoot: function () {
            var count = Math.floor(this.power);
            for (var i = 0; i < count; ++i) {
                var bullet = new Projectile(
                        this.parentWorld,
                        this.x + i * (this.focused ? 2 : 8) - (this.focused ? 1 : 4) * (count - 1),
                        this.y + Math.abs(i + 0.5 - count / 2) * 6 - 8, 0, -8);
                bullet.width = 2;
                bullet.damage = (1 + this.damageInc) / (count + this.damageInc);
                bullet.playerside = true;
                var special = count >= 3 && (i === 0 || i === count - 1);
                bullet.setSprite(special ? 2 : 1, 2, 4);
                if (special)
                    bullet.behavior = function () {
                        if (this.lifetime % 6 === 1) {
                            this.headToEntity(this.nearestEntity(Enemy, 200), 200, 0);
                        }
                    };
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
        width: 2,
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
