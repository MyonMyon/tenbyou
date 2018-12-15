function Dialogue(world, lines) {
    world.dialogue = this;
    this.world = world;
    this.lines = lines;
    this.index = 0;
    this.charStates = {};
    this.activeChar = null;
    for (var i in this.lines) {
        if (this.lines[i].char && !this.charStates[this.lines[i].char]) {
            this.charStates[this.lines[i].char] = {};
        }
        if (this.lines[i].position) {
            this.charStates[this.lines[i].char].position = this.lines[i].position;
        }
    }
    this.updateCharStates();
    this.time = 0;
    this.lettersPS = 40;
}

Dialogue.prototype.tick = function () {
    this.time += 1 / this.world.ticksPS;
};

Dialogue.prototype.updateCharStates = function () {
    if (this.lines[this.index].char) {
        this.activeChar = this.lines[this.index].char;
        for (var i in this.charStates) {
            this.charStates[i].active = this.activeChar === i;
        }
    }
};

Dialogue.prototype.next = function () {
    if (this.lines[this.index].text) {
        var reqTime = this.lines[this.index].time || this.lines[this.index].text.length / this.lettersPS;
        if (this.time < reqTime) {
            this.time = reqTime;
            return;
        }
    }
    this.time = 0;
    if (++this.index >= this.lines.length) {
        this.world.dialogue = null;
        return;
    }
    this.updateCharStates();
};

Dialogue.prototype.draw = function () {
    var vp = this.world.vp;
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
    vp.drawText(text,
            (DIALOGUE_X + DIALOGUE_MX) * vp.zoom,
            (DIALOGUE_Y + DIALOGUE_MY * 2 + FONT.character.size) * vp.zoom);
};
