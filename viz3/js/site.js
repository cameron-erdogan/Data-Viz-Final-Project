// LAYOUT SETTINGS
const CANVAS_HEIGHT         =   500;
const CANVAS_WIDTH          =  1200;

const TEXT_LABEL_GUTTER     =    80;
const NUMERAL_LABEL_GUTTER  =    40;
const DIMENSION_LABEL_Y_OFFSET =  0;

const LEFT_PADDING          =   250;
const RIGHT_PADDING         =    30;
const TOP_PADDING           =   100;
const BOTTOM_PADDING        =    15;

// MARKER SETTINGS
const CIRCLE_RADIUS         =    10;
const SQ_SIDE_LENGTH        =    20;
const SQ_CORNER_RADIUS      =     2;
const CIRCLE_OPACITY        =     1;  // [0.0 - 1.0]
const VIZ3_ACCENT_COLOR     = "blue";
const VIZ4_C1_ACCENT_COLOR  = "green";
const VIZ4_C2_ACCENT_COLOR  = "red";

// DATA SETTINGS
const COUNTRIES_COUNT       =   155;
const VIZ3_INIT_COUNTRY     = "China";
const VIZ4_INIT_COUNTRY1    = "China";
const VIZ4_INIT_COUNTRY2    = "Australia";


// LINE SETTINGS
const GRAPH_LINE_WIDTH      = 1;
const GRAPH_LINE_COLOR      = "gray";
const DASHARRAY_STYLE       = "5,5";
const RANKING_GRIDLINES     = [1, 30, 60, 90, 120, 150];

// INTERACTION SETTINGS
const TRANSITION_DURATION   =  1000;

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

var countryInfo,
    countryInfoMap,
    viz3_svg,
    viz4_svg,
    xScale,
    yScale;


var viz3_ranking_data = [1, 1, 1, 1, 1, 1, 1];
var viz4_country1_ranking_data = [1, 1, 1, 1, 1, 1, 1];
var viz4_country2_ranking_data = [1, 1, 1, 1, 1, 1, 1];
var axis_coords = [0, 0, 0, 0, 0, 0, 0];


/*****************************************************************************
 *  Viz3 functions
 */

