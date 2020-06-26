// Setup the chart
//= ================================
var svgWidth = 900;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
//=================================
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.9,
    d3.max(healthData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
//=================================
function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) -1,
    d3.max(healthData, d => d[chosenYAxis]) +1
    ])
    .range([height, 0]);

  return yLinearScale;
}

// Function used for updating xAxis var upon click on x axis label
//=================================
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Function used for updating yAxis var upon click on y axis label
//=================================
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Function used for updating circles group with a transition to
// new circles upon click on x axis label
//=================================
function renderCirclesX(circlesGroupXY, newXScale, chosenXAxis) {

  circlesGroupXY.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroupXY;
}

// Function used for updating circles group with a transition to
// new circles upon click on y axis label
//=================================
function renderCirclesY(circlesGroupXY, newYScale, chosenYAxis) {

  circlesGroupXY.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroupXY;
}

// Function used for updating circles labels with a transition to
// new circles upon click on x axis label
//=================================
function renderCLabelsX(circlesLabel, newXScale, chosenXAxis) {

  circlesLabel.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesLabel;
}

// Function used for updating circles labels with a transition to
// new circles upon click on y axis label
//=================================
function renderCLabelsY(circlesLabel, newYScale, chosenYAxis) {

  circlesLabel.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]) + 4);

  return circlesLabel;
}

// Function used for updating circles group with new tooltip
//=================================
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xLabel;
  var yLabel;
  var xUnit;
  var yUnit;

  // Tooltip values for x axis
  if (chosenXAxis === "poverty") {
    xLabel = "In Poverty:";
    xUnit = "%";
  } else if (chosenXAxis === "age") {
    xLabel = "Age:";
    xUnit = "";
  } else {
    xLabel = "Household Income:";
    xUnit = "";
  }

  // Tooltip values for y axis
  if (chosenYAxis === "healthcare") {
    yLabel = "Lacks Healthcare:";
    yUnit = "%";
  } else if (chosenYAxis === "smokes") {
    yLabel = "Smokes:";
    yUnit = "%";
  } else {
    yLabel = "Obese:";
    yUnit = "%";
  }

  // Function to format number as US $
  var formatMoney = d => `\$${d3.format(",")(d)}`;

  // Prepare tooltip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    // .offset([45, -80])
    .direction("w")
    .html(function (d) {
      if (chosenXAxis === "income") {
        return (`${d.state}<br>${xLabel} ${formatMoney(d[chosenXAxis])} ${xUnit}<br>${yLabel} ${d[chosenYAxis]} ${yUnit}`);
      }
      else {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]} ${xUnit}<br>${yLabel} ${d[chosenYAxis]} ${yUnit}`);
      }
    });

  circlesGroup.call(toolTip);

  // on mouseover event
  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data, this);
    var stid = d3.select(this).text();
    d3.select(`#${stid}`)
      .style("stroke", "black");
  })
    // on mouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
      var stid = d3.select(this).text();
      d3.select(`#${stid}`)
        .style("stroke", "#e3e3e3");
    });
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (healthData, err) {
  if (err) throw err;

  console.log(healthData);
  // parse data
  healthData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);
  // yLinearScale function above csv import
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // Create initial groups for circles and labels
  var circlesGroup = chartGroup.selectAll("null")
    .data(healthData)
    .enter()
    .append("g");

  // Create initial circles
  var circlesGroupXY = circlesGroup.append("circle")
    .classed("stateCircle", true)
    // "id" will be used for mouseover/out events
    .attr("id", d => d.abbr)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12);

  // Create labels for circles
  var circlesLabel = circlesGroup.append("text")
    .text(d => d.abbr)
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    // +4 to center text vertically
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 4)
    .attr("font-size", "12px");

  // X axis labels
  //=================================
  // Create group for two x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Y axis labels
  //=================================
  // Create group for two y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 50)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 30)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 10)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // X axis labels event listener
  //=================================
  xLabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");

      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroupXY = renderCirclesX(circlesGroupXY, xLinearScale, chosenXAxis);

        // updates circles labeels with new x values
        circlesLabel = renderCLabelsX(circlesLabel, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // Y axis labels event listener
  //=================================
  yLabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");

      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroupXY = renderCirclesY(circlesGroupXY, yLinearScale, chosenYAxis);

        // updates circles labeels with new y values
        circlesLabel = renderCLabelsY(circlesLabel, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function (error) {
  console.log(error);
});
