function Dialogue(world, lines) {
    world.dialogue = this;
    world.vp.input.stopAll();
    this.world = world;
    this.lines = lines;
    this.time = 0;
    this.index = 0;
    this.lettersPS = 40;
}

Dialogue.prototype.tick = function () {
    this.time += 1 / this.world.ticksPS;
};

Dialogue.prototype.next = function () {
    var reqTime = this.lines[this.index].time || this.lines[this.index].text.length / this.lettersPS;
    console.log(this.time, reqTime);
    if (this.time < reqTime) {
        this.time = reqTime;
        return;
    }
    this.time = 0;
    if (++this.index >= this.lines.length) {
        this.world.dialogue = null;
        this.world.vp.input.stopAll();
        return;
    }
    var keepProps = ["character", "position"];
    for (var i in keepProps) {
        if (!this.lines[this.index][keepProps[i]]) {
            this.lines[this.index][keepProps[i]] = this.lines[this.index - 1][keepProps[i]];
        }
    }
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

    var char = this.lines[this.index].char;
    var charName = char;
    if (CHAR[char]) {
        charName = CHAR[char].name;
    }
    vp.context.textAlign = this.lines[this.index].position || "left";
    var x = vp.context.textAlign === "left" ? DIALOGUE_X + DIALOGUE_MX : DIALOGUE_X + DIALOGUE_W - DIALOGUE_MX;
    vp.setFont(FONT.character);
    vp.drawText(charName, x * vp.zoom, (DIALOGUE_Y + DIALOGUE_MY) * vp.zoom);

    var text = this.lines[this.index].text.slice(0, Math.floor(this.time * this.lettersPS));
    vp.context.textAlign = "left";
    vp.setFont(FONT.dialogue);
    vp.drawText(text,
            (DIALOGUE_X + DIALOGUE_MX) * vp.zoom,
            (DIALOGUE_Y + DIALOGUE_MY * 2 + FONT.character.size) * vp.zoom);
};