function initViz3Plot(country) {

    // Render ranking gridlines
    var line_top = TOP_PADDING + NUMERAL_LABEL_GUTTER;
    var line_bottom = CANVAS_HEIGHT - BOTTOM_PADDING;

    for (l = 0; l < RANKING_GRIDLINES.length; l++) {
        var xCoord = xScale(RANKING_GRIDLINES[l]);
        var gridlineCoords = [[xCoord, line_top], [xCoord, line_bottom]];
        var lineGenerator = d3.line();
        var pathString = lineGenerator(gridlineCoords);
        viz3_svg.append("path")
           .attr("class", "gridline")
           .attr('d', pathString);
        viz3_svg.append("text")
           .attr("class", "ranking-gridline-label")
           .attr("text-anchor", "middle")
           .attr("x", xCoord)
           .attr("y", TOP_PADDING - 25)
           .text(RANKING_GRIDLINES[l]);
    }

    // Render dimension labels
    viz3_svg.append("text")
       .attr("class", "dimension-label")
       .attr("text-anchor", "end")
       .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
       .attr("y", TOP_PADDING - 25)
       .text("Rank");

    for (d = 0; d < DIMENSIONS.length; d++) {
        var yCoord = (yScale(d) + yScale(d+1))/2;
        axis_coords[d] = yCoord;
        viz3_ranking_data[d] = countryInfoMap.get(country)[DIMENSIONS[d].column_name];
        viz3_svg.append("text")
           .attr("class", "dimension-label")
           .attr("text-anchor", "end")
           .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
           .attr("y", yCoord - DIMENSION_LABEL_Y_OFFSET)
           .text(DIMENSIONS[d].display_name);
    }

    // Render graph lines
    var ref_line = viz3_svg.append("line")
                             .attr("class", "viz3-refline")
                             .attr("x1", xScale(viz3_ranking_data[0]))
                             .attr("y1", axis_coords[0])
                             .attr("x2", xScale(viz3_ranking_data[0]))
                             .attr("y2", line_bottom)
                             .attr("stroke-width", GRAPH_LINE_WIDTH)
                             .attr("stroke", GRAPH_LINE_COLOR);

    // all guide lines has (x1, y1) on ref_line, and (x2, y2) at center of circle
    var guide_lines = viz3_svg.selectAll(".viz3_guideline")
                              .data(viz3_ranking_data.slice(1, DIMENSIONS.length))
                              .enter()
                              .append("line")
                              .attr("class", "viz3-guideline")
                              .attr("x1", (d,i) => xScale(viz3_ranking_data[0]))
                              .attr("y1", (d,i) => axis_coords[i+1] )
                              .attr("x2", (d,i) => xScale(d) )
                              .attr("y2", (d,i) => axis_coords[i+1] )
                              .attr("stroke-width", GRAPH_LINE_WIDTH)
                              .attr("stroke", GRAPH_LINE_COLOR)
                              .attr("stroke-dasharray", DASHARRAY_STYLE);

    // Render happiness square
    var sqaure = viz3_svg.selectAll("rect")
                         .data(viz3_ranking_data.slice(0,1))
                         .enter()
                         .append("rect")
                         .attr("class", "happiness-ranking-sq")
                         .attr("x", (d,i) => (xScale(d) - SQ_SIDE_LENGTH/2))
                         .attr("y", (d,i) => (axis_coords[0] - SQ_SIDE_LENGTH/2))
                         .attr("height", SQ_SIDE_LENGTH)
                         .attr("width", SQ_SIDE_LENGTH)
                         .attr("rx", SQ_CORNER_RADIUS)
                         .attr("ry", SQ_CORNER_RADIUS)
                         .attr("fill", VIZ3_ACCENT_COLOR)
                         .attr("opacity", CIRCLE_OPACITY)
                         .on("mouseover", handleViz3SquareMouseOver)
                         .on("mouseout", handleViz3MouseOut);

    // Render circles
    var circ = viz3_svg.selectAll("circle")
                  .data(viz3_ranking_data.slice(1, DIMENSIONS.length))
                  .enter()
                  .append("circle")
                  .attr("class", "dimension-ranking-circle")
                  .attr("cx", (d, i) => xScale(d) )
                  .attr("cy", (d, i) => axis_coords[i+1] )
                  .attr("r", CIRCLE_RADIUS)
                  .attr("fill", VIZ3_ACCENT_COLOR)
                  .attr("opacity", CIRCLE_OPACITY)
                  .on("mouseover", handleViz3CircleMouseOver)
                  .on("mouseout", handleViz3MouseOut);
}

function updateViz3Plot(country) {
    for (d = 0; d < DIMENSIONS.length; d++) {
        viz3_ranking_data[d] = countryInfoMap.get(country)[DIMENSIONS[d].column_name];
    }

    var ref_line = viz3_svg.select(".viz3-refline")
                             .transition()
                             .duration(TRANSITION_DURATION)
                             .attr("x1", xScale(viz3_ranking_data[0]))
                             .attr("x2", xScale(viz3_ranking_data[0]))

    var guide_lines = viz3_svg.selectAll(".viz3-guideline")
                                .data(viz3_ranking_data.slice(1, DIMENSIONS.length))
                                .transition()
                                .duration(TRANSITION_DURATION)
                                .attr("x1", xScale(viz3_ranking_data[0]))
                                .attr("x2", (d,i) => xScale(d));


    var sq = viz3_svg.selectAll(".happiness-ranking-sq")
                  .data(viz3_ranking_data.slice(0,1))
                  .transition()
                  .duration(TRANSITION_DURATION)
                  .attr("x", (d,i) => (xScale(d) - SQ_SIDE_LENGTH/2));

    var circ = viz3_svg.selectAll(".dimension-ranking-circle")
                  .data(viz3_ranking_data.slice(1, DIMENSIONS.length))
                  .transition()
                  .duration(TRANSITION_DURATION)
                  .attr("cx", (d, i) => xScale(d) );

}

