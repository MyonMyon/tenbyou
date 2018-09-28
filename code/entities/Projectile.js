function Projectile(parentWorld, x, y, x1, y1, x2, y2, width, playerside, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    extend(this, new Entity(parentWorld, x, y, x1, y1, x2, y2, width,
            sprite || (this.playerside ? 1 : 0), frameCount > 0 ? frameCount : (parentWorld.vp.imgProjectile.height / IMAGE_PROJECTILE_HEIGHT), animPeriod, spriteWidth, spriteDir));
    this.playerside = playerside || false;
    this.grazed = 0;
    this.damage = 1;
}

Projectile.prototype.draw = function (context) {

    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);

    context.translate(ePos.x, ePos.y);
    if (this.spriteDir)
        context.rotate(Math.atan2(this.y1, this.x1) - Math.PI / 2);

    context.drawImage(this.customSprite ? this.customSprite : this.parentWorld.vp.imgProjectile,
            this.sprite * (this.customSprite ? this.customSpriteWidth : IMAGE_PROJECTILE_WIDTH),
            Math.floor(this.parentWorld.time / this.animPeriod) % this.frameCount * (this.customSprite ? this.customSpriteHeight : IMAGE_PROJECTILE_HEIGHT),
            this.customSprite ? this.customSpriteWidth : IMAGE_PROJECTILE_WIDTH,
            this.customSprite ? this.customSpriteHeight : IMAGE_PROJECTILE_HEIGHT,
            -this.width * this.parentWorld.vp.zoom,
            -this.width * this.parentWorld.vp.zoom,
            this.width * 2 * this.parentWorld.vp.zoom,
            this.width * 2 * this.parentWorld.vp.zoom);

    if (this.spriteDir)
        context.rotate(-Math.atan2(this.y1, this.x1) + Math.PI / 2);
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

    //remove from world
    if (this.x > this.parentWorld.width / 2 + this.width * 2
            || this.x < -this.parentWorld.width / 2 - this.width * 2
            || this.y > this.parentWorld.height / 2 + this.width * 2
            || this.y < -this.parentWorld.height / 2 - this.width * 2)
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
            new Particle(this.parentWorld, (this.x + this.parentWorld.player.x) / 2, (this.y + this.parentWorld.player.y) / 2, 4, 8, false, false, 1, 0, 1);
            ++this.grazed;
        }
    }

    this.behavior();
};

Projectile.prototype.behavior = function () {
};