class Weapon extends Entity {
    constructor(player, name, anchored) {
        super(player.world, 0, 0);
        if (anchored) {
            this.setAnchor(player);
        } else {
            this.x = player.x;
            this.y = player.y;
        }
        this.player = player;
        var data = CHAR[player.name].weapons[name];
        this.name = name;
        this.drops = [];
        var propImport = ["behavior", "onShoot", "onHit", "onDestroy", "width"];
        for (var i in propImport) {
            var d = data[propImport[i]];
            if (d) {
                this[propImport[i]] = d;
            }
        }
        this.angle = -Math.PI / 2; //look north by default
        this.sprite.set(SPRITE.player);
        this.sprite.set(player.name);
        this.sprite.set(SPRITE.player[player.name].weapons[name]);
    }

    step() {
        super.step();

        if (!this.isInvulnerable()) {
            for (var i in this.world.entities) {
                var e = this.world.entities[i];
                if ((e instanceof Projectile || e instanceof Beam) &&
                    !e.playerSide &&
                    e.width &&
                    !e.harmless &&
                    Util.collisionCheck(this, e)) {
                    //collision
                    this.hit();
                }
            }
        }

        this.behavior();
    }

    hit() {
        this.world.splash(this, 3, 8, 0.33);
        this.onHit();
    }

    destroy() {
        new Particle(this.world, this.x, this.y, 0.66, 8, false, false, "splash");
        for (var i in this.drops) {
            this.dropBonus(
                Random.nextFloat(Math.PI * 2),
                Random.nextFloat(5),
                this.drops[i].cat);
        }
        this.onDestroy();
        this.remove();
    }

    behavior() {
        //Override with CHAR data!
    }

    onShoot() {
        //Override with CHAR data!
    }

    onHit() {
        //Override with CHAR data!
        //default behavior:
        this.destroy();
    }

    onDestroy() {
        //Override with CHAR data!
    }

    draw(context) {
        if (this.removalMark || this.anchor === this.player && this.player.respawnTime !== null) {
            return; //bye-bye!
        }
        var ctx = this.world.vp.context;
        var ePos = this.world.vp.toScreenFX(this.x, this.y);
        ctx.save();
        ctx.translate(ePos.x, ePos.y);
        ctx.rotate(Math.PI / 2 + this.angle);
        this.sprite.draw(ctx, 0, 0, this.lifetime, this.width * 2 * this.world.vp.zoom, true);
        ctx.restore();
        if (this.world.drawHitboxes) {
            context.fillStyle = "white";

            context.beginPath();

            context.arc(ePos.x, ePos.y, 1 * this.world.vp.zoom * this.width, 0, Math.PI * 2, false);

            context.fill();
            context.closePath();
        }
    }
}
