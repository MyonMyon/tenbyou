var ENGINE_VER = "v0.3.07 (alpha)";

var CODE = [
    "Values",
    "Ext",
    "World",
    "EventChain",
    "ui/ViewPort",
    "ui/Menu",
    "ui/MainMenu",
    "ui/PauseMenu",
    "ui/Input",
    "entities/Entity",
    "entities/Player",
    "entities/Enemy",
    "entities/Projectile",
    "entities/Bonus",
    "entities/Particle",
    "entities/Text",
    "stage/Char",
    "stage/Boss",
    "stage/Spell",
    "stage/Stage"
];

/**
 * Loads specific scripts.
 *
 * @param {Array} nameArray Array of strings. Each string must be a valid file name with path but without extension.
 * @param {String} elementTag HTML Tag to contain resource ("script", "image").
 * @param {String} prefix Path prefix, which is added before each file name.
 * @param {String} postfix Path postfix, which is added after each file name.
 * @param {String} tag Tag to display in tab title during loading.
 * @param {Function} onFinish Function to execute after every script is loaded.
 */
function loadResources(nameArray, elementTag, prefix, postfix, tag, onFinish) {
    document.getElementsByTagName("title")[0].innerHTML = "Loading";
    var totalRes = nameArray.length;
    var loadedRes = 0;
    for (var i in nameArray) {
        var s = document.createElement(elementTag);
        s.src = prefix + nameArray[i] + postfix;
        s.onload = function () {
            loadedRes++;
            document.getElementsByTagName("title")[0].innerHTML = "Loading " + tag + " " + loadedRes + "/" + totalRes;
            if (loadedRes === totalRes) {
                onFinish();
            }
        };
        s.onerror = function () {
            console.error("Resource missing: " + this.src);
        };
        document.head.appendChild(s);
    }
}

/**
 * @returns {Array} Array of image resource files.
 */
function getImages() {
    var IMG = [];
    for (var i in IMAGE) {
        if (IMAGE[i].file) {
            IMG.push(IMAGE[i].file);
        }
    }
    for (var i in BOSS) {
        if (BOSS[i].sprite && BOSS[i].sprite.file) {
            IMG.push(BOSS[i].sprite.file);
        }
    }
    for (var i in CHAR) {
        if (CHAR[i].sprite && CHAR[i].sprite.file) {
            IMG.push(CHAR[i].sprite.file);
        }
    }
    for (var i in STAGE) {
        if (STAGE[i].background) {
            IMG.push(STAGE[i].background);
        }
    }
    for (var i in SPELL) {
        if (SPELL[i].customSpriteFiles) {
            IMG = IMG.concat(SPELL[i].customSpriteFiles);
        }
    }
    return IMG;
};

/**
 * Creates the viewport after all the scripts are loaded.
 */
function onLoad() {
    document.getElementsByTagName("title")[0].innerHTML = GAME_TITLE;
    new ViewPort();
}

loadResources(CODE, "script", "code/", ".js", "game code", function () {
    loadResources(getImages(), "img", IMAGE_FOLDER, "", "game resources", function () {
        onLoad();
    });
});
