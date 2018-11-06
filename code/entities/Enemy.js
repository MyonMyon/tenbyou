function Enemy(parentWorld, x, y, x1, y1, x2, y2, width, health, spriteName) {
    extend(this, new Entity(parentWorld, x, y, x1 / parentWorld.ticksPS, y1 / parentWorld.ticksPS, x2 / parentWorld.ticksPS, y2 / parentWorld.ticksPS, width));
    this.sprite.set(SPRITE.enemy);
    if (spriteName) {
        this.sprite.set(spriteName);
        this.mirror = SPRITE.enemy[spriteName].mirror;
    }
    this.initialHealth = health || 20;
    this.health = this.initialHealth;
    this.cost = this.initialHealth * 100;
    this.title = "";
    this.drops = new Array();
    this.attacks = new Array();
    this.attackCurrent = -1;
    this.attackGroups = new Array();
    this.attackGroupCurrent = 0;
    this.bonus = 0;
}

Enemy.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);

    context.save();
    context.translate(ePos.x, ePos.y);
    if (this.mirror && this.x1 < 0)
        context.scale(-1, 1);
    if (this.angle)
        context.rotate(this.angle);

    this.sprite.draw(context, 0, 0, this.relTime(), this.parentWorld.vp.zoom * this.width * 2);

    context.restore();

    if (this.parentWorld.drawHitboxes) {
        context.fillStyle = "white";

        context.beginPath();

        context.arc(ePos.x, ePos.y, 1 * this.parentWorld.vp.zoom * this.width, 0, Math.PI * 2, false);

        context.fill();
        context.closePath();
    }

    if (this === this.parentWorld.boss && this.attackCurrent >= 0 && this.attackCurrent < this.attacks.length) {
        context.lineJoin = "square";
        context.lineCap = "butt";

        this.drawBossWheel(context, 22, 0, 1, BOSS_WHEEL_COLOR, 2);
        this.drawBossWheel(context, 24, 0, 1, BOSS_WHEEL_COLOR, 2);
        this.drawBossWheel(context, 25, 0, 1, BOSS_WHEEL_COLOR, 2);

        var sectionsS = this.attackGroups[this.attackGroupCurrent].spells;
        var sectionsN = this.attackGroups[this.attackGroupCurrent].nonspells;
        var thisSection = this.attackCurrent - this.attackGroups[this.attackGroupCurrent].start;

        var fullWheel = (sectionsS === 0 || sectionsN === 0);

        for (var i = thisSection; i < sectionsN; ++i)
            this.drawBossWheel(context, 23,
                    (i + ((i === thisSection) ? 1 - this.health / this.initialHealth : 0)) / sectionsN * (fullWheel ? 1 : 0.75),
                    (i + 1) / sectionsN * (fullWheel ? 1 : 0.75),
                    (i % 2 === 0) ? BOSS_HEALTH_COLOR : BOSS_HEALTH_ALT_COLOR, 7);
        for (var i = Math.max(thisSection - sectionsN, 0); i < sectionsS; ++i)
            this.drawBossWheel(context, 23,
                    (i + ((i === (thisSection - sectionsN)) ? 1 - this.health / this.initialHealth : 0)) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
                    (i + 1) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
                    (i % 2 === 0) ? BOSS_HEALTH_SPELL_COLOR : BOSS_HEALTH_SPELL_ALT_COLOR, 7);

        if (this.attacks[this.attackCurrent].spell && this.parentWorld.player.spellCompleteTerms) { //for spells 
            if (this.lifetime < this.attacks[this.attackCurrent].decrTime)
                this.drawBossWheel(context, 24.5, this.lifetime / this.attacks[this.attackCurrent].time,
                        this.attacks[this.attackCurrent].decrTime / this.attacks[this.attackCurrent].time, BOSS_TIMER_ALT_COLOR, 3);
            this.drawBossWheel(context, 24.5, Math.max(this.lifetime / this.attacks[this.attackCurrent].time,
                    this.attacks[this.attackCurrent].decrTime / this.attacks[this.attackCurrent].time),
                    1, BOSS_TIMER_COLOR, 3);
        }
        else //for non-spells
            this.drawBossWheel(context, 24.5, this.lifetime / this.attacks[this.attackCurrent].time, 1, BOSS_TIMER_ALT_COLOR, 3);
    }
};

