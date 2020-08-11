// Script to create 2d hex chart

var hexParm = {}

//hexParm.station = 'oun'
//hexParm.parms = ['pw','shear06']

//hexParm.files = [`./datafiles/${hexParm.station}/${hexParm.station}-${hexParm.parms[0]}-filtered.csv`,
//    `./datafiles/${hexParm.station}/${hexParm.station}-${hexParm.parms[1]}-filtered.csv`]

class hexChart {

    constructor() {
        //this.width = d3.select('#chart-container svg').node().getBoundingClientRect().width;
        //this.height = d3.select('#chart-container svg').node().getBoundingClientRect().height;

        /* Need to change the .99 multiplication */
        this.width = $('#chart-container').width()*.99;
        this.height = $(document).height()*0.6;
        this.margin = ({top: 20, right: 30, bottom: 20, left: 40})

        
        
        //this.contours = d3.contourDensity()
    }

    updateParms() {
        hexParm.station = $('#stn').val().toLowerCase();
        hexParm.parms = [$('#chrtXparam').val().toLowerCase(),$('#chrtYparam').val().toLowerCase()];
        //hexParm.parms[1] = $('#chrtYparam').val().toLowerCase();

        hexParm.files = [`./datafiles/${hexParm.station}/${hexParm.station}-${hexParm.parms[0]}-filtered.csv`,
    `./datafiles/${hexParm.station}/${hexParm.station}-${hexParm.parms[1]}-filtered.csv`]
    }

    prepData() {

        return new Promise((resolve,reject) => {
            Promise.all([d3.csv(hexParm.files[0]),d3.csv(hexParm.files[1])])
                .then(files => {
                    let data1 = files[0], data2 = files[1];

                    data1 = data1.filter(d => +d.val > -9998)
                    data2 = data2.filter(d => +d.val > -9998)

                    let dataMap = {};
                    let oldDate = 0;
                    data1.forEach(entry => { 
                        if (entry.date == oldDate) {
                            
                        }
                        dataMap[entry.date] = +entry.val 
                    });
                    data2.forEach(entry => { 
                        entry.val = +entry.val;
                        entry.val1 = dataMap[entry.date]; 
                    } );

                    this.data = data2;

                    resolve();

                });

            });
    };

    updateFunctions() {

        this.x = d3.scaleLinear()
        this.y = d3.scaleLinear()

        this.x
            .domain(d3.extent(this.data, d => d.val1)).nice()
            .rangeRound([this.margin.left, this.width - this.margin.right])

        this.y
            .domain(d3.extent(this.data, d => d.val)).nice()
            .rangeRound([this.height - this.margin.bottom, this.margin.top])

        /*this.contours
            .x(d => this.x(d.val1))
            .y(d => this.y(d.val))
            .size([this.width, this.height])
            .bandwidth(30)
            .thresholds(30) */

        this.xAxis = g => g.append("g")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.x).tickSizeOuter(0))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("y", -5)
                .attr("dy", null)
                .attr("font-weight", "bold")
                .attr("text-anchor", "end")
                .text($('#chrtXparam option:selected').text()))

        this.yAxis = g => g.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.y).tickSizeOuter(0))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text($('#chrtYparam option:selected').text()))

        this.hexbins = d3.hexbin()
                    .x(d => this.x(d.val1))
                    .y(d => this.y(d.val))
                    .radius(8)
                    .extent([[this.margin.left, this.margin.top], 
                        [this.width - this.margin.right, this.height - this.margin.bottom]])

        this.bins = this.hexbins(this.data)

        return this;

    }

    makePlot() {

        let color = d3.scaleSequential(d3.interpolateBuPu)
                        .domain([0, d3.max(this.bins, d => d.length) / 1.25])

        let svg = d3.select('#chart-container')
                    .append('svg')
                    .attr("width", this.width)
                    .attr("height", this.height)
                    //.attr("viewBox", [0, 0, this.width, this.height]);

        svg.append("g")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.1)
            .selectAll("path")
            .data(this.bins)
            .join("path")
            .attr('id', d => {
                let x = d.x.toFixed(0);
                let y = d.y.toFixed(0);
                let XYid = `id_${x}_${y}`;

                return XYid;
            })
            .attr("d", this.hexbins.hexagon())
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("fill", d => color(d.length))
            .classed('hexBin',true)
            .on('click', (d) => {

                let centerX = this.x.invert(d.x).toFixed(2);
                let centerY = this.y.invert(d.y).toFixed(2);

                d3.select('#hexDat')
                    .text(`${d.length} obs of ${this.data.length} total
                        (${(100*d.length/this.data.length).toFixed(2)}%), 
                        centered on x: ${centerX}, y: ${centerY}`);

                //d3.select(`path:nth-child(${i})`).classed('selBin',true)
                // formatting
                d3.selectAll('.selBin').classed('selBin',false)

                let x = d.x.toFixed(0);
                let y = d.y.toFixed(0);
                d3.select(`#id_${x}_${y}`).classed('selBin',true)


            });

        /*let svg = d3.select('#chart-container')
                    .append('svg')
                    .attr("width", this.width)
                    .attr("height", this.height);

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .selectAll("path")
            .data(this.contours(this.data))
            .enter().append("path")
            .attr("stroke-width", (d, i) => i % 5 ? 0.25 : 1)
            .attr("d", d3.geoPath());*/

        svg.append("g")
            .call(this.xAxis);

        svg.append("g")
            .call(this.yAxis);

    }

    /*
    x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x)).nice()
            .rangeRound([margin.left, width - margin.right])

    contour = d3.contourDensity()
                .x(d => x(d.x))
                .y(d => y(d.y))
                .size([this.width, this.height])
                .bandwidth(30)
                .thresholds(30)*/
}
