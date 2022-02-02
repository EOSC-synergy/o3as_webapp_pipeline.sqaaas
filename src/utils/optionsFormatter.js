import { q25, q75, median } from "../services/math/math"
import { IMPLICIT_YEAR_LIST, O3AS_PLOTS, ALL_REGIONS_ORDERED, STATISTICAL_VALUES_LIST, SV_CALCULATION, SV_COLORING, STATISTICAL_VALUES, APEXCHART_PLOT_TYPE, MODEL_LINE_THICKNESS, START_YEAR, END_YEAR } from "./constants"

const SERIES_GENERATION = {}; // Map plotId to corresponding generation function
SERIES_GENERATION[O3AS_PLOTS.tco3_zm] = generateTco3_ZmSeries;
SERIES_GENERATION[O3AS_PLOTS.tco3_return] = generateTco3_ReturnSeries;

/**
 * The default settings for the tco3_zm plot.
 * 
 * colors, width, dashArray have to be filled. 
 * 
 * This gigantic object allows us to communicate with the apexcharts library.
 * More can be found here: https://apexcharts.com/docs/installation/ 
 */
export const defaultTCO3_zm = {
    xaxis: {
        type: "numeric",
        min: START_YEAR,
        max: END_YEAR,
        decimalsInFloat: 0,
        labels: {
            rotate: 0
        } 
    },
    yaxis: {
        min: 200,
        max: 400,
        forceNiceScale: true,
        decimalsInFloat: 0
    }, 
    chart: {
        id: O3AS_PLOTS.tco3_zm,
        animations: {
            enabled: false,
            easing: "linear"
        },
        toolbar: {
            "show": true,
            offsetX: -60,
            offsetY: 10,
            "tools":{
                "download": true,
                pan: false
            }
        },
        zoom: {
            enabled: true,
            type: "xy",
        },
        width: "100%"
    },
    legend: {
        show: true, 
        onItemClick: {
            toggleDataSeries: false
        }
    },
    dataLabels: {
        enabled: false,
    },
    tooltip: {
        enabled: true,
        shared: false,
    },
    colors: null, //styling.colors
    stroke: {
        width: null, // styling.width,
        dashArray: null, //styling.dashArray,
    },
    title: {
        text: "OCTS Plot",
        align: "center",
        floating: false,
        style: {
            fontSize:  "30px",
            fontWeight:  "bold",
            fontFamily:  "undefined",
            color:  "#4350af"
        }
    },
};

/**
 * The default settings for the tco3_return plot.
 * 
 * colors have to be filled.
 * 
 * This gigantic object allows us to communicate with the apexcharts library.
 * More can be found here: https://apexcharts.com/docs/installation/ 
 */export const default_TCO3_return = {
    yaxis: {
        forceNiceScale: true,
        decimalsInFloat: 0
    }, 
    chart: {
      id: O3AS_PLOTS.tco3_return,
      type: 'boxPlot',
      animations: {
          enabled: false, // disable animations
      },
      zoom: {
          enabled: false,
          type: 'xy',
      }
    },
    colors: [undefined], // , ...styling.colors
    title: {
        text: "Return/Recovery",
        align: "center",
        floating: false,
        style: {
            fontSize:  "30px",
            fontWeight:  "bold",
            fontFamily:  "undefined",
            color:  "#4350af"
        }
    },
    tooltip: {
      shared: false,
      intersect: true
    },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: "#8def4e", //'#5C4742',
          lower: "#63badb", //'#A5978B'
        }
      }
    },
    legend: {
        show: true,
    },
    
    markers: {
      size: 5,
      colors: [undefined], // ...styling.colors
      strokeColors: '#000',
      strokeWidth: 0,
      strokeOpacity: 0.2, //?
      strokeDashArray: 0, //?
      fillOpacity: 0.7,
      discrete: [],
      //shape: [undefined, "circle", "square"], // circle or square
      radius: 1,
      offsetX: 0, // interesting
      offsetY: 0,
      onDblClick: undefined,
      showNullDataPoints: true,
      hover: {
          size: 10,
            sizeOffset: 10,
      },
    }
    
};