function handleViz3CircleMouseOver(d, i) {
    viz3_svg.append("text")
             .attr('id', "viz3-label-" + d.Happiness_Rank)
             .attr('x', () => xScale(d) )
             .attr('y', () => (axis_coords[i+1]-CIRCLE_RADIUS-5) )
             .attr("text-anchor", "middle")
             .text(d);
}

function handleViz3SquareMouseOver(d, i) {
    viz3_svg.append("text")
             .attr('id', "viz3-label-" + d.Happiness_Rank)
             .attr('x', () => xScale(d) )
             .attr('y', () => (axis_coords[i]-CIRCLE_RADIUS-5) )
             .attr("text-anchor", "middle")
             .text(d);
}

function handleViz3MouseOut(d, i) {
    d3.select("#viz3-label-" + d.Happiness_Rank).remove();
}

function handleViz3CountryChange() {
  var viz3SelectElem = document.getElementById("viz3-country-select");
  var viz3Country = viz3SelectElem.options[viz3SelectElem.selectedIndex].value;
  updateViz3Plot(viz3Country);
}


/*****************************************************************************
 *  Viz4 functions
 */

function initViz4Plot(c1, c2) {

    // Render ranking gridlines
    var line_top = TOP_PADDING + NUMERAL_LABEL_GUTTER;
    var line_bottom = CANVAS_HEIGHT - BOTTOM_PADDING;

    for (l = 0; l < RANKING_GRIDLINES.length; l++) {
        var xCoord = xScale(RANKING_GRIDLINES[l]);
        var gridlineCoords = [[xCoord, line_top], [xCoord, line_bottom]];
        var lineGenerator = d3.line();
        var pathString = lineGenerator(gridlineCoords);
        viz4_svg.append("path")
           .attr("class", "gridline")
           .attr('d', pathString);
        viz4_svg.append("text")
           .attr("class", "ranking-gridline-label")
           .attr("text-anchor", "middle")
           .attr("x", xCoord)
           .attr("y", TOP_PADDING - 25)
           .text(RANKING_GRIDLINES[l]);
    }

    // Render dimension labels
    viz4_svg.append("text")
       .attr("class", "dimension-label")
       .attr("text-anchor", "end")
       .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
       .attr("y", TOP_PADDING - 25)
       .text("Rank");

    for (d = 0; d < DIMENSIONS.length; d++) {
        var yCoord = (yScale(d) + yScale(d+1))/2;
        axis_coords[d] = yCoord;
        viz4_country1_ranking_data[d] = countryInfoMap.get(c1)[DIMENSIONS[d].column_name];
        viz4_country2_ranking_data[d] = countryInfoMap.get(c2)[DIMENSIONS[d].column_name];

        viz4_svg.append("text")
           .attr("class", "dimension-label")
           .attr("text-anchor", "end")
           .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
           .attr("y", yCoord - DIMENSION_LABEL_Y_OFFSET)
           .text(DIMENSIONS[d].display_name);
    }

    // Render guide lines
    var guide_lines = viz4_svg.selectAll(".viz4-guideline")
                              .data(viz4_country1_ranking_data)
                              .enter()
                              .append("line")
                              .attr("class", "viz4-guideline")
                              .attr("x1", (d,i) => xScale(viz4_country1_ranking_data[i]) )
                              .attr("y1", (d,i) => axis_coords[i] )
                              .attr("x2", (d,i) => xScale(viz4_country2_ranking_data[i]) )
                              .attr("y2", (d,i) => axis_coords[i] )
                              .attr("stroke-width", GRAPH_LINE_WIDTH)
                              .attr("stroke", GRAPH_LINE_COLOR)
                              .attr("stroke-dasharray", DASHARRAY_STYLE);

    // Render square for country 1
    var sqaure = viz4_svg.selectAll(".country1-sq")
                         .data(viz4_country1_ranking_data.slice(0,1))
                         .enter()
                         .append("rect")
                         .attr("class", "country1-sq")
                         .attr("x", (d,i) => (xScale(d) - SQ_SIDE_LENGTH/2))
                         .attr("y", (d,i) => (axis_coords[0] - SQ_SIDE_LENGTH/2))
                         .attr("height", SQ_SIDE_LENGTH)
                         .attr("width", SQ_SIDE_LENGTH)
                         .attr("rx", SQ_CORNER_RADIUS)
                         .attr("ry", SQ_CORNER_RADIUS)
                         .attr("fill", VIZ4_C1_ACCENT_COLOR)
                         .attr("opacity", CIRCLE_OPACITY)
                         .on("mouseover", handleViz4SquareMouseOver)
                         .on("mouseout", handleViz4MouseOut);

    // Render circles for country 1
    var circ = viz4_svg.selectAll(".country1-circle")
                  .data(viz4_country1_ranking_data.slice(1,DIMENSIONS.length))
                  .enter()
                  .append("circle")
                  .attr("class", "country1-circle")
                  .attr("cx", (d,i) => xScale(d) )
                  .attr("cy", (d,i) => axis_coords[i+1] )
                  .attr("r", CIRCLE_RADIUS)
                  .attr("fill", VIZ4_C1_ACCENT_COLOR)
                  .attr("opacity", CIRCLE_OPACITY)
                  .on("mouseover", handleViz4CircleMouseOver)
                  .on("mouseout", handleViz4MouseOut);

    // Render square for country 2
    var sqaure = viz4_svg.selectAll(".country2-sq")
                     .data(viz4_country2_ranking_data.slice(0,1))
                     .enter()
                     .append("rect")
                     .attr("class", "country2-sq")
                     .attr("x", (d,i) => (xScale(d) - SQ_SIDE_LENGTH/2) )
                     .attr("y", (d,i) => (axis_coords[0] - SQ_SIDE_LENGTH/2) )
                     .attr("height", SQ_SIDE_LENGTH)
                     .attr("width", SQ_SIDE_LENGTH)
                     .attr("rx", SQ_CORNER_RADIUS)
                     .attr("ry", SQ_CORNER_RADIUS)
                     .attr("fill", VIZ4_C2_ACCENT_COLOR)
                     .attr("opacity", CIRCLE_OPACITY)
                     .on("mouseover", handleViz4SquareMouseOver)
                     .on("mouseout", handleViz4MouseOut);

    // Render circles for country 2
    var circ = viz4_svg.selectAll(".country2-circle")
                  .data(viz4_country2_ranking_data.slice(1, DIMENSIONS.length))
                  .enter()
                  .append("circle")
                  .attr("class", "country2-circle")
                  .attr("cx", (d,i) => xScale(d) )
                  .attr("cy", (d,i) => axis_coords[i+1] )
                  .attr("r", CIRCLE_RADIUS)
                  .attr("fill", VIZ4_C2_ACCENT_COLOR)
                  .attr("opacity", CIRCLE_OPACITY)
                  .on("mouseover", handleViz4CircleMouseOver)
                  .on("mouseout", handleViz4MouseOut);
}

