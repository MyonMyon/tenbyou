var ENGINE_VER = "0.4.16";
var RELEASE_DATE = "2018-11-29";
var REVISION_INNER = 3;
var REVISION_TOTAL = 399;

var CODE_PRIORITY = [
    "Ext",
    "game/Values",
    "ui/ViewPort"
];

var CODE = [
    "World",
    "EventChain",
    "SpriteHandler",
    "ui/Menu",
    "ui/MainMenu",
    "ui/PauseMenu",
    "ui/Input",
    "ui/PerformanceChart",
    "entities/Entity",
    "entities/Player",
    "entities/Weapon",
    "entities/Enemy",
    "entities/Projectile",
    "entities/Bonus",
    "entities/Particle",
    "entities/Text",
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
 * @param {Object} loadingTextHandler Object with loadingText property to be set from here.
 * @param {Function} onFinish Function to execute after every script is loaded.
 */
function loadResources(nameArray, elementTag, prefix, postfix, tag, loadingTextHandler, onFinish) {
    document.getElementsByTagName("title")[0].innerHTML = "Loading";
    var totalRes = nameArray.length;
    var loadedRes = 0;
    var fail = false;
    mainLoop: for (var i in nameArray) {
        var s = document.createElement(elementTag);
        if (nameArray[i].file) {
            for (var j in nameArray) {
                var nj = nameArray[j];
                if (nj.object && nj.file === nameArray[i].file) {
                    nameArray[i].object = nj.object;
                    loadedRes++; //I know the count is wrong...
                    continue mainLoop;
                }
            }
            nameArray[i].object = s;
        }
        s.src = prefix + (nameArray[i].file || nameArray[i]) + postfix;
        s.onload = function () {
            loadedRes++;
            document.getElementsByTagName("title")[0].innerHTML = "Loading " + tag + " " + loadedRes + "/" + totalRes;
            if (loadingTextHandler && !fail) {
                loadingTextHandler.loadingText = tag.toTitleCase() + " " + loadedRes + "/" + totalRes;
            }
            if (loadedRes === totalRes) {
                onFinish();
            }
        };
        s.onerror = function () {
            fail = true;
            if (loadingTextHandler) {
                loadingTextHandler.loadingText = "Resource missing: " + this.src;
            }
        };
        document.head.appendChild(s);
    }
}

function getFont(data) {
    var obj = {
        "font-family": data.name,
        "src": "url(" + FONT_FOLDER + data.file + ")"
    };
    var s = document.getElementsByTagName("style")[0];
    s.innerHTML += "\n@font-face " + JSON.stringify(obj).replace(/,/g, ";").replace(/\"/g, "");
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
        //and... one level deeper:
        for (var j in SPRITE[i]) {
            if (SPRITE[i][j].file) {
                IMG.push(SPRITE[i][j]);
            }
        }
    }
    for (var i in STAGE) {
        if (STAGE[i].background) {
            IMG.push(STAGE[i].background);
        }
    }
    for (var i in SPELL) {
        if (SPELL[i].background) {
            IMG.push(SPELL[i].background);
        }
    }
    return IMG;
}

/**
 * Creates the viewport after all the scripts are loaded.
 */
function onLoad() {
    document.getElementsByTagName("title")[0].innerHTML = GAME_TITLE;
}

loadResources(CODE_PRIORITY, "script", "code/", ".js", "game code (priority)", null, function () {
    for (var i in FONT_FILES) {
        getFont(FONT_FILES[i]);
    }
    var vp = new ViewPort();
    loadResources(CODE, "script", "code/", ".js", "game code", vp, function () {
        loadResources(getImages(), "img", SPRITE_FOLDER, "", "game resources", vp, function () {
            onLoad();
            vp.onLoad();
        });
    });
});