/**
 * The interface the graph component accesses to generate the options for the plot
 * given the plot id, the styling (depends on plot type) and the plot title.
 * 
 * @param {string} obj.plotId an element of O3AS_PLOTS
 * @param {array} obj.styling.colors an array of strings with hexcode. Has to match the length of the given series 
 * @param {array} obj.styling.width (tco3_zm only!): array of integer defining the line width
 * @param {array} obj.styling.dashArray (tco3_zm only!): array of integer defining if the line is solid or dashed
 * @param {string} obj.plotTitle contains the plot title
 * @returns an default_TCO3_plotId object formatted with the given data
 */
export function getOptions({plotId, styling, plotTitle}) {
    if (plotId === O3AS_PLOTS.tco3_zm) {
        const newOptions = JSON.parse(JSON.stringify(defaultTCO3_zm)); // dirt simple and not overly horrible
        newOptions.xaxis.categories = IMPLICIT_YEAR_LIST;
        newOptions.colors = styling.colors;
        newOptions.stroke.width = styling.width;
        newOptions.stroke.dashArray = styling.dashArray;
        newOptions.title = JSON.parse(JSON.stringify(newOptions.title)); // this is necessary in order for apexcharts to update the title
        newOptions.title.text = plotTitle;
        return newOptions;

    } else if (plotId === O3AS_PLOTS.tco3_return) {
        const newOptions = JSON.parse(JSON.stringify(default_TCO3_return));
        newOptions.colors.push(...styling.colors); // for the legend!
        newOptions.title = JSON.parse(JSON.stringify(newOptions.title));  // this is necessary in order for apexcharts to update the title
        newOptions.title.text = plotTitle;
        //newOptions.markers.colors.push(...styling.colors);
        return newOptions;
    }    
};

/**
 * The interface the graph component accesses to generate the series for the plot.
 * 
 * This function generates data structures that can directly be passed to apexcharts. 
 * It accepts the plotId because series are generated according to the type of plot.
 * Furthermore the data object holds all plot data for the selected options
 * and modelsSlice is a slice from the redux store which contains information
 * about what model groups exist, which of them are visible or should be included in the
 * statistical value calculation.
 * 
 * It additionally generates a styling object which contains colors (and width/dashArray for tco3_zm).
 * 
 * @param {string} obj.plotId 
 * @param {object} obj.data 
 * @param {object} obj.modelsSlice 
 * @returns series object which includes a subdivision into a data and a styling object.
 */
export function generateSeries({plotId, data, modelsSlice}) {
    const series = SERIES_GENERATION[plotId]({data, modelsSlice}); // execute correct function based on mapping
    console.log(series);
    return {
        data: series.data, 
        styling: {
            colors: series.colors, 
            dashArray: series.dashArray, 
            width: series.width,
        }
    }; // return generated series with styling to pass to apexcharts chart
}

/**
 * This method generates the data series for tco3_zm for all models that should be displayed (specified via groups).
 * It futhermore adds the statistical values also as series at the end.
 * 
 * @param {object} obj.data the raw data from the api for the current options
 * @param {object} obj.modelsSlice the slice of the store containg information about the model groups
 * @returns a combination of data and statistical values series
 */
function generateTco3_ZmSeries({data, modelsSlice}) {
    const series = {
        data: [],
        colors: [],
        width: [],
        dashArray: [],
    }

    for (const [id, groupData] of Object.entries(modelsSlice.modelGroups)) { // iterate over model groups
        if (!groupData.isVisible) continue; // skip hidden groups
        for (const [model, modelInfo] of Object.entries(groupData.models)) {
            if (!modelInfo.isVisible) continue; // skip hidden models
            const modelData = data[model]; // retrieve data (api)
            series.data.push({
                type: APEXCHART_PLOT_TYPE.tco3_zm,
                name: model,
                data: modelData.data.map((e, idx) => [START_YEAR + idx, e]),
            });
    
            series.colors.push(colorNameToHex(modelData.plotStyle.color));
            series.width.push(MODEL_LINE_THICKNESS);
            series.dashArray.push(convertToStrokeStyle(modelData.plotStyle.linestyle)); // default line thickness
        }
    }

    // generate SV!
    const svSeries = buildStatisticalSeries({
        data, 
        modelsSlice, 
        buildMatrix: buildSvMatrixTco3Zm, 
        generateSingleSvSeries: generateSingleTco3ZmSeries
    });
    
    return combineSeries(series, svSeries);
}

/**
 * This plugin-method is used to specify how series for tco3_zm should be build inside 
 * the buildStatisticalValues-function.
 * 
 * @param {string} name of the series
 * @param {array} svData array of plaint numbers
 * @returns a series matching the tco3_zm style for apexcharts.
 */
