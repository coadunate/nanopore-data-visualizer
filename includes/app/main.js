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
    var utils = require('modules/utils');
    var scales = require('modules/scales');

    var indSGGraph = [];  // array of all the graphs in SG
    var indSGCricle = []; // array of all the circles in SG
    var indmSGGraph = []; // array for all the graphs in mSG
    var indReads = []; // array for all the reads in read align. viewer.
    var readInsertions = []; // array for all insertions of reads in read align. viewer.
    var readDeletions = []; // array for all deletions of reads in read align. viewer.
    var reads_visible = [];




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


    // x domain for the read align. viewer.

    scales.xR.domain([0, 100]);

    // // Create zoom function for the read alignment viewer.
    var rXZoom = d3.zoom()
        .scaleExtent([1, 1])
        .on("zoom", rXZoomed);

    // x-axis for the read alignment viewer.
    var rXAxis = d3.axisBottom(scales.xR);


    // create graphic element for the reads alignment viewer.
    var reads = svg.append("g")
        .attr("class", "reads")
        .attr("transform", "translate(" + utils.marginSignalGraph.left + "," + (utils.marginSignalGraph.top + utils.height + utils.heightminiSignalGraph + 100) + ")")
        .call(rXZoom);

    scales.yR.domain([0,100]);

    // container to contain the read alignment viewer.
    var read_container = reads.append("g").attr("class", "container");

    read_container.append("g")
        .attr("class", "axis rXaxis")
        .attr("transform", "translate(0," + utils.height + ")")
        .call(rXAxis);


    // div for the information for each event point.
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    function rXZoomed(){
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;

        reads.select(".rXaxis").call(rXAxis.scale( t.rescaleX(scales.xR)));

        reads.selectAll("svg").selectAll("rect")
            .attr("transform","translate(" + t.x + ",0)");

        reads.selectAll("svg").selectAll("text")
            .attr("transform","translate(" + t.x + ",0)");
    }

    // // // Populate the reference
    // d3.json("http://homepage.usask.ca/~mts066/reference.json",function(error,data){
    //     if (error) throw error;
    //
    //
    //     // add the reference to the read alignment view.
    //     var reference = reads.append("svg").attr("width", utils.width).attr("height", utils.height).attr("class", "reference");
    //     for(var i = 0; i < data.ref.length; i++){
    //         base_color = "";
    //         switch(data.ref[i]){
    //             case "A":
    //                 base_color = utils.base_colors.A;
    //                 break;
    //             case "T":
    //                 base_color = utils.base_colors.T;
    //                 break;
    //             case "G":
    //                 base_color = utils.base_colors.G;
    //                 break;
    //             case "C":
    //                 base_color = utils.base_colors.C;
    //                 break;
    //             default:
    //                 base_color = "black";
    //         }
    //
    //
    //         reference.append("text")
    //             .attr("x",scales.xR(i) + 12.5)
    //             .attr("y",scales.yR(4) - 7)
    //             .text(data.ref[i])
    //             .attr("font-family","sans-serif")
    //             .attr("font-size","10px")
    //             .attr("stroke-width",3)
    //             .attr("fill", base_color);
    //     }
    //
    // });


    // Function responsible for rendering the table onto the app.
    d3.json("http://localhost:5000/tabledata",function (error,data) {

        if (error) throw error;

        // patching for until we get more than one read.
        data_arr = [];
        data_arr.push(data);


        var divForReads = [];


        for(var j = 0; j < data_arr.length; j++){

            // populate read alignment view with reads
            var readsSVG = reads.append("svg").attr("width", utils.width).attr("height", utils.height).attr("class", "readSVG");
            var currentRead = readsSVG.append("rect")
                .attr("x", scales.xR(j) + (j*25))
                .attr("y", scales.yR(j) - 400 + (j*25))
                .attr("class", "read" + 0 + "_" + 0)
                .attr("width", scales.xR(data.span))
                .attr("height", 15)
                .attr("fill", utils.colors[j])
                .attr('stroke', 'black');

            // Make the reads invisible at first.
            currentRead.attr("opacity",0);

            indReads.push(currentRead);

            var insertions = [];
            var deletions = [];
            for(var i = 0; i < data_arr[j].span; i++){
                var query_record = data_arr[j].query[i];


                if(query_record[0] === null && data_arr[j].query[i-1][0] != null){ // INSERTION

                    console.log(query_record);

                    var insert = readsSVG.append("rect")
                        .attr("x", scales.xR(i))
                        .attr("y", scales.yR(j) - 400 + (j*25) - 5)
                        .attr("class", "read" + j + "_" + i)
                        .attr("width", 1)
                        .attr("height", 25)
                        .attr("fill", "white")
                        .attr('stroke', 'black')
                        .attr("stroke-width", 1)
                        .on("mouseover", function (d) {
                            div.transition()
                                .duration(200)
                                .style("opacity", 0.9)
                                .style("text-align", "left");
                            //index,signal,time,model,length,stdv
                            div.html(
                                "<b>Inserted Bases:- <u>" + query_record[2] + "</u></u></b><br />" +
                                "<b>Quality:- : ;</b><br />" +
                                "<b>Reference Position: <u>" + (i + 1) + "</u></b>"
                            )
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY - 8) + "px");
                        })
                        .on("mouseout", function (d) {
                            div.transition()
                                .duration(500)
                                .style("opacity", 0);
                        });

                    // Make the insertion invisible first.
                    insert.attr("opacity",0);

                    insertions.push(insert);
                }
                else if(query_record[1] === null) { // DELETION


                    var del1 = readsSVG.append("rect")
                        .attr("x", scales.xR(i)+2)
                        .attr("y", scales.yR(j) - 400 + (j*25) -1)
                        .attr("class", "read" + j + "_" + i)
                        .attr("width", 25.2)
                        .attr("height", 17)
                        .attr("fill", "white");

                    // Make del1 invisible at first.
                    del1.attr("opacity",0);

                    deletions.push(del1);

                    var del2 = readsSVG.append("rect")
                        .attr("x", scales.xR(i)+2)
                        .attr("y", scales.yR(j) - 400 + (j*25) + 7)
                        .attr("class", "read" + j + "_" + i)
                        .attr("width", 25)
                        .attr("height", 1)
                        .attr("fill", "white")
                        .attr('stroke', 'black')
                        .attr("stroke-width",1);


                    // Make del2 invisible at first.
                    del2.attr("opacity",0);

                    deletions.push(del2);

                }
            }
            readInsertions.push(insertions);
            readDeletions.push(deletions);

        }


        // represents the tiles for the table.
        var titles = {
            "qname": "Read Name",
            "pos": "Postition",
            "length": "Nanopore Events",
            "span": "Reference Span (bp)"
        };



        var table = d3.select('.app').append('table').attr("class", "table table-hover"); // create table element.

        // add titles to the table and refer it by headers variable.
        var headers = table.append('thead')
            .append('tr')
            .selectAll('th')
            .data(d3.values(titles))
            .enter()
            .append('th')
            .text(function (d) {
                return d;
            });


        // create rows
        var rows = table.append('tbody')
            .selectAll('tr')
            .data(data_arr.slice(0,2))
            .enter()
            .append('tr').style("background-color",'#bcf5a6').attr("class",function(d,i){ return "row" + i; });


        rows.selectAll('td')
            .data(function(d) {


                return utils.tuplify(titles).map(function(k) {

                    // defines the position at which each field in the data is found.
                    field_number = { };
                    field_number["qname"] = 4;
                    field_number["pos"] = 3;
                    field_number["length"] = 1;
                    field_number["span"] = 7;



                    d_tup = utils.tuplify(d);
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
            if(reads_visible[i] === "visible"){

                indSGGraph[i].attr("opacity",0);
                indSGCricle[i].attr("opacity",0);
                indmSGGraph[i].attr("opacity",0);
                indReads[i].style("opacity",0);
                readInsertions[i].forEach(function(e){
                    e.style("opacity",0);
                });

                readDeletions[i].forEach(function(e){
                    e.style("opacity",0);
                });



                d3.select(".row" + i).style("background",'none');

                reads_visible[i] = "invisible";

            } else{

                indSGGraph[i].attr("opacity",1);
                indSGCricle[i].attr("opacity",1);
                indmSGGraph[i].attr("opacity",1);
                indReads[i].style("opacity",1);
                readInsertions[i].forEach(function(e){
                    e.style("opacity",1);
                });

                readDeletions[i].forEach(function(e){
                    e.style("opacity",1);
                });


                d3.select(".row" + i).style("background-color",'#bcf5a6');

                reads_visible[i] = "visible";
            }


        });
    }).header("Content-Type", "application/json");


    d3.json("http://homepage.usask.ca/~mts066/combined.json", function(error, data) {

        if (error) throw error;


        var numReads = data.length; // the number of reads in the jSON file


        numEvents = 0;  // Calculating the num of event_objects.


        var ymin = 9999, ymax = 0; //    y-max equals the max signal value from all the event_objects
        //  y-min equals the min signal value from all the pore-models.

        for (var i = 0; i < numReads; i++) {

            reads_visible[i] = "invisible"; // make every read visible.
            numEvents = Math.max(data[i].length, numEvents);

            // Represents an array of event_object
            // format:
            //     {
            //         "index": 1,
            //         "signal": 92.2417,
            //         "time": 368.58,
            //         "model": "TCGGT",
            //         "length": 0.0015,
            //         "stdv": 1.4271
            //     }
            var event_objects = data[i];

            // Convert all the integer values to integer.
            event_objects.forEach(function (d) {
                d.index = +d.index;
                d.signal = +d.signal;
                d.model = d.model;
                d.time = +d.time;
                d.length = +d.length;
                d.stdv = +d.stdv;
            });

            // Calculating y-min and y-max
            ymin = Math.min(d3.min(data[i], function (d) {
                return d.signal;
            }), ymin);
            ymax = Math.max(d3.max(data[i], function (d) {
                return d.signal;
            }), ymax);
        }

        // x domain for the signal graph is total number of event_objects.
        scales.xSG.domain([0, numEvents]);


        // y-scale for the signal graph.
        scales.ySG.domain([ymin, ymax]);

        // x domain for the mini signal graph
        scales.xmSG.domain(scales.xSG.domain());

        // y domain for the mini signal graph
        scales.ymSG.domain(scales.ySG.domain());


        // Creates a brush for mini signal data.
        var brush = d3.brushX()
            .extent([[0, 0], [utils.width, utils.heightminiSignalGraph]])
            .on("brush end", brushed);

        // create zoom function for the signal graph.
        var zoom = d3.zoom()
            .scaleExtent([1, numEvents])
            .translateExtent([[0, 0], [utils.width, utils.height]])
            .extent([[0, 0], [utils.width, utils.height]])
            .on("zoom", zoomed);


        var xAxisSG = d3.axisBottom(scales.xSG).tickSize(-utils.height), // x-axis for signal graph
            xAxis2mSG = d3.axisBottom(scales.xmSG), // x-axis for mini signal graph
            yAxis = d3.axisLeft(scales.ySG).ticks(5).tickSize(-utils.width); // y-axis for the signal graph.




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


        // populate the signal graph with circles for event points and line function.
        for (var i = 0; i < numReads; i++) {

            var circle = SGGraph.append("svg").attr("width", utils.width).attr("height", utils.height).attr("class", "circ" + i).selectAll("circle")
                .data(data[i])
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

            var basepairs = SGGraph.append("svg").attr("width", utils.width).attr("height", utils.height).attr("class", "bp" + i).selectAll("text")
                .data(data[i])
                .enter()
                .append("text")
                .attr("x", function (d) {
                    return scales.xSG(d.index);
                })
                .attr("y", function (d) {
                    return scales.ySG(d.signal);
                })
                .text(function(d){
                    return d.model[d.model.length-1];
                })
                .attr("class","bp")
                .attr("font-family","sans-serif")
                .attr("font-size","15px")
                .attr("stroke-width",4)
                .attr("fill", "black")
                .attr("style","display:none;");

            // Make all the circles invisible at first.
            circle.attr("opacity",0);

            indSGCricle.push(circle); // add the created sequence of circles to indSGCircle for later modification

            // create a path for the signal data.
            var graph = SGGraph.append("svg").attr("width", utils.width).attr("height", utils.height).append("path")
                .datum(data[i])
                .attr("class", "squiggle")
                .attr("id", "squigg1")
                .attr("d", lineFunctionSG)
                .attr("stroke", utils.colors[i])
                .attr("stroke-width", 2)
                .attr("fill", "none");

            // make all the SGGraph invisible at first.
            graph.attr("opacity",0);

            indSGGraph.push(graph); // add the created signal trace to the indSGGraph for later modification

            // create path for the mini signal data.
            var mGraph = mSGGraph.append("path")
                .datum(data[i])
                .attr("class", "squiggle")
                .attr("d", lineFunctionmSG)
                .attr("stroke", utils.colors[i])
                .attr("stroke-width", 2)
                .attr("fill", "none");

            // make all the mGraph invisible at first.
            mGraph.attr("opacity",0);

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


        function brushed() {

            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || scales.xmSG.range();

            scales.xSG.domain(s.map(scales.xmSG.invert, scales.xmSG));
            SGGraph.selectAll(".squiggle").attr("d", lineFunctionSG);
            SGGraph.select(".axis--x").call(xAxisSG);
            // reads.select(".axis--x").call(rXAxis);
            svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                .scale(utils.width / (s[1] - s[0]))
                .translate(-s[0], 0));

            // Make all the circles move when brushing the SG graph.
            SGGraph.selectAll("circle")
                .attr("cx", function(d){ return scales.xSG(d.index); })
                .attr("cy", function(d){ return scales.ySG(d.signal); });

            // Make all the text move when brushing the SG graph.
            SGGraph.selectAll(".bp")
                .attr("x", function(d){ return scales.xSG(d.index); })
                .attr("y", function(d){ return scales.ySG(d.signal) -10; });


        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = d3.event.transform;

            scales.xSG.domain(t.rescaleX(scales.xmSG).domain());
            SGGraph.selectAll(".squiggle").attr("d", lineFunctionSG);
            SGGraph.select(".axis--x").call(xAxisSG);
            mSGGraph.select(".brush").call(brush.move, scales.xSG.range().map(t.invertX, t));

            // Make all the circles move when brushing the SG graph.
            svg.selectAll(".dot")
                .attr("cx", function(d){ return scales.xSG(d.index); })
                .attr("cy", function(d){ return scales.ySG(d.signal); });

            // Make all the circles move when brushing the SG graph.
            svg.selectAll(".bp")
                .attr("x", function(d){ return scales.xSG(d.index); })
                .attr("y", function(d){ return scales.ySG(d.signal) -10; });


            currentDomain = scales.xSG.domain();
            if( (currentDomain[1] - currentDomain[0]) < 13 ){

                basepairs.attr("style","display:block");

            }

        }




    });


});
