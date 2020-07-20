var margin = {top: 10, right: 20, bottom: 40, left: 40};
var height = $(window).height()

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
      .height(height*0.65)
      //.height(0.65*this.width)
      //.margins(margin)
      .x(d3.scaleTime()
          .domain([new Date(2008, 0, 1, 0), new Date(2009, 0, 1, 12)]))
      .renderHorizontalGridLines(true)
      .dimension(dim)
      .group(group)
      .yAxisLabel($('#sndparam option:selected').text())
      .elasticY(true)
      .rangeChart(range)
      .brushOn(false)
      .compose([
        new dc.LineChart(dcChart)
            .dimension(dim)
            .group(group)
            .valueAccessor(p => p.value.p25)
            .stack(group, 'p75', p => p.value.p75 - p.value.p25)
            .renderArea(true)
            .colors(['#800001']),
        new dc.LineChart(dcChart)
            .colors(['#665DF2'])
            .valueAccessor(p => p.value.p00),
        new dc.LineChart(dcChart)
            .colors(['#000F8B'])
            .valueAccessor(p => p.value.p01),
        new dc.LineChart(dcChart)
            .valueAccessor(p => p.value.p10)
            .colors(['#2AAAAA']),
        new dc.LineChart(dcChart)
            .valueAccessor(p => p.value.p50)
            .colors(['#000000']),
        new dc.LineChart(dcChart)
            .valueAccessor(p => p.value.mean)
            .colors(['#333333']),
        new dc.LineChart(dcChart)
            .valueAccessor(p => p.value.p90)
            .colors(['#ce933b']),
        new dc.LineChart(dcChart)
            .valueAccessor(p => p.value.p99)
            .colors(['#8B0000']),
        new dc.LineChart(dcChart)
            .valueAccessor(p => p.value.p100)
            .colors(['#F9182C'])
      ])
      // Use the highlighting function to bind data updating on render/re-draws
      .on('renderlet', () => {
        highlighting();
      })
      .on('pretransition', () => {
        // Format grid lines (and anything else)
        var hGridlines = d3.select('g.grid-line.horizontal').selectAll('line')
        
        hGridlines.attr('stroke-width',0.5)
            .attr('stroke','black')
            .style('opacity',0.5)

        // dcjs doesn't have a good utility for area charts between lines
        // so manually hiding the lower area to focus on the IQR
        var area2hide = d3.select('path.area')
        area2hide.style('fill-opacity',0)
      })
      .xAxis()
      .tickFormat(d3.timeFormat('%b %d'))

      dcChart.render();

  }
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
        .height(0.3*height)
        .margins(margin)
        .mouseZoomable(false)
        .dimension(dim)
        .group(group)
        .elasticY(true)
        .xUnits(dc.units.fp.precision(parmParm[$('#sndparam option:selected').text()]))
        .yAxisLabel('# Obs')
        .xAxisLabel($('#sndparam option:selected').text())
        //.centerBar(true)
        //.gap(1)
        //.y(d3.scaleLinear().domain([0,600]))
        .x(d3.scaleLinear().domain([0,3]));
        
        dcChart.yAxis().ticks(8);
        dcChart.render();

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
      .height(0.1*height)
      //.margins(margin)
      .mouseZoomable(false)
      .dimension(dim)
      .group(group)
      .yAxisLabel('# Obs')
      .elasticY(true)
      .x(d3.scaleTime()
          .domain([new Date(2008, 0, 1, 0), new Date(2009, 0, 1, 12)]))
      //.valueAccessor(p => p.value)
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

function loadingFormat() {
  $("#svg-plot").css("opacity",0.1)
  $("#loading-page").css("visibility","visible")
}

function finishedFormat() {
  $("#svg-plot").css("opacity",1)
  $("#loading-page").css("visibility","hidden")
}