function generateSingleTco3ZmSeries(name, svData) {
    return {
        name: name,
        data: svData.map((e, idx) => [START_YEAR + idx, e]),
        type: "line",
    }
}

/**
 * This plug-in method is used to specify how the data should be parsed and 
 * arranged so that the generic buildStatisticalValues-Function can 
 * take care of the calculation.
 * 
 * The data arrangement is basically a transposition.
 * The first datapoint of each model ist grouped into the first array.
 * and so on...
 * 
 * @param {array} obj.modelList list of models of a group that should be included
 * @param {object} obj.data an object holding all the data from the api
 * @returns a 2D array containing all the data (transpose matrix of given data)
 */
function buildSvMatrixTco3Zm({modelList, data}) {
    const SERIES_LENGTH = data[modelList[0]].data.length; // grab length of first model, should all be same

    const matrix = create2dArray(SERIES_LENGTH); // for arr of matrix: mean(arr), etc.

    for (let i = 0; i < SERIES_LENGTH; ++i) {
        for (const model of modelList) {
            matrix[i].push(
                data[model].data[i] // add null anyway to remain index mapping (null is filtered out later)
            )
        }
    }
    return matrix;
}

/**
 * This method generates the data series for the tco3_return for all models that should be displayed (specified via groups).
 * It futhermore adds the statistical values also as series at the end.
 * 
 * @param {object} obj.data the raw data from the api for the current options
 * @param {object} obj.modelsSlice the slice of the store containg information about the model groups
 * @returns a combination of data and statistical values series
 */
function generateTco3_ReturnSeries({data, modelsSlice}) {
    const series = {
        data: [],
        colors: [],
        width: [],
        dashArray: [],
    }
    
    // 1. build boxplot
    const boxPlotValues = calculateBoxPlotValues({data, modelsSlice});
    series.data.push({
            name: 'box',
            type: 'boxPlot',

            data: ALL_REGIONS_ORDERED.map(region => ({
                x: region,
                y: boxPlotValues[region],
            })),
        }
    );


    // 2. build scatter plot

    for (const [id, groupData] of Object.entries(modelsSlice.modelGroups)) { // iterate over model groups
        if (!groupData.isVisible) continue; // skip hidden groups
        for (const [model, modelInfo] of Object.entries(groupData.models)) {
            if (!modelInfo.isVisible) continue; // skip hidden models
            const modelData = data[model];
            const sortedData = ALL_REGIONS_ORDERED.map(region => ({
                x: region,
                y: modelData.data[region] || null, // null as default if data is missing
            }));
            
            series.data.push({
                name: model,
                data: sortedData,
                type: "scatter",
            });
            series.colors.push(
                colorNameToHex(modelData.plotStyle.color)
            )
        }
    }   

    // 3. generate statistical values
    const svSeries = buildStatisticalSeries({
        data,
        modelsSlice,
        buildMatrix: buildSvMatrixTco3Return,
        generateSingleSvSeries: generateSingleTco3ReturnSeries
    });
    return combineSeries(series, svSeries);
}

/**
 * This plugin-method is used to specify how series for tco3_return should be build inside 
 * the buildStatisticalValues-function.
 * 
 * @param {string} name of the series
 * @param {array} svData array of plaint numbers
 * @returns a series matching the tco3_return style for apexcharts.
 */
function generateSingleTco3ReturnSeries(name, svData) {
    const transformedData = ALL_REGIONS_ORDERED.map((region, index) => {
        return {
            x: region,
            y: svData[index],
        }
    });

    return {
        name: name,
        data: transformedData,
        type: "scatter", // make generic
    };
}


function buildSvMatrixTco3Return({modelList, data}) {
    const matrix = create2dArray(ALL_REGIONS_ORDERED.length);

    for (const index in ALL_REGIONS_ORDERED) {
        const region = ALL_REGIONS_ORDERED[index]; // iterate over regions
        for (const model of modelList) {
            matrix[index].push(
                data[model].data[region] || null
            )
        }
    }
    return matrix;
    
}

/**
 * This method calculates the boxplot values for the tco3_return plot.
 * For each region an array of 5 values is calculated: min, q1, median, q3, max
 * which is sufficient to render the desired box plot.
 * 
 * @param {object} data contains the region data from the api
 * @returns object holding an array of 5 values (min, q1, median, q3, max) for each region
 */
