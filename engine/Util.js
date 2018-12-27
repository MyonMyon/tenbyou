/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function Util() {
}

/**
 * @param {Number} data Value to fill up.
 * @param {Number} length Number of digits to output.
 * @param {Boolean} overflowSlice If true, cuts resulting string starting with leading digits to the specified length.
 * @return {String} String representation of value with requiered number of digits.
 */
Util.fillWithLeadingZeros = function (data, length, overflowSlice) {
    var d = data.toString();
    while (d.length < length) {
        d = "0" + d;
    }
    if (overflowSlice) {
        d = d.slice(-length);
    }
    return d;
};

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
 * @param {String} compass "nnw", "se", "n" etc. Allows any length, however last 2 letters shouldn't be same, since the parsing comes from the end.
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
 * @param {String} compass Throw any shit in here!
 * @return {Number} Angle in radians.
 */
Util.toMeanAngle = function (compass) {
    if (!compass) {
        return null;
    }
    var a = [];
    for (var i in compass) {
        a.push(Util.toAngle(compass[i]));
    }
    return Util.meanAngle.apply(null, a);
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

/**
 * Translates UNIX timestamp to datetime string representation.
 *
 * @param {Number} timestamp Count of seconds since UNIX epoch.
 * @param {String} format Desired string format. Example: "MM/DD/YYYY hh:mm:ss". Default is "YYYY-MM-DD".
 * @return {String} String in defined format.
 */
Util.formatAsDateTime = function (timestamp, format) {
    var strings = {
        "YYYY": {func: "fullYear"},
        "YY": {func: "fullYear", fill: 2},
        "MM": {func: "month", addition: 1, fill: 2},
        "M": {func: "month", addition: 1},
        "DD": {func: "date", fill: 2},
        "D": {func: "date"},
        "hh": {func: "hours", fill: 2},
        "h": {func: "hours"},
        "mm": {func: "minutes", fill: 2},
        "m": {func: "minutes"},
        "ss": {func: "seconds", fill: 2},
        "s": {func: "seconds"}
    };
    var date = new Date(timestamp * 1000);
    var result = format || "YYYY-MM-DD";
    for (var i in strings) {
        var replacement = date["get" + strings[i].func.toTitleCase()]();
        if (strings[i].addition) {
            replacement += strings[i].addition;
        }
        if (strings[i].fill) {
            replacement = Util.fillWithLeadingZeros(replacement, strings[i].fill, true);
        }
        result = result.replace(i, replacement);
    }
    return result;
};
