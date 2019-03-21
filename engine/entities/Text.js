class Text extends Entity {
    constructor(world, x, y, content, max, cat) {
        super(world, x, y, 0, cat === "power" ? -20 : -30);
        this.removeTime = 0.66;
        this.fadeTime = 0.16;
        this.content = content;
        this.max = max;
        this.cat = cat;
    }

    draw(context) {
        var ePos = this.world.vp.toScreenFX(this.x, this.y);
        context.textAlign = "center";
        context.globalAlpha = Math.max(0, Math.min(1, (this.removeTime - this.lifetime) * 6));
        var d = {};
        if (this.max) {
            d[this.cat + "Max"] = true;
        } else {
            d[this.cat] = true;
        }
        this.world.vp.setFont(FONT.points, d);
        this.world.vp.drawText(this.content, ePos.x, ePos.y);
        context.globalAlpha = 1;
    }
}