function calculateBoxPlotValues({data, modelsSlice}) {
    const boxPlotHolder = {}
	for (let region of ALL_REGIONS_ORDERED) {
		boxPlotHolder[region] = []
	}

    for (const [id, groupData] of Object.entries(modelsSlice.modelGroups)) { // iterate over model groups
        if (!groupData.isVisible) continue; // skip hidden groups
        for (const [model, modelInfo] of Object.entries(groupData.models)) {
            if (!modelInfo.isVisible) continue; // skip hidden models
            for (const [region, year] of Object.entries(data[model].data)) {
                boxPlotHolder[region].push(year);
            }
        }
    }
    
    const boxPlotValues = {}
	for (let region of ALL_REGIONS_ORDERED) {
		boxPlotHolder[region].sort()
		const arr = boxPlotHolder[region]
		boxPlotValues[region] = []
		boxPlotValues[region].push(
			arr[0],
			q25(arr),
			median(arr),
			q75(arr),
			arr[arr.length - 1]
		)
	}
    return boxPlotValues
}

function buildStatisticalSeries({data, modelsSlice, buildMatrix, generateSingleSvSeries}) {
    const svSeries = {
        data: [],
        colors: [],
        width: [],
        dashArray: [],
    };
    
    const modelGroups = modelsSlice.modelGroups;
    for (const [id, groupData] of Object.entries(modelGroups)) {

        const svHolder = calculateSvForModels(Object.keys(groupData.models), data, groupData, buildMatrix);

        for (const [sv, svData] of Object.entries(svHolder)) {
            
            if (sv === STATISTICAL_VALUES.derivative // std
                || sv === STATISTICAL_VALUES.percentile) continue; // skip for now
            

            if (groupData.visibleSV[sv] 
                || (sv.includes("std") && groupData.visibleSV[STATISTICAL_VALUES.derivative])) {
            } else {
                continue; // mean und median
            }
            svSeries.data.push(generateSingleSvSeries(`${sv}(${groupData.name})`, svData));
            svSeries.colors.push(SV_COLORING[sv]);   // coloring?
            svSeries.width.push(1);                  // thicker?
            svSeries.dashArray.push(0);              // solid?       
        }
    }
    return svSeries;
}


/**
 * Calculates the statistical values for the given modelList and data.
 * 
 * @param {} modelList
 * @param {} data
 * @param {} groupData
 * @param {} buildMatrix
 */
function calculateSvForModels(modelList, data, groupData, buildMatrix) { // pass group data
    // only mean at beginning

    const matrix = buildMatrix({modelList, data}); // function supplied by caller

    const svHolder = {stdMean: []};
    STATISTICAL_VALUES_LIST.forEach(
        sv => svHolder[sv] = [] // init with empty array
    )

    for (const arr of matrix) { // fill with calculated sv
        for (const sv of [...STATISTICAL_VALUES_LIST, "stdMean"]) {
            // filter out values from not included models or null values
            const filtered = arr.filter((value, idx) => value !== null && isIncludedInSv(modelList[idx], groupData, sv));
            const value = SV_CALCULATION[sv](filtered) || null; // null as default if NaN or undefined
            svHolder[sv].push(value);    
        };
    };

    svHolder["mean+std"] = [];
    svHolder["mean-std"] = [];
    for (let i = 0; i < svHolder[STATISTICAL_VALUES.derivative].length; ++i) {
        svHolder["mean+std"].push(svHolder.stdMean[i] + svHolder.derivative[i]);
        svHolder["mean-std"].push(svHolder.stdMean[i] - svHolder.derivative[i]);
    }
    delete svHolder["stdMean"];
    return svHolder;
}



// API FORMATTING:

/**
 * Iterates through the x and y data returned from the api for the tco3_zm and fills the corresponding years with
 * either data points, if they are present or with `null`. The first index corresponds to START_YEAR
 * 
 * @param {array} xValues an array holding the years
 * @param {array} yValues an array of the same length holding the datapoints for the corresponding years
 */
 export function normalizeArray(xValues, yValues) {
    const result = [];
    let currentValueIndex = 0;
    
    for (let year of IMPLICIT_YEAR_LIST) {
        if (xValues[currentValueIndex] === year) {
            result.push(yValues[currentValueIndex]);
            currentValueIndex++;
        } else {
            result.push(null);
        }
    }
    return result;
}

