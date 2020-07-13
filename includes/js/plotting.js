var margin = {top: 20, right: 20, bottom: 50, left: 40};

class tsChart {

  // Create instance with variables
  constructor(width) {
    this.width = width //- margin.left - margin.right;
    this.title = "";
    this.ylabel = "";
  }

  // Set title of chart
  setTitle(title) {
    this.title = title;
    return this;
  }

  setYLabel(ylabel) {
    this.ylabel = ylabel;
    return this;
  }

  // ---------- new makechart -----------

  makeChart(dcChart,dim,group) {
    dcChart.width(this.width)
      .height(0.6*this.width)
      .margins(margin)
      .x(d3.scaleTime()
          .domain([new Date(2008, 0, 1, 0), new Date(2009, 0, 1, 12)]))
      .renderHorizontalGridLines(true)
      .dimension(dim)
      .group(group)
      .rangeChart(range)
      .brushOn(false)
      .compose([
        new dc.LineChart(dcChart)
            .dimension(dim)
            .group(group)
            .valueAccessor(p => p.value.p25)
            .stack(group, 'p75', p => p.value.p75 - p.value.p25)
            .renderArea(true),
        new dc.LineChart(dcChart)
            //.dimension(dim)
            //.group(group)
            .valueAccessor(p => p.value.p00),
        new dc.LineChart(dcChart)
            //.dimension(dim)
            //.group(group)
            .valueAccessor(p => p.value.p01),
        new dc.LineChart(dcChart)
            //.dimension(dim)
            //.group(group)
            .valueAccessor(p => p.value.p10),
        new dc.LineChart(dcChart)
            //.dimension(dim)
            //group(group)
            .valueAccessor(p => p.value.p50),
        new dc.LineChart(dcChart)
            //.dimension(dim)
            //.group(group)
            .valueAccessor(p => p.value.mean),
        new dc.LineChart(dcChart)
            //.dimension(dim)
            //.group(group)
            .valueAccessor(p => p.value.p90),
        new dc.LineChart(dcChart)
            //.dimension(dim)
            //.group(group)
            .valueAccessor(p => p.value.p99),
        new dc.LineChart(dcChart)
            //.dimension(dim)
            //.group(group)
            .valueAccessor(p => p.value.p100)
      ])
      .xAxis()
      .tickFormat(d3.timeFormat('%b %d'))

      dcChart.render();

      // Format grid lines (and anything else)
      var hGridlines = d3.select('g.grid-line.horizontal').selectAll('line')
      
      hGridlines.attr('stroke-width',0.5)
          .attr('stroke','black')
          .style('opacity',0.5)

      // dcjs doesn't have a good utility for area charts between lines
      // so manually hiding the lower area to focus on the IQR
      var area2hide = d3.select('path.area')

      area2hide.style('fill-opacity',0)
  }

  // ---------- new makeChart ----------- 

  /* ------ Old makeChart -----------

  makeChart(dcChart,dim,group) {

    dcChart.width(this.width)
        .height(0.6*this.width)
        .margins(margin)
        //.rangeChart(range)
        .x(d3.scaleTime()
          .domain([new Date(2008, 0, 1, 0), new Date(2009, 0, 1, 12)]))
        .renderHorizontalGridLines(true)
        //.renderVerticalGridLines(true)
        .dimension(dim)
        .group(group)
        .compose([
          new dc.LineChart(dcChart)
              //.dimension(dim)
              //group(group)
              .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
              .valueAccessor(p => p.value.p50),
          new dc.LineChart(dcChart)
              //.dimension(dim)
              //.group(group)
              .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
              .valueAccessor(p => p.value.mean),
          new dc.LineChart(dcChart)
              //.dimension(dim)
              //.group(group)
              .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
              .valueAccessor(p => p.value.p00),
          new dc.LineChart(dcChart)
              //.dimension(dim)
              //.group(group)
              .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
              .valueAccessor(p => p.value.p01),
          new dc.LineChart(dcChart)
              //.dimension(dim)
              //.group(group)
              .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
              .valueAccessor(p => p.value.p10),
          new dc.LineChart(dcChart)
              .dimension(dim)
              .group(group)
              .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
              .valueAccessor(p => p.value.p25)
              .stack(group, 'p75', p => p.value.p75 - p.value.p25)
              .renderArea(true),
          new dc.LineChart(dcChart)
              //.dimension(dim)
              //.group(group)
              .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
              .valueAccessor(p => p.value.p90),
          new dc.LineChart(dcChart)
              //.dimension(dim)
              //.group(group)
              .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
              .valueAccessor(p => p.value.p99),
          new dc.LineChart(dcChart)
              //.dimension(dim)
              //.group(group)
              .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
              .valueAccessor(p => p.value.p100)
        ])
        // .on('renderlet', function(chart) {
        //   let hGridlines = chart.select('g.grid-line.horizontal').selectAll('line');
        //   hGridlines.attr('stroke-width',0.5)
        //     .attr('stroke','black')
        //     .style('opacity',0.5)

        //   let area2hide = chart.select('path.area')

        //   area2hide.style('fill-opacity',0)
        // })
        .xAxis()
        .tickFormat(d3.timeFormat('%B'))

    // Render charts
    //dc.renderAll('timeseries');

    // Initial chart rendering
    // dcChart.renderArea(false)
    //   .width(this.width)
    //   .height(0.6*this.width)
    //   .margins(margin)
    //   .dimension(dim)
    //   .mouseZoomable(false)
    //   .group(group)
    //   .x(d3.scaleTime()
    //     .domain([new Date(2008, 0, 1, 0), new Date(2009, 0, 1, 12)]))
    //   .keyAccessor(p => {return dateFromDay(2008,p.value.index)})
    //   .valueAccessor(d => 0) //p => p.value.p50)
    //   .stack(group, 'p50', p => p.value.p50)
    //   .stack(group, 'p75', p => p.value.p75) // - p.value.p50)

    // Formatting x-axis
    //dcChart.xAxis()
    //  .tickFormat(d3.timeFormat('%B'));

    dcChart.render();

    // Format grid lines (and anything else)
    var hGridlines = d3.select('g.grid-line.horizontal').selectAll('line')
    // var vGridlines = d3.select('g.grid-line.vertical').selectAll('line')
    
    hGridlines.attr('stroke-width',0.5)
        .attr('stroke','black')
        .style('opacity',0.5)

    // vGridlines.attr('stroke-width',0.5)
    //     .attr('stroke','black')
    //     .style('opacity',0.5)

    // dcjs doesn't have a good utility for area charts between lines
    // so manually hiding the lower area to focus on the IQR
    var area2hide = d3.select('path.area')

    area2hide.style('fill-opacity',0)

  }

  ---------- End of old make chart --------- */

}

