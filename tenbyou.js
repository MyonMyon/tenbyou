var ENGINE_VER = "v0.2.10 (alpha)"

function ViewPort() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;

    this.context = this.canvas.getContext("2d");

    this.SHIFT_X = SHIFT_X;
    this.SHIFT_Y = SHIFT_Y;
    this.zoom = ZOOM;

    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;

    this.world = new World();

    this.messageText = "";
    this.messageText2 = "";
    this.messageAltStyle = false;
    this.messageStart = 0;
    this.messageTime = 0;

    this.ticks = 0;
    this.fps = 0;
    this.prevMS = 0;
}

ViewPort.prototype.showMessage = function (text, text2, time, altStyle) {
    this.messageText = text;
    this.messageText2 = text2 || "";
    this.messageStart = this.world.time;
    this.messageTime = time;
    this.messageAltStyle = altStyle || false;
};

ViewPort.prototype.fixedInt = function (value, width) {
    var wS = (value + "").length;
    for (var i = wS; i < width; ++i)
        value = "0" + value;
    return value;
};

ViewPort.prototype.starText = function (value, char) {
    var text = "";
    for (var i = 0; i < Math.floor(value); ++i)
        text += char;
    return text;
};

ViewPort.prototype.toScreen = function (worldX, worldY) {
    var value = {x: 0, y: 0};
    value.x = this.centerX + worldX * this.zoom + this.SHIFT_X;
    value.y = this.centerY + worldY * this.zoom + this.SHIFT_Y;
    return value;
};

ViewPort.prototype.infoShow = function (info, line, tab) {
    var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
    this.context.strokeText(info, boundaryRight.x + 20 + tab * INFO_TAB, boundaryRight.y + 30 + (line + 1) * INFO_LINE);
    this.context.fillText(info, boundaryRight.x + 20 + tab * INFO_TAB, boundaryRight.y + 30 + (line + 1) * INFO_LINE);
};

ViewPort.prototype.starShow = function (line, sprite, count, parts) {
    var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
    var i;
    for (var i = 0; i < count; ++i)
        this.context.drawImage(imgGUI, sprite * IMAGE_GUI_WIDTH, 0, IMAGE_GUI_WIDTH, IMAGE_GUI_HEIGHT,
                boundaryRight.x + 16 + INFO_TAB + (IMAGE_GUI_WIDTH - 4) * i * this.zoom / 4, boundaryRight.y + 30 - this.zoom * 4 + (line + 1) * INFO_LINE, IMAGE_GUI_WIDTH * this.zoom / 4, IMAGE_GUI_HEIGHT * this.zoom / 4);
    if (parts > 0) {
        this.context.drawImage(imgGUI, sprite * IMAGE_GUI_WIDTH, (4 - parts) * IMAGE_GUI_HEIGHT, IMAGE_GUI_WIDTH, IMAGE_GUI_HEIGHT,
                boundaryRight.x + 16 + INFO_TAB + (IMAGE_GUI_WIDTH - 4) * i * this.zoom / 4, boundaryRight.y + 30 - this.zoom * 4 + (line + 1) * INFO_LINE, IMAGE_GUI_WIDTH * this.zoom / 4, IMAGE_GUI_HEIGHT * this.zoom / 4);
    }
    for (var i = count + (parts > 0 ? 1 : 0); i < 9; ++i)
        this.context.drawImage(imgGUI, sprite * IMAGE_GUI_WIDTH, 4 * IMAGE_GUI_HEIGHT, IMAGE_GUI_WIDTH, IMAGE_GUI_HEIGHT,
                boundaryRight.x + 16 + INFO_TAB + (IMAGE_GUI_WIDTH - 4) * i * this.zoom / 4, boundaryRight.y + 30 - this.zoom * 4 + (line + 1) * INFO_LINE, IMAGE_GUI_WIDTH * this.zoom / 4, IMAGE_GUI_HEIGHT * this.zoom / 4);

};

