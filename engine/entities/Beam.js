class Beam extends Entity {
    constructor(world, x, y, length, a, r, a1, r1, a2, r2, width, playerSide = false, spriteName) {
        super(world, x, y, 0, 0, 0, 0, width);
        this.spriteBeam = new SpriteHandler();
        this.spriteBeam.set(SPRITE.beam);
        if (spriteName) {
            let s = spriteName.split(".");
            this.spriteBeam.set(s[0]);
            if (s[1] && SPRITE.beam[s[1]]) {
                this.spriteBeam.setPositionShift(SPRITE.beam[s[1]].x, SPRITE.beam[s[1]].y);
            }
            this.rotate = SPRITE.beam[s[0]].rotate;
            if (SPRITE.beam[s[0]].joint) {
                this.sprite.set(SPRITE.beam);
                this.sprite.set(SPRITE.beam[s[0]].joint);
            }
        }

        this.playerSide = playerSide;
        this.soundPlayed = false;

        this.angle = a;
        this.setPolarVectors(a, r, a1, r1, a2, r2);
        this.length = this.maxLength = length;
        this.breakable = true;

        this.grazed = 0;
        this.grazePS = 10;
        this.grazeTime = 0;
        this.damagePS = 10;

        this.harmless = false;
    }

    draw(context) {
        if (!this.width) {
            return;
        }

        let ePos = this.world.vp.toScreenFX(this.x, this.y);

        if (this.playerSide || this.harmless) {
            context.globalAlpha = 0.4;
        }

        context.save();
        context.translate(ePos.x, ePos.y);
        context.rotate(this.a0 - Math.PI / 2);

        if (this.sprite.ref) {
            this.sprite.draw(
                context, 0, 0,
                this.playerSide ? this.world.relTime() : this.lifetime,
                this.world.vp.zoom * this.width * 2);

            context.rotate(Math.PI);
            this.sprite.draw(
                context, 0, this.world.vp.zoom * -this.length,
                this.playerSide ? this.world.relTime() : this.lifetime,
                this.world.vp.zoom * this.width * 2);
            context.rotate(-Math.PI);
        }

        this.spriteBeam.draw(
            context,
            0,
            this.world.vp.zoom * this.width * this.spriteBeam.zoom,
            this.playerSide ? this.world.relTime() : this.lifetime,
            this.world.vp.zoom * this.width * 2,
            this.length / (this.width * 2 * this.spriteBeam.zoom));

        context.restore();

        if (this.world.drawHitboxes) {
            let ePos2 = this.world.vp.toScreenFX(this.x + Math.cos(this.a0) * this.length, this.y + Math.sin(this.a0) * this.length);
            context.strokeStyle = "white";
            context.lineCap = "round";
            context.lineWidth = this.world.vp.zoom * this.width * 2;

            context.beginPath();
            context.moveTo(ePos.x, ePos.y);
            context.lineTo(ePos2.x, ePos2.y);
            context.stroke();
            context.closePath();
        }

        context.globalAlpha = 1;
    }

    break(length) {
        if (this.breakable && length < this.length) {
            this.length = length;
        }
    }

    step() {
        super.step();

        if (!this.soundPlayed && !this.playerSide) {
            Sound.play(SFX.enemyShot);
            this.soundPlayed = true;
        }

        this.behavior();
        this.length = this.maxLength;
    }

    behavior() {
    }
}
