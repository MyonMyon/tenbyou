function Dialogue(world, lines) {
    world.dialogue = this;
    this.world = world;
    this.lines = lines;
    this.index = 0;
    this.charStates = {};
    this.activeChar = null;
    this.lettersPS = 40;
    for (var i in this.lines) {
        var char = this.lines[i].char;
        if (char && !this.charStates[char]) {
            this.charStates[char] = {};
        }
        if (this.lines[i].position && !this.charStates[char].position) {
            this.charStates[char].position = this.lines[i].position;
        }
        if (this.lines[i].sprite && !this.charStates[char].sprite) {
            this.charStates[char].sprite = CUT_IN[this.lines[i].sprite].object;
        }
        if (!this.lines[i].time) {
            this.lines[i].time = this.lines[i].text.length / this.lettersPS * 1.5;
        }
    }
    var lIndex = 0;
    var rIndex = 0;
    for (var i in this.charStates) {
        var l = this.charStates[i].position === "left";
        this.charStates[i].posIndex = l ? lIndex++ : rIndex++;
    }
    this.updateCharStates();
    this.time = 0;
}

Dialogue.prototype.tick = function () {
    this.time += 1 / this.world.ticksPS;
    if (this.time < this.lines[this.index].time) {
        Sound.play(SFX.dialogueType);
    }
};

Dialogue.prototype.updateCharStates = function () {
    if (this.lines[this.index].char) {
        this.activeChar = this.lines[this.index].char;
        for (var i in this.charStates) {
            this.charStates[i].active = this.activeChar === i;
        }
    }
    if (this.lines[this.index].sprite) {
        this.charStates[this.activeChar].sprite = CUT_IN[this.lines[this.index].sprite].object;
    }
};

Dialogue.prototype.next = function () {
    if (this.lines[this.index].text) {
        var reqTime = this.lines[this.index].time;
        if (this.time < reqTime) {
            this.time = reqTime;
            return;
        }
    }
    Sound.play(SFX.menuIn);
    this.time = 0;
    if (++this.index >= this.lines.length) {
        this.world.dialogue = null;
        return;
    }
    this.updateCharStates();
};

Dialogue.prototype.draw = function () {
    var vp = this.world.vp;

    for (var a = 0; a <= 1; a++) {
        for (var i in this.charStates) {
            vp.context.save();
            if (this.charStates[i].active === !!a) {
                var s = this.charStates[i].sprite;
                var r = s.width / s.height;
                var l = this.charStates[i].position === "left";
                var v = vp.toScreen(this.world.width / 2 * (l ? -1 : 1), this.world.height / 2);
                vp.context.translate(v.x, v.y);
                if (!l) {
                    vp.context.scale(-1, 1);
                }
                vp.context.globalAlpha = this.charStates[i].active ? 1 : 0.4;
                vp.context.drawImage(s, 0, 0, s.width, s.height,
                        vp.zoom * (this.charStates[i].posIndex - 0.5) * 30,
                        0,
                        vp.height / 2 * r,
                        -vp.height / 2);
            }
            vp.context.restore();
        }
    }

    vp.context.textBaseline = "top";
    vp.context.fillStyle = DIALOGUE_COLOR;
    vp.context.fillRect(
            DIALOGUE_X * vp.zoom,
            DIALOGUE_Y * vp.zoom,
            DIALOGUE_W * vp.zoom,
            DIALOGUE_H * vp.zoom);

    var charName = this.activeChar;
    var charColor;
    if (CHAR[this.activeChar]) {
        charName = CHAR[this.activeChar].name;
        charColor = CHAR[this.activeChar].color;
    }
    vp.context.textAlign = this.charStates[this.activeChar].position || "left";
    var x = vp.context.textAlign === "left" ? DIALOGUE_X + DIALOGUE_MX : DIALOGUE_X + DIALOGUE_W - DIALOGUE_MX;
    vp.setFont(FONT.character);
    if (charColor) {
        vp.context.fillStyle = charColor;
    }
    vp.drawText(charName, x * vp.zoom, (DIALOGUE_Y + DIALOGUE_MY) * vp.zoom);

    var text = this.lines[this.index].text.slice(0, Math.floor(this.time * this.lettersPS));
    vp.context.textAlign = "left";
    vp.setFont(FONT.dialogue);
    text = text.split("\n");
    for (var i in text) {
        vp.drawText(text[i],
                (DIALOGUE_X + DIALOGUE_MX) * vp.zoom,
                (DIALOGUE_Y + DIALOGUE_MY * (+i + 2) + FONT.character.size) * vp.zoom);
    }
    if (this.lines[this.index].time < this.time) {
        vp.drawText("▶",
                (DIALOGUE_X + DIALOGUE_W - DIALOGUE_MX * 2) * vp.zoom,
                (DIALOGUE_Y + DIALOGUE_MY * 4 + FONT.character.size) * vp.zoom);
    }
};
