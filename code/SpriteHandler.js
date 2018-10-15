function SpriteHandler() {
}

SpriteHandler.prototype.set = function (x, y) {
    this.position = {
        x: x,
        y: y
    };
    this.animationFrames = [];
    this.animationLength = Infinity;
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

SpriteHandler.prototype.getFrame = function (time) {
    var cTime = time % this.animationLength;
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
        x: this.position.x + shift.x,
        y: this.position.y + shift.y
    };
};
