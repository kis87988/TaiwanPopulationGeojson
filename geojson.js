/* Ref:
https: //bl.ocks.org/shimizu/61e271a44f9fb832b272417c0bc853a5
https: //gist.github.com/VioletVivirand/56cc297a57b0b710263124701c153faf
https: //github.com/johnhckuo/Taiwan_RealTime_Disaster/blob/master/README.md
https: //population.mongabay.com/population/taiwan/

https: //bl.ocks.org/mbostock/5562380

https: //data.gov.tw/dataset/7442
https: //data.gov.tw/dataset/7440
https: //data.gov.tw/dataset/8410
*/

d3.select("body").append("H1")
                 .text("2017 Population Density of Taiwan")

var map = d3.select("body")
    .append("svg")
    .attr("width", 1500)
    .attr("height", 850);

var projection = d3
    .geoMercator()
    .scale(8000) 
    .rotate([-0.25, 0.25, 0])
    .center([121,24]);

var path = d3.geoPath().projection(projection);　
var tooltip = d3.select("body").append("div")
    .attr("class", "toolTip");


var color = d3.scaleThreshold()
    .domain([1, 50, 200, 500, 1000, 2000,4000,8000])
    .range(d3.schemeOrRd[9]);

var g = map.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

var x = d3.scaleSqrt()
    .domain([0, 8500])
    .rangeRound([440, 950]);

g.selectAll("rect")
    .data(color.range().map(function (d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function (d) {
        return x(d[0]);
    })
    .attr("width", function (d) {
        return x(d[1]) - x(d[0]);
    })
    .attr("fill", function (d) {
        return color(d[0]);
    });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population per square of km");

g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(color.domain()))
    .select(".domain")
    .remove();

d3.json("taiwangeo.json", function (geojson) {
    d3.csv("TownPopulation2017.csv", function (error, data) {
        if (error) throw error;
        
        var nested_data = d3.nest()
            .key(function (d) {
                return d.site_id.substring(0, 2);
            })
            .rollup(function (leaves) {
                return {
                    "people_total": d3.sum(leaves, function (d) {
                                        return parseInt(d.people_total);
                                    }),
                    "area": d3.sum(leaves, function (d) {
                                return parseInt(d.area);
                            }),
                       };
            })
            .object(data);
        
        map
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            var city = d.properties.NL_NAME_2.substring(0, 2);
            if (nested_data[city]==undefined)
                data = 0;
            else
            {
                data = d.population_density = nested_data[city].population_density = 
                       Math.round((nested_data[city].people_total / nested_data[city].area),5);
                d.people_total = nested_data[city].people_total;
                d.area = nested_data[city].area;
            }
            return color(data);
        })
        .attr("stroke", "#222")
        .on('mouseover', function (d) {
            tooltip
            .style("left", d3.event.pageX + 10+ "px")
            .style("top", d3.event.pageY + "px")
            .style("display", "inline-block")
            .html(
                  "Chinese: " + d.properties.NL_NAME_2 + "<br>" +
                  "English: " + d.properties.NAME_2 + "<br>" +
                  "People total: " +  Math.round(d.people_total/ 1e3) + " K<br>" +
                  "Area: " + d.area + " Square of km<br>" +
                  "Population density: " + d.population_density
                 );
        })
        .on('mouseout', function (d) {
            tooltip.style("display", "none");
        });
    });
});