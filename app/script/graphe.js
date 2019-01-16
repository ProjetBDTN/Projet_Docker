// SVG constants
const widthChart = innerWidth*5/12 - 10;
const heightChart = innerHeight/2.3;
const margin = ({top: 50, right: 50, bottom: 50, left: 60});

// SVG 
let svgPopulation = d3.select('#multichart').append('svg');
svgPopulation.attr('width', widthChart)
    .attr('height', heightChart)
    .attr("fill", "#343A40");
var rectangle = svgPopulation.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", widthChart)
    .attr("height", heightChart)
    .attr("rx", 5)
    .attr("ry", 5);

let svgRatio = d3.select("#ratio").append("svg");
let svgClock = d3.select("#clock").append("svg");



// Multi-chart transition function
function transition(path) {
    path.transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash);
}
function tweenDash() {
    var l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function (t) { return i(t); };
}

//backup, function to get offsetGMT by latlng
function getGMT(lat,lng){
	var gmt = 0;			
	var requestTZ = new XMLHttpRequest();
	requestTZ.open('GET',`http://api.timezonedb.com/v2.1/get-time-zone?key=L4D4CWMHJLO4&format=json&by=position&lat=${lat}&lng=${lng}`,true);
	requestTZ.onload = function () {
		var resp = requestTZ.response;
		gmt = Number(resp.gmtOffset);
		//return gmt;
	};
	requestTZ.send();
	return gmt;
}
// Path function for url request
function selectedCountries(countries){
    let path = "";
    for(let i=0;i<countries.length;i++){
        if(i==(countries.length-1)){
            path = path + countries[i];
            return path;
        }else {
        path = path + countries[i]+";";
        }
    }
}

//Male-Female ratio chart display function
function sexualRatio(selected){
	
	// JSON result array
	var female_population = [];
	var request = new XMLHttpRequest();

	var path = selectedCountries(selected);
	
	if(!selected.length || selected == "WLD"){
		url = `http://api.worldbank.org/v2/countries/WLD/indicators/SP.POP.TOTL.FE.ZS?date=2017&format=json`;
		
	}else{
		var url = `http://api.worldbank.org/v2/countries/${path}/indicators/SP.POP.TOTL.FE.ZS?date=2017&format=json`;
	}
	request.open('GET', url, true);
	request.onload = function () {
		//Begin accessing JSON data here
		var requestArray = JSON.parse(this.response);
		requestArray[1].forEach(element => {
			female_population.push({country:`${element.country.id}`,year:`${element.date}`,value:`${element.value}`});
	  })
	  //console.log(female_population);

    var width=(innerWidth*5/12 - 20)/2;
	var margin = ({top: 30, right: 0, bottom: 10, left: 30});
	var height = female_population.length * 25 + margin.top + margin.bottom;


	//initialize the graphe
	svgRatio.selectAll("path").remove();
	svgRatio.selectAll("#male").remove();
	svgRatio.selectAll("#female").remove();
	svgRatio.selectAll("text").remove();
	svgRatio.selectAll("#yAxis").remove();


	var x = d3.scaleLinear()
		.domain([0, 100])
		.range([margin.left, width - margin.right]);

	var y = d3.scaleBand()
		.domain(female_population.map(d => d.country))
		.range([margin.top, height - margin.bottom])
		.padding(0.3);


	var yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y).tickSizeOuter(0));
		
		

	//male bar
	var bar=svgRatio.append("g")
		.selectAll("rect")
		.data(female_population)
		.enter();
	bar.append("rect")
		.attr("fill", "#384cff")
		.attr("height", y.bandwidth())
		.attr("x", d => x(0))
		.attr("y", d => y(d.country))
		.attr("width", 0)
		.transition()
		.duration(2000)
		.delay(function (d, i) {return i*100;})
		.attr("width", 200)
		.attr("id","male");

	
	//female chart  
	/*var barfemale=svgRatio.append("g")	  
		.selectAll("rect")
		.data(female_population)
		.enter();*/
	bar.append("rect")
		.attr("fill", "#ff2c29")
		.attr("height", y.bandwidth())
		.attr("x", x(0))
		.attr("y", d => y(d.country))
		.attr("width", 0)
		.transition()
		.duration(2000)
		.delay(function (d, i) {return i*100;})
		.attr("width", d => d.value*2) 
		.attr("id","female");

	//Y axis
	svgRatio.append("g")
			.attr("id","yAxis")
		  .call(yAxis);
		
	bar.append("text")
		.data(female_population)
		.attr("height", y.bandwidth())
		.attr("x", x(0))
		.attr("y", d => y(d.country)+10)
		.attr("dy", ".2em")
		.attr("fill","white")
		.text(function(d) { return parseFloat(d.value).toFixed(2); });

	svgRatio.node();
	};
	//Send request
	request.send();
	
}

