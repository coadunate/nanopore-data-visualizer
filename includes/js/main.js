var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([-width / 2, width / 2])
    .range([0, width]);


var y = d3.scale.linear()
    .domain([-height / 2, height / 2])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickSize(-width);

var zoom = d3.behavior.zoom()
    .x(x)
    .xExtent([-500,500])
    .scaleExtent([1, 700])
    .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

svg.append("rect")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height+ ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

function zoomed() {
  svg.select(".x.axis").call(xAxis);
  svg.select(".y.axis").call(yAxis);
}

svg.append("circle").attr("cx",100).attr("cy",100).attr("r",100);
