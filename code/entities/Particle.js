function Particle(parentWorld, x, y, removeAt, width, randomFrame, moving, spriteName) {
    //, frameCount, animPeriod, spriteWidth, spriteDir
    var a = Math.random() * Math.PI * 2;
    var r = Math.random() + 0.1;
    extend(this, new Entity(parentWorld, x, y, moving ? r * Math.cos(a) : 0, moving ? r * Math.sin(a) : 0, 0, 0, width));
    //sprite, frameCount > 0 ? frameCount : (SPRITE.particle.object.height / SPRITE.particle.height), animPeriod, spriteWidth, spriteDir));
    this.removeAt = removeAt || 20;
    this.sh.setSprite(SPRITE.particle);
    this.sh.setPosition(SPRITE.particle[spriteName].x, SPRITE.particle[spriteName].y);
    //this.frame = randomFrame ? Math.floor(Math.random() * SPRITE.particle.object.height / SPRITE.particle.height) : -1;
}

Particle.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    this.sh.draw(con)
    context.drawImage(SPRITE.particle.object,
            this.sprite * SPRITE.particle.frameWidth,
            (this.frame === -1 ? (Math.floor(this.lifetime / this.animPeriod) % (SPRITE.particle.object.height / SPRITE.particle.height)) : this.frame) * SPRITE.particle.frameHeight,
            SPRITE.particle.frameWidth, SPRITE.particle.frameHeight,
            ePos.x - this.parentWorld.vp.zoom * this.width / 2,
            ePos.y - this.parentWorld.vp.zoom * this.width / 2,
            this.parentWorld.vp.zoom * this.width,
            this.parentWorld.vp.zoom * this.width);
};

Particle.prototype.step = function () {
    this.$step();

    //remove from world
    if (this.lifetime > this.removeAt)
        this.remove();
};
