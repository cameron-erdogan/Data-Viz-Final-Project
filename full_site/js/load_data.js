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

swarmSVG = d3.select("#swarm-plot")
    .append("svg")
    .attr("height", CANVAS_HEIGHT)
    .attr("width", CANVAS_WIDTH);

scatter_svg = d3.select("#scatter-plot")
    .append("svg")
    .attr("height", SCATTER_CANVAS_HEIGHT)
    .attr("width", SCATTER_CANVAS_WIDTH);

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

    // to generate dropdown html for all countries

    // var countrys= countryInfoMap.keys().sort();
    // var thing = ""
    // for (var c = 0; c<countrys.length; c++) {
    //     line = '<option value="' + countrys[c] + '">' + countrys[c] + '</option>'
    //     thing = thing + line;
    // }
    // console.log(thing);


    xScale = d3.scaleLinear()
        .domain([1, COUNTRIES_COUNT])
        .range([LEFT_PADDING, CANVAS_WIDTH - RIGHT_PADDING]);
    yScale = d3.scaleLinear()
        .domain([0, DIMENSIONS_RANK.length])
        .range([TOP_PADDING + NUMERAL_LABEL_GUTTER + 15, CANVAS_HEIGHT - BOTTOM_PADDING - 15]);

    initViz3Plot(VIZ3_INIT_COUNTRY);
    initViz4Plot(VIZ4_INIT_COUNTRY1, VIZ4_INIT_COUNTRY2);
    initSwarmPlot();
    initScatterPlot();
});

// viz3 interaction event handlers
d3.select('#viz3-country-select')
    .on("change", function() {
        handleViz3CountryChange();
    });

// viz4 interaction event handlers
d3.select('#viz4-country1-select')
    .on("change", function() {
        handleViz4Country1Change();
    });

d3.select('#viz4-country2-select')
    .on("change", function() {
        handleViz4Country2Change();
    });

d3.select('#scatter-x-dim')
    .on("change", function() {
        handleDimensionChange();
    });

d3.select('#scatter-y-dim')
    .on("change", function() {
        handleDimensionChange();
    });