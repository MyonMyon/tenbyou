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

    this.inDev = window.location.href.split(":")[0] === "file";
    this.devStage = this.inDev ? "DEVELOPMENT" : "(alpha)";
    this.showPerf = this.inDev;

    var self = this;
    setInterval(function () {
        self.draw(false);
    }, 33);
}

ViewPort.prototype.onLoad = function () {
    this.loaded = true;

    this.input = new Input(this);
    this.mainMenu = new MainMenu(this);
    this.pauseMenu = new PauseMenu(this);

    this.pChart = new PerformanceChart(this);
};

/**
 * Takes a screenshot. After that displays a message and refreshes menu or displays the file depending on the settings.
 */
ViewPort.prototype.takeScreenShot = function () {
    try {
        var dataUrl = this.canvas.toDataURL("image/png");
        window.open(dataUrl, "_blank");
        this.world.pause = true;
    } catch (ex) {
        console.log("SCREENSHOT ERROR");
    }
};

ViewPort.prototype.setFont = function (data, options) {
    var attr = ["font", "size", "weight", "style", "color", "strokeWidth", "strokeColor"];
    var font = {
        font: "sans-serif",
        size: this.zoom * 5,
        color: "blue",
        strokeColor: "transparent",
        strokeWidth: 0
    };
    for (var i in attr) {
        if (data[attr[i]]) {
            font[attr[i]] = data[attr[i]];
        }
    }
    if (options) {
        for (var i in options) {
            if (options[i] && data[i]) {
                for (var j in attr) {
                    if (data[i][attr[j]]) {
                        font[attr[j]] = data[i][attr[j]];
                    }
                }
            }
        }
    }
    this.context.font = (font.weight ? font.weight + " " : "") + (font.style ? font.style + " " : "") + font.size + "px " + font.font;
    this.context.fillStyle = font.color;
    this.context.strokeStyle = font.strokeColor;
    this.context.lineWidth = font.strokeWidth;
    this.context.lineJoin = "bevel";
};

ViewPort.prototype.drawText = function (text, x, y, maxWidth) {
    this.context.strokeText(text, x, y, maxWidth);
    this.context.fillText(text, x, y, maxWidth);
};

ViewPort.prototype.showMessage = function (textArray, time, styleArray) {
    this.messageTextArray = textArray;
    this.messageStart = this.world.stageTime();
    this.messageTime = time;
    this.messageStyleArray = styleArray || [FONT.title];
};

ViewPort.prototype.showItemLine = function () {
    this.itemLineStart = this.world.stageTime();
    this.itemLineTime = 4;
};