ViewPort.prototype.draw = function () {
    this.ticks++;
    if (new Date().getTime() % 1000 < this.prevMS) {
        this.fps = this.ticks;
        this.ticks = 0;
    }

    this.prevMS = new Date().getTime() % 1000;

    this.context.textAlign = "left";

    this.context.fillStyle = "black";
    var boundaryStart = this.toScreen(-this.world.width / 2, -this.world.height / 2);
    var boundaryEnd = this.toScreen(this.world.width / 2, this.world.height / 2);
    this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);

    var stg = (this.world.time < this.world.stageInterval / 2) ? (this.world.stage - 1) : this.world.stage;
    var spell = (this.world.boss && this.world.boss.attackCurrent >= 0 && this.world.boss.attacks[this.world.boss.attackCurrent].spell);
    if (stg != 0) {
        imgBG.src = spell ? IMAGE_STAGE_SPELL : this.world.stages[stg].background;
        var t = imgBG.height - (imgBG.width / this.world.width * this.world.height) - this.world.time * (spell ? 1 : this.world.stages[stg].backgroundSpeed) % (imgBG.height);
        this.context.drawImage(imgBG,
                0, Math.max(0, t),
                imgBG.width, imgBG.width / this.world.width * this.world.height,
                boundaryStart.x, boundaryStart.y - 1 - Math.min(0, t / (imgBG.width / this.world.width) * this.zoom),
                this.world.width * this.zoom, this.world.height * this.zoom);
        if (t < 0) {
            this.context.drawImage(imgBG,
                    0, imgBG.height + t,
                    imgBG.width, -t,
                    boundaryStart.x, boundaryStart.y,
                    this.world.width * this.zoom, -Math.min(0, t / (imgBG.width / this.world.width) * this.zoom));
        }
    }

    if (spell)
        for (var i = 0; i < 2; ++i)
            for (var j = 0; j < 2 + (boundaryEnd.x + boundaryStart.x) / (imgSpell.width * this.zoom / 4); ++j)
                this.context.drawImage(imgSpell,
                        0, 0,
                        imgSpell.width, imgSpell.height,
                        boundaryStart.x + this.world.time * (i == 0 ? 6 : -6) % (imgSpell.width * this.zoom / 4) + (j - 1) * (imgSpell.width * this.zoom / 4),
                        (boundaryStart.y * (0.25 + (1 - i) * 0.5) + boundaryEnd.y * (0.25 + i * 0.5)) - imgSpell.height / 2,
                        imgSpell.width * this.zoom / 4, imgSpell.height * this.zoom / 4);

    this.context.globalAlpha = Math.max(Math.min(Math.min(this.world.time / 5, (this.world.stageInterval - this.world.time) / 5), 1), 0);
    this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);
    this.context.globalAlpha = 1;

    var tEntity = this.world.firstEntity;
    while (tEntity != null) {
        tEntity.draw(this.context);
        tEntity = tEntity.next;
        if (tEntity == this.world.firstEntity)
            break;
    }

    if (this.world.boss) {
        this.context.fillStyle = DESC_COLOR;
        this.context.font = DESC_FONT;
        this.context.lineWidth = DESC_STROKE;
        this.context.strokeStyle = DESC_STROKE_COLOR;
        this.context.textAlign = "left";

        this.context.strokeText(this.world.boss.title, boundaryStart.x + 10, boundaryStart.y + 20);
        this.context.fillText(this.world.boss.title, boundaryStart.x + 10, boundaryStart.y + 20);

        if (this.world.boss.attackCurrent >= 0)
            for (var i = 0; i < (this.world.boss.attackGroups.length - this.world.boss.attackGroupCurrent - 1); ++i)
                this.context.drawImage(imgGUI, 0, 0, IMAGE_GUI_WIDTH, IMAGE_GUI_HEIGHT,
                        boundaryStart.x + 8 + (IMAGE_GUI_WIDTH - 4) * i * this.zoom / 4, boundaryStart.y + 24, IMAGE_GUI_WIDTH * this.zoom / 4, IMAGE_GUI_HEIGHT * this.zoom / 4);

        if (this.world.boss.attackCurrent >= 0 && this.world.boss.attackCurrent < this.world.boss.attacks.length && this.world.boss.attacks[this.world.boss.attackCurrent].spell) {
            this.context.textAlign = "right";
            this.context.strokeText(this.world.boss.attacks[this.world.boss.attackCurrent].title, boundaryEnd.x - 10, boundaryStart.y + 20);
            this.context.fillText(this.world.boss.attacks[this.world.boss.attackCurrent].title, boundaryEnd.x - 10, boundaryStart.y + 20);
            this.context.strokeText("BONUS: " + (this.world.player.spellCompleteTerms ? this.world.boss.bonus : "FAILED"), boundaryEnd.x - 10, boundaryStart.y + 40);
            this.context.fillText("BONUS: " + (this.world.player.spellCompleteTerms ? this.world.boss.bonus : "FAILED"), boundaryEnd.x - 10, boundaryStart.y + 40);
        }
    }

    this.context.lineJoin = "round";
    this.context.lineCap = "round";

    this.context.fillStyle = BACKGROUND;
    var x1 = boundaryStart.x;
    var x2 = boundaryEnd.x;

    var xN = this.canvas.width;
    var yN = this.canvas.height;

    var y1 = boundaryStart.y;
    var y2 = yN - boundaryStart.y;

    this.context.fillRect(0, 0, xN, y1); //top plank
    this.context.fillRect(0, y2, xN, y1); //bottom plank
    this.context.fillRect(0, 0, x1, yN); //left plank
    this.context.fillRect(x2, 0, xN - x2, yN); //right plank

    this.context.drawImage(imgBGUI, 0, 0, imgBGUI.width, y1 / yN * imgBGUI.height, 0, 0, xN, y1);
    this.context.drawImage(imgBGUI, 0, y2 / yN * imgBGUI.height, imgBGUI.width, y1 / yN * imgBGUI.height, 0, y2, xN, y1);
    this.context.drawImage(imgBGUI, 0, 0, x1 / xN * imgBGUI.width, imgBGUI.height, 0, 0, x1, yN);
    this.context.drawImage(imgBGUI, x2 / xN * imgBGUI.width, 0, (xN - x2) / xN * imgBGUI.width, imgBGUI.height, x2, 0, xN - x2, yN);

    this.context.lineWidth = BORDER_WIDTH;
    this.context.strokeStyle = BORDER_COLOR;

    this.context.strokeRect(x1, y1, x2 - x1, y2 - y1); //border

    this.context.fillStyle = INFO_COLOR;
    this.context.font = INFO_FONT;
    this.context.lineWidth = INFO_STROKE;
    this.context.strokeStyle = INFO_STROKE_COLOR;

    this.context.textAlign = "left";

    this.infoShow("HiScore", 0, 0);
    this.infoShow(this.fixedInt(this.world.player.hiscore, 11), 0, 1);
    this.infoShow("Score", 1, 0);
    this.infoShow(this.fixedInt(this.world.player.score, 11), 1, 1);

    this.infoShow("Lives", 3, 0);
    this.starShow(3, 0, this.world.player.lives, this.world.player.lifeParts);
    this.infoShow("Bombs", 4, 0);
    this.starShow(4, 1, this.world.player.bombs, this.world.player.bombParts);

    this.infoShow("Power", 6, 0);
    this.infoShow(this.world.player.power.toFixed(2), 6, 1);
    this.infoShow("Points", 7, 0);
    this.infoShow(this.world.player.points, 7, 1);
    this.infoShow("Graze", 8, 0);
    this.infoShow(this.world.player.graze, 8, 1);

    this.infoShow(this.world.substage, 10, 0);
    this.infoShow(this.world.relTime().toFixed(2), 10, 1);
    this.infoShow(this.fps + "fps", 11, 1);

    this.context.textAlign = "center";
    if (ENGINE_VER_SHOW) {
        this.context.strokeText("Tenbyou " + ENGINE_VER, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y);
        this.context.fillText("Tenbyou " + ENGINE_VER, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y);
    }
    this.context.strokeText(DIFF[this.world.difficulty], (boundaryEnd.x + this.canvas.width) / 2, boundaryStart.y + 6 * this.zoom);
    this.context.fillText(DIFF[this.world.difficulty], (boundaryEnd.x + this.canvas.width) / 2, boundaryStart.y + 6 * this.zoom);

    this.context.fillStyle = GAME_TITLE_COLOR;
    this.context.font = GAME_TITLE_FONT;
    this.context.lineWidth = GAME_TITLE_STROKE;
    this.context.strokeStyle = GAME_TITLE_STROKE_COLOR;

    this.context.strokeText(GAME_TITLE, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y - 40);
    this.context.fillText(GAME_TITLE, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y - 40);

    if (this.world.time < (this.messageStart + this.messageTime)) {
        this.context.globalAlpha = Math.min(Math.min((this.world.time - this.messageStart) / 10, (this.messageStart + this.messageTime - this.world.time) / 20), 1);
        this.context.strokeText(this.messageText, (boundaryStart.x + boundaryEnd.x) / 2, (boundaryStart.y + boundaryEnd.y) / 2);
        this.context.fillText(this.messageText, (boundaryStart.x + boundaryEnd.x) / 2, (boundaryStart.y + boundaryEnd.y) / 2);

        if (this.messageAltStyle) {
            this.context.fillStyle = INFO_COLOR;
            this.context.font = INFO_FONT;
            this.context.lineWidth = INFO_STROKE;
            this.context.strokeStyle = INFO_STROKE_COLOR;
        }

        this.context.strokeText(this.messageText2, (boundaryStart.x + boundaryEnd.x) / 2, (boundaryStart.y + boundaryEnd.y) / 2 + this.zoom * 10);
        this.context.fillText(this.messageText2, (boundaryStart.x + boundaryEnd.x) / 2, (boundaryStart.y + boundaryEnd.y) / 2 + this.zoom * 10);
        this.context.globalAlpha = 1;
    }

    if (this.world.pause) {
        this.context.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = GAME_TITLE_COLOR;
        this.context.font = GAME_TITLE_FONT;
        this.context.lineWidth = GAME_TITLE_STROKE;
        this.context.strokeStyle = GAME_TITLE_STROKE_COLOR;

        this.context.textAlign = "center";
        this.context.strokeText("Press Esc to continue", this.canvas.width / 2, this.canvas.height / 2);
        this.context.fillText("Press Esc to continue", this.canvas.width / 2, this.canvas.height / 2);

    }
};

