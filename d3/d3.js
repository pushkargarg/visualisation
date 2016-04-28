var data = [];
var svg;
var min = -1.44;
var threshold = 6,
scale = 1000;
var spectrals = {"O":"#9BB0FF","B":"#AABFFF","A":"#CAD8FF","F":"#FBF8FF","G":"#FFF4E8","K":"#FFDDB4","M":"#FFBD6F"};
var lat,longtd;
var time,date;
var id = 0,
width = window.innerWidth,
height = window.innerHeight,
graticule = d3.geo.graticule(),
rotate = {
	x : 0,
	y : 90
},
projection = d3.geo.orthographic()
	.scale(scale)
	.translate([width / 2, height / 2])
	.clipAngle(90)
	.rotate([rotate.x / 2, -rotate.y / 2]),
path = d3.geo.path().projection(projection).pointRadius(function (d, i) {
            return 3.0*((10 - d.brightness) / (10-min));
		}),
degrees = 180 / Math.PI,
radius = projection([90, 0])[0] - projection([0, 0])[0];

var testFunc = function () {
	d3.csv("./out.csv", function (error, inData) {
		data = inData;
		getTime();
        getLocation();
		
	});
};

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        lat = 0;
        longtd = 0;
        init();
        window.alert("We need the geolocation for accurate mapping");
    }
}
function showPosition(position) {
    console.log("Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude); 
    lat = position.coords.latitude;
	lat = lat/degrees;
    longtd = position.coords.longitude;
    init();
}

function getTime() {
    time = new Date();
    //console.log(time);
}

function init() {
	svg = createSVG();
}

function createSVG() {
	var div = d3.selectAll(".sphere")
		.data([getData()]);

	var svg = div.insert("svg", ":first-child")
		.attr("width", width)
		.attr("height", height);

	svg.append("circle")
	.datum(rotate)
	.attr("class", "mouse")
	.attr("transform", "translate(" + [width / 2, height / 2] + ")")
	.attr("r", radius)
	.style("fill", "#001848")
	.call(d3.behavior.drag()
		.origin(Object)
		.on("drag", function (d) {
			projection.rotate([(d.x = d3.event.x) / 2,  - (d.y = d3.event.y) / 2]);
			svg.selectAll("path").attr("d", path);
		}));
	svg.append("path")
	.attr("class", "graticule")
	.style("stroke", "gray")
	.style("opacity", "0.3")
	.datum(graticule)
	.attr("d", path);

	var point = svg.append("g")
		.selectAll("path.point")
		.data(function (random) {
			return random();
		}, pointId)
		.enter().append("path")
		.attr("class", "point")
		.style("opacity", function (d, i) {
			return Math.sqrt(d.opacity);
		})
		.style("fill", function (d, i) {
			return d.color;
		})
		.attr("d", path)
		.on("click", function (d) {
			console.log(d.color);
			console.log(d.name);
            console.log(d.opacity);
            console.log(d.spectral);
		})

		.append("title")
		.text(function (d) {
            
            if(d.name === "N/A")
			return "";
            return d.name
		});
	return svg;

};

function getPlotPoints(ra,dec){
	// ra = 16.695;
	// dec = 36.466667;
	// lat = 52.5;
	// longtd = -1.9166667;

	ra = ra*15;
				
	days_to_beginning_of_month_nonleap = [0,31,59,90,120,151,181,212,243,273,304,334];

	days_to_beginning_of_month_leap = [0,31,60,91,121,152,182,213,244,274,305,335];

	days_since_j2000 = {"1998": -731.5, "1999": -366.6, "2000": -1.5, "2001": 364.5, "2002": 729.5, "2003": 1094.5, "2004": 1459.5, "2005": 1825.5, "2006": 2190.5, "2007": 2555.5, "2008": 2920.5, "2009": 3286.5, "2010": 3651.5, "2011": 4016.5, "2012": 4381.5, "2013": 4747.5, "2014": 5112.5, "2015": 5477.5, "2016": 5842.5, "2017": 6208.5, "2018": 6573.5, "2019": 6938.5, "2020": 7303.5, "2021":7669.5};

	//
	//console.log(lat,longtd);
	//time = 2310;
	//hours = Math.floor(time/100);
	hours = time.getUTCHours();
	//mins = time%100;
	mins = time.getUTCMinutes();
	mins = mins/60;
	//console.log(hours,mins);
	dec_frac = (hours+mins)/24;

	// date = "10 Aug 1998";
	// arr = date.split(" ");
	// year = arr[2];
	// month = arr[1];
	// day = arr[0];
	year = time.getUTCFullYear();
	month = time.getUTCMonth();
	day = time.getUTCDate();
	//console.log(year,month,day);
	days_to_beginning_year = days_since_j2000[year];
	if (year%4!=0){
		days_to_beginning_month = days_to_beginning_of_month_nonleap[month];
	}
	if (year%4==0){
		days_to_beginning_month = days_to_beginning_of_month_leap[month]
	}

	d = dec_frac + days_to_beginning_month + parseInt(day) + days_to_beginning_year
	lst = 100.46 + 0.985647*d + longtd + 15*(hours+mins)
	if (lst < 0){
		lst = 360 + lst ;
	}
    lst = lst%360;
	//console.log(lst + " ra: " + ra + " dec: " + dec + " long" + longtd + " lat " + lat);
	ha = lst - ra;
	function toRadians (angle) {
		return angle/180*Math.PI;
	}
	function toDegrees (angle) {
		return angle*180/Math.PI;
	}
	dec = toRadians(dec);
	ha = toRadians(ha);
	sinalt = (Math.sin(dec)*Math.sin(lat))+(Math.cos(dec)*Math.cos(lat)*Math.cos(ha));
	alt = Math.asin(sinalt);
	cosA = (Math.sin(dec) - Math.sin(alt)*Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat));
	a = Math.acos(cosA);
	a = toDegrees(a);
	alt = toDegrees(alt);

	if (Math.sin(ha) < 0){
		az = a;
	}
	if (Math.sin(ha) >= 0){
		az = 360 - a;
	}
	//console.log(az,alt);
	return [az,alt];
}

function getData() {
	var points = [];
	for (i = 0; i < data.length; i++) {
		if (data[i].mag < threshold){
			points.push({
				type : "Point",
				coordinates : getPlotPoints(data[i].ra,data[i].dec),
				id : nextId(),
                color : spectrals[data[i].spect[0]],
				//color : data[i].ci,
				opacity : ((threshold + 1) - data[i].mag) / (threshold-min),
                brightness :data[i].mag,
				name : data[i].proper,
                spectral : data[i].spect[0]
			});
			//console.log(getPlotPoints(data[i].ra,data[i].dec),data[i].proper);
		}
	}
	return function () {
		return points;
	};
}

function pointId(d) {
	return d.id;
}
function nextId() {
	return id = ~~(id + 1);
} // Just in case we overflow…
