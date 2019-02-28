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

    this.focused = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    this.shooting = false;
    this.shootingPrev = false;
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
    var propImport = [
        "width",
        "speed",
        "speedFocused",
        "onDeath",
        "onShoot",
        "onShootStart",
        "onShootEnd",
        "onBomb",
        "onSpecial",
        "onPowerChange"
    ];
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
    var dir = (this.moveLeft !== this.moveRight ? this.moveRight ? "e" : "w" : "") +
            (this.moveUp !== this.moveDown ? this.moveDown ? "s" : "n" : "");
    var a = Util.toMeanAngle(dir);
    var r = (this.focused ? this.speedFocused : this.speed) * (a !== null);

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

    if (this.shooting) {
        this.shoot();
    } else {
        this.shootingPrev = false;
        this.onShootEnd();
    }

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
        if (!e.playerSide && e.width) {
            if (e instanceof Projectile) {
                if (Util.collisionCheck(e, this, this.grazeWidth)) {
                    if (Util.collisionCheck(e, this)) {
                        e.remove();
                        if (!this.isInvulnerable()) {
                            this.kill();
                            break;
                        }
                    } else if (e.grazed < e.damage && !this.isInvulnerable()) {
                        Sound.play(SFX.playerGraze);
                        ++this.graze;
                        var xD = this.x - e.x;
                        var yD = this.y - e.y;
                        var s = new Particle(this.world, this.x, this.y, 0.25, 8, false, false, "spark");
                        s.setVectors(null, null, xD * 5, yD * 5);
                        ++e.grazed;
                    }
                }
            }
            if (e instanceof Beam) {
                if (Util.collisionCheckBeam(this, e, this.grazeWidth)) {
                    if (Util.collisionCheckBeam(this, e)) {
                        e.break(Util.vectorLength(this.x - e.x, this.y - e.y));
                        if (!this.isInvulnerable()) {
                            this.kill();
                            break;
                        }
                    } else if (!this.isInvulnerable()) {
                        var grazeOld = this.graze;
                        this.graze += e.grazePS / this.world.ticksPS;
                        if (Math.floor(grazeOld) !== Math.floor(this.graze)) {
                            Sound.play(SFX.playerGraze);
                            var cwmx = Util.isClockwiseNearest(e.a0, Util.angleBetweenEntities(e, this)) ? 1 : -1;
                            var xD = Math.cos(e.a0 + Math.PI / 2 * cwmx);
                            var yD = Math.sin(e.a0 + Math.PI / 2 * cwmx);
                            var s = new Particle(this.world, this.x, this.y, 0.25, 8, false, false, "spark");
                            s.setVectors(null, null, xD * 50, yD * 50);
                            ++e.grazed;
                        }
                    }
                }
            }
        }
    }
};

Player.prototype.draw = function (context) {
    var ePos = this.world.vp.toScreenFX(this.x, this.y);

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
        this.sprite.draw(context, ePos.x, ePos.y, this.lifetime, 8 * this.world.vp.zoom);

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
    if (this.respawnTime === null) {
        if (this.shotCooldown <= 0) {
            Sound.play(SFX.playerShot);
            if (!this.shootingPrev) {
                this.onShootStart();
            }
            this.onShoot();
            this.shotCooldown = this.shotCooldownDefault;
        }
        this.shootingPrev = true;
    } else {
        this.shootingPrev = false;
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

Player.prototype.addPower = function (power, silent) {
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
            this.world.vp.showMessage(["Full Power!"], 2, [FONT.upgrade], "top");
            this.world.clearField(0);
            this.world.replaceBonus("power", "point");
        }
    }
    if (Math.floor(powerOld) !== Math.floor(this.power)) {
        this.onPowerChange(Math.floor(this.power));
        if (!silent && this.power > powerOld) {
            Sound.play(SFX.playerPower);
        }
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
    var old = this.lives;
    var succ = this.addItems("lives", lives, "lifeParts", parts);
    if (this.lives > old) {
        Sound.play(SFX.playerExtend);
        this.world.vp.showMessage(["Extend!"], 2, [FONT.upgrade], "top");
    }
    return succ;
};

Player.prototype.onDeath = function () {
    //Override with CHAR data!
};

Player.prototype.onShoot = function () {
    //Override with CHAR data!
};

Player.prototype.onShootStart = function () {
    //Override with CHAR data!
};

Player.prototype.onShootEnd = function () {
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
    this.shootingPrev = false;
    this.onDeath();

    new Particle(this.world, this.x, this.y, 1, 12, false, false, "splash");
    this.world.splash(this, 20, 10, 0.5);
    Sound.play(SFX.playerHit);
};

Player.prototype.isMaxBonus = function () {
    return this.y < this.world.maxBonusY;
};

Player.prototype.setGodMode = function () {
    this.invulnTime = this.invulnTime ? 0 : Infinity;
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
        for (var i in this.anchored) {
            this.anchored[i].remove();
        }
        this.world.setPause(true);
        if (!this.world.continuable) {
            return;
        }
    } else {
        this.onPowerChange(0);
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