////////////////////////////////////////////////////////////////

function World() {
    this.width = 150;
    this.height = 180;

    this.lastID = 0;
    this.countEntity = 0;
    this.firstEntity = null;
    this.firstEntityPool = null;

    this.time = 0;
    this.ticksPS = 30;
    this.stageInterval = 80;

    this.player = new Player(this);
    this.pause = false;
    this.drawHitboxes = false;
    this.boss = null;
    this.bossLast = false;

    this.difficulty = 0;
    this.stages = new Array();
    this.stages[0] = {title: "", desc: "", titleAppears: 0, background: ""}; //to be used for the spell spractice
    this.stage = 1;
    this.substage = 0;
    this.substageStart = 0;
    this.stageChangeTime = -1;

    setTimeout(function () {
        vp.world.init();
    }, 10);

    setInterval(function () {
        vp.world.tick()
    }, 1000 / this.ticksPS);
}

World.prototype.addEntity = function (type) {
    var choosen = null;
    /*
     if (this.firstEntityPool != null) {
     var tEntity = this.firstEntityPool;
     while (1) {
     if (tEntity instanceof type) {
     choosen = tEntity;
     break;
     }
     tEntity = tEntity.next;
     if (tEntity == this.firstEntity)
     break;
     }
     }
     if (choosen != null) {
     return choosen
     } */
    return new type(this);
};

World.prototype.addStage = function (title, desc, titleAppears, background, backgroundSpeed) {
    var n = this.stages.length;
    this.stages[n] = {title: title, desc: desc || "", titleAppears: titleAppears, background: background, backgroundSpeed: backgroundSpeed};
};

World.prototype.nextStage = function (timeout) {
    var timeout = timeout || 0;
    if (timeout == 0) {
        this.time = 0;
        var bonus = this.stage * 1000;
        bonus += this.player.power * 1000;
        bonus += this.player.graze * 10;
        bonus *= this.player.points;
        bonus = Math.floor(bonus / 100) * 100;
        vp.showMessage("Stage Clear!", "Bonus: " + bonus, this.stageInterval);
        this.player.score += bonus;

        this.player.graze = 0;
        this.player.points = 0;

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

World.prototype.init = function () {
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
        if (this.firstEntity != null) {
            var tEntity = this.firstEntity;
            while (1) {
                tEntity.step();
                tEntity = tEntity.next;
                if (tEntity == this.firstEntity)
                    break;
            }
            var c = 0;
            while (1) {
                ++c;
                tEntity.flush(); //refreshing fixed coords
                tEntity = tEntity.next;
                if (tEntity == this.firstEntity) {
                    this.countEntity = c;
                    break;
                }
            }
        }
        if (this.time == this.stages[this.stage].titleAppears) {
            vp.showMessage("Stage " + this.stage + ": " + this.stages[this.stage].title, this.stages[this.stage].desc, 120, true);
        }
        if (this.time == this.stageChangeTime) {
            this.nextStage();
        }
        this.events();
    }
};

World.prototype.randomBonus = function () {
    new Bonus(this, this.player.x, -this.height / 2 + 20, ["power", "point", "bombs", "lives", "gauge"][Math.floor(Math.random() * 5)], Math.random() > 0.5, false)
};

World.prototype.clearField = function (damageForEnemies) {
    var tEntity = this.firstEntity;
    while (tEntity != null) {
        if (tEntity instanceof Projectile && !tEntity.playerside) {
            tEntity.remove();
            new Bonus(this, tEntity.x, tEntity.y, "point", true, true);
        }
        if (tEntity instanceof Enemy && damageForEnemies > 0) {
            tEntity.hurt(damageForEnemies);
        }
        tEntity = tEntity.next;
        if (tEntity == this.firstEntity)
            break;
    }
};

World.prototype.replaceBonus = function (catWhat, smallWhat, catWith, smallWith) {
    var tEntity = this.firstEntity;
    while (tEntity != null) {
        if (tEntity instanceof Bonus && tEntity.cat == catWhat && tEntity.small == smallWhat) {
            tEntity.cat = catWith;
            tEntity.small = smallWith;
            new Particle(this, tEntity.x, tEntity.y, 8, 8, true, false, 1, 0, 2);
        }
        tEntity = tEntity.next;
        if (tEntity == this.firstEntity)
            break;
    }
};

World.prototype.splash = function (entity, count, area, time) {
    for (var i = 0; i < count; ++i) {
        new Particle(this, entity.x, entity.y, time + (Math.random() - 0.5) * time, 8, true, true, 1, 0);
    }
};

////////////////////////////////////////////////////////////////

function Entity(parentWorld, x, y, x1, y1, x2, y2, width, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    this.create(parentWorld, x || 0, y || 0, x1 || 0, y1 || 0, x2 || 0, y2 || 0, width || 2, sprite || 0, frameCount || 1, animPeriod || 4, spriteWidth || 1, spriteDir || false);
}

Entity.prototype.create = function (parentWorld, x, y, x1, y1, x2, y2, width, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
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

    this.sprite = sprite || 0;
    this.frameCount = frameCount || 1;
    this.animPeriod = animPeriod || 4;
    this.spriteWidth = spriteWidth || 1;
    this.spriteDir = spriteDir || false;

    this.customSprite = null;
    this.customSpriteWidth = 0;
    this.customSpriteHeight = 0;

    this.parentWorld = parentWorld;

    ++parentWorld.lastID;

    this.next = parentWorld.firstEntity || this;
    this.prev = parentWorld.firstEntity != null ? parentWorld.firstEntity.prev : this;
    this.id = parentWorld.lastID;
    //console.info("Added Entity #" + this.id + " @ " + this.x + ";" + this.y);

    if (parentWorld.firstEntity != null) {
        parentWorld.firstEntity.prev.next = this;
        parentWorld.firstEntity.prev = this;
    }
    else
        parentWorld.firstEntity = this;
};

Entity.prototype.flush = function () {
    this.fixedX = this.x;
    this.fixedY = this.y;
};

Entity.prototype.step = function () {
    ++this.lifetime;

    if (this.targetTime > 0) {
        this.x2 = 0;
        this.y2 = 0;

        this.x1 = 0;
        this.y1 = 0;

        this.x += (this.targetX - this.x) / this.targetTime;
        this.y += (this.targetY - this.y) / this.targetTime;
        --this.targetTime;
    } else {
        this.targetTime = 0;

        this.x1 += this.x2;
        this.y1 += this.y2;

        this.x += this.x1;
        this.y += this.y1;
    }
};

Entity.prototype.draw = function (context) {
};

Entity.prototype.remove = function () {
    //console.info("Removed Entity #" + this.id + " @ " + this.x + ";" + this.y);
    this.next.prev = this.prev;
    this.prev.next = this.next;
};

Entity.prototype.setCustomSpriteFile = function (source, frameWidth, frameHeight) {
    this.customSprite = new Image();
    this.customSprite.src = source;
    this.customSpriteWidth = frameWidth || 32;
    this.customSpriteHeight = frameHeight || 32;
};

Entity.prototype.setSprite = function (sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    this.sprite = sprite || this.sprite;
    this.frameCount = frameCount || this.frameCount;
    this.animPeriod = animPeriod || this.animPeriod;
    this.spriteWidth = spriteWidth || this.spriteWidth;
    this.spriteDir = spriteDir || this.spriteDir;
};

Entity.prototype.setVectors = function (posX, posY, speedX, speedY, accX, accY) {
    this.x = posX != null ? posX : this.x;
    this.y = posX != null ? posY : this.y;
    this.x1 = speedX != null ? speedX / this.parentWorld.ticksPS : this.x1;
    this.y1 = speedY != null ? speedY / this.parentWorld.ticksPS : this.y1;
    this.x2 = accX != null ? accX / this.parentWorld.ticksPS : this.x2;
    this.y2 = accY != null ? accY / this.parentWorld.ticksPS : this.y2;
};

Entity.prototype.headToEntity = function (target, speed, acc) {
    if (target) {
        var d = this.parentWorld.distanceBetweenEntities(this, target);
        if (d != 0)
            this.setVectors(null, null,
                    ((target.x - this.x) / d) * speed,
                    ((target.y - this.y) / d) * speed,
                    ((target.x - this.x) / d) * acc,
                    ((target.y - this.y) / d) * acc);
    }
};

Entity.prototype.headToPoint = function (targetX, targetY, speed, acc) {
    var d = this.parentWorld.distanceBetweenPoints(this.x, this.y, targetX, targetY);
    if (d != 0)
        this.setVectors(null, null,
                (targetX - this.x) / d * speed,
                (targetY - this.y) / d * speed,
                (targetX - this.x) / d * acc,
                (targetY - this.y) / d * acc);
};

Entity.prototype.headToPointSmoothly = function (targetX, targetY, time) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.targetTime = Math.floor(time * this.parentWorld.ticksPS);
};

