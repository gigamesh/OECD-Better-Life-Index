/*
TODO:
-resort countries according to value for each category
*/
//=============START ==============//
let toolTip, x, y, xAxis, yAxis, svg;
let currentYear = 2013;
let currentCategory = "IW_HADI"
let yearData = [];
let unit = "USD";
let colors = ["#85D1A7", "#F4D35E", "#EE964B", "#F95738", "#5895d0"];
const categories = [
  {name: 'IW_HADI', unit: 'USD'},
  {name: 'IW_HNFW', unit: 'USD'},
  {name: 'JE_LTUR', unit: 'Percentage'},
  {name: 'JE_PEARN', unit: 'USD'},
  {name: 'SC_SNTWS', unit: 'Percentage'},
  {name: 'ES_EDUA', unit: 'Percentage'},
  {name: 'ES_EDUEX', unit: 'Years'},
  {name: 'EQ_AIRP', unit: 'Mcg / m3'},
  {name: 'EQ_WATER', unit: 'Percentage'},
  {name: 'CG_VOTO', unit: 'Percentage'},
  {name: 'HS_LEB', unit: 'Years'},
  {name: 'HS_SFRH', unit: 'Percentage'},
  {name: 'SW_LIFS', unit: '(Avg Score)'},
  {name: 'PS_REPH', unit: 'Murders Per 100k'},
  {name: 'WL_TNOW', unit: 'Hours Per Year'}
]

const empty = [
{label: "Australia", value: 0},
{label: "Austria", value: 0},
{label: "Belgium", value: 0},
{label: "Brazil", value: 0},
{label: "Canada", value: 0},
{label: "Chile", value: 0},
{label: "Czech Republic", value: 0},
{label: "Denmark", value: 0},
{label: "Estonia", value: 0},
{label: "Finland", value: 0},
{label: "France", value: 0},
{label: "Germany", value: 0},
{label: "Greece", value: 0},
{label: "Hungary", value: 0},
{label: "Iceland", value: 0},
{label: "Ireland", value: 0},
{label: "Israel", value: 0},
{label: "Italy", value: 0},
{label: "Japan", value: 0},
{label: "Korea", value: 0},
{label: "Luxembourg", value: 0},
{label: "Mexico", value: 0},
{label: "Netherlands", value: 0},
{label: "New Zealand", value: 0},
{label: "Norway", value: 0},
{label: "Poland", value: 0},
{label: "Portugal", value: 0},
{label: "Russia", value: 0},
{label: "Slovenia", value: 0},
{label: "Spain", value: 0},
{label: "Sweden", value: 0},
{label: "Switzerland", value: 0},
{label: "Turkey", value: 0},
{label: "United Kingdom", value: 0},
{label: "United States", value: 0}
]

//============CATEGORY SELECTOR ===============/

$(".tab-innerwrap").slick({
  prevArrow: $('#button-left-big'),
  nextArrow: $('#button-right-big'),
  slidesToShow: 2,
  slidesToScroll: 2,
  infinite: false,
  mobileFirst:true,
  variableWidth: false,
  responsive: [
    {
      breakpoint: 500,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 2
      }
    },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 3
        }
    },
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 3
        }
    },
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 3
        }
    }
  ]
});

$(`#${currentCategory}`).parents().eq(2).addClass('is-active');

$('.tablinks').on('mouseover', function(){
  $(this).parents().eq(2).addClass('is-hover');
}).on('mouseout', function(){
  $(this).parents().eq(2).removeClass('is-hover');
});

$('.tablinks').on('click', (e)=>{
  $(`#${currentCategory}`).parents().eq(2).removeClass('is-active');

  $(e.target).parents().eq(2).addClass('is-active');
})

function toggleClass(tablink){
    var tablinks = document.querySelectorAll(".tablinks");

    for(var i =0; i < tablinks.length; i++){
        tablinks[i].classList.remove("active");
    }
    tablink.classList.add("active");
}

d3.selectAll(".tablinks").on("click", selectDataset);
function selectDataset(){
    currentCategory = this.id;
    let graphdata = getCategoryData(currentCategory);
    unit = categories.find(cat=> currentCategory == cat.name).unit;
    $('#unit').text(unit);
    updateGraph(graphdata)
}

//=================YEAR SELECTOR===================//

$("#button-left-small").click(function () {
  var activeValue = $(this).siblings(".amountHold").children("span.active");
  if(!activeValue.prev().hasClass("first")){
    if (!$(activeValue).hasClass("first")){
      $(activeValue).removeClass("active").addClass("next")
      .prev().addClass("active").removeClass("next, previous");
    }
    activeValue = $(this).siblings(".amountHold").children("span.active");
    year = activeValue.text();
    changeYear(year);
  }
});

$("#button-right-small").click(function () {
  var activeValue = $(this).siblings(".amountHold").children("span.active");
  if (!$(activeValue).hasClass("last"))
      $(activeValue).removeClass("active").addClass("previous")
  .next().addClass("active").removeClass("previous, next");
  activeValue = $(this).siblings(".amountHold").children("span.active");
  year = activeValue.text();
  changeYear(year);
});

