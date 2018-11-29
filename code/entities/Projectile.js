function Projectile(parentWorld, x, y, x1, y1, x2, y2, width, playerSide, spriteName) {
    extend(this, new Entity(parentWorld, x, y, x1, y1, x2, y2, width));
    this.sprite.set(SPRITE.projectile);
    if (spriteName) {
        var s = spriteName.split(".");
        this.sprite.set(s[0]);
        if (s[1] && SPRITE.projectile[s[1]]) {
            this.sprite.setPositionShift(SPRITE.projectile[s[1]].x, SPRITE.projectile[s[1]].y);
        }
        this.rotate = SPRITE.projectile[s[0]].rotate;
    }
    this.playerSide = playerSide || false;
    this.grazed = 0;
    this.damage = 1;
}

Projectile.prototype.draw = function (context) {
    if (!this.width) {
        return;
    }

    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);

    if (this.playerSide) {
        context.globalAlpha = 0.4;
    }

    context.save();
    context.translate(ePos.x, ePos.y);
    if (this.rotate || this.angle) {
        var a = this.useAnchorAngle ? Math.atan2(this.anchor.y1, this.anchor.x1) : Math.atan2(this.y1, this.x1);
        context.rotate(a - Math.PI / 2 + this.angle);
    }

    this.sprite.draw(context, 0, 0, this.playerSide ? this.parentWorld.relTime() : this.relTime(), this.parentWorld.vp.zoom * this.width * 2);

    context.restore();

    if (this.parentWorld.drawHitboxes) {
        context.fillStyle = "white";

        context.beginPath();

        context.arc(ePos.x, ePos.y, 1 * this.parentWorld.vp.zoom * this.width, 0, Math.PI * 2, false);

        context.fill();
        context.closePath();
    }

    context.globalAlpha = 1;
};

Projectile.prototype.step = function () {
    this.$step();

    if (!this.preserve) {
        var div = this.playerSide ? 1.8 : 2;
        //remove from world
        if (this.x > this.parentWorld.width / div + this.width * 2
                || this.x < -this.parentWorld.width / div - this.width * 2
                || this.y > this.parentWorld.height / div + this.width * 2
                || this.y < -this.parentWorld.height / div - this.width * 2)
            this.remove();
    }

    if (!this.playerSide && this.width) {
        //collision
        var d = this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player);
        if (d < (this.width + this.parentWorld.player.width)) {
            this.remove();
            if (this.parentWorld.player.invulnTime <= 0)
                this.parentWorld.player.kill();
        } else if (d < (this.width + this.parentWorld.player.grazeWidth) && this.grazed < this.damage && this.parentWorld.player.invulnTime <= 0) {
            ++this.parentWorld.player.graze;
            var xD = this.parentWorld.player.x - this.x;
            var yD = this.parentWorld.player.y - this.y;
            var s = new Particle(this.parentWorld, this.parentWorld.player.x, this.parentWorld.player.y, 0.25, 8, false, false, "spark");
            s.setVectors(null, null, xD * 5, yD * 5);
            ++this.grazed;
        }
        for (var i in this.parentWorld.entities) {
            var w = this.parentWorld.entities[i];
            if (w instanceof Weapon && !w.isInvulnerable() && this.parentWorld.distanceBetweenEntities(this, w) < this.width + w.width) {
                this.remove();
                w.hit();
            }
        }
    }

    this.behavior();
};

Projectile.prototype.behavior = function () {
};