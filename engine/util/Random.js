let RANDOM_GET_COUNT = null;
let RANDOM_RESULT = null;

/**
 * Empty constructor for utility class.
 *
 * @constructor
 */
function Random() {
}

/**
 * This function "seeds" the RNG, returning it to the original state.
 *
 * @param {Number} seed Seed for very pseudo-RNG.
 */
Random.setSeed = function (seed) {
    let x = Math.PI * seed;
    RANDOM_RESULT = x - Math.floor(x);
    RANDOM_GET_COUNT = seed;
};


/**
 * The distribution is uniform, but, please do not use this code in any sort of
 * crypthography, it's been created just for the world generation.
 *
 * @param {Number} rangeSize Bounding value for range (not to be included in result).
 * @return {Number} Random number from 0 (inclusively) to 1 (if args are empty) or rangeSize (exclusively).
 */
Random.nextFloat = function (rangeSize) {
    RANDOM_GET_COUNT++;
    let x = Math.PI * (RANDOM_GET_COUNT + RANDOM_RESULT);
    RANDOM_RESULT = x - Math.floor(x);
    return RANDOM_RESULT * (rangeSize || 1);
};

/**
 * The proxy function for getting random integer.
 *
 * @param {Number} rangeSize Bounding value for range (not to be included in result).
 * @return {Number} Random integer from 0 (inclusively) to "rangeSize" value (exclusively).
 */
Random.nextInt = function (rangeSize) {
    return Math.floor(Random.nextFloat(rangeSize));
};

/**
 * The proxy function for getting a random boolean.
 *
 * @param {Number} chance Chance to get true, number from 0 (never) to 1 (always).
 * @return {Boolean} Either true or false, obvioulsy.
 */
Random.nextBool = function (chance) {
    return Random.nextFloat() < (chance || 0.5);
};

/**
 * The proxy function for getting random element of an array.
 *
 * @param {Array} array A.
 * @return {*} Random array element.
 */
Random.nextArrayElement = function (array) {
    if (!array || !array.length) {
        Console.error("Failed getting random element: No array or the array is empty!");
        return null;
    }
    return array[Random.nextInt(array.length)];
};
