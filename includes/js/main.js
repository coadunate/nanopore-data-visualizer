/**
 *
 * @file main.js -- contains main functionality of the application
 * @author Coadunate Organization
 * @version 1.0
 *
 */


/**
 * Terminology
 * SG -- Signal Graph
 * mSG -- Mini Signal Graph.
 */


/**
 * Function tuplify -- Converts a key value pair into a tuple of values.
 * @params obj -- Represents a dictionary (with key-value paris)
 */
let tuplify = obj => Object.keys(obj).reduce((m,k) => m.concat([[k, obj[k]]]), []);


/**
 * isLower -- Checks whether or not a char provided in args is lowercase or not.
 * @param character -- Represents a character to check for
 * @returns {boolean} -- true if lower, false otherwise.
 */
function isLower(character) {
    return (character === character.toLowerCase()) && (character !== character.toUpperCase());
}


// Initializing variables for the graph.
    // marginSignalGraph -- Represents the main graph of signal traces.
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


// The svg enclosing signal graph, mini signal graph and the read align. viewer.
var svg = d3.select(".app").append("svg")
    .attr("width", width + marginSignalGraph.left + marginSignalGraph.right)
    .attr("height", height + marginSignalGraph.top + marginSignalGraph.bottom + 100 + 500);


// Creating scales for the graph.
var xSG = d3.scaleLinear().range([0 , width]), // the x-scale for signal graph.
    xmSG = d3.scaleLinear().range([0, width]), // the x-scale for mini signal graph.
    ySG = d3.scaleLinear().range([height, 0]), // the y-scale for signal graph.
    ymSG = d3.scaleLinear().range([heightminiSignalGraph, 0]); // the y-scale for mini signal graph.

    xR = d3.scaleLinear().range([0, width]); // the x-scale for read alignment viewer.



// Line function for the signal graph.
var lineFunctionSG = d3.line()
    .x(function(d) { return xSG(d.index); })
    .y(function(d) { return ySG(d.signal); });

// Line function for mini signal graph.
var lineFunctionmSG = d3.line()
    .x(function(d) { return xmSG(d.index); })
    .y(function(d) { return ymSG(d.signal); });


// colors for the read align. viewer.
var colors = [
  "purple",
  "#DF7401",
  "teal",
  "yellow",
  "pink",
  "red"
];

// base_colors -- Represents a dictionary of base_pair (key) and the color associated with it (value)
var base_colors = {
    "A": "orange", // A
    "T": "red", // T
    "G": "blue", // G
    "C": "green" // C
};


// This represents the strip below showing the mini version of the graph.
var mSGGraph = svg.append("g")
    .attr("class", "mSGGraph")
    .attr("transform", "translate(" + marginMiniSignalGraph.left + "," + marginMiniSignalGraph.top + ")");

