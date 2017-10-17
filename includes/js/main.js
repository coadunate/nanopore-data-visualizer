// The configuration for the graph.
var
    marginFocus = {top: 30, right: 50, bottom: 90, left: 50},
    marginContext = {top: 530, right: 20, bottom: 40, left: 40},

    width = (window.innerWidth) - marginFocus.left - marginFocus.right-20, // width = 900
    height = 602 - marginFocus.top - marginFocus.bottom, // height = 370

    height2 = 602 - marginContext.top - marginContext.bottom; // height2 = 40

// The svg contians everthing inside the graph.
var svg = d3.select(".app").append("svg")
    .attr("width", width + marginFocus.left + marginFocus.right)
    .attr("height", height + marginFocus.top + marginFocus.bottom + 100 + 500);


// Creating scales for the graph.
var x = d3.scaleLinear().range([0 , width]),
    x2 = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

    rX = d3.scaleLinear().range([0, width]); // the scales for read alignment view.



var lineFunction = d3.line()
    .x(function(d) { return x(d.index); })
    .y(function(d) { return y(d.signal); });

var lineFunction2 = d3.line()
    .x(function(d) { return x2(d.index); })
    .y(function(d) { return y2(d.signal); });

let tuplify = obj => Object.keys(obj).reduce((m,k) => m.concat([[k, obj[k]]]), []);

var colors = [
  "purple",
  "#DF7401",
  "teal",
  "yellow",
  "pink",
  "red"
];

var base_colors = {
    "A": "orange", // A
    "T": "red", // T
    "G": "blue", // G
    "C": "green" // C
};

function isLower(character) {
    return (character === character.toLowerCase()) && (character !== character.toUpperCase());
}

// This represents the strip below showing the mini version of the graph.
var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + marginContext.left + "," + marginContext.top + ")");

