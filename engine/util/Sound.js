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
    if (!data.noSeek && !data.object.ended) {
        data.object = new Audio(data.object.src);
    }
    data.object.play();
};