function updateViz4Plot(c1, c2) {
    if (c1) {
        for (d = 0; d < DIMENSIONS.length; d++) {
            viz4_country1_ranking_data[d] = countryInfoMap.get(c1)[DIMENSIONS[d].column_name];
        }

        var guide_lines = viz4_svg.selectAll(".viz4-guideline")
                            .data(viz4_country1_ranking_data)
                            .transition()
                            .duration(TRANSITION_DURATION)
                            .attr("x1", (d,i) => xScale(d) );

        var sq = viz4_svg.selectAll(".country1-sq")
                  .data(viz4_country1_ranking_data.slice(0,1))
                  .transition()
                  .duration(TRANSITION_DURATION)
                  .attr("x", (d,i) => (xScale(d) - SQ_SIDE_LENGTH/2) );

        var circ = viz4_svg.selectAll(".country1-circle")
                  .data(viz4_country1_ranking_data.slice(1,DIMENSIONS.length))
                  .transition()
                  .duration(TRANSITION_DURATION)
                  .attr("cx", (d,i) => xScale(d) );
    }

    if (c2) {
        for (d = 0; d < DIMENSIONS.length; d++) {
            viz4_country2_ranking_data[d] = countryInfoMap.get(c2)[DIMENSIONS[d].column_name];
        }

        var guide_lines = viz4_svg.selectAll(".viz4-guideline")
                            .data(viz4_country2_ranking_data)
                            .transition()
                            .duration(TRANSITION_DURATION)
                            .attr("x2", (d,i) => xScale(d) );

        var sq = viz4_svg.selectAll(".country2-sq")
                  .data(viz4_country2_ranking_data.slice(0,1))
                  .transition()
                  .duration(TRANSITION_DURATION)
                  .attr("x", (d,i) => (xScale(d) - SQ_SIDE_LENGTH/2) );

        var circ = viz4_svg.selectAll(".country2-circle")
                  .data(viz4_country2_ranking_data.slice(1,DIMENSIONS.length))
                  .transition()
                  .duration(TRANSITION_DURATION)
                  .attr("cx", (d,i) => xScale(d) );
    }
}

