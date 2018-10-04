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
    this.stageChangeTime = -1;

    this.vp = vp;

    for (var i in STAGE) {
        this[i] = STAGE[i];
    }

    var self = this;

    this.tickerId = setInterval(function () {
        self.tick();
    }, 1000 / this.ticksPS);

    for (var i in STAGE.list) {
        this.stages.push({
            title: STAGE.list[i].title,
            desc: STAGE.list[i].description || "",
            titleAppears: Math.floor(STAGE.list[i].appearanceSecond * this.ticksPS),
            background: STAGE.list[i].background,
            backgroundSpeed: STAGE.list[i].backgroundSpeed
        });
    }
}

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

World.prototype.nextStage = function (timeout) {
    var timeout = timeout || 0;
    if (timeout === 0) {
        this.time = 0;

        this.player.graze = 0;
        this.player.points = 0;

        if (this.stage === 0) {
            //Spell Practice Stop
            this.destroy();
        } else {
            var bonus = this.stage * 1000;
            bonus += this.player.power * 1000;
            bonus += this.player.graze * 10;
            bonus *= this.player.points;
            bonus = Math.floor(bonus / 100) * 100;
            this.vp.showMessage("Stage Clear!", "Bonus: " + bonus, this.stageInterval);
            this.player.score += bonus;
        }

        ++this.stage;
        this.substage = 0;
        this.substageStart = 0;
        this.stageChangeTime = -1;

        if (this.stage >= this.stages.length) {
            this.pause = true;
            this.stage = 1;
        }
    } else {
        this.stageChangeTime = this.time + timeout;
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

World.prototype.events = function () {
};

World.prototype.setBoss = function (enemy, title, isLast) {
    this.boss = enemy;
    this.bossLast = isLast;
    enemy.title = title;
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
            this.vp.showMessage("Stage " + this.stage + ": " + this.stages[this.stage].title, this.stages[this.stage].desc, 120, true);
        }
        if (this.time === this.stageChangeTime) {
            this.nextStage();
        }
        this.events();
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