Entity.prototype.nearestEntity = function (type, range) {
    var tEntity = this.parentWorld.firstEntity;
    var nearest = null;
    var nearestDistance = range || this.parentWorld.height * 2;
    while (1) {
        if ((tEntity instanceof type && ((type == Projectile && !tEntity.playerside) || type != Projectile)) || type == null) {
            if (tEntity != this && this.parentWorld.distanceBetweenEntities(this, tEntity) < nearestDistance) {
                nearest = tEntity;
                nearestDistance = this.parentWorld.distanceBetweenEntities(this, tEntity);
            }
        }
        tEntity = tEntity.next;
        if (tEntity == this.parentWorld.firstEntity)
            break;
    }
    return nearest;
};

////////////////////////////////////////////////////////////////

function Player(parentWorld) {
    this.create(parentWorld, 0, parentWorld.height / 2 - 5);

    this.setSprite(0, 4, 2, 1, false);
    this.width = 1;

    this.hiscore = 1000000;
    this.score = 0;

    this.livesDefault = 2;
    this.lives = this.livesDefault;
    this.lifeParts = 0;
    this.bombsDefault = 3;
    this.bombs = this.bombsDefault;
    this.bombParts = 0;

    this.spellCompleteTerms = true;

    this.powerMax = 4;
    this.power = 1;
    this.damageInc = 0.6;
    this.points = 0;
    this.graze = 0;

    this.grazeWidth = 4;
    this.gatherWidthFinal = 5;
    this.gatherWidth = 20;
    this.gatherValue = 0;
    this.gatherValueExtremum = 0;

    this.focused = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    this.shooting = false;
    this.invulnTime = 0;
    this.autoGatherTime = 0;

    this.respawnTime = -1;
    this.respawnTimeDefault = 10;
    this.deathbombTime = 5;

    this.guided = false;
}

Player.prototype.create = Entity.prototype.create;
Player.prototype.remove = Entity.prototype.remove;
Player.prototype.flush = Entity.prototype.flush;
Player.prototype.baseStep = Entity.prototype.step;

Player.prototype.stepBot = function () {
    var nearest = this.nearestEntity(Projectile, 20);
    if (nearest != null && this.invulnTime <= 0)
        this.headToEntity(nearest, 0, -nearest.width * 20);
    else {
        if (Math.abs(this.x - this.fixedX * this.y - this.fixedY) < 20)
            ;
        this.headToPoint(this.nearestEntity(Enemy, 400) ? this.nearestEntity(Enemy, 400).x : 0, 0, 0, 100);
        if (Math.abs(this.x - this.fixedX * this.y - this.fixedY) < 20)
            ;
        this.headToEntity(this.nearestEntity(Bonus, 200), 0, 80);
    }
    if (this.respawnTime > 0)
        this.bomb();
    this.shoot();
};

Player.prototype.step = function () {

    this.baseStep();
    if (this.guided)
        this.stepBot();
    else
        this.setVectors(null, null, 0, 0, 0, 0);

    var d = 100;
    if ((this.moveLeft || this.moveRight)
            && (this.moveDown || this.moveUp)
            && !(this.moveLeft && this.moveRight)
            && !(this.moveDown && this.moveUp))
        d = 70;

    if (this.focused)
        d /= 2;

    d /= this.parentWorld.ticksPS;

    if (this.moveLeft)
        this.x -= d;
    if (this.moveRight)
        this.x += d;
    if (this.moveUp)
        this.y -= d;
    if (this.moveDown)
        this.y += d;

    if (this.x > this.parentWorld.width / 2 - 5)
        this.x = this.parentWorld.width / 2 - 5;
    if (this.x < -this.parentWorld.width / 2 + 5)
        this.x = -this.parentWorld.width / 2 + 5;
    if (this.y > this.parentWorld.height / 2 - 5)
        this.y = this.parentWorld.height / 2 - 5;
    if (this.y < -this.parentWorld.height / 2 + 5)
        this.y = -this.parentWorld.height / 2 + 5;

    if (this.shooting)
        this.shoot();

    if (this.invulnTime > 0)
        this.invulnTime--;

    if (this.respawnTime > 0)
        --this.respawnTime;

    if (this.respawnTime == 0)
        this.respawn();

    if (this.y < -this.parentWorld.width / 3)
        this.autoGatherTime = 20;

    if (this.autoGatherTime > 0) {
        this.autoGatherTime--;
    }

    if (this.gatherValue > 0) {
        this.gatherValueExtremum = Math.max(this.gatherValue, this.gatherValueExtremum);
        this.gatherValue--;
    }
    if (this.gatherValueExtremum >= 50 && (this.gatherValueExtremum - this.gatherValue > 20)) {
        if (this.gatherValueExtremum >= 150)
            new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "lives", false, false);
        else if (this.gatherValueExtremum >= 100)
            new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "lives", true, false);
        else if (this.gatherValueExtremum >= 75)
            new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "bombs", false, false);
        else
            new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "bombs", true, false);
        this.score += Math.floor(this.gatherValueExtremum / 10) * 1000;
        this.gatherValueExtremum = 0;
        this.gatherValue = 0;
    }

    if (this.score > this.hiscore)
        this.hiscore = this.score;
};

