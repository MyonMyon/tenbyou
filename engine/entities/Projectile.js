class Projectile extends Entity {
    constructor(world, x, y, x1, y1, x2, y2, width, playerSide = false, spriteName) {
        super(world, x, y, x1, y1, x2, y2, width);
        this.sprite.set(SPRITE.projectile);
        if (spriteName) {
            let s = spriteName.split(".");
            this.sprite.set(s[0]);
            if (s[1] && SPRITE.projectile[s[1]]) {
                this.sprite.setPositionShift(SPRITE.projectile[s[1]].x, SPRITE.projectile[s[1]].y);
            }
            this.rotate = SPRITE.projectile[s[0]].rotate;
        }
        this.playerSide = playerSide;
        this.soundPlayed = false;
        this.grazed = 0;
        this.damage = 1;
    }

    draw(context) {
        if (!this.width) {
            return;
        }

        let ePos = this.world.vp.toScreenFX(this.x, this.y);

        if (this.playerSide) {
            context.globalAlpha = 0.4;
        }

        context.save();
        context.translate(ePos.x, ePos.y);
        if (this.rotate || this.angle || this.a0) {
            let a = this.useAnchorAngle ? this.anchor.getAngle() : this.getAngle();
            context.rotate(a - Math.PI / 2 + this.angle + this.a0);
        }

        this.sprite.draw(context, 0, 0, this.playerSide ? this.world.relTime() : this.lifetime, this.world.vp.zoom * this.width * 2);

        context.restore();

        if (this.world.drawHitboxes) {
            context.fillStyle = "white";

            context.beginPath();

            context.arc(ePos.x, ePos.y, 1 * this.world.vp.zoom * this.width, 0, Math.PI * 2, false);

            context.fill();
            context.closePath();
        }

        context.globalAlpha = 1;
    }

    step() {
        super.step();

        if (!this.soundPlayed && !this.playerSide) {
            Sound.play(SFX.enemyShot);
            this.soundPlayed = true;
        }
        if (!this.preserve) {
            let div = this.playerSide ? 1.8 : 2;
            //remove from world
            if (this.x > this.world.width / div + this.width * 2
                || this.x < -this.world.width / div - this.width * 2
                || this.y > this.world.height / div + this.width * 2
                || this.y < -this.world.height / div - this.width * 2)
                this.remove();
        }

        this.behavior();
    }

    behavior() {
    }
}
