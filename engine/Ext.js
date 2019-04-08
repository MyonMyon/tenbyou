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
