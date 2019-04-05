var CUT_IN = {};

const IMAGE_LOAD = [{
    object: "SPRITE",
    itemProp: "file",
    push: true,
    checkInside: true
}, {
    object: "ROLL",
    push: true,
    itemProp: "file"
}, {
    object: "STAGE",
    itemProp: "background"
}, {
    object: "SPELL",
    itemProp: "background"
}, {
    object: "CUT_IN",
    itemProp: "file",
    push: true,
    checkInside: true
}, {
    object: "EVENT_RES",
    itemProp: "file",
    push: true
}];

const SFX_LOAD = [{
    object: "SFX",
    itemProp: "file",
    push: true,
    checkInside: true
}];

class ResourceManager {
    constructor(vp) {
        this.sprite = {};
        this.sfx = {};
        this.vp = vp;

        let self = this;
        let loadSprites = function () {
            self.getCutIns();
            self.load(self.processFiles(IMAGE_LOAD), "img", SPRITE_FOLDER, "", "sprites", loadSfx);
        }
        let loadSfx = function () {
            self.load(self.processFiles(SFX_LOAD), "audio", SFX_FOLDER, "", "SFX", self.onLoad);
        };
        loadSprites();
    }

    /**
     * Loads specific files.
     * TO DO: Remove copypasta from Init.js.
     *
     * @param {Array} nameArray Array of strings (or objects containing "file" property).
     * Each string must be a valid file name with path, may omit extension.
     * @param {String} elementTag HTML Tag to contain resource ("script", "image").
     * @param {String} prefix Path prefix, which is added before each file name.
     * @param {String} postfix Path postfix, which is added after each file name. Usually, file extension.
     * @param {String} tag Tag to display in tab title during loading.
     * @param {Function} onFinish Function to execute after every script is loaded.
     * @param {Boolean} sync Load every element in the given order.
     * @param {Number} resAdd Number added to loaded and total count of resources.
     */
    load(nameArray, elementTag, prefix, postfix, tag, onFinish, sync, resAdd = 0) {
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

            let success = elementTag === "audio" ? "onloadeddata" : "onload";
            let self = this;
            s[success] = function () {
                loadedRes++;
                document.getElementsByTagName("title")[0].innerHTML = "Loading " + tag + " " + loadedRes + "/" + totalRes;
                if (!fail) {
                    self.vp.loadingText = tag.toTitleCase() + " " + loadedRes + "/" + totalRes;
                }
                if (loadedRes === totalRes) {
                    onFinish();
                    return;
                }
                if (sync) {
                    self.load(nameArray.slice(1), elementTag, prefix, postfix, tag, onFinish, sync, resAdd + 1);
                }
            };
            s.onerror = function () {
                if (this.tagName === "AUDIO") {
                    console.warn("Failed loading audio: " + this.src);
                    self.onloadeddata();
                    return;
                }
                fail = true;
                self.vp.loadingText = "Resource missing: " + this.src;
            };
            document.head.appendChild(s);
            if (sync) {
                break;
            }
        }
    }

    onLoad() {
        console.error("ResourceManager.onLoad must be overridden!");
    }

    getCutIns() {
        CUT_IN = {};
        for (let stage of STAGE) {
            for (let event of stage.events) {
                if (event.boss) {
                    for (let k in event.boss) {
                        if (k.indexOf("Dialogue") >= 0) {
                            for (let data of event.boss[k]) {
                                //deepest loop I ever created...
                                let s = data.sprite;
                                if (s && !CUT_IN[s]) {
                                    CUT_IN[s] = {
                                        file: CUT_IN_FOLDER_NAME + s
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * @param {Array} input Input data array.
     * @returns {Array} Array of image resource files.
     */
    processFiles(input) {
        let files = [];
        for (let data of input) {
            let o = window[data.object];
            for (let i in o) {
                this.processFile(o[i], data, files);
                if (data.checkInside) {
                    //and... one level deeper:
                    for (let j in o[i]) {
                        this.processFile(o[i][j], data, files);
                    }
                }
            }
        }
        return files;
    }

    processFile(item, data, array) {
        if (item[data.itemProp]) {
            if (data.push) {
                array.push(item);
            } else {
                array.push(item[data.itemProp]);
            }
        }
    }
}
