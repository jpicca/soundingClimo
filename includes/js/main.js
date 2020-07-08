// Initialize the data manager
var dm = d3Edge.dataManager();
var chart = new tsChart($("#line-chart").width())
var chart2 = new bChart($("#bar-chart").width())
var chart3 = new rChart($("#obs-count").width())

// Instantiate dc Chart
//const timeSeries = new dc.LineChart('#line-chart')
var timeSeries = new dc.CompositeChart('#line-chart')
var hist = new dc.BarChart('#bar-chart')
var range = new dc.BarChart('#obs-count')

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

// Update the data in the DataManager
async function updateData() {

  /* Using promise resolve */

  // Await the resolution of the promise in readData before continuing
  await dm.readData(dm.fileName());

  // Do stuff with data
  console.log('Data read!')

  await dm.createDefaultQuantiles();

  console.log("Quantiles updated!")

  chart.setTitle(dm.soundTime().toUpperCase() + " Soundings for " + dm.station()
        .toUpperCase())
        .setYLabel($('#sndparam option:selected').text());

  // Set chart title
  $('#svg-title').text(chart.title);

  // Make initial charts
  chart.makeChart(timeSeries,dm.getindexDim(),dm.getGroupByDay());
  chart2.makeChart(hist,dm.getbarDim(),dm.getbarGroup());
  chart3.makeChart(range,dm.getindexDim(),dm.getGroupByDayRange());

  /* Old code using bindings */
  /*
  dm.readData(dm.fileName());
  dm.on("dataReady", function() {
    updateQuantiles();
    chart
      .title(dm.soundTime().toUpperCase() + " Soundings for " + dm.station().toUpperCase())
      .yLabel($('#sndparam option:selected').text());
    d3.select("#svg-plot")
      .datum(dm.getData())
      .call(chart);
    $("#legend").removeClass("hide").css("display", "inline-block");
    plotObs();
  }); */
};

$(document).ready(function() {

  updateFiltered();
  updateStation();
  updateSoundTime();
  updateSoundParm();
  updateSoundParmUnit();
  updateSmoothPeriod();
  updateYaxisBounds();
  updateData();
  

})
