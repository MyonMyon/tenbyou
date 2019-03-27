/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function Util() {
}

/**
 * Processes number to be in given bounds.
 *
 * @param {Number} min Minimal value to output.
 * @param {Number} value Input value.
 * @param {Number} max Maximal value to output.
 * @return {Number} Bounded value.
 */
Util.bound = function (min, value, max) {
    return Math.min(max, Math.max(min, value));
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
    let angles = "eswn";
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

    let diff = angle2 - angle1;

    let invert = diff > 0;
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
    let a = [];
    for (let item of compass) {
        a.push(Util.toAngle(item));
    }
    return Util.meanAngle.apply(null, a);
};

/**
 * @param {...Number} angles Angles (in radians) to be processed.
 * @return {Number} Mean angle.
 */
Util.meanAngle = function (...angles) {
    let n = angles.length;
    let a = Object.values(angles);
    return (Math.atan2(
        Util.sum(a.map(Math.sin)) / n,
        Util.sum(a.map(Math.cos)) / n)
        + Math.PI * 2) % (Math.PI * 2);
};

/**
 * @param {...Array|Number} args Any numbers you like. Or an array.
 * @return {Number} Sum of arguments.
 */
Util.sum = function (...args) {
    let a;
    if (args[0] && args[0].length) {
        a = args[0];
    } else {
        a = Object.values(args);
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
    let x1 = entityBeam.x;
    let y1 = entityBeam.y;
    let x2 = x1 + Math.cos(entityBeam.a0) * entityBeam.length;
    let y2 = y1 + Math.sin(entityBeam.a0) * entityBeam.length;
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
    return Math.sqrt((entity1.x - entity2.x) ** 2 + (entity1.y - entity2.y) ** 2);
};

Util.distanceBetweenPoints = function (point1x, point1y, point2x, point2y) {
    return Math.sqrt((point1x - point2x) ** 2 + (point1y - point2y) ** 2);
};

Util.distanceBetweenPointAndSegment = function (pointX, pointY, segment1x, segment1y, segment2x, segment2y) {
    return Math.abs((segment2y - segment1y) * pointX - (segment2x - segment1x) * pointY + segment2x * segment1y - segment2y * segment1x) /
        Math.sqrt((segment2x - segment1x) ** 2 + (segment2y - segment1y) ** 2);
};

/**
 * Translates UNIX timestamp to datetime string representation.
 *
 * @param {Number} timestamp Count of seconds since UNIX epoch.
 * @param {String} format Desired string format. Example: "MM/DD/YYYY hh:mm:ss". Default is "YYYY-MM-DD".
 * @return {String} String in defined format.
 */
Util.formatAsDateTime = function (timestamp, format = "YYYY-MM-DD") {
    const strings = {
        "YYYY": { func: "fullYear" },
        "YY": { func: "fullYear", fill: 2 },
        "MM": { func: "month", addition: 1, fill: 2 },
        "M": { func: "month", addition: 1 },
        "DD": { func: "date", fill: 2 },
        "D": { func: "date" },
        "hh": { func: "hours", fill: 2 },
        "h": { func: "hours" },
        "mm": { func: "minutes", fill: 2 },
        "m": { func: "minutes" },
        "ss": { func: "seconds", fill: 2 },
        "s": { func: "seconds" }
    };
    let date = new Date(timestamp * 1000);
    let result = format;
    for (let i in strings) {
        let replacement = date["get" + strings[i].func.toTitleCase()]();
        if (strings[i].addition) {
            replacement += strings[i].addition;
        }
        if (strings[i].fill) {
            replacement += "";
            replacement = replacement.padStart(strings[i].fill, "0").slice(-strings[i].fill);
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
    let timestamp = Math.floor(date.valueOf() / 1000);
    timestamp -= Util.LUNATION_1_TIMESTAMP;
    return (timestamp % Util.SYNODIC_MONTH_SECONDS) / Util.SYNODIC_MONTH_SECONDS * 2;
};
