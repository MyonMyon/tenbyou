function EventChain(parent) {
    this.parent = parent;
    this.events = [];
}

EventChain.prototype.clear = function () {
    this.events = [];
};

EventChain.prototype.addEvent = function (func, second, repeatInterval, repeatCount) {
    if (typeof repeatInterval === "function") {
        repeatInterval = repeatInterval(this.parent);
    }
    if (typeof repeatCount === "function") {
        repeatCount = repeatCount(this.parent);
    }
    this.events.push({
        repeatInterval: repeatInterval,
        repeatsLeft: (repeatCount || 1) - 1,
        second: second,
        done: false,
        fire: func
    });
};

EventChain.prototype.addEventNow = function (func, secondTimeout, repeatInterval, repeatCount) {
    this.addEvent(func, this.parent.relTime() + secondTimeout, repeatInterval, repeatCount);
};

EventChain.prototype.tick = function () {
    var t = this.parent.relTime();
    for (var i in this.events) {
        if (!this.events[i].done && t >= this.events[i].second) {
            if (this.events[i].repeatsLeft) {
                --this.events[i].repeatsLeft;
                this.events[i].second += this.events[i].repeatInterval;
            } else {
                this.events[i].done = true;
            }
            this.events[i].fire(this.parent);
        }
    }
};
