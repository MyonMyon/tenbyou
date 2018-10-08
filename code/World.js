function World(vp) {
    this.width = 150;
    this.height = 180;

    this.lastID = 0;
    this.entities = [];

    this.time = 0;
    this.ticksPS = 30;
    this.stageInterval = 80;

    this.player = new Player(this);
    this.player.setCharacterData(CHAR.barashou);
    this.pause = false;
    this.drawHitboxes = false;
    this.boss = null;
    this.bossLast = false;

    this.difficulty = 0;
    this.stages = new Array();
    this.stages[0] = {title: "", desc: "", titleAppears: 0, background: null}; //used for the spell spractice
    this.stage = 1;
    this.substage = 0;
    this.substageStart = 0;
    this.continuable = true;

    this.eventChain = [];

    this.vp = vp;
    vp.clearMessage();

    var self = this;

    this.tickerId = setInterval(function () {
        self.tick();
    }, 1000 / this.ticksPS);

    for (var i in STAGE) {
        this.stages.push({
            title: STAGE[i].title,
            desc: STAGE[i].description || "",
            titleAppears: Math.floor(STAGE[i].appearanceSecond * this.ticksPS),
            background: STAGE[i].background,
            backgroundSpeed: STAGE[i].backgroundSpeed
        });
        for (var j in STAGE[i].events) {
            var e = STAGE[i].events[j];
            this.addEvent(e.func, +i + 1, e.substage, e.second, e.repeatInterval, e.repeatCount);
        }
    }
}

World.prototype.startSpellPractice = function (difficulty, spell) {
    this.stage = 0;
    this.player.power = 4;
    this.player.lives = 0;
    this.player.bombs = 0;
    this.difficulty = difficulty;
    this.spell = spell;
    var boss = new Enemy(this);
    boss.addSpell(spell, difficulty);
    boss.setBossData(BOSS[spell.boss], true);
};

World.prototype.destroy = function () {
    clearInterval(this.tickerId);
    this.vp.clearMessage();
    this.vp.world = null;
};

World.prototype.addTime = function () {
    this.time += 100;
};

World.prototype.nextSubstage = function () {
    ++this.substage;
    this.substageStart = this.time;
};

World.prototype.nextStage = function () {
    this.time = 0;

    ++this.stage;
    this.substage = 0;
    this.substageStart = 0;

    if (this.stage >= this.stages.length) {
        this.pause = true;
        this.continuable = false;
        return;
    }

    this.player.graze = 0;
    this.player.points = 0;
    this.vp.clearMessage();
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
        this.addEventNow(function (world) {
            world.nextStage();
        }, 2);
    } else {
        //Spell Practice Stop
        this.destroy();
    }
};

World.prototype.relTime = function () {
    return (this.time - this.substageStart) / this.ticksPS;
};

World.prototype.vectorLength = function (x, y) {
    return Math.sqrt(x * x + y * y);
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

World.prototype.addEvent = function (func, stage, substage, second, repeatInterval, repeatCount) {
    if (typeof repeatInterval === "function") {
        repeatInterval = repeatInterval(this);
    }
    if (typeof repeatCount === "function") {
        repeatCount = repeatCount(this);
    }
    substage = substage || 0;
    var ec = this.eventChain;
    if (!ec[stage]) {
        ec[stage] = [];
    }
    if (!ec[stage][substage]) {
        ec[stage][substage] = [];
    }
    for (var i = 0; i < (repeatCount || 1); ++i) {
        ec[stage][substage].push({
            second: second + i * (repeatInterval || 1),
            done: false,
            fire: func
        });
    }
};

World.prototype.addEventNow = function (func, secondTimeout) {
    this.addEvent(func, this.stage, this.substage, this.relTime() + secondTimeout);
};

World.prototype.tick = function (interval) {
    if (!this.pause) {
        ++this.time;
        for (var i in this.entities) {
            this.entities[i].step();
        }
        for (var i in this.entities) {
            this.entities[i].flush(); //refreshing fixed coords
        }
        if (this.time === this.stages[this.stage].titleAppears) {
            this.vp.showMessage(["Stage " + this.stage + ": " + this.stages[this.stage].title, this.stages[this.stage].desc], 120, [FONT.title, FONT.info]);
        }
        var t = this.relTime();
        var ec = this.eventChain[this.stage] ? this.eventChain[this.stage][this.substage] : null;
        if (ec) {
            for (var i in ec) {
                if (!ec[i].done && t >= ec[i].second) {
                    ec[i].fire(this);
                    ec[i].done = true;
                }
            }
        }
        this.vp.draw(true);
    }
};

World.prototype.randomBonus = function () {
    new Bonus(this, this.player.x, -this.height / 2 + 20, ["power", "point", "bombs", "lives", "gauge"][Math.floor(Math.random() * 5)], Math.random() > 0.5, false);
};

World.prototype.clearField = function (damageForEnemies) {
    for (var i in this.entities) {
        var e = this.entities[i];
        if (e instanceof Projectile && !e.playerside) {
            e.remove();
            new Bonus(this, e.x, e.y, "point", true, true);
        }
        if (e instanceof Enemy && damageForEnemies > 0) {
            e.hurt(damageForEnemies);
        }
    }
};

World.prototype.replaceBonus = function (catWhat, smallWhat, catWith, smallWith) {
    for (var i in this.entities) {
        var e = this.entities[i];
        if (e instanceof Bonus && e.cat === catWhat && e.small === smallWhat) {
            e.cat = catWith;
            e.small = smallWith;
            new Particle(this, e.x, e.y, 8, 8, true, false, 1, 0, 2);
        }
    }
};

World.prototype.splash = function (entity, count, area, time) {
    for (var i = 0; i < count; ++i) {
        new Particle(this, entity.x, entity.y, time + (Math.random() - 0.5) * time, 8, true, true, 1, 0);
    }
};
