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
    this.setPosition(sprite.x || 0, sprite.y || 0);
    if (sprite.frames) {
        this.animate(sprite.frames, sprite.interval);
    }
};

SpriteHandler.prototype.setPosition = function (x, y) {
    this.position = {
        x: x,
        y: y
    };
};

SpriteHandler.prototype.setPositionShift = function (x, y) {
    this.positionShift = {
        x: x || 0,
        y: y || 0
    };
};

SpriteHandler.prototype.animate = function (frames, interval) {
    this.list = [];
    this.animationFrames = [];
    this.animationLength = interval;

    var i = 0;
    for (i = 0; i < frames * this.height; i += this.height) {
        this.animationFrames.push({
            x: 0,
            y: i,
            tEnd: this.animationLength
        });
        this.animationLength += interval;
    }
};

SpriteHandler.prototype.setRandomFrame = function () {
    this.animationOffset = Math.random() * this.animationLength;
};

SpriteHandler.prototype.getFrame = function (time) {
    var cTime = (time + this.animationOffset) % this.animationLength;
    var shift = {x: 0, y: 0};
    var frameTime = 0;
    for (var i in this.animationFrames) {
        var frame = this.animationFrames[i];
        if (cTime >= frameTime && cTime < frame.tEnd) {
            shift = frame;
            break;
        }
        frameTime = frame.tEnd;
    }
    return {
        x: this.position.x + this.positionShift.x + shift.x,
        y: this.position.y + this.positionShift.y + shift.y
    };
};

SpriteHandler.prototype.draw = function (context, x, y, t, z) {
    var img = this.getFrame(t);
    context.drawImage(this.object,
            img.x * (this.frameWidth + this.frameMargin),
            img.y * (this.frameHeight + this.frameMargin),
            this.width * this.frameWidth,
            this.height * this.frameHeight,
            x - z / 2 * this.zoom,
            y - z / 2 * this.zoom,
            z * this.zoom,
            z * this.zoom);
};
