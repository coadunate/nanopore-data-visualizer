
define(function(require){

    var utils = require("./utils");

    return{

        // Creating scales for the graph.
        xSG: d3.scaleLinear().range([0 , utils.width]), // the x-scale for signal graph.
        xmSG: d3.scaleLinear().range([0, utils.width]), // the x-scale for mini signal graph.
        ySG: d3.scaleLinear().range([utils.height, 0]), // the y-scale for signal graph.
        ymSG: d3.scaleLinear().range([utils.heightminiSignalGraph, 0]), // the y-scale for mini signal graph.
        xR: d3.scaleLinear().range([0, utils.width]), // the x-scale for read alignment viewer.
        yR: d3.scaleLinear().range([utils.height, 0]) // the y-scale for the read alignment viewer.
    };
});