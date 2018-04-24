const CANVAS_HEIGHT         =   500;
const CANVAS_WIDTH          =  1200;

const TEXT_LABEL_GUTTER     =    80;
const NUMERAL_LABEL_GUTTER  =    40;
const DIMENSION_LABEL_Y_OFFSET =  0;

const LEFT_PADDING          =   250;
const RIGHT_PADDING         =    30;
const TOP_PADDING           =   100;
const BOTTOM_PADDING        =    15;

const RADIUS                =    10;

const COUNTRIES_COUNT       =   155;

const INIT_COUNTRY = "China";
const DIMENSIONS = [
                        {'column_name':  "Happiness_Rank",
                         'display_name': "Happiness"},

                        {'column_name':  "Economy_GDP_Per_Capita_Rank",
                         'display_name': "GDP Per Capita"},

                        {'column_name':  "Family_Rank",
                         'display_name': "Family"},

                        {'column_name':  "Freedom_Rank",
                         'display_name': "Freedom"},

                        {'column_name':  "Generosity_Rank",
                         'display_name': "Generosity"},

                        {'column_name':  "Health_Life_Expectancy_Rank",
                         'display_name': "Life Expectancy"},

                        {'column_name':  "Trust_Government_Corruption_Rank",
                         'display_name': "Trust in Government"}                        
                    ];
const RANKING_GRIDLINES = [1, 30, 60, 90, 120, 150];

var countryInfo,
    countryInfoMap,
    svg,
    xScale,
    yScale;


var ranking_data = [1, 1, 1, 1, 1, 1, 1]
var axis_coords = [0, 0, 0, 0, 0, 0, 0]

function handleMouseOver(d, i) {
    svg.append("text")
       .attr('id', "label-" + d.Happiness_Rank)
       .attr('x', () => xScale(d) )
       .attr('y', () => (axis_coords[i]-RADIUS-5) )
       .attr("text-anchor", "middle")
       .text(() => d);
}

function handleMouseOut(d, i) {
    d3.select("#label-" + d.Happiness_Rank).remove();
}

function initPlot(country) {

    console.log(countryInfoMap.get(country));


    // Render ranking gridlines
    var line_top = TOP_PADDING + NUMERAL_LABEL_GUTTER;
    var line_bottom = CANVAS_HEIGHT - BOTTOM_PADDING;

    for (l = 0; l < RANKING_GRIDLINES.length; l++) {
        var xCoord = xScale(RANKING_GRIDLINES[l]);
        var gridlineCoords = [[xCoord, line_top], [xCoord, line_bottom]];
        var lineGenerator = d3.line();
        var pathString = lineGenerator(gridlineCoords);
        svg.append("path")
           .attr("class", "gridline")
           .attr('d', pathString);
        svg.append("text")
           .attr("class", "ranking-gridline-label")
           .attr("text-anchor", "middle")
           .attr("x", xCoord)
           .attr("y", TOP_PADDING - 25)
           .text(RANKING_GRIDLINES[l]);
    }

    // Render dimension labels
    svg.append("text")
       .attr("class", "dimension-label")
       .attr("text-anchor", "end")
       .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
       .attr("y", TOP_PADDING - 25)
       .text("Rank");

    for (d = 0; d < DIMENSIONS.length; d++) {
        var yCoord = (yScale(d) + yScale(d+1))/2;
        axis_coords[d] = yCoord;
        ranking_data[d] = countryInfoMap.get(country)[DIMENSIONS[d].column_name];
        svg.append("text")
           .attr("class", "dimension-label")
           .attr("text-anchor", "end")
           .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
           .attr("y", yCoord - DIMENSION_LABEL_Y_OFFSET)
           .text(DIMENSIONS[d].display_name);
    }

    console.log(ranking_data);

    // Render circles
    var circ = svg.selectAll("circle")
                  .data(ranking_data)
                  .enter()
                  .append("circle")
                  .attr("cx", function(d, i) { return xScale(ranking_data[i]); })
                  .attr("cy", function(d, i) { return axis_coords[i]; })
                  .attr("r", function(d) { return RADIUS; })
                  .attr("fill", "blue")
                  .attr("opacity", 0.5)
                  .on("mouseover", handleMouseOver)
                  .on("mouseout", handleMouseOut);
}

function updatePlot(country) {
    for (d = 0; d < DIMENSIONS.length; d++) {
        ranking_data[d] = countryInfoMap.get(country)[DIMENSIONS[d].column_name];
    }

    var circ = svg.selectAll("circle")
                  .data(ranking_data)
                  .transition()
                  .duration(1000)
                  .attr("cx", function(d, i) { return xScale(ranking_data[i]); });

}

svg = d3.select("#plot")
        .append("svg")
        .attr("height", CANVAS_HEIGHT)
        .attr("width", CANVAS_WIDTH);

d3.csv("data/world-happiness-report/2017_with_ranking.csv").then(function(happinessData) {

    happinessData.forEach(function(d) {
        d.Dystopia_Residual = +d.Dystopia_Residual;
        d.Economy_GDP_Per_Capita = +d.Economy_GDP_Per_Capita;
        d.Economy_GDP_Per_Capita_Rank = +d.Economy_GDP_Per_Capita_Rank;
        d.Family = +d.Family;
        d.Family_Rank = +d.Family_Rank;
        d.Freedom = +d.Freedom;
        d.Freedom_Rank = +d.Freedom_Rank;
        d.Generosity = +d.Generosity;
        d.Generosity_Rank = +d.Generosity_Rank;
        d.Happiness_Rank = +d.Happiness_Rank;
        d.Happiness_Score = +d.Happiness_Score;
        d.Health_Life_Expectancy = +d.Health_Life_Expectancy;
        d.Health_Life_Expectancy_Rank = +d.Health_Life_Expectancy_Rank;
        d.Trust_Government_Corruption = +d.Trust_Government_Corruption;
        d.Trust_Government_Corruption_Rank = +d.Trust_Government_Corruption_Rank;
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

    countryInfoMap = d3.map(countryInfo, (d) => d.Country);
    xScale = d3.scaleLinear()
               .domain([1, COUNTRIES_COUNT])
               .range([LEFT_PADDING, CANVAS_WIDTH - LEFT_PADDING - RIGHT_PADDING]);
    yScale = d3.scaleLinear()
               .domain([0, DIMENSIONS.length])
               .range([TOP_PADDING + NUMERAL_LABEL_GUTTER, CANVAS_HEIGHT- BOTTOM_PADDING]);
    initPlot(INIT_COUNTRY);
});

