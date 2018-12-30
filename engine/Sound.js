/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function Sound() {
}

Sound.play = function(data) {
    if (!data.noSeek) {
        data.object.pause();
        data.object.currentTime = 0;
    }
    data.object.play();
};
