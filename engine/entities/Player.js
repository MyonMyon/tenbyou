function Player(world, charName) {
    extend(this, new Entity(world, 0, world.height / 2 - 5));

    this.hiscoreDisplayed = this.hiscore = 1000000;
    this.scoreDisplayed = this.score = 0;

    this.livesMax = 9;
    this.lives = this.livesDefault = 2;
    this.lifePartsMax = 3;
    this.lifeParts = 0;
    this.bombsMax = 9;
    this.bombs = this.bombsDefault = 3;
    this.bombPartsMax = 4;
    this.bombParts = 0;

    this.spellCompleteTerms = true;

    this.powerMax = 4;
    this.damageInc = 0.6;

    this.power = 0;
    this.points = 0;
    this.graze = 0;

    this.grazeWidth = 4;
    this.gatherWidthFinal = 5;
    this.gatherWidth = 20;
    this.gatherValue = 0;
    this.gatherValueExtremum = 0;

    this.focusMx = 0.4;
    this.focused = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    this.shooting = false;
    this.invulnTime = 0;
    this.invulnTimeMin = 0.33;
    this.invulnTimeBomb = 3.33;
    this.invulnTimeRespawn = 1.66;
    this.autoGatherTime = 0;
    this.autoGatherTimeDefault = 0.66;

    this.shotCooldown = 0;
    this.shotCooldownDefault = 0.0333;
    this.specialCooldown = 0;
    this.specialCooldownDefault = 1;

    this.name = charName;
    this.sprite.set(SPRITE.player);
    this.sprite.set(charName);
    var propImport = ["width", "onShoot", "onBomb", "onSpecial", "onPowerChange"];
    for (var i in propImport) {
        var d = CHAR[charName][propImport[i]];
        if (d) {
            this[propImport[i]] = d;
        }
    }
    this.onPowerChange(0);

    this.respawnTime = null;
    this.respawnTimeDefault = 0.33;
    this.deathbombTime = 0.16;

    this.guided = false;
}

Player.prototype.stepBot = function () {
    var nearest = this.nearestEntity(Projectile, 20);
    if (nearest !== null && !this.isInvulnerable())
        this.headToEntity(nearest, 0, -nearest.width * 20);
    else {
        if (Math.abs(this.x - this.fixedX * this.y - this.fixedY) < 20)
            this.headToPoint(this.nearestEntity(Enemy, 400) ? this.nearestEntity(Enemy, 400).x : 0, 0, 0, 100);
        if (Math.abs(this.x - this.fixedX * this.y - this.fixedY) < 20)
            this.headToEntity(this.nearestEntity(Bonus, 200), 0, 80);
    }
    if (this.respawnTime > 0)
        this.bomb();
    this.shoot();
};

