class Settings {
    /**
     * @param {String} key Key of the setting.
     * @return {String} Default state of the setting in string form.
     */
    static getDefault(key) {
        const m = {
            "dev.mode": "false",
            "sound.enabled": "true",
            "sound.volume_sfx": "100",
            "video.world_sync": "true",
            "video.gradients": "null"
        };
        return m[key];
    };

    /**
     * @param {String} key Key of the setting.
     * @return {String} Type of the setting. Exaple: "boolean", "number", "string", "json".
     */
    static getType(key) {
        const m = {
            "dev.mode": "boolean",
            "sound.enabled": "boolean",
            "sound.volume_sfx": "number",
            "video.world_sync": "boolean",
            "video.gradients": "boolean"
        };
        return m[key];
    };

    /**
     * @param {String} key Key of the setting.
     * @param {String} type Type of the setting. Not required.
     * @return {*} Value of the setting.
     */
    static get(key, type = Settings.getType(key)) {
        let value = localStorage.getItem("settings." + key);
        if (value === null) {
            value = Settings.getDefault(key);
        }
        if (value === "null") {
            value = null;
        } else {
            switch (type) {
                case "number":
                    value = +value;
                    break;
                case "boolean":
                    value = value === "true";
                    break;
                case "json":
                    value = JSON.parse(value || null);
                    break;
            }
        }
        return value;
    };

    /**
     * Changes value of the setting.
     *
     * @param {String} key Key of the setting.
     * @param {*} value New value of the setting.
     */
    static set(key, value) {
        let lsKey = "settings." + key;
        if (Settings.getType(key) === "json") {
            localStorage.setItem(lsKey, JSON.stringify(value));
        } else {
            localStorage.setItem(lsKey, value);
        }
    };

    /**
     * Resets value of the setting to default one.
     *
     * @param {String} key Key of the setting.
     */
    static reset(key) {
        localStorage.removeItem("settings." + key);
    }
}