function highlighting() {

  // Set up tooltip
  //let chartGrab = d3.select('#line-chart')
  let circles = d3.selectAll('circle')
  let formatter = d3.timeFormat("%b %d (%HZ)")
  let date;

  circles.on('mouseover', d => 
    {

      updateSample(d,formatter);
      /*d3.select('span.mutable')
        .html(`<b>${formatter(d.data.key)}</b>`)

      let row = d3.select('tr.mutable')

      row.select('#min')
        .text(d.data.value.p00.toFixed(2))

      row.select('#amin')
        .text(d.data.value.p01.toFixed(2))

      row.select('#a10')
        .text(d.data.value.p10.toFixed(2))

      row.select('#a25')
        .text(d.data.value.p25.toFixed(2))

      row.select('#amed')
        .text(d.data.value.p50.toFixed(2))

      row.select('#mean')
        .text(d.data.value.mean.toFixed(2))

      row.select('#a75')
        .text(d.data.value.p75.toFixed(2))

      row.select('#a90')
        .text(d.data.value.p90.toFixed(2))

      row.select('#amax')
        .text(d.data.value.p99.toFixed(2))

      row.select('#max')
        .text(d.data.value.p100.toFixed(2))*/
    }).on('click', d => {

      // If there are unmutable classes present, that means we have a date selected
      let locked = d3.select('.unmutable').node()

      if (locked) {
        d3.selectAll('.unmutable')
          .classed('mutable',true)

        updateSample(d,formatter)
      }

      // Remove previous date highlighting of dots
      d3.selectAll('.datetime')
        .classed('datetime',false)

      // If we click dot, we want to lock date/data on table
      d3.select('th.mutable')
        .classed('mutable', false)
        .classed('unmutable', true)

      d3.select('tr.mutable')
        .classed('mutable', false)
        .classed('unmutable', true)

      // Get date from data 
      date = d.data.key;

      // Get list of elements that meet the data filter
      let elements = d3.selectAll('circle')
                        .filter(d => { return d.data.key == date})

      // Use nodes to grab cx and list of cy's
      // let cx = elements.nodes()[0].getAttribute('cx') + margin.left

      // let cy = [];
      // elements.nodes().forEach( entry => {
      //   cy.push(+entry.getAttribute('cy'))
      // })

      // console.log(cx)

      // // Take max/min of cy
      // let ymax = d3.max(cy) + margin.top
      // let ymin = d3.min(cy) + margin.top

      // // Draw a line on svg representing the day
      // let svg = d3.select('#line-chart').select('svg')
      
      // svg.append('line')
      //     .classed('dateline',true)
      //     .attr('x1',cx)
      //     .attr('x2',cx)
      //     .attr('y1',ymin)
      //     .attr('y2',ymax)
      //     .style('stroke','black')

      d3.selectAll('circle')
        .filter(d => { return d.data.key == date})
        .classed('datetime', true)

      // Use the instruction span to allow user to unlock data
      let instruct = d3.select('#instruction')
        
      instruct.html('<a href="#">&nbsp; Unlock Data</a>')

      instruct.select('a')
        .on('click', () => {
          instruct.html('&nbsp; (Click sampled date to lock data)')
          d3.selectAll('.datetime')
            .classed('datetime',false)

          d3.selectAll('.unmutable')
            .classed('mutable',true)
            .classed('unmutable',false)
        })
      
      

    });

}

function updateSample(d,formatter) {

  d3.select('th.mutable')
        .html(`<b>${formatter(d.data.key)}</b>`)

      let row = d3.select('tr.mutable')

      row.select('#min')
        .text(d.data.value.p00.toFixed(2))

      row.select('#amin')
        .text(d.data.value.p01.toFixed(2))

      row.select('#a10')
        .text(d.data.value.p10.toFixed(2))

      row.select('#a25')
        .text(d.data.value.p25.toFixed(2))

      row.select('#amed')
        .text(d.data.value.p50.toFixed(2))

      row.select('#mean')
        .text(d.data.value.mean.toFixed(2))

      row.select('#a75')
        .text(d.data.value.p75.toFixed(2))

      row.select('#a90')
        .text(d.data.value.p90.toFixed(2))

      row.select('#amax')
        .text(d.data.value.p99.toFixed(2))

      row.select('#max')
        .text(d.data.value.p100.toFixed(2))

}