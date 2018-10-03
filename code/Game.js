var ENGINE_VER = "v0.3.00 (alpha)";

var CODE = [
    "Values",
    "Ext",
    "ViewPort",
    "Menu",
    "World",
    "Input",
    "entities/Entity",
    "entities/Player",
    "entities/Enemy",
    "entities/Projectile",
    "entities/Bonus",
    "entities/Particle",
    "stage/Char",
    "stage/Boss",
    "stage/Spell",
    "stage/Stage"
];

/**
 * Loads specific scripts.
 *
 * @param {Array} nameArray Array of strings. Each string must be a valid file name with path but without extension.
 * @param {String} prefix Path prefix, which is added before each file name.
 * @param {String} tag Tag to display in tab title during loading.
 * @param {Function} onFinish Function to execute after every script is loaded.
 */
function loadScripts(nameArray, prefix, tag, onFinish) {
    document.getElementsByTagName("title")[0].innerHTML = "Loading";
    var totalScripts = nameArray.length;
    var loadedScripts = 0;
    for (var i in nameArray) {
        var s = document.createElement("script");
        s.src = prefix + nameArray[i] + ".js";
        s.onload = function () {
            loadedScripts++;
            document.getElementsByTagName("title")[0].innerHTML = "Loading " + tag + " " + loadedScripts + "/" + totalScripts;
            if (loadedScripts === totalScripts) {
                onFinish();
            }
        };
        s.onerror = function () {
            console.error("Script missing: " + this.src);
        };
        document.head.appendChild(s);
    }
}

/**
 * Creates the viewport after all the scripts are loaded.
 */
function onLoad() {
    document.getElementsByTagName("title")[0].innerHTML = "弾幕点描";
    new ViewPort();
}

loadScripts(CODE, "code/", "game code", function () {
    onLoad();
});
