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

SpriteHandler.prototype.setSprite = function (sprite) {
    this.object = sprite.object;
    this.frameWidth = sprite.frameWidth;
    this.frameHeight = sprite.frameHeight;
};

SpriteHandler.prototype.setPosition = function (x, y) {
    this.position = {
        x: x,
        y: y
    };
};

SpriteHandler.prototype.setPositionShift = function (x, y) {
    this.positionShift = {
        x: x,
        y: y
    };
};

SpriteHandler.prototype.animate = function (frames, interval) {
    this.list = [];
    this.animationLength = interval;
    for (var i = 0; i < frames; ++i) {
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
            img.x * this.frameWidth,
            img.y * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            x - z/2,
            y - z/2,
            z,
            z);
};
