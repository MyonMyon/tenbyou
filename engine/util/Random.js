let RANDOM_GET_COUNT = null;
let RANDOM_RESULT = null;

class Random {
    /**
     * This function "seeds" the RNG, returning it to the original state.
     *
     * @param {Number} seed Seed for very pseudo-RNG.
     */
    static setSeed(seed) {
        let x = Math.PI * seed;
        RANDOM_RESULT = x - Math.floor(x);
        RANDOM_GET_COUNT = seed;
    }

    /**
     * The distribution is uniform, but, please do not use this code in any sort of
     * crypthography, it's been created just for the world generation.
     *
     * @param {Number} rangeSize Bounding value for range (not to be included in result).
     * @return {Number} Random number from 0 (inclusively) to 1 (if args are empty) or rangeSize (exclusively).
     */
    static nextFloat(rangeSize = 1) {
        RANDOM_GET_COUNT++;
        let x = Math.PI * (RANDOM_GET_COUNT + RANDOM_RESULT);
        RANDOM_RESULT = x - Math.floor(x);
        return RANDOM_RESULT * rangeSize;
    }

    /**
     * The proxy function for getting random integer.
     *
     * @param {Number} rangeSize Bounding value for range (not to be included in result).
     * @return {Number} Random integer from 0 (inclusively) to "rangeSize" value (exclusively).
     */
    static nextInt(rangeSize) {
        return Math.floor(Random.nextFloat(rangeSize));
    }

    /**
     * The proxy function for getting a random boolean.
     *
     * @param {Number} chance Chance to get true, number from 0 (never) to 1 (always).
     * @return {Boolean} Either true or false, obvioulsy.
     */
    static nextBool(chance = 0.5) {
        return Random.nextFloat() < chance;
    }

    /**
     * The proxy function for getting random element of an array.
     *
     * @param {Array} array A.
     * @return {*} Random array element.
     */
    static nextArrayElement(array) {
        if (!array || !array.length) {
            Console.error("Failed getting random element: No array or the array is empty!");
            return null;
        }
        return array[Random.nextInt(array.length)];
    }
}