Player.prototype.draw = function (context) {
    var ePos = vp.toScreen(this.x, this.y);

    if (this.respawnTime < 0) {
        if (this.invulnTime > 0) {
            context.fillStyle = SHIELD_COLOR;
            context.beginPath();
            context.arc(ePos.x, ePos.y, (200 / (100 - this.invulnTime) + 2) * vp.zoom * this.width, 0, Math.PI * 2, false);
            context.fill();
            context.closePath();
        }

        context.drawImage(this.customSprite ? this.customSprite : imgPlayer,
                this.focused * (this.customSprite ? this.customSpriteWidth : IMAGE_PLAYER_WIDTH),
                Math.floor(this.lifetime / this.animPeriod) % (this.frameCount) * (this.customSprite ? this.customSpriteHeight : IMAGE_PLAYER_HEIGHT),
                this.customSprite ? this.customSpriteWidth : IMAGE_PLAYER_WIDTH,
                this.customSprite ? this.customSpriteHeight : IMAGE_PLAYER_HEIGHT,
                ePos.x - 4 * this.spriteWidth * vp.zoom,
                ePos.y - 4 * this.spriteWidth * vp.zoom,
                8 * this.spriteWidth * vp.zoom,
                8 * this.spriteWidth * vp.zoom);

        if (this.focused) {
            context.fillStyle = HITBOX_COLOR;
            context.beginPath();
            context.arc(ePos.x, ePos.y, 1 * vp.zoom * this.width, 0, Math.PI * 2, false);
            context.fill();
            context.closePath();
        }
    }
};

Player.prototype.shoot = function () {
    var count = Math.floor(this.power);
    for (var i = 0; i < count; ++i) {
        var bullet = new Projectile(this.parentWorld, this.x + i * (this.focused ? 2 : 8) - (this.focused ? 1 : 4) * (count - 1), this.y + Math.abs(i + 0.5 - count / 2) * 6, 0, -8);
        bullet.width = 2;
        bullet.damage = (1 + this.damageInc) / (count + this.damageInc);
        bullet.playerside = true;
        var special = count >= 3 && (i == 0 || i == count - 1);
        bullet.setSprite(special ? 2 : 1, 2, 4);
        if (special)
            bullet.behavior = function () {
                if (this.lifetime % 6 == 1)
                    this.headToEntity(this.nearestEntity(Enemy, 200), 200, 0);
            };
    }
};

Player.prototype.bomb = function () {
    if (this.invulnTime <= 10 && this.bombs >= 1 && (this.respawnTime < 0 || this.respawnTime > this.respawnTimeDefault - this.deathbombTime)) {
        this.bombs--;
        this.invulnTime = 100;
        this.respawnTime = -1;
        var tEntity = this.parentWorld.firstEntity;
        this.parentWorld.clearField(20);
        this.autoGatherTime = 5;
        this.spellCompleteTerms = false;
    }
};

Player.prototype.kill = function () {
    this.respawnTime = this.respawnTimeDefault;
    this.invulnTime = this.respawnTimeDefault;

    new Particle(this.parentWorld, this.x, this.y, 30, 12, false, false, 0, 4, 4);
    this.parentWorld.splash(this, 20, 10, 16);
};

Player.prototype.respawn = function () {
    this.respawnTime = -1;
    this.spellCompleteTerms = false;

    if (this.lives < 1) {
        this.parentWorld.pause = true;
        this.lives = this.livesDefault;
        this.bombs = this.bombsDefault;
        this.score = this.score % 100 + 1;
        this.power = 1;
        this.graze = 0;
        this.points = 0;
    }
    else
        this.lives--;

    this.autoGatherTime = 0;
    this.invulnTime = 50;
    for (var i = 0; i < 5; ++i) {
        if (i == 2 && this.lives < 1)
            new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "gauge", false, false);
        else
            new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "power", false, false);
    }
    this.x = 0;
    this.y = this.parentWorld.height / 2 - 5;
    this.bombs = Math.max(this.bombsDefault, this.bombs);
    this.power = Math.max(this.power - 0.6, 1);
};

Player.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Player.prototype.setSprite = Entity.prototype.setSprite;
Player.prototype.setVectors = Entity.prototype.setVectors;
Player.prototype.nearestEntity = Entity.prototype.nearestEntity;
Player.prototype.headToEntity = Entity.prototype.headToEntity;
Player.prototype.headToPoint = Entity.prototype.headToPoint;

////////////////////////////////////////////////////////////////

