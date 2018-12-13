function ViewPort() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.context = this.canvas.getContext("2d");

    this.context.imageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = this.context.webkitImageSmoothingEnabled = this.context.msImageSmoothingEnabled = false;

    this.setZoom(ZOOM);

    this.clearMessage();

    this.ticks = [];
    this.fps = 0;
    this.prevMS = 0;

    this.inDev = DEV_MODE;

    var self = this;
    setInterval(function () {
        self.draw(false);
    }, 33);
}

ViewPort.prototype.perfStep = function () {
    var startTime = new Date().getTime();
    this.ticks.push(startTime);
    while (this.ticks.length && this.ticks[0] <= startTime - 2000) {
        this.ticks.splice(0, 1);
    }
    if (startTime % 100 < this.prevMS % 100) {
        this.fps = (this.ticks[this.ticks.length - 1] - this.ticks[0]) / 2 / 2000 * this.ticks.length;
    }
    if (startTime % 1000 < this.prevMS) {
        if (this.pChart && this.pChart.mode !== "off") {
            this.pChart.addData({ec: this.world ? this.world.entities.length : 0, tl: 1 / this.fps});
        }
    }
    this.prevMS = startTime % 1000;
};

ViewPort.prototype.changeZoom = function (delta) {
    this.setZoom(this.zoom + delta);
};

ViewPort.prototype.setZoom = function (zoom) {
    var dpr = window.devicePixelRatio || 1;
    var bspr =
            this.context.webkitBackingStorePixelRatio ||
            this.context.mozBackingStorePixelRatio ||
            this.context.msBackingStorePixelRatio ||
            this.context.oBackingStorePixelRatio ||
            this.context.backingStorePixelRatio || 1;
    var ratio = dpr / bspr;

    this.width = WIDTH * zoom;
    this.height = HEIGHT * zoom;
    this.canvas.width = WIDTH * zoom * ratio;
    this.canvas.height = HEIGHT * zoom * ratio;
    this.canvas.style.width = WIDTH * zoom + "px";
    this.canvas.style.height = HEIGHT * zoom + "px";

    this.zoom = zoom;

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.context.scale(ratio, ratio);
};

ViewPort.prototype.onResize = function () {
    this.changeZoom(0);
};

ViewPort.prototype.onLoad = function () {
    this.loaded = true;

    this.input = new Input(this);
    this.mainMenu = new MainMenu(this);
    this.pauseMenu = new PauseMenu(this);

    this.pChart = new PerformanceChart(this);
    if (this.inDev) {
        this.pChart.nextMode();
    }

    this.version = "Tenbyou v" + ENGINE_VERSION + " (alpha)";
    if (this.inDev) {
        this.version += " dev";
    }
    this.version += " revision";
    if (!this.inDev) {
        this.version += " " + Util.fillWithLeadingZeros(REVISION_TOTAL, 4);
    }
};

/**
 * Takes a screenshot. After that displays a message and refreshes menu or displays the file depending on the settings.
 */
ViewPort.prototype.takeScreenShot = function () {
    try {
        var dataUrl = this.canvas.toDataURL("image/png");
        if (this.world) {
            this.world.setPause(true);
        }
        var anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = GAME_ABBR + "_" + Util.formatAsDateTime(Math.floor(new Date().getTime() / 1000), "YYYY-MM-DD_hh-mm-ss") + ".png";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(document.body.lastChild);
    } catch (ex) {
        console.log("SCREENSHOT ERROR", ex);
    }
};

