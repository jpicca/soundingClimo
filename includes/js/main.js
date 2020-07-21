// Initialize the data manager
var dm = d3Edge.dataManager();
var chart = new tsChart($("#line-chart").width())
var chart2 = new bChart($("#bar-chart").width())
var chart3 = new rChart($("#obs-count").width())
var chart4 = new tabChart($("#max-table").width())
var chart5 = new tabChart($("#min-table").width())

// Instantiate dc Chart
//const timeSeries = new dc.LineChart('#line-chart')
var timeSeries = new dc.CompositeChart('#line-chart')
var hist = new dc.BarChart('#bar-chart')
var range = new dc.BarChart('#obs-count')
var maxTab = new dc.DataTable('#max-table')
var minTab = new dc.DataTable('#min-table')

// Updated Whether DataManager is operating on Raw or Filtered Files
function updateFiltered() {
  //console.log($("#raw-vs-filter input[type='radio']:checked").val().toLowerCase())
  dm.filteredFiles($("#raw-vs-filter input[type='radio']:checked").val().toLowerCase())
};

// Update the DataManager station ID
function updateStation() { 
  dm.station($("#stn").val().toLowerCase());

  /* Commented out period of record update -- need to change */
  //updatePOR();
};

// When Sounding Time is updated, set new time and updated the smoother
function updateSoundTime() {
  dm.soundTime($("#soundingtimes input[type='radio']:checked").val().toLowerCase());
  updateSmoothPeriod();
};

// Updated the DataManager Smoothing Period
function updateSmoothPeriod() {
  if ($("#movave").val() == 0) { dm.smoothPeriod($("#movave").val()); }
  else { dm.smoothPeriod(makeOdd(+$("#movave").val())); };
};

// Update the DataManager Sounding Parameter
function updateSoundParm() { dm.soundParm($('#sndparam option:selected').val().toLowerCase()); };
function updateSoundParmUnit() { dm.soundParmUnit($('#sndparam option:selected').attr('unit')); };

// Update the ymin and ymax values in DataManager
function updateYaxisBounds() {
  var ymin = $("#ymin").val(); dm.ymin( ymin = (ymin === "") ? 'ymin' : +ymin );
  var ymax = $("#ymax").val(); dm.ymax( ymax = (ymax === "") ? 'ymax' : +ymax );
};

// Need to return a resolved promise for async jq call functions
function updateQuantiles() {
  return new Promise((resolve,reject) => {

    dm.createDefaultQuantiles();

    resolve();
  })
}

// Update the data in the DataManager
async function updateData(newFile=true) {

  /* Using promise resolve */

  // Await the resolution of the promise in readData before continuing
  // Introduced an if statement -- if we're not reading a new file, we don't need to run
  // readData (I think)

  if (newFile) {
  
    await dm.readData(dm.fileName());

  }

  await dm.createDefaultQuantiles();

  console.log("Quantiles updated!")

  chart.setTitle(dm.soundTime().toUpperCase() + " Soundings for " + dm.station()
        .toUpperCase())
        .setYLabel($('#sndparam option:selected').text());

  // Set chart title
  $('#svg-title').text(chart.title);

  // Make initial charts
  //chart.makeChart(timeSeries,dm.getindexDim(),dm.getGroupByDay());

  chart.makeChart(timeSeries,dm.getDateIdxDim(),dm.getGroupByDay());

  chart2.makeChart(hist,dm.getbarDim(),dm.getbarGroup());
  
  chart3.makeChart(range,dm.getDateIdxDim(),dm.getGroupByDateCount());
  
  chart4.makeChart(maxTab,dm.getbarDim(),dm.getUnit());
  chart5.makeChart(minTab,dm.getbarDim(),dm.getUnit(),false);

  finishedFormat();
};

async function refreshChart(type) {

  switch (type) {
    case 'time' :
      let newTime = +$("#soundingtimes input[type='radio']:checked").val().slice(0,2)
      
      // If newTime is coerced to int, it'll be 0 or 12; otherwise 'all' is changed to NaN
      // Time is all
      if (isNaN(newTime)) {
        
        // Clear the time filters
        dm.getUserDim().filter()

        // Redraw all charts (except for time series)
        dc.redrawAll();

        // Update time series chart with original dimension / group
        chart.makeChart(timeSeries,dm.getDateIdxDim(),dm.getGroupByDay());

      } 
      // Time is 00 or 12
      else {
        console.log(`refresh chart with **${newTime}**`)
        
        // Need to re-run quantiles (can't just filter since the smoothed values will change)
        await dm.createDefaultQuantiles(false);

        console.log('quantiles calculated')

        dm.getUserDim().filter(d => { return d.getHours() == newTime });
        
        console.log('user dim filtered')
        // Redraw all charts (except time series)
        dc.redrawAll();

        console.log('all redrawn')

        // Time series has to use a special function that utilizes temp crossfilters/dimensions
        dm.updateTSGroup();
      }

      // Update title
      $('#svg-title').text(`${dm.soundTime().toUpperCase()} Soundings for ${dm.station().toUpperCase()}`)

      break;
  }

  finishedFormat();

}

$(document).ready(function() {

  updateFiltered();
  updateStation();
  updateSoundTime();
  updateSoundParm();
  updateSoundParmUnit();
  //updateSmoothPeriod();
  updateYaxisBounds();
  updateData();
  

})
