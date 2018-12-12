function Enemy(world, x, y, x1, y1, x2, y2, width, health, spriteName) {
    extend(this, new Entity(world, x, y, x1, y1, x2, y2, width));
    this.sprite.set(SPRITE.enemy);
    if (spriteName) {
        this.sprite.set(spriteName);
        this.mirror = SPRITE.enemy[spriteName].mirror;
    }
    this.appearanceTime = 0;
    this.initialHealth = health || 20;
    this.health = this.initialHealth;
    this.cost = this.initialHealth * 100;
    this.title = "";
    this.drops = [];
    this.attacks = [];
    this.attackCurrent = null;
    this.attackGroups = [];
    this.attackGroupCurrent = 0;
    this.bonus = 0;
}

Enemy.prototype.draw = function (context) {
    var ePos = this.world.vp.toScreen(this.x, this.y);

    context.save();
    if (this.relTime() < this.appearanceTime) {
        context.globalAlpha = this.relTime() / (this.appearanceTime * 2);
    }
    context.translate(ePos.x, ePos.y);
    if (this.mirror && this.x1 < 0)
        context.scale(-1, 1);
    if (this.angle)
        context.rotate(this.angle);

    this.sprite.draw(context, 0, 0, this.relTime(), this.world.vp.zoom * this.width * 2);

    context.restore();

    if (this.world.drawHitboxes) {
        context.fillStyle = "white";

        context.beginPath();

        context.arc(ePos.x, ePos.y, 1 * this.world.vp.zoom * this.width, 0, Math.PI * 2, false);

        context.fill();
        context.closePath();
    }

    if (this === this.world.boss && this.attackCurrent !== null && this.attackCurrent < this.attacks.length) {
        context.lineJoin = "square";
        context.lineCap = "butt";

        this.drawBossWheel(context, 22, 0, 1, BOSS_WHEEL_COLOR, BOSS_WHEEL_WIDTH);
        this.drawBossWheel(context, 24, 0, 1, BOSS_WHEEL_COLOR, BOSS_WHEEL_WIDTH);
        this.drawBossWheel(context, 25, 0, 1, BOSS_WHEEL_COLOR, BOSS_WHEEL_WIDTH);

        var sectionsS = this.attackGroups[this.attackGroupCurrent].spells;
        var sectionsN = this.attackGroups[this.attackGroupCurrent].nonspells;
        var thisSection = this.attackCurrent - this.attackGroups[this.attackGroupCurrent].start;

        var fullWheel = (sectionsS === 0 || sectionsN === 0);

        for (var i = thisSection; i < sectionsN; ++i)
            this.drawBossWheel(context, 23,
                    (i + ((i === thisSection) ? 1 - this.health / this.initialHealth : 0)) / sectionsN * (fullWheel ? 1 : 0.75),
                    (i + 1) / sectionsN * (fullWheel ? 1 : 0.75),
                    (i % 2 === 0) ? BOSS_HEALTH_COLOR : BOSS_HEALTH_ALT_COLOR, BOSS_HEALTH_WIDTH);
        for (var i = Math.max(thisSection - sectionsN, 0); i < sectionsS; ++i)
            this.drawBossWheel(context, 23,
                    (i + ((i === (thisSection - sectionsN)) ? 1 - this.health / this.initialHealth : 0)) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
                    (i + 1) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
                    (i % 2 === 0) ? BOSS_HEALTH_SPELL_COLOR : BOSS_HEALTH_SPELL_ALT_COLOR, BOSS_HEALTH_WIDTH);

        var rt = this.relTime();
        var at = this.attacks[this.attackCurrent].time;
        var dt = this.attacks[this.attackCurrent].decrTime;
        if (this.attacks[this.attackCurrent].spell && this.world.player.spellCompleteTerms) { //for spells 
            if (rt < dt) {
                this.drawBossWheel(context, 24.5, rt / at, dt / at, BOSS_TIMER_ALT_COLOR, BOSS_TIMER_WIDTH);
            }
            this.drawBossWheel(context, 24.5, Math.max(rt / at, dt / at), 1, BOSS_TIMER_COLOR, BOSS_TIMER_WIDTH);
        } else //for non-spells
            this.drawBossWheel(context, 24.5, rt / at, 1, BOSS_TIMER_ALT_COLOR, BOSS_TIMER_WIDTH);
    }
};

