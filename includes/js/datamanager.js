// Data Manager object
var d3Edge = {};

// ** Global variables for testings **
var tempXF, tempDim, newGroup;

d3Edge.dataManager = function module() {

  var exports = {}, data, raw_data,
      qdata = [], fdata, filtered = false,
      doy, station, soundTime, soundParm, soundParmUnit, fileName,
      ymin, ymax, period, smoothPeriod, indexDim, obs, groupByDay,
      groupByDayRange, binwidth, filter0s = false;

  var filter0Fields = ['sbcape','mlcape', 'mucape', 'mlcape03', 'dcape'];

  exports.filteredFiles = function(val) {
    if (!arguments.length) return filtered;
    if (val == "filtered") { filtered = true; }
    else { filtered = false; }
    exports.fileName(station, soundParm, filtered);
    return this;
  };

  exports.station = function(val) {
    if (!arguments.length) return station;
    station = val;
    exports.fileName(station, soundParm, filtered);
    return this;
  };

  exports.soundTime = function(val) {
    if (!arguments.length) return soundTime;
    soundTime = val;
    return this;
  };

  exports.soundParm = function(val) {
    if (!arguments.length) return soundParm;
    soundParm = val;
    exports.fileName(station, soundParm, filtered);
    return this;
  };

  exports.soundParmUnit = function(val) {
    if (!arguments.length) return soundParmUnit;
    soundParmUnit = val;
    return this;
  };

  exports.fileName = function(stn, sndparm, filtered) {
    if (!arguments.length) return fileName;
    if (filtered) {
      fileName = "../soundingclimo.pmarshwx.com/datafiles/" + stn + "/" + stn + "-" + sndparm + "-filtered.csv";
    } else {
      fileName = "../soundingclimo.pmarshwx.com/datafiles/" + stn + "/" + stn + "-" + sndparm + ".csv";
    }

    console.log(`Filename: ${fileName}`)
    return this;
  };

  exports.smoothPeriod = function(val) {
    if (!arguments.length) return smoothPeriod;
    smoothPeriod = val;
    if (soundTime != '00z' && soundTime != '12z') {
      period = makeOdd(smoothPeriod * 2);
    } else {
      period = makeOdd(smoothPeriod);
    };
    return this;
  };

  exports.ymin = function(val) {
    if (!arguments.length) return ymin;
    ymin = val;
    return this;
  };

  exports.ymax = function(val) {
    if (!arguments.length) return ymax;
    ymax = val;
    return this;
  };

  exports.filter0 = function(val) {
    if (!arguments.length) return filter0s;
    filter0s = val;
    return this;
  };

  exports.smoother = function(_arr) {
    if (period == 0) { return _arr; };
    var nn = _arr.length,
        arr = [].concat(_arr || []),
        t = [],
        halfperiod = Math.floor(period / 2);
    for (i = 0; i < halfperiod; i++) {
      arr.splice(0, 0, arr[nn-1]);
      arr.splice(nn+1+2*i, 0, arr[2*i + 1]);
    };
    for (i = halfperiod+1; i <= halfperiod + nn; i++) {
      t.push( d3.sum(arr.slice(i-halfperiod-1, i+halfperiod)) / period );
    };
    return t;
  };

  exports.readObs = function() {
    if (station.toUpperCase() == "ELP") {
      var obs_file = "../soundingclimo.pmarshwx.com/obs/EPZ.json";
    } else if (station.toUpperCase() == "RAP") {
      var obs_file = "../soundingclimo.pmarshwx.com/obs/UNR.json";
    } else {
      var obs_file = "../soundingclimo.pmarshwx.com/obs/" + station.toUpperCase() + ".json";
    }
    // Read obs json file and set obs variable as response
    d3.json(obs_file).then(json_data => {
      obs = json_data;
    }).catch(err => { console.log(err) });
  };

  exports.readData = function(_file) {

    // Use a promise that resolves once data are loaded
    return new Promise((resolve,reject) => {

      console.log(`readData processing with: ${_file}`)
      
      fdata = crossfilter();

      testArr = []
      
      // Read csv file and organize columns
      d3.csv(_file).then(csv_data => {
        csv_data.forEach((d,i) => {

          d.index = i;
          d.date = parseDate(d.date);

          // Coerce 03Z to 00Z and 15Z to 12Z
          if (d.date.getHours() == 3) {
            d.date.setHours(0)
          } else if (d.date.getHours() == 15) {
            d.date.setHours(12)
          }

          d.val = +d.val;

          // Create a 0-731 index to access quantile values
          d.dayIdx = Math.floor(2*(dateToDay(d.date) - 1));

          // Create our 2008 datetimes for plotting
          // Use this for new dimensioning along chart axes
          d.idxDate = dateFromDay(2008,dateToDay(d.date))

        });
        
        raw_data = csv_data;

        //console.log(raw_data)

        // Adding the csv data to the crossfilter (not sure if this is 
        // needed right now)
        //fdata.add(csv_data);
      
        // Get day of year (numbered 1-365(6)) and use it as dimension in filter
        //doy = fdata.dimension(function(d) { return dateToDay(d.date); });
        
        // Also create a dimension based on the type of the record (quantile or raw)

        // Resolve promise once d3.csv has data processed
        resolve();

      });

    })
    
  };

  exports.getSoundingLoopParms = function(sndtime) {
    if (sndtime == "00z") { return [1, 1];           // Start at Day 1 and give every day
    } else if (sndtime == "12z") { return [1.5, 1];  // Start at Day 1.5 and give every day
    } else { return [1, 0.5];                        // Start at Day 1, and give every half day
    };
  };

  exports.createDefaultQuantiles = function(init=true) {
    var loopParms, tvals;
    qdata.p00 = []; qdata.p01 = []; qdata.p10 = [];
    qdata.p25 = []; qdata.p50 = []; qdata.p75 = [];
    qdata.p90 = []; qdata.p99 = []; qdata.p100 = [];
    qdata.mean = []; qdata.date = []; qdata.index = [];
    loopParms = exports.getSoundingLoopParms(soundTime);

    return new Promise((resolve,reject) => {

      for (i = loopParms[0]; i < 367; i+=loopParms[1]) {
      
        tvals = []

        // Filter raw data for current day of year
        _tvals = raw_data.filter(d => { return dateToDay(d.date) == i })

        // *** May be able to make more efficient with another filter, versus looping / pushing ***
        _tvals.forEach(function(p) { if (p.val >  -999.) {tvals.push(p.val); }; });

        // Filter 0s from values if criteria is met
        // if (filter0s && $.inArray(soundParm, filter0Fields) > -1) { tvals = tvals.filter(function(p) { return p > 0; })};
        
        // Introduce user-variable filtering
        if ($('#filterMin').val()) { tvals = tvals.filter(d => { return d > $('#filterMin').val() })}
        if ($('#filterMax').val()) { tvals = tvals.filter(d => { return d < $('#filterMax').val() })}

        // When we filter 0s, if there are no values remaining, it will end up pushing "undefined"
        // into the quantile calc. This will break the time series plotting. Soo just tossing in a 0
        // to fix this problem for the time being.
        if (!tvals.length) { tvals.push(0) }

        // Sort the values to prep for quantile calc
        tvals = tvals.sort(function(a,b) { return a-b; });
        qdata.push()
        qdata.p00.push(d3.min(tvals));
        qdata.p01.push(d3.min(tvals));
        qdata.p10.push(d3.quantile(tvals, 0.10));
        qdata.p25.push(d3.quantile(tvals, 0.25));
        qdata.p50.push(d3.quantile(tvals, 0.50));
        qdata.p75.push(d3.quantile(tvals, 0.75));
        qdata.p90.push(d3.quantile(tvals, 0.90));
        qdata.p99.push(d3.max(tvals));
        qdata.p100.push(d3.max(tvals));
        qdata.mean.push(d3.mean(tvals));
        qdata.index.push(i);
        qdata.date.push(dateFromDay(2008, i));
      }

      qdata.p01 = exports.smoother(qdata.p01, period);
      qdata.p10 = exports.smoother(qdata.p10, period);
      qdata.p25 = exports.smoother(qdata.p25, period);
      qdata.p50 = exports.smoother(qdata.p50, period);
      qdata.p75 = exports.smoother(qdata.p75, period);
      qdata.p90 = exports.smoother(qdata.p90, period);
      qdata.p99 = exports.smoother(qdata.p99, period);
      data = [];
      for (i = 0; i < qdata.index.length; i++) {
        var q = new Object();
        q.index = qdata.index[i];
        q.p00 = qdata.p00[i];
        q.p01 = qdata.p01[i];
        q.p10 = qdata.p10[i];
        q.p25 = qdata.p25[i];
        q.p50 = qdata.p50[i];
        q.p75 = qdata.p75[i];
        q.p90 = qdata.p90[i];
        q.p99 = qdata.p99[i];
        q.p100 = qdata.p100[i];
        q.mean = qdata.mean[i];
        q.date = qdata.date[i];
        q.type = "quantile"
        data.push(q);
      };

      // If we're loading new data, create new crossfilter dimensions/groups
      if (init) {
        exports.createDimsGroups()
      };

      /*
      // ** Add our data to crossfilter **
      // Use a filter to only add non-missing data
      fdata.add(raw_data.filter(d => { return d.val > -999 }));
      //fdata.groupAll();

      // New dimensions
      barDim = fdata.dimension(d => d.val)
      dateIdxDim = fdata.dimension(d => d.idxDate)

      // Create an identical dimension to allow user to filter via sounding time radio button
      // Charts don't "listen" to their own dimension (to prevent weird actions)
      userFilterDim = fdata.dimension(d => d.idxDate)

      // ** Make sure to update the parmparm values **
      binwidth = parmParm[$('#sndparam option:selected').text()]

      // New groups
      barGroup = barDim.group(d => { return binwidth * Math.floor(d/binwidth)});
      groupByDateCount = dateIdxDim.group();

      //groupByDay = indexDim.group().reduce(
      groupByDay = dateIdxDim.group().reduce(
        (p,v) => {
          ++p.count
          p.index = data[v.dayIdx].index
          p.p00 = data[v.dayIdx].p00
          p.p01 = data[v.dayIdx].p01
          p.p10 = data[v.dayIdx].p10
          p.p25 = data[v.dayIdx].p25
          p.p50 = data[v.dayIdx].p50
          p.mean = data[v.dayIdx].mean
          p.p75 = data[v.dayIdx].p75
          p.p90 = data[v.dayIdx].p90
          p.p99 = data[v.dayIdx].p99
          p.p100 = data[v.dayIdx].p100
          return p;
        },
        (p,v) => {
          --p.count
          p.index = data[v.dayIdx].index
          p.p00 = data[v.dayIdx].p00
          p.p01 = data[v.dayIdx].p01
          p.p10 = data[v.dayIdx].p10
          p.p25 = data[v.dayIdx].p25
          p.p50 = data[v.dayIdx].p50
          p.mean = data[v.dayIdx].mean
          p.p75 = data[v.dayIdx].p75
          p.p90 = data[v.dayIdx].p90
          p.p99 = data[v.dayIdx].p99
          p.p100 = data[v.dayIdx].p100
          return p;
        },
        () => ({count: 0, index:0, p00: 0, p01: 0, p10: 0,
           p25: 0, p50: 0, mean: 0, p75: 0, p90: 0, p99: 0, p100: 0})
      ) */

      // Resolve promise once quantiles are calculated
      resolve();
    });

  };

  exports.createDimsGroups = function () {

    // Remove any missing data before adding to the crossfilter
    fdata.add(raw_data.filter(d => { return d.val > -999 }));

    // New dimensions for the bar chart and the time series/range charts
    barDim = fdata.dimension(d => d.val)
    dateIdxDim = fdata.dimension(d => d.idxDate)

    // Create an identical dimension to allow user to filter via sounding time radio button
    // Charts don't "listen" to their own dimension (to prevent weird actions)
    userFilterDim = fdata.dimension(d => d.idxDate);
    zeroFilterDim = fdata.dimension(d => d.val);

    // ** Make sure to update the parmparm values **
    // Have default binwidths for the different parameters
    binwidth = parmParm[$('#sndparam option:selected').text()].bin;

    // New groups for the bar chart and the range chart
    barGroup = barDim.group(d => { return binwidth * Math.floor(d/binwidth)});
    groupByDateCount = dateIdxDim.group();

    // New group for the time series chart
    // Use the sound time to create the right index to get the proper entry from
    // the quantile object (data variable)
    groupByDay = dateIdxDim.group().reduce(
      // On addition of records, set values for their group
      (p,v) => {
        
        let formatIdx = 0;
        // Check sounding time to format indexing
        switch (soundTime) {
          case '00z' :
            formatIdx = v.dayIdx/2;
            break;
          case '12z' :
            formatIdx = Math.floor(v.dayIdx/2);
            break;
          case 'all' :
            formatIdx = v.dayIdx;
            break;
        }

        ++p.count
        p.index = data[formatIdx].index
        p.p00 = data[formatIdx].p00
        p.p01 = data[formatIdx].p01
        p.p10 = data[formatIdx].p10
        p.p25 = data[formatIdx].p25
        p.p50 = data[formatIdx].p50
        p.mean = data[formatIdx].mean
        p.p75 = data[formatIdx].p75
        p.p90 = data[formatIdx].p90
        p.p99 = data[formatIdx].p99
        p.p100 = data[formatIdx].p100
        return p;
      },
      // When records are filtered out, we don't want to progressively update the time
      // series chart, bc it would look very weird / not be helpful.
      // Therefore, simply return the values as they are... I think this is the best way
      // to handle this.
      (p,v) => {

        return p;
      },
      // Not sure if this initialization is needed.
      () => ({count: 0, index:0, p00: 0, p01: 0, p10: 0,
         p25: 0, p50: 0, mean: 0, p75: 0, p90: 0, p99: 0, p100: 0})
    )

  }

  // This method is used to create temporary crossfilter/dimension
  // in order to update the time series chart.
  // We do this because our original dimension for the time series 
  // does not allow for removal of values (to avoid weird plotting)
  // So we need a new temp dimension and grouping to re-create the chart.
  exports.updateTSGroup = function () {

    //console.log(dateIdxDim.top(10))
    let tempXF = crossfilter(dateIdxDim.top(Infinity));
    let tempDim = tempXF.dimension(d => d.idxDate)

    let newGroup = tempDim.group().reduce(
      (p,v) => {

        let formatIdx = 0;
        // Check sounding time to format indexing
        switch (soundTime) {
          case '00z' :
            formatIdx = v.dayIdx/2;
            break;
          case '12z' :
            formatIdx = Math.floor(v.dayIdx/2);
            break;
          case 'all' :
            formatIdx = v.dayIdx;
            break;
        }

        ++p.count
        p.index = data[formatIdx].index
        p.p00 = data[formatIdx].p00
        p.p01 = data[formatIdx].p01
        p.p10 = data[formatIdx].p10
        p.p25 = data[formatIdx].p25
        p.p50 = data[formatIdx].p50
        p.mean = data[formatIdx].mean
        p.p75 = data[formatIdx].p75
        p.p90 = data[formatIdx].p90
        p.p99 = data[formatIdx].p99
        p.p100 = data[formatIdx].p100
        return p;
      },
      (p,v) => {

        return p;
      },
      () => ({count: 0, index:0, p00: 0, p01: 0, p10: 0,
         p25: 0, p50: 0, mean: 0, p75: 0, p90: 0, p99: 0, p100: 0})
    )

    // Re-create the chart once we have our new dimension and group
    chart.makeChart(timeSeries,tempDim,newGroup);

  };

  exports.getXFdata = function () { return fdata; };
  exports.getUserDim = function () { return userFilterDim; };
  //exports.getindexDim = function () { return indexDim };
  exports.getbarDim = function () { return barDim; };
  exports.getDateIdxDim = function () { return dateIdxDim; };
  exports.getZeroFilter = function () { return zeroFilterDim; }

  exports.getGroupByDay = function () { return groupByDay; };
  exports.getGroupByDayRange = function() { return groupByDayRange; };
  exports.getbarGroup = function () { return barGroup; };
  exports.getGroupByDateCount = function () { return groupByDateCount; };

  exports.getData = function() { return data; };
  exports.getRawData = function() { return raw_data; };
  exports.getDayOfYearData = function() { return doy; };
  exports.getObs = function() { return obs; };

  exports.getUnit = function() { return soundParmUnit; };
  exports.get0List = function() { return filter0Fields; };
  
  return exports;

};