// Population-chart display function
function populationChart(selected){
    let couleurs=couleursList(selected);
    // population array gets the request result
    var population = [];
    // Path function calling
    var path = selectedCountries(selected);
    // Get request from worldbank api 
    // This return countries selected and population for all years (1960-2018)
    // Display world if no data or when loading
    if(!selected.length || selected == "WLD"){
        var url = "http://api.worldbank.org/v2/countries/WLD/indicators/SP.POP.TOTL?per_page=2000&format=json";
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            // Transfer request response to population array
            var requestArray = JSON.parse(this.response);
            requestArray[1].forEach(element => {
                population.push({country: `${element.country.value}`,
                                year: parseInt(element.date),value: parseInt(element.value)
                                });
                                
            }) 
            // We need to tranform population to create path and get the position for labels (selected countries names)
            // points array for the path values
            var points = [];
            // lastValues array for the labels positions
            var lastValues = [];
            // Variables for data arrangment
            var allValues = [];
            var countriesName;
            let temp = 0;
            // Loop to get lastValues and points data
            for(let j=population.length-1; j>0; j--){    
                allValues.push({x: population[j].year,y: population[j].value});
                    countriesName = population[j].country;
                    temp = population[j].value;
            }
            lastValues.push(temp);
            points.push({country: countriesName,values : allValues});
            // Graph in d3js
            // Min and Max for each scales (y => people number, x => years)
            const xMin = d3.min(population, (population) => population.year);
            const xMax = d3.max(population, (population) => population.year);
            const yMin = d3.min(population, (population) => population.value);
            const yMax = d3.max(population, (population) => population.value);
            // We remove previous paths, labels and yaxis if new selected values
            svgPopulation.selectAll("path").remove();
            svgPopulation.selectAll("#labels").remove();
            svgPopulation.selectAll("#yaxis").remove();
            // Axis
                // xAxis
                var xScale = d3.scaleLinear()
                    .domain([xMin, xMax])
                    .range([margin.left, widthChart - 2*margin.right]);
                var xAxis = d3.axisBottom()
                        .scale(xScale)
                        .tickFormat(d3.format(""));
                svgPopulation.append("g")
                    .attr("transform",`translate(0,${heightChart - margin.bottom})`)
                    .call(xAxis)
                    .selectAll("text")
                        .attr("y", 10)
                        .attr("x", -35)
                        .attr("dy", ".35em")
                        .attr("transform", "rotate(310)")
                        .style("fill", "#F8F9FA")
                        .style("text-anchor", "start");
                // yAxis
                var formatNumber = d3.format("");
                function customYAxis(g) {
                    g.call(yAxis);
                    g.select(".domain").remove();
                    g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,5");
                    g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
                }
                var yScale = d3.scaleLinear()
                    .domain([yMin, yMax])
                    .range([heightChart-margin.bottom, margin.top/2]);
                var yAxis = d3.axisRight(yScale)
                    .tickSize(widthChart-2*margin.right)
                    .tickFormat(function(d) {
                        var s = formatNumber(d / 1e6);
                        return this.parentNode.nextSibling
                        ? "\xa0" + s
                        : s + " Million Of People";
                    });
                svgPopulation.append("g")
                    .attr("transform", `translate(${margin.left/2},0)`)
                    .attr("id", "yaxis")
                    .call(customYAxis)
                    .selectAll("text")
                        .style("fill", "#F8F9FA"); 
                            
                // Lines scales function
                var lineFunction = d3.line()
                    .x(function(d) { return xScale(d.x); })
                    .y(function(d) { return yScale(d.y); })
                    .curve(d3.curveLinear); 
                // Lines display loop
                for(let i=0; i<points.length; i++){
                    lines = svgPopulation.append("g")
                        .attr("transform", "translate(0,0)");
                    lines.selectAll("path")
                        .data([points[i].values])
                        .enter()
                        .append("path")
                        .attr("d",lineFunction)
                        .attr("fill", "none")
                        .attr("stroke", couleurs[i])
                        .attr("stroke-width","3")
                        .call(transition);
                    svgPopulation.append("text")
                        .attr("transform", "translate(" + 0 + "," + 0 + ")")
                        .attr("dy", ".35em")
                        .style("font-weight", "bold")
                        .attr("text-anchor", "start")
                        .attr("id", "labels")
                        .transition()
                        .duration(2000)
                        .ease(d3.easeCubic)
                        .attr("transform", "translate(" + (widthChart-2*margin.right) + "," + yScale(lastValues[i]) + ")")
                        .style("fill", couleurs[i])
                        .style("font-size", "12px")
                        .text(points[i].country);                
                }
        };
        //Send request
        request.send();
    }else{
        var url = "http://api.worldbank.org/v2/countries/"+path+"/indicators/SP.POP.TOTL?per_page=2000&format=json";
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            // Transfer request response to population array
            var requestArray = JSON.parse(this.response);
            requestArray[1].forEach(element => {
                population.push({countryCode:`${element.countryiso3code}`, country: `${element.country.value}`,
                                year: parseInt(element.date),value: parseInt(element.value)
                                });
            }) 
            // We need to tranform population to create path and get the position for labels (selected countries names)
            // points array for the path values
            var points = [];
            // lastValues array for the labels positions
            var lastValues = [];
            // Variables for data arrangment
            var allValues = [];
            var countriesName;
            let temp = 0;
            // Loop to get lastValues and points data
            for(let i=0; i<selected.length; i++){
                allValues = [];
                temp = 0;
                for(let j=population.length-1; j>0; j--){    
                    if(population[j].countryCode == selected[i]){
                        allValues.push({x: population[j].year,y: population[j].value});
                        countriesName = population[j].country;
                        temp = population[j].value;
                    }
                }
                lastValues.push(temp);
                points.push({country: countriesName,values : allValues});
            }
    
            // Graph in d3js
            // Min and Max for each scales (y => people number, x => years)
            const xMin = d3.min(population, (population) => population.year);
            const xMax = d3.max(population, (population) => population.year);
            const yMin = d3.min(population, (population) => population.value);
            const yMax = d3.max(population, (population) => population.value);
            // We remove previous paths, labels and yaxis if new selected values
            svgPopulation.selectAll("path").remove();
            svgPopulation.selectAll("#labels").remove();
            svgPopulation.selectAll("#yaxis").remove();
            // Axis
                // xAxis
                var xScale = d3.scaleLinear()
                    .domain([xMin, xMax])
                    .range([margin.left, widthChart - 2*margin.right]);
                var xAxis = d3.axisBottom()
                        .scale(xScale)
                        .tickFormat(d3.format(""));
                svgPopulation.append("g")
                    .attr("transform",`translate(0,${heightChart - margin.bottom})`)
                    .call(xAxis)
                    .selectAll("text")
                        .attr("y", 10)
                        .attr("x", -35)
                        .attr("dy", ".35em")
                        .attr("transform", "rotate(310)")
                        .style("fill", "#F8F9FA")
                        .style("text-anchor", "start");
                // yAxis
                var formatNumber = d3.format("");
                function customYAxis(g) {
                    g.call(yAxis);
                    g.select(".domain").remove();
                    g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,5");
                    g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
                }
                var yScale = d3.scaleLinear()
                    .domain([yMin, yMax])
                    .range([heightChart-margin.bottom, margin.top/2]);
                var yAxis = d3.axisRight(yScale)
                    .tickSize(widthChart-2*margin.right)
                    .tickFormat(function(d) {
                        var s = formatNumber(d / 1e6);
                        return this.parentNode.nextSibling
                        ? "\xa0" + s
                        : s + " Million Of People";
                    });
                svgPopulation.append("g")
                    .attr("transform", `translate(${margin.left/2},0)`)
                    .attr("id", "yaxis")
                    .call(customYAxis)
                    .selectAll("text")
                        .style("fill", "#F8F9FA"); 
                            
                // Lines scales function
                var lineFunction = d3.line()
                    .x(function(d) { return xScale(d.x); })
                    .y(function(d) { return yScale(d.y); })
                    .curve(d3.curveLinear); 
                // Lines display loop
                for(let i=0; i<points.length; i++){
                    lines = svgPopulation.append("g")
                        .attr("transform", "translate(0,0)");
                    lines.selectAll("path")
                        .data([points[i].values])
                        .enter()
                        .append("path")
                        .attr("d",lineFunction)
                        .attr("fill", "none")
                        .attr("stroke", couleurs[i])
                        .attr("stroke-width","3")
                        .call(transition);
                    svgPopulation.append("text")
                        .attr("transform", "translate(" + 0 + "," + 0 + ")")
                        .attr("dy", ".35em")
                        .style("font-weight", "bold")
                        .attr("text-anchor", "start")
                        .attr("id", "labels")
                        .transition()
                        .duration(2000)
                        .ease(d3.easeCubic)
                        .attr("transform", "translate(" + (widthChart-2*margin.right) + "," + yScale(lastValues[i]) + ")")
                        .style("fill", couleurs[i])
                        .style("font-size", "12px")
                        .text(points[i].country);                
                }
        };
        //Send request
        request.send();
    }
}