class bChart {

  constructor(width) {
    this.width = width // - margin.left - margin.right;
    this.title = "";
    this.ylabel = "";
  }

  // Set title of chart
  setTitle(title) {
    this.title = title;
    return this;
  }

  setYLabel(ylabel) {
    this.ylabel = ylabel;
    return this;
  }

  makeChart(dcChart,dim,group) {

    dcChart.width(this.width)
        .height(0.6*this.width)
        .margins(margin)
        .mouseZoomable(false)
        .dimension(dim)
        .group(group)
        .elasticY(true)
        .xUnits(dc.units.fp.precision(0.05))
        //.centerBar(true)
        //.gap(1)
        //.y(d3.scaleLinear().domain([0,600]))
        .x(d3.scaleLinear().domain([0,3]))
        .render()

    //dc.renderAll('todo')
  }

}

class rChart {

  constructor(width) {
    this.width = width;
    this.title = "";
    this.ylabel = "";
  }

  // Set title of chart
  setTitle(title) {
    this.title = title;
    return this;
  }

  setYLabel(ylabel) {
    this.ylabel = ylabel;
    return this;
  }

  makeChart(dcChart,dim,group) {

    dcChart.width(this.width)
      .height(0.1*this.width)
      .margins({top: 10, right: 20, bottom: 30, left: 40})
      .mouseZoomable(false)
      .dimension(dim)
      .group(group)
      .elasticY(true)
      .x(d3.scaleTime()
          .domain([new Date(2008, 0, 1, 0), new Date(2009, 0, 1, 12)]))
      .valueAccessor(p => p.value)
      .xAxis()
      .tickFormat(d => { 
        //let date = dateFromDay(2008,d/2);
        let formatter = d3.timeFormat("%B")
        
        return formatter(d)
        //return d
      });

      dcChart.yAxis().ticks(3);

      dcChart.render();
  }

  /* ------ Old makeChart -------
  makeChart(dcChart,dim,group) {

    dcChart.width(this.width)
        .height(0.05*this.width)
        .margins({top: 0, right: 40, bottom: 20, left: 40})
        .mouseZoomable(false)
        .dimension(dim)
        .group(group)
        .elasticY(true)
        .x(d3.scaleLinear().domain([1,732]))
        //.y(d3.scaleLinear().domain([0,100]))
        //.x(d3.scaleTime()
        //  .domain([new Date(2008, 0, 1, 0), new Date(2009, 0, 1, 12)]))
        //.keyAccessor(p => {return dateFromDay(2008,p.key)})
        .valueAccessor(p => p.value)
        .xUnits(dc.units.fp.precision(0.5))
        .xAxis()
        .tickFormat(d => { 
          let date = dateFromDay(2008,d/2);
          let formatter = d3.timeFormat("%B")
          
          return formatter(date)
          //return d
        })
        .ticks(12)
    
    dcChart.render();

    //dc.renderAll('todo')
  }
   ------ old make chart ------- */

}

class tabChart {

  constructor(width) {
    this.width = width;
    this.title = "";
    this.ylabel = "";
  }

  // Set title of chart
  setTitle(title) {
    this.title = title;
    return this;
  }

  makeChart(dcChart,dim,unit,top=true) {

    // Set appropriate variable for top 5 / bottom 5 list
    let ordering = top ? d3.descending : d3.ascending

    // If we're listing min values, filter the missing vals (-9999s)
    if (top == false) {
      dim.filter(d => { return d > -9999})
    }

    dcChart.width(this.width)
        //.height(0.5*this.width)
        //.margins({top: 0, right: 40, bottom: 20, left: 40})
        .dimension(dim)
        .size(5)
        .order(ordering)
        .columns([
          //'date',
          {
            label: 'Date',
            format: d => {
              let formatter = d3.timeFormat("%b %d, %Y (%HZ)")
              return formatter(d.date)
            }
          },
          {
            label: 'Value',
            format: d => {
              return `${d.val}${unit}` 
            }
          }
        ])
        .render();
        //.data(dim => dim.top(5))
  }

}