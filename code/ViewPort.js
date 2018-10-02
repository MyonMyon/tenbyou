var ENGINE_VER = "v0.3.00 (alpha)";

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

    this.clearMessage();

    this.ticks = 0;
    this.fps = 0;
    this.prevMS = 0;

    this.imgPlayer = new Image();
    this.imgPlayer.src = IMAGE_PLAYER;
    this.imgEnemy = new Image();
    this.imgEnemy.src = IMAGE_ENEMY;
    this.imgBonus = new Image();
    this.imgBonus.src = IMAGE_BONUS;
    this.imgProjectile = new Image();
    this.imgProjectile.src = IMAGE_PROJECTILE;
    this.imgParticle = new Image();
    this.imgParticle.src = IMAGE_PARTICLE;

    this.imgBG = new Image();
    this.imgSpell = new Image();
    this.imgSpell.src = IMAGE_STAGE_SPELL_STRIP;

    this.imgBGUI = new Image();
    this.imgBGUI.src = IMAGE_UI_BG;
    this.imgGUI = new Image();
    this.imgGUI.src = IMAGE_GUI;

    this.input = new Input(this);
    this.menu = new Menu(this);

    var self = this;
    setInterval(function () {
        self.draw(false);
    }, 33);
}

ViewPort.prototype.showMessage = function (text, text2, time, altStyle) {
    this.messageText = text;
    this.messageText2 = text2 || "";
    this.messageStart = this.world.time;
    this.messageTime = time;
    this.messageAltStyle = altStyle || false;
};

ViewPort.prototype.clearMessage = function () {
    this.messageText = "";
    this.messageText2 = "";
    this.messageStart = 0;
    this.messageTime = 0;
    this.messageAltStyle = false;
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
        this.context.drawImage(this.imgGUI, sprite * IMAGE_GUI_WIDTH, 0, IMAGE_GUI_WIDTH, IMAGE_GUI_HEIGHT,
                boundaryRight.x + 16 + INFO_TAB + (IMAGE_GUI_WIDTH - 4) * i * this.zoom / 4, boundaryRight.y + 24 - this.zoom * 4 + (line + 1) * INFO_LINE, IMAGE_GUI_WIDTH * this.zoom / 4, IMAGE_GUI_HEIGHT * this.zoom / 4);
    if (parts > 0) {
        this.context.drawImage(this.imgGUI, sprite * IMAGE_GUI_WIDTH, (4 - parts) * IMAGE_GUI_HEIGHT, IMAGE_GUI_WIDTH, IMAGE_GUI_HEIGHT,
                boundaryRight.x + 16 + INFO_TAB + (IMAGE_GUI_WIDTH - 4) * i * this.zoom / 4, boundaryRight.y + 24 - this.zoom * 4 + (line + 1) * INFO_LINE, IMAGE_GUI_WIDTH * this.zoom / 4, IMAGE_GUI_HEIGHT * this.zoom / 4);
    }
    for (var i = count + (parts > 0 ? 1 : 0); i < 9; ++i)
        this.context.drawImage(this.imgGUI, sprite * IMAGE_GUI_WIDTH, 4 * IMAGE_GUI_HEIGHT, IMAGE_GUI_WIDTH, IMAGE_GUI_HEIGHT,
                boundaryRight.x + 16 + INFO_TAB + (IMAGE_GUI_WIDTH - 4) * i * this.zoom / 4, boundaryRight.y + 24 - this.zoom * 4 + (line + 1) * INFO_LINE, IMAGE_GUI_WIDTH * this.zoom / 4, IMAGE_GUI_HEIGHT * this.zoom / 4);

};

