<?php
    $manager = new MongoDB\Driver\Manager("mongodb://root:example@mongodb_docker:27017");
    
    $filter = ['_id' => new MongoDB\BSON\ObjectID( '5c373f6d42d4da000872d423' )];
    $options = [];
    $query = new MongoDB\Driver\Query($filter, $options);
    $cursor = $manager->executeQuery('WWC.Map', $query);
    $map = (iterator_to_array($cursor));
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>WWC</title>
        <style type="text/css">
            body {
                display: block;
                margin: 0px;
                overflow: hidden;
                padding: 0px;
            }
        </style> 
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
		<script src="https://d3js.org/d3-path.v1.min.js"></script>
		<script src="https://d3js.org/d3-shape.v1.min.js"></script>
        <script type="text/javascript" src="http://code.jquery.com/jquery.min.js"></script>
        <script type="text/javascript" src="http://underscorejs.org/underscore-min.js"></script>
        <link href="css/Information_Window.css" rel="stylesheet" type="text/css"/>  
      
    </head>

    <body>
            <nav class="navbar navbar-dark bg-dark">
                    <a class="navbar-brand" href="index.html">
                        <img src="/docs/4.1/assets/brand/bootstrap-solid.svg" width="30" height="30" class="d-inline-block align-top" alt="">
                        WWC
                    </a>
                    <a class="text-white">
                        Benoît MANGEARD | Jixiong LIU | Hong YU
                    </a>
                </nav>
        
            <main role="main">
        
                <div class="row"> 
                    <div class="col-7 mt-2">
                        <div id="map"></div>
                    </div>
                    <div class="col-5 mt-2">
                        <div class="row" >
                            <div id="multichart"></div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 px-0 my-2">
                                <div class="card">
                                    <div class="card-header text-white bg-dark">
                                        Women vs Men
                                    </div>
                                </div>
                                <div id="ratio"></div>
                            </div>
                            <div class="col-md-6 px-2 my-2 pr-4 ">  
                                <div class="card">
                                    <div class="card-header text-white bg-dark">
                                        Local time
                                    </div>
                                </div>
                                <div id="clock"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        <div class="chartTooltip hidden" data-html="true">
            <p>
                <strong class="name" data-html="true"></strong>
            </p>
        </div>

              
        <svg>
            <radialGradient id="tip">
                <stop offset="0" stop-color="white" />
                <stop offset="0.2" stop-color="pink" />
                <stop offset="1" stop-color="white" />
            </radialGradient>
        </svg>



        <script type="text/javascript">

            var world_map = <?php echo json_encode($map); ?>;
            
       
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
            var data = JSON.parse(JSON.stringify(world_map)); 

                var features = _.filter(data[0].features, function (value, key) {
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
            // On load display world population
            window.onload = function() {
                populationChart("WLD");
                sexualRatio("WLD");
                clockChart("WLD");
            };

        
        </script>
        <script src="https://d3js.org/d3.v5.min.js"></script> 
		<script type="text/javascript" src="script/graphe.js"></script>
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
    </body>
    
</html>