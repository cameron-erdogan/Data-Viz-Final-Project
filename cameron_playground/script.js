// LAYOUT SETTINGS
const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 1200;

const TEXT_LABEL_GUTTER = 80;
const NUMERAL_LABEL_GUTTER = 40;
const DIMENSION_LABEL_Y_OFFSET = 0;

const LEFT_PADDING = 250;
const RIGHT_PADDING = 30;
const TOP_PADDING = 100;
const BOTTOM_PADDING = 15;

// MARKER SETTINGS
const CIRCLE_RADIUS = 10;
const SQ_SIDE_LENGTH = 20;
const SQ_CORNER_RADIUS = 2;
const CIRCLE_OPACITY = 1; // [0.0 - 1.0]
const VIZ3_ACCENT_COLOR = "blue";
const VIZ4_C1_ACCENT_COLOR = "green";
const VIZ4_C2_ACCENT_COLOR = "red";

// DATA SETTINGS
const COUNTRIES_COUNT = 155;
const VIZ3_INIT_COUNTRY = "China";
const VIZ4_INIT_COUNTRY1 = "China";
const VIZ4_INIT_COUNTRY2 = "Australia";


// LINE SETTINGS
const GRAPH_LINE_WIDTH = 1;
const GRAPH_LINE_COLOR = "gray";
const DASHARRAY_STYLE = "5,5";
const RANKING_GRIDLINES = [1, 30, 60, 90, 120, 150];

// INTERACTION SETTINGS
const TRANSITION_DURATION = 1000;

var countryInfo, swarmSVG;

var viz3_ranking_data = [1, 1, 1, 1, 1, 1, 1];
var viz4_country1_ranking_data = [1, 1, 1, 1, 1, 1, 1];
var viz4_country2_ranking_data = [1, 1, 1, 1, 1, 1, 1];
var axis_coords = [0, 0, 0, 0, 0, 0, 0];

function areaToRadius(area) {
    let radius = Math.sqrt(area); //not gonna worry about diving by Pi
    return radius;
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

function initSwarmPlot(data) {

    var margin = { top: 40, right: 40, bottom: 40, left: 40 },
        width = swarmSVG
        .attr("width") - margin.left - margin.right,
        height = swarmSVG
        .attr("height") - margin.top - margin.bottom;

    var formatValue = d3.format(".3s");

    var x = d3.scaleLinear()
        .rangeRound([0, width]);

    var g = swarmSVG
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(data, function(d) { return d.Happiness_Score; }));

    var scaleArea = d3.scaleLinear()
        .range([20, 1000])
        .domain(d3.extent(data, function(d) { return d.Population; }));

    var simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(function(d) { return x(d.Happiness_Score); }).strength(1))
        .force("y", d3.forceY(height / 2))
        .force("collide", d3.forceCollide(function(d) {
            let area = scaleArea(d.Population);
            return areaToRadius(area) + 2;
        }))
        .stop();

    for (var i = 0; i < 120; ++i) simulation.tick();

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10, ".1s"));

    var cell = g.append("g")
        .attr("class", "cells")
        .selectAll("g").data(d3.voronoi()
            .extent([
                [-margin.left, -margin.top],
                [width + margin.right, height + margin.top]
            ])
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .polygons(data)).enter().append("g");

    cell.append("circle")
        .attr("r", function(d) {
            var area = scaleArea(d.data.Population);
            let radius = areaToRadius(area);
            return radius;
        })
        .attr("cx", function(d) { return d.data.x; })
        .attr("cy", function(d) { return d.data.y; })
        .style("fill", function(d) {
            return continentToColor(d.data.Continent);
        });

    cell.append("path")
        .attr("d", function(d) { return "M" + d.join("L") + "Z"; });

    cell.append("title")
        .text(function(d) { return d.data.Country + "\n" + d.data.Continent + "\n" + formatValue(d.data.Happiness_Score); });
}

function updateSwarmPlot(parameter) {
    //should be key of the parameter to change
    console.log(parameter);

}

function handleSwarmParameterChange() {
    // var viz4C2SelectElem = document.getElementById("viz4-country2-select");
    // var viz4Country2 = viz4C2SelectElem.options[viz4C2SelectElem.selectedIndex].value;
    // updateViz4Plot(null, viz4Country2);
    var swarmSelectElem = document.getElementById("swarm-parameter-select");
    var swarmParameter = swarmSelectElem.options[swarmSelectElem.selectedIndex].value;
    updateSwarmPlot(swarmParameter);
}

swarmSVG = d3.select("#swarm-plot")
    .append("svg")
    .attr("height", CANVAS_HEIGHT)
    .attr("width", CANVAS_WIDTH);

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

    initSwarmPlot(countryInfo);
    console.log(countryInfo);
});

/*****************************************************************************
 * Event Handlers
 */
var swarmSelect = d3.select('#swarm-parameter-select')
    .on("change", function() {
        handleSwarmParameterChange();
    });