class Particle extends Entity {
    constructor(world, x, y, removeTime, width, randomFrame, moving, spriteName) {
        var a = Math.random() * Math.PI * 2;
        var r = 30 * (Math.random() + 0.1);
        super(world, x, y, moving ? r * Math.cos(a) : 0, moving ? r * Math.sin(a) : 0, 0, 0, width);
        this.removeTime = removeTime || 0.66;
        this.sprite.set(SPRITE.particle);
        if (spriteName) {
            this.sprite.set(spriteName);
        }
        if (randomFrame) {
            this.sprite.setRandomFrame();
        }
    }

    draw(context) {
        var ePos = this.world.vp.toScreenFX(this.x, this.y);
        this.sprite.draw(context, ePos.x, ePos.y, this.lifetime, this.world.vp.zoom * this.width);
    }
}
