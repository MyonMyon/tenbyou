var ENGINE_VERSION = "0.4.43";
var RELEASE_DATE = "2018-12-11";
var REVISION_INNER = 6;
var REVISION_TOTAL = 505;

var PRIORITY_CODE = [
    "engine/Ext",
    "game/Values",
    "engine/ui/ViewPort"
];

var ENGINE_CODE = [
    "World",
    "EventChain",
    "Util",
    "SpriteHandler",
    "ui/menu/Menu",
    "ui/menu/MainMenu",
    "ui/menu/PauseMenu",
    "ui/Input",
    "ui/PerformanceChart",
    "entities/Entity",
    "entities/Player",
    "entities/Weapon",
    "entities/Enemy",
    "entities/Projectile",
    "entities/Bonus",
    "entities/Particle",
    "entities/Text"
];

var GAME_CODE = [
    "Char",
    "Boss",
    "Spell",
    "Stage",
    "Sprite"
];

var IMAGE_LOAD = [{
        object: "SPRITE",
        itemProp: "file",
        push: true,
        checkInside: true
    }, {
        object: "STAGE",
        itemProp: "background"
    }, {
        object: "SPELL",
        itemProp: "background"
    }];

function init() {
    if (!localStorage.getItem("reloaded")) {
        localStorage.setItem("reloaded", true);
        location.reload(false);
        return;
    }
    localStorage.removeItem("reloaded");

    loadResources(PRIORITY_CODE, "script", "", ".js", "priority code", null, function () {
        for (var i in FONT_FILES) {
            getFont(FONT_FILES[i]);
        }
        var vp = new ViewPort();
        loadResources(ENGINE_CODE, "script", "engine/", ".js", "engine code", vp, function () {
            getIcon(ICON);
            loadResources(GAME_CODE, "script", "game/", ".js", "game code", vp, function () {
                loadResources(getImages(), "img", SPRITE_FOLDER, "", "game resources", vp, function () {
                    onLoad();
                    vp.onLoad();
                });
            });
        });
    });

}

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
        s.src = prefix + (nameArray[i].file || nameArray[i]) + postfix + "?v=" + ENGINE_VERSION;
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

function getIcon() {
    var MIME = {
        "ico": "image/x-icon",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "svg": "image/svg+xml"
    };
    var s = document.createElement("link");
    s.rel = "shortcut icon";
    s.href = ICON + "?v=" + ENGINE_VERSION;
    s.type = MIME[ICON.split(".")[1]];
    document.head.appendChild(s);
}

function getFont(data) {
    var obj = {
        "font-family": data.name,
        "src": "url(" + FONT_FOLDER + data.file + "?v=" + ENGINE_VERSION + ")"
    };
    var s = document.getElementsByTagName("style")[0];
    s.innerHTML += "\n@font-face " + JSON.stringify(obj).replace(/,/g, ";").replace(/\"/g, "");
}

/**
 * @returns {Array} Array of image resource files.
 */
function getImages() {
    var IMG = [];
    for (var s in IMAGE_LOAD) {
        var data = IMAGE_LOAD[s];
        var o = window[data.object];
        for (var i in o) {
            getImage(o[i], data, IMG);
            if (data.checkInside) {
                //and... one level deeper:
                for (var j in o[i]) {
                    getImage(o[i][j], data, IMG);
                }
            }
        }
    }
    return IMG;
}

function getImage(item, data, array) {
    if (item[data.itemProp]) {
        if (data.push) {
            array.push(item);
        } else {
            array.push(item[data.itemProp]);
        }
    }
}

/**
 * Creates the viewport after all the scripts are loaded.
 */
function onLoad() {
    document.getElementsByTagName("title")[0].innerHTML = GAME_TITLE;
}

init();
