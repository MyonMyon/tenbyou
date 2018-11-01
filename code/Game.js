var ENGINE_VER = "v0.3.14 (alpha)";

var CODE = [
    "Ext",
    "World",
    "EventChain",
    "SpriteHandler",
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
    "game/Values",
    "game/Char",
    "game/Boss",
    "game/Spell",
    "game/Stage",
    "game/Sprite"
];

/**
 * Loads specific scripts.
 *
 * @param {Array} nameArray Array of strings (or objects containing "file" property).
 * Each string must be a valid file name with path, may omit extension.
 * @param {String} elementTag HTML Tag to contain resource ("script", "image").
 * @param {String} prefix Path prefix, which is added before each file name.
 * @param {String} postfix Path postfix, which is added after each file name. Usually, file extension.
 * @param {String} tag Tag to display in tab title during loading.
 * @param {Function} onFinish Function to execute after every script is loaded.
 */
function loadResources(nameArray, elementTag, prefix, postfix, tag, onFinish) {
    document.getElementsByTagName("title")[0].innerHTML = "Loading";
    var totalRes = nameArray.length;
    var loadedRes = 0;
    for (var i in nameArray) {
        var s = document.createElement(elementTag);
        s.src = prefix + (nameArray[i].file || nameArray[i]) + postfix;
        if (nameArray[i].file) {
            nameArray[i].object = s;
        }
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
    for (var i in SPRITE) {
        if (SPRITE[i].file) {
            IMG.push(SPRITE[i]);
        }
    }
    for (var i in BOSS) {
        if (BOSS[i].sprite && BOSS[i].sprite.file) {
            IMG.push(BOSS[i].sprite);
        }
    }
    for (var i in CHAR) {
        if (CHAR[i].sprite && CHAR[i].sprite.file) {
            IMG.push(CHAR[i].sprite);
        }
    }
    for (var i in STAGE) {
        if (STAGE[i].background) {
            IMG.push(STAGE[i].background);
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
    loadResources(getImages(), "img", SPRITE_FOLDER, "", "game resources", function () {
        onLoad();
    });
});