function Enemy(parentWorld, x, y, x1, y1, x2, y2, width, health, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    this.create(parentWorld, x, y, x1, y1, x2, y2, width, sprite,
            frameCount > 0 ? frameCount : (imgEnemy.height / IMAGE_ENEMY_HEIGHT), animPeriod, spriteWidth, spriteDir);
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
    var ePos = vp.toScreen(this.x, this.y);

    context.translate(ePos.x, ePos.y);
    if (this.spriteDir && this.x1 < 0)
        context.scale(-1, 1);

    context.drawImage(this.customSprite ? this.customSprite : imgEnemy,
            this.sprite * (this.customSprite ? this.customSpriteWidth : IMAGE_ENEMY_WIDTH),
            Math.floor(this.lifetime / this.animPeriod) % (this.frameCount) * (this.customSprite ? this.customSpriteHeight : IMAGE_ENEMY_HEIGHT),
            this.customSprite ? this.customSpriteWidth : IMAGE_ENEMY_WIDTH,
            this.customSprite ? this.customSpriteHeight : IMAGE_ENEMY_HEIGHT,
            -4 * this.spriteWidth * vp.zoom,
            -4 * this.spriteWidth * vp.zoom,
            8 * this.spriteWidth * vp.zoom,
            8 * this.spriteWidth * vp.zoom);

    if (this.spriteDir && this.x1 < 0)
        context.scale(-1, 1);
    context.translate(-ePos.x, -ePos.y);

    if (this.parentWorld.drawHitboxes) {
        context.fillStyle = "white";

        context.beginPath();

        context.arc(ePos.x, ePos.y, 1 * vp.zoom * this.width, 0, Math.PI * 2, false);

        context.fill();
        context.closePath();
    }

    if (this == this.parentWorld.boss && this.attackCurrent >= 0 && this.attackCurrent < this.attacks.length) {
        context.lineJoin = "square";
        context.lineCap = "butt";

        this.drawBossWheel(context, 22, 0, 1, BOSS_WHEEL_COLOR, 2);
        this.drawBossWheel(context, 24, 0, 1, BOSS_WHEEL_COLOR, 2);
        this.drawBossWheel(context, 25, 0, 1, BOSS_WHEEL_COLOR, 2);

        var sectionsS = this.attackGroups[this.attackGroupCurrent].spells;
        var sectionsN = this.attackGroups[this.attackGroupCurrent].nonspells;
        var thisSection = this.attackCurrent - this.attackGroups[this.attackGroupCurrent].start;

        var fullWheel = (sectionsS == 0 || sectionsN == 0);

        for (var i = thisSection; i < sectionsN; ++i)
            this.drawBossWheel(context, 23,
                    (i + ((i == thisSection) ? 1 - this.health / this.initialHealth : 0)) / sectionsN * (fullWheel ? 1 : 0.75),
                    (i + 1) / sectionsN * (fullWheel ? 1 : 0.75),
                    (i % 2 == 0) ? BOSS_HEALTH_COLOR : BOSS_HEALTH_ALT_COLOR, 7);
        for (var i = Math.max(thisSection - sectionsN, 0); i < sectionsS; ++i)
            this.drawBossWheel(context, 23,
                    (i + ((i == (thisSection - sectionsN)) ? 1 - this.health / this.initialHealth : 0)) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
                    (i + 1) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
                    (i % 2 == 0) ? BOSS_HEALTH_SPELL_COLOR : BOSS_HEALTH_SPELL_ALT_COLOR, 7);

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
    if (from != to) {
        var ePos = vp.toScreen(this.x, this.y);
        context.lineWidth = lineWidth;
        context.strokeStyle = color;

        context.beginPath();
        context.arc(ePos.x, ePos.y, r * vp.zoom, -Math.PI / 2 + Math.PI * from * 2, -Math.PI / 2 + Math.PI * to * 2, false);
        context.stroke();
        context.closePath();
    }
};

Enemy.prototype.create = Entity.prototype.create;
Enemy.prototype.remove = Entity.prototype.remove;

Enemy.prototype.flush = Entity.prototype.flush;
Enemy.prototype.baseStep = Entity.prototype.step;
Enemy.prototype.step = function () {
    this.baseStep();

    if (this.health <= 0) {
        for (var i = 0; i < this.drops.length; ++i)
            if (this.drops[i].reqDamage == 0 && this.attackCurrent == this.drops[i].attackID) {
                var a = Math.random() * Math.PI * 2;
                var r = Math.random() * this.initialHealth / 5;
                var p = this.drops[i].cat == "power" && this.parentWorld.player.power >= this.parentWorld.player.powerMax;

                new Bonus(this.parentWorld, this.x + Math.sin(a) * r, this.y + Math.cos(a) * r,
                        p ? "point" : this.drops[i].cat, p ? false : this.drops[i].small, false);
            }

        if (this.attackCurrent == -1) {
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
            || this.y < -this.parentWorld.height / 2 - this.width * 2) && this != this.parentWorld.boss) //DO NOT DELETE BOSSES
        this.remove();

    //collision with player
    if (this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player) <
            (this.width + this.parentWorld.player.width) && this.parentWorld.player.invulnTime == 0) {
        this.parentWorld.player.kill();
    }

    //collision with bullets
    var tEntity = this.parentWorld.firstEntity;
    while (tEntity != null) {
        if (tEntity instanceof Projectile && tEntity.playerside) {
            if (this.parentWorld.distanceBetweenEntities(this, tEntity) < (this.width + tEntity.width)) {
                this.hurt(tEntity.damage);
                tEntity.remove();
            }
        }
        tEntity = tEntity.next;
        if (tEntity == this.parentWorld.firstEntity)
            break;
    }

    if (this.attackCurrent == -1)
        this.behavior();
    else if (this.attackCurrent < this.attacks.length) {
        this.bonus = parseInt((this.attacks[this.attackCurrent].bonusBound +
                (1 - (Math.max(this.lifetime, this.attacks[this.attackCurrent].decrTime) /
                        (this.attacks[this.attackCurrent].time - this.attacks[this.attackCurrent].decrTime))) *
                (this.attacks[this.attackCurrent].bonus - this.attacks[this.attackCurrent].bonusBound)) / 100, 10) * 100;

        this.attacks[this.attackCurrent].func(this, this.attacks[this.attackCurrent].param);
        if (this.lifetime >= this.attacks[this.attackCurrent].time) {
            this.nextAttack();
        }
    }
};

Enemy.prototype.behavior = function () {
};

Enemy.prototype.behaviorFinal = function () {
    new Particle(this.parentWorld, this.x, this.y, this.initialHealth < 100 ? 20 : 40, this.initialHealth < 100 ? 8 : 16, false, false, 0, this.initialHealth < 100 ? 4 : 8); //splash
    this.parentWorld.splash(this, this.initialHealth / 5, 8, 10);
    this.remove();
};

Enemy.prototype.onDamage = function (damage) {
};
Enemy.prototype.onDestroy = function () {
};

Enemy.prototype.hurt = function (damage) {

    if (this.parentWorld.boss != this || (this.attackCurrent >= 0 && this.attackCurrent < this.attacks.length))
        this.health -= damage;

    if (this.health > 0) {
        for (var i = 0; i < this.drops.length; ++i)
            if (this.drops[i].reqDamage != 0 && this.attackCurrent == this.drops[i].attackID && ((((this.initialHealth - this.health) % this.drops[i].reqDamage) < ((this.initialHealth - this.health - damage) % this.drops[i].reqDamage) && damage > 0) || damage > this.drops[i].reqDamage))
                new Bonus(this.parentWorld, this.x + Math.random() * 12 - 6, this.y + Math.random() * 12 - 6,
                        (this.drops[i].cat == "power" && this.parentWorld.player.power >= this.parentWorld.player.powerMax) ? "point" : this.drops[i].cat, this.drops[i].small, false);
    }
    this.parentWorld.splash(this, damage, this.spriteWidth * 5, this.spriteWidth * 5);

    this.onDamage(damage);
}

Enemy.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Enemy.prototype.setSprite = Entity.prototype.setSprite;
Enemy.prototype.setVectors = Entity.prototype.setVectors;

Enemy.prototype.initHealth = function (health) {
    this.initialHealth = health;
    this.health = health;
};

Enemy.prototype.addDrops = function (cat, small, amount, reqDamage, afterAttack) {
    for (var i = 0; i < amount; ++i)
        this.drops[this.drops.length] = {cat: cat, small: small, reqDamage: reqDamage || 0, attackID: afterAttack ? (this.attacks.length - 1) : -1};
};

Enemy.prototype.addAttack = function (spell, title, func, param, health, time, decrTime, bonus, bonusBound, newGroup) {
    //decrTime - time when bonus counter start to decrease
    //bonusBound - bonus gotten in the last moment
    //newGroup - forced start of a new group of attacks
    var n = this.attacks.length;
    var m = this.attackGroups.length - 1;

    if (n == 0 || (this.attacks[n - 1].spell && !spell) || newGroup)
        this.attackGroups[++m] = {start: n, nonspells: 0, spells: 0};
    if (spell)
        ++this.attackGroups[m].spells;
    else
        ++this.attackGroups[m].nonspells;

    this.attacks[n] = {spell: spell, title: title || "", func: func, param: param, health: health, time: time, bonus: bonus, decrTime: decrTime, bonusBound: bonusBound};
};

