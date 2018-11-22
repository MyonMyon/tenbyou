function Entity(parentWorld, x, y, x1, y1, x2, y2, width) {
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

    this.priority = 0;
    this.sprite = new SpriteHandler();

    this.angle = 0;

    this.parentWorld = parentWorld;
    this.id = ++parentWorld.lastID;
    //console.info("Added Entity #" + this.id + " @ " + this.x + ";" + this.y);
}

Entity.prototype.init = function () {
    this.parentWorld.entities.push(this);
    this.eventChain = new EventChain(this);
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

    this.eventChain.tick();

    if (this.targetTime > 0) {
        this.x2 = 0;
        this.y2 = 0;

        this.x1 = 0;
        this.y1 = 0;

        this.x += (this.targetX - this.x) / (this.targetTime * this.parentWorld.ticksPS);
        this.y += (this.targetY - this.y) / (this.targetTime * this.parentWorld.ticksPS);
        this.targetTime -= 1 / this.parentWorld.ticksPS;
    } else {
        this.targetTime = 0;

        this.x1 += this.x2 / this.parentWorld.ticksPS;
        this.y1 += this.y2 / this.parentWorld.ticksPS;

        this.x += this.x1 / this.parentWorld.ticksPS;
        this.y += this.y1 / this.parentWorld.ticksPS;
    }
};

Entity.prototype.relTime = function () {
    return this.lifetime / this.parentWorld.ticksPS;
};

Entity.prototype.draw = function (context) {
};

Entity.prototype.remove = function () {
    //console.info("Removed Entity #" + this.id + " @ " + this.x + ";" + this.y);
    this.removalMark = true;
    this.eventChain.clear();
};

Entity.prototype.setVectors = function (posX, posY, speedX, speedY, accX, accY) {
    this.x = posX || posX === 0 ? posX : this.x;
    this.y = posY || posY === 0 ? posY : this.y;
    this.x1 = speedX || speedX === 0 ? speedX : this.x1;
    this.y1 = speedY || speedY === 0 ? speedY : this.y1;
    this.x2 = accX || accX === 0 ? accX : this.x2;
    this.y2 = accY || accY === 0 ? accY : this.y2;
};

Entity.prototype.headToEntity = function (target, speed, acceleration) {
    if (target) {
        this.headToPoint(target.x, target.y, speed, acceleration);
    }
};

Entity.prototype.headToPoint = function (targetX, targetY, speed, acceleration) {
    var d = this.parentWorld.distanceBetweenPoints(this.x, this.y, targetX, targetY);
    if (d !== 0)
        this.setVectors(null, null,
                (targetX - this.x) / d * speed,
                (targetY - this.y) / d * speed,
                (targetX - this.x) / d * acceleration,
                (targetY - this.y) / d * acceleration);
};

Entity.prototype.headToPointSmoothly = function (targetX, targetY, time) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.targetTime = time;
};

Entity.prototype.nearestEntity = function (type, range, filters) {
    var nearest = null;
    var nearestDistance = range || this.parentWorld.height * 2;
    for (var i in this.parentWorld.entities) {
        var e = this.parentWorld.entities[i];
        if ((e instanceof type && ((type === Projectile && !e.playerSide) || type !== Projectile)) || type === null) {
            if (e !== this && this.parentWorld.distanceBetweenEntities(this, e) < nearestDistance) {
                var complete = true;
                if (filters) {
                    for (var j in filters) {
                        if (e[j]) {
                            complete = complete && e[j]() === filters[j];
                        }
                    }
                }
                if (complete) {
                    nearest = e;
                    nearestDistance = this.parentWorld.distanceBetweenEntities(this, e);
                }
            }
        }
    }
    return nearest;
};

Entity.prototype.shootProjectile = function (angle, distance, speed, acceleration, width, sprite) {
    return new Projectile(this.parentWorld,
            this.x + distance * Math.sin(angle),
            this.y + distance * Math.cos(angle),
            Math.sin(angle) * speed,
            Math.cos(angle) * speed,
            Math.sin(angle) * acceleration,
            Math.cos(angle) * acceleration,
            width, false, sprite);
};

Entity.prototype.shootProjectileAt = function (target, distance, speed, acceleration, width, sprite) {
    var angle = Math.atan2(this.y - target.y, this.x - target.x);
    return this.shootProjectile(angle, distance, speed, acceleration, width, sprite);
};
