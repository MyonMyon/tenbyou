class Dialogue {
    constructor(world, lines) {
        world.dialogue = this;
        this.world = world;
        this.lines = lines;
        this.index = 0;
        this.charStates = {};
        this.activeChar = null;
        this.lettersPS = 40;
        for (let line of this.lines) {
            let char = line.char;
            if (char && !this.charStates[char]) {
                this.charStates[char] = {};
            }
            if (line.position && !this.charStates[char].position) {
                this.charStates[char].position = line.position;
            }
            if (line.sprite && !this.charStates[char].sprite) {
                this.charStates[char].sprite = this.world.vp.res.getSprite(CUT_IN[line.sprite].file);
            }
            if (!line.time) {
                line.time = line.text.length / this.lettersPS * 1.5;
            }
        }
        let lIndex = 0;
        let rIndex = 0;
        for (let i in this.charStates) {
            let l = this.charStates[i].position === "left";
            this.charStates[i].posIndex = l ? lIndex++ : rIndex++;
        }
        this.updateCharStates();
        this.time = 0;
    }

    tick() {
        this.time += 1 / this.world.ticksPS;
        if (this.time < this.lines[this.index].time) {
            this.world.vp.sound.play(SFX.dialogueType);
        }
        if (this.time > this.lines[this.index].time * 4) {
            this.next();
        }
    }

    updateCharStates() {
        if (this.lines[this.index].char) {
            this.activeChar = this.lines[this.index].char;
            for (let i in this.charStates) {
                this.charStates[i].active = this.activeChar === i;
            }
        }
        if (this.lines[this.index].sprite) {
            this.charStates[this.activeChar].sprite = this.world.vp.res.getSprite(CUT_IN[this.lines[this.index].sprite].file);
        }
    }

    next() {
        if (this.lines[this.index].text) {
            let reqTime = this.lines[this.index].time;
            if (this.time < reqTime) {
                this.time = reqTime;
                return;
            }
        }
        this.world.vp.sound.play(SFX.menuIn);
        this.time = 0;
        if (++this.index >= this.lines.length) {
            this.world.dialogue = null;
            return;
        }
        this.updateCharStates();
    }

    draw() {
        let vp = this.world.vp;

        for (let a = 0; a <= 1; a++) {
            for (let i in this.charStates) {
                let state = this.charStates[i];
                vp.context.save();
                if (state.active === !!a) {
                    let s = state.sprite;
                    let r = s.width / s.height;
                    let l = state.position === "left";
                    let v = vp.toScreen(this.world.width / 2 * (l ? -1 : 1), this.world.height / 2);
                    vp.context.translate(v.x, v.y);
                    if (!l) {
                        vp.context.scale(-1, 1);
                    }
                    vp.context.globalAlpha = state.active ? 1 : 0.4;
                    vp.context.drawImage(s, 0, 0, s.width, s.height,
                        vp.zoom * (state.posIndex - 0.5) * 30,
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

        let charName = this.activeChar;
        let charColor;
        if (CHAR[this.activeChar]) {
            charName = CHAR[this.activeChar].name;
            charColor = CHAR[this.activeChar].color;
        }
        vp.context.textAlign = this.charStates[this.activeChar].position || "left";
        let x = vp.context.textAlign === "left" ? DIALOGUE_X + DIALOGUE_MX : DIALOGUE_X + DIALOGUE_W - DIALOGUE_MX;
        vp.setFont(FONT.character);
        if (charColor) {
            vp.context.fillStyle = charColor;
        }
        vp.drawText(charName, x * vp.zoom, (DIALOGUE_Y + DIALOGUE_MY) * vp.zoom);

        vp.context.textAlign = "left";
        vp.setFont(FONT.dialogue);
        vp.drawText(this.lines[this.index].text,
            (DIALOGUE_X + DIALOGUE_MX) * vp.zoom,
            (DIALOGUE_Y + DIALOGUE_MY * 2 + FONT.character.size) * vp.zoom,
            (DIALOGUE_W - DIALOGUE_MX * 2) * vp.zoom,
            Math.floor(this.time * this.lettersPS));
        if (this.lines[this.index].time < this.time) {
            vp.drawText("▶",
                (DIALOGUE_X + DIALOGUE_W - DIALOGUE_MX * 2) * vp.zoom,
                (DIALOGUE_Y + DIALOGUE_MY * 4 + FONT.character.size) * vp.zoom);
        }
    }
}
