function Bonus(parentWorld, x, y, cat, small, autoGather) {
    extend(this, new Entity(parentWorld, x, y, Math.random() * 20 - 10, -60, 0, 90, 0));

    this.cat = cat;
    this.small = small;
    this.autoGather = autoGather || false;
    this.sprite.set(SPRITE.bonus);
    var o = SPRITE.bonus[small ? "small" : "large"];
    Object.assign(o, SPRITE.bonus[cat]);
    this.sprite.setPosition(o.x, o.y);
}

Bonus.prototype.draw = function (context) {
    var minHeight = -this.parentWorld.height / 2 + 3;
    var offScreen = this.y < minHeight;
    var ePos = this.parentWorld.vp.toScreen(this.x, offScreen ? minHeight : this.y);
    this.sprite.setPositionShift(offScreen * SPRITE.bonus.offScreen.x || 0, offScreen * SPRITE.bonus.offScreen.y || 0);
    this.sprite.draw(context, ePos.x, ePos.y, 0, 6 * this.parentWorld.vp.zoom);
};

Bonus.prototype.step = function () {
    this.$step();

    //remove from world
    if (this.y > this.parentWorld.height / 2 + 5)
        this.remove();

    //reflect
    if (this.x > this.parentWorld.width / 2 || this.x < -this.parentWorld.width / 2) {
        this.x1 = -this.x1;
    }

    //collision
    var d = this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player);

    if (this.autoGather)
        this.headToEntity(this.parentWorld.player, 120, 0);

    if (d < this.parentWorld.player.gatherWidth || this.parentWorld.player.autoGatherTime > 0) {
        this.autoGather = true;
    }

    if (d < this.parentWorld.player.gatherWidthFinal) {
        this.remove();
        var oldScore = this.parentWorld.player.score;
        var oldPower = this.parentWorld.player.power;
        var max = this.parentWorld.player.y < -this.parentWorld.width / 3;
        var mx = max ? 1 : 0.5;
        switch (this.cat) {
            case "point":
                this.parentWorld.player.points += (this.small ? 0 : 1);
                this.parentWorld.player.score += (this.small ? 100 : 200) * mx;
                this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
                break;
            case "power":
                this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
                if (this.parentWorld.player.power < this.parentWorld.player.powerMax)
                    this.parentWorld.player.addPower(this.small ? 0.05 : 0.5);
                else
                    this.parentWorld.player.score += (this.small ? 100 : 200) * mx;
                break;
            case "gauge":
                this.parentWorld.player.addPower(this.small ? 1 : this.parentWorld.player.powerMax);
                break;
            case "bombs":
                if (((this.parentWorld.player.bombs === 8 && this.parentWorld.player.bombParts === 0) || this.parentWorld.player.bombs < 8) && !this.small)
                    ++this.parentWorld.player.bombs;
                else if (this.parentWorld.player.bombs <= 8 && this.small)
                    ++this.parentWorld.player.bombParts;
                else {
                    this.parentWorld.player.score += (this.small ? 300 : 500) * mx;
                    this.parentWorld.player.bombs = 9;
                    this.parentWorld.player.bombParts = 0;
                }
                if (this.parentWorld.player.bombParts >= 4) {
                    this.parentWorld.player.bombParts -= 4;
                    ++this.parentWorld.player.bombs;
                }
                break;
            case "lives":
                if (((this.parentWorld.player.lives === 8 && this.parentWorld.player.lifeParts === 0) || this.parentWorld.player.lives < 8) && !this.small)
                    ++this.parentWorld.player.lives;
                else if (this.parentWorld.player.lives <= 8 && this.small)
                    ++this.parentWorld.player.lifeParts;
                else {
                    this.parentWorld.player.score += (this.small ? 500 : 2000) * mx;
                    this.parentWorld.player.lives = 9;
                    this.parentWorld.player.lifeParts = 0;
                }
                if (this.parentWorld.player.lifeParts >= 3) {
                    this.parentWorld.player.lifeParts -= 3;
                    ++this.parentWorld.player.lives;
                }
                break;
        }
        var score = this.parentWorld.player.score - oldScore;
        var power = this.parentWorld.player.power - oldPower;
        var cat = score ? "point" : "power";
        if (score || power) {
            var t = this.parentWorld.lastText;
            if (t && t.relTime() <= 0.04 && t.max === max && t.cat === cat) {
                t.content = +t.content + (score || power);
                if (power) {
                    t.content = (t.content + 0.001).toFixed(2);
                }
                t.lifetime = 0;
                t.x = this.parentWorld.player.x;
                t.y = this.parentWorld.player.y - 10;
            } else {
                this.parentWorld.lastText = new Text(
                        this.parentWorld,
                        this.parentWorld.player.x,
                        this.parentWorld.player.y - 10,
                        score || (power + 0.001).toFixed(2),
                        max,
                        cat);
            }
        }
    }
};
