var map = d3.select("body")
    .append("svg")
    .attr("width", 1000)
    .attr("height", 1000);

var projection = d3
    .geoMercator()
    .scale(6000) 
    .rotate([-0.25, 0.25, 0])
    .center([121,24]);

var path = d3.geoPath().projection(projection);　


d3.json("taiwangeo.json", drawMaps);


function drawMaps(geojson) {
    map.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path) 
        .attr("fill", "black")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#222");
}