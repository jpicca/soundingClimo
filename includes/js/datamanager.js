// Data Manager object
var d3Edge = {};
d3Edge.dataManager = function module() {

  var exports = {}, data, raw_data,
      qdata = [], fdata, filtered = false,
      doy, station, soundTime, soundParm, soundParmUnit, fileName,
      ymin, ymax, period, smoothPeriod, smoother, obs,
      filter0s = false;

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
      
      // Read csv file and organize columns
      d3.csv(_file).then(csv_data => {
        csv_data.forEach((d,i) => {
          d.index = i;
          d.date = parseDate(d.date);
          d.val = +d.val;
          d.type = 'raw'
        });

        raw_data = csv_data;

        console.log(raw_data)

        // Adding the csv data to the crossfilter (not sure if this is 
        // needed right now)
        fdata.add(csv_data);
      
        // Get day of year (numbered 1-365(6)) and use it as dimension in filter
        doy = fdata.dimension(function(d) { return dateToDay(d.date); }); 

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

  exports.createDefaultQuantiles = function() {
    var loopParms, tvals;
    qdata.p00 = []; qdata.p01 = []; qdata.p10 = [];
    qdata.p25 = []; qdata.p50 = []; qdata.p75 = [];
    qdata.p90 = []; qdata.p99 = []; qdata.p100 = [];
    qdata.mean = []; qdata.date = []; qdata.index = [];
    loopParms = exports.getSoundingLoopParms(soundTime);
    for (i = loopParms[0]; i < 367; i+=loopParms[1]) {
      tvals = [];
      tdoy = doy.filter(i);
      _tvals = tdoy.top(Infinity);
      _tvals.forEach(function(p, j) { if (p.val >  -999.) {tvals.push(p.val); }; });
      if (filter0s && $.inArray(soundParm, filter0Fields) > -1) { tvals = tvals.filter(function(p) { return p > 0; })};
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
    };
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

    console.log(data)
    // Add quantile data to the crossfilter
    fdata.add(data)
    
  };

  exports.getData = function() { return data; };
  exports.getRawData = function() { return raw_data; };
  exports.getDayOfYearData = function() { return doy; };
  exports.getObs = function() { return obs; };
  
  return exports;

};

