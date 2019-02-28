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
 * @param {Number} angle1 Origin angle.
 * @param {Number} angle2 Target angle.
 * @return {Boolean} Is it faster to turn angle1 position clockwise than counterclockwise to reach angle2.
 */
Util.isClockwiseNearest = function (angle1, angle2) {
    //Narrow angle to [-2PI:+2PI]:
    angle1 = angle1 % (Math.PI * 2);
    angle2 = angle2 % (Math.PI * 2);

    //Narrow angle to (0:+2PI]:
    if (angle1 <= 0) {
        angle1 += Math.PI * 2;
    }
    if (angle2 <= 0) {
        angle2 += Math.PI * 2;
    }

    var diff = angle2 - angle1;

    var invert = diff > 0;
    diff = Math.abs(diff);
    return (diff > Math.PI) !== invert;
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

Util.vectorLength = function (x, y) {
    return Math.sqrt(x * x + y * y);
};

Util.angleBetweenEntities = function (entity1, entity2) {
    return Math.atan2(entity2.y - entity1.y, entity2.x - entity1.x);
};

Util.collisionCheck = function (entity1, entity2, distance) {
    distance = (distance || 0) + entity1.width + entity2.width;
    if (Math.abs(entity1.x - entity2.x) > distance || Math.abs(entity1.y - entity2.y) > distance) {
        return false;
    }
    return Util.distanceBetweenEntities(entity1, entity2) < distance;
};

Util.collisionCheckBeam = function (entityPoint, entityBeam, distance) {
    var x1 = entityBeam.x;
    var y1 = entityBeam.y;
    var x2 = x1 + Math.cos(entityBeam.a0) * entityBeam.length;
    var y2 = y1 + Math.sin(entityBeam.a0) * entityBeam.length;
    distance = (distance || 0) + entityPoint.width + entityBeam.width;
    if (entityPoint.x > x1 + distance && entityPoint.x > x2 + distance ||
            entityPoint.x < x1 - distance && entityPoint.x < x2 - distance ||
            entityPoint.y > y1 + distance && entityPoint.y > y2 + distance ||
            entityPoint.y < y1 - distance && entityPoint.y < y2 - distance) {
        return false;
    }
    return Util.distanceBetweenPointAndSegment(entityPoint.x, entityPoint.y, x1, y1, x2, y2) < distance;
};

Util.distanceBetweenEntities = function (entity1, entity2) {
    return Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));
};

Util.distanceBetweenPoints = function (point1x, point1y, point2x, point2y) {
    return Math.sqrt(Math.pow(point1x - point2x, 2) + Math.pow(point1y - point2y, 2));
};

Util.distanceBetweenPointAndSegment = function (pointX, pointY, segment1x, segment1y, segment2x, segment2y) {
    return Math.abs((segment2y - segment1y) * pointX - (segment2x - segment1x) * pointY + segment2x * segment1y - segment2y * segment1x) /
            Math.sqrt(Math.pow(segment2x - segment1x, 2) + Math.pow(segment2y - segment1y, 2));
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

/**
 * @param {Date} date Desired date.
 * @return {Number} Moon phase from 0 incusively (new moon) to 2 exclusively (next new moon). 1 is full moon.
 */
Util.toMoonPhase = function (date) {
    var timestamp = Math.floor(date.valueOf() / 1000);
    timestamp -= Util.LUNATION_1_TIMESTAMP;
    return (timestamp % Util.SYNODIC_MONTH_SECONDS) / Util.SYNODIC_MONTH_SECONDS * 2;
};
