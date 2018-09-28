function Player(parentWorld) {
    extend(this, new Entity(parentWorld, 0, parentWorld.height / 2 - 5));

    this.setSprite(0, 4, 2, 1, false);
    this.width = 1;

    this.hiscore = 1000000;
    this.score = 0;

    this.livesDefault = 2;
    this.lives = this.livesDefault;
    this.lifeParts = 0;
    this.bombsDefault = 3;
    this.bombs = this.bombsDefault;
    this.bombParts = 0;

    this.spellCompleteTerms = true;

    this.powerMax = 4;
    this.power = 1;
    this.damageInc = 0.6;
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
    this.autoGatherTime = 0;

    this.respawnTime = -1;
    this.respawnTimeDefault = 10;
    this.deathbombTime = 5;

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

    if (this.x > this.parentWorld.width / 2 - 5)
        this.x = this.parentWorld.width / 2 - 5;
    if (this.x < -this.parentWorld.width / 2 + 5)
        this.x = -this.parentWorld.width / 2 + 5;
    if (this.y > this.parentWorld.height / 2 - 5)
        this.y = this.parentWorld.height / 2 - 5;
    if (this.y < -this.parentWorld.height / 2 + 5)
        this.y = -this.parentWorld.height / 2 + 5;

    if (this.shooting)
        this.shoot();

    if (this.invulnTime > 0)
        this.invulnTime--;

    if (this.respawnTime > 0)
        --this.respawnTime;

    if (this.respawnTime === 0)
        this.respawn();

    if (this.y < -this.parentWorld.width / 3)
        this.autoGatherTime = 20;

    if (this.autoGatherTime > 0) {
        this.autoGatherTime--;
    }

    if (this.gatherValue > 0) {
        this.gatherValueExtremum = Math.max(this.gatherValue, this.gatherValueExtremum);
        this.gatherValue--;
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

    if (this.score > this.hiscore)
        this.hiscore = this.score;
};

Player.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);

    if (this.respawnTime < 0) {
        if (this.invulnTime > 0) {
            context.fillStyle = SHIELD_COLOR;
            context.beginPath();
            context.arc(ePos.x, ePos.y, (200 / (100 - this.invulnTime) + 2) * this.parentWorld.vp.zoom * this.width, 0, Math.PI * 2, false);
            context.fill();
            context.closePath();
        }

        context.drawImage(this.customSprite ? this.customSprite : this.parentWorld.vp.imgPlayer,
                this.focused * (this.customSprite ? this.customSpriteWidth : IMAGE_PLAYER_WIDTH),
                Math.floor(this.lifetime / this.animPeriod) % (this.frameCount) * (this.customSprite ? this.customSpriteHeight : IMAGE_PLAYER_HEIGHT),
                this.customSprite ? this.customSpriteWidth : IMAGE_PLAYER_WIDTH,
                this.customSprite ? this.customSpriteHeight : IMAGE_PLAYER_HEIGHT,
                ePos.x - 4 * this.spriteWidth * this.parentWorld.vp.zoom,
                ePos.y - 4 * this.spriteWidth * this.parentWorld.vp.zoom,
                8 * this.spriteWidth * this.parentWorld.vp.zoom,
                8 * this.spriteWidth * this.parentWorld.vp.zoom);

        if (this.focused) {
            context.fillStyle = HITBOX_COLOR;
            context.beginPath();
            context.arc(ePos.x, ePos.y, 1 * this.parentWorld.vp.zoom * this.width, 0, Math.PI * 2, false);
            context.fill();
            context.closePath();
        }
    }
};

Player.prototype.shoot = function () {
    var count = Math.floor(this.power);
    for (var i = 0; i < count; ++i) {
        var bullet = new Projectile(this.parentWorld, this.x + i * (this.focused ? 2 : 8) - (this.focused ? 1 : 4) * (count - 1), this.y + Math.abs(i + 0.5 - count / 2) * 6, 0, -8);
        bullet.width = 2;
        bullet.damage = (1 + this.damageInc) / (count + this.damageInc);
        bullet.playerside = true;
        var special = count >= 3 && (i === 0 || i === count - 1);
        bullet.setSprite(special ? 2 : 1, 2, 4);
        if (special)
            bullet.behavior = function () {
                if (this.lifetime % 6 === 1) {
                    this.headToEntity(this.nearestEntity(Enemy, 200), 200, 0);
                }
            };
    }
};

Player.prototype.bomb = function () {
    if (this.invulnTime <= 10 && this.bombs >= 1 && (this.respawnTime < 0 || this.respawnTime > this.respawnTimeDefault - this.deathbombTime)) {
        this.bombs--;
        this.invulnTime = 100;
        this.respawnTime = -1;
        this.parentWorld.clearField(20);
        this.autoGatherTime = 5;
        this.spellCompleteTerms = false;
    }
};

Player.prototype.kill = function () {
    this.respawnTime = this.respawnTimeDefault;
    this.invulnTime = this.respawnTimeDefault;

    new Particle(this.parentWorld, this.x, this.y, 30, 12, false, false, 0, 4, 4);
    this.parentWorld.splash(this, 20, 10, 16);
};

Player.prototype.respawn = function () {
    this.respawnTime = -1;
    this.spellCompleteTerms = false;

    if (this.lives < 1) {
        this.parentWorld.pause = true;
        this.lives = this.livesDefault;
        this.bombs = this.bombsDefault;
        this.score = this.score % 100 + 1;
        this.power = 1;
        this.graze = 0;
        this.points = 0;
    }
    else
        this.lives--;

    this.autoGatherTime = 0;
    this.invulnTime = 50;
    for (var i = 0; i < 5; ++i) {
        if (i === 2 && this.lives < 1)
            new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "gauge", false, false);
        else
            new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "power", false, false);
    }
    this.x = 0;
    this.y = this.parentWorld.height / 2 - 5;
    this.bombs = Math.max(this.bombsDefault, this.bombs);
    this.power = Math.max(this.power - 0.6, 1);
};
