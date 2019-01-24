function EventChain(parent) {
    this.parent = parent;
    this.events = [];
}

EventChain.prototype.clear = function () {
    this.events = [];
};

EventChain.prototype.addEvent = function (func, second, repeatInterval, repeatCount, useWorldTimeGrid) {
    if (typeof repeatInterval === "function") {
        repeatInterval = repeatInterval(this.parent);
    }
    if (typeof repeatCount === "function") {
        repeatCount = repeatCount(this.parent);
    }
    var e = {
        repeatInterval: repeatInterval,
        repeatCount: repeatCount || 1,
        iteration: 0,
        second: useWorldTimeGrid ?
                (Math.floor((this.parent.world.relTime() + second) / repeatInterval) + 1) * (repeatInterval) :
                second,
        done: false,
        useWorldTimeGrid: useWorldTimeGrid,
        fire: func,
        repeat: function(interval, times) {
            this.repeatInterval = interval;
            this.repeatCount = times || Infinity;
        }
    };
    this.events.push(e);
    return e;
};

EventChain.prototype.addEventNow = function (func, secondTimeout, repeatInterval, repeatCount) {
    this.addEvent(func, this.parent.relTime() + secondTimeout, repeatInterval, repeatCount);
};

EventChain.prototype.tick = function () {
    var t;
    for (var i in this.events) {
        if (this.events[i].useWorldTimeGrid) {
            t = this.parent.world.relTime();
        } else {
            t = this.parent.relTime();
        }
        if (!this.events[i].done && t >= this.events[i].second) {
            if (this.events[i].iteration < this.events[i].repeatCount - 1) {
                this.events[i].second += this.events[i].repeatInterval;
            } else {
                this.events[i].done = true;
            }
            this.events[i].fire.apply(this.parent, [this.events[i].iteration++]);
        }
    }
};
