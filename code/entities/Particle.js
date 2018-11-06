function Particle(parentWorld, x, y, removeAt, width, randomFrame, moving, spriteName) {
    var a = Math.random() * Math.PI * 2;
    var r = Math.random() + 0.1;
    extend(this, new Entity(parentWorld, x, y, moving ? r * Math.cos(a) : 0, moving ? r * Math.sin(a) : 0, 0, 0, width));
    this.removeAt = removeAt || 20;
    this.sprite.set(SPRITE.particle);
    if (spriteName) {
        this.sprite.set(spriteName);
    }
    if (randomFrame) {
        this.sprite.setRandomFrame();
    }
}

Particle.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    this.sprite.draw(context, ePos.x, ePos.y, this.relTime(), this.parentWorld.vp.zoom * this.width);
};

Particle.prototype.step = function () {
    this.$step();

    //remove from world
    if (this.lifetime > this.removeAt)
        this.remove();
};
