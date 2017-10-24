define(function () {
    return {
        /**
         * Function tuplify -- Converts a key value pair into a tuple of values.
         * @params obj -- Represents a dictionary (with key-value paris)
         */
        tuplify: function(obj) {
            return Object.keys(obj).reduce(function (m, k) {
                return m.concat([[k, obj[k]]]);
            }, []);
        },

        /**
         * isLower -- Checks whether or not a char provided in args is lowercase or not.
         * @param character -- Represents a character to check for
         * @returns {boolean} -- true if lower, false otherwise.
         */
        isLower: function(character) {
            return (character === character.toLowerCase()) && (character !== character.toUpperCase());
        }
    };
});