function svgClockChart(selected,timezones){
    var width_clock = innerWidth/6,
	height_clock = innerHeight/4 - 5,
	radius = Math.min(width_clock, height_clock) /1.5,
	spacing = .08;

	svgClock.selectAll("g").remove();
	var	formatHour = d3.time.format("%-H hours");

	var couleur=couleursList(selected);
	var color = d3.scaleLinear()
		.range(["hsl(0,50%,60%)", "hsl(360,50%,60%)"])
		.interpolate(function(a, b) { var i = d3.interpolateString(a, b); return function(t) { return d3.hsl(i(t)); }; });

	var arcBody = d3.arc()
		.startAngle(0)
		.endAngle(function(d) { return d.value * 2 * Math.PI; })
		.innerRadius(function(d) { return d.index * radius; })
		.outerRadius(function(d) { return (d.index + spacing) * radius; })
		.cornerRadius(6);

	var arcCenter = d3.arc()
		.startAngle(0)
		.endAngle(function(d) { return d.value * 2 * Math.PI; })
		.innerRadius(function(d) { return (d.index + spacing / 2) * radius; })
		.outerRadius(function(d) { return (d.index + spacing / 2) * radius; });

	svgClock.attr("width", width_clock)
		.attr("height", height_clock)
	  .append("g");

	//translate(right, down)
	var field = svgClock.selectAll("g")
	.data(fields(timezones,timezones.length,selected))
	.enter().append("g")
	.attr("transform", "translate(" + width_clock/1.8 + "," + height_clock/1.8+ ") scale(0.7)")
	.attr("id","field");
	//console.log(fields(timezones,timezones.length));


	field.append("path")
		.attr("class", "arc-body");

	field.append("path")
		.attr("id", function(d, i) { return "arc-center-" + i; })
		.attr("class", "arc-center");

	field.append("text")
		.attr("dy", ".30em")
		.attr("dx", ".30em")
		.style("text-anchor", "start")
	  .append("textPath")
		.attr("startOffset", "25%")
		.attr("side","right")
		.attr("class", "arc-text")
		.attr("xlink:href", function(d, i) { return "#arc-center-" + i; });

	tick();

	d3.select(self.frameElement).style("height", height_clock + "px");

	function tick() {
		  if (!document.hidden) field
			  .each(function(d) { this._value = d.value; })
			  .data(fields(timezones,timezones.length,selected))
			  .each(function(d) { d.previousValue = this._value; })
			.transition()
			.duration(20000)
			.delay(function (d, i) {return i*100;})
			  .each(fieldTransition);

	  setTimeout(tick, 1000 - Date.now() % 1000);
	}

	function fieldTransition() {
	  var field = d3.select(this).transition();

	  field.select(".arc-body")
		  .attrTween("d", arcTween(arcBody))
		  //.style("fill",function(d,i){return couleur[]});
		  .style("fill", function(d) { return color(d.value); });

	  field.select(".arc-center")
		  .attrTween("d", arcTween(arcCenter));

	  field.select(".arc-text")
		  .text(function(d) { return d.text; });
	}

	function arcTween(arc) {
	  return function(d) {
		var i = d3.interpolateNumber(d.previousValue, d.value);
		return function(t) {
		  d.value = i(t);
		  return arc(d);
		};
	  };
	}
	
	function NewTime(timezone)
	{
		var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
		var nowDate = new Date().getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
		var targetDate = new Date(nowDate + offset_GMT * 60 * 1000 + timezone*60*60 * 1000);
		return targetDate;

	}
	
	function fields(timezones,len,selected) {
		if(!selected.length || selected == "WLD"){
			var now = new Date;
			return [{},
				{index: .2, text: "now",   value: now.getHours()/ 24}
			  ];
		}
		else{
		  var list = [{}];
		  var i;
			//console.log(timezones[0]);
		  for (i=0; i<len; i++){
			  var local = {};
			  if (timezones[i].country =='FR'){
				  var now = new Date;
			  	  local = {index: (i+4)/10, text:timezones[i].country, value: now.getHours()/ 24};
			  }
			  else{
				  local = {index: (i+4)/10, text:timezones[i].country, value: NewTime(timezones[i].timezone).getHours()/24};
			  }
			  list.push(local);
		  }
		  return list;
		}
	}
}

