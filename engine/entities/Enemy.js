class Enemy extends Entity {
    constructor(world, x, y, x1, y1, x2, y2, width, health, spriteName) {
        super(world, x, y, x1, y1, x2, y2, width);
        this.sprite.set(SPRITE.enemy);
        if (spriteName) {
            this.sprite.set(spriteName);
            this.mirror = SPRITE.enemy[spriteName].mirror;
        }
        this.appearanceTime = 0;
        if (typeof health === "object") {
            health = health[world.difficulty];
        }
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
        this.lastAttackTimer = 0;
        this.lastSplash = 0;
    }

    draw(context) {
        var ePos = this.world.vp.toScreenFX(this.x, this.y);

        context.save();
        if (this.lifetime < this.appearanceTime) {
            context.globalAlpha = this.lifetime / (this.appearanceTime * 2);
        }
        context.translate(ePos.x, ePos.y);
        if (this.mirror && this.x1 < 0)
            context.scale(-1, 1);
        if (this.angle)
            context.rotate(this.angle);

        this.sprite.draw(context, 0, 0, this.lifetime, this.world.vp.zoom * this.width * 2);

        context.restore();

        if (this.world.drawHitboxes) {
            context.fillStyle = "white";

            context.beginPath();

            context.arc(ePos.x, ePos.y, 1 * this.world.vp.zoom * this.width, 0, Math.PI * 2, false);

            context.fill();
            context.closePath();
        }

        if (this === this.world.boss && this.attackCurrent !== null && this.attackCurrent < this.attacks.length && !this.world.dialogue) {
            context.lineJoin = "square";
            context.lineCap = "butt";

            this.drawBossWheel(context, 22, 0, 1, BOSS_WHEEL_COLOR, BOSS_WHEEL_WIDTH);
            this.drawBossWheel(context, 24, 0, 1, BOSS_WHEEL_COLOR, BOSS_WHEEL_WIDTH);
            this.drawBossWheel(context, 25, 0, 1, BOSS_WHEEL_COLOR, BOSS_WHEEL_WIDTH);

            var sectionsS = this.attackGroups[this.attackGroupCurrent].spells;
            var sectionsN = this.attackGroups[this.attackGroupCurrent].nonspells;
            var thisSection = this.attackCurrent - this.attackGroups[this.attackGroupCurrent].start;

            var fullWheel = (sectionsS === 0 || sectionsN === 0);

            for (let i = thisSection; i < sectionsN; ++i)
                this.drawBossWheel(context, 23,
                    (i + ((i === thisSection) ? 1 - this.health / this.initialHealth : 0)) / sectionsN * (fullWheel ? 1 : 0.75),
                    (i + 1) / sectionsN * (fullWheel ? 1 : 0.75),
                    (i % 2 === 0) ? BOSS_HEALTH_COLOR : BOSS_HEALTH_ALT_COLOR, BOSS_HEALTH_WIDTH);
            for (let i = Math.max(thisSection - sectionsN, 0); i < sectionsS; ++i)
                this.drawBossWheel(context, 23,
                    (i + ((i === (thisSection - sectionsN)) ? 1 - this.health / this.initialHealth : 0)) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
                    (i + 1) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
                    (i % 2 === 0) ? BOSS_HEALTH_SPELL_COLOR : BOSS_HEALTH_SPELL_ALT_COLOR, BOSS_HEALTH_WIDTH);

            var rt = this.lifetime;
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
    }

    drawBossWheel(context, r, from, to, color, lineWidth) {
        if (from !== to) {
            var ePos = this.world.vp.toScreenFX(this.x, this.y);
            context.lineWidth = lineWidth * this.world.vp.zoom;
            context.strokeStyle = color;

            context.beginPath();
            context.arc(ePos.x, ePos.y, r * this.world.vp.zoom, -Math.PI / 2 + Math.PI * from * 2, -Math.PI / 2 + Math.PI * to * 2, false);
            context.stroke();
            context.closePath();
        }
    }

    step() {
        var l = this.lifetime;
        super.step();
        if (l < this.appearanceTime && this.lifetime >= this.appearanceTime) {
            this.world.splash(this, this.initialHealth / 5, 8, 0.33);
        }

        if (this.health <= 0) {
            for (let drop of this.drops)
                if (drop.reqDamage === 0 && this.attackCurrent === drop.attackID && !drop.removed) {
                    this.dropBonus(
                        Random.nextFloat(Math.PI * 2),
                        Random.nextFloat(this.initialHealth / 5),
                        drop.cat);
                        drop.removed = true;
                }

            if (this.attackCurrent === null) {
                this.behaviorFinal();
                this.world.player.score += this.cost;
            } else {
                this.nextAttack();
            }
            return;
        }

        //remove from world
        if ((this.x > this.world.width / 2 + this.width * 2
            || this.x < -this.world.width / 2 - this.width * 2
            || this.y > this.world.height / 2 + this.width * 2
            || this.y < -this.world.height / 2 - this.width * 2) && this !== this.world.boss) {//DO NOT DELETE BOSSES
            this.remove(true);
            return;
        }

        //collision with player
        if (this.lifetime >= this.appearanceTime &&
            !this.world.player.isInvulnerable() &&
            Util.distanceBetweenEntities(this, this.world.player) <
            (this.width + this.world.player.width)) {
            this.world.player.kill();
        }

        //collision with placed player weapons
        for (let weapon of this.world.entities) {
            if (weapon instanceof Weapon && !weapon.isInvulnerable() && Util.collisionCheck(this, weapon)) {
                weapon.hit();
            }
        }

        //collision with bullets
        if ((this.world.boss !== this || (this.attackCurrent !== null && this.attackCurrent < this.attacks.length)) &&
            this.lifetime >= this.appearanceTime) {
            for (let entity of this.world.entities) {
                if (entity.playerSide) {
                    if (entity instanceof Projectile) {
                        if (Util.collisionCheck(this, entity)) {
                            this.hurt(entity.damage, { x: entity.x, y: entity.y });
                            entity.remove();
                        }
                        continue;
                    }
                    if (entity instanceof Beam) {
                        if (Util.collisionCheckBeam(this, entity)) {
                            this.hurt(entity.damagePS / this.world.ticksPS, { x: this.x, y: this.y });
                            entity.break(Util.vectorLength(this.x - entity.x, this.y - entity.y));
                        }
                    }
                }
            }
        }

        if (this.attackCurrent === null)
            this.behavior();
        else if (this.attackCurrent < this.attacks.length) {
            var rt = this.lifetime;
            var at = this.attacks[this.attackCurrent].time;
            var dt = this.attacks[this.attackCurrent].decrTime;
            var bb = this.attacks[this.attackCurrent].bonusBound;

            var attackTimer = Math.ceil(at - rt);
            if (attackTimer < 10 && attackTimer < this.lastAttackTimer) {
                Sound.play(SFX.timer);
            }
            this.lastAttackTimer = attackTimer;

            var b = this.attacks[this.attackCurrent].bonus;
            this.bonus = parseInt(Math.min(b, bb + (b - bb) * (at - rt) / (at - dt)) / 10, 10) * 10;
            if (this.attacks[this.attackCurrent].func) {
                this.attacks[this.attackCurrent].func.apply(this, this.attacks[this.attackCurrent].params);
            }
            if (rt >= at) {
                this.nextAttack();
            }
        }
    }

    behavior() {
    }

    behaviorFinal(ignoreOnDestroy) {
        new Particle(this.world, this.x, this.y, this.initialHealth < 100 ? 0.66 : 1.33, this.initialHealth < 100 ? 8 : 16, false, false, "splash");
        this.world.splash(this, this.initialHealth / 5, 8, 0.33);
        if (!ignoreOnDestroy) {
            this.onDestroy();
        }
        this.remove(true);
        Sound.play(SFX.enemyDestroy);
    }

    beforeAttack() {
    }
    onDamage(damage) {
    }
    onDestroy() {
    }

    isInvulnerable() {
        return this === this.world.boss && this.attackCurrent === null || this.lifetime < this.appearanceTime;
    }

    hurt(damage, position) {
        if (this.isInvulnerable()) {
            return;
        }

        var healthOld = this.health;
        this.health -= damage;

        if (this.health < this.initialHealth / 5) {
            Sound.play(SFX.enemyHitLow);
        } else {
            Sound.play(SFX.enemyHit);
        }

        if (this.health > 0) {
            for (let drop of this.drops) {
                //To do: fix this atrocity
                if (drop.reqDamage !== 0 && this.attackCurrent === drop.attackID && ((((this.initialHealth - this.health) % drop.reqDamage) < ((this.initialHealth - this.health - damage) % drop.reqDamage) && damage > 0) || damage > drop.reqDamage)) {
                    new Bonus(this.world, this.x + Random.nextFloat(12) - 6, this.y + Random.nextFloat(12) - 6, drop.cat, false);
                }
            }
        } else {
            this.health = 0;
        }
        if (this.lifetime - this.lastSplash > 0.1) {
            this.world.splash(position || this, damage, this.width * 2, this.width * 0.07);
            this.lastSplash = this.lifetime;
        }
        this.world.player.score += Math.round(healthOld - this.health) * 10;

        this.onDamage(damage);
    }

    initHealth(health) {
        this.initialHealth = health;
        this.health = health;
    }

    addAttack(spell, title, data, newGroup, params) {
        //decrTime - time when bonus counter start to decrease
        //bonusBound - bonus gotten in the last moment
        //newGroup - forced start of a new group of attacks
        var n = this.attacks.length;
        var m = this.attackGroups.length - 1;

        if (n === 0 || (this.attacks[n - 1].spell && !spell) || newGroup)
            this.attackGroups[++m] = { start: n, nonspells: 0, spells: 0 };
        if (spell)
            ++this.attackGroups[m].spells;
        else
            ++this.attackGroups[m].nonspells;

        this.attacks[n] = {};
        for (let i in data) {
            this.attacks[n][i] = data[i];
        }
        this.attacks[n].spell = spell;
        this.attacks[n].title = title;
        this.attacks[n].params = params;

        const convertibleProps = ["time", "health", "decrTime", "bonus", "bonusBound"];
        for (let prop of convertibleProps) {
            if (typeof this.attacks[n][prop] === "function") {
                this.attacks[n][prop] = this.attacks[n][prop].apply(this, params);
            }
        }
    }

    nextAttack() {
        this.world.clearField(0);
        this.world.removeEnemies();

        if (this.world.boss === this && this.attackCurrent !== null && this.attacks[this.attackCurrent].spell) {
            if (this.health <= 0 && this.world.player.spellCompleteTerms && this.bonus > 0) {
                this.world.player.score += this.bonus;
                this.world.vp.showMessage(["Spell Card Bonus!", this.bonus], 3);
            } else
                this.world.vp.showMessage(["Bonus failed"], 1.5);
            if (this.attacks[this.attackCurrent].finish) {
                this.attacks[this.attackCurrent].finish.apply(this, this.attacks[this.attackCurrent].apply);
            }
        }

        var g = this.attackGroups[this.attackGroupCurrent];
        if (this.attackCurrent === null) {
            this.attackCurrent = 0;
            this.beforeAttack();
        } else {
            ++this.attackCurrent;
        }
        this.eventChain.clear();

        if (this.attackCurrent >= this.attacks.length) {
            this.behaviorFinal();
            this.world.boss = null;
            if (this.world.bossLast) {
                this.world.eventChain.addEventNow(function () {
                    this.stageBonus();
                }, 2);
            } else {
                this.world.nextSubstage();
            }
        } else {
            this.world.player.spellCompleteTerms = true;
            this.initHealth(this.attacks[this.attackCurrent].health);
            if (this.attacks[this.attackCurrent].init) {
                this.attacks[this.attackCurrent].init.apply(this, this.attacks[this.attackCurrent].params);
            }
        }

        if (g && (this.attackCurrent >= (g.start + g.nonspells + g.spells))) {
            ++this.attackGroupCurrent;
        }

        this.lifetime = -1 / this.world.ticksPS;
    }

    setBossData(bossName, isLast) {
        this.setVectors(0, -this.world.width / 2 - 40);

        this.width = CHAR[bossName].width;
        this.sprite.set(bossName);

        this.eventChain.addEvent(function () {
            this.headToPointSmoothly(0, -this.world.height / 4, 3);
        }, 0);
        this.eventChain.addEvent(function () {
            this.nextAttack();
        }, 3);

        this.world.setBoss(this, CHAR[bossName].name, isLast);
    }
}
