function Bonus(world, x, y, cat, small, autoGather) {
    extend(this, new Entity(world, x, y, Math.random() * 20 - 10, -60, 0, 90, 0));

    this.cat = cat;
    this.small = small;
    this.autoGather = autoGather || false;
    this.sprite.set(SPRITE.bonus);
    var o = JSON.parse(JSON.stringify(SPRITE.bonus[small ? "small" : "large"]));
    for (var i in SPRITE.bonus[cat]) {
        o[i] = SPRITE.bonus[cat][i];
    }
    this.sprite.setPosition(o.x, o.y);
}

Bonus.prototype.draw = function (context) {
    var minHeight = -this.world.height / 2 + 3;
    var offScreen = this.y < minHeight;
    var ePos = this.world.vp.toScreen(this.x, offScreen ? minHeight : this.y);
    this.sprite.setPositionShift(offScreen * SPRITE.bonus.offScreen.x || 0, offScreen * SPRITE.bonus.offScreen.y || 0);

    context.save();
    context.translate(ePos.x, ePos.y);
    if (!offScreen && this.y1 < 0) {
        context.rotate(this.relTime() * (this.id % 2 ? 10 : -10));
    }
    this.sprite.draw(context, 0, 0, 0, 6 * this.world.vp.zoom);
    context.restore();
};

Bonus.prototype.step = function () {
    this.$step();

    //remove from world
    if (this.y > this.world.height / 2 + 5)
        this.remove();

    //reflect
    var offScreen = Math.abs(this.x) - this.world.width / 2;
    if (offScreen > 0) {
        var offSpeed = offScreen * 5; //show on screen in 0.2 seconds
        if (Math.abs(this.x1) > offSpeed) {
        } else {
            this.x1 = this.x > 0 ? -offSpeed : offSpeed;
            console.log("MORE", offSpeed, this, this.world.width / 2);
        }
    }

    //collision
    var d = this.world.distanceBetweenEntities(this, this.world.player);

    if (this.autoGather)
        this.headToEntity(this.world.player, 120, 0);

    if (d < this.world.player.gatherWidth || this.world.player.autoGatherTime > 0) {
        this.autoGather = true;
    }

    if (d < this.world.player.gatherWidthFinal) {
        this.remove();
        var oldScore = this.world.player.score;
        var oldPower = this.world.player.power;
        var max = this.world.player.isMaxBonus();
        var mx = max ? 1 : 0.5;
        switch (this.cat) {
            case "point":
                this.world.player.points += (this.small ? 0 : 1);
                this.world.player.score += (this.small ? 100 : 200) * mx;
                this.world.player.gatherValue += (this.small ? 1 : 2);
                break;
            case "power":
                this.world.player.gatherValue += (this.small ? 1 : 2);
                if (this.world.player.power < this.world.player.powerMax)
                    this.world.player.addPower((this.small ? 0.1 : 1) * mx);
                else
                    this.world.player.score += (this.small ? 100 : 200) * mx;
                break;
            case "debuff":
                this.world.player.addPower(this.small ? -0.1 : -1);
                break;
            case "gauge":
                this.world.player.addPower(this.small ? 1 : this.world.player.powerMax);
                break;
            case "bombs":
                if (((this.world.player.bombs === 8 && this.world.player.bombParts === 0) || this.world.player.bombs < 8) && !this.small)
                    ++this.world.player.bombs;
                else if (this.world.player.bombs <= 8 && this.small)
                    ++this.world.player.bombParts;
                else {
                    this.world.player.score += (this.small ? 300 : 500) * mx;
                    this.world.player.bombs = 9;
                    this.world.player.bombParts = 0;
                }
                if (this.world.player.bombParts >= 4) {
                    this.world.player.bombParts -= 4;
                    ++this.world.player.bombs;
                }
                break;
            case "lives":
                if (((this.world.player.lives === 8 && this.world.player.lifeParts === 0) || this.world.player.lives < 8) && !this.small)
                    ++this.world.player.lives;
                else if (this.world.player.lives <= 8 && this.small)
                    ++this.world.player.lifeParts;
                else {
                    this.world.player.score += (this.small ? 500 : 2000) * mx;
                    this.world.player.lives = 9;
                    this.world.player.lifeParts = 0;
                }
                if (this.world.player.lifeParts >= 3) {
                    this.world.player.lifeParts -= 3;
                    ++this.world.player.lives;
                }
                break;
        }
        var score = this.world.player.score - oldScore;
        var power = this.world.player.power - oldPower;
        var cat = score ? "point" : "power";
        if (score || power) {
            var t = this.world.lastText;
            if (t && t.relTime() <= 0.04 && t.max === max && t.cat === cat) {
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
};
