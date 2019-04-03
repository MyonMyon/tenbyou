class ViewPort {
    constructor() {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.canvas.focus();

        this.context = this.canvas.getContext("2d");

        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = this.context.webkitImageSmoothingEnabled = this.context.msImageSmoothingEnabled = false;

        this.setZoom(ZOOM);

        this.clearMessages();

        this.debugString = "";

        this.ticks = [];
        this.fps = 0;
        this.prevMS = 0;

        this.loaded = false;

        this.vAlignsTop = new Set(["top", "hanging"]);
        this.vAlignsBottom = new Set(["alphabetic", "ideographic", "bottom"]);

        this.splash = new Image();
        this.splash.src = SPLASH;
        this.splashMs = 1500;
        this.splashFadeMs = 200;
        let self = this;
        this.splash.onload = function() {
            self.splashStart = new Date().getTime();
            self.splashComplete = false;
            self.startTimer = setTimeout(function () {
                self.initMenu();
                self.splashComplete = true;
            }, self.splashMs + self.splashFadeMs);
        };

        this.draw();
    }

    perfStep() {
        let startTime = new Date().getTime();
        this.ticks.push(startTime);
        while (this.ticks.length && this.ticks[0] <= startTime - 2000) {
            this.ticks.splice(0, 1);
        }
        if (startTime % 100 < this.prevMS % 100) {
            this.fps = (this.ticks[this.ticks.length - 1] - this.ticks[0]) / 2 / 2000 * this.ticks.length;
            if (this.gradients === null && this.fps < 55) {
                this.gradients = false;
            }
            if (this.world && Settings.get("video.world_sync")) {
                this.world.ticksPS = Math.round(this.fps / 10) * 10;
            }
        }
        if (startTime % 1000 < this.prevMS) {
            if (this.pChart && this.pChart.mode !== "off" && this.world && !this.world.pause) {
                this.pChart.addData({ entityCount: this.world.entities.size, tickLength: 1 / this.fps });
            }
        }
        this.prevMS = startTime % 1000;
    }

    changeZoom(delta) {
        this.setZoom(this.zoom + delta);
    }

    setZoom(zoom) {
        if (zoom <= 0 || zoom > 20) {
            return;
        }
        let dpr = window.devicePixelRatio || 1;
        let bspr =
            this.context.webkitBackingStorePixelRatio ||
            this.context.mozBackingStorePixelRatio ||
            this.context.msBackingStorePixelRatio ||
            this.context.oBackingStorePixelRatio ||
            this.context.backingStorePixelRatio || 1;
        let ratio = dpr / bspr;

        this.width = WIDTH * zoom;
        this.height = HEIGHT * zoom;
        this.canvas.width = WIDTH * zoom;
        this.canvas.height = HEIGHT * zoom;
        this.canvas.style.width = WIDTH * zoom / ratio + "px";
        this.canvas.style.height = HEIGHT * zoom / ratio + "px";

        this.zoom = zoom;

        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    onResize() {
        this.changeZoom(0);
    }

    onLoad() {
        this.loaded = true;
        this.input = new Input(this);
        if (this.splashComplete) {
            this.initMenu();
        }

        //Resolve event soundpacks:
        let sp = GameEvent.getCurrentProp("soundPack");
        if (sp) {
            for (let i in SFX) {
                let o = SFX[i].object;
                let f = SFX[i].file;
                o.src = SFX_FOLDER + sp + f;
                o.onloadeddata = function() {
                    //overrides function from Init.js, thus no counting
                }
                o.onerror = function() {
                    o.src = SFX_FOLDER + f;
                }
            }
        }
    }

    initMenu() {
        if (!this.loaded || this.mainMenu) {
            return;
        }
        this.inDev = Settings.get("dev.mode");

        this.mainMenu = new MainMenu(this);
        this.pauseMenu = new PauseMenu(this);

        this.pChart = new PerformanceChart(this);
        if (this.inDev) {
            this.pChart.nextMode();
        }

        this.version = "Tenbyou v" + ENGINE_VERSION + "." + (this.inDev ? "dev" : (REVISION_TOTAL + "").padStart(4, "0"));
        if (DEV_STAGE) {
            this.version += " (" + DEV_STAGE + ")";
        }
    }

    initRolls(charName) {
        this.world.setPause(true, true);
        let t = Date.now();
        this.rolls = [];
        for (let roll of ROLL) {
            if (roll.object && (!roll.player || roll.player === charName)) {
                let tNext = t + (roll.time || ROLL[0].time) * 1000;
                this.rolls.push({
                    image: roll.object,
                    zoom: roll.zoom || ROLL[0].zoom,
                    startTime: t,
                    endTime: tNext
                });
            }
        }
    }

    /**
     * Takes a screenshot. After that displays a message and refreshes menu or displays the file depending on the settings.
     */
    takeScreenShot() {
        try {
            let dataUrl = this.canvas.toDataURL("image/png");
            if (this.world) {
                this.world.setPause(true);
            }
            let anchor = document.createElement("a");
            anchor.href = dataUrl;
            anchor.download = GAME_ABBR + "_" + Util.formatAsDateTime(Math.floor(new Date().getTime() / 1000), "YYYY-MM-DD_hh-mm-ss") + ".png";
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(document.body.lastChild);
        } catch (ex) {
            console.log("SCREENSHOT ERROR", ex);
        }
    }

    setFont(data, options) {
        let attr = ["font", "size", "weight", "style", "color", "strokeWidth", "strokeColor"];
        this.fontData = {
            font: "sans-serif",
            size: 5,
            color: "blue",
            strokeColor: "transparent",
            strokeWidth: 0
        };
        for (let a of attr) {
            if (data[a]) {
                this.fontData[a] = data[a];
            }
        }
        if (options) {
            for (let i in options) {
                if (options[i] && data[i]) {
                    for (let a of attr) {
                        if (data[i][a]) {
                            this.fontData[a] = data[i][a];
                        }
                    }
                }
            }
        }
        this.fontData.size *= this.zoom;
        this.fontData.strokeWidth *= this.zoom;
        this.context.font = (this.fontData.weight ? this.fontData.weight + " " : "") + (this.fontData.style ? this.fontData.style + " " : "") + this.fontData.size + "px " + this.fontData.font;
        if (typeof this.fontData.color === "object") {
            this.gradientBuffer = this.fontData.color;
            this.context.fillStyle = this.fontData.color[0];
        } else {
            this.gradientBuffer = null;
            this.context.fillStyle = this.fontData.color;
        }
        this.context.strokeStyle = this.fontData.strokeColor;
        this.context.lineWidth = this.fontData.strokeWidth;
        this.context.lineJoin = "bevel";
    }

    drawText(text, x, y, maxWidth, maxChars) {
        text += "";
        let textArray = text.split("\n");
        if (maxWidth) {
            let t = text.split(/([\s\n]+)/);
            textArray = [""];
            let w = 0;
            for (let tPart of t) {
                if (w === 0) {
                    tPart = tPart.replace(/\s/g, "\u200b");
                }
                let wi = this.context.measureText(tPart).width;
                w += wi;
                if (tPart.match(/\n/) || w > maxWidth) {
                    if (tPart.match(/\s+/)) {
                        tPart = tPart.replace(/\s/g, "\u200b");
                        wi = 0;
                    }
                    w = wi;
                    textArray.push(tPart);
                } else {
                    textArray[textArray.length - 1] += tPart;
                }
            }
        }
        if (maxChars !== null && maxChars !== undefined) {
            let c = 0;
            for (let i in textArray) {
                c += textArray[i].length;
                if (c > maxChars) {
                    textArray[i] = textArray[i].slice(0, maxChars - c);
                    textArray = textArray.slice(0, +i + 1);
                    break;
                }
            }
        }
        for (let i in textArray) {
            let yr = y + i * this.fontData.size;
            if (this.context.lineWidth) {
                this.context.strokeText(textArray[i], x, yr);
            }
            if ((this.gradients !== false) && this.gradientBuffer) {
                let t = this.context.textBaseline;
                let d = 0.5;
                if (this.vAlignsTop.has(t)) {
                    d = 1;
                } else if (this.vAlignsBottom.has(t)) {
                    d = 0;
                }
                let y1 = yr + this.fontData.size * (d - 1);
                let y2 = yr + this.fontData.size * d;

                let grd = this.context.createLinearGradient(0, y1, 0, y2);
                grd.addColorStop(0, this.gradientBuffer[0]);
                grd.addColorStop(1, this.gradientBuffer[1]);
                this.context.fillStyle = grd;
            }
            this.context.fillText(textArray[i], x, yr);
        }
    }

    showMessage(textArray, time, styleArray = [FONT.title], position = "center", fadeIn = 0.33, fadeOut = 0.66) {
        let m = {
            text: textArray,
            start: this.world.time,
            length: time,
            position: position,
            style: styleArray,
            fadeIn: fadeIn,
            fadeOut: fadeOut
        };
        this.messages.push(m);
    }

    showItemLine() {
        this.showMessage(["Item Get Border Line !"], 4, [FONT.itemLine], "itemLine", 0.5, 0.5);
    }

    clearMessages() {
        this.messages = [];
    }

    toScreen(worldX, worldY) {
        let value = { x: 0, y: 0 };
        value.x = Math.round(this.centerX + (worldX + SHIFT_X) * this.zoom);
        value.y = Math.round(this.centerY + (worldY + SHIFT_Y) * this.zoom);
        return value;
    }

    toScreenFX(worldX, worldY) {
        return this.toScreen(worldX + this.world.shake.x, worldY + this.world.shake.y);
    }

    infoShow(info, line, tab, reverse) {
        this.context.textAlign = reverse ? "right" : "left";
        if (reverse) {
            tab += 0.9;
        }
        let boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
        this.drawText(
            info,
            boundaryRight.x + this.zoom * (5 + tab * INFO_TAB),
            boundaryRight.y + this.zoom * (7.5 + (line + 1) * INFO_LINE));
    }

    starShow(sprite, line, tab, count, parts, max) {
        let boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
        for (let i = 0; i < max; ++i) {
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
    }

    iconShow(spriteX, spriteY, line, tab) {
        let boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
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
    }

    drawGUI(boundaryStart, boundaryEnd) {
        this.context.textBaseline = "alphabetic";
        this.context.lineJoin = "round";
        this.context.lineCap = "round";

        this.context.fillStyle = BACKGROUND;
        let x1 = boundaryStart.x;
        let x2 = boundaryEnd.x;

        let xN = this.width;
        let yN = this.height;

        let y1 = boundaryStart.y;
        let y2 = yN - boundaryStart.y;

        this.context.fillRect(0, 0, xN, y1); //top plank
        this.context.fillRect(0, y2, xN, y1); //bottom plank
        this.context.fillRect(0, 0, x1, yN); //left plank
        this.context.fillRect(x2, 0, xN - x2, yN); //right plank

        let o = SPRITE.uiBackground.object;
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
        this.infoShow((this.world.player.hiscoreDisplayed + "").padStart(11, "0"), 0, 1);
        this.infoShow("Score", 1, 0, true);
        this.infoShow((this.world.player.scoreDisplayed + "").padStart(11, "0"), 1, 1);

        this.infoShow("Lives", 3, 0, true);
        this.starShow(0, 3, 1, this.world.player.lives, this.world.player.lifeParts, this.world.player.livesMax);
        this.infoShow("Bombs", 4, 0, true);
        this.starShow(1, 4, 1, this.world.player.bombs, this.world.player.bombParts, this.world.player.bombsMax);

        this.iconShow(1, 0, 7, 0);
        this.infoShow("Points", 7, 0, true);
        this.infoShow(this.world.player.points, 7, 1);
        this.infoShow("Graze", 8, 0, true);
        this.infoShow(Math.floor(this.world.player.graze), 8, 1);

        this.iconShow(0, 1, 6, 0);
        this.infoShow("Power", 6, 0, true);
        this.setFont(FONT.info, { active: this.world.player.specialCooldown <= 0 && this.world.player.power >= 1 });
        this.infoShow(this.world.player.power.toFixed(2), 6, 1);

        this.setFont(FONT.info, { minor: true });
        if (this.inDev) {
            this.infoShow(this.debugString, 9, 0);
            this.infoShow("S#" + this.world.stage + "." + this.world.substage, 10, 0);
            this.infoShow("T+" + this.world.relTime().toFixed(2), 10, 0.5);
            this.infoShow("E=" + this.world.entities.size, 10, 1);
            this.infoShow(this.fps.toFixed(2) + " FPS × " + this.world.tickInterval, 10, 1.5);
            this.context.textAlign = "center";
            this.drawText(this.version, (boundaryEnd.x + this.width) / 2, boundaryEnd.y);
        } else {
            this.infoShow(this.fps.toFixed(2) + " FPS", 21, 1.4, true);
        }

        this.context.textAlign = "center";
        let diffO = {};
        diffO["d" + this.world.difficulty] = true;
        this.setFont(FONT.difficulty, diffO);
        this.drawText(DIFF[this.world.difficulty].name.toUpperCase(), (boundaryEnd.x + this.width) / 2, boundaryStart.y + 6 * this.zoom);

        this.setFont(FONT.title, { name: true });
        this.drawText(GAME_TITLE, (boundaryEnd.x + this.width) / 2, boundaryEnd.y - this.zoom * 10);
    }

    drawBackground(boundaryStart, boundaryEnd) {
        this.context.fillStyle = "black";
        this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);

        let stage = this.world.stages[this.world.stage];
        let spell = (this.world.boss && this.world.boss.attackCurrent !== null && this.world.boss.attacks[this.world.boss.attackCurrent].spell);
        if (stage) {
            let bg = spell ? (this.world.boss.attacks[this.world.boss.attackCurrent].background || SPRITE.spellBackground) : stage.background;
            if (bg) {
                let t = bg.object.height - (bg.object.width / this.world.width * this.world.height) - Math.floor(this.world.time * bg.speed) % bg.object.height;
                let shS = this.world.shake.strength * this.zoom;
                let shX = this.world.shake.x * this.zoom - shS;
                let shY = this.world.shake.y * this.zoom - shS;
                this.context.drawImage(bg.object,
                    0, Math.max(0, t),
                    bg.object.width, bg.object.width / this.world.width * this.world.height,
                    boundaryStart.x + shX, boundaryStart.y - 1 - Math.min(0, t / (bg.object.width / this.world.width) * this.zoom) + shY,
                    this.world.width * this.zoom + shS * 2, this.world.height * this.zoom + shS * 2);
                if (t < 0) {
                    this.context.drawImage(bg.object,
                        0, bg.object.height + t,
                        bg.object.width, -t,
                        boundaryStart.x + shX, boundaryStart.y + shY,
                        this.world.width * this.zoom + shS * 2, -Math.min(0, t / (bg.object.width / this.world.width) * this.zoom) + shS * 2);
                }
            }
        }

        if (spell) {
            let o = SPRITE.spellStrip.object;
            for (let i = 0; i < 2; ++i) {
                for (let j = 0; j < 2 + (boundaryEnd.x + boundaryStart.x) / (o.width * this.zoom / 4); ++j) {
                    this.context.drawImage(o,
                        0, 0,
                        o.width, o.height,
                        boundaryStart.x + this.world.time * (i ? -180 : 180) % (o.width * this.zoom / 4) + (j - 1) * (o.width * this.zoom / 4),
                        (boundaryStart.y * (0.25 + (1 - i) * 0.5) + boundaryEnd.y * (0.25 + i * 0.5)) - o.height / 2,
                        o.width * this.zoom / 4, o.height * this.zoom / 4);
                }
            }
        }

        this.context.globalAlpha = 1 - Math.min(1, (this.world.stageEnd ? this.world.stageEndTime() : this.world.time) / this.world.stageInterval);
        this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);
        this.context.globalAlpha = 1;
    }

    drawMessages(boundaryStart, boundaryEnd) {
        this.context.textBaseline = "alphabetic";
        if (this.world.boss) {
            this.setFont(FONT.description);
            this.context.textAlign = "left";
            this.drawText(this.world.boss.title,
                boundaryStart.x + this.zoom * 2.5,
                boundaryStart.y + this.zoom * 5);

            if (this.world.boss.attackCurrent !== null && !this.world.dialogue) {
                for (let i = 0; i < (this.world.boss.attackGroups.length - this.world.boss.attackGroupCurrent - 1); ++i)
                    this.context.drawImage(SPRITE.gui.object, 0, 0, SPRITE.gui.frameWidth, SPRITE.gui.frameHeight,
                        boundaryStart.x + this.zoom * 2 + (SPRITE.gui.frameWidth - 4) * i * this.zoom / 4,
                        boundaryStart.y + this.zoom * 6,
                        SPRITE.gui.frameWidth * this.zoom / 4,
                        SPRITE.gui.frameHeight * this.zoom / 4);

                if (this.world.boss.attackCurrent < this.world.boss.attacks.length) {
                    let attack = this.world.boss.attacks[this.world.boss.attackCurrent];
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
                    this.setFont(FONT.timer, { fullBonus: this.world.boss.lifetime < attack.decrTime });
                    this.drawText((Math.ceil(attack.time - this.world.boss.lifetime) + "").padStart(2, "0"),
                        boundaryEnd.x - this.zoom * 2.5,
                        boundaryStart.y + this.zoom * 10);
                }
            }
        }

        let time = this.world.time;
        //Show messages:
        for (let message of this.messages) {
            if (time < (message.start + message.length) && time > message.start) {
                this.context.textBaseline = message.position === "itemLine" ? "middle" : "alphabetic";
                this.context.globalAlpha = Math.min(
                    Math.min(1,
                        (time - message.start) / message.fadeIn,
                        (message.start + message.length - time) / message.fadeOut));
                let start = 0;
                let indexOffset = 0;
                switch (message.position) {
                    case "top":
                        start = boundaryStart.y;
                        indexOffset = 2;
                        break;
                    case "center":
                        start = (boundaryStart.y + boundaryEnd.y) / 2;
                        indexOffset = -message.text.length / 2;
                        break;
                    case "itemLine":
                        start = this.toScreen(0, this.world.maxBonusY).y;
                        this.context.fillStyle = message.style[0].strokeColor;
                        this.context.fillRect(boundaryStart.x, start - this.zoom / 4, this.world.width * this.zoom, this.zoom / 2);
                        break;
                }
                for (let i in message.text) {
                    this.setFont(message.style[i % message.style.length]);
                    let text = (message.text[i] + "").split("\t");
                    for (let j in text) {
                        let x;
                        if (text.length === 1) {
                            this.context.textAlign = "center";
                            x = (boundaryStart.x + boundaryEnd.x) / 2;
                        } else {
                            this.context.textAlign = +j ? "right" : "left";
                            x = +j ? (boundaryEnd.x - this.zoom * 40) : (boundaryStart.x + this.zoom * 40);
                        }
                        this.drawText(text[j], x, start + this.zoom * 10 * (+i + indexOffset));
                    }
                }
            }
        }

        this.context.textBaseline = "alphabetic";
        this.context.globalAlpha = 1;
    }

    drawImageOverlay(image, zoom) {
        this.context.drawImage(
            image,
            (this.width - image.width * zoom * this.zoom) / 2,
            (this.height - image.height * zoom * this.zoom) / 2,
            image.width * zoom * this.zoom,
            image.height * zoom * this.zoom);
    }

    drawSplash() {
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.textAlign = "center";
        this.setFont(FONT.description);
        this.drawText(this.loaded ? "Press any key!" : "LOADING", this.width / 2, 3 * this.height / 4 - this.zoom * 2);
        if (!this.loaded) {
            this.drawText(".".repeat(((this.prevMS / 200) | 0) % 5), this.width / 2, 3 * this.height / 4);
            this.drawText(this.loadingText || "", this.width / 2, 3 * this.height / 4 + this.zoom * 4);
        }
        let t = new Date().getTime();
        if (this.splashStart && t < this.splashStart + this.splashMs) {
            this.context.globalAlpha = Math.min((t - this.splashStart) / this.splashFadeMs, (this.splashStart + this.splashMs - t) / this.splashFadeMs);
            this.drawImageOverlay(this.splash, SPLASH_ZOOM);
        }
    }

    drawRolls() {
        this.context.globalAlpha = 1;
        const fadeMs = 200;
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.width, this.height);
        let t = Date.now();
        for (let roll of this.rolls) {
            if ((roll.startTime <= t) && (t <= roll.endTime)) {
                this.context.globalAlpha = Math.min((t - roll.startTime) / fadeMs, (roll.endTime - t) / fadeMs);
                this.drawImageOverlay(roll.image, roll.zoom);
                return;
            }
        }
        this.rolls = null;
    }

    draw() {
        if (!this.perfStep) {
            return this.requestDraw();
        }
        this.perfStep();

        this.context.globalAlpha = 1;

        if (this.rolls) {
            this.drawRolls();
            return this.requestDraw();
        }

        if (!this.mainMenu) {
            this.drawSplash();
            return this.requestDraw();
        }

        if (!this.world) {
            this.mainMenu.draw();
            return this.requestDraw();
        }

        let boundaryStart = this.toScreen(-this.world.width / 2, -this.world.height / 2);
        let boundaryEnd = this.toScreen(this.world.width / 2, this.world.height / 2);

        this.drawBackground(boundaryStart, boundaryEnd);

        this.world.draw(this.context);

        this.drawGUI(boundaryStart, boundaryEnd);
        this.drawMessages(boundaryStart, boundaryEnd);

        if (this.world.pause || this.pauseMenu.getFade() > 0) {
            this.pauseMenu.draw();
        }

        this.pChart.draw();

        this.context.globalAlpha = this.mainMenu.getFade();
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.width, this.height);

        this.requestDraw();
    }

    requestDraw() {
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        }, this.canvas);
    }
}
