function Text(parentWorld, x, y, content, max) {
    extend(this, new Entity(parentWorld, x, y, 0, -30));
    this.removeAt = 0.66;
    this.fadeTime = 0.16;
    this.content = content;
    this.max = max;
}

Text.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    context.textAlign = "center";
    context.globalAlpha = Math.max(0, Math.min(1, (this.removeAt - this.relTime()) * 6));
    this.parentWorld.vp.setFont(FONT.points, {max: this.max});
    this.parentWorld.vp.drawText(this.content, ePos.x, ePos.y);
    context.globalAlpha = 1;
};

Text.prototype.step = function () {
    this.$step();

    //remove from world
    if (this.relTime() > this.removeAt)
        this.remove();
};
