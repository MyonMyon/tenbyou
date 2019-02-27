function World(vp) {
    this.width = 150;
    this.height = 180;
    this.maxBonusY = -this.height / 3;

    this.lastID = 0;
    this.entities = [];

    this.ticksPS = 60;
    this.time = -1 / this.ticksPS;
    this.tickTime = 0;
    this.tickInterval = 1;

    this.pause = false;
    this.drawHitboxes = false;
    this.boss = null;
    this.bossLast = false;
    this.dialogue = null;

    this.difficulty = 0;
    this.stages = [];
    this.stages[0] = {title: "", desc: "", background: null}; //used for the spell spractice
    this.stage = 0;
    this.substage = 0;
    this.substageStart = 0;
    this.stageEnd = null;
    this.stageInterval = 2.5;
    this.continuable = true;

    this.vp = vp;
    vp.clearMessages();

    this.seed = Date.now();
    Random.setSeed(this.seed);
    this.vp.debugString = "Seed: " + this.seed;

    this.eventChain = new EventChain(this);

    this.tick();
}

World.prototype.setPause = function (value) {
    if (value) {
        Sound.play(SFX.menuPause);
    }
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
                background: STAGE[i].background,
                last: STAGE[i].last
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
    this.player.addPower(this.player.powerMax, true);
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
        if (e.substage === this.substage && (!e.player || e.player === this.player.name)) {
            if (e.boss) {
                e.func = this.processBoss(e.boss);
            }
            if (e.itemLine) {
                e.func = function () {
                    this.vp.showItemLine();
                };
            }
            if (e.title) {
                e.func = function () {
                    var t;
                    if (this.stages[this.stage].extra) {
                        t = DIFF[this.difficulty].name + " Stage";
                    } else {
                        t = "Stage " + this.stage;
                    }
                    this.vp.showMessage([t + ": " + this.stages[this.stage].title, this.stages[this.stage].desc], 4, [FONT.title, FONT.subtitle]);
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
        if (data.startDialogue) {
            boss.beforeAttack = function () {
                new Dialogue(this.world, data.startDialogue);
            };
        }
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
    this.vp.clearMessages();
    this.vp.world = null;
    this.vp.mainMenu.fadeIn = new Date().getTime();
};

World.prototype.addTime = function (stepBoss) {
    if (this.boss) {
        if (stepBoss) {
            this.boss.attackCurrent = this.boss.attacks.length;
        }
        this.boss.nextAttack();
        return;
    }
    for (var i in this.eventChain.events) {
        var e = this.eventChain.events[i];
        if (!e.done) {
            this.time = this.substageStart + e.second;
            if (!stepBoss || !e.fire.name) {
                return;
            }
            e.done = true;
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
    this.stageEnd = null;

    if (this.stage >= this.stages.length || this.stages[this.stage - 1].last) {
        this.continuable = false;
        if (this.stage === 1) {
            //Spell Practice behavior:
            this.setPause(true);
        } else {
            //Main Game/Extra behavior:
            this.vp.initRolls(this.player.name);
            this.destroy();
        }
        return;
    }

    this.player.graze = 0;
    this.player.points = 0;
    this.vp.clearMessages();
    this.initEventChain();
};

World.prototype.stageBonus = function () {
    if (this.stage > 0) {
        //TODO: player/bomb/extra count
        var ptsStage = this.stage * 1000;
        var ptsPower = Math.floor(this.player.power * 1000);
        var ptsGraze = this.player.graze * 10;
        var mxPoints = this.player.points;
        var bonus = Math.floor((ptsStage + ptsPower + ptsGraze) * mxPoints / 10) * 10;

        this.player.score += bonus;
        this.stageEnd = this.time;
        var styleArray = new Array(8).fill(FONT.title);
        styleArray.fill(FONT.subtitle, 1, 6);
        this.vp.showMessage([
            "Stage Clear!",
            "",
            "Stage:\t" + ptsStage,
            "Power:\t" + ptsPower,
            "Graze:\t" + ptsGraze,
            "Points:\t×" + mxPoints,
            "",
            "Total:\t" + bonus
        ], this.stageInterval, styleArray);
        this.eventChain.addEventNow(function () {
            this.nextStage();
        }, this.stageInterval);
    } else {
        //Spell Practice Stop
        this.destroy();
    }
};

World.prototype.relTime = function () {
    return this.time - this.substageStart;
};

World.prototype.stageEndTime = function () {
    return this.stageInterval + this.stageEnd - this.time;
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
        if (this.dialogue) {
            this.dialogue.tick();
            this.postponeTick();
            return;
        }

        //skip frame logic:
        this.tickTime += this.tickInterval;
        if (this.tickTime < 1) {
            this.postponeTick();
            return;
        }
        this.tickTime = 0;

        this.time += 1 / this.ticksPS;

        for (var i in this.entities) {
            if (!this.entities[i].removalMark) {
                this.entities[i].step();
            }
        }
        for (var i in this.entities) {
            this.entities[i].flush(); //refreshing fixed coords
        }
        this.eventChain.tick();
    }
    this.postponeTick();
};

World.prototype.postponeTick = function () {
    var w = this;
    this.tickerId = setTimeout(function () {
        w.tick();
    }, 1000 / this.ticksPS);
};

World.prototype.randomBonus = function () {
    var bonuses = [];
    for (var i in BONUS) {
        if (!BONUS[i].tech) {
            bonuses.push(i);
        }
    }
    var bonusType = Random.nextArrayElement(bonuses);
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
        new Particle(this, entity.x, entity.y, time + (Random.nextFloat() - 0.5) * time, 8, true, true, "spark");
    }
};

World.prototype.draw = function (context) {
    var drawOrder = [
        "Enemy",
        "Player",
        "Weapon",
        "Bonus",
        "Particle",
        "Beam",
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
    if (this.dialogue) {
        this.dialogue.draw();
    }
};