Player.prototype.step = function () {
    var dir = (this.moveLeft ? "w" : "") +
            (this.moveRight ? "e" : "") +
            (this.moveUp ? "n" : "") +
            (this.moveDown ? "s" : "");
    var a = Util.toMeanAngle(dir);
    var r = 100 * (this.moveLeft || this.moveRight || this.moveDown || this.moveUp);
    if (this.focused) {
        r *= this.focusMx;
    }
    this.x1 = Math.cos(a) * r;
    this.y1 = Math.sin(a) * r;

    this.$step();
    if (this.guided) {
        this.stepBot();
    } else {
        this.setVectors(null, null, null, null, 0, 0);
    }

    if (this.x > this.world.width / 2 - this.width * 2)
        this.x = this.world.width / 2 - this.width * 2;
    if (this.x < -this.world.width / 2 + this.width * 2)
        this.x = -this.world.width / 2 + this.width * 2;
    if (this.y > this.world.height / 2 - this.width * 2)
        this.y = this.world.height / 2 - this.width * 2;
    if (this.y < -this.world.height / 2 + this.width * 2)
        this.y = -this.world.height / 2 + this.width * 2;

    if (this.shooting)
        this.shoot();

    if (this.invulnTime > 0) {
        this.invulnTime -= 1 / this.world.ticksPS;
    }

    if (this.respawnTime > 0) {
        this.respawnTime -= 1 / this.world.ticksPS;
    }

    if (this.respawnTime !== null && this.respawnTime <= 0)
        this.respawn();

    if (this.isMaxBonus()) {
        this.autoGatherTime = this.autoGatherTimeDefault;
    } else if (this.autoGatherTime > 0) {
        this.autoGatherTime -= 1 / this.world.ticksPS;
    }

    if (this.shotCooldown > 0) {
        this.shotCooldown -= 1 / this.world.ticksPS;
    }

    if (this.specialCooldown > 0) {
        this.specialCooldown -= 1 / this.world.ticksPS;
    }

    if (this.gatherValue > 0) {
        this.gatherValueExtremum = Math.max(this.gatherValue, this.gatherValueExtremum);
        this.gatherValue -= 30 / this.world.ticksPS;
    }
    if (this.gatherValueExtremum >= 50 && (this.gatherValueExtremum - this.gatherValue > 20)) {
        if (this.gatherValueExtremum >= 150)
            new Bonus(this.world, this.x, -this.world.height / 2 + 20, "life", false);
        else if (this.gatherValueExtremum >= 100)
            new Bonus(this.world, this.x, -this.world.height / 2 + 20, "lifePart", false);
        else if (this.gatherValueExtremum >= 75)
            new Bonus(this.world, this.x, -this.world.height / 2 + 20, "bomb", false);
        else
            new Bonus(this.world, this.x, -this.world.height / 2 + 20, "bombPart", false);
        this.score += Math.floor(this.gatherValueExtremum / 10) * 1000;
        this.gatherValueExtremum = 0;
        this.gatherValue = 0;
    }

    if (this.score !== this.scoreDisplayed) {
        this.scoreDisplayed = Math.min(this.score, this.scoreDisplayed + (Math.floor(Math.random() * 4000) + 4000) * 10);
        if (this.score > this.hiscore) {
            this.hiscoreDisplayed = this.scoreDisplayed;
        }
    }

    if (this.score > this.hiscore) {
        this.hiscore = this.score;
    }

    for (var i in this.world.entities) {
        var e = this.world.entities[i];
        if (e instanceof Projectile && !e.playerSide && e.width) {
            //collision
            if (this.world.collisionCheck(e, this, this.grazeWidth)) {
                if (this.world.collisionCheck(e, this)) {
                    e.remove();
                    if (!this.isInvulnerable()) {
                        this.kill();
                        break;
                    }
                } else if (e.grazed < e.damage && !this.isInvulnerable()) {
                    ++this.graze;
                    var xD = this.x - e.x;
                    var yD = this.y - e.y;
                    var s = new Particle(this.world, this.x, this.y, 0.25, 8, false, false, "spark");
                    s.setVectors(null, null, xD * 5, yD * 5);
                    ++e.grazed;
                }
            }
        }
    }
};

Player.prototype.draw = function (context) {
    var ePos = this.world.vp.toScreen(this.x, this.y);

    if (this.respawnTime === null) {
        context.save();
        if (this.isInvulnerable()) {
            context.fillStyle = SHIELD_COLOR;
            context.beginPath();
            context.arc(ePos.x, ePos.y, (6 / (this.invulnTimeBomb - this.invulnTime) + 2) * this.world.vp.zoom * this.width, 0, Math.PI * 2, false);
            context.fill();
            context.closePath();

            context.globalAlpha = 0.3 + Math.floor(this.world.relTime() * 8) % 2 * 0.2;
        }

        if (this.focused) {
            this.sprite.setState("focused");
        } else if (this.moveLeft !== this.moveRight) {
            this.sprite.setState(this.moveLeft ? "moveLeft" : "moveRight");
        } else {
            this.sprite.setState("idle");
        }
        this.sprite.draw(context, ePos.x, ePos.y, this.relTime(), 8 * this.world.vp.zoom);

        if (this.focused) {
            context.strokeStyle = HITBOX_STROKE_COLOR;
            context.fillStyle = HITBOX_COLOR;
            context.beginPath();
            context.arc(ePos.x, ePos.y, this.world.vp.zoom, 0, Math.PI * 2, false);
            context.stroke();
            context.fill();
            context.closePath();
        }
        context.restore();
    }
};

Player.prototype.shoot = function () {
    if (this.shotCooldown <= 0 && this.respawnTime === null) {
        this.onShoot();
        this.shotCooldown = this.shotCooldownDefault;
    }
};

