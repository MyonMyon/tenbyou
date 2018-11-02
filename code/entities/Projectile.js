function Projectile(parentWorld, x, y, x1, y1, x2, y2, width, playerSide, spriteName) {
    extend(this, new Entity(parentWorld,
            x,
            y,
            x1 / parentWorld.ticksPS,
            y1 / parentWorld.ticksPS,
            x2 / parentWorld.ticksPS,
            y2 / parentWorld.ticksPS,
            width));
    this.sh.setSprite(SPRITE.projectile);
    if (spriteName) {
        this.sh.setSprite(SPRITE.projectile[spriteName], spriteName);
    }
    this.playerSide = playerSide || false;
    this.grazed = 0;
    this.damage = 1;
}

Projectile.prototype.draw = function (context) {

    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);

    if (this.playerSide) {
        context.globalAlpha = 0.4;
    }

    context.translate(ePos.x, ePos.y);
    if (this.spriteDir || this.angle)
        context.rotate(Math.atan2(this.y1, this.x1) - Math.PI / 2 + this.angle);

    this.sh.draw(context, 0, 0, this.relTime(), this.parentWorld.vp.zoom * this.width * 2);

    if (this.spriteDir || this.angle)
        context.rotate(-Math.atan2(this.y1, this.x1) + Math.PI / 2 - this.angle);
    context.translate(-ePos.x, -ePos.y);

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

    var div = this.playerSide ? 1.8 : 2;
    //remove from world
    if (this.x > this.parentWorld.width / div + this.width * 2
            || this.x < -this.parentWorld.width / div - this.width * 2
            || this.y > this.parentWorld.height / div + this.width * 2
            || this.y < -this.parentWorld.height / div - this.width * 2)
        this.remove();

    if (!this.playerSide) {
        //collision
        var d = this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player);
        if (d < (this.width + this.parentWorld.player.width)) {
            this.remove();
            if (this.parentWorld.player.invulnTime === 0)
                this.parentWorld.player.kill();
        } else if (d < (this.width + this.parentWorld.player.grazeWidth) && this.grazed < this.damage && this.parentWorld.player.invulnTime === 0) {
            ++this.parentWorld.player.graze;
            new Particle(this.parentWorld, (this.x + this.parentWorld.player.x) / 2, (this.y + this.parentWorld.player.y) / 2, 4, 8, false, false, "spark");
            ++this.grazed;
        }
    }

    this.behavior();
};

Projectile.prototype.behavior = function () {
};