ViewPort.prototype.draw = function (initFromWorld) {
    if ((!this.world || this.world.pause) === initFromWorld) {
        return;
    }
    this.ticks++;
    if (new Date().getTime() % 1000 < this.prevMS) {
        this.fps = this.ticks;
        this.ticks = 0;
    }

    this.prevMS = new Date().getTime() % 1000;

    if (!this.world) {
        this.menu.draw();
        return;
    }

    this.context.textBaseline = "alphabetic";
    this.context.textAlign = "left";

    this.context.fillStyle = "black";
    var boundaryStart = this.toScreen(-this.world.width / 2, -this.world.height / 2);
    var boundaryEnd = this.toScreen(this.world.width / 2, this.world.height / 2);
    this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);

    var stg = (this.world.time < this.world.stageInterval / 2) ? (this.world.stage - 1) : this.world.stage;
    var spell = (this.world.boss && this.world.boss.attackCurrent >= 0 && this.world.boss.attacks[this.world.boss.attackCurrent].spell);
    if (stg > 0) {
        this.imgBG.src = spell ? IMAGE_STAGE_SPELL : this.world.stages[stg].background;
        var t = this.imgBG.height - (this.imgBG.width / this.world.width * this.world.height) - this.world.time * (spell ? 1 : this.world.stages[stg].backgroundSpeed) % (this.imgBG.height);
        this.context.drawImage(this.imgBG,
                0, Math.max(0, t),
                this.imgBG.width, this.imgBG.width / this.world.width * this.world.height,
                boundaryStart.x, boundaryStart.y - 1 - Math.min(0, t / (this.imgBG.width / this.world.width) * this.zoom),
                this.world.width * this.zoom, this.world.height * this.zoom);
        if (t < 0) {
            this.context.drawImage(this.imgBG,
                    0, this.imgBG.height + t,
                    this.imgBG.width, -t,
                    boundaryStart.x, boundaryStart.y,
                    this.world.width * this.zoom, -Math.min(0, t / (this.imgBG.width / this.world.width) * this.zoom));
        }
    }

    if (spell)
        for (var i = 0; i < 2; ++i)
            for (var j = 0; j < 2 + (boundaryEnd.x + boundaryStart.x) / (this.imgSpell.width * this.zoom / 4); ++j)
                this.context.drawImage(this.imgSpell,
                        0, 0,
                        this.imgSpell.width, this.imgSpell.height,
                        boundaryStart.x + this.world.time * (i === 0 ? 6 : -6) % (this.imgSpell.width * this.zoom / 4) + (j - 1) * (this.imgSpell.width * this.zoom / 4),
                        (boundaryStart.y * (0.25 + (1 - i) * 0.5) + boundaryEnd.y * (0.25 + i * 0.5)) - this.imgSpell.height / 2,
                        this.imgSpell.width * this.zoom / 4, this.imgSpell.height * this.zoom / 4);

    this.context.globalAlpha = Math.max(Math.min(Math.min(this.world.time / 5, (this.world.stageInterval - this.world.time) / 5), 1), 0);
    this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);
    this.context.globalAlpha = 1;

    var drawOrder = [
        Bonus,
        Enemy,
        Player,
        Particle,
        Projectile
    ];
    for (var d in drawOrder) {
        for (var i in this.world.entities) {
            if (this.world.entities[i] instanceof drawOrder[d]) {
                this.world.entities[i].draw(this.context);
            }
        }
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
                this.context.drawImage(this.imgGUI, 0, 0, IMAGE_GUI_WIDTH, IMAGE_GUI_HEIGHT,
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

    this.context.drawImage(this.imgBGUI, 0, 0, this.imgBGUI.width, y1 / yN * this.imgBGUI.height, 0, 0, xN, y1);
    this.context.drawImage(this.imgBGUI, 0, y2 / yN * this.imgBGUI.height, this.imgBGUI.width, y1 / yN * this.imgBGUI.height, 0, y2, xN, y1);
    this.context.drawImage(this.imgBGUI, 0, 0, x1 / xN * this.imgBGUI.width, this.imgBGUI.height, 0, 0, x1, yN);
    this.context.drawImage(this.imgBGUI, x2 / xN * this.imgBGUI.width, 0, (xN - x2) / xN * this.imgBGUI.width, this.imgBGUI.height, x2, 0, xN - x2, yN);

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
    this.infoShow(this.world.entities.length, 11, 0);
    this.infoShow(this.fps + "fps", 11, 1);

    this.context.textAlign = "center";
    if (ENGINE_VER_SHOW) {
        this.context.strokeText("Tenbyou " + ENGINE_VER, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y);
        this.context.fillText("Tenbyou " + ENGINE_VER, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y);
    }
    this.context.strokeText(DIFF[this.world.difficulty].toUpperCase(), (boundaryEnd.x + this.canvas.width) / 2, boundaryStart.y + 6 * this.zoom);
    this.context.fillText(DIFF[this.world.difficulty].toUpperCase(), (boundaryEnd.x + this.canvas.width) / 2, boundaryStart.y + 6 * this.zoom);

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
        this.menu.draw();
    }
};