// Gets the data form the data/combined.json file
d3.json("/data/combined.json", function(error, data) {

    if (error) throw error;

    // the number of reads in the jSON file
    var numReads = data.length-1;

    // Calculating the num of pore_models.
    numPoreModels = 0;
    for (var i = 0; i < numReads; i++) {
        numPoreModels = Math.max(data[i][0].length, numPoreModels);
    }


    for (var i = 0; i < numReads; i++) {

        // Represents an array of pore_models
        // format:
        //     {
        //         "index": 1,
        //         "signal": 92.2417,
        //         "time": 368.58,
        //         "model": "TCGGT",
        //         "length": 0.0015,
        //         "stdv": 1.4271
        //     }
        var pore_models = data[i][0];

        // Convert all the integer values to integer.
        pore_models.forEach(function (d) {
            d.index = +d.index;
            d.signal = +d.signal;
            d.model = d.model;
            d.time = +d.time;
            d.length = +d.length;
            d.stdv = +d.stdv;
        });
    }

    // x domain for the signal graph is total number of pore_models.
    xSG.domain([0, numPoreModels]);

    // Calculating y-min and y-max
    //    y-max equals the max signal value from all the pore_models
    //    y-min equals the min signal value from all the pore-models.
    var ymin = 9999, ymax = 0;
    for (var i = 0; i < numReads; i++) {
        ymin = Math.min(d3.min(data[i][0], function (d) {
            return d.signal;
        }), ymin);
        ymax = Math.max(d3.max(data[i][0], function (d) {
            return d.signal;
        }), ymax);
    }

    // y-scale for the signal graph.
    ySG.domain([ymin, ymax]);

    // x domain for the mini signal graph
    xmSG.domain(xSG.domain());

    // y domain for the mini signal graph
    ymSG.domain(ySG.domain());

    // x domain for the read align. viewer.
    xR.domain([0, 125]);


    // Creates a brush for mini signal data.
    var brush = d3.brushX()
        .extent([[0, 0], [width, heightminiSignalGraph]])
        .on("brush end", brushed);

    // create zoom function for the signal graph.
    var zoom = d3.zoom()
        .scaleExtent([1, numPoreModels])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    // Create zoom function for the read alignment viewer.
    var rXZoom = d3.zoom()
        .scaleExtent([1, numPoreModels])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", rXZoomed);



    var xAxisSG = d3.axisBottom(xSG).tickSize(-height), // x-axis for signal grpah
        xAxis2mSG = d3.axisBottom(xmSG), // x-axis for mini signal graph
        yAxis = d3.axisLeft(ySG).ticks(5).tickSize(-width); // y-axis for the signal graph.

    // x-axis for the read alignment viewer.
    var rXAxis = d3.axisBottom(xR);

    (function(){ // Function for creating the table.

        // represents the tiles for the table.
        var titles = {
            "qname": "Read Name",
            "pos": "Postition",
            "length": "Nanopore Events",
            "span": "Reference Span (bp)"
        };


        var table = d3.select('.app').append('table').attr("class","table table-hover"); // create table element.

        // add titles to the table and refer it by headers variable.
        var headers = table.append('thead')
            .append('tr')
            .selectAll('th')
            .data(d3.values(titles))
            .enter()
            .append('th')
            .text(function(d) {
                return d;
            });

        // create rows
        var rows = table.append('tbody')
            .selectAll('tr')
            .data(data.slice(0,3))
            .enter()
            .append('tr');


        rows.selectAll('td')
            .data(function(d) {

               return tuplify(titles).map(function(k) {
                   k_ty = { };
                   k_ty["qname"] = 6;
                   k_ty["pos"] = 5;
                   k_ty["length"] = 0;
                   k_ty["span"] = 3;

                    d_tup = tuplify(d[1]);
                    console.log("K : " + d_tup[k_ty[k[0]]][1]);
                    return {
                        'value': "this",
                        'name': d_tup[k_ty[k[0]]][1]
                    };
                });
            })
            .enter()
            .append('td')
            .attr('data-th', function(d) {
                return d.value;
            })
            .text(function(d) {
                return d.name;
            });

    }());


    // create graphic element for the reads alignment viewer.
    var reads = svg.append("g")
        .attr("class", "reads")
        .attr("transform", "translate(" + marginSignalGraph.left + "," + (marginSignalGraph.top + height + heightminiSignalGraph + 100) + ")")
        .call(rXZoom);

    // container to contain the read alignment viewer.
    var read_container = reads.append("g").attr("class", "container");

    read_container.append("g")
        .attr("class", "axis rXaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(rXAxis);


    // This is the main graph.
    var SGGraph = svg.append("g")
        .attr("class", "SGGraph")
        .attr("transform", "translate(" + marginSignalGraph.left + "," + marginSignalGraph.top + ")")
        .call(zoom);

    // comment this line to get the popup appear.
    // var rect = svg.append("rect")
    //     .attr("width", width)
    //     .attr("transform", "translate(50,0)")
    //     .attr("height", height)
    //     .style("fill", "none")
    //     .style("pointer-events", "all").call(zoom);

    // container for the graph.
    var container = SGGraph.append("g").attr("class", "container");

    // add signal graph x-axis to the container.
    container.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisSG);

    // add signal grpah y-axis to the container
    container.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    // append text for the y-axis label.
    SGGraph.append("text")
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .attr("transform", "rotate(-90) translate(" + -height / 2 + ",-30)")
        .text("Signal Value (pA)");

    // div for the information for each event point.
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // populate the signal graph with circles for event points and line function.
    for (var i = 0; i < numReads; i++) {
        SGGraph.append("svg").attr("width", width).attr("height", height).attr("class", "circ" + i).selectAll("circle")
            .data(data[i][0])
            .enter()
            .append("circle")
            .on("click", function (d) {
                console.log("Yo!");
            })
            .attr("cx", function (d) {
                return xSG(d.index);
            })
            .attr("cy", function (d) {
                return ySG(d.signal);
            })
            .attr("fill", i == 0 ? "black" : "black")
            .attr("class", "dot")
            .attr("r", 5)
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 0.9)
                    .style("text-align", "left");
                //index,signal,time,model,length,stdv
                div.html(
                    "<b>Event #:</b> " + (d.index) + "<br />" +
                    "<b>Signal:</b> " + d.signal + "<br />" +
                    "<b>Time:</b> " + d.time + "<br />" +
                    "<b>Model:</b> " + d.model + "<br />" +
                    "<b>Length:</b> " + d.length + "<br />" +
                    "<b>Std. Dev:</b>" + d.stdv + "<br/>"
                )
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 8) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // create a path for the signal data.
        SGGraph.append("svg").attr("width", width).attr("height", height).append("path")
            .datum(data[i][0])
            .attr("class", "squiggle")
            .attr("id", "squigg1")
            .attr("d", lineFunctionSG)
            .attr("stroke", colors[i])
            .attr("stroke-width", 2)
            .attr("fill", "none");

        // create path for the mini signal data.
        mSGGraph.append("path")
            .datum(data[i][0])
            .attr("class", "squiggle")
            .attr("d", lineFunctionmSG)
            .attr("stroke", colors[i])
            .attr("stroke-width", 2)
            .attr("fill", "none");
    }


    // create the x-axis for the mini signal graph.
    mSGGraph.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + heightminiSignalGraph + ")")
        .call(xAxis2mSG);

    // append the brush function on the mini signal graph.
    mSGGraph.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, xSG.range());

    // populate read alignment view with reads.
    for (var j = 0; j < numReads; j++){
        read_svg = reads.append("svg").attr("width", width).attr("height", height).attr("class", "read" + j);
        for (var i = 0; i < data[j][1].span; i++) {
            var query = data[j][1].query[i];

            //console.log((i+1) + ". QUERY: " + data[j][1].query[i]);

            if(query[0] === null){ // insertion
                //console.log("INSERTION");

                read_svg.append("rect")
                    .attr("x", xR(i) + 25)
                    .attr("y", ySG(130) + (j * 50))
                    .attr("class", "read" + j + "_" + i)
                    .attr("width", 20)
                    .attr("height", 25)
                    .attr("fill", colors[j])
                    .attr('stroke', 'black');

                read_svg.append("rect")
                    .attr("x", xR(i) + 25)
                    .attr("y", ySG(130) + (j * 50)  - 5)
                    .attr("class", "read" + j + "_" + i)
                    .attr("width", 1)
                    .attr("height", 35)
                    .attr("fill", "white")
                    .attr('stroke', 'black')
                    .attr("stroke-width",2)
                    .on("mouseover", function (d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", 0.9)
                            .style("text-align", "left");
                        //index,signal,time,model,length,stdv
                        div.html(
                            "<b>Inserted Bases:- <u>AT</u></u></b><br />" +
                            "<b>Quality:- : ;</b><br />" +
                            "<b>Reference Position: <u>24</u></b>"
                        )
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 8) + "px");
                    })
                    .on("mouseout", function (d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            } else if(query[1] === null){ // deletion
                //console.log("DELETION");

                read_svg.append("rect")
                    .attr("x", xR(i) + 25)
                    .attr("y", ySG(130) + (j * 50))
                    .attr("class", "read" + j + "_" + i)
                    .attr("width", 20)
                    .attr("height", 25)
                    .attr("fill", "white")

                read_svg.append("rect")
                    .attr("x", xR(i) + 25)
                    .attr("y", ySG(130) + (j * 50) +11)
                    .attr("class", "read" + j + "_" + i)
                    .attr("width", 35)
                    .attr("height", 1)
                    .attr("fill", "white")
                    .attr('stroke', 'black')
                    .attr("stroke-width",2);


            }else{ // normal case.

                read_svg.append("rect")
                    .attr("x", xR(i) + 25)
                    .attr("y", ySG(130) + (j * 50))
                    .attr("class", "read" + j + "_" + i)
                    .attr("width", 20)
                    .attr("height", 25)
                    .attr("fill", colors[j])
                    .attr('stroke', 'black')
                    .attr('stroke-width',2);
                if(isLower(query[2])){
                    read_svg.append("text").attr("x",xR(i) +25 + 1.6).attr("y",ySG(130) + (j * 50) +15).text(data[j][1].seq[i]).attr("font-family","sans-serif").attr("font-size","12px").attr("fill","white");
                }
            }

        }
    }


    // add the reference to the read alignment view.
    var reference = reads.append("svg").attr("width", width).attr("height", height).attr("class", "reference");
    for(var i = 0; i < data[3].ref.length; i++){
        base_color = "";
        switch(data[3].ref[i]){
            case "A":
                base_color = base_colors.A;
                break;
            case "T":
                base_color = base_colors.T;
                break;
            case "G":
                base_color = base_colors.G;
                break;
            case "C":
                base_color = base_colors.C;
                break;
            default:
                base_color = "black";
        }

        reference.append("rect")
            .attr("x", xR(i) + 25)
            .attr("y", ySG(65))
            .attr("class", "read" + j + "_" + i)
            .attr("width", 20)
            .attr("height", 25)
            .attr("fill", base_color)
            .attr('stroke', 'black');



        reference.append("text")
                  .attr("x",xR(i) +25 + 2)
                  .attr("y",ySG(62))
                  .text(data[3].ref[i])
                  .attr("font-family","sans-serif")
                  .attr("font-size","10px")
                  .attr("fill", "white");

    }


    function brushed() {

        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || xmSG.range();
        xSG.domain(s.map(xmSG.invert, xmSG));
        SGGraph.selectAll(".squiggle").attr("d", lineFunctionSG);
        SGGraph.select(".axis--x").call(xAxisSG);
        //reads.select(".axis--x").call(rXAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));


        SGGraph.selectAll("circle")
            .attr("cx", function(d){ return xSG(d.index); })
            .attr("cy", function(d){ return ySG(d.signal); });


    }

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        xSG.domain(t.rescaleX(xmSG).domain());
        SGGraph.selectAll(".squiggle").attr("d", lineFunctionSG);
        SGGraph.select(".axis--x").call(xAxisSG);
        reads.select(".rXaxis").call(xAxisSG);
        mSGGraph.select(".brush").call(brush.move, xSG.range().map(t.invertX, t));

        svg.selectAll(".dot")
            .attr("cx", function(d){ return xSG(d.index); })
            .attr("cy", function(d){ return ySG(d.signal); });

        for(var i = 0; i < data[0][1].span; i++){
            svg.selectAll(".read1")
                .attr("x",xSG(i));
        }

    }

    function rXZoomed(){

    }

});