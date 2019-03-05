/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function Sound() {
}

Sound.play = function (data) {
    if (!Settings.get("sound.enabled")) {
        return;
    }
    var vol = Settings.get("sound.volume_sfx") / 100;
    if (vol === 0) {
        return;
    }
    if (!data.noSeek && !data.object.ended) {
        data.object = new Audio(data.object.src);
    }
    data.object.volume = vol;
    data.object.play();
};
