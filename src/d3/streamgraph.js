function makeGraph(dataFromGoogleSheets, divId, that, d3){

        if(!dataFromGoogleSheets){

            return
        }

        var data = that.getDataFormattedForStreamGraph()

        // set the dimensions and margins of the graph
        var margin = {top: 20, right: 240, bottom: 30, left: 120},
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

        d3.select("#" + divId).selectAll('svg').remove();

        // append the svg object to the body of the page
        var svg = d3.select("#" + divId)
        .append("svg")
            .attr("width", '100%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

                // List of groups = header of the csv files
        var keys = data.header

        var distinctXTicks = []

        // Add X axis
        var x = d3.scaleLinear()
            .domain(d3.extent(data.data, function(d) { return d.Year; }))
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(5).tickFormat(function(val, ix){

                var val = parseInt(val)

                if(distinctXTicks.indexOf(val) === -1){

                    distinctXTicks.push(val)

                    return val
                }
            }))
            
        // Add Y axis
        var y = d3.scaleLinear()
            .domain([-100000, 100000])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(['#007F3E','#4CFFA4','#00FF7D','#267F52','#00CC64','#96CA2D','#EDF7F2','#7FC6BC'])

        //stack the data
        var stackedData = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(keys)
            (data.data)



            stackedData=stackedData.slice(1)

        // Define the div for the tooltip
        var div = d3.select("body").append("div")	
            .attr("class", "tooltip")				
            .style("opacity", 0);

        // Show the areas
        svg
            .selectAll("mylayers")
            .data(stackedData)
            .enter()
            .append("path")
            .style("fill", function(d) { return color(d.key); })
            .style("stroke", "url(#svgGradient)")
            .style("stroke-width", "5px")
            .attr("d", d3.area()
                .x(function(d, i) { return 0; })
                .y0(function(d) { return y(d[1]); })
                .y1(function(d) { return y(d[0]);}))
            .transition()
            .duration(2000)
            .attr("d", d3.area()
                .x(function(d, i) { return x(d.data.Year); })
                .y0(function(d) { return y(d[0]) })
                .y1(function(d) { return y(d[1]); })
            )



            // Add gradient defs to svg
const defs = svg.append("defs");

const gradient = defs.append("linearGradient").attr("id", "svgGradient");
const gradientResetPercentage = "50%";

gradient
  .append("stop")
  .attr("class", "start")
  .attr("offset", gradientResetPercentage)
  .attr("stop-color", "transparent")

gradient
  .append("stop")
  .attr("class", "start")
  .attr("offset", gradientResetPercentage)
  .attr("stop-color", "#00ff00")

gradient
  .append("stop")
  .attr("class", "end")
  .attr("offset", gradientResetPercentage)
  .attr("stop-color", "#00ff00")
  .attr("stop-opacity", 1)

gradient
  .append("stop")
  .attr("class", "end")
  .attr("offset", gradientResetPercentage)
  .attr("stop-color", "transparent")
  .attr("stop-width", 10)




            var seriesIxForDatum = 0
            
            svg
            .selectAll("path")
            .datum(function(obj, ix){

                var retDatum

                if(obj != null){

                    retDatum = "mySeriesName-" + seriesIxForDatum

                    seriesIxForDatum++

                    return retDatum
                }
            })
            .on("mousemove", function(event, datum) {	

                try{
                    var currentXPosition = d3.pointer(event)[0];

                    var xValue = x.invert(currentXPosition);
    
                    var bisectDate = d3.bisector(dataPoint => dataPoint.Year).left;
    
                    // Get the index of the xValue relative to the dataSet
                    var dataIndex = bisectDate(data.data, xValue, 1);
                    var leftData = data.data[dataIndex - 1];
                    var rightData = data.data[dataIndex];
    
                    const x1Percentage = x(leftData.Year) / width * 100;
                    const x2Percentage = x(rightData.Year) / width * 100;
                    d3.selectAll(".start").attr("offset", `${x1Percentage}%`);
                    d3.selectAll(".end").attr("offset", `${x2Percentage}%`);
    
    
                    var personName = that.getTooltipContent(datum, stackedData)
    
                    
    
                    if(personName === ""){
    
                        div.style("display", "none")
                    }
                    else{
                        
                        div.style("display", "block")
                    }
                    
                    
                    var currentXPosition = d3.pointer(event)[0];
    
                    var xValue = x.invert(currentXPosition);
    
                    var bisectDate = d3.bisector(dataPoint => dataPoint.Year).left;
    
                    // Get the index of the xValue relative to the dataSet
                    var dataIndex = bisectDate(data.data, xValue, 1);
                    var leftData = data.data[dataIndex - 1];
                    var rightData = data.data[dataIndex];
                    var myDataPoint = data.data[dataIndex];
    
                    var tooltipContent = '<h2>' + personName + '</h2>'
                    tooltipContent += '<h2>' + parseInt(xValue) + '</h2>'
                    tooltipContent += '<h2>' + that.numberWithCommas(myDataPoint[personName]) + '</h2>'
    
    
                    d3.select(this).transition()
                   .duration('50')
                   .attr('opacity', '.85')
    
                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                    div	.html(tooltipContent)	
                        .style("left", (event.pageX) + "px")		
                        .style("top", (event.pageY - 28) + "px");	
                }
                catch(e)
                {}
            })		
            .on("mouseout", function(event, d) {	
                
                try{

                    div.style("display", "none")
                
                    d3.select(this).transition()
                   .duration('50')
                   .attr('opacity', '1');
                 
                    d3.selectAll(".start").attr("offset", `${0}%`);
                    d3.selectAll(".end").attr("offset", `${0}%`);
                }
                catch(e)
                {}
            });
}

module.exports = makeGraph