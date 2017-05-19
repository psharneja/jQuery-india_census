$(function() {
    let $age_wise = $('#first-graph-table tbody');
    let $_age = $('#age-group');
    let $_all = $('#all-in-age-group');
    let $_males = $('#males-in-age-group');
    let $_females = $('#females-in-age-group');
    let $add_button = $('#add-row-button');
    
    let first_Graph_Template = $('#first-graph-template').html();
    
    function append_first_graph(newData){
        $age_wise.append(Mustache.render(first_Graph_Template, newData));
    }
    
   $.ajax({
       type: 'GET',
       url: '/age_wise_data',
       dataType: "json",
       success: function(data){
           $.each(data, function(i, age_det){
               append_first_graph(age_det);
               //$age_wise.append(Mustache.render(first_Graph_Template, age_det));
                });
               secondGraph();

       }
   }); 
    
    
    $('#add-row-button').on('click', function(){
        
        if( $_age.val() == "" || $_all.val() == "" || $_males.val() =="" ||$_females.val() == ""){
            alert("some missing values here!");
        }    
        else{
            var age_details = {
            _age: $_age.val(),
            _all: $_all.val(),
            _males: $_males.val(),
            _females: $_females.val()
                };
        
        $.ajax({
            type: 'POST',
            url: '/age_wise_data',
            data: age_details,
            dataType: "json",
            success: function(newData){
                append_first_graph(newData);
                $('svg').remove();
                secondGraph();
                },
            error: function(){
                alert('values already exists, please edit instead');
            }
           
            });
        }
    });
    
    $age_wise.delegate('.btn-danger','click', function(){
        let $tr = $(this).closest('tr');
        $.ajax({
        type:'DELETE',
        url: '/age_wise_data/' + $(this).attr('data-id'),
            success: function(){
                $tr.fadeOut(300, function(){
                    $(this).remove();
                    $('svg').remove();
                    secondGraph();
                })
            }
        });
        
    })
    
    $age_wise.delegate('.editdetails', 'click', function(){
    let $tr = $(this).closest('tr');   
        $tr.find('input._age').val( $tr.find('span._age').html());
        $tr.find('input._all').val( $tr.find('span._all').html());
        $tr.find('input._males').val( $tr.find('span._males').html());
        $tr.find('input._females').val( $tr.find('span._females').html());
        $tr.addClass('edit');
    })
    
    $age_wise.delegate('.canceldetails', 'click', function(){
        $(this).closest('tr').removeClass('edit');
    });

    $age_wise.delegate('.savedetails', 'click', function(){
            let $tr = $(this).closest('tr');
            var age_details = {
                _age: $tr.find('span._age').html(),
                _all: $tr.find('input._all').val(),
                _males: $tr.find('input._males').val(),
                _females: $tr.find('input._females').val()
            };
        $.ajax({
            type:'PUT',
            url: '/age_wise_data/' + $tr.attr('data-id'),
            data: age_details,
            success: function(newDetails){
                $tr.find('span._all').html(newDetails._all);
                $tr.find('span._males').html(newDetails._males);
                $tr.find('span._females').html(newDetails._females);
                $tr.removeClass('edit');
                $('svg').remove();
                secondGraph();
            },
               error: function(){
                alert: ('error saving data!');
            }
        });

    }); 
    
/////////////graph js/////
    function secondGraph(){
    var margin = { top: 20, right: 20, bottom: 200, left: 40},
    width = 1000 - margin.right - margin.left, 
    height = 700 - margin.top - margin.bottom;


var svg = d3.select('#second-graph')
        .append('svg')
        .attr({
            "width" : width + margin.right + margin.left + 100,
            "height" : height + margin.top + margin.bottom
        })
        .append("g")
        .attr("transform", "translate(" + (margin.left + 50) + ',' + margin.right + ')');


var xScale = d3.scale.ordinal()
            .rangeRoundBands([0,width],0.2,0.2);


var yScale = d3.scale.linear()
            .range([height, 0]);



var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");


var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");
 


    d3.json("/age_wise_data", function(error, data){
    if(error) console.log("Error: data not loaded");
    console.log(data);
    
   ////// data.sort(function(a,b){
        //return b._grad_all - a._grad_all;
    //})
        
    // Transpose the data into layers
    var dataset = d3.layout.stack()([ "_all", "_males","_females"].map(function(genders) {
        return data.map(function(d) {
        return {x: d._age, y: +d[genders]};
        });
    }));   
        
        // Set x, y and colors
var x = d3.scale.ordinal()
  .domain(dataset[0].map(function(d) { return d.x; }))
  .rangeRoundBands([10, width-10], 0.02);

var y = d3.scale.linear()
  .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
  .range([height, 0]);

var colors = ["#d25c4d", "#f2b447", "#d9d574"];


    // Define and draw axes   
    var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .ticks(20)
  .tickSize(-width, 0, 0)
  .tickFormat( function(d) { return d } );

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickFormat( function(d) { return d });
        
    svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
    .selectAll("text")
        .attr("transform", "rotate(-60)")
        .attr("dx", "-15")
        .attr("dy", "11")
        .style("text-anchor", "end")
        .style("font-size", "14px");;    
    
          
    
var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .style("display", null);
         tooltip.append("rect")
  .attr("width", 50)
  .attr("height", 20)
  .attr("fill", "white")
.style("z-index", 999)
  .style("opacity", 0.5);
        
tooltip.append("text")
  .attr("x", 20)
  .attr("dy", "1.3em")
  .style("text-anchor", "middle")
  .attr("font-size", "14px")
  .attr("font-weight", "bold");
    
        
    // Create groups for each series, rects for each segment 
    var groups = svg.selectAll("g.rect")
  .data(dataset)
  .enter().append("g")
  .attr("class", "rect")
  .style("fill", function(d, i) { return colors[i]; });
        
    var rect = groups.selectAll("rect")
  .data(function(d) { return d; })
  .enter()
  .append("rect")
  .attr("x", function(d) { return x(d.x); })
  .attr("y", function(d) { return y(d.y0 + d.y); })
  .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
  .attr("width", x.rangeBand())
  .on("mouseover", function(d) { tooltip.style("display", null); })
  .on("mousemove", function(d) {
    var xPosition = d3.mouse(this)[0] - 15;
    var yPosition = d3.mouse(this)[1] - 25;
    tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")"),
    tooltip.select("text").text(d.y);
  });
        
   
        
    // Draw legend
var legend = svg.selectAll(".legend")
  .data(colors)
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(-200," + (i * 19) + ")"; });
 
legend.append("rect")
  .attr("x", width - 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", function(d, i) {return colors.slice().reverse()[i];});
 
legend.append("text")
  .attr("x", width + 15)
  .attr("y", 9)
  .attr("dy", ".45em")
  .style("text-anchor", "start")
  .text(function(d, i) { 
    switch (i) {
        case 0: return "females"        
      case 1: return "males";
      case 2: return "all";
            
    }
    // Prep the tooltip bits, initial display is hidden


  

    
  });    
        
        
        
    });//closing of data loading
}//closing function
    
});

