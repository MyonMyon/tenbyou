function Player(parentWorld, charName) {
    extend(this, new Entity(parentWorld, 0, parentWorld.height / 2 - 5));

    this.hiscoreDisplayed = this.hiscore = 1000000;
    this.scoreDisplayed = this.score = 0;

    this.lives = this.livesDefault = 2;
    this.lifeParts = 0;
    this.bombs = this.bombsDefault = 3;
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
    };
    this.onPowerChange(0);

    this.respawnTime = null;
    this.respawnTimeDefault = 0.33;
    this.deathbombTime = 0.16;

    this.guided = false;
}

Player.prototype.stepBot = function () {
    var nearest = this.nearestEntity(Projectile, 20);
    if (nearest !== null && this.invulnTime <= 0)
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
    this.$step();
    if (this.guided)
        this.stepBot();
    else
        this.setVectors(null, null, 0, 0, 0, 0);

    var d = 100;
    if ((this.moveLeft || this.moveRight)
            && (this.moveDown || this.moveUp)
            && !(this.moveLeft && this.moveRight)
            && !(this.moveDown && this.moveUp))
        d = 70;

    if (this.focused)
        d /= 2;

    d /= this.parentWorld.ticksPS;

    if (this.moveLeft)
        this.x -= d;
    if (this.moveRight)
        this.x += d;
    if (this.moveUp)
        this.y -= d;
    if (this.moveDown)
        this.y += d;

    if (this.x > this.parentWorld.width / 2 - this.width * 2)
        this.x = this.parentWorld.width / 2 - this.width * 2;
    if (this.x < -this.parentWorld.width / 2 + this.width * 2)
        this.x = -this.parentWorld.width / 2 + this.width * 2;
    if (this.y > this.parentWorld.height / 2 - this.width * 2)
        this.y = this.parentWorld.height / 2 - this.width * 2;
    if (this.y < -this.parentWorld.height / 2 + this.width * 2)
        this.y = -this.parentWorld.height / 2 + this.width * 2;

    if (this.shooting)
        this.shoot();

    if (this.invulnTime > 0) {
        this.invulnTime -= 1 / this.parentWorld.ticksPS;
    }

    if (this.respawnTime > 0) {
        this.respawnTime -= 1 / this.parentWorld.ticksPS;
    }

    if (this.respawnTime !== null && this.respawnTime <= 0)
        this.respawn();

    if (this.y < -this.parentWorld.width / 3) {
        this.autoGatherTime = this.autoGatherTimeDefault;
    } else if (this.autoGatherTime > 0) {
        this.autoGatherTime -= 1 / this.parentWorld.ticksPS;
    }

    if (this.shotCooldown > 0) {
        this.shotCooldown -= 1 / this.parentWorld.ticksPS;
    }

    if (this.specialCooldown > 0) {
        this.specialCooldown -= 1 / this.parentWorld.ticksPS;
    }

    if (this.gatherValue > 0) {
        this.gatherValueExtremum = Math.max(this.gatherValue, this.gatherValueExtremum);
        this.gatherValue -= 30 / this.parentWorld.ticksPS;
    }
    if (this.gatherValueExtremum >= 50 && (this.gatherValueExtremum - this.gatherValue > 20)) {
        if (this.gatherValueExtremum >= 150)
            new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "lives", false, false);
        else if (this.gatherValueExtremum >= 100)
            new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "lives", true, false);
        else if (this.gatherValueExtremum >= 75)
            new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "bombs", false, false);
        else
            new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "bombs", true, false);
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
};

Player.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);

    if (this.respawnTime === null) {
        if (this.invulnTime > 0) {
            context.fillStyle = SHIELD_COLOR;
            context.beginPath();
            context.arc(ePos.x, ePos.y, (6 / (this.invulnTimeBomb - this.invulnTime) + 2) * this.parentWorld.vp.zoom * this.width, 0, Math.PI * 2, false);
            context.fill();
            context.closePath();
        }

        if (this.moveLeft !== this.moveRight) {
            this.sprite.setPositionShift(this.moveLeft ? 3 : 2, 0);
        } else if (this.focused) {
            this.sprite.setPositionShift(1, 0);
        } else {
            this.sprite.setPositionShift(0, 0);
        }
        this.sprite.draw(context, ePos.x, ePos.y, this.relTime(), 8 * this.parentWorld.vp.zoom);

        if (this.focused) {
            context.strokeStyle = HITBOX_STROKE_COLOR;
            context.fillStyle = HITBOX_COLOR;
            context.beginPath();
            context.arc(ePos.x, ePos.y, this.parentWorld.vp.zoom, 0, Math.PI * 2, false);
            context.stroke();
            context.fill();
            context.closePath();
        }
    }
};

Player.prototype.shoot = function () {
    if (this.shotCooldown <= 0) {
        this.onShoot();
        this.shotCooldown = this.shotCooldownDefault;
    };
};

Player.prototype.bomb = function () {
    if (this.invulnTimeMin <= 0.33 && this.bombs >= 1 && (this.respawnTime === null || this.respawnTime > this.respawnTimeDefault - this.deathbombTime)) {
        this.bombs--;
        this.onBomb();
        this.invulnTime = this.invulnTimeBomb;
        this.autoGatherTime = this.autoGatherTimeDefault;
        this.respawnTime = null;
        this.spellCompleteTerms = false;
    }
};

Player.prototype.special = function () {
    if (this.specialCooldown <= 0) {
        this.onSpecial();
        this.specialCooldown = this.specialCooldownDefault;
    };
};

Player.prototype.addPower = function (power) {
    var powerOld = this.power;
    this.power += power;
    if (this.power > this.powerMax) {
        this.power = this.powerMax;
        if (powerOld < this.powerMax) {
            this.parentWorld.clearField(0);
            this.parentWorld.replaceBonus("power", true, "point", false);
        }
    }
    if (Math.floor(powerOld) !== Math.floor(this.power)) {
        this.onPowerChange(Math.floor(this.power));
    }
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

    new Particle(this.parentWorld, this.x, this.y, 1, 12, false, false, "splash");
    this.parentWorld.splash(this, 20, 10, 0.5);
};

Player.prototype.respawn = function () {
    this.respawnTime = null;
    this.spellCompleteTerms = false;

    if (this.lives < 1) {
        this.parentWorld.setPause(true);
        this.parentWorld.continuable = this.parentWorld.stage > 0 && this.score % 10 < 9;
        if (!this.parentWorld.continuable) {
            return;
        }
        this.lives = this.livesDefault;
        this.bombs = this.bombsDefault;
        this.score = this.score % 10 + 1;
        this.power = 0;
        this.onPowerChange(0);
        this.graze = 0;
        this.points = 0;
    } else {
        this.lives--;
    }

    this.autoGatherTime = 0;
    this.invulnTime = this.invulnTimeRespawn;
    for (var i = 0; i < 5; ++i) {
        if (i === 2 && this.lives < 1)
            new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "gauge", false, false);
        else
            new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "power", false, false);
    }
    this.x = 0;
    this.y = this.parentWorld.height / 2 - 5;
    this.bombs = Math.max(this.bombsDefault, this.bombs);
    this.addPower(-Math.min(this.power, 0.6));
};