ViewPort.prototype.setFont = function (data, options) {
    var attr = ["font", "size", "weight", "style", "color", "strokeWidth", "strokeColor"];
    var font = {
        font: "sans-serif",
        size: 5,
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
    font.size *= this.zoom;
    font.strokeWidth *= this.zoom;
    this.context.font = (font.weight ? font.weight + " " : "") + (font.style ? font.style + " " : "") + font.size + "px " + font.font;
    this.context.fillStyle = font.color;
    this.context.strokeStyle = font.strokeColor;
    this.context.lineWidth = font.strokeWidth;
    this.context.lineJoin = "bevel";
};

ViewPort.prototype.drawText = function (text, x, y) {
    this.context.strokeText(text, x, y);
    this.context.fillText(text, x, y);
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

ViewPort.prototype.toScreen = function (worldX, worldY) {
    var value = {x: 0, y: 0};
    value.x = this.centerX + (worldX + SHIFT_X) * this.zoom;
    value.y = this.centerY + (worldY + SHIFT_Y) * this.zoom;
    return value;
};

ViewPort.prototype.infoShow = function (info, line, tab, reverse) {
    this.context.textAlign = reverse ? "right" : "left";
    if (reverse) {
        tab += 0.9;
    }
    var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
    this.drawText(
            info,
            boundaryRight.x + this.zoom * (5 + tab * INFO_TAB),
            boundaryRight.y + this.zoom * (7.5 + (line + 1) * INFO_LINE));
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
                boundaryRight.x + this.zoom * (4 + i * 5 + tab * INFO_TAB),
                boundaryRight.y + this.zoom * (2 + (line + 1) * INFO_LINE),
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
            boundaryRight.x + this.zoom * (9 + tab * INFO_TAB),
            boundaryRight.y + this.zoom * (2 + (line + 1) * INFO_LINE),
            6 * this.zoom,
            6 * this.zoom);
};

ViewPort.prototype.drawGUI = function (boundaryStart, boundaryEnd) {
    this.context.textBaseline = "alphabetic";
    this.context.lineJoin = "round";
    this.context.lineCap = "round";

    this.context.fillStyle = BACKGROUND;
    var x1 = boundaryStart.x;
    var x2 = boundaryEnd.x;

    var xN = this.width;
    var yN = this.height;

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

    this.context.lineWidth = BORDER_WIDTH * this.zoom;
    this.context.strokeStyle = BORDER_COLOR;

    this.context.strokeRect(x1, y1, x2 - x1, y2 - y1); //border

    if (this.world.boss) {
        this.context.drawImage(
                SPRITE.gui.object,
                2 * SPRITE.gui.frameWidth,
                (Math.floor(this.world.relTime() * 2) % 2) * SPRITE.gui.frameHeight,
                SPRITE.gui.frameWidth,
                SPRITE.gui.frameHeight,
                this.toScreen(this.world.boss.x, 0).x - 3 * this.zoom,
                y2,
                6 * this.zoom,
                6 * this.zoom);
    }

    this.setFont(FONT.info);

    this.infoShow("HiScore", 0, 0, true);
    this.infoShow(Util.fillWithLeadingZeros(this.world.player.hiscoreDisplayed, 11), 0, 1);
    this.infoShow("Score", 1, 0, true);
    this.infoShow(Util.fillWithLeadingZeros(this.world.player.scoreDisplayed, 11), 1, 1);

    this.infoShow("Lives", 3, 0, true);
    this.starShow(0, 3, 1, this.world.player.lives, this.world.player.lifeParts);
    this.infoShow("Bombs", 4, 0, true);
    this.starShow(1, 4, 1, this.world.player.bombs, this.world.player.bombParts);

    this.iconShow(1, 0, 7, 0);
    this.infoShow("Points", 7, 0, true);
    this.infoShow(this.world.player.points, 7, 1);
    this.infoShow("Graze", 8, 0, true);
    this.infoShow(this.world.player.graze, 8, 1);

    this.iconShow(0, 1, 6, 0);
    this.infoShow("Power", 6, 0, true);
    this.setFont(FONT.info, {active: this.world.player.specialCooldown <= 0 && this.world.player.power >= 1});
    this.infoShow(this.world.player.power.toFixed(2), 6, 1);

    this.setFont(FONT.info, {minor: true});
    if (this.inDev) {
        this.infoShow("S#" + this.world.stage + "." + this.world.substage, 10, 0);
        this.infoShow("T+" + this.world.relTime().toFixed(2), 10, 0.5);
        this.infoShow("E=" + this.world.entities.length, 10, 1);
        this.infoShow(this.fps.toFixed(2) + " FPS × " + this.world.tickInterval, 10, 1.5);
    } else {
        this.infoShow(this.fps.toFixed(2) + " FPS", 10, 2);
    }

    this.context.textAlign = "center";
    if (ENGINE_VERSION_SHOW) {
        this.drawText(this.version, (boundaryEnd.x + this.width) / 2, boundaryEnd.y);
    }

    var diffO = {};
    diffO["d" + this.world.difficulty] = true;
    this.setFont(FONT.difficulty, diffO);
    this.drawText(DIFF[this.world.difficulty].name.toUpperCase(), (boundaryEnd.x + this.width) / 2, boundaryStart.y + 6 * this.zoom);

    this.setFont(FONT.title, {name: true});
    this.drawText(GAME_TITLE, (boundaryEnd.x + this.width) / 2, boundaryEnd.y - this.zoom * 10);
};

ViewPort.prototype.drawBackground = function (boundaryStart, boundaryEnd) {
    this.context.fillStyle = "black";
    var boundaryStart = this.toScreen(-this.world.width / 2, -this.world.height / 2);
    var boundaryEnd = this.toScreen(this.world.width / 2, this.world.height / 2);
    this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);

    var stg = (this.world.stageTime() < this.world.stageInterval / 2) ? (this.world.stage - 1) : this.world.stage;
    var spell = (this.world.boss && this.world.boss.attackCurrent !== null && this.world.boss.attacks[this.world.boss.attackCurrent].spell);
    if (this.world.stages[stg]) {
        var bg = spell ? (this.world.boss.attacks[this.world.boss.attackCurrent].background || SPRITE.spellBackground) : this.world.stages[stg].background;
        if (bg) {
            var t = bg.object.height - (bg.object.width / this.world.width * this.world.height) - Math.floor(this.world.stageTime() * bg.speed) % bg.object.height;
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
};

ViewPort.prototype.drawMessages = function (boundaryStart, boundaryEnd) {
    this.context.textBaseline = "alphabetic";
    if (this.world.boss) {
        this.setFont(FONT.description);
        this.context.textAlign = "left";
        this.drawText(this.world.boss.title,
                boundaryStart.x + this.zoom * 2.5,
                boundaryStart.y + this.zoom * 5);

        if (this.world.boss.attackCurrent !== null) {
            for (var i = 0; i < (this.world.boss.attackGroups.length - this.world.boss.attackGroupCurrent - 1); ++i)
                this.context.drawImage(SPRITE.gui.object, 0, 0, SPRITE.gui.frameWidth, SPRITE.gui.frameHeight,
                        boundaryStart.x + this.zoom * 2 + (SPRITE.gui.frameWidth - 4) * i * this.zoom / 4,
                        boundaryStart.y + this.zoom * 6,
                        SPRITE.gui.frameWidth * this.zoom / 4,
                        SPRITE.gui.frameHeight * this.zoom / 4);

            if (this.world.boss.attackCurrent < this.world.boss.attacks.length) {
                var attack = this.world.boss.attacks[this.world.boss.attackCurrent];
                this.context.textAlign = "right";
                if (attack.spell) {
                    {
                        this.drawText(attack.title,
                                boundaryEnd.x - this.zoom * 17.5,
                                boundaryStart.y + this.zoom * 5);
                        this.drawText("BONUS: " + (this.world.player.spellCompleteTerms ? this.world.boss.bonus : "FAILED"),
                                boundaryEnd.x - this.zoom * 17.5,
                                boundaryStart.y + this.zoom * 10);
                    }
                }
                this.setFont(FONT.timer, {fullBonus: this.world.boss.relTime() < attack.decrTime});
                this.drawText(Util.fillWithLeadingZeros(Math.ceil(attack.time - this.world.boss.relTime()), 2),
                        boundaryEnd.x - this.zoom * 2.5,
                        boundaryStart.y + this.zoom * 10);
            }
        }
    }

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
        var boundaryItemLine = this.toScreen(0, this.world.maxBonusY);
        this.context.globalAlpha = Math.min(1, (time - this.itemLineStart) / 0.5, (this.itemLineStart + this.itemLineTime - time) / 0.5);
        this.context.fillStyle = FONT.itemLine.strokeColor;
        this.context.fillRect(boundaryStart.x, boundaryItemLine.y - this.zoom / 4, this.world.width * this.zoom, this.zoom / 2);

        this.setFont(FONT.itemLine);
        this.drawText("Item Get Border Line !", (boundaryStart.x + boundaryEnd.x) / 2, boundaryItemLine.y);
        this.context.textBaseline = "alphabetic";
    }
    this.context.globalAlpha = 1;
};

ViewPort.prototype.drawLoading = function () {
    this.context.fillStyle = "#333";
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.textAlign = "center";
    this.setFont(FONT.description);
    this.drawText("LOADING", this.width / 2, this.height / 2 - this.zoom * 2);
    this.drawText(".".repeat(((this.prevMS / 200) | 0) % 5), this.width / 2, this.height / 2);
    this.drawText(this.loadingText || "", this.width / 2, this.height / 2 + this.zoom * 4);
};

ViewPort.prototype.draw = function (initFromWorld) {
    if ((!this.world || this.world.pause) === initFromWorld) {
        return;
    }

    this.perfStep();

    if (!this.loaded) {
        this.drawLoading();
        return;
    }

    if (!this.world) {
        this.mainMenu.draw();
        return;
    }

    var boundaryStart = this.toScreen(-this.world.width / 2, -this.world.height / 2);
    var boundaryEnd = this.toScreen(this.world.width / 2, this.world.height / 2);

    this.drawBackground(boundaryStart, boundaryEnd);

    this.world.draw(this.context);

    this.drawGUI(boundaryStart, boundaryEnd);
    this.drawMessages(boundaryStart, boundaryEnd);

    if (this.world.pause) {
        this.pauseMenu.draw();
    }

    this.pChart.draw();
};
