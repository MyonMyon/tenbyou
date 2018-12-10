/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function Util() {
}

/**
 * @param {Number|Array|Function} data Value to extract.
 * @param {Number} iteration Iteration #.
 * @return {Number} Processed data.
 */
Util.iterate = function (data, iteration) {
    if (typeof data === "object") {
        return data[iteration % data.length];
    }
    if (typeof data === "function") {
        return data(iteration);
    }
    return data;
};

/**
 * @param {String} compass "nnw", "se", "n" etc. Allows any length, however last 2 letters shouldn't be same, since the parsing comes from the end;
 * @return {Number} Angle in radians.
 */
Util.toAngle = function (compass) {
    compass = compass.toLowerCase();
    var angles = "eswn";
    if (compass.length === 1) {
        return angles.indexOf(compass) * Math.PI / 2;
    }
    return Util.meanAngle(Util.toAngle(compass[0]), Util.toAngle(compass.slice(1)));
};

/**
 * @param {Number...} [arguments] Angles (in radians) to be processed.
 * @return {Number} Mean angle.
 */
Util.meanAngle = function () {
    var n = arguments.length;
    var a = Object.values(arguments);
    return (Math.atan2(
            Util.sum(a.map(Math.sin)) / n,
            Util.sum(a.map(Math.cos)) / n)
            + Math.PI * 2) % (Math.PI * 2);
};

/**
 * @param {Array|Number...} [arguments] Any numbers you like. Or an array.
 * @return {Number} Sum of arguments.
 */
Util.sum = function () {
    if (arguments[0] && arguments[0].length) {
        var a = arguments[0];
    } else {
        var a = Object.values(arguments);
    }
    return a.reduce(function (acc, val) {
        return acc + val;
    });
};
