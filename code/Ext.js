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

//Polyfills:

if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        'use strict';
        if (this === null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count !== count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count === Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length === 0 || count === 0) {
            return '';
        }
        // Ensuring count is a 31-bit integer allows us to heavily optimize the
        // main part. But anyway, most current (August 2014) browsers can't handle
        // strings 1 << 28 chars or longer, so:
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var maxCount = str.length * count;
        count = Math.floor(Math.log(count) / Math.log(2));
        while (count) {
            str += str;
            count--;
        }
        str += str.substring(0, maxCount - str.length);
        return str;
    };
}