Enemy.prototype.drawBossWheel = function (context, r, from, to, color, lineWidth) {
    if (from !== to) {
        var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
        context.lineWidth = lineWidth;
        context.strokeStyle = color;

        context.beginPath();
        context.arc(ePos.x, ePos.y, r * this.parentWorld.vp.zoom, -Math.PI / 2 + Math.PI * from * 2, -Math.PI / 2 + Math.PI * to * 2, false);
        context.stroke();
        context.closePath();
    }
};

Enemy.prototype.step = function () {
    this.$step();

    if (this.health <= 0) {
        for (var i = 0; i < this.drops.length; ++i)
            if (this.drops[i].reqDamage === 0 && this.attackCurrent === this.drops[i].attackID) {
                var a = Math.random() * Math.PI * 2;
                var r = Math.random() * this.initialHealth / 5;
                var p = this.drops[i].cat === "power" && this.parentWorld.player.power >= this.parentWorld.player.powerMax;

                new Bonus(this.parentWorld, this.x + Math.sin(a) * r, this.y + Math.cos(a) * r,
                        p ? "point" : this.drops[i].cat, p ? false : this.drops[i].small, false);
            }

        if (this.attackCurrent === -1) {
            this.behaviorFinal();
            this.parentWorld.player.score += this.cost;
        } else {
            this.nextAttack();
        }
    }

    //remove from world
    if ((this.x > this.parentWorld.width / 2 + this.width * 2
            || this.x < -this.parentWorld.width / 2 - this.width * 2
            || this.y > this.parentWorld.height / 2 + this.width * 2
            || this.y < -this.parentWorld.height / 2 - this.width * 2) && this !== this.parentWorld.boss) {//DO NOT DELETE BOSSES
        this.remove();
        return;
    }

    //collision with player
    if (this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player) <
            (this.width + this.parentWorld.player.width) && this.parentWorld.player.invulnTime === 0) {
        this.parentWorld.player.kill();
    }

    //collision with bullets
    for (var i in  this.parentWorld.entities) {
        var e = this.parentWorld.entities[i];
        if (e instanceof Projectile && e.playerSide) {
            if (this.parentWorld.distanceBetweenEntities(this, e) < (this.width + e.width)) {
                this.hurt(e.damage);
                e.remove();
            }
        }
    }

    if (this.attackCurrent === -1)
        this.behavior();
    else if (this.attackCurrent < this.attacks.length) {
        this.bonus = parseInt((this.attacks[this.attackCurrent].bonusBound +
                (1 - (Math.max(this.lifetime, this.attacks[this.attackCurrent].decrTime) /
                        (this.attacks[this.attackCurrent].time - this.attacks[this.attackCurrent].decrTime))) *
                (this.attacks[this.attackCurrent].bonus - this.attacks[this.attackCurrent].bonusBound)) / 100, 10) * 100;

        if (this.attacks[this.attackCurrent].func) {
            this.attacks[this.attackCurrent].func(this, this.attacks[this.attackCurrent].param);
        }
        if (this.lifetime >= this.attacks[this.attackCurrent].time) {
            this.nextAttack();
        }
    }
};

Enemy.prototype.behavior = function () {
};

Enemy.prototype.behaviorFinal = function (ignoreOnDestroy) {
    new Particle(this.parentWorld, this.x, this.y, this.initialHealth < 100 ? 20 : 40, this.initialHealth < 100 ? 8 : 16, false, false, "splash");
    this.parentWorld.splash(this, this.initialHealth / 5, 8, 10);
    if (!ignoreOnDestroy) {
        this.onDestroy();
    }
    this.remove();
};

Enemy.prototype.onDamage = function (damage) {
};
Enemy.prototype.onDestroy = function () {
};

