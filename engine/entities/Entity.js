class Entity {
    constructor(world, x, y, x1, y1, x2, y2, width) {
        //position (global)
        this.x = x || 0;
        this.y = y || 0;

        //position (relative to anchor)
        this.x0 = x || 0;
        this.y0 = y || 0;

        //speedЩ
        this.x1 = x1 || 0;
        this.y1 = y1 || 0;

        //acceleration
        this.x2 = x2 || 0;
        this.y2 = y2 || 0;

        //ang. position
        this.a0 = 0;
        this.r0 = 0;

        //ang. speed
        this.a1 = 0;
        this.r1 = 0;

        //ang. acceleration
        this.a2 = 0;
        this.r2 = 0;

        if (width === undefined || width === null) {
            this.width = 2;
        } else {
            this.width = width;
        }

        //width changing:
        this.w1 = 0;
        this.w2 = 0;

        this.fixedX = this.x;
        this.fixedY = this.y;

        this.targetX = 0;
        this.targetY = 0;
        this.targetTime = 0;

        this.lifetime = 0;
        this.removeTime = Infinity;

        this.priority = 0;
        this.sprite = new SpriteHandler();

        this.angle = 0;

        this.reflects = 0;

        this.anchor = null;
        this.anchored = [];
        this.preserve = false;

        this.world = world;
        this.id = ++world.lastID;
        //console.info("Added Entity #" + this.id + " @ " + this.x + ";" + this.y);
        this.init();
    }

    init() {
        this.world.entities.push(this);
        this.eventChain = new EventChain(this);
    }

    flush() {
        this.fixedX = this.x;
        this.fixedY = this.y;
        if (this.removalMark) {
            this.world.entities.splice(this.world.entities.indexOf(this), 1);
        }
    }

    step() {
        this.eventChain.tick();

        if (this.targetTime > 0) {
            this.setAnchor(null);
            this.x2 = 0;
            this.y2 = 0;

            this.x1 = 0;
            this.y1 = 0;

            this.x += (this.targetX - this.x) / (this.targetTime * this.world.ticksPS);
            this.y += (this.targetY - this.y) / (this.targetTime * this.world.ticksPS);
            this.targetTime -= 1 / this.world.ticksPS;
        } else {
            this.targetTime = 0;

            this.a1 += this.a2 / this.world.ticksPS;
            this.r1 += this.r2 / this.world.ticksPS;

            this.a0 += this.a1 / this.world.ticksPS;
            this.r0 += this.r1 / this.world.ticksPS;

            this.x1 += this.x2 / this.world.ticksPS;
            this.y1 += this.y2 / this.world.ticksPS;

            this.x0 += this.x1 / this.world.ticksPS;
            this.y0 += this.y1 / this.world.ticksPS;

            if (this.anchor) {
                this.x = this.anchor.x + this.x0 + Math.cos(this.a0) * this.r0;
                this.y = this.anchor.y + this.y0 + Math.sin(this.a0) * this.r0;
            } else {
                this.x += this.x1 / this.world.ticksPS;
                this.y += this.y1 / this.world.ticksPS;
            }
        }

        if (this.reflects > 0) {
            if (this.x > this.world.width / 2 || this.x < -this.world.width / 2) {
                this.x1 = -this.x1;
                this.x -= (this.x - this.world.width / (this.x > 0 ? 2 : -2)) * 2;
                this.onReflect("x");
                --this.reflects;
            }
            if (this.y > this.world.height / 2 || this.y < -this.world.height / 2) {
                this.y1 = -this.y1;
                this.y -= (this.y - this.world.height / (this.y > 0 ? 2 : -2)) * 2;
                this.onReflect("y");
                --this.reflects;
            }
        }

        this.w1 += this.w2 / this.world.ticksPS;
        this.width += this.w1 / this.world.ticksPS;

        this.lifetime += 1 / this.world.ticksPS;

        if (this.lifetime > this.removeTime) {
            this.remove(true);
        }
    }

    getAngle() {
        return Math.atan2(this.y1, this.x1);
    }

    getSpeed() {
        return Util.vectorLength(this.x1, this.y1);
    }

    setSpeed(newSpeed) {
        var factor = newSpeed / this.getSpeed();
        this.x1 *= factor;
        this.y1 *= factor;
    }

    getAcceleration() {
        return Util.vectorLength(this.x2, this.y2);
    }

    setAcceleration(newAcceleration) {
        var factor = newAcceleration / this.getAcceleration();
        this.x2 *= factor;
        this.y2 *= factor;
    }

    draw(context) {
    }

    remove(forced) {
        //console.info("Removed Entity #" + this.id + " @ " + this.x + ";" + this.y);
        if (this.anchored.length) {
            if (!forced) {
                return;
            }
            var list = this.anchored.slice();
            for (var i in list) {
                list[i].setAnchor(null);
            }
        }
        this.removalMark = true;
        this.setAnchor(null);
        this.eventChain.clear();
    }

    setAnchor(entity, useAnchorAngle) {
        if (!entity && this.anchor) {
            var index = this.anchor.anchored.indexOf(this);
            if (index >= 0) {
                this.anchor.anchored.splice(index, 1);
                this.x = this.anchor.x + this.x0;
                this.y = this.anchor.y + this.y0;
                this.x1 = this.anchor.x1 + this.x1;
                this.y1 = this.anchor.y1 + this.y1;
                this.x2 = this.anchor.x2 + this.x2;
                this.y2 = this.anchor.y2 + this.y2;
            }
        }
        if (entity) {
            entity.anchored.push(this);
            this.x = entity.x + this.x0;
            this.y = entity.y + this.y0;
        }
        this.anchor = entity;
        this.useAnchorAngle = useAnchorAngle;
    }

    setVectors(posX, posY, speedX, speedY, accX, accY) {
        this.x = posX || posX === 0 ? posX : this.x;
        this.y = posY || posY === 0 ? posY : this.y;
        this.x1 = speedX || speedX === 0 ? speedX : this.x1;
        this.y1 = speedY || speedY === 0 ? speedY : this.y1;
        this.x2 = accX || accX === 0 ? accX : this.x2;
        this.y2 = accY || accY === 0 ? accY : this.y2;
    }

    setPolarVectors(posA, posR, speedA, speedR, accA, accR) {
        this.a0 = posA || posA === 0 ? posA : this.a0;
        this.r0 = posR || posR === 0 ? posR : this.r0;
        this.a1 = speedA || speedA === 0 ? speedA : this.a1;
        this.r1 = speedR || speedR === 0 ? speedR : this.r1;
        this.a2 = accA || accA === 0 ? accA : this.a2;
        this.r2 = accR || accR === 0 ? accR : this.r2;
    }

    setWidthVectors(width, speed, acc) {
        this.width = width || width === 0 ? width : this.width;
        this.w1 = speed || speed === 0 ? speed : this.w1;
        this.w2 = acc || acc === 0 ? acc : this.w2;
    }

    approachEntity(target, initSpeed) {
        if (target) {
            this.approachPoint(target.x, target.y, initSpeed);
        }
    }

    approachPoint(targetX, targetY, initSpeed) {
        this.headToPoint(targetX, targetY, initSpeed, -initSpeed * initSpeed / 2 / Util.distanceBetweenPoints(this.x, this.y, targetX, targetY));
    }

    headToEntity(target, speed, acceleration) {
        if (target) {
            this.headToPoint(target.x, target.y, speed, acceleration);
        }
    }

    headToPoint(targetX, targetY, speed, acceleration) {
        var d = Util.distanceBetweenPoints(this.x, this.y, targetX, targetY);
        if (d !== 0)
            this.setVectors(null, null,
                (targetX - this.x) / d * speed,
                (targetY - this.y) / d * speed,
                (targetX - this.x) / d * acceleration,
                (targetY - this.y) / d * acceleration);
    }

    headToPointSmoothly(targetX, targetY, time) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.targetTime = time;
    }

    nearestEntity(type, range, angleRange, filters) {
        var angleRange = angleRange || Math.PI;
        var nearest = null;
        var nearestDistance = range || this.world.height * 2;
        for (var i in this.world.entities) {
            var e = this.world.entities[i];
            if ((e instanceof type && ((type === Projectile && !e.playerSide) || type !== Projectile)) || type === null) {
                if (e !== this &&
                    Util.distanceBetweenEntities(this, e) < nearestDistance &&
                    Math.abs(Util.angleBetweenEntities(this, e) - this.getAngle()) <= angleRange) {
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
                        nearestDistance = Util.distanceBetweenEntities(this, e);
                    }
                }
            }
        }
        return nearest;
    }

    shootProjectile(angle, distance, speed, acceleration, width, sprite, anchored) {
        var p = new Projectile(this.world,
            (anchored ? 0 : this.x) + distance * Math.cos(angle),
            (anchored ? 0 : this.y) + distance * Math.sin(angle),
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            Math.cos(angle) * acceleration,
            Math.sin(angle) * acceleration,
            width, false, sprite);
        if (anchored) {
            p.setAnchor(this);
        }
        if ((this.x > this.world.width / 2
            || this.x < -this.world.width / 2
            || this.y > this.world.height / 2
            || this.y < -this.world.height / 2)) {
            //don't shoot from offscreen
            p.remove();
        }
        return p;
    }

    shootProjectileAt(target, distance, speed, acceleration, width, sprite, anchored) {
        var angle = Util.angleBetweenEntities(this, target);
        return this.shootProjectile(angle, distance, speed, acceleration, width, sprite, anchored);
    }

    arcProjectiles(centerAngle, rangeAngle, count, distance, speed, acceleration, width, sprite, anchored) {
        var rCount = count;
        var dAngle = 0;
        if (rangeAngle === null) {
            rangeAngle = Math.PI * 2;
        }
        if (rangeAngle < Math.PI * 2) {
            --rCount;
            dAngle = -rangeAngle / 2;
        }
        var ps = [];
        for (var i = 0; i < count; i++) {
            var a = Util.iterate(centerAngle, i) + dAngle + i * rangeAngle / rCount;
            ps.push(this.shootProjectile(a,
                Util.iterate(distance, i),
                Util.iterate(speed, i),
                Util.iterate(acceleration, i),
                Util.iterate(width, i),
                Util.iterate(sprite, i),
                Util.iterate(anchored, i)));
        }
        return ps;
    }

    isInvulnerable() {
        return this.invulnerable;
    }

    addDrops(cat, amount, reqDamage, afterAttack) {
        amount = amount || 1;
        for (var i = 0; i < amount; ++i) {
            this.drops.push({
                cat: cat,
                reqDamage: reqDamage || 0,
                attackID: afterAttack ? (this.attacks.length - 1) : null
            });
        }
    }

    dropBonus(angle, distance, cat) {
        var p = cat === "power" && this.world.player.power >= this.world.player.powerMax;
        return new Bonus(
            this.world,
            this.x + Math.cos(angle) * distance,
            this.y + Math.sin(angle) * distance,
            p ? "point" : cat,
            false);
    }

    on(second, func) {
        return this.eventChain.addEvent(func, second);
    }

    onSync(second, func, times) {
        return this.eventChain.addEvent(func, null, second, times, true);
    }

    onReflect(axis) {
        //Override with some custom data!
    }
}
