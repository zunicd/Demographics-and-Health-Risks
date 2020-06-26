// Setup the chart
//= ================================
var svgWidth = 960;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (healthData, err) {
    if (err) throw err;

    // Parse Data/Cast as numbers
    healthData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    //   // xLinearScale function above csv import
    //   var xLinearScale = xScale(healthData, chosenXAxis);

    // Create x scale function
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d.poverty) * 0.9,
        d3.max(healthData, d => d.poverty) * 1.1])
        .range([0, width]);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d.healthcare) -1,
        d3.max(healthData, d => d.healthcare) + 1])
        .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to the chart
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("g");

    var circlesGroupXY = circlesGroup.append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 12);

    // Create labels for circles
    // var circlesLabel = chartGroup.selectAll("null")
    //     .data(healthData)
    //     .enter()
    //     .append("text")
    //     .classed("stateText", true)
    //     .attr("x", d => xLinearScale(d.poverty))
    //     // +4 to center text vertically
    //     .attr("y", d => yLinearScale(d.healthcare) + 4)
    //     .attr("font-size", "12px")
    //     .text(d => d.abbr);

    var circlesLabel = circlesGroup.append("text")
        .text(d => d.abbr)
        .classed("stateText", true)
        .attr("dx", d => xLinearScale(d.poverty))
        // +4 to center text vertically
        .attr("dy", d => yLinearScale(d.healthcare) + 4)
        .attr("font-size", "12px");


    // Create x axis labels
    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .classed("aText active", true)
        .text("In Poverty (%)");

    // Create y axis labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("aText active", true)
        .text("Lacks Healthcare (%)");
}).catch(function (error) {
    console.log(error);
});
