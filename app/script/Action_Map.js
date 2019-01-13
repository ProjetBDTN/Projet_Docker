var height = innerHeight;
var width = innerWidth*7/12;
var svg = d3.select('#map').append('svg');
var selected = [];

// removeId function
function removeId(array, item){
    for(var i in array){
        if(array[i]==item){
            array.splice(i,1);
            break;
        }
    }
}

d3.json(myData, function (data) {

    var features = _.filter(data.features, function (value, key) {
        return value.properties.name != 'Antarctica';
    });

    var projection = d3.geo.mercator();
    var oldScala = projection.scale();
    var oldTranslate = projection.translate();

    //two sizes of the map
    xy = projection.scale(oldScala * (width / oldTranslate[0] / 2) * 1)
        .translate([width / 2, height/ 2]);

    path = d3.geo.path().projection(xy);

    svg.attr('width', width).attr('height', height);
    svg.selectAll('path')
        .data(features)
        .enter()
        .append('svg:path')
        .attr('d', path)
        .attr('fill', 'rgba(128,124,139,0.61)')
        .attr('stroke', 'rgba(255,255,255,1)')
        .attr('stroke-width', 1);

    d3.selectAll("path:not(#selected)")
        .on('mouseover', function (data) {
            if (this.id != "selected") {
                d3.select(this).attr('fill', d3.hsl(240, 1, 0.6));
            }

            // knowing the position of the mouse from d3.event
            var transform = d3.event;
            var yPosition = transform.offsetY + 20;
            var xPosition = transform.offsetX + 20;

            // adjust the floating layer near the mouse(position)?
            var chartTooltip = d3
                .select(".chartTooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px");

            // Setting the concept of the floating layer
            chartTooltip.select(".name").text(data.properties.name + '  -----  ' + data.id);

            // Remove the hidden caractarisc
            chartTooltip.classed("hidden", false);


        })
        .on('mouseout', function (data) {
            if (this.id != "selected") {
                d3.select(this).attr('fill', 'rgba(128,124,139,0.61)');
            }
            // Hidding the float layer
            d3.select(".chartTooltip").classed("hidden", true);
        })
        .on('click', function (data) {
            if (this.id != "selected") {
                d3.select(this)
                    .attr('fill', d3.hsl(0, 1, 0.6))
                    .attr("id", "selected");
                    selected.push(data.id);
                    populationChart(selected);
                    sexualRatio(selected);
                    clockChart(selected);

            } else {
                d3.select(this)
                    .attr('fill', 'rgba(128,124,139,0.61)')
                    .attr("id", "unselected");
                    removeId(selected,data.id);
                    populationChart(selected);
                    sexualRatio(selected);
                    clockChart(selected);
            }
            console.log(selected);
        });
});
// On load display world population
window.onload = function() {
    populationChart("WLD");
    sexualRatio("WLD");
    clockChart("WLD");
};
