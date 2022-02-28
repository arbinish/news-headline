import React, {useEffect} from 'react';
import data from './Headlines_5000.json';
import * as crossfilter from 'crossfilter';
import * as dc from 'dc';
import * as d3 from 'd3';


let winWidth = window.innerWidth;
let winHeight = window.innerHeight;
let timeParse = d3.timeParse('%b %d, %Y');

export default function Dashboard({view}) {

  let chartWidth = Math.round(winHeight * 0.43);
  let pieRadius = Math.round(chartWidth * 0.3);

  console.info('chartWidth', chartWidth, 'pieRadius', pieRadius, 'height', winHeight);

  let ndx = crossfilter(data);
  let categoryDimension = ndx.dimension(dc.pluck('category'));
  let monthDimension = ndx.dimension(d => d.date.slice(0, 3));
  let categoryGroup = categoryDimension.group().reduceCount();
  let monthGroup = monthDimension.group().reduceCount();
  let weekDim = ndx.dimension(d => timeParse(d.date).toLocaleDateString('en-US', {weekday: 'short'}));
  let weekGroup = weekDim.group().reduceCount();
  let hourDim = ndx.dimension(d => parseInt(d.time_24hr.slice(0,2)));
  let hourGroup = hourDim.group().reduceCount();

  let childView = view === 'CATEGORY' ? 'weekday view' : 'hourly view';

  useEffect(() => {
    let categoryChart = dc.pieChart('#category-chart');
    categoryChart
      .width(winWidth/2)
      .height(chartWidth)
      .radius(chartWidth)
      .cx(chartWidth/2)
      .dimension(categoryDimension)
      .group(categoryGroup)
      .innerRadius(pieRadius)
      .legend(dc.legend().x(chartWidth*1.1).y(pieRadius/10).itemHeight(10).gap(5))
      .renderLabel(false)
      .transitionDuration(1618);

    console.info('setting up charts');
    let allMonths = monthGroup.all()
    let eventChart = dc.bubbleChart('#event-chart');
    eventChart
      .width(winWidth/2)
      .height(chartWidth)
      .transitionDuration(1618)
      .dimension(monthDimension)
      .group(monthGroup)
      .margins({top: 10, right: 10, bottom: 30, left: 40})
      .keyAccessor(p => p.key)
      .valueAccessor(p => p.value)
      .radiusValueAccessor(p => p.value)
      .colors(d3.schemeBrBG[11])
      .colorDomain([0, 10])
      .colorAccessor(d => allMonths.findIndex(k => k.key === d.key))
      .x(d3.scaleBand()
        .domain(monthGroup.all().map(d => d.key)).range([10, 50]))
      .y(d3.scaleLinear().domain([100, 2000]))
      .yAxisPadding(300)
      .elasticY(true)
      .elasticX(false)
      .sortBubbleSize(true)
      .minRadius(20)
      .r(d3.scaleLinear().domain([100, 3000]))
      .elasticRadius(false)
      .maxBubbleRelativeSize(0.2);

    if (view === 'CATEGORY') {
      let weekChart = dc.barChart('#child-view');
      let weeks = weekGroup.all().map(d => d.key);
      console.info('weeks', weeks);

      weekChart
        .width(winWidth *0.8)
        .height(winHeight/2.7)
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(weekDim)
        .group(weekGroup)
        .colors(d3.schemeBrBG[7])
        .colorDomain([0, 6])
        .colorAccessor(d => weeks.findIndex(k => k === d.key))
        .centerBar(true)
        .xUnits(() => 20)
        .renderTitle(true)
        .brushOn(false)
        .elasticY(true)
        .alwaysUseRounding(false)
        .transitionDuration(1218)
        .x(d3.scaleBand().domain(weeks));
    } else {
      let hrChart = dc.barChart('#child-view');
      hrChart
        .width(winWidth * 0.8)
        .height(winHeight/2.5)
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .gap(15)
        .dimension(hourDim)
        .brushOn(false)
        .group(hourGroup)
        .xUnits(() => 20)
        .elasticY(true)
        .transitionDuration(1218)
        .renderTitle(true)
        .x(d3.scaleBand().domain(Array(24).fill().map( (_, idx) => idx )));

      window.hrChart = hrChart;
    }

    dc.renderAll();
  });

  return (
    <div id="controls">
      <div id="category-chart"/>
      <div id="event-chart"/>
      <div id="child-view"><h3>{childView}</h3></div>
    </div>
  );
}
