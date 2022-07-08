/**
 * Toggles between showing and hiding items.
 */
function toggleItems(chart, showing = true, ignore = undefined) {
  // Convert the index of the line to be ignored to an array.
  if (ignore && !Array.isArray(ignore))
    ignore = [ignore];
  for (let [i, dataset] of Object.entries(chart.data.datasets)) {
    if (ignore && ignore.indexOf(parseInt(i, 10)) !== -1)
      continue;
    // Toggle display.
    chart.setDatasetVisibility(i, showing);
    // const meta = chart.getDatasetMeta(i);
    // meta.hidden = !showing;
  }

  // Re-rendering the chart.
  chart.update();
}

/**
 * Add a label to toggle the display of multiple data sets.
 *
 * @params {object}           config              Chart JS Configuration.
 * @params {number[]|number}  options.ignore      Data set index to ignore display switching.
 * @params {string}           options.showText    Text of legend showing all.
 * @params {string}           options.hideText    Text in the legend that hides everything.
 * @params {boolean}          options.showAtFirst Do you want to show the data in the initial display?
 */
export default (config, options) => {
  // Initialize options.
  options = Object.assign({
    ignore: undefined,
    showText: 'show all',
    hideText: 'hide all',
    showAtFirst: true
  }, options);

  // Current showing status.
  let isShowAll = options.showAtFirst;

  // Whether to generate the first legend.
  let renderAtFirst = true;

  // Convert the index of the line to be ignored to an array.
  if (options.ignore != null && !Array.isArray(options.ignore))
    options.ignore = [options.ignore];

  // Toggle the display of graphs other than the main data (first element).
  config.options.plugins.legend.onClick = (evnt, legendItem, legend) => {
    // Once all toggles are clicked.
    if (legendItem.isAll) {
      // When the display switching label is clicked.
      // Reverse the state of showing.
      isShowAll = !isShowAll;

      // Toggles between showing and hiding items.
      return void toggleItems(legend.chart, isShowAll, options.ignore);
    }
    
    // When the label for each dataset is clicked.
    if (legend.chart.config.type === 'pie' || legend.chart.config.type === 'doughnut')
      Chart.controllers.doughnut.overrides.plugins.legend.onClick(evnt, legendItem, legend)
    else
      Chart.defaults.plugins.legend.onClick(evnt, legendItem, legend);

    // Get the display status of each data set.
    const allStates = legend.chart.data.datasets.map((_, i) => {
      return legend.chart.getDatasetMeta(i).hidden;
    });

    // Toggle the current showing status.
    isShowAll = allStates.every(el => !el);

    // Re-rendering the chart.
    legend.chart.update();
  };

  // Add labels to show and hide data sets other than the main data set.
  config.options.plugins.legend.labels.generateLabels = chart => {
    const datasets = chart.data.datasets;
    const {labels: {usePointStyle, pointStyle, textAlign, color}} = chart.legend.options;

    // Labels to display.
    let legendItems = [];

    // Labels for each dataset.
    for (let [i, meta] of Object.entries(chart._getSortedDatasetMetas())) {
      if (options.ignore && options.ignore.indexOf(parseInt(i, 10)) !== -1)
        continue;
      const style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
      legendItems.push({
        text: datasets[meta.index].label,
        fillStyle: style.backgroundColor,
        fontColor: color,
        hidden: !meta.visible,
        lineCap: style.borderCapStyle,
        lineDash: style.borderDash,
        lineDashOffset: style.borderDashOffset,
        lineJoin: style.borderJoinStyle,
        strokeStyle: style.borderColor,
        pointStyle: pointStyle || style.pointStyle,
        rotation: style.rotation,
        textAlign: textAlign || style.textAlign,
        datasetIndex: meta.index
      });
    }

    // Labels for all toggles.
    let allToggleText = options.showText;
    if (isShowAll)
    // if (!renderAtFirst || isShowAll)
      allToggleText = options.hideText;
    
    // Label to toggle display.
    legendItems.push({
      text: allToggleText,
      fontColor: color,
      fillStyle: '#000', // Box color
      strokeStyle: '#000', // LineCollor around box,
      isAll: true // Custom attribute to determine if the label is a display switching label when the label is clicked.
    });
    return legendItems;
  };

  if (!options.showAtFirst) {
    config.plugins = [{
      beforeRender: chart => {
        if (!renderAtFirst)
          return;
        renderAtFirst = false;
        toggleItems(chart, false, options.ignore);
      }
    }];
  }
}