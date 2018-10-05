function Text(parentWorld, x, y, content) {
    extend(this, new Entity(parentWorld, x, y));
    this.removeAt = 20;
    this.fadeTime = 5;
    this.content = content;
}

Text.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    context.textAlign = "center";
    context.globalAlpha = Math.max(0, Math.min(1, (this.removeAt - this.lifetime) / 5));
    this.parentWorld.vp.setFont(FONT.points);
    this.parentWorld.vp.drawText(this.content, ePos.x, ePos.y);
    context.globalAlpha = 1;
};

Text.prototype.step = function () {
    this.$step();

    //remove from world
    if (this.lifetime > this.removeAt)
        this.remove();
};