ViewPort.prototype.clearMessage = function () {
    this.messageTextArray = [];
    this.messageStart = 0;
    this.messageTime = 0;
    this.messageStyleArray = [FONT.title];
    this.itemLineStart = 0;
    this.itemLineTime = 0;
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

ViewPort.prototype.infoShow = function (info, line, tab, reverse) {
    this.context.textAlign = reverse ? "right" : "left";
    if (reverse) {
        tab += 0.9;
    }
    var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
    this.drawText(info, boundaryRight.x + this.zoom * 5 + tab * INFO_TAB, boundaryRight.y + this.zoom * 7.5 + (line + 1) * INFO_LINE);
};

ViewPort.prototype.starShow = function (sprite, line, tab, count, parts) {
    var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
    for (var i = 0; i < 9; ++i) {
        this.context.drawImage(
                SPRITE.gui.object,
                sprite * SPRITE.gui.frameWidth,
                (i < count ? 0 : (i === count ? 4 - parts : 4)) * SPRITE.gui.frameHeight,
                SPRITE.gui.frameWidth,
                SPRITE.gui.frameHeight,
                boundaryRight.x + this.zoom * 4 + tab * INFO_TAB + i * this.zoom * 5,
                boundaryRight.y + this.zoom * 2 + (line + 1) * INFO_LINE,
                6 * this.zoom,
                6 * this.zoom);
    }
};

ViewPort.prototype.iconShow = function (spriteX, spriteY, line, tab) {
    var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
    this.context.drawImage(
            SPRITE.bonus.object,
            spriteX * SPRITE.bonus.frameWidth,
            spriteY * SPRITE.bonus.frameHeight,
            SPRITE.bonus.frameWidth,
            SPRITE.bonus.frameHeight,
            boundaryRight.x + this.zoom * 4 + tab * INFO_TAB + this.zoom * 5,
            boundaryRight.y + this.zoom * 2 + (line + 1) * INFO_LINE,
            6 * this.zoom,
            6 * this.zoom);
};

ViewPort.prototype.draw = function (initFromWorld) {
    if ((!this.world || this.world.pause) === initFromWorld) {
        return;
    }
    this.ticks++;
    if (new Date().getTime() % 1000 < this.prevMS) {
        this.fps = this.ticks;
        this.ticks = 0;
        if (this.showPerf) {
            this.pChart.addData({ec: this.world ? this.world.entities.length : 0, tl: 1 / this.fps});
        }
    }

    this.prevMS = new Date().getTime() % 1000;

    if (!this.loaded) {
        this.context.fillStyle = "#333";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.textAlign = "center";
        this.setFont(FONT.description);
        this.drawText("LOADING", this.canvas.width / 2, this.canvas.height / 2 - this.zoom * 2);
        this.drawText(".".repeat(((this.prevMS / 200) | 0) % 5), this.canvas.width / 2, this.canvas.height / 2);
        this.drawText(this.loadingText, this.canvas.width / 2, this.canvas.height / 2 + this.zoom * 4);

        return;
    }

    if (!this.world) {
        this.mainMenu.draw();
        return;
    }

    this.context.textBaseline = "alphabetic";
    this.context.textAlign = "left";

    this.context.fillStyle = "black";
    var boundaryStart = this.toScreen(-this.world.width / 2, -this.world.height / 2);
    var boundaryEnd = this.toScreen(this.world.width / 2, this.world.height / 2);
    this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);

    var stg = (this.world.stageTime() < this.world.stageInterval / 2) ? (this.world.stage - 1) : this.world.stage;
    var spell = (this.world.boss && this.world.boss.attackCurrent !== null && this.world.boss.attacks[this.world.boss.attackCurrent].spell);
    if (this.world.stages[stg]) {
        var bg = spell ? SPRITE.spellBackground : this.world.stages[stg].background;
        if (bg) {
            var t = bg.object.height - (bg.object.width / this.world.width * this.world.height) - Math.floor(this.world.stageTime() * (spell ? 30 : bg.speed)) % (bg.object.height);
            this.context.drawImage(bg.object,
                    0, Math.max(0, t),
                    bg.object.width, bg.object.width / this.world.width * this.world.height,
                    boundaryStart.x, boundaryStart.y - 1 - Math.min(0, t / (bg.object.width / this.world.width) * this.zoom),
                    this.world.width * this.zoom, this.world.height * this.zoom);
            if (t < 0) {
                this.context.drawImage(bg.object,
                        0, bg.object.height + t,
                        bg.object.width, -t,
                        boundaryStart.x, boundaryStart.y,
                        this.world.width * this.zoom, -Math.min(0, t / (bg.object.width / this.world.width) * this.zoom));
            }
        }
    }

    if (spell) {
        var o = SPRITE.spellStrip.object;
        for (var i = 0; i < 2; ++i) {
            for (var j = 0; j < 2 + (boundaryEnd.x + boundaryStart.x) / (o.width * this.zoom / 4); ++j) {
                this.context.drawImage(o,
                        0, 0,
                        o.width, o.height,
                        boundaryStart.x + this.world.stageTime() * (i ? -180 : 180) % (o.width * this.zoom / 4) + (j - 1) * (o.width * this.zoom / 4),
                        (boundaryStart.y * (0.25 + (1 - i) * 0.5) + boundaryEnd.y * (0.25 + i * 0.5)) - o.height / 2,
                        o.width * this.zoom / 4, o.height * this.zoom / 4);
            }
        }
    }

    this.context.globalAlpha = Math.max(Math.min(Math.min(this.world.stageTime() * 6, (this.world.stageInterval - this.world.stageTime()) * 6), 1), 0);
    this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);
    this.context.globalAlpha = 1;

    var drawOrder = [
        Enemy,
        Player,
        Bonus,
        Particle,
        Projectile,
        Text
    ];
    for (var d in drawOrder) {
        for (var p = 0; p < 2; ++p) {
            for (var i in this.world.entities) {
                var e = this.world.entities[i];
                if (e.priority === p && e instanceof drawOrder[d]) {
                    e.draw(this.context);
                }
            }
        }
    }

    if (this.world.boss) {
        this.setFont(FONT.description);
        this.context.textAlign = "left";
        this.drawText(this.world.boss.title, boundaryStart.x + 10, boundaryStart.y + 20);

        if (this.world.boss.attackCurrent !== null) {
            for (var i = 0; i < (this.world.boss.attackGroups.length - this.world.boss.attackGroupCurrent - 1); ++i)
                this.context.drawImage(SPRITE.gui.object, 0, 0, SPRITE.gui.frameWidth, SPRITE.gui.frameHeight,
                        boundaryStart.x + 8 + (SPRITE.gui.frameWidth - 4) * i * this.zoom / 4, boundaryStart.y + 24, SPRITE.gui.frameWidth * this.zoom / 4, SPRITE.gui.frameHeight * this.zoom / 4);

            if (this.world.boss.attackCurrent < this.world.boss.attacks.length) {
                var attack = this.world.boss.attacks[this.world.boss.attackCurrent];
                this.context.textAlign = "right";
                if (attack.spell) {
                    {
                        this.drawText(attack.title, boundaryEnd.x - 70, boundaryStart.y + 20);
                        this.drawText("BONUS: " + (this.world.player.spellCompleteTerms ? this.world.boss.bonus : "FAILED"), boundaryEnd.x - 70, boundaryStart.y + 40);
                    }
                }
                this.setFont(FONT.timer, {fullBonus: this.world.boss.relTime() < attack.decrTime});
                this.drawText(this.fixedInt(Math.ceil(attack.time - this.world.boss.relTime()), 2), boundaryEnd.x - 10, boundaryStart.y + 40);
            }
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

    var o = SPRITE.uiBackground.object;
    this.context.drawImage(o, 0, 0, o.width, y1 / yN * o.height, 0, 0, xN, y1);
    this.context.drawImage(o, 0, y2 / yN * o.height, o.width, y1 / yN * o.height, 0, y2, xN, y1);
    this.context.drawImage(o, 0, 0, x1 / xN * o.width, o.height, 0, 0, x1, yN);
    this.context.drawImage(o, x2 / xN * o.width, 0, (xN - x2) / xN * o.width, o.height, x2, 0, xN - x2, yN);

    this.context.lineWidth = BORDER_WIDTH;
    this.context.strokeStyle = BORDER_COLOR;

    this.context.strokeRect(x1, y1, x2 - x1, y2 - y1); //border

    this.setFont(FONT.info);

    this.infoShow("HiScore", 0, 0, true);
    this.infoShow(this.fixedInt(this.world.player.hiscoreDisplayed, 11), 0, 1);
    this.infoShow("Score", 1, 0, true);
    this.infoShow(this.fixedInt(this.world.player.scoreDisplayed, 11), 1, 1);

    this.infoShow("Lives", 3, 0, true);
    this.starShow(0, 3, 1, this.world.player.lives, this.world.player.lifeParts);
    this.infoShow("Bombs", 4, 0, true);
    this.starShow(1, 4, 1, this.world.player.bombs, this.world.player.bombParts);

    this.iconShow(0, 1, 6, 0);
    this.infoShow("Power", 6, 0, true);
    this.infoShow(this.world.player.power.toFixed(2), 6, 1);
    this.iconShow(1, 0, 7, 0);
    this.infoShow("Points", 7, 0, true);
    this.infoShow(this.world.player.points, 7, 1);
    this.infoShow("Graze", 8, 0, true);
    this.infoShow(this.world.player.graze, 8, 1);

    this.setFont(FONT.info, {minor: true});
    if (this.inDev) {
        this.infoShow("S" + this.world.stage + "." + this.world.substage + "+" + this.world.relTime().toFixed(2), 10, 0);
        this.infoShow("E" + this.world.entities.length, 10, 0.5);
        this.infoShow(this.fps + " FPS × " + this.world.tickInterval, 10, 1);
    } else {
        this.infoShow(this.fps + " FPS", 10, 2);
    }

    this.context.textAlign = "center";
    if (ENGINE_VER_SHOW) {
        this.drawText(["Tenbyou", ENGINE_VER, this.devStage].join(" "), (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y);
    }

    var diffO = {};
    diffO["d" + this.world.difficulty] = true;
    this.setFont(FONT.difficulty, diffO);
    this.drawText(DIFF[this.world.difficulty].name.toUpperCase(), (boundaryEnd.x + this.canvas.width) / 2, boundaryStart.y + 6 * this.zoom);

    this.setFont(FONT.title, {name: true});
    this.drawText(GAME_TITLE, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y - this.zoom * 10);

    var time = this.world.stageTime();
    //Show message:
    if (time < (this.messageStart + this.messageTime) && time > this.messageStart) {
        this.context.globalAlpha = Math.min(Math.min((time - this.messageStart) * 3, (this.messageStart + this.messageTime - time) * 1.5), 1);
        for (var i in this.messageTextArray) {
            this.setFont(this.messageStyleArray[i % this.messageStyleArray.length]);
            this.drawText(this.messageTextArray[i], (boundaryStart.x + boundaryEnd.x) / 2, (boundaryStart.y + boundaryEnd.y) / 2 + this.zoom * 10 * (i - this.messageTextArray.length / 2));
        }
    }
    if (time < (this.itemLineStart + this.itemLineTime) && time > this.itemLineStart) {
        this.context.textBaseline = "middle";
        var boundaryItemLine = this.toScreen(0, -this.world.height / 3);
        this.context.globalAlpha = Math.min(1, (time - this.itemLineStart) / 0.5, (this.itemLineStart + this.itemLineTime - time) / 0.5);
        this.context.fillStyle = FONT.itemLine.strokeColor;
        this.context.fillRect(boundaryStart.x, boundaryItemLine.y - this.zoom / 4, this.world.width * this.zoom, this.zoom / 2);

        this.setFont(FONT.itemLine);
        this.drawText("Item Get Border Line !", (x1 + x2) / 2, boundaryItemLine.y);
        this.context.textBaseline = "alphabetic";
    }
    this.context.globalAlpha = 1;

    if (this.world.pause) {
        this.pauseMenu.draw();
    }

    if (this.showPerf) {
        this.pChart.draw();
    }
};