function changeYear(year){
  currentYear = year
  getYearData(currentYear).then((graphdata)=>{ updateGraph(graphdata)})
}

//=================DATA GETTER===================//

function getYearData(year){
  let yearFile = `assets/data/BLI${year}.csv`;
  return d3.csv(yearFile).then(function(data) {
      currentYear = year;
      let formattedCSV = [];
      let catLength = categories.length;
      for(let catIdx = 0; catIdx < catLength; catIdx++){
        let row = {};
        let dataLength = data.length;
        for(let i = 0; i < dataLength; i++){
          if(data[i].INDICATOR === categories[catIdx].name && data[i].INEQUALITY === "TOT"){
            if(!row.Category){
            row.Category = categories[catIdx].name;
            }
            row[data[i].Country] = data[i].Value;
          } else if(row.Category){
            break;
          }
        }
        formattedCSV.push(row);
      };
      yearData = formattedCSV;
  }).then(()=>{
    return getCategoryData(currentCategory);
  })
}

function getCategoryData(category){
    let graphdata = [];
    let catObj = yearData.find(val=> {
      return val.Category === category;
    })

//clone object and remove uneeded data (the deleted countries aren't officially in the OECD)
    catObj =  _.clone(catObj);
    let remove = ['Category','Slovak Republic','Latvia', 'OECD - Total','South Africa'];
    for(let key in catObj){
        if(remove.includes(key)){
          delete catObj[key];
        }
    }
    for(let key in catObj){
      let row = {
        label: key,
        value: Number(catObj[key])
      }
      graphdata.push(row);
    }

    // sort alphabetically
    graphdata.sort(function(a, b) {
        return (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0;
    });

    // graphdata.sort(function(a, b) {
    //     return b.value - a.value;
    // });
    // console.log(graphdata);
    return graphdata;
};

//=================D3 SETUP===================//
function setupD3(){
  margin = {
    top: 0,
    right: (parseInt(d3.select('.svg').style('width'), 10)/15),
    bottom: $( window ).width() > 600 ? 50 : 40,
    left: $( window ).width() > 600 ? 120 : 95
    },
    width = parseInt(d3.select('.svg').style('width'), 10) - margin.left - margin.right,
    height = parseInt(d3.select('.svg').style('height'), 10) - margin.top - margin.bottom;
  toolTip = d3.select(".svg").append("div").attr("class", "toolTip");

  x = d3.scaleLinear()
          .range([0, width]);

  y =  d3.scaleBand()
          .rangeRound([0, height]);

  xAxis = d3.axisBottom(x); //unitFormat()
  yAxis = d3.axisLeft(y).ticks(0);

  svg = d3.select(".svg").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
}

//=================GRAPH BUILDER===================//

function updateGraph(dataset) {
  // console.log(dataset);

    let upperBound = d3.max(dataset, function(d) { return d.value; });
    let lowerBound = d3.min(dataset, function(d) { return d.value * .9 });
    x.domain([lowerBound, upperBound]);
    y.domain(dataset.map(function(d) { return d.label; }));
    let tickNum = $(window).width() > 600 ? 10 : 5;

    let currentTickFormat = function(){
      switch(unit){
        case "USD": return d => "$" + d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        case "Percentage": return d => d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "%";
        default: return d3.format(",.2f");
      }
    }

    let tickAngle = ()=>{
      if(unit !== "USD"){ return 'rotate(0)'};
        return 'rotate(-30)';
    }

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis.ticks(tickNum).tickFormat(currentTickFormat()))
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.4em")
                .attr("dy", ".3em")
                .attr("transform", ()=> tickAngle());

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
        .attr("x", function(d) { return x(d.value) })
        .attr("y", function(d) { return y(d.label) })
        .attr("height", y.bandwidth())
        .attr("width", function(d) { return width - x(d.value) })
        .attr("fill", function(d, i) {
            let color = i % colors.length;
            return colors[color];
        });


    bar
        .on("mousemove", function(d){
            toolTip.style("left", d3.mouse(this)[0]+60+"px");
            toolTip.style("top", d3.mouse(this)[1]+50+"px");
            toolTip.style("display", "flex");
            toolTip.html(()=>{
              let formatted = currentTickFormat()(d.value);
              let append = '';
              let info = $(`#${currentCategory} span`).text();
              if(unit !=='USD' && unit !== 'Percentage'){
                append = unit;
              }
              return `<h4><div><strong>${d.label} - </strong></div>
                <div>${formatted} ${append}</h4></div><p>${info}</p>`
            });
        });

    bar.on("mouseout", function(d){
            toolTip.style("display", "none");
        });
    // removed data:
    bar.exit().remove();
    // updated data:
    bar.transition()
        .duration(500)
        .attr("x", function(d) { return 0})
        .attr("width", function(d) { return  x(d.value); });
};

//===================INITIALIZE=================///

(()=> loadSVG())();
window.onresize = ()=>{
  $('.svg').empty();
  loadSVG();
}
async function loadSVG(){
  setupD3();
  let init = await getYearData(currentYear);
  updateGraph(empty);
  updateGraph(init);
}
