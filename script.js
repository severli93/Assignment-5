console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html
var projection = d3.geo.mercator()
    .translate([width/2,height/2])
    .center([bostonLngLat[0],bostonLngLat[1]])
    .scale(100000/.5)

//TODO: create a geo path generator
var pathGenerator = d3.geo.path().projection(projection);

//TODO: create a color scale

var colorScale=d3.scale.linear().domain([0,300000]).range(['red','blue']);
//var colorScale = d3.scale.linear().domain([0,.2]).range(['white','blue']);

//TODO: create a d3.map() to store the value of median HH income per block group
var incomeById=d3.map()

//TODO: import data, parse, and draw
queue()
    .defer(d3.json,'data/bos_census_blk_group.geojson')
    .defer(d3.json,'data/bos_neighborhoods.geojson')
    .defer(d3.csv,'data/acs2013_median_hh_income.csv',parseData)
    .await(function(err,census,neighbors){
        draw(census,neighbors)

    })

function parseData(d){
    incomeById.set(
        d.geoid,
        {income:+d.B19013001, name:d.name}
    )
}

function draw(census,neighbors){

    var mapA = map.append('g')
        .selectAll('.map-census')
        .data(census.features)
        .enter()
        .append('g')
        .attr('class','map-census')

    mapA
        .append('path')
        .attr('d', pathGenerator)
        .style('fill',function(d){
            var income=(incomeById.get(d.properties.geoid)).income;
            console.log(income);
            return colorScale(income);})
        .call(getTooltips1)

   var mapB= map.append('g')
       .selectAll('.map-neighbors')
       .data(neighbors.features);
   var mapEnter=mapB.enter()
       .append('g')
       .attr('class','map-neighbors');
   var mapExit=mapB.exit()
       .transition()
       .remove()

   mapB
           .append('path')
           .attr('d', pathGenerator)
           .style('stroke','white')
           .style('fill','rgba(77,225,38,0)')
           .call(BlingBling1)

   mapB
            .append('text')
            .attr('class','text')
            .attr("text-anchor", "middle")
            .text(function(d){return d.properties.Name;})
            .attr('dx',function(d){return pathGenerator.centroid(d)[0]})
            .attr('dy',function(d){return pathGenerator.centroid(d)[1]})
            .style('fill','rgba(77,225,38,0)')
            .call(BlingBling2)
   mapB
            .call(getTooltips2)


}

function getTooltips1(selection){
    selection
        .on('mouseenter',function(d){

            var tooltip=d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity',1);

            var value=(incomeById.get(d.properties.geoid)).income
            //console.log("name is "+name)
            console.log("income is "+value)

            tooltip.select('#value').html(value);
            //tooltip.select('#name').html(name);

        })
        .on('mousemove',function(){
            var xy=d3.mouse(canvas.node());
            var tooltip=d3.select('.custom-tooltip');
            tooltip
                .style('left',xy[0]+50+'px')
                .style('top',(xy[1]+50)+'px')
            //.html('test');

        })
        .on('mouseleave',function(){
            var tooltip=d3.select('custom-tooltip')
                .transition()
                .style('opacity',0);
        }
    )
}
function getTooltips2(selection){
    selection
        .on('mouseenter',function(d){

            var tooltip=d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity',1);

            //var name=(incomeById.get(d.properties.geoid)).name
            var name = d.properties.Name
            console.log('name is ',name)
            //var value=(incomeById.get(d.properties.geoid)).income
            //console.log("income is "+value)

            //tooltip.select('#value').html(value);
            tooltip.select('#name').html(name);

        })
        .on('mousemove',function(){
            var xy=d3.mouse(canvas.node());
            var tooltip=d3.select('.custom-tooltip');
            tooltip
                .style('left',xy[0]+50+'px')
                .style('top',(xy[1]+50)+'px')
            //.html('test');

        })
        .on('mouseleave',function(){
            var tooltip=d3.select('custom-tooltip')
                .transition()
                .style('opacity',0);
        }
    )
}
 function BlingBling1(selection){
     console.log('bb1');
     selection
         .on('mouseenter',function(d){
             d3.select(this) //this --> selection
                 .style('fill','rgba(77,225,38,.2)')
         })
         .on('mouseleave',function(d){
             d3.select(this).style('fill','rgba(77,225,38,0)')

         })}
function BlingBling2(selection){

    selection
        .on('mouseenter',function(d){
            d3.select(this) //this --> selection
                .style('fill','rgba(77,225,38,1)')
        })
        .on('mouseleave',function(d){
            d3.select(this)//this --> selection
                .style('fill','rgba(77,225,38,0)')

        })}
