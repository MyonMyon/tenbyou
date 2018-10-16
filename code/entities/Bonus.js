function Bonus(parentWorld, x, y, cat, small, autoGather) {
    this.types = [
        "power",
        "point",
        "bombs",
        "lives",
        "gauge"
    ];

    extend(this, new Entity(parentWorld, x, y, 0, -2, 0, 0.1, 0));

    this.cat = cat;
    this.small = small;
    this.autoGather = autoGather || false;
}

Bonus.prototype.draw = function (context) {
    var minHeight = -this.parentWorld.height / 2 + 3;
    var offScreen = this.y < minHeight;
    var ePos = this.parentWorld.vp.toScreen(this.x, offScreen ? minHeight: this.y);
    context.drawImage(
            this.parentWorld.vp.imgBonus,
            (this.types.indexOf(this.cat) | 0) * IMAGE.bonus.frameWidth,
            (this.small + offScreen * 2) * IMAGE.bonus.frameHeight,
            IMAGE.bonus.frameWidth, IMAGE.bonus.frameHeight,
            ePos.x - 3 * this.parentWorld.vp.zoom,
            ePos.y - 3 * this.parentWorld.vp.zoom,
            6 * this.parentWorld.vp.zoom,
            6 * this.parentWorld.vp.zoom);
};

Bonus.prototype.step = function () {
    this.$step();

    //remove from world
    if (this.y > this.parentWorld.height / 2 + 5)
        this.remove();

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
        var max = this.parentWorld.player.y < -this.parentWorld.width / 3;
        var mx = max ? 1 : 0.5;
        switch (this.cat) {
            case "point":
                this.parentWorld.player.points += (this.small ? 0 : 1);
                this.parentWorld.player.score += (this.small ? 100 : 200) * mx;
                this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
                break;
            case "power":
                var fixedPower = this.parentWorld.player.power;
                this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
                if (this.parentWorld.player.power < this.parentWorld.player.powerMax)
                    this.parentWorld.player.power += (this.small ? 0.01 : 0.1);
                else
                    this.parentWorld.player.score += (this.small ? 100 : 200) * mx;
                if (this.parentWorld.player.power > this.parentWorld.player.powerMax)
                    this.parentWorld.player.power = this.parentWorld.player.powerMax;
                if (fixedPower < this.parentWorld.player.powerMax && this.parentWorld.player.power === this.parentWorld.player.powerMax) {
                    this.parentWorld.clearField(0);
                    this.parentWorld.replaceBonus("power", true, "point", false);
                }
                break;
            case "gauge":
                this.parentWorld.player.power += (this.small ? 1 : this.parentWorld.player.powerMax - 1);
                if (this.parentWorld.player.power > this.parentWorld.player.powerMax) {
                    this.parentWorld.player.power = this.parentWorld.player.powerMax;
                    this.parentWorld.clearField(0);
                    this.parentWorld.replaceBonus("power", true, "point", false);
                }
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
        if (score) {
            var t = this.parentWorld.lastText;
            if (t && t.lifetime <= 1 && t.max === max) {
                t.content += score;
                t.lifetime = 0;
                t.x = this.parentWorld.player.x;
                t.y = this.parentWorld.player.y - 10;
            } else {
                this.parentWorld.lastText = new Text(this.parentWorld, this.parentWorld.player.x, this.parentWorld.player.y - 10, score, max);
            }
        }
    }
};