function handleViz4Country1Change() {
    var viz4C1SelectElem = document.getElementById("viz4-country1-select");
    var viz4Country1 = viz4C1SelectElem.options[viz4C1SelectElem.selectedIndex].value;
    updateViz4Plot(viz4Country1, null);
}

function handleViz4Country2Change() {
    var viz4C2SelectElem = document.getElementById("viz4-country2-select");
    var viz4Country2 = viz4C2SelectElem.options[viz4C2SelectElem.selectedIndex].value;
    updateViz4Plot(null, viz4Country2);
}

function handleViz4CircleMouseOver(d, i) {
    viz4_svg.append("text")
             .attr('id', "viz4-label-" + d.Happiness_Rank)
             .attr('x', () => xScale(d) )
             .attr('y', () => (axis_coords[i+1]-CIRCLE_RADIUS-5) )
             .attr("text-anchor", "middle")
             .text(d);
}

function handleViz4SquareMouseOver(d, i) {
    viz4_svg.append("text")
             .attr('id', "viz4-label-" + d.Happiness_Rank)
             .attr('x', () => xScale(d) )
             .attr('y', () => (axis_coords[i]-CIRCLE_RADIUS-5) )
             .attr("text-anchor", "middle")
             .text(d);
}

function handleViz4MouseOut(d, i) {
    d3.select("#viz4-label-" + d.Happiness_Rank).remove();
}

/*****************************************************************************
 *  Set up
 */

viz3_svg = d3.select("#viz3-plot")
              .append("svg")
              .attr("height", CANVAS_HEIGHT)
              .attr("width", CANVAS_WIDTH);

viz4_svg = d3.select("#viz4-plot")
              .append("svg")
              .attr("height", CANVAS_HEIGHT)
              .attr("width", CANVAS_WIDTH);

d3.csv("data/All-The-Data.csv").then(function(happinessData) {

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
        d.Population = +d.Population;

    });

    countryInfo = happinessData;

    countryInfoMap = d3.map(countryInfo, (d) => d.Country);
    xScale = d3.scaleLinear()
               .domain([1, COUNTRIES_COUNT])
               .range([LEFT_PADDING, CANVAS_WIDTH - LEFT_PADDING - RIGHT_PADDING]);
    yScale = d3.scaleLinear()
               .domain([0, DIMENSIONS.length])
               .range([TOP_PADDING + NUMERAL_LABEL_GUTTER, CANVAS_HEIGHT- BOTTOM_PADDING]);
    
    initViz3Plot(VIZ3_INIT_COUNTRY);
    initViz4Plot(VIZ4_INIT_COUNTRY1, VIZ4_INIT_COUNTRY2);
});

// viz3 interaction event handlers
d3.select('#viz3-country-select')
    .on("change", function () {
    handleViz3CountryChange();
    });

// viz4 interaction event handlers
d3.select('#viz4-country1-select')
    .on("change", function () {
    handleViz4Country1Change();
    });

d3.select('#viz4-country2-select')
    .on("change", function () {
    handleViz4Country2Change();
    });

