/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function Sound() {
}

Sound.play = function(data) {
    data.object.fastSeek(0);
    data.object.play();
};
