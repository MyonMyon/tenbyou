/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function Settings() {
}

/**
 * @param {String} key Key of the setting.
 * @return {String} Default state of the setting in string form.
 */
Settings.getDefault = function (key) {
    var m = {
        "sound.enabled": "true"
    };
    return m[key];
};

/**
 * @param {String} key Key of the setting.
 * @return {String} Type of the setting. Exaple: "boolean", "number", "string", "json".
 */
Settings.getType = function (key) {
    var m = {
        "sound.enabled": "boolean"
    };
    return m[key];
};

/**
 * @param {String} key Key of the setting.
 * @param {String} type Type of the setting. Not required.
 * @return {*} Value of the setting.
 */
Settings.get = function (key, type) {
    var value = localStorage.getItem("settings." + key);
    if (value === null) {
        value = Settings.getDefault(key);
    }
    type = type || Settings.getType(key);
    if (value === "null") {
        value = null;
    } else {
        switch (type) {
            case "number":
                value = +value;
                break;
            case "boolean":
                value = value === "true";
                break;
            case "json":
                value = JSON.parse(value || null);
                break;
        }
    }
    return value;
};

/**
 * Changes value of the setting.
 *
 * @param {String} key Key of the setting.
 * @param {*} value New value of the setting.
 */
Settings.set = function (key, value) {
    var lsKey = "settings." + key;
    if (Settings.getType(key) === "json") {
        localStorage.setItem(lsKey, JSON.stringify(value));
    } else {
        localStorage.setItem(lsKey, value);
    }
};

/**
 * Resets value of the setting to default one.
 *
 * @param {String} key Key of the setting.
 */
Settings.reset = function (key) {
    localStorage.removeItem("settings." + key);
};