//Local Time Chart display function
function clockChart(selected){
	// JSON result array
	var timezones = [];
	var len = 0;
	var requestClock = new XMLHttpRequest();
	var path = selectedCountries(selected);
	if(!selected.length || selected == "WLD"){
		svgClockChart(selected,timezones);
		
	}else{
		requestClock.open('GET', `https://restcountries.eu/rest/v2/alpha?codes=${path}&fields=alpha2Code;capital;timezones;latlng`,true);
		requestClock.onload = function () {
			//Begin accessing JSON data here
			var requestArray = JSON.parse(this.response);
			requestArray.forEach(element => {
				var tz=element.timezones[0];
				var gmt = Number(tz.slice(3,6));
				var lat = element.latlng[0];
				var lng = element.latlng[1];
				timezones.push({country:`${element.alpha2Code}`,capital:`${element.capital}`,timezone:`${gmt}`,lat:`${lat}`,lng:`${lng}`});
			})

			svgClockChart(selected,timezones);

		};
		requestClock.send();
	}
}

function couleursList(selected){
	let couleurs = [];
    if(!selected.length){
        couleurs.push(d3.hsl(0.5, 0.5, 0.6));
    }else{
        // Colors choice
        let nbData = selected.length;
        let delta = 360/nbData;
        for(let i=0;i<nbData;i++){
            couleurs.push(d3.hsl(delta*i, 0.5, 0.6));
        }
    }
	return couleurs;
}
