function World(vp) {
    this.width = 150;
    this.height = 180;
    this.maxBonusY = -this.height / 3;

    this.lastID = 0;
    this.entities = [];

    this.time = 0;
    this.ticksPS = 60;
    this.stageInterval = 2.5;
    this.tickInterval = 1;

    //set default player:
    for (var i in CHAR) {
        if (CHAR[i].playable) {
            this.setPlayer(i);
            break
        }
    }

    this.pause = false;
    this.drawHitboxes = false;
    this.boss = null;
    this.bossLast = false;

    this.difficulty = 0;
    this.stages = [];
    this.stages[0] = {title: "", desc: "", titleAppears: 0, background: null}; //used for the spell spractice
    this.stage = 0;
    this.substage = 0;
    this.substageStart = 0;
    this.continuable = true;

    this.vp = vp;
    vp.clearMessage();

    this.eventChain = new EventChain(this);

    var self = this;

    this.tickerId = setInterval(function () {
        self.tick();
    }, 1000 / this.ticksPS);
}

World.prototype.setPause = function (value) {
    this.pause = value;
    this.vp.input.stopAll();
    if (value) {
        this.vp.pauseMenu.updateStates();
        this.vp.pauseMenu.fadeIn = new Date().getTime();
    } else {
        this.vp.pauseMenu.fadeOut = new Date().getTime();
    }
};

World.prototype.setPlayer = function (charName) {
    this.player = new Player(this, charName);
};

World.prototype.startStage = function (stage, difficulty) {
    this.difficulty = difficulty;
    for (var i in STAGE) {
        if (!STAGE[i].extra) {
            this.stages.push({
                title: STAGE[i].title,
                desc: STAGE[i].description || "",
                titleAppears: Math.floor(STAGE[i].appearanceSecond * this.ticksPS),
                background: STAGE[i].background
            });
        }
    }
    this.stage = stage;
    this.initEventChain();
};

World.prototype.startExtra = function (difficulty) {
    this.difficulty = difficulty;
    for (var i in STAGE) {
        if (STAGE[i].extra === difficulty) {
            this.stages[+i + 1] = {
                extra: STAGE[i].extra,
                title: STAGE[i].title,
                desc: STAGE[i].description || "",
                titleAppears: Math.floor(STAGE[i].appearanceSecond * this.ticksPS),
                background: STAGE[i].background
            };
            break;
        }
    }
    this.stage = +i + 1;
    this.initEventChain();
};

World.prototype.startSpellPractice = function (difficulty, spell) {
    this.eventChain.clear();
    this.stage = 0;
    this.player.addPower(this.player.powerMax);
    this.player.lives = 0;
    this.player.bombs = 0;
    this.difficulty = difficulty;
    this.spell = spell;
    var boss = new Enemy(this);
    boss.addAttack(true, spell.names[difficulty], spell);
    boss.setBossData(spell.boss, true);
};

World.prototype.initEventChain = function () {
    this.eventChain.clear();
    for (var i in STAGE[this.stage - 1].events) {
        var e = STAGE[this.stage - 1].events[i];
        if (e.substage === this.substage) {
            if (e.boss) {
                e.func = this.processBoss(e.boss);
            }
            if (e.itemLine) {
                e.func = function () {
                    this.vp.showItemLine();
                };
            }
            this.eventChain.addEvent(e.func, e.second, e.repeatInterval, e.repeatCount);
        }
    }
};

World.prototype.processBoss = function (data) {
    return function () {
        var boss = new Enemy(this);
        var newGroup = false;
        for (var i in data.attacks) {
            var a = data.attacks[i][0];
            if (!a) {
                newGroup = true;
                continue;
            }
            if (!a.names || a.names[this.difficulty]) {
                var spell = !!a.names;
                boss.addAttack(spell, spell ? a.names[this.difficulty] : null, a, newGroup, data.attacks[i].slice(1));
            }
            newGroup = false;
        }
        boss.setBossData(data.char, data.last);
    };
};

World.prototype.destroy = function () {
    clearInterval(this.tickerId);
    this.vp.clearMessage();
    this.vp.world = null;
};

World.prototype.addTime = function () {
    if (this.boss) {
        this.boss.nextAttack();
        return;
    }
    for (var i in this.eventChain.events) {
        var e = this.eventChain.events[i];
        if (!e.done) {
            this.time = this.substageStart + Math.floor(e.second * this.ticksPS) - 1;
            return;
        }
    }
};

World.prototype.nextSubstage = function () {
    ++this.substage;
    this.substageStart = this.time;
    this.initEventChain();
};

World.prototype.nextStage = function () {
    this.time = 0;

    ++this.stage;
    this.substage = 0;
    this.substageStart = 0;

    if (this.stage >= this.stages.length) {
        this.continuable = false;
        this.setPause(true);
        return;
    }

    this.player.graze = 0;
    this.player.points = 0;
    this.vp.clearMessage();
    this.initEventChain();
};

