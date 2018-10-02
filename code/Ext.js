/**
 * Implementation of OOP-like way to extend classes.
 *
 * @param {Object} child Destination for properties/methods.
 * @param {Object} parent Source of properties/methods.
 * @returns {Object} Child object. Not used.
 */
extend = function (child, parent) {
    for (var property in parent) {
        if (!child[property]) {
            child[property] = parent[property];
        } else {
            //super-modifier to call overrided functions
            child["$" + property] = parent[property];
        }
    }
    if (!child.classes) {
        child.classes = [];
    }
    //I'm very sorry:
    child.classes.push(child.constructor.toString().split("function ")[1].split("(")[0]);
    //Some workaround I guess?
    if (child.init) {
        child.init();
    }
    return child;
};

/**
 * Capitalizes first character of the string.
 *
 * @return {String} New string containing processed text.
 */
Object.defineProperty(String.prototype, "toTitleCase", {
    enumerable: false,
    value: function () {
        if (this.length === 0) {
            return "";
        }
        return this[0].toUpperCase() + this.slice(1);
    }
});
