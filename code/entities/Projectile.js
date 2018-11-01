function Projectile(parentWorld, x, y, x1, y1, x2, y2, width, playerside, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    extend(this, new Entity(parentWorld, x, y, x1, y1, x2, y2, width,
            sprite || (this.playerside ? 1 : 0), frameCount > 0 ? frameCount : (SPRITE.projectile.object.height / SPRITE.projectile.height), animPeriod, spriteWidth, spriteDir));
    this.playerside = playerside || false;
    this.grazed = 0;
    this.damage = 1;
}

Projectile.prototype.draw = function (context) {

    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);

    context.translate(ePos.x, ePos.y);
    if (this.spriteDir || this.angle)
        context.rotate(Math.atan2(this.y1, this.x1) - Math.PI / 2 + this.angle);

    context.drawImage(this.customSprite ? this.customSprite : SPRITE.projectile.object,
            this.sprite * (this.customSprite ? this.customSpriteWidth : SPRITE.projectile.frameWidth),
            Math.floor(this.parentWorld.time / this.animPeriod) % this.frameCount * (this.customSprite ? this.customSpriteHeight : SPRITE.projectile.frameHeight),
            this.customSprite ? this.customSpriteWidth : SPRITE.projectile.frameWidth,
            this.customSprite ? this.customSpriteHeight : SPRITE.projectile.frameHeight,
            -this.width * this.parentWorld.vp.zoom,
            -this.width * this.parentWorld.vp.zoom,
            this.width * 2 * this.parentWorld.vp.zoom,
            this.width * 2 * this.parentWorld.vp.zoom);

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
};

Projectile.prototype.step = function () {
    this.$step();

    var div = this.playerside ? 1.8 : 2;
    //remove from world
    if (this.x > this.parentWorld.width / div + this.width * 2
            || this.x < -this.parentWorld.width / div - this.width * 2
            || this.y > this.parentWorld.height / div + this.width * 2
            || this.y < -this.parentWorld.height / div - this.width * 2)
        this.remove();

    if (!this.playerside) {
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