function Text(parentWorld, x, y, content, max) {
    extend(this, new Entity(parentWorld, x, y));
    this.removeAt = 20;
    this.fadeTime = 5;
    this.content = content;
    this.max = max;
    this.y1 = -1;
}

Text.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    context.textAlign = "center";
    context.globalAlpha = Math.max(0, Math.min(1, (this.removeAt - this.lifetime) / 5));
    this.parentWorld.vp.setFont(FONT.points, {max: this.max});
    this.parentWorld.vp.drawText(this.content, ePos.x, ePos.y);
    context.globalAlpha = 1;
};

Text.prototype.step = function () {
    this.$step();

    //remove from world
    if (this.lifetime > this.removeAt)
        this.remove();
};
