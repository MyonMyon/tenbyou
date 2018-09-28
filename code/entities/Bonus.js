function Bonus(parentWorld, x, y, cat, small, autoGather) {
    this.shifts = new Object(); //to redo
    this.shifts.power = 0;
    this.shifts.point = 1;
    this.shifts.bombs = 2;
    this.shifts.lives = 3;
    this.shifts.gauge = 4;

    extend(this, new Entity(parentWorld, x, y, 0, -2, 0, 0.1, 0));

    this.cat = cat;
    this.small = small;
    this.autoGather = autoGather || false;
}

Bonus.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    context.drawImage(this.parentWorld.vp.imgBonus, (this.shifts[this.cat] | 0) * IMAGE_BONUS_WIDTH, (this.small ? IMAGE_BONUS_HEIGHT : 0),
            IMAGE_BONUS_WIDTH, IMAGE_BONUS_HEIGHT,
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
        switch (this.cat) {
            case "point":
                this.parentWorld.player.points += (this.small ? 0 : 1);
                this.parentWorld.player.score += (this.small ? 100 : 200);
                this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
                break;
            case "power":
                var fixedPower = this.parentWorld.player.power;
                this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
                if (this.parentWorld.player.power < this.parentWorld.player.powerMax)
                    this.parentWorld.player.power += (this.small ? 0.01 : 0.1);
                else
                    this.parentWorld.player.score += (this.small ? 100 : 200);
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
                    this.parentWorld.player.score += (this.small ? 300 : 500);
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
                    this.parentWorld.player.score += (this.small ? 500 : 2000);
                    this.parentWorld.player.lives = 9;
                    this.parentWorld.player.lifeParts = 0;
                }
                if (this.parentWorld.player.lifeParts >= 3) {
                    this.parentWorld.player.lifeParts -= 3;
                    ++this.parentWorld.player.lives;
                }
                break;
        }
    }
};