Player.prototype.bomb = function () {
    if (this.invulnTime <= this.invulnTimeMin && this.bombs >= 1 && (this.respawnTime === null || this.respawnTime > this.respawnTimeDefault - this.deathbombTime)) {
        this.bombs--;
        this.onBomb();
        this.invulnTime = this.invulnTimeBomb;
        this.autoGatherTime = this.autoGatherTimeDefault;
        this.respawnTime = null;
        this.spellCompleteTerms = false;
    }
};

Player.prototype.special = function () {
    if (this.specialCooldown <= 0 && this.power >= 1 && this.respawnTime === null) {
        this.onSpecial();
        this.specialCooldown = this.specialCooldownDefault;
        this.addPower(-1);
    }
};

Player.prototype.addPower = function (power) {
    if (power > 0 && this.power >= this.powerMax) {
        return false;
    }
    var powerOld = this.power;
    this.power += power;
    if (this.power < 0) {
        this.power = 0;
    }
    if (this.power > this.powerMax) {
        this.power = this.powerMax;
        if (powerOld < this.powerMax) {
            this.world.clearField(0);
            this.world.replaceBonus("power", "point");
        }
    }
    if (Math.floor(powerOld) !== Math.floor(this.power)) {
        this.onPowerChange(Math.floor(this.power));
    }
    return true;
};

Player.prototype.addItems = function (itemName, itemCount, partName, partCount) {
    if (this[itemName] >= this[itemName + "Max"]) {
        return false;
    }
    this[itemName] += itemCount;
    this[partName] += partCount;
    if (this[partName] >= this[partName + "Max"]) {
        this[partName] -= this[partName + "Max"];
        ++this[itemName];
    }
    if (this[itemName] >= this[itemName + "Max"]) {
        this[itemName] = this[itemName + "Max"];
        this[partName] = 0;
    }
    return true;
};

Player.prototype.addBombs = function (bombs, parts) {
    return this.addItems("bombs", bombs, "bombParts", parts);
};

Player.prototype.addLives = function (lives, parts) {
    return this.addItems("lives", lives, "lifeParts", parts);
};

Player.prototype.onShoot = function () {
    //Override with CHAR data!
};

Player.prototype.onBomb = function () {
    //Override with CHAR data!
};

Player.prototype.onSpecial = function () {
    //Override with CHAR data!
};

Player.prototype.onPowerChange = function () {
    //Override with CHAR data!
};

Player.prototype.kill = function () {
    this.respawnTime = this.respawnTimeDefault;
    this.invulnTime = this.respawnTimeDefault;

    new Particle(this.world, this.x, this.y, 1, 12, false, false, "splash");
    this.world.splash(this, 20, 10, 0.5);
};

Player.prototype.isMaxBonus = function () {
    return this.y < this.world.maxBonusY;
};

Player.prototype.isInvulnerable = function () {
    return this.invulnTime > 0;
};

Player.prototype.useContinue = function () {
    this.world.continueMode = false;
    this.respawnTime = null;
    this.lives = this.livesDefault;
    this.bombs = this.bombsDefault;
    this.score = this.score % 10 + 1;
    this.power = 0;
    this.onPowerChange(0);
    this.graze = 0;
    this.points = 0;
};

Player.prototype.respawn = function () {
    this.spellCompleteTerms = false;

    if (this.lives < 1) {
        this.world.continueMode = true;
        this.world.continuable = this.world.stage > 0 && this.score % 10 < 9;
        this.world.setPause(true);
        if (!this.world.continuable) {
            return;
        }
    } else {
        this.respawnTime = null;
        this.lives--;
    }

    this.autoGatherTime = 0;
    this.invulnTime = this.invulnTimeRespawn;
    for (var i = 0; i < 9; ++i) {
        if (i === 4 && this.lives < 1)
            new Bonus(this.world, this.x, this.y, "gauge", false);
        else
            new Bonus(this.world, this.x + (i - 4) * 10, this.y, "power", false);
    }
    this.x = 0;
    this.y = this.world.height / 2 - 5;
    this.bombs = Math.max(this.bombsDefault, this.bombs);
    this.addPower(-Math.min(this.power, 1));
};
