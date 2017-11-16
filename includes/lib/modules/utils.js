define(function () {

    // Initializing variables for the graph.
    // utils.marginSignalGraph -- Represents the main graph of signal traces.
    // marginMiniSignalGraph -- Represents the graph underneath the signal graph showing signal data in minified form.
    // width -- Represents the width for the signal and the mini signal graph.
    // height -- Represents the height of the svg enclosing signal graph, mini signal graph and the read align. viewer.
    // heightMiniSignalGraph -- Represents the height of the mini signal graph.
    var
        marginSignalGraph = {top: 30, right: 50, bottom: 90, left: 50},
        marginMiniSignalGraph = {top: 530, right: 20, bottom: 40, left: 40},

        width = (window.innerWidth) - marginSignalGraph.left - marginSignalGraph.right-20, // width = 900
        height = 602 - marginSignalGraph.top - marginSignalGraph.bottom, // height = 370

        heightminiSignalGraph = 602 - marginMiniSignalGraph.top - marginMiniSignalGraph.bottom; // heightminiSignalGraph = 40

    return {

        // Variables for the graph are being returned for utils module.
        marginSignalGraph: marginSignalGraph,
        marginMiniSignalGraph: marginMiniSignalGraph,
        width: width,
        height: height,
        heightminiSignalGraph: heightminiSignalGraph,


        // colors for the read align. viewer.
        colors: [
            "purple",
            "#DF7401",
            "teal",
            "yellow",
            "pink",
            "red"
        ],

        // base_colors -- Represents a dictionary of base_pair (key) and the color associated with it (value)
        base_colors: {
            "A": "orange", // A
            "T": "red", // T
            "G": "blue", // G
            "C": "green" // C
        },


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