Enemy.prototype.hurt = function (damage) {
    var healthOld = this.health;

    if (this.parentWorld.boss !== this || (this.attackCurrent >= 0 && this.attackCurrent < this.attacks.length))
        this.health -= damage;

    if (this.health > 0) {
        for (var i = 0; i < this.drops.length; ++i)
            if (this.drops[i].reqDamage !== 0 && this.attackCurrent === this.drops[i].attackID && ((((this.initialHealth - this.health) % this.drops[i].reqDamage) < ((this.initialHealth - this.health - damage) % this.drops[i].reqDamage) && damage > 0) || damage > this.drops[i].reqDamage))
                new Bonus(this.parentWorld, this.x + Math.random() * 12 - 6, this.y + Math.random() * 12 - 6,
                        (this.drops[i].cat === "power" && this.parentWorld.player.power >= this.parentWorld.player.powerMax) ? "point" : this.drops[i].cat, this.drops[i].small, false);
    } else {
        this.health = 0;
    }
    this.parentWorld.splash(this, damage, this.width * 2, this.width * 2);
    this.parentWorld.player.score += Math.round(healthOld - this.health) * 10;

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
            attackID: afterAttack ? (this.attacks.length - 1) : -1
        });
};

Enemy.prototype.addAttack = function (spell, title, init, func, finish, param, health, time, decrTime, bonus, bonusBound, newGroup) {
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

    this.attacks[n] = {spell: spell, title: title || "", init: init, func: func, finish: finish, param: param, health: health, time: time, bonus: bonus, decrTime: decrTime, bonusBound: bonusBound};
};

Enemy.prototype.addNonSpell = function (nonSpell, newGroup) {
    this.addAttack(false, null, nonSpell.init, nonSpell.func, nonSpell.finish, this.parentWorld.difficulty, nonSpell.health, nonSpell.time, null, null, null, newGroup);
};

Enemy.prototype.addSpell = function (spell, newGroup) {
    this.addAttack(true, spell.names[this.parentWorld.difficulty], spell.init, spell.func, spell.finish, this.parentWorld.difficulty, spell.health, spell.time, spell.decrTime, spell.bonus, spell.bonusBound, newGroup);
};

Enemy.prototype.nextAttack = function () {
    if (this.parentWorld.boss === this && this.attackCurrent >= 0 && this.attacks[this.attackCurrent].spell) {
        if (this.health <= 0 && this.parentWorld.player.spellCompleteTerms && this.bonus > 0) {
            this.parentWorld.player.score += this.bonus;
            this.parentWorld.vp.showMessage(["Spell Card Bonus!", this.bonus], 100);
        }
        else
            this.parentWorld.vp.showMessage(["Bonus failed"], 50);
        if (this.attacks[this.attackCurrent].finish) {
            this.attacks[this.attackCurrent].finish(this);
        }
    }

    var g = this.attackGroups[this.attackGroupCurrent];
    ++this.attackCurrent;

    if (this.attackCurrent >= this.attacks.length) {
        this.behaviorFinal();
        this.parentWorld.boss = null;
        if (this.parentWorld.bossLast) {
            this.parentWorld.eventChain.addEventNow(function(world) {
                world.stageBonus();
            }, 2);
        } else {
            this.parentWorld.nextSubstage();
        }
    } else {
        this.parentWorld.player.spellCompleteTerms = true;
        this.initHealth(this.attacks[this.attackCurrent].health);
        if (this.attacks[this.attackCurrent].init) {
            this.attacks[this.attackCurrent].init(this);
        }
    }

    if (g && (this.attackCurrent >= (g.start + g.nonspells + g.spells))) {
        ++this.attackGroupCurrent;
    }

    this.parentWorld.clearField(0);
    this.parentWorld.removeEnemies();

    this.lifetime = 0;
};

Enemy.prototype.setBossData = function (bossName, isLast) {
    this.setVectors(0, -this.parentWorld.width / 2 - 40);

    this.width = BOSS[bossName].width;
    this.sprite.set(bossName);

    this.behavior = function () {
        if (this.lifetime === 1)
            this.headToPointSmoothly(0, -this.parentWorld.height / 4, 3);
        if (this.lifetime === 100)
            this.nextAttack();
    };

    this.parentWorld.setBoss(this, BOSS[bossName].name, isLast);
};
