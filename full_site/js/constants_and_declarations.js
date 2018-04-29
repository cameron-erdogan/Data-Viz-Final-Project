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

const DIMENSIONS_RANK = [{
        'column_name': "Happiness_Rank",
        'display_name': "Happiness"
    },

    {
        'column_name': "Economy_GDP_Per_Capita_Rank",
        'display_name': "GDP Per Capita"
    },

    {
        'column_name': "Family_Rank",
        'display_name': "Family"
    },

    {
        'column_name': "Freedom_Rank",
        'display_name': "Freedom"
    },

    {
        'column_name': "Generosity_Rank",
        'display_name': "Generosity"
    },

    {
        'column_name': "Health_Life_Expectancy_Rank",
        'display_name': "Life Expectancy"
    },

    {
        'column_name': "Trust_Government_Corruption_Rank",
        'display_name': "Trust in Government"
    },
];

const DIMENSIONS_SCORE = [{
        'column_name': "Happiness_Score",
        'display_name': "Happiness"
    },

    {
        'column_name': "Economy_GDP_Per_Capita",
        'display_name': "GDP Per Capita"
    },

    {
        'column_name': "Family",
        'display_name': "Family"
    },

    {
        'column_name': "Freedom",
        'display_name': "Freedom"
    },

    {
        'column_name': "Generosity",
        'display_name': "Generosity"
    },

    {
        'column_name': "Health_Life_Expectancy",
        'display_name': "Life Expectancy"
    },

    {
        'column_name': "Trust_Government_Corruption",
        'display_name': "Trust in Government"
    }
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