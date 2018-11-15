/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function Locale() {
}

/**
 * Chooses appropriate locale if not set or non-existent.
 */
Locale.setPreferred = function () {
    //var locale = Settings.get("locale");
    //if (!locale || !LOCALES[locale]) {
        for (var i in navigator.languages) {
            var code = navigator.languages[i];
            if (LOCALES[code]) {
                CURRENT_LOCALE = code;
                //Settings.set("locale", code);
                return;
            }
        }
        CURRENT_LOCALE = DEFAULT_LOCALE;
        //Settings.set("locale", DEFAULT_LOCALE);
    //}
};

/**
 * Localizes string for current locale with argument substitution.
 * An argument substitution function can process multiple attributes, example:
 *  LOCALE.en["something"] = "All your {0} are belong to {1}";
 *  Locale.get("something", "base", "us");
 * This will result in "All your base are belong to us".
 *
 * @param {String} key Localization key.
 * @param {String...} [arguments] Replacement arguments for {0}, {1} etc.
 * @return {String} Localized string. If no key found returns string with question mark and the key.
 */
Locale.get = function (key) {
    var localized = Locale.getSimple(key, true) || "?" + key;
    for (var i in arguments) {
        if (i > 0) {
            localized = Locale.replaceArgById(localized, i - 1, arguments[i]);
        }
    }
    return localized;
};

/**
 * Localizes string for current locale with argument substitution.
 *
 * @param {String} key Localization key.
 * @param {String...} [arguments] Replacement arguments for {0}, {1} etc.
 * @return {String} Localized string. If no key found returns null.
 */
Locale.getOrFail = function (key) {
    var localized = Locale.getSimple(key, false);
    if (!localized)
        return null;
    for (var i in arguments) {
        if (i > 0) {
            localized = Locale.replaceArgById(localized, i - 1, arguments[i]);
        }
    }
    return localized;
};

/**
 * Localizes string for current locale without argument substitution.
 *
 * @param {String} key Localization key.
 * @param {Boolean} useFallback Use default locale as a fallback.
 * @return {String} Localized string or fallback.
 */
Locale.getSimple = function (key, useFallback) {
    var l = LOCALES[CURRENT_LOCALE];
    //if (!l) {
    //    Settings.reset("locale");
    //    l = LOCALES[Settings.get("locale")];
    //}
    if (!l[key] && useFallback) {
        return LOCALES[DEFAULT_LOCALE][key];
    }
    return l[key];
};

/**
 * Localizes string for defined locale without argument substitution.
 *
 * @param {String} key Localization key.
 * @param {String} locale Locale code.
 * @param {Boolean} fail Return null if no key found. If not set, the function returns string with question mark and the key.
 * @return {String} Localized string.
 */
Locale.getInLocale = function (key, locale, fail) {
    if (LOCALES[locale] && LOCALES[locale][key])
        return LOCALES[locale][key];
    if (fail)
        return null;
    return ("?" + key);
};

/**
 * @param {String} locale Locale code.
 * @return {Number} Summary count of labels in locale.
 */
Locale.getLocalizedKeysCount = function (locale) {
    var localized = 0;
    var nonRequiredLinesRegexp = /(^key\..*|^taglines.*|.*\.short$)/;
    for (var i in LOCALES[locale]) {
        if (!nonRequiredLinesRegexp.test(i)) {
            localized++;
        }
    }
    return localized;
};

/**
 * Replaces value within braces by required value (argument).
 *
 * @param {String} inputString String to change.
 * @param {Number} argId Number, enclosed into braces.
 * @param {String} replacement Replacement argument for {0}, {1} etc.
 * @return {String} Processed string.
 */
Locale.replaceArgById = function (inputString, argId, replacement) {
    var result = inputString.replace(new RegExp("\\{" + (argId) + "\\}", "g"), replacement);
    var pVariants = Locale.parseBraces(inputString, "plural", argId);
    var rules = LOCALES[CURRENT_LOCALE].rules;
    if (rules && rules["plural"]) {
        for (var i in rules["plural"]) {
            var rule = rules["plural"][i];
            var match = true;
            for (var j in rule) {
                match &= Locale.compare(replacement + "", rule[j]);
            }
            if (match) {
                break;
            }
        }
        result = result.replace(new RegExp("\\{plural\\|" + (argId) + "\\|[^\\}]*\\}", "g"), pVariants[i - 1]);
    }
    return result;
};

/**
 * Converts from strings like "You have {0} {plural|0|message|messages}!" to arrays like ["message", "messages"].
 *
 * @param {String} inputString String to search.
 * @param {String} operation Operation of expression, example: "plural".
 * @param {Number} argId Number, enclosed into braces.
 * @returns {Array} Array of options inside the braces.
 */
Locale.parseBraces = function (inputString, operation, argId) {
    var arr = [];
    //Warning: convinient naming area below!
    var split = inputString.split("{" + operation + "|" + argId + "|")[1];
    if (split) {
        split = split.split("}")[0];
        if (split) {
            arr = split.split("|");
        }
    }
    return arr;
};

/**
 * @param {*} value Value to be compared. Usually it's a number, but really could be anything.
 * @param {Object} comparisonObject Object containing comparison type, reference value etc. Example: {"comparison": "eq", "refValue": 1}.
 * @return {Boolean} Result of the comparison.
 */
Locale.compare = function (value, comparisonObject) {
    var comparison = comparisonObject.comparison;
    if (comparison && comparison.indexOf("char") === 0) {
        comparison = comparison.replace("char", "");
        value += "";
        var cp = comparisonObject.charPosition;
        if (cp < 0) {
            cp += value.length;
        }
        var char = null;
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