Enemy.prototype.drawBossWheel = function (context, r, from, to, color, lineWidth) {
    if (from !== to) {
        var ePos = this.world.vp.toScreen(this.x, this.y);
        context.lineWidth = lineWidth * this.world.vp.zoom;
        context.strokeStyle = color;

        context.beginPath();
        context.arc(ePos.x, ePos.y, r * this.world.vp.zoom, -Math.PI / 2 + Math.PI * from * 2, -Math.PI / 2 + Math.PI * to * 2, false);
        context.stroke();
        context.closePath();
    }
};

Enemy.prototype.step = function () {
    var l = this.relTime();
    this.$step();
    if (l < this.appearanceTime && this.relTime() >= this.appearanceTime) {
        this.world.splash(this, this.initialHealth / 5, 8, 0.33);
    }

    if (this.health <= 0) {
        for (var i = 0; i < this.drops.length; ++i)
            if (this.drops[i].reqDamage === 0 && this.attackCurrent === this.drops[i].attackID) {
                this.dropBonus(
                        Math.random() * Math.PI * 2,
                        Math.random() * this.initialHealth / 5,
                        this.drops[i].cat,
                        this.drops[i].small);
            }

        if (this.attackCurrent === null) {
            this.behaviorFinal();
            this.world.player.score += this.cost;
        } else {
            this.nextAttack();
        }
    }

    //remove from world
    if ((this.x > this.world.width / 2 + this.width * 2
            || this.x < -this.world.width / 2 - this.width * 2
            || this.y > this.world.height / 2 + this.width * 2
            || this.y < -this.world.height / 2 - this.width * 2) && this !== this.world.boss) {//DO NOT DELETE BOSSES
        this.remove();
        return;
    }

    //collision with player
    if (this.relTime() >= this.appearanceTime &&
            !this.world.player.isInvulnerable() &&
            this.world.distanceBetweenEntities(this, this.world.player) <
            (this.width + this.world.player.width)) {
        this.world.player.kill();
    }

    //collision with placed player weapons
    for (var i in this.world.entities) {
        var w = this.world.entities[i];
        if (w instanceof Weapon && !w.isInvulnerable() && this.world.collisionCheck(this, w)) {
            w.hit();
        }
    }

    //collision with bullets
    if ((this.world.boss !== this || (this.attackCurrent !== null && this.attackCurrent < this.attacks.length)) &&
            this.relTime() >= this.appearanceTime) {
        for (var i in  this.world.entities) {
            var e = this.world.entities[i];
            if (e instanceof Projectile && e.playerSide) {
                if (this.world.collisionCheck(this, e)) {
                    this.hurt(e.damage, {x: e.x, y: e.y});
                    e.remove();
                }
            }
        }
    }

    if (this.attackCurrent === null)
        this.behavior();
    else if (this.attackCurrent < this.attacks.length) {
        var rt = this.relTime();
        var at = this.attacks[this.attackCurrent].time;
        var dt = this.attacks[this.attackCurrent].decrTime;
        var bb = this.attacks[this.attackCurrent].bonusBound;
        var b = this.attacks[this.attackCurrent].bonus;
        this.bonus = parseInt(Math.min(b, bb + (b - bb) * (at - rt) / (at - dt)) / 10, 10) * 10;
        if (this.attacks[this.attackCurrent].func) {
            this.attacks[this.attackCurrent].func(this);
        }
        if (rt >= at) {
            this.nextAttack();
        }
    }
};

Enemy.prototype.behavior = function () {
};

Enemy.prototype.behaviorFinal = function (ignoreOnDestroy) {
    new Particle(this.world, this.x, this.y, this.initialHealth < 100 ? 0.66 : 1.33, this.initialHealth < 100 ? 8 : 16, false, false, "splash");
    this.world.splash(this, this.initialHealth / 5, 8, 0.33);
    if (!ignoreOnDestroy) {
        this.onDestroy();
    }
    this.remove();
};

Enemy.prototype.onDamage = function (damage) {
};
Enemy.prototype.onDestroy = function () {
};

Enemy.prototype.isInvulnerable = function () {
    return this === this.world.boss && this.attackCurrent === null || this.relTime() < this.appearanceTime;
};

