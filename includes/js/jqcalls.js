// Select Map Areas
$("area").on("click", function() {
    $("#stn").val($(this).attr("id"));
    updateStation();
    updateData();
});

// On Time Change
$("#soundingtimes input[type='radio']").on("change", async function() {
  updateSoundTime();
  await updateQuantiles();
  updateData();
});

// On Filtered Change
$("#raw-vs-filter input[type='radio']").on("change", function() {
  updateFiltered();
  updateData();
});

// Change Parameter
$("#sndparam").on("change", function() {
  if ($('#sndparam option:selected').val().toLowerCase() != "pass") {
    updateSoundParm();
    updateSoundParmUnit();
    updateData();
  };
});

// Change in yaxis values
$("#ymax, #ymin").on("change", function() {
  updateYaxisBounds();
  updateData();
});

// On moving average change
$("#movave").on("change", function() {
  updateSmoothPeriod();
  $("#movave").val(dm.smoothPeriod())  // Update displayed value to new period
  updateData();
});

// Only Display Moving Averages
$("#filter0").on("change", function() {
  updateFilter();
  updateData();
});

// Filter0s
$("#dateplot").on("change", function() {
  if ($("#dateplot").prop("checked")) {
    $("#p00").hide();
    $("#mean").hide();
    $("#p100").hide();
  } else {
    $("#p00").show();
    $("#mean").show();
    $("#p100").show();
  };
});

// Show Help
$("#showinfo").on("click", function() {
  window.open('climoplotinfo.html', 'HELP', "width=800, height=600, top=100, left=300");
});

// The checkbox for plotting observations is controlled in the main.js file.
// This is because this routine must be called after the plotObs function is defined.
