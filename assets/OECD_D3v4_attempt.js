
// d3.csv("assets/data/OECDcleaned.csv").then(function(data) {
//   console.log(data);
// });

//=============START ==============//
let currentYear;
let yearData = [];
const categories = [
  'IW_HADI',
  'IW_HNFW',
  'JE_LTUR',
  'JE_PEARN',
  'SC_SNTWS',
  'ES_EDUA',
  'ES_EDUEX',
  'EQ_AIRP',
  'EQ_WATER',
  'CG_VOTO',
  'HS_LEB',
  'HS_SFRH',
  'SW_LIFS',
  'PS_REPH',
  'WL_TNOW'
]

function getdata(category, year){
  let graphdata = [];
  let yearFile = `assets/data/BLI${year}.csv`;
  d3.csv(yearFile).then(function(data) {
    if(currentYear != year){
      currentYear = year;
      let formattedCSV = [];
      let catLength = categories.length;
      for(let catIdx = 0; catIdx < catLength; catIdx++){
        let row = {};
        let dataLength = data.length;
        for(let i = 0; i < dataLength; i++){
          if(data[i].INDICATOR === categories[catIdx] && data[i].INEQUALITY === "TOT"){
            if(!row.Category){
            row.Category = categories[catIdx];
            }
            row[data[i].Country] = data[i].Value;
          } else if(row.Category){
            break;
          }
        }
        formattedCSV.push(row);
      };
      yearData = formattedCSV;
    }
    return yearData;
  }).then(d=>{
    let catObj = d.find(val=> {
      return val.Category === category;
    })

    for(let key in catObj){
      let row = {
        label: key,
        value: catObj[key]
      }
      graphdata.push(row);
    }
  });
  return graphdata;
}

// show user which tab is active
function toggleClass(tablink){
    var tablinks = document.querySelectorAll(".tablinks");

    for(var i =0; i < tablinks.length; i++){
        tablinks[i].classList.remove("active");
    }
    tablink.classList.add("active");
}

//hovering info box
var tooltip = document.querySelectorAll('.info');

document.addEventListener('mousemove', fn, false);
function fn(e) {
    for (var i=tooltip.length; i--;) {
        tooltip[i].style.left = e.pageX + 150 + 'px';
        tooltip[i].style.top = e.pageY + 'px';
    }
}


// D3 chart template from Juan Cruz-Benito -- http://bl.ocks.org/juan-cb/1afee8f2cae799e86707
// The MIT License (MIT) Copyright (c) 2015 Juan Cruz-Benito. http://juancb.es


//d3 elements

var color = ["#354E66", "#85D1A7", "#F4D35E", "#EE964B", "#F95738", "#354E66", "#85D1A7", "#F4D35E", "#EE964B", "#F95738", "#354E66", "#85D1A7", "#F4D35E", "#EE964B", "#F95738", "#354E66", "#85D1A7", "#F4D35E", "#EE964B", "#F95738", "#354E66", "#85D1A7", "#F4D35E", "#EE964B", "#F95738", "#354E66", "#85D1A7", "#F4D35E", "#EE964B", "#F95738", "#354E66", "#85D1A7", "#F4D35E", "#EE964B", "#F95738", "#354E66", "#85D1A7", "#F4D35E", "#EE964B", "#F95738"]

var margin = {top: (parseInt(d3.select('.svg').style('height'), 8)/10), right: (parseInt(d3.select('.svg').style('width'), 10)/20), bottom: (parseInt(d3.select('.svg').style('height'), 10)/7), left: (parseInt(d3.select('.svg').style('width'), 10)/20)},
        width = parseInt(d3.select('.svg').style('width'), 10) - margin.left - margin.right,
        height = parseInt(d3.select('.svg').style('height'), 10) - margin.top - margin.bottom;
var div = d3.select(".svg").append("div").attr("class", "toolTip");
var formatPercent = d3.format(".1f");

// var x = d3.scaleOrdinal()
//         .rangeRoundBands([0, width], .2, 0.5);
var x = d3.scaleBand()
        .rangeRound([0, width])
        .padding([.2, 0.5]);
var y = d3.scaleLinear()
        .range([height, 0]);

// var xAxis = d3.svg.axis()
//         .scale(x)
//         .orient("bottom");
// var yAxis = d3.svg.axis()
//         .scale(y)
//         .orient("left")
//         // .tickFormat(formatPercent)
//         .ticks(10, "r");
var xAxis = d3.axisBottom().ticks(0);
var yAxis = d3.axisLeft()
        // .tickFormat(formatPercent)
        .ticks(10, "r");

var svg = d3.select(".svg").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

d3.selectAll("a").on("click", selectDataset);
function selectDataset(){
    getdata(this.id);
    updateGraph(graphdata);
    graphdata = [];

}

//initialize graph
let init = getdata("IW_HADI", 2017);
updateGraph(init);

// d3 function
function updateGraph(dataset) {
  console.log(dataset);
    x.domain(dataset.map(function(d) { return d.label; }));
    y.domain([0, d3.max(dataset, function(d) { return d.value; })]);
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
                .selectAll("text")
                    .style("text-anchor", "end")
                    .style("font-size", "16px")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-45)"
                        });

    svg.select(".y.axis").remove();
    svg.select(".x.axis").remove();
    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");

    var bar = svg.selectAll(".bar")
            .data(dataset, function(d) { return d.label; });

    bar.enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.label); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .attr("width", x.rangeBand())
            .attr("fill", function(d, i) {
                return color[i];
            });


    bar
            .on("mousemove", function(d){
                div.style("left", d3.event.pageX-250+"px");
                div.style("top", d3.event.pageY+25+"px");
                div.style("display", "inline-block");
                div.html((d.label)+"<br>"+(d.value)+"");
            });
    bar
            .on("mouseout", function(d){
                div.style("display", "none");
            });
    // removed data:
    bar.exit().remove();
    // updated data:
    bar
            .transition()
            .duration(750)
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); });

};
