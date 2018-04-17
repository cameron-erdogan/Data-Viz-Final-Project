const CANVAS_HEIGHT   =   700;
const CANVAS_WIDTH    =   700;
const PADDING         =   50;
const RADIUS          =   10;

var countryInfo, 
    svg, 
    x_dimension, 
    y_dimension, 
    x_scale, 
    y_scale;

function xVal(d) {
    return x_dimension ? d[x_dimension] : 0;
}

function yVal(d) {
    return y_dimension ? d[y_dimension] : 0;
}

function handleMouseOver(d, i) {
    svg.append("text")
       .attr('id', "label-" + d.Happiness_Rank)
       .attr('x', () => x_scale(xVal(d)) )
       .attr('y', () => (y_scale(yVal(d))-RADIUS-5) )
       .attr("text-anchor", "middle")
       .text(() => d.Country);
}

function handleMouseOut(d, i) {
    d3.select("#label-" + d.Happiness_Rank).remove();
}

function initPlot() {
    var xElem = document.getElementById("x-dim");
    x_dimension = xElem.options[xElem.selectedIndex].value;
    
    var yElem = document.getElementById("y-dim");
    y_dimension = yElem.options[yElem.selectedIndex].value;

    // setting up for x
    var xVal = function(d) { return d[x_dimension];}
    var xmax = d3.max(countryInfo, xVal);
    var xmin = d3.min(countryInfo, xVal);
    var xScale = d3.scaleLinear()
                   .domain([xmin, xmax])
                   .range([PADDING, CANVAS_WIDTH-PADDING]);
    x_scale = xScale;
    var xMap = function(d) { return xScale(xValue(d));}
    var xAxis = d3.axisBottom(xScale);

    // setting up for y
    var yVal = function(d) { return d[y_dimension];}
    var ymax = d3.max(countryInfo, yVal);
    var ymin = d3.min(countryInfo, yVal);
    var yScale = d3.scaleLinear()
                   .domain([ymin, ymax])
                   .range([CANVAS_HEIGHT-PADDING, PADDING]);
    y_scale = yScale;
    var yMap = function(d) { return yScale(yValue(d));}
    var yAxis = d3.axisLeft(yScale);


    // rendering scatter plot
    var circ = svg.selectAll("circle")
                  .data(countryInfo)
                  .enter()
                  .append("circle")
                  .attr("cx", function(d) { return xScale(xVal(d)); })
                  .attr("cy", function(d) { return yScale(yVal(d)); })
                  .attr("r", function(d) { return RADIUS; })
                  .attr("fill", "blue")
                  .attr("opacity", 0.5)
                  .on("mouseover", handleMouseOver)
                  .on("mouseout", handleMouseOut);

    renderScaleAndLabel(xAxis, yAxis)
}

function renderScaleAndLabel(xAxis, yAxis) {
    // x axis
    svg.append("g")
       .attr("id", "x-axis")
       .attr("class", "axis")
       .attr("transform", "translate(0," + (CANVAS_HEIGHT - PADDING) + ")")
       .call(xAxis);

    svg.append("text")
        .attr("id", "x-axis-label")
        .attr("text-anchor", "end")
        .attr("x", CANVAS_WIDTH)
        .attr("y", CANVAS_HEIGHT - 6)
        .text(x_dimension);

    // y axis
    svg.append("g")
       .attr("class", "axis")
       .attr("id", "y-axis")
       .attr("transform", "translate(" + PADDING + ", 0)")
       .call(yAxis);

    svg.append("text")
        .attr("id", "y-axis-label")
        .attr("text-anchor", "start")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "translate(" + PADDING + ", 10)")
        .text(y_dimension);
}

function clearScaleAndLabel() {
    d3.select("#x-axis").remove();
    d3.select("#x-axis-label").remove();
    d3.select("#y-axis").remove();
    d3.select("#y-axis-label").remove();
}

function updatePlot() {

    // setting up for x
    var xVal = function(d) { return d[x_dimension];}
    var xmax = d3.max(countryInfo, xVal);
    var xmin = d3.min(countryInfo, xVal);
    var xScale = d3.scaleLinear()
                   .domain([xmin, xmax])
                   .range([PADDING, CANVAS_WIDTH-PADDING]);
    x_scale = xScale;
    var xMap = function(d) { return xScale(xValue(d));}
    var xAxis = d3.axisBottom(xScale);

    // setting up for y
    var yVal = function(d) { return d[y_dimension];}
    var ymax = d3.max(countryInfo, yVal);
    var ymin = d3.min(countryInfo, yVal);
    var yScale = d3.scaleLinear()
                   .domain([ymin, ymax])
                   .range([CANVAS_HEIGHT-PADDING, PADDING]);
    y_scale = yScale;
    var yMap = function(d) { return yScale(yValue(d));}
    var yAxis = d3.axisLeft(yScale);


    // rendering scatter plot
    var circ = svg.selectAll("circle")
                  .data(countryInfo)
                  .transition()
                  .duration(1000)
                  .attr("cx", function(d) { return xScale(xVal(d)); })
                  .attr("cy", function(d) { return yScale(yVal(d)); });

    clearScaleAndLabel();
    renderScaleAndLabel(xAxis, yAxis);
}

function handleDimensionChange() {
    var xElem = document.getElementById("x-dim");
    x_dimension = xElem.options[xElem.selectedIndex].value;
    
    var yElem = document.getElementById("y-dim");
    y_dimension = yElem.options[yElem.selectedIndex].value;

    updatePlot();
}

d3.csv("data/world-happiness-report/2017.csv").then(function(happinessData) {

    happinessData.forEach(function(d) {
        d.Dystopia_Residual = +d.Dystopia_Residual;
        d.Economy_GDP_Per_Capita = +d.Economy_GDP_Per_Capita;
        d.Family = +d.Family;
        d.Freedom = +d.Freedom;
        d.Generosity = +d.Generosity;
        d.Happiness_Rank = +d.Happiness_Rank;
        d.Happiness_Score = +d.Happiness_Score;
        d.Health_Life_Expectancy = +d.Health_Life_Expectancy;
        d.Trust_Government_Corruption = +d.Trust_Government_Corruption;
        d.Whisker_High = +d.Whisker_High;
        d.Whisker_Low = +d.Whisker_Low;
    });

    countryInfo = happinessData;

    d3.csv("data/population.csv").then(function(populationData) {
        // console.log(countryInfo);

        populationData.forEach(function(d) {
            let name = d["Country Name"];
            let population = +d["2016"];
            countryInfo.forEach(function(thisCountry) {
                // console.log(countryInfo.Country);
                if (thisCountry.Country == name) {
                    // console.log(name);
                    thisCountry.Population = population;
                }
            });
        });

    });

    initPlot();
});


d3.select('#x-dim')
    .on("change", function () {
    handleDimensionChange();
    });

d3.select('#y-dim')
    .on("change", function () {
    handleDimensionChange();
    });

svg = d3.select("#plot")
        .append("svg")
        .attr("height", CANVAS_HEIGHT)
        .attr("width", CANVAS_WIDTH);