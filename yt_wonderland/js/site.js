const CANVAS_HEIGHT   =   700;
const CANVAS_WIDTH    =   700;
const PADDING         =   80;
const RADIUS          =   10;

var countryInfo, 
    svg, 
    x_dimension, 
    y_dimension, 
    x_scale, 
    y_scale,
    area_scale;

function xVal(d) {
    return x_dimension ? d[x_dimension] : 0;
}

function yVal(d) {
    return y_dimension ? d[y_dimension] : 0;
}

function continentToColor(continent) {
    switch (continent) {
        case "Asia":
            return "F8E21C";
        case "Africa":
            return "DB5082";
        case "South America":
            return "000000";
        case "North America":
            return "bbbbbb";
        case "Europe":
            return "C1C2FF";
        case "Oceania":
            return "9A3CFF";
        default:
            return "red";
    }
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

function computeCircleRadius(population) {
    var radius = Math.sqrt(area_scale(population)) + 2;
    return radius;
}

function initPlot() {
    area_scale = d3.scaleLinear()
                    .range([40, 2000])
                    .domain(d3.extent(countryInfo, function(d) { return d.Population; }));

    var xElem = document.getElementById("x-dim");
    x_dimension = xElem.options[xElem.selectedIndex].value;
    
    var yElem = document.getElementById("y-dim");
    y_dimension = yElem.options[yElem.selectedIndex].value;

    // setting up for x
    var xmax = d3.max(countryInfo, xVal);
    var xmin = d3.min(countryInfo, xVal);
    var xScale = d3.scaleLinear()
                   .domain([xmin, xmax])
                   .range([PADDING, CANVAS_WIDTH-PADDING]);
    x_scale = xScale;
    var xMap = function(d) { return xScale(xValue(d));}
    var xAxis = d3.axisBottom(xScale);

    // setting up for y
    var ymax = d3.max(countryInfo, yVal);
    var ymin = d3.min(countryInfo, yVal);
    var yScale = d3.scaleLinear()
                   .domain([ymin, ymax])
                   .range([CANVAS_HEIGHT-PADDING, PADDING]);
    y_scale = yScale;
    var yMap = function(d) { return yScale(yValue(d));}
    var yAxis = d3.axisLeft(yScale);

    // force simulation
    forceSimulation();

    var circ = svg.selectAll("circle")
                  .data(countryInfo)
                  .enter()
                  .append("circle")
                  .attr("cx", (d) => d.x )
                  .attr("cy", (d) => d.y )
                  .attr("r", (d) => computeCircleRadius(d.Population))
                  .style("fill", (d) => continentToColor(d.Continent))
                  .append("svg:title")
                  .text((d, i) => { return d.Country; });

    renderScaleAndLabel(xAxis, yAxis)
}

function forceSimulation() {
    var simulation = d3.forceSimulation(countryInfo)
        .force("x", d3.forceX((d) => x_scale(xVal(d))).strength(1))
        .force("y", d3.forceY((d) => y_scale(yVal(d))).strength(1))
        .force("collide", d3.forceCollide(( (d) => computeCircleRadius(d.Population)+2)))
        .stop();
    for (var i = 0; i < 200; ++i) simulation.tick();
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
    var xmax = d3.max(countryInfo, xVal);
    var xmin = d3.min(countryInfo, xVal);
    var xScale = d3.scaleLinear()
                   .domain([xmin, xmax])
                   .range([PADDING, CANVAS_WIDTH-PADDING]);
    x_scale = xScale;
    var xMap = function(d) { return xScale(xValue(d));}
    var xAxis = d3.axisBottom(x_scale);

    // setting up for y
    var ymax = d3.max(countryInfo, yVal);
    var ymin = d3.min(countryInfo, yVal);
    var yScale = d3.scaleLinear()
                   .domain([ymin, ymax])
                   .range([CANVAS_HEIGHT-PADDING, PADDING]);
    y_scale = yScale;
    var yMap = function(d) { return yScale(yValue(d));}
    var yAxis = d3.axisLeft(y_scale);

    forceSimulation();

    // rendering scatter plot
    var circ = svg.selectAll("circle")
                  .data(countryInfo)
                  .transition()
                  .duration(1000)
                  .attr("cx", (d) => d.x)
                  .attr("cy", (d) => d.y);

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

d3.csv("data/All-The-Data.csv").then(function(happinessData) {

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
        d.Population = +d.Population;
    });

    countryInfo = happinessData;

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