function Beam(world, x, y, length, a, r, a1, r1, a2, r2, width, playerSide, spriteName) {
    extend(this, new Projectile(world, x, y, 0, 0, 0, 0, width, playerSide, spriteName));

    this.angle = this.a0 = a;
    this.a1 = a1;
    this.a2 = a2;
    this.r0 = r;
    this.r1 = r1;
    this.r2 = r2;

    this.length = length;
    this.grazePerSecond = 10;
    this.grazeTime = 0;
}

Beam.prototype.draw = function (context) {
    if (!this.width) {
        return;
    }

    var ePos = this.world.vp.toScreen(this.x, this.y);

    /*
    if (this.playerSide) {
        context.globalAlpha = 0.4;
    }

    context.save();
    context.translate(ePos.x, ePos.y);
    if (this.rotate || this.angle) {
        var a = this.useAnchorAngle ? this.anchor.getAngle() : this.getAngle();
        context.rotate(a - Math.PI / 2 + this.angle);
    }

    this.sprite.draw(context, 0, 0, this.playerSide ? this.world.relTime() : this.relTime(), this.world.vp.zoom * this.width * 2);

    context.restore();
    */
    //if (this.world.drawHitboxes) {
        var ePos2 = this.world.vp.toScreen(this.x + Math.cos(this.angle) * this.length, this.y + Math.sin(this.angle) * this.length);
        context.strokeStyle = "white";
        context.lineWidth = this.width;

        context.beginPath();
        context.moveTo(ePos.x, ePos.y);
        context.lineTo(ePos2.x, ePos2.y);
        context.stroke();
        context.closePath();
    //}

    context.globalAlpha = 1;
};

Beam.prototype.step = function () {
    //this.$step();
};

Beam.prototype.behavior = function () {
};