Enemy.prototype.nextAttack = function () {
    if (this.parentWorld.boss == this && this.attackCurrent >= 0 && this.attacks[this.attackCurrent].spell) {
        if (this.health <= 0 && this.parentWorld.player.spellCompleteTerms && this.bonus > 0) {
            this.parentWorld.player.score += this.bonus;
            vp.showMessage("Spell Card Bonus!", this.bonus, 100)
        }
        else
            vp.showMessage("Bonus failed", null, 50);
    }

    var g = this.attackGroups[this.attackGroupCurrent];
    ++this.attackCurrent;

    if (this.attackCurrent >= this.attacks.length) {
        this.behaviorFinal();
        this.parentWorld.boss = null;
        if (this.parentWorld.bossLast)
            this.parentWorld.nextStage(50);
        else {
            ++this.parentWorld.substage;
            this.parentWorld.substageStart = this.parentWorld.time;
        }
    } else {
        this.parentWorld.player.spellCompleteTerms = true;
        this.initHealth(this.attacks[this.attackCurrent].health);
    }

    if (g && (this.attackCurrent >= (g.start + g.nonspells + g.spells))) {
        ++this.attackGroupCurrent;
    }

    this.parentWorld.clearField(0);

    this.lifetime = 0;
};

Enemy.prototype.headToEntity = Entity.prototype.headToEntity;
Enemy.prototype.headToPoint = Entity.prototype.headToPoint;
Enemy.prototype.headToPointSmoothly = Entity.prototype.headToPointSmoothly;

////////////////////////////////////////////////////////////////

function Projectile(parentWorld, x, y, x1, y1, x2, y2, width, playerside, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    this.create(parentWorld, x, y, x1, y1, x2, y2, width,
            sprite || (this.playerside ? 1 : 0), frameCount > 0 ? frameCount : (imgProjectile.height / IMAGE_PROJECTILE_HEIGHT), animPeriod, spriteWidth, spriteDir);
    this.playerside = playerside || false;
    this.grazed = 0;
    this.damage = 1;
}

Projectile.prototype.draw = function (context) {

    var ePos = vp.toScreen(this.x, this.y);

    context.translate(ePos.x, ePos.y);
    if (this.spriteDir)
        context.rotate(Math.atan2(this.y1, this.x1) - Math.PI / 2);

    context.drawImage(this.customSprite ? this.customSprite : imgProjectile,
            this.sprite * (this.customSprite ? this.customSpriteWidth : IMAGE_PROJECTILE_WIDTH),
            Math.floor(this.parentWorld.time / this.animPeriod) % this.frameCount * (this.customSprite ? this.customSpriteHeight : IMAGE_PROJECTILE_HEIGHT),
            this.customSprite ? this.customSpriteWidth : IMAGE_PROJECTILE_WIDTH,
            this.customSprite ? this.customSpriteHeight : IMAGE_PROJECTILE_HEIGHT,
            -this.width * vp.zoom,
            -this.width * vp.zoom,
            this.width * 2 * vp.zoom,
            this.width * 2 * vp.zoom);

    if (this.spriteDir)
        context.rotate(-Math.atan2(this.y1, this.x1) + Math.PI / 2);
    context.translate(-ePos.x, -ePos.y);

    if (this.parentWorld.drawHitboxes) {
        context.fillStyle = "white";

        context.beginPath();

        context.arc(ePos.x, ePos.y, 1 * vp.zoom * this.width, 0, Math.PI * 2, false);

        context.fill();
        context.closePath();
    }
};

Projectile.prototype.create = Entity.prototype.create;
Projectile.prototype.remove = Entity.prototype.remove;

Projectile.prototype.flush = Entity.prototype.flush;
Projectile.prototype.baseStep = Entity.prototype.step;
Projectile.prototype.step = function () {
    this.baseStep();

    //remove from world
    if (this.x > this.parentWorld.width / 2 + this.width * 2
            || this.x < -this.parentWorld.width / 2 - this.width * 2
            || this.y > this.parentWorld.height / 2 + this.width * 2
            || this.y < -this.parentWorld.height / 2 - this.width * 2)
        this.remove();

    if (!this.playerside) {
        //collision
        var d = this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player);
        if (d < (this.width + this.parentWorld.player.width)) {
            this.remove();
            if (this.parentWorld.player.invulnTime == 0)
                this.parentWorld.player.kill();
        } else if (d < (this.width + this.parentWorld.player.grazeWidth) && this.grazed < this.damage && this.parentWorld.player.invulnTime == 0) {
            ++this.parentWorld.player.graze;
            new Particle(this.parentWorld, (this.x + this.parentWorld.player.x) / 2, (this.y + this.parentWorld.player.y) / 2, 4, 8, false, false, 1, 0, 1);
            ++this.grazed;
        }
    }

    this.behavior();
};

Projectile.prototype.behavior = function () {
};

Projectile.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Projectile.prototype.setSprite = Entity.prototype.setSprite;
Projectile.prototype.setVectors = Entity.prototype.setVectors;
Projectile.prototype.headToEntity = Entity.prototype.headToEntity;
Projectile.prototype.headToPoint = Entity.prototype.headToPoint;
Projectile.prototype.nearestEntity = Entity.prototype.nearestEntity;

////////////////////////////////////////////////////////////////

function Bonus(parentWorld, x, y, cat, small, autoGather) {
    this.shifts = new Object(); //to redo
    this.shifts.power = 0;
    this.shifts.point = 1;
    this.shifts.bombs = 2;
    this.shifts.lives = 3;
    this.shifts.gauge = 4;

    this.create(parentWorld, x, y, 0, -2, 0, 0.1, 0);

    this.cat = cat;
    this.small = small;
    this.autoGather = autoGather || false;
}

Bonus.prototype.create = Entity.prototype.create;
Bonus.prototype.remove = Entity.prototype.remove;

Bonus.prototype.draw = function (context) {
    var ePos = vp.toScreen(this.x, this.y);
    context.drawImage(imgBonus, (this.shifts[this.cat] | 0) * IMAGE_BONUS_WIDTH, (this.small ? IMAGE_BONUS_HEIGHT : 0),
            IMAGE_BONUS_WIDTH, IMAGE_BONUS_HEIGHT,
            ePos.x - 3 * vp.zoom,
            ePos.y - 3 * vp.zoom,
            6 * vp.zoom,
            6 * vp.zoom);
};

