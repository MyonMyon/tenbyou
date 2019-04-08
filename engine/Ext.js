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
        return this.replace(/\w\S*/g, function(txt){
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
});
