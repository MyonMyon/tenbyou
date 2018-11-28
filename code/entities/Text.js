function Text(parentWorld, x, y, content, max, cat) {
    extend(this, new Entity(parentWorld, x, y, 0, cat === "power" ? -20 : -30));
    this.removeAt = 0.66;
    this.fadeTime = 0.16;
    this.content = content;
    this.max = max;
    this.cat = cat;
}

Text.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    context.textAlign = "center";
    context.globalAlpha = Math.max(0, Math.min(1, (this.removeAt - this.relTime()) * 6));
    var d = {};
    if (this.max) {
        d[this.cat + "Max"] = true;
    } else {
        d[this.cat] = true;
    }
    this.parentWorld.vp.setFont(FONT.points, d);
    this.parentWorld.vp.drawText(this.content, ePos.x, ePos.y);
    context.globalAlpha = 1;
};

Text.prototype.step = function () {
    this.$step();

    //remove from world
    if (this.relTime() > this.removeAt)
        this.remove();
};
