import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./css/ScatterChartComonent.css"

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050"

const axisLabels = ["Jan","Feb","Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez"];
const xAxisValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const yAxisValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
const margin = {top: 10, right: 10, bottom: 50, left: 50},
    width = 350 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;
const parseDate = d3.timeParse('%Y-%m-%d');

function drawLineChartSVG(dataset) {
    const lineChartDataset = dataset.filter(rawdata => Date.parse("01-01-2030") > Date.parse(rawdata[0])).map(data => [parseDate(data[0]), parseFloat(data[1])])
    var svgLineChart = d3.select("#lineChart")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    const x_linechart = d3.scaleTime()
                .domain(d3.extent(lineChartDataset, function(d) {  return d[0] }))
                .range([ 0, width ]);
    svgLineChart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x_linechart));
                  
                      // Add Y axis
    const y_linechart = d3.scaleLinear()
                .domain([0, d3.max(lineChartDataset, function(d) { return d[1]; })])
                .range([ height, 0 ]);
    svgLineChart.append("g")
        .call(d3.axisLeft(y_linechart));

    // Add the line
    svgLineChart.append("path")
        .datum(lineChartDataset)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
                    .x(function(d) { return x_linechart(d[0]) })
                    .y(function(d) { return y_linechart(d[1]) })
             )
}
function ScatterChart() {

    const [startDateJson, setStartDateJson] = useState(null);
    const responseJson = useRef(null);

    const fetchData = async () => {
        const response = await fetch(`${API_URL}/coursesStartDate`);
        responseJson.current = await response.json();
        setStartDateJson(responseJson.current);
    }
    var Tooltip = d3.select("#scatterChart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "1px")
        .style("padding", "1px")

    var mouseover = function(d) {
        Tooltip
          .style("opacity", 0.7)
        d3.select(this)
          .style("stroke", "grey")
          .style("opacity", 0.5)
      }
    var mousemove = function(event, d) {
    Tooltip
        .html("The exact value of<br>this cell is: " + d[2])
        .style("left", (d3.pointer(event,this)[0]) + "px")
        .style("top", (d3.pointer(event, this)[1]) + "px")
    }
    var mouseleave = function(d) {
    Tooltip
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    function drawHeatMap(dataset) {
        const svg = d3.select("#scatterChart")
        .append("svg")
        .attr("viewBox",`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .domain(xAxisValues)
            .range([0, width])
            .padding(0.05);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)
            .tickFormat((d,i) => axisLabels[i]));

        const y = d3.scaleBand()
            .domain(yAxisValues)
            .range([ height, 0])
            .padding(0.05);
        svg.append("g")
            .call(d3.axisLeft(y));

        // X label
        svg.append('text')
            .attr('x', width/2)
            .attr('y', height + 35)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 12)
            .text('Month');
        
        // Y label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(-30,' + height/2 + ')rotate(-90)')
            .style('font-family', 'Helvetica')
            .style('font-size', 12)
            .text('Day in Month');
        const smallValue = d3.scaleLinear()
            .range(["#F8F9FF", "#42A5F5"])
            .domain([0, 50]);
        const bigValue = d3.scaleLinear()
            .range(["#42A5F5", "#0D47A1"])
            .domain([0, 500]);

        svg.selectAll()
            .data(dataset)
            .enter()
            .append('rect')
                .attr("x", function (d) { return x(d[0]); } )
                .attr("y", function (d) { return y(d[1]); } )
                .attr("width", x.bandwidth() )
                .attr("height", y.bandwidth() )
                .style("fill",  function (d) {if(d[2] <= 50) {return smallValue(d[2])} else {return bigValue(d[2])} } )
                .style("stroke-width", 1)
                .style("stroke", "none")
                .style("opacity", 0.8)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    }

    useEffect(() => {
        fetchData();
      },[]);

    useEffect(() => {
        if (!startDateJson) return;
        // organize data for the chart
        //var count = {};
        //startDateJson.forEach(function(i) { count[i] = (count[i]||0) + 1;});
        //const test = Object.entries(count).map( startDate => [startDate[0], parseInt(startDate[1])]);
        //console.log(count);
        //const scatterChartDataset = Object.entries(count).map( startDate => [parseInt(startDate[0].split("-")[1]), parseInt(startDate[0].split("-")[2]), parseInt(startDate[1])]);
        //console.log(test);
        //console.log(parseDate(test[0][0]));
        //console.log(scatterChartDataset);
        drawLineChartSVG(startDateJson);
        drawHeatMap(startDateJson.map( startDate => [parseInt(startDate[0].split("-")[1]), parseInt(startDate[0].split("-")[2]), parseInt(startDate[1])]));
        
    },[startDateJson]);


    return (<div>
    <div id="scatterChart" className="fullwidth">
    </div>
    <div id="lineChart" className="fullwidth">
    </div>
    </div>)
    ;
}

export default ScatterChart;