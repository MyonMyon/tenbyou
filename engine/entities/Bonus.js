class Bonus extends Entity {
    constructor(world, x, y, cat, autoGather = false) {
        super(world, x, y, Random.nextFloat(20) - 10, -60, 0, 90, 0);

        this.cat = cat;
        this.autoGather = autoGather;
        this.sprite.set(SPRITE.bonus);
        this.sprite.set(cat);
    }

    draw(context) {
        let minHeight = -this.world.height / 2 + 3;
        let offScreen = this.y < minHeight;
        let ePos = this.world.vp.toScreenFX(this.x, offScreen ? minHeight : this.y);
        this.sprite.setPositionShift(offScreen * SPRITE.bonus.offScreen.x || 0, offScreen * SPRITE.bonus.offScreen.y || 0);

        context.save();
        if (offScreen) {
            context.globalAlpha = Math.max(0, 1 + (this.world.height / 2 + this.y) / (this.world.height / 2));
        }
        context.translate(ePos.x, ePos.y);
        if (!offScreen && this.y1 < 0 && !BONUS[this.cat].still) {
            context.rotate(this.lifetime * (this.id % 2 ? 10 : -10));
        }
        this.sprite.draw(this.world.vp, 0, 0, 0, 6 * this.world.vp.zoom);
        context.restore();
    }

    step() {
        super.step();

        //remove from world
        if (this.y > this.world.height / 2 + 5)
            this.remove();

        //reflect
        let offScreen = Math.abs(this.x) - this.world.width / 2;
        if (offScreen > 0) {
            let offSpeed = offScreen * 5; //show on screen in 0.2 seconds
            if (Math.abs(this.x1) > offSpeed) {
                this.x1 = -this.x1;
            } else {
                this.x1 = this.x > 0 ? -offSpeed : offSpeed;
            }
        }

        //collision
        let d = Util.distanceBetweenEntities(this, this.world.player);

        if (this.autoGather)
            this.headToEntity(this.world.player, 120, 0);

        if (d < this.world.player.gatherWidth || this.world.player.autoGatherTime > 0) {
            this.autoGather = true;
        }

        if (d < this.world.player.gatherWidthFinal) {
            this.world.vp.sound.play(SFX.itemCollect);
            this.remove();
            let oldScore = this.world.player.score;
            let oldPower = this.world.player.power;
            let max = this.world.player.isMaxBonus();
            let mx = max ? 1 : 0.5;

            let ref = BONUS[this.cat];
            if (ref.points) {
                this.world.player.points += ref.points;
            }
            if (ref.gatherValue) {
                this.world.player.gatherValue += ref.gatherValue;
            }
            if (ref.power) {
                let p = ref.power;
                if (ref.itemLinePenalty) {
                    p *= mx;
                }
                if (!this.world.player.addPower(p)) {
                    ref = BONUS[ref.maxFallback];
                }
            }
            if (ref.bombs || ref.bombParts) {
                if (!this.world.player.addBombs(ref.bombs || 0, ref.bombParts || 0)) {
                    ref = BONUS[ref.maxFallback];
                }
            }
            if (ref.lives || ref.lifeParts) {
                if (!this.world.player.addLives(ref.lives || 0, ref.lifeParts || 0)) {
                    ref = BONUS[ref.maxFallback];
                }
            }
            if (ref.score) {
                let s = ref.score;
                if (ref.itemLinePenalty) {
                    s *= mx;
                }
                this.world.player.score += s;
            }

            let score = this.world.player.score - oldScore;
            let power = this.world.player.power - oldPower;
            let cat = score ? "point" : "power";
            if (score || power) {
                let t = this.world.lastText;
                if (t && t.lifetime <= 0.04 && t.max === max && t.cat === cat) {
                    t.content = +t.content + (score || power);
                    if (power) {
                        t.content = (t.content + 0.001).toFixed(2);
                    }
                    t.lifetime = 0;
                    t.x = this.world.player.x;
                    t.y = this.world.player.y - 10;
                } else {
                    this.world.lastText = new Text(
                        this.world,
                        this.world.player.x,
                        this.world.player.y - 10,
                        score || (power + 0.001).toFixed(2),
                        max,
                        cat);
                }
            }
        }
    }
}
