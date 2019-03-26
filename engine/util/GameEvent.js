/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function GameEvent() {
}

GameEvent.RECURSION_LIMIT = 42;

/**
 * @param {Object} valuesObject Object with some additional information. Exampe: Player, Mob etc. Non-required in some cases.
 * @return {Array} Names of the ongoing events.
 */
GameEvent.getCurrentEvents = function (valuesObject) {
    let events = [];
    for (let i in EVENT) {
        if (GameEvent.resolveCondition(EVENT[i].condition, valuesObject)) {
            events.push(i);
        }
    }
    return events;
};

/**
 * @param {String} eventName Event name to check.
 * @param {Object} valuesObject Object with some additional information. Exampe: Player, Mob etc. Non-required in some cases.
 * @return {Array} Names of the ongoing events.
 */
GameEvent.checkEvent = function (eventName, valuesObject) {
    return GameEvent.resolveCondition(EVENT[eventName].condition, valuesObject);
};

/**
 * Recursive condition processor.
 *
 * @param {Object} conditionObject Object containing certain conditions. Example: {"month": {"comparison": "eq", "refValue": 1}, "day": ...}.
 * @param {Object} valuesObject Object with some additional information. Exampe: Player, Mob etc. Non-required in some cases.
 * @param {Number} recursionCount Used to prevent game freeze due to infinite loop. Only for inner usage.
 * @return {Boolean} Are conditions satisfied.
 */
GameEvent.resolveCondition = function (conditionObject, valuesObject, recursionCount = 0) {
    if (recursionCount > GameEvent.RECURSION_LIMIT) {
        console.error("Too much recursion");
        return false;
    }
    if (!conditionObject) {
        console.error("No condition");
        return false;
    }
    let andResult = true;
    for (let i in conditionObject) {
        if (i === "or") {
            let orResult = false;
            for (let j in conditionObject[i]) {
                orResult = orResult || GameEvent.resolveCondition(conditionObject[i][j], valuesObject, ++recursionCount);
                if (orResult) {
                    break;
                }
            }
            andResult = andResult && orResult;
        } else if (i === "events") {
            for (let item of conditionObject[i]) {
                if (!GameEvent.resolveCondition(EVENT[item].condition, valuesObject, ++recursionCount)) {
                    return false;
                }
            }
        } else {
            let value = GameEvent.getValueFromName(i, conditionObject[i], valuesObject);
            andResult = andResult && GameEvent.compare(value, conditionObject[i]);
        }
    }
    return andResult;
};

/**
 * @param {String} valueName Name of the value to be compared. Example: "day", "month", "weekday".
 * @param {Object} comparisonObject NOT USED YET! Object containing comparison type, reference value etc. Example: {"comparison": "eq", "refValue": 1}.
 * @param {Object} valuesObject NOT USED YET! Object with some additional information. Exampe: Player, Mob etc. Non-required in some cases.
 * @return {*} Value for further comparison
 **/
GameEvent.getValueFromName = function (valueName, comparisonObject, valuesObject) {
    let value;
    let date = new Date();
    switch (valueName) {
        case "year":
            value = date.getFullYear();
            break;
        case "weekday":
            value = date.getDay();
            break;
        case "month":
            value = date.getMonth() + 1;
            break;
        case "day":
            value = date.getDate();
            break;
        case "counter":
        case "setting":
        case "playable":
        case "char":
            break;
        case "moon":
            value = Util.toMoonPhase(date);
            break;
        default:
            console.error("Wrong value name: " + valueName);
            return;
    }
    return value;
};

/**
 * @param {*} value Value to be compared. Usually it's a number, but really could be anything.
 * @param {Object} comparisonObject Object containing comparison type, reference value etc. Example: {"comparison": "eq", "refValue": 1}.
 * @return {Boolean} Result of the comparison.
 */
GameEvent.compare = function (value, comparisonObject) {
    let comparison = comparisonObject.comparison;
    if (comparison && comparison.indexOf("char") === 0) {
        comparison = comparison.replace("char", "");
        value += "";
        let cp = comparisonObject.charPosition;
        if (cp < 0) {
            cp += value.length;
        }
        let char = null;
        if (cp >= 0 && cp < value.length) {
            char = value[cp];
        }
        value = char;
    }
    if (Array.isArray(value)) {
        value = value.length;
    }
    switch (comparison) {
        case undefined:
        case "eq":
            if (comparisonObject.refValue === undefined) {
                return value === comparisonObject;
            }
            return value === comparisonObject.refValue;
        case "neq":
            return value !== comparisonObject.refValue;
        case "gt":
            return value > comparisonObject.refValue;
        case "gte":
            return value >= comparisonObject.refValue;
        case "lt":
            return value < comparisonObject.refValue;
        case "lte":
            return value <= comparisonObject.refValue;
        case "div":
            return value % comparisonObject.refValue === 0;
        case "ndiv":
            return value % comparisonObject.refValue !== 0;
        case "in":
            return comparisonObject.refValue.indexOf(value) !== -1;
        case "between":
            return value >= comparisonObject.refValue[0] && value <= comparisonObject.refValue[1];
        case "beyond":
            return value < comparisonObject.refValue[0] || value > comparisonObject.refValue[1];
        default:
            console.error("No such comparison: " + comparisonObject.comparison);
            return;
    }
};
