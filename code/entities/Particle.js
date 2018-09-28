function Particle(parentWorld, x, y, removeAt, width, randomFrame, moving, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    var a = Math.random() * Math.PI * 2;
    var r = Math.random() + 0.1;
    extend(this, new Entity(parentWorld, x, y, moving ? r * Math.cos(a) : 0, moving ? r * Math.sin(a) : 0, 0, 0, width,
            sprite, frameCount > 0 ? frameCount : (parentWorld.vp.imgParticle.height / IMAGE_ENEMY_HEIGHT), animPeriod, spriteWidth, spriteDir));
    this.removeAt = removeAt || 20;
    this.frame = randomFrame ? Math.floor(Math.random() * parentWorld.vp.imgParticle.height / IMAGE_PARTICLE_HEIGHT) : -1;
}

Particle.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    context.drawImage(this.parentWorld.vp.imgParticle,
            this.sprite * IMAGE_PARTICLE_WIDTH,
            (this.frame === -1 ? (Math.floor(this.lifetime / this.animPeriod) % (this.parentWorld.vp.imgParticle.height / IMAGE_PARTICLE_HEIGHT)) : this.frame) * IMAGE_PARTICLE_HEIGHT,
            IMAGE_PARTICLE_WIDTH, IMAGE_PARTICLE_HEIGHT,
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
