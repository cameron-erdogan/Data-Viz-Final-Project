var countryInfo;

function areaToRadius(area) {
    let radius = Math.sqrt(area); //not gonna worry about diving by Pi
    return radius;
}

function execute(data) {
    var svg = d3.select("svg"),
        margin = { top: 40, right: 40, bottom: 40, left: 40 },
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom;

    var formatValue = d3.format(".3s");

    var x = d3.scaleLinear()
        .rangeRound([0, width]);

    var g = svg.append("g")
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
        .attr("cy", function(d) { return d.data.y; });

    cell.append("path")
        .attr("d", function(d) { return "M" + d.join("L") + "Z"; });

    cell.append("title")
        .text(function(d) { return d.data.Country + "\n" + d.data.Continent + "\n" + formatValue(d.data.Happiness_Score); });
}

function type(d) {
    if (!d.value) return;
    d.value = +d.value;
    return d;
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

    execute(countryInfo);
    console.log("reading and printing");
    console.log(countryInfo);
});