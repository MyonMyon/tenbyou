class World {
    constructor(vp) {
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
        this.stages[0] = { title: "", desc: "", background: null }; //used for the spell spractice
        this.stage = 0;
        this.substage = 0;
        this.substageStart = 0;
        this.stageEnd = null;
        this.stageInterval = 2.5;
        this.continuable = true;

        this.shake = { x: 0, y: 0, time: 0, strength: 0 };

        this.vp = vp;
        vp.clearMessages();

        this.seed = Date.now();
        Random.setSeed(this.seed);
        this.vp.debugString = "Seed: " + this.seed;

        this.eventChain = new EventChain(this);

        this.tick();
    }

    setPause(value) {
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
    }

    setPlayer(charName) {
        this.player = new Player(this, charName);
    }

    startStage(stage, difficulty) {
        this.difficulty = difficulty;
        for (let stage of STAGE) {
            if (!stage.extra) {
                this.stages.push({
                    title: stage.title,
                    desc: stage.description || "",
                    background: stage.background,
                    last: stage.last
                });
            }
        }
        this.stages[this.stages.length - 1].last = true;
        this.stage = stage;
        this.initEventChain();
    }

    startExtra(difficulty) {
        this.difficulty = difficulty;
        for (let i in STAGE) {
            if (STAGE[i].extra === difficulty) {
                this.stages[+i + 1] = {
                    extra: STAGE[i].extra,
                    title: STAGE[i].title,
                    desc: STAGE[i].description || "",
                    background: STAGE[i].background,
                    last: true
                };
                break;
            }
        }
        this.stage = +i + 1;
        this.initEventChain();
    }

    startSpellPractice(difficulty, spell) {
        this.eventChain.clear();
        this.stage = 0;
        this.player.addPower(this.player.powerMax, true);
        this.player.lives = 0;
        this.player.bombs = 0;
        this.difficulty = difficulty;
        this.spell = spell;
        let boss = new Enemy(this);
        boss.addAttack(true, spell.names[difficulty], spell);
        boss.setBossData(spell.boss, true);
    }

    initEventChain() {
        this.eventChain.clear();
        for (let event of STAGE[this.stage - 1].events) {
            if (event.substage === this.substage && (!event.player || event.player === this.player.name)) {
                if (event.boss) {
                    event.func = this.processBoss(event.boss);
                }
                if (event.itemLine) {
                    event.func = function() {
                        this.vp.showItemLine();
                    };
                }
                if (event.title) {
                    event.func = function() {
                        let t;
                        if (this.stages[this.stage].extra) {
                            t = DIFF[this.difficulty].name + " Stage";
                        } else {
                            t = "Stage " + this.stage;
                        }
                        this.vp.showMessage([t + ": " + this.stages[this.stage].title, this.stages[this.stage].desc], 4, [FONT.title, FONT.subtitle]);
                    };
                }
                this.eventChain.addEvent(event.func, event.second, event.repeatInterval, event.repeatCount);
            }
        }
    }

    processBoss(data) {
        return function () {
            let boss = new Enemy(this);
            let newGroup = false;
            if (data.startDialogue) {
                boss.beforeAttack = function() {
                    new Dialogue(this.world, data.startDialogue);
                };
            }
            for (let attacks of data.attacks) {
                let a = attacks[0];
                if (!a) {
                    newGroup = true;
                    continue;
                }
                if (!a.names || a.names[this.difficulty]) {
                    let spell = !!a.names;
                    boss.addAttack(spell, spell ? a.names[this.difficulty] : null, a, newGroup, attacks.slice(1));
                }
                newGroup = false;
            }
            boss.setBossData(data.char, data.last);
        };
    }

    destroy() {
        clearInterval(this.tickerId);
        this.vp.clearMessages();
        this.vp.world = null;
        this.vp.mainMenu.fadeIn = new Date().getTime();
    }

    addTime(stepBoss) {
        if (this.boss) {
            if (stepBoss) {
                this.boss.attackCurrent = this.boss.attacks.length - 1;
            }
            this.boss.nextAttack();
            return;
        }
        for (let event of this.eventChain.events) {
            if (!event.done) {
                this.time = this.substageStart + event.second;
                if (!stepBoss || !event.fire.name) {
                    return;
                }
                event.done = true;
            }
        }
    }

    nextSubstage() {
        ++this.substage;
        this.substageStart = this.time;
        this.initEventChain();
    }

    nextStage() {
        this.time = 0;

        ++this.stage;
        this.substage = 0;
        this.substageStart = 0;
        this.stageEnd = null;

        if (this.stages[this.stage - 1].last) {
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
    }

    stageBonus() {
        if (this.stage > 0) {
            //TODO: player/bomb/extra count
            this.player.graze = Math.floor(this.player.graze);
            let ptsStage = this.stage * 1000;
            let ptsPower = Math.floor(this.player.power * 1000);
            let ptsGraze = this.player.graze * 10;
            let mxPoints = this.player.points;
            let bonus = Math.floor((ptsStage + ptsPower + ptsGraze) * mxPoints / 10) * 10;

            this.player.score += bonus;
            this.stageEnd = this.time;
            let styleArray = new Array(8).fill(FONT.title);
            styleArray.fill(FONT.subtitle, 1, 6);
            this.vp.showMessage([
                this.stages[this.stage].last ? "All Clear!" : "Stage Clear!",
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
    }

    relTime() {
        return this.time - this.substageStart;
    }

    stageEndTime() {
        return this.stageInterval + this.stageEnd - this.time;
    }

    setBoss(enemy, title, isLast) {
        this.boss = enemy;
        this.bossLast = isLast;
        enemy.title = title;
    }

    slowMode() {
        const m = [1, 0.5, 0.25, 0.125];
        this.tickInterval = m[(m.indexOf(this.tickInterval) + 1) % m.length];
    }

    tick() {
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
            if (this.shake.time > 0) {
                this.shake.time -= 1 / this.ticksPS;
                let a = Math.random() * Math.PI * 2;
                let r = Math.random() * this.shake.strength;
                this.shake.x = Math.cos(a) * r;
                this.shake.y = Math.sin(a) * r;
            } else {
                this.shake = { x: 0, y: 0, time: 0, strength: 0 };
            }

            for (let entity of this.entities) {
                if (!entity.removalMark) {
                    entity.step();
                }
            }
            for (let entity of this.entities) {
                entity.flush(); //refreshing fixed coords
            }
            this.eventChain.tick();
        }
        this.postponeTick();
    }

    postponeTick() {
        let w = this;
        this.tickerId = setTimeout(function () {
            w.tick();
        }, 1000 / this.ticksPS);
    }

    randomBonus() {
        let bonuses = [];
        for (let i in BONUS) {
            if (!BONUS[i].tech) {
                bonuses.push(i);
            }
        }
        let bonusType = Random.nextArrayElement(bonuses);
        new Bonus(this, this.player.x, -this.height / 2 + 20, bonusType, false);
    }

    clearField(damageForEnemies) {
        for (let entity of this.entities) {
            if (entity instanceof Projectile && !entity.playerSide) {
                //don't turn virtual bullets into bonuses
                if (entity.width) {
                    new Bonus(this, entity.x, entity.y, "pointSmall", true);
                }
                entity.remove();
            }
            if (entity instanceof Enemy && damageForEnemies > 0) {
                entity.hurt(damageForEnemies);
            }
        }
    }

    removeEnemies() {
        for (let entity of this.entities) {
            if (entity instanceof Enemy && entity !== this.boss) {
                entity.behaviorFinal(true);
            }
        }
    }

    replaceBonus(catWhat, catWith) {
        for (let entity of this.entities) {
            if (entity instanceof Bonus && entity.cat === catWhat) {
                entity.cat = catWith;
                new Particle(this, entity.x, entity.y, 0.25, 8, true, false, "spark");
            }
        }
    }

    splash(entity, count, area, time) {
        for (let i = 0; i < count; ++i) {
            new Particle(this, entity.x, entity.y, time + (Random.nextFloat() - 0.5) * time, 8, true, true, "spark");
        }
    }

    startShake(time = 1, strength = 1) {
        this.shake.time += time;
        this.shake.strength = Math.max(this.shake.strength, strength);
    }

    draw(context) {
        const drawOrder = [
            "Enemy",
            "Player",
            "Weapon",
            "Bonus",
            "Particle",
            "Beam",
            "Projectile",
            "Text"
        ];
        for (let draw of drawOrder) {
            for (let p = 0; p < 2; ++p) {
                for (let entity of this.entities) {
                    if (entity.priority === p && entity.constructor.name === draw) {
                        entity.draw(context);
                    }
                }
            }
        }
        if (this.dialogue) {
            this.dialogue.draw();
        }
    }
}
