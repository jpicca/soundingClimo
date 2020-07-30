// Select Map Areas
$("area").on("click", function() {
    $("#stn").val($(this).attr("id"));
    updateStation();
    updateData();
});

// Change station via menu
$("#stn").on("change", function() {

  // Clear any locked/highlighted data
  clearLock();

  // Decrease opacity of plots while new data is processing
  loadingFormat();

  updateStation();
  updateData(false);
});

// On Time Change
$("#soundingtimes input[type='radio']").on("change", function() {

  // Clear any locked/highlighted data
  clearLock();

  updateSoundTime();

  refreshChart('time');
});

// On Filtered Change
$("#raw-vs-filter input[type='radio']").on("change", function() {

  // Clear any locked/highlighted data
  clearLock();

  loadingFormat();
  updateFiltered();
  updateData(false);
});

// Change Parameter
$("#sndparam").on("change", function() {

  let parm = $('#sndparam option:selected').val().toLowerCase();
  let canFilter = $.inArray(parm,dm.get0List())

  // Only enable the 0 filter checkbox if it's filterable parm
  // and make sure box is unchecked if it's not filterable
  if (canFilter == -1) {
    $('#filter0').prop('checked',false);
    $('#filter0').attr('disabled',true);
  } else {
    $('#filter0').attr('disabled',false);
  }

  // Clear the y-axis input boxes
  $('#ymax').val('')
  $('#ymin').val('')

  // Clear the filter input boxes
  $('#filterMin').val('')
  $('#filterMax').val('')

  if (parm != "pass") {

    // Clear any locked/highlighted data
    clearLock();

    loadingFormat();

    updateSoundParm();
    updateSoundParmUnit();
    updateData(false);
  };
});

// Change in yaxis values
$("#ymax, #ymin").on("change", function() {

  // Clear any locked/highlighted data
  clearLock();

  loadingFormat();

  refreshChart('yaxis');

});

// On moving average change
$("#movave").on("change", function() {

  // Clear any locked/highlighted data
  clearLock();

  updateSmoothPeriod();
  $("#movave").val(dm.smoothPeriod())  // Update displayed value to new period
  updateData(false);
});

// Variable filter
$("#filterMin").on("change", function() {

  // Clear any locked/highlighted data
  clearLock();

  updateData(false);
});

$("#filterMax").on("change", function() {
  
  // Clear any locked/highlighted data
  clearLock();

  updateData(false);
});

// Filter 0s
// $("#filter0").on("change", function() {

//   // Clear any locked/highlighted data
//   clearLock();

//   updateFilter();

//   updateData(false);
// });

// Only display moving averages
$("#dateplot").on("change", function() {

  // Clear any locked/highlighted data
  clearLock();

  if ($("#dateplot").prop("checked")) {
    $(".sub._1").hide();
    $(".sub._5").hide();
    $(".sub._8").hide();
  } else {
    $(".sub._1").show();
    $(".sub._5").show();
    $(".sub._8").show();
  };
});

// Show Help
$("#showinfo").on("click", function() {
  window.open('climoplotinfo.html', 'HELP', "width=800, height=600, top=100, left=300");
});

// The checkbox for plotting observations is controlled in the main.js file.
// This is because this routine must be called after the plotObs function is defined.
