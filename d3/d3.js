var data = [];
var svg;
var min = -1.44;
var threshold = 9,
scale = 2000;
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
path = d3.geo.path().projection(projection).pointRadius(2),
degrees = 180 / Math.PI,
radius = projection([90, 0])[0] - projection([0, 0])[0];

var testFunc = function () {
	d3.csv("./out.csv", function (error, inData) {
		data = inData;
        getLocation();
		init();
	});
};

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        window.alert("We need the geolocation for accurate mapping")
    }
}
function showPosition(position) {
    console.log("Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude); 
}

function getTime() {
    
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
			return d.opacity;
		})
		.style("fill", function (d, i) {
			return d.color;
		})
		.attr("d", path)
		.on("click", function (d) {
			console.log(d.color);
			console.log(d.name);
            console.log(d.opacity);
		})

		.append("title")
		.text(function (d) {
            
            if(d.name === "N/A")
			return "";
            return d.name
		});
	return svg;

};

function getData() {
	var points = [];
	for (i = 0; i < data.length; i++) {
		if (data[i].mag < threshold)
			points.push({
				type : "Point",
				coordinates : [data[i].rarad * degrees, data[i].decrad * degrees],
				id : nextId(),
				color : data[i].ci,
				opacity : ((threshold + 1) - data[i].mag) / (threshold-min),
				name : data[i].proper

			});
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
