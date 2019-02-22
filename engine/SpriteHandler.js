function SpriteHandler() {
    this.animationFrames = [];
    this.animationLength = Infinity;
    this.animationOffset = 0;
    this.position = {
        x: 0,
        y: 0
    };
    this.positionShift = {
        x: 0,
        y: 0
    };
}

SpriteHandler.prototype.set = function (sprite) {
    if (typeof sprite === "string") {
        this.name = sprite;
        sprite = this.ref[sprite];
    } else {
        this.ref = sprite;
    }
    if (sprite.object) {
        this.object = sprite.object;
    }
    this.zoom = 1 / (sprite.hitbox || 1);
    this.width = sprite.width || 1;
    this.height = sprite.height || 1;
    if (sprite.frameWidth && sprite.frameHeight) {
        this.frameWidth = sprite.frameWidth;
        this.frameHeight = sprite.frameHeight;
        this.frameMargin = sprite.frameMargin || 0;
    }
    this.states = sprite.states || {};
    this.setPosition(sprite.x || 0, sprite.y || 0);
    if (sprite.frames) {
        this.animate(sprite.frames, sprite.interval, sprite.frameReverse);
    } else {
        this.animationFrames = [];
    }
};

SpriteHandler.prototype.setPosition = function (x, y) {
    this.position = {
        x: x,
        y: y
    };
};

SpriteHandler.prototype.setState = function (state) {
    if (this.states[state]) {
        this.setPositionShift(this.states[state].x, this.states[state].y);
    }
};

SpriteHandler.prototype.setPositionShift = function (x, y) {
    this.positionShift = {
        x: x || 0,
        y: y || 0
    };
};

SpriteHandler.prototype.animate = function (frames, interval, frameReverse) {
    this.list = [];
    this.animationFrames = [];
    this.animationLength = 0;

    var i = 0;
    for (i = 0; i < frames * this.height; i += this.height) {
        this.animationFrames.push({
            x: 0,
            y: i,
            tEnd: this.animationLength
        });
        this.animationLength += interval;
    }
    if (frameReverse) {
        for (i = i - this.height; i > 0; i -= this.height) {
            this.animationFrames.push({
                x: 0,
                y: i,
                tEnd: this.animationLength
            });
            this.animationLength += interval;
        }
    }
};

SpriteHandler.prototype.setRandomFrame = function () {
    this.animationOffset = Math.random() * this.animationLength;
};

SpriteHandler.prototype.getFrame = function (time) {
    var shift = {x: 0, y: 0};
    if (this.animationFrames.length) {
        var cTime = (time + this.animationOffset) % this.animationLength;
        var frameTime = 0;
        for (var i in this.animationFrames) {
            var frame = this.animationFrames[i];
            if (cTime >= frameTime && cTime < frame.tEnd) {
                shift = frame;
                break;
            }
            frameTime = frame.tEnd;
        }
    }
    return {
        x: this.position.x + this.positionShift.x + shift.x,
        y: this.position.y + this.positionShift.y + shift.y
    };
};

SpriteHandler.prototype.draw = function (context, x, y, t, z, c) {
    var c = c || 1;
    var img = this.getFrame(t);
    if (this.object) {
        for (var i = 0; i < c; i++) {
            var part = (i + 1 <= c) ? 1 : (c - Math.floor(c));
            context.drawImage(this.object,
                    img.x * (this.frameWidth + this.frameMargin),
                    img.y * (this.frameHeight + this.frameMargin),
                    this.width * this.frameWidth,
                    this.height * this.frameHeight * part,
                    x - z / 2 * this.zoom,
                    y - z / 2 * this.zoom + i * z * this.zoom,
                    z * this.zoom,
                    z * this.zoom * part);
        }
    }
};