/**
 * This function is called only once when the data from the API is fetched. It transforms the data
 * into a format that (hopefully) speeds up the computation of certain things.
 * 
 * The TCO3_ZM data is transformed from a x and y array into one single array whose first index 
 * represents the START_YEAR) and so on. It contains either data points or null.
 * x = ['1960', '1963', '1965', '1966']
 * y = [0, 1, 2, 3]
 * normalized: [0, null (1961), null (1962), 1, null (1964), 2, 3, null (1967), ...]
 * 
 * The TCO3_RETURN data is transformed from a x and y array into a lookup table with the given region:
 * 
 *   "x": [
 *     "Antarctic(Oct)",
 *     "SH mid-lat",
 *     "Tropics",
 *     "Arctic(Mar)",              {
 *     "Near global",               "Antarctic(Oct)": 2064,
 *     "Global",                    "SH mid-lat": 2051,
 *     "User region"                "Tropics": 2060,
 *   ],                     =>      "Tropics": 2041,
 *   "y": [                             ...
 *     2064,                       }
 *     2051,
 *     2060,
 *     2041,
 *     2040,
 *     2049,
 *     2052,
 *     2052
 *   ]
 * 
 * @param {string} obj.plotId       A string specifying the plot (to perform different transformations, according to the data format)
 * @param {object} obj.data         An object holding the data as it was returned from the API
 * @returns                         The pretransformed API data
 */
export const preTransformApiData = ({plotId, data}) => {
    if (plotId === O3AS_PLOTS.tco3_zm) {
        const lookUpTable = {};
        for (let datum of data) {
            // top structure
            lookUpTable[datum.model] = {
                plotStyle: datum.plotstyle,
                data: normalizeArray(datum.x, datum.y), // this should speed up the calculation of the statistical values later
            };
        }
        return lookUpTable;
    } else if (plotId === O3AS_PLOTS.tco3_return) { // old way of doing this
        const lookUpTable = {};
        for (let datum of data) {
            // top structure
            lookUpTable[datum.model] = {
                plotStyle: datum.plotstyle,
                data: {}
            };

            // fill data
            for (let index in datum.x) {
                lookUpTable[datum.model].data[datum.x[index]] = datum.y[index];
            }
        }
        return lookUpTable;
    };
}


// UTILITY:

/**
 * Converts the given color name to its corresponding hex code.
 * 
 * @param {string} color    The name of the color as a string
 * @returns                 The hex code corresponding to the given color name
 */
export function colorNameToHex(color)
{
    const colors = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colors[color.toLowerCase()] != 'undefined')
        return colors[color.toLowerCase()];

    return false;
};

/**
 * Converts the stroke style given by the API into the format supported by apexcharts.
 * 
 * @param {number} apiStyle     The stroke style specified by the API
 * returns                      The stroke style for the apexcharts library
 */
export function convertToStrokeStyle(apiStyle) {
    const styles = {
        "solid": 0,
        "dotted": 1,
        "dashed": 3,
    };

    if (typeof styles[apiStyle.toLowerCase()] != 'undefined')
        return styles[apiStyle.toLowerCase()];
    return false;
};

/**
 * Combines 2 data series objects into a new one.
 * The copied elements of series2 get appended to a copy of series1.
 * A series object has the following form: { data: Array, colors: Array, width: Array, dashArray: Array}
 * 
 * @param {obj} series1     The first data series object
 * @param {obj} series2     The second data series object
 * @returns                 New series containing series1 and series2
 */
function combineSeries(series1, series2) {
    const newSeries = {};
    newSeries.data = [...series1.data, ...series2.data];
    newSeries.colors = [...series1.colors, ...series2.colors];
    newSeries.width = [...series1.width, ...series2.width];
    newSeries.dashArray = [...series1.dashArray, ...series2.dashArray];
    return newSeries;
}

/**
 * Utility function to create an array of size i with empty arrays inside of it.
 * 
 * @param {number} i    The size of the array containing the empty arrays
 * @returns             The array of size i containing empty arrays
 */
function create2dArray(i) {
    return Array.from(Array(i), () => []);
}


function isIncludedInSv(model, groupData, svType) {
    if (svType === "stdMean") return groupData.models[model][STATISTICAL_VALUES.derivative]; // the std mean should only be calculated if the "derivative" / std is necessary
    
    return groupData.models[model][svType];
}