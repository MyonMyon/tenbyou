function Beam(world, x, y, length, a, r, a1, r1, a2, r2, width, playerSide, spriteName) {
    extend(this, new Entity(world, x, y, 0, 0, 0, 0, width));
    this.sprite.set(SPRITE.beam);
    if (spriteName) {
        var s = spriteName.split(".");
        this.sprite.set(s[0]);
        if (s[1] && SPRITE.beam[s[1]]) {
            this.sprite.setPositionShift(SPRITE.beam[s[1]].x, SPRITE.beam[s[1]].y);
        }
        this.rotate = SPRITE.beam[s[0]].rotate;
    }

    this.playerSide = playerSide || false;
    this.soundPlayed = false;

    this.angle = a;
    this.setPolarVectors(a, r, a1, r1, a2, r2);
    this.length = length;
    this.grazed = 0;
    this.grazePS = 10;
    this.grazeTime = 0;
    this.damagePS = 10;
}

Beam.prototype.draw = function (context) {
    if (!this.width) {
        return;
    }

    var ePos = this.world.vp.toScreen(this.x, this.y);

    if (this.playerSide) {
        context.globalAlpha = 0.4;
    }

    /*
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
    var ePos2 = this.world.vp.toScreen(this.x + Math.cos(this.a0) * this.length, this.y + Math.sin(this.a0) * this.length);
    context.strokeStyle = "white";
    context.lineCap = "round";
    context.lineWidth = this.world.vp.zoom * this.width * 2;

    context.beginPath();
    context.moveTo(ePos.x, ePos.y);
    context.lineTo(ePos2.x, ePos2.y);
    context.stroke();
    context.closePath();
    //}

    context.globalAlpha = 1;
};

Beam.prototype.step = function () {
    this.$step();

    if (!this.soundPlayed && !this.playerSide) {
        Sound.play(SFX.enemyShot);
        this.soundPlayed = true;
    }

    this.behavior();
};

Beam.prototype.behavior = function () {
};
