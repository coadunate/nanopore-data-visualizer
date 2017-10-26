/**
 *
 * @file main.js -- contains main functionality of the application
 * @author Coadunate Organization
 * @version 1.0
 *
 */


define(function (require) {

    /**
     * Terminology
     * SG -- Signal Graph
     * mSG -- Mini Signal Graph.
     */


    // Importing dependant libraries.
    var utils = require('./utils');
    var scales = require('./scales');




    // The svg enclosing signal graph, mini signal graph and the read align. viewer.
    var svg = d3.select(".app").append("svg")
        .attr("width", utils.width + utils.marginSignalGraph.left + utils.marginSignalGraph.right)
        .attr("height", utils.height + utils.marginSignalGraph.top + utils.marginSignalGraph.bottom + 100 + 500);



    // Line function for the signal graph.
    var lineFunctionSG = d3.line()
        .x(function(d) { return scales.xSG(d.index); })
        .y(function(d) { return scales.ySG(d.signal); });

    // Line function for mini signal graph.
    var lineFunctionmSG = d3.line()
        .x(function(d) { return scales.xmSG(d.index); })
        .y(function(d) { return scales.ymSG(d.signal); });


    // This represents the strip below showing the mini version of the graph.
    var mSGGraph = svg.append("g")
        .attr("class", "mSGGraph")
        .attr("transform", "translate(" + utils.marginMiniSignalGraph.left + "," + utils.marginMiniSignalGraph.top + ")");

    // Gets the data form the data/combined.json file
    d3.json("/data/combined.json", function(error, data) {

        if (error) throw error;

        // the number of reads in the jSON file
        var numReads = data.length-1;


        var reads_visible = [];
        for(var i=0; i < numReads; i++) reads_visible[i] = "visible";

        var indSGGraph = [];  // array of all the graphs in SG
        var indSGCricle = []; // array of all the circles in SG
        var indmSGGraph = []; // array for all the graphs in mSG
        var indReads = []; // array for all the reads in read align. viewer.

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
        scales.xSG.domain([0, numPoreModels]);

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
        scales.ySG.domain([ymin, ymax]);

        // x domain for the mini signal graph
        scales.xmSG.domain(scales.xSG.domain());

        // y domain for the mini signal graph
        scales.ymSG.domain(scales.ySG.domain());

        // x domain for the read align. viewer.
        scales.xR.domain([0, 125]);


        // Creates a brush for mini signal data.
        var brush = d3.brushX()
            .extent([[0, 0], [utils.width, utils.heightminiSignalGraph]])
            .on("brush end", brushed);

        // create zoom function for the signal graph.
        var zoom = d3.zoom()
            .scaleExtent([1, numPoreModels])
            .translateExtent([[0, 0], [utils.width, utils.height]])
            .extent([[0, 0], [utils.width, utils.height]])
            .on("zoom", zoomed);

        // Create zoom function for the read alignment viewer.
        var rXZoom = d3.zoom()
            .scaleExtent([1, numPoreModels])
            .translateExtent([[0, 0], [utils.width, utils.height]])
            .extent([[0, 0], [utils.width, utils.height]])
            .on("zoom", rXZoomed);



        var xAxisSG = d3.axisBottom(scales.xSG).tickSize(-utils.height), // x-axis for signal grpah
            xAxis2mSG = d3.axisBottom(scales.xmSG), // x-axis for mini signal graph
            yAxis = d3.axisLeft(scales.ySG).ticks(5).tickSize(-utils.width); // y-axis for the signal graph.

        // x-axis for the read alignment viewer.
        var rXAxis = d3.axisBottom(scales.xR);


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
            .append('tr').style("background-color",'#bcf5a6').attr("class",function(d,i){ return "row" + i; });


        rows.selectAll('td')
            .data(function(d) {
                return utils.tuplify(titles).map(function(k) {

                    // defines the position at which each field in the data is found.
                    field_number = { };
                    field_number["qname"] = 6;
                    field_number["pos"] = 5;
                    field_number["length"] = 0;
                    field_number["span"] = 3;

                    d_tup = utils.tuplify(d[1]);
                    return {
                        'value': "this",
                        'name': d_tup[ field_number[ k[0] ] ] [1]
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


        rows.on("click", function (d,i) {
            console.log("YOU CLICKED (" + i + ")");
            console.log(reads_visible);
            if(reads_visible[i] === "visible"){

                indSGGraph[i].attr("opacity",0);
                indSGCricle[i].attr("opacity",0);
                indmSGGraph[i].attr("opacity",0);
                indReads[i].style("opacity",0);


                d3.select(".row" + i).style("background",'none');

                reads_visible[i] = "invisible";

            } else{

                indSGGraph[i].attr("opacity",1);
                indSGCricle[i].attr("opacity",1);
                indmSGGraph[i].attr("opacity",1);
                indReads[i].style("opacity",1);

                d3.select(".row" + i).style("background-color",'#bcf5a6');

                reads_visible[i] = "visible";
            }


        });

        // create graphic element for the reads alignment viewer.
        var reads = svg.append("g")
            .attr("class", "reads")
            .attr("transform", "translate(" + utils.marginSignalGraph.left + "," + (utils.marginSignalGraph.top + utils.height + utils.heightminiSignalGraph + 100) + ")")
            .call(rXZoom);

        // container to contain the read alignment viewer.
        var read_container = reads.append("g").attr("class", "container");

        read_container.append("g")
            .attr("class", "axis rXaxis")
            .attr("transform", "translate(0," + utils.height + ")")
            .call(rXAxis);


        // This is the main graph.
        var SGGraph = svg.append("g")
            .attr("class", "SGGraph")
            .attr("transform", "translate(" + utils.marginSignalGraph.left + "," + utils.marginSignalGraph.top + ")")
            .call(zoom);

        // comment this line to get the popup appear.
        // var rect = svg.append("rect")
        //     .attr("width", utils.width)
        //     .attr("transform", "translate(50,0)")
        //     .attr("height", utils.height)
        //     .style("fill", "none")
        //     .style("pointer-events", "all").call(zoom);

        // container for the graph.
        var container = SGGraph.append("g").attr("class", "container");

        // add signal graph x-axis to the container.
        container.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + utils.height + ")")
            .call(xAxisSG);

        // add signal grpah y-axis to the container
        container.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        // append text for the y-axis label.
        SGGraph.append("text")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .attr("transform", "rotate(-90) translate(" + -utils.height / 2 + ",-30)")
            .text("Signal Value (pA)");

        // div for the information for each event point.
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // populate the signal graph with circles for event points and line function.
        for (var i = 0; i < numReads; i++) {

            var circle = SGGraph.append("svg").attr("width", utils.width).attr("height", utils.height).attr("class", "circ" + i).selectAll("circle")
                .data(data[i][0])
                .enter()
                .append("circle")
                .on("click", function (d) {
                    console.log("Yo!");
                })
                .attr("cx", function (d) {
                    return scales.xSG(d.index);
                })
                .attr("cy", function (d) {
                    return scales.ySG(d.signal);
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

            indSGCricle.push(circle); // add the created sequence of circles to indSGCircle for later modification

            // create a path for the signal data.
            var graph = SGGraph.append("svg").attr("width", utils.width).attr("height", utils.height).append("path")
                .datum(data[i][0])
                .attr("class", "squiggle")
                .attr("id", "squigg1")
                .attr("d", lineFunctionSG)
                .attr("stroke", utils.colors[i])
                .attr("stroke-width", 2)
                .attr("fill", "none");

            indSGGraph.push(graph); // add the created signal trace to the indSGGraph for later modification

            // create path for the mini signal data.
            var mGraph = mSGGraph.append("path")
                .datum(data[i][0])
                .attr("class", "squiggle")
                .attr("d", lineFunctionmSG)
                .attr("stroke", utils.colors[i])
                .attr("stroke-width", 2)
                .attr("fill", "none");

            indmSGGraph.push(mGraph); // add the created mini signal trace to indmSGGraph for later modification.
        }


        // create the x-axis for the mini signal graph.
        mSGGraph.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + utils.heightminiSignalGraph + ")")
            .call(xAxis2mSG);

        // append the brush function on the mini signal graph.
        mSGGraph.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, scales.xSG.range());

        // populate read alignment view with reads.
        for (var j = 0; j < numReads; j++){
            read_svg = reads.append("svg").attr("width", utils.width).attr("height", utils.height).attr("class", "read" + j);
            for (var i = 0; i < data[j][1].span; i++) {
                var query = data[j][1].query[i];

                //console.log((i+1) + ". QUERY: " + data[j][1].query[i]);

                if(query[0] === null){ // insertion
                    //console.log("INSERTION");

                    read_svg.append("rect")
                        .attr("x", scales.xR(i) + 25)
                        .attr("y", scales.ySG(130) + (j * 50))
                        .attr("class", "read" + j + "_" + i)
                        .attr("utils.width", 20)
                        .attr("height", 25)
                        .attr("fill", utils.colors[j])
                        .attr('stroke', 'black');

                    read_svg.append("rect")
                        .attr("x", scales.xR(i) + 25)
                        .attr("y", scales.ySG(130) + (j * 50)  - 5)
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
                        .attr("x", scales.xR(i) + 25)
                        .attr("y", scales.ySG(130) + (j * 50))
                        .attr("class", "read" + j + "_" + i)
                        .attr("width", 20)
                        .attr("height", 25)
                        .attr("fill", "white")

                    read_svg.append("rect")
                        .attr("x", scales.xR(i) + 25)
                        .attr("y", scales.ySG(130) + (j * 50) +11)
                        .attr("class", "read" + j + "_" + i)
                        .attr("width", 35)
                        .attr("height", 1)
                        .attr("fill", "white")
                        .attr('stroke', 'black')
                        .attr("stroke-width",2);


                }else{ // normal case.

                    read_svg.append("rect")
                        .attr("x", scales.xR(i) + 25)
                        .attr("y", scales.ySG(130) + (j * 50))
                        .attr("class", "read" + j + "_" + i)
                        .attr("width", 20)
                        .attr("height", 25)
                        .attr("fill", utils.colors[j])
                        .attr('stroke', 'black')
                        .attr('stroke-width',2);
                    if(utils.isLower(query[2])){
                        read_svg.append("text").attr("x",scales.xR(i) +25 + 1.6).attr("y",scales.ySG(130) + (j * 50) +15).text(data[j][1].seq[i]).attr("font-family","sans-serif").attr("font-size","12px").attr("fill","white");
                    }
                }
            }
            indReads.push(read_svg);
        }


        // add the reference to the read alignment view.
        var reference = reads.append("svg").attr("width", utils.width).attr("height", utils.height).attr("class", "reference");
        for(var i = 0; i < data[3].ref.length; i++){
            base_color = "";
            switch(data[3].ref[i]){
                case "A":
                    base_color = utils.base_colors.A;
                    break;
                case "T":
                    base_color = utils.base_colors.T;
                    break;
                case "G":
                    base_color = utils.base_colors.G;
                    break;
                case "C":
                    base_color = utils.base_colors.C;
                    break;
                default:
                    base_color = "black";
            }

            reference.append("rect")
                .attr("x", scales.xR(i) + 25)
                .attr("y", scales.ySG(65))
                .attr("class", "read" + j + "_" + i)
                .attr("width", 20)
                .attr("height", 25)
                .attr("fill", base_color)
                .attr('stroke', 'black');



            reference.append("text")
                .attr("x",scales.xR(i) +25 + 2)
                .attr("y",scales.ySG(62))
                .text(data[3].ref[i])
                .attr("font-family","sans-serif")
                .attr("font-size","10px")
                .attr("fill", "white");

        }


        function brushed() {

            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || scales.xmSG.range();
            scales.xSG.domain(s.map(scales.xmSG.invert, scales.xmSG));
            SGGraph.selectAll(".squiggle").attr("d", lineFunctionSG);
            SGGraph.select(".axis--x").call(xAxisSG);
            //reads.select(".axis--x").call(rXAxis);
            svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                .scale(utils.width / (s[1] - s[0]))
                .translate(-s[0], 0));


            SGGraph.selectAll("circle")
                .attr("cx", function(d){ return scales.xSG(d.index); })
                .attr("cy", function(d){ return scales.ySG(d.signal); });


        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = d3.event.transform;
            scales.xSG.domain(t.rescaleX(scales.xmSG).domain());
            SGGraph.selectAll(".squiggle").attr("d", lineFunctionSG);
            SGGraph.select(".axis--x").call(xAxisSG);
            reads.select(".rXaxis").call(xAxisSG);
            mSGGraph.select(".brush").call(brush.move, scales.xSG.range().map(t.invertX, t));

            svg.selectAll(".dot")
                .attr("cx", function(d){ return scales.xSG(d.index); })
                .attr("cy", function(d){ return scales.ySG(d.signal); });

            for(var i = 0; i < data[0][1].span; i++){
                svg.selectAll(".read1")
                    .attr("x",scales.xSG(i));
            }

        }

        function rXZoomed(){

        }

    });


});