d3.json("/data/combined.json", function(error, data) {
    var dataset_visible = [];
    if (error) throw error;


    for (var i = 0; i < data.length - 1; i++) {
        dataset_visible[i] = "hidden";

        data[i][0].forEach(function (d) {
            d.index = +d.index;
            d.signal = +d.signal;
            d.model = d.model;
            d.time = +d.time;
            d.length = +d.length;
            d.stdv = +d.stdv;
        });
    }



    x.domain([0, 1000]);

    var ymin = 9999, ymax = 0;
    for (var i = 0; i < data.length - 1; i++) {
        ymin = Math.min(d3.min(data[i][0], function (d) {
            return d.signal;
        }), ymin);
        ymax = Math.max(d3.max(data[i][0], function (d) {
            return d.signal;
        }), ymax);
    }

    y.domain([ymin, ymax]);

    x2.domain(x.domain());
    y2.domain(y.domain());

    rX.domain([0, 125]);


    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    maxDataLength = 0;
    for (var i = 0; i < data.length - 1; i++) {
        maxDataLength = Math.max(data[i][0].length, maxDataLength);
    }

    var zoom = d3.zoom()
        .scaleExtent([1, maxDataLength])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    var rXZoom = d3.zoom()
        .scaleExtent([1, maxDataLength])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", rXZoomed);


    var xAxis = d3.axisBottom(x).tickSize(-height),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y).ticks(5).tickSize(-width);

    var rXAxis = d3.axisBottom(rX);

    (function(){



        var sortAscending = true;

        var titles = {
            "qname": "Read Name",
            "pos": "Postition",
            "length": "Nanopore Events",
            "span": "Reference Span (bp)"
        };


        var table = d3.select('.app').append('table').attr("class","table table-hover");

        var headers = table.append('thead')
            .append('tr')
            .selectAll('th')
            .data(d3.values(titles))
            .enter()
            .append('th')
            .text(function(d) {
                return d;
            });

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


    var reads = svg.append("g")
        .attr("class", "reads")
        .attr("transform", "translate(" + marginFocus.left + "," + (marginFocus.top + height + height2 + 100) + ")")
        .call(rXZoom);

    var read_container = reads.append("g").attr("class", "container");

    read_container.append("g")
        .attr("class", "axis rXaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(rXAxis);


    // reads.append("text")
    //     .style("text-anchor", "middle")
    //     .style("font-size", "15px")
    //     .attr("transform", "rotate(-90) translate(" + -height / 2 + ",-30)")
    //     .text("# Reads");

    // This is the main graph.
    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + marginFocus.left + "," + marginFocus.top + ")")
        .call(zoom);

    // comment this line to get the popup appear.
    // var rect = svg.append("rect")
    //     .attr("width", width)
    //     .attr("transform", "translate(50,0)")
    //     .attr("height", height)
    //     .style("fill", "none")
    //     .style("pointer-events", "all").call(zoom);

    var container = focus.append("g").attr("class", "container");

    container.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    container.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    focus.append("text")
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .attr("transform", "rotate(-90) translate(" + -height / 2 + ",-30)")
        .text("Signal Value (pA)");

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    for (var i = 0; i < data.length - 1; i++) {
        focus.append("svg").attr("width", width).attr("height", height).attr("class", "circ" + i).selectAll("circle")
            .data(data[i][0])
            .enter()
            .append("circle")
            .on("click", function (d) {
                console.log("Yo!");
            })
            .attr("cx", function (d) {
                return x(d.index);
            })
            .attr("cy", function (d) {
                return y(d.signal);
            })
            .attr("fill", i == 0 ? "black" : "black")
            .style("opacity", dataset_visible[i] == "hidden" ? 1 : 1)
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

        focus.append("svg").attr("width", width).attr("height", height).append("path")
            .datum(data[i][0])
            .attr("class", "squiggle")
            .attr("id", "squigg1")
            .attr("d", lineFunction)
            .attr("stroke", colors[i])
            .attr("stroke-width", 2)
            .attr("fill", "none");

        context.append("path")
            .datum(data[i][0])
            .attr("class", "squiggle")
            .attr("d", lineFunction2)
            .attr("stroke", colors[i])
            .attr("stroke-width", 2)
            .attr("fill", "none");
    }


    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    // read1
    for (var j = 0; j < data.length-1; j++){
        read_svg = reads.append("svg").attr("width", width).attr("height", height).attr("class", "read" + j);
        for (var i = 0; i < data[j][1].span; i++) {
            var query = data[j][1].query[i];

            //console.log((i+1) + ". QUERY: " + data[j][1].query[i]);

            if(query[0] === null){ // insertion
                //console.log("INSERTION");

                read_svg.append("rect")
                    .attr("x", rX(i) + 25)
                    .attr("y", y(130) + (j * 50))
                    .attr("class", "read" + j + "_" + i)
                    .attr("width", 20)
                    .attr("height", 25)
                    .attr("fill", colors[j])
                    .attr('stroke', 'black');

                read_svg.append("rect")
                    .attr("x", rX(i) + 25)
                    .attr("y", y(130) + (j * 50)  - 5)
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
                    .attr("x", rX(i) + 25)
                    .attr("y", y(130) + (j * 50))
                    .attr("class", "read" + j + "_" + i)
                    .attr("width", 20)
                    .attr("height", 25)
                    .attr("fill", "white")

                read_svg.append("rect")
                    .attr("x", rX(i) + 25)
                    .attr("y", y(130) + (j * 50) +11)
                    .attr("class", "read" + j + "_" + i)
                    .attr("width", 35)
                    .attr("height", 1)
                    .attr("fill", "white")
                    .attr('stroke', 'black')
                    .attr("stroke-width",2);


            }else{ // normal case.

                read_svg.append("rect")
                    .attr("x", rX(i) + 25)
                    .attr("y", y(130) + (j * 50))
                    .attr("class", "read" + j + "_" + i)
                    .attr("width", 20)
                    .attr("height", 25)
                    .attr("fill", colors[j])
                    .attr('stroke', 'black')
                    .attr('stroke-width',2);
                if(isLower(query[2])){
                    read_svg.append("text").attr("x",rX(i) +25 + 1.6).attr("y",y(130) + (j * 50) +15).text(data[j][1].seq[i]).attr("font-family","sans-serif").attr("font-size","12px").attr("fill","white");
                }
            }

            // if(query[0] != null) {
            //
            //     if(isLower(query[2])){
            //
            //         read_svg.append("rect")
            //             .attr("x", rX(i) + 25)
            //             .attr("y", y(130) + (j * 50))
            //             .attr("class", "read" + j + "_" + i)
            //             .attr("width", 20)
            //             .attr("height", 25)
            //             .attr("fill", colors[j])
            //             .attr('stroke', 'black')
            //
            //         read_svg.append("text").attr("x",rX(i) +25 + 1).attr("y",y(130) + (j * 50) +15).text(data[j][1].seq[i]).attr("font-family","sans-serif").attr("font-size","10px").attr("fill","black");
            //
            //     }
            //     else{ // normal case.
            //         read_svg.append("rect")
            //             .attr("x", rX(i) + 25)
            //             .attr("y", y(130) + (j * 50))
            //             .attr("class", "read" + j + "_" + i)
            //             .attr("width", 20)
            //             .attr("height", 25)
            //             .attr("fill", colors[j])
            //             .attr('stroke', 'black');
            //     }
            // }else{
            //     read_svg.append("rect")
            //         .attr("x", rX(i) + 25)
            //         .attr("y", y(130) + (j * 50))
            //         .attr("class", "read" + j + "_" + i)
            //         .attr("width", 20)
            //         .attr("height", 25)
            //         .attr("fill", "white")
            //         .attr('stroke', 'black');
            //
            //     read_svg.append("rect")
            //         .attr("x", rX(i) + 25 + 3)
            //         .attr("y", y(130) + (j * 50))
            //         .attr("class", "read" + j + "_" + i)
            //         .attr("width", 2)
            //         .attr("height", 25)
            //         .attr("fill", "white")
            //         .attr('stroke', 'grey')
            //         .attr("stroke-width",4);
            //
            // }
            //
            // if(isLower(query[2])){
            //
            // }

        }
    }


    // add reference
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
            .attr("x", rX(i) + 25)
            .attr("y", y(65))
            .attr("class", "read" + j + "_" + i)
            .attr("width", 20)
            .attr("height", 25)
            .attr("fill", base_color)
            .attr('stroke', 'black');



        reference.append("text")
                  .attr("x",rX(i) +25 + 2)
                  .attr("y",y(62))
                  .text(data[3].ref[i])
                  .attr("font-family","sans-serif")
                  .attr("font-size","10px")
                  .attr("fill", "white");

    }

    // reads.append("svg")
    //     .attr("width",width)
    //     .attr("height",height)
    //     .selectAll("rect")
    //     .data(data[0][0])
    //     .enter()
    //     .append("rect")
    //     .attr("x",x())

    // reads.append("svg")
    //         .attr("width",width)
    //         .attr("height",height)
    //         .attr("class","read1")
    //         .selectAll("rect")
    //           .data(data[0][0])
    //           .enter()
    //           .append("circle")
    //             .attr("cx",x(1000))
    //             .attr("cy",y(100))
    //             .attr("r",5);



    // for(var i = 0; i < data.length-1; i++){
    //   reads.append("svg")
    //           .attr("width",width)
    //           .attr("height",height)
    //           .append("rect")
    //           .attr("x",x(0))
    //           .attr("y",100 + (i*(25*2)))
    //           .attr("class","read1")
    //           .attr("width",x(data[i][0].length))
    //           .attr("height",25)
    //           .attr("fill",colors[i]);
    //
    // }


    // for(var i = 0; i < data.length-1; i++){
    //   reads.append("svg")
    //           .attr("width",width)
    //           .attr("height",height)
    //           .attr("class","read" + i)
    //           .on("click",function(){
    //             // var active = ("sqigg" + (i-1)).active ? false : true,
    //             //     newOP = active ? 1 : 0;
    //             // d3.select("#squigg" + (i-1)).style("opacity",newOP);
    //
    //             // console.log("dataset_visible[" + (i-1) + "]");
    //             // console.log(dataset_visible)
    //             // dataset_visible[i-1] = "visible";
    //             // d3.select(".squigg" + i-1).style("opacity",1);
    //           })
    //           .selectAll("rect")
    //        .data(data[i])
    //        .enter()
    //        .append("rect")
    //        .attr("x", function(d){ return x(d.length); })
    //        .attr("y", y(140 - (10*i) ) )
    //        .attr("width", x(1000))
    //        .attr("height",50)
    //        .attr("class","read-rect")
    //        .attr("fill", i==0 ? "blue" : "red" );
    // }


    function brushed() {

        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        focus.selectAll(".squiggle").attr("d", lineFunction);
        focus.select(".axis--x").call(xAxis);
        //reads.select(".axis--x").call(rXAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));


        focus.selectAll("circle")
            .attr("cx", function(d){ return x(d.index); })
            .attr("cy", function(d){ return y(d.signal); });


    }

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());
        focus.selectAll(".squiggle").attr("d", lineFunction);
        focus.select(".axis--x").call(xAxis);
        reads.select(".rXaxis").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));

        svg.selectAll(".dot")
            .attr("cx", function(d){ return x(d.index); })
            .attr("cy", function(d){ return y(d.signal); });

        for(var i = 0; i < data[0][1].span; i++){
            svg.selectAll(".read1")
                .attr("x",x(i));
        }

        // svg.selectAll(".read-rect")
        //     .attr("x", function(d){ return x(d.index); })
        //     .attr("width",function(d){ return x(d.index + 100) > 0 ? x(d.index + 100) : 0; });


    }

    function rXZoomed(){

    }

});

// function type(d) {
//     d.index = d.index;
//     d.signal = +d.signal;
//     d.time = +d.time;
//     d.length = +d.length;
//     d.stdv = +d.stdv;
//     return d;
// }
