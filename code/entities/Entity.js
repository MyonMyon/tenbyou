function Entity(parentWorld, x, y, x1, y1, x2, y2, width, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    this.x = x || 0;
    this.y = y || 0;

    //speed
    this.x1 = x1 || 0;
    this.y1 = y1 || 0;

    //acceleration
    this.x2 = x2 || 0;
    this.y2 = y2 || 0;

    this.width = width || 2;

    this.fixedX = this.x;
    this.fixedY = this.y;

    this.targetX = 0;
    this.targetY = 0;
    this.targetTime = 0;

    this.lifetime = 0;

    this.sprite = sprite || 0;
    this.frameCount = frameCount || 1;
    this.animPeriod = animPeriod || 4;
    this.spriteWidth = spriteWidth || 1;
    this.spriteDir = spriteDir || false;

    this.customSprite = null;
    this.customSpriteWidth = 0;
    this.customSpriteHeight = 0;

    this.parentWorld = parentWorld;
    this.id = ++parentWorld.lastID;
    //console.info("Added Entity #" + this.id + " @ " + this.x + ";" + this.y);
}

Entity.prototype.init = function () {
    this.parentWorld.entities.push(this);
};

Entity.prototype.flush = function () {
    this.fixedX = this.x;
    this.fixedY = this.y;
    if (this.removalMark) {        
        this.parentWorld.entities.splice(this.parentWorld.entities.indexOf(this), 1);
    }
};

Entity.prototype.step = function () {
    ++this.lifetime;

    if (this.targetTime > 0) {
        this.x2 = 0;
        this.y2 = 0;

        this.x1 = 0;
        this.y1 = 0;

        this.x += (this.targetX - this.x) / this.targetTime;
        this.y += (this.targetY - this.y) / this.targetTime;
        --this.targetTime;
    } else {
        this.targetTime = 0;

        this.x1 += this.x2;
        this.y1 += this.y2;

        this.x += this.x1;
        this.y += this.y1;
    }
};

Entity.prototype.draw = function (context) {
};

Entity.prototype.remove = function () {
    //console.info("Removed Entity #" + this.id + " @ " + this.x + ";" + this.y);
    this.removalMark = true;
};

Entity.prototype.setCustomSpriteFile = function (source, frameWidth, frameHeight) {
    this.customSprite = new Image();
    this.customSprite.src = source;
    this.customSpriteWidth = frameWidth || 32;
    this.customSpriteHeight = frameHeight || 32;
};

Entity.prototype.setSprite = function (sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    this.sprite = sprite || this.sprite;
    this.frameCount = frameCount || this.frameCount;
    this.animPeriod = animPeriod || this.animPeriod;
    this.spriteWidth = spriteWidth || this.spriteWidth;
    this.spriteDir = spriteDir || this.spriteDir;
};

Entity.prototype.setVectors = function (posX, posY, speedX, speedY, accX, accY) {
    this.x = posX || posX === 0 ? posX : this.x;
    this.y = posY || posY === 0 ? posY : this.y;
    this.x1 = speedX || speedX === 0 ? speedX / this.parentWorld.ticksPS : this.x1;
    this.y1 = speedY || speedY === 0 ? speedY / this.parentWorld.ticksPS : this.y1;
    this.x2 = accX || accX === 0 ? accX / this.parentWorld.ticksPS : this.x2;
    this.y2 = accY || accY === 0 ? accY / this.parentWorld.ticksPS : this.y2;
};

Entity.prototype.headToEntity = function (target, speed, acc) {
    if (target) {
        var d = this.parentWorld.distanceBetweenEntities(this, target);
        if (d !== 0)
            this.setVectors(null, null,
                    ((target.x - this.x) / d) * speed,
                    ((target.y - this.y) / d) * speed,
                    ((target.x - this.x) / d) * acc,
                    ((target.y - this.y) / d) * acc);
    }
};

Entity.prototype.headToPoint = function (targetX, targetY, speed, acc) {
    var d = this.parentWorld.distanceBetweenPoints(this.x, this.y, targetX, targetY);
    if (d !== 0)
        this.setVectors(null, null,
                (targetX - this.x) / d * speed,
                (targetY - this.y) / d * speed,
                (targetX - this.x) / d * acc,
                (targetY - this.y) / d * acc);
};

Entity.prototype.headToPointSmoothly = function (targetX, targetY, time) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.targetTime = Math.floor(time * this.parentWorld.ticksPS);
};

Entity.prototype.nearestEntity = function (type, range) {
    var nearest = null;
    var nearestDistance = range || this.parentWorld.height * 2;
    for (var i in this.parentWorld.entities) {
        var e = this.parentWorld.entities[i];
        if ((e instanceof type && ((type === Projectile && !e.playerside) || type !== Projectile)) || type === null) {
            if (e !== this && this.parentWorld.distanceBetweenEntities(this, e) < nearestDistance) {
                nearest = e;
                nearestDistance = this.parentWorld.distanceBetweenEntities(this, e);
            }
        }
    }
    return nearest;
};