Bonus.prototype.flush = Entity.prototype.flush;
Bonus.prototype.baseStep = Entity.prototype.step;
Bonus.prototype.step = function () {
    this.baseStep();

    //remove from world
    if (this.y > this.parentWorld.height / 2 + 5)
        this.remove();

    //collision
    var d = this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player);

    if (this.autoGather)
        this.headToEntity(this.parentWorld.player, 120, 0)

    if (d < this.parentWorld.player.gatherWidth || this.parentWorld.player.autoGatherTime > 0) {
        this.autoGather = true;
    }

    if (d < this.parentWorld.player.gatherWidthFinal) {
        this.remove();
        switch (this.cat) {
            case "point":
                this.parentWorld.player.points += (this.small ? 0 : 1);
                this.parentWorld.player.score += (this.small ? 100 : 200);
                this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
                break;
            case "power":
                var fixedPower = this.parentWorld.player.power;
                this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
                if (this.parentWorld.player.power < this.parentWorld.player.powerMax)
                    this.parentWorld.player.power += (this.small ? 0.01 : 0.1);
                else
                    this.parentWorld.player.score += (this.small ? 100 : 200);
                if (this.parentWorld.player.power > this.parentWorld.player.powerMax)
                    this.parentWorld.player.power = this.parentWorld.player.powerMax;
                if (fixedPower < this.parentWorld.player.powerMax && this.parentWorld.player.power == this.parentWorld.player.powerMax) {
                    this.parentWorld.clearField(0);
                    this.parentWorld.replaceBonus("power", true, "point", false);
                }
                break;
            case "gauge":
                this.parentWorld.player.power += (this.small ? 1 : this.parentWorld.player.powerMax - 1);
                if (this.parentWorld.player.power > this.parentWorld.player.powerMax) {
                    this.parentWorld.player.power = this.parentWorld.player.powerMax;
                    this.parentWorld.clearField(0);
                    this.parentWorld.replaceBonus("power", true, "point", false);
                }
                break;
            case "bombs":
                if (((this.parentWorld.player.bombs == 8 && this.parentWorld.player.bombParts == 0) || this.parentWorld.player.bombs < 8) && !this.small)
                    ++this.parentWorld.player.bombs;
                else if (this.parentWorld.player.bombs <= 8 && this.small)
                    ++this.parentWorld.player.bombParts;
                else {
                    this.parentWorld.player.score += (this.small ? 300 : 500);
                    this.parentWorld.player.bombs = 9;
                    this.parentWorld.player.bombParts = 0;
                }
                if (this.parentWorld.player.bombParts >= 4) {
                    this.parentWorld.player.bombParts -= 4;
                    ++this.parentWorld.player.bombs;
                }
                break;
            case "lives":
                if (((this.parentWorld.player.lives == 8 && this.parentWorld.player.lifeParts == 0) || this.parentWorld.player.lives < 8) && !this.small)
                    ++this.parentWorld.player.lives;
                else if (this.parentWorld.player.lives <= 8 && this.small)
                    ++this.parentWorld.player.lifeParts;
                else {
                    this.parentWorld.player.score += (this.small ? 500 : 2000);
                    this.parentWorld.player.lives = 9;
                    this.parentWorld.player.lifeParts = 0;
                }
                if (this.parentWorld.player.lifeParts >= 3) {
                    this.parentWorld.player.lifeParts -= 3;
                    ++this.parentWorld.player.lives;
                }
                break;
        }
    }
};

Bonus.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Bonus.prototype.setSprite = Entity.prototype.setSprite;
Bonus.prototype.setVectors = Entity.prototype.setVectors;
Bonus.prototype.headToEntity = Entity.prototype.headToEntity;

////////////////////////////////////////////////////////////////

function Particle(parentWorld, x, y, removeAt, width, randomFrame, moving, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
    var a = Math.random() * Math.PI * 2;
    var r = Math.random() + 0.1;
    this.create(parentWorld, x, y, moving ? r * Math.cos(a) : 0, moving ? r * Math.sin(a) : 0, 0, 0, width,
            sprite, frameCount > 0 ? frameCount : (imgParticle.height / IMAGE_ENEMY_HEIGHT), animPeriod, spriteWidth, spriteDir);
    this.removeAt = removeAt || 20;
    this.frame = randomFrame ? Math.floor(Math.random() * imgParticle.height / IMAGE_PARTICLE_HEIGHT) : -1;
}

Particle.prototype.create = Entity.prototype.create;
Particle.prototype.remove = Entity.prototype.remove;


Particle.prototype.draw = function (context) {
    var ePos = vp.toScreen(this.x, this.y);
    context.drawImage(imgParticle,
            this.sprite * IMAGE_PARTICLE_WIDTH,
            (this.frame == -1 ? (Math.floor(this.lifetime / this.animPeriod) % (imgParticle.height / IMAGE_PARTICLE_HEIGHT)) : this.frame) * IMAGE_PARTICLE_HEIGHT,
            IMAGE_PARTICLE_WIDTH, IMAGE_PARTICLE_HEIGHT,
            ePos.x - vp.zoom * this.width / 2,
            ePos.y - vp.zoom * this.width / 2,
            vp.zoom * this.width,
            vp.zoom * this.width);
};

Particle.prototype.flush = Entity.prototype.flush;
Particle.prototype.baseStep = Entity.prototype.step;
Particle.prototype.step = function () {
    this.baseStep();

    //remove from world
    if (this.lifetime > this.removeAt)
        this.remove();
};

Particle.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Particle.prototype.setSprite = Entity.prototype.setSprite;
Particle.prototype.setVectors = Entity.prototype.setVectors;
Particle.prototype.headToEntity = Entity.prototype.headToEntity;

////////////////////////////////////////////////////////////////

var vp = new ViewPort();
setInterval(function () {
    vp.draw();
}, 33);

var imgPlayer = new Image();
imgPlayer.src = IMAGE_PLAYER;
var imgEnemy = new Image();
imgEnemy.src = IMAGE_ENEMY;
var imgBonus = new Image();
imgBonus.src = IMAGE_BONUS;
var imgProjectile = new Image();
imgProjectile.src = IMAGE_PROJECTILE;
var imgParticle = new Image();
imgParticle.src = IMAGE_PARTICLE;

var imgBG = new Image();
var imgSpell = new Image();
imgSpell.src = IMAGE_STAGE_SPELL_STRIP;

var imgBGUI = new Image();
imgBGUI.src = IMAGE_UI_BG;
var imgGUI = new Image();
imgGUI.src = IMAGE_GUI;

document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);

function keyDown(event) {
    if (event.keyCode == 37)
        vp.world.player.moveLeft = true;
    if (event.keyCode == 39)
        vp.world.player.moveRight = true;

    if (event.keyCode == 38)
        vp.world.player.moveUp = true;
    if (event.keyCode == 40)
        vp.world.player.moveDown = true;

    if (event.keyCode == 16)
        vp.world.player.focused = true;

    if (event.keyCode == "Z".charCodeAt(0))
        vp.world.player.shooting = true;

    if (event.keyCode == "X".charCodeAt(0))
        vp.world.player.bomb();

    if (event.keyCode == "A".charCodeAt(0))
        vp.world.randomBonus();

    if (event.keyCode == "S".charCodeAt(0))
        vp.world.time += 100;

    if (event.keyCode == "D".charCodeAt(0))
        vp.world.drawHitboxes = !vp.world.drawHitboxes;

    if (event.keyCode == "W".charCodeAt(0))
        vp.world.player.guided = !vp.world.player.guided;

    if (event.keyCode == "Q".charCodeAt(0))
        vp.world.difficulty = (vp.world.difficulty + 1) % DIFF.length;

    if (event.keyCode == "E".charCodeAt(0)) {
        ++vp.world.substage;
        vp.world.substageStart = vp.world.time;
    }

    if (event.keyCode == "R".charCodeAt(0))
        ++vp.world.nextStage();

    if (event.keyCode == 27)
        vp.world.pause = !vp.world.pause;

}

function keyUp(event) {
    if (event.keyCode == 37)
        vp.world.player.moveLeft = false;
    if (event.keyCode == 39)
        vp.world.player.moveRight = false;

    if (event.keyCode == 38)
        vp.world.player.moveUp = false;
    if (event.keyCode == 40)
        vp.world.player.moveDown = false;

    if (event.keyCode == 16)
        vp.world.player.focused = false;

    if (event.keyCode == "Z".charCodeAt(0))
        vp.world.player.shooting = false;
}
