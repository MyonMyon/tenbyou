function PerformanceChart(vp) {
    this.vp = vp;
    this.position = {
        x: 160,
        y: 104
    };
    this.size = {
        x: 92,
        y: 64
    };
    this.data = [];
    this.maxTicks = 100;
    this.maxValue = {ec: 0, tl: 0.05};
}

PerformanceChart.prototype.addData = function (data) {
    this.data.push(data);
    if (this.data.length > this.maxTicks) {
        this.data.splice(0, this.data.length - this.maxTicks);
    }
    this.maxValue.ec = 0;
    for (var i in this.data) {
        if (this.data[i].ec > this.maxValue.ec) {
            this.maxValue.ec = this.data[i].ec;
        }
    }
    this.thresholds = {
        0: "#0cc",
        0.0125: "#0c0",
        0.02: "#cc0",
        0.035: "#c00",
        0.05: "#800"
    };
};

PerformanceChart.prototype.draw = function () {
    this.vp.context.fillStyle = "rgba(23, 23, 23, 0.8)";
    this.vp.context.fillRect(
            this.vp.zoom * this.position.x,
            this.vp.zoom * this.position.y,
            this.vp.zoom * this.size.x,
            this.vp.zoom * this.size.y);
    this.vp.context.strokeStyle = "#ff0";
    this.vp.context.lineWidth = this.vp.zoom / 2;
    for (var i in this.data) {
        for (var j in this.thresholds) {
            if (j < this.data[i].tl) {
                this.vp.context.fillStyle = this.thresholds[j];
            }
        }
        this.vp.context.fillRect(
                this.vp.zoom * (this.position.x + i * this.size.x / this.maxTicks),
                this.vp.zoom * (this.position.y + this.size.y),
                this.vp.zoom * this.size.x / this.maxTicks,
                this.vp.zoom * -this.size.y * Math.min(1, this.data[i].tl / this.maxValue.tl));
    }
    this.vp.context.beginPath();
    for (var i in this.data) {
        this.vp.context[i ? "lineTo" : "moveTo"](
                this.vp.zoom * (this.position.x + this.size.x * i / (this.maxTicks - 1)),
                this.vp.zoom * (this.position.y + this.size.y * (1 - this.data[i].ec / this.maxValue.ec)));
    }
    this.vp.context.stroke();
};