World.prototype.stageBonus = function () {
    if (this.stage > 0) {
        var bonus = this.stage * 1000;
        bonus += this.player.power * 1000;
        bonus += this.player.graze * 10;
        bonus *= this.player.points;
        bonus = Math.floor(bonus / 10) * 10;
        this.player.score += bonus;
        this.vp.showMessage(["Stage Clear!", "Bonus: " + bonus], this.stageInterval);
        this.eventChain.addEventNow(function () {
            this.nextStage();
        }, 2);
    } else {
        //Spell Practice Stop
        this.destroy();
    }
};

World.prototype.relTime = function () {
    return (this.time - this.substageStart) / this.ticksPS;
};

World.prototype.stageTime = function () {
    return this.time / this.ticksPS;
};

World.prototype.vectorLength = function (x, y) {
    return Math.sqrt(x * x + y * y);
};

World.prototype.angleBetweenEntities = function (entity1, entity2) {
    return Math.atan2(entity2.y - entity1.y, entity2.x - entity1.x);
};

World.prototype.collisionCheck = function (entity1, entity2, distance) {
    distance = (distance || 0) + entity1.width + entity2.width;
    if (Math.abs(entity1.x - entity2.x) > distance || Math.abs(entity1.y - entity2.y) > distance) {
        return false;
    }
    return this.distanceBetweenEntities(entity1, entity2) < distance;
};

World.prototype.distanceBetweenEntities = function (entity1, entity2) {
    return Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));
};

World.prototype.distanceBetweenPoints = function (point1x, point1y, point2x, point2y) {
    return Math.sqrt(Math.pow(point1x - point2x, 2) + Math.pow(point1y - point2y, 2));
};

World.prototype.setBoss = function (enemy, title, isLast) {
    this.boss = enemy;
    this.bossLast = isLast;
    enemy.title = title;
};

World.prototype.slowMode = function () {
    var m = [1, 0.5, 0.25, 0.125];
    this.tickInterval = m[(m.indexOf(this.tickInterval) + 1) % m.length];
};

World.prototype.tick = function () {
    if (!this.pause) {
        this.time += this.tickInterval;

        //skip frame logic:
        if (Math.abs(Math.round(this.time) - this.time) < 0.05 || this.tickInterval === 1) {
            this.time = Math.round(this.time);
        }
        if (this.time !== Math.round(this.time)) {
            return;
        }

        for (var i in this.entities) {
            if (!this.entities[i].removalMark) {
                this.entities[i].step();
            }
        }
        for (var i in this.entities) {
            this.entities[i].flush(); //refreshing fixed coords
        }
        if (this.time === this.stages[this.stage].titleAppears) {
            var t;
            if (this.stages[this.stage].extra) {
                t = DIFF[this.difficulty].name + " Stage";
            } else {
                t = "Stage " + this.stage;
            }
            this.vp.showMessage([t + ": " + this.stages[this.stage].title, this.stages[this.stage].desc], 4, [FONT.title, FONT.subtitle]);
        }
        this.eventChain.tick();
    }
};

World.prototype.randomBonus = function () {
    var bonuses = [];
    for (var i in BONUS) {
        if (!BONUS[i].tech) {
            bonuses.push(i);
        }
    }
    var bonusType = bonuses[Math.floor(Math.random() * bonuses.length)];
    new Bonus(this, this.player.x, -this.height / 2 + 20, bonusType, false);
};

World.prototype.clearField = function (damageForEnemies) {
    for (var i in this.entities) {
        var e = this.entities[i];
        if (e instanceof Projectile && !e.playerSide) {
            //don't turn virtual bullets into bonuses
            if (e.width) {
                new Bonus(this, e.x, e.y, "pointSmall", true);
            }
            e.remove();
        }
        if (e instanceof Enemy && damageForEnemies > 0) {
            e.hurt(damageForEnemies);
        }
    }
};

World.prototype.removeEnemies = function () {
    for (var i in this.entities) {
        var e = this.entities[i];
        if (e instanceof Enemy && e !== this.boss) {
            e.behaviorFinal(true);
        }
    }
};

World.prototype.replaceBonus = function (catWhat, catWith) {
    for (var i in this.entities) {
        var e = this.entities[i];
        if (e instanceof Bonus && e.cat === catWhat) {
            e.cat = catWith;
            new Particle(this, e.x, e.y, 0.25, 8, true, false, "spark");
        }
    }
};

World.prototype.splash = function (entity, count, area, time) {
    for (var i = 0; i < count; ++i) {
        new Particle(this, entity.x, entity.y, time + (Math.random() - 0.5) * time, 8, true, true, "spark");
    }
};

World.prototype.draw = function (context) {
    var drawOrder = [
        "Enemy",
        "Player",
        "Weapon",
        "Bonus",
        "Particle",
        "Projectile",
        "Text"
    ];
    for (var d in drawOrder) {
        for (var p = 0; p < 2; ++p) {
            for (var i in this.entities) {
                var e = this.entities[i];
                if (e.priority === p && e.classes[0] === drawOrder[d]) {
                    e.draw(context);
                }
            }
        }
    }
};
