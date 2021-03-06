class EventChain {
    constructor(parent) {
        this.parent = parent;
        this.events = [];
    }

    clear() {
        this.events = [];
    }

    addEvent(func, second, repeatInterval, repeatCount, useWorldTimeGrid) {
        if (typeof repeatInterval === "function") {
            repeatInterval = repeatInterval(this.parent);
        } else if (typeof repeatInterval === "object") {
            repeatInterval = repeatInterval[this.parent.world ? this.parent.world.difficulty : this.parent.difficulty];
        }
        if (typeof repeatCount === "function") {
            repeatCount = repeatCount(this.parent);
        } else if (typeof repeatCount === "object") {
            repeatCount = repeatCount[this.parent.world ? this.parent.world.difficulty : this.parent.difficulty];
        }
        let e = {
            repeatInterval: repeatInterval,
            repeatCount: repeatCount || 1,
            iteration: 0,
            second: useWorldTimeGrid ?
                (Math.floor((this.parent.world.relTime() + second) / repeatInterval) + 1) * (repeatInterval) :
                second,
            done: false,
            useWorldTimeGrid: useWorldTimeGrid,
            fire: func,
            repeat: function (interval, times) {
                this.repeatInterval = interval;
                this.repeatCount = times || Infinity;
            }
        };
        this.events.push(e);
        return e;
    }

    addEventNow(func, secondTimeout, repeatInterval, repeatCount) {
        this.addEvent(func, (this.parent.relTime ? this.parent.relTime() : this.parent.lifetime) + secondTimeout, repeatInterval, repeatCount);
    }

    tick() {
        let t;
        for (let event of this.events) {
            if (event.useWorldTimeGrid) {
                t = this.parent.world.relTime();
            } else if (!this.parent.relTime) {
                t = this.parent.lifetime;
            } else {
                t = this.parent.relTime();
            }
            if (!event.done && t >= event.second) {
                if (event.iteration < event.repeatCount - 1) {
                    event.second += event.repeatInterval;
                } else {
                    event.done = true;
                }
                event.fire.apply(this.parent, [event.iteration++]);
            }
        }
    }
}
