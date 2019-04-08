const ENGINE_VERSION = "0.5.59";
const RELEASE_DATE = "2019-04-08";
const REVISION_INNER = 3;
const REVISION_TOTAL = 735;

const PRIORITY_CODE = [
    "game/Values",
    "engine/ui/ViewPort",
    "engine/ResourceManager"
];

const ENGINE_CODE = [
    "Ext",
    "World",
    "EventChain",
    "SpriteHandler",
    "util/Util",
    "util/Settings",
    "util/Sound",
    "util/GameEvent",
    "util/Random",
    "ui/menu/Menu",
    "ui/menu/MainMenu",
    "ui/menu/PauseMenu",
    "ui/Dialogue",
    "ui/Input",
    "ui/PerformanceChart",
    "entities/Entity",
    "entities/Player",
    "entities/Weapon",
    "entities/Enemy",
    "entities/Projectile",
    "entities/Beam",
    "entities/Bonus",
    "entities/Particle",
    "entities/Text"
];

const GAME_CODE = [
    "Char",
    "Attack",
    "Stage",
    "Sprite",
    "Roll",
    "Event",
    "Menu"
];

function init() {
    try {
        if (!localStorage.getItem("reloaded")) {
            localStorage.setItem("reloaded", true);
            location.reload(false);
            return;
        }
        localStorage.removeItem("reloaded");
    } catch (ex) {
        console.error(ex);
    }
    let vp;
    let loadPriority = function () {
        loadResources(PRIORITY_CODE, "script", "", ".js", "priority code", null, loadEngine);
    };
    let loadEngine = function () {
        for (let i in FONT_FILES) {
            getFont(FONT_FILES[i]);
        }
        vp = new ViewPort();
        loadResources(ENGINE_CODE, "script", "engine/", ".js", "engine code", vp, loadGame, true);
    };
    let loadGame = function () {
        getIcon(ICON);
        loadResources(GAME_CODE, "script", "game/", ".js", "game code", vp, loadAssets, true);
    };
    let loadAssets = function() {
        vp.res = new ResourceManager(vp);
        vp.res.onLoad = loadEnd;
    }
    let loadEnd = function () {
        onLoad();
        vp.onLoad();
    };

    loadPriority();
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
 * @param {Boolean} sync Load every element in the given order.
 * @param {Number} resAdd Number added to loaded and total count of resources.
 */
function loadResources(nameArray, elementTag, prefix, postfix, tag, loadingTextHandler, onFinish, sync, resAdd = 0) {
    document.getElementsByTagName("title")[0].innerHTML = "Loading";
    let totalRes = nameArray.length + resAdd;
    let loadedRes = resAdd;
    let fail = false;
    mainLoop: for (let name of nameArray) {
        let s = document.createElement(elementTag);
        if (name.file) {
            for (let name2 in nameArray) {
                if (name2.object && name2.file === name.file) {
                    name.object = name2.object;
                    loadedRes++; //I know the count is wrong...
                    continue mainLoop;
                }
            }
            name.object = s;
        }
        s.src = prefix + (name.file || name) + postfix + "?v=" + ENGINE_VERSION;

        s.onload = function () {
            loadedRes++;
            document.getElementsByTagName("title")[0].innerHTML = "Loading " + tag + " " + loadedRes + "/" + totalRes;
            if (loadingTextHandler && !fail) {
                loadingTextHandler.loadingText = tag.toTitleCase() + " " + loadedRes + "/" + totalRes;
            }
            if (loadedRes === totalRes) {
                onFinish();
                return;
            }
            if (sync) {
                loadResources(nameArray.slice(1), elementTag, prefix, postfix, tag, loadingTextHandler, onFinish, sync, resAdd + 1);
            }
        };
        s.onerror = function () {
            fail = true;
            if (loadingTextHandler) {
                loadingTextHandler.loadingText = "Resource missing: " + this.src;
            }
        };
        document.head.appendChild(s);
        if (sync) {
            break;
        }
    }
}

function getIcon() {
    const MIME = {
        "ico": "image/x-icon",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "svg": "image/svg+xml"
    };
    let s = document.createElement("link");
    s.rel = "shortcut icon";
    s.href = ICON + "?v=" + ENGINE_VERSION;
    s.type = MIME[ICON.split(".")[1]];
    document.head.appendChild(s);
}

function getFont(data) {
    let obj = {
        "font-family": data.name,
        "src": "url(" + FONT_FOLDER + data.file + "?v=" + ENGINE_VERSION + ")"
    };
    let s = document.getElementsByTagName("style")[0];
    s.innerHTML += "\n@font-face " + JSON.stringify(obj).replace(/,/g, ";").replace(/\"/g, "");
}

/**
 * Creates the viewport after all the scripts are loaded.
 */
function onLoad() {
    document.getElementsByTagName("title")[0].innerHTML = GAME_TITLE;
}

init();