Enemy.prototype.hurt = function (damage, position) {
    if (this.isInvulnerable()) {
        return;
    }

    var healthOld = this.health;
    this.health -= damage;

    if (this.health > 0) {
        for (var i = 0; i < this.drops.length; ++i)
            if (this.drops[i].reqDamage !== 0 && this.attackCurrent === this.drops[i].attackID && ((((this.initialHealth - this.health) % this.drops[i].reqDamage) < ((this.initialHealth - this.health - damage) % this.drops[i].reqDamage) && damage > 0) || damage > this.drops[i].reqDamage))
                new Bonus(this.world, this.x + Math.random() * 12 - 6, this.y + Math.random() * 12 - 6,
                        (this.drops[i].cat === "power" && this.world.player.power >= this.world.player.powerMax) ? "point" : this.drops[i].cat, this.drops[i].small, false);
    } else {
        this.health = 0;
    }
    this.world.splash(position || this, damage, this.width * 2, this.width * 0.07);
    this.world.player.score += Math.round(healthOld - this.health) * 10;

    this.onDamage(damage);
};

Enemy.prototype.initHealth = function (health) {
    this.initialHealth = health;
    this.health = health;
};

Enemy.prototype.addDrops = function (cat, small, amount, reqDamage, afterAttack) {
    for (var i = 0; i < amount; ++i)
        this.drops.push({
            cat: cat,
            small: small,
            reqDamage: reqDamage || 0,
            attackID: afterAttack ? (this.attacks.length - 1) : null
        });
};

Enemy.prototype.addAttack = function (spell, title, data, newGroup) {
    //decrTime - time when bonus counter start to decrease
    //bonusBound - bonus gotten in the last moment
    //newGroup - forced start of a new group of attacks
    var n = this.attacks.length;
    var m = this.attackGroups.length - 1;

    if (n === 0 || (this.attacks[n - 1].spell && !spell) || newGroup)
        this.attackGroups[++m] = {start: n, nonspells: 0, spells: 0};
    if (spell)
        ++this.attackGroups[m].spells;
    else
        ++this.attackGroups[m].nonspells;

    this.attacks[n] = data;
    this.attacks[n].spell = spell;
    this.attacks[n].title = title;
};

Enemy.prototype.addNonSpell = function (nonSpell, newGroup) {
    this.addAttack(false, null, nonSpell, newGroup);
};

Enemy.prototype.addSpell = function (spell, newGroup) {
    this.addAttack(true, spell.names[this.world.difficulty], spell, newGroup);
};

Enemy.prototype.nextAttack = function () {
    this.world.clearField(0);
    this.world.removeEnemies();

    if (this.world.boss === this && this.attackCurrent !== null && this.attacks[this.attackCurrent].spell) {
        if (this.health <= 0 && this.world.player.spellCompleteTerms && this.bonus > 0) {
            this.world.player.score += this.bonus;
            this.world.vp.showMessage(["Spell Card Bonus!", this.bonus], 3);
        } else
            this.world.vp.showMessage(["Bonus failed"], 1.5);
        if (this.attacks[this.attackCurrent].finish) {
            this.attacks[this.attackCurrent].finish(this);
        }
    }

    var g = this.attackGroups[this.attackGroupCurrent];
    if (this.attackCurrent === null) {
        this.attackCurrent = 0;
    } else {
        ++this.attackCurrent;
    }
    this.eventChain.clear();

    if (this.attackCurrent >= this.attacks.length) {
        this.behaviorFinal();
        this.world.boss = null;
        if (this.world.bossLast) {
            this.world.eventChain.addEventNow(function (world) {
                world.stageBonus();
            }, 2);
        } else {
            this.world.nextSubstage();
        }
    } else {
        this.world.player.spellCompleteTerms = true;
        this.initHealth(this.attacks[this.attackCurrent].health);
        if (this.attacks[this.attackCurrent].init) {
            this.attacks[this.attackCurrent].init(this);
        }
    }

    if (g && (this.attackCurrent >= (g.start + g.nonspells + g.spells))) {
        ++this.attackGroupCurrent;
    }

    this.lifetime = 0;
};

Enemy.prototype.setBossData = function (bossName, isLast) {
    this.setVectors(0, -this.world.width / 2 - 40);

    this.width = CHAR[bossName].width;
    this.sprite.set(bossName);

    this.eventChain.addEvent(function (b) {
        b.headToPointSmoothly(0, -b.world.height / 4, 3);
    }, 0);
    this.eventChain.addEvent(function (b) {
        b.nextAttack();
    }, 3);

    this.world.setBoss(this, CHAR[bossName].name, isLast);
};
