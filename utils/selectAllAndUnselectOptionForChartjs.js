/**
 * Add a label to toggle the display of multiple data sets.
 * @params {number[]} ignoreDatasetIndexes Data set index to ignore display switching.
 */
export default (config, ignoreDatasetIndexes = undefined) => {
  const defaultLegendClickHandler = Chart.defaults.plugins.legend.onClick;
  const pieDoughnutLegendClickHandler = Chart.controllers.doughnut.overrides.plugins.legend.onClick;

  // Toggle the display of graphs other than the main data (first element).
  config.options.plugins.legend.onClick = (evnt, legendItem, legend) => {
    if (legendItem.isToggleShow) {
      // When the display switching label is clicked.
      if (typeof legend.hideAll === 'undefined')
        legend.hideAll = false;
      for (let [i, dataset] of Object.entries(legend.chart.data.datasets)) {
        if (ignoreDatasetIndexes && ignoreDatasetIndexes.indexOf(parseInt(i, 10)) !== -1)
          continue;
        // Toggle display.
        legend.chart.setDatasetVisibility(i, legend.hideAll)
      }
      legend.hideAll = !legend.hideAll;
      legend.chart.update();
      return;
    }
    // When the label for each dataset is clicked.
    console.log(`legend.chart.config.type=${legend.chart.config.type}`);
    if (legend.chart.config.type === 'pie' || legend.chart.config.type === 'doughnut')
      pieDoughnutLegendClickHandler(evnt, legendItem, legend)
    else
      defaultLegendClickHandler(evnt, legendItem, legend);

    // Get the display status of each data set.
    const allLegendItemsState = legend.chart.data.datasets.map((e, i) => {
      return legend.chart.getDatasetMeta(i).hidden;
    });
    if (allLegendItemsState.every(el => !el)) {
      legend.hideAll = false;
      legend.chart.update();
    } else if (allLegendItemsState.every(el => el)) {
      legend.hideAll = true;
      legend.chart.update();
    }
  };


  // Add labels to show and hide data sets other than the main data set.
  config.options.plugins.legend.labels.generateLabels = chart => {
    const datasets = chart.data.datasets;
    const {labels: {usePointStyle, pointStyle, textAlign, color}} = chart.legend.options;

    // Labels to display.
    let legendItems = [];

    // Labels for each dataset.
    for (let [i, meta] of Object.entries(chart._getSortedDatasetMetas())) {
      if (ignoreDatasetIndexes && ignoreDatasetIndexes.indexOf(parseInt(i, 10)) !== -1)
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

    // Label to toggle display.
    legendItems.push({
      text: (!chart.legend.hideAll || typeof chart.legend.hideAll === 'undefined') ? 'hide all datasets' : 'show all datasets',
      fontColor: color,
      fillStyle: '#000', // Box color
      strokeStyle: '#000', // LineCollor around box,
      // Custom attribute to determine if the label is a display switching label when the label is clicked.
      isToggleShow: true
    });
    return legendItems;
  };
}