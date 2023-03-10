import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./css/BarChart.css"
import * as categoryColors from "./assets/categoryColors.json";
import * as displayCategoryNames from "./assets/categoryDisplayNames.json"
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050"

function CategoryBarChart() {

    const [startDateJson, setStartDateJson] = useState(null);
    const responseJson = useRef(null);
    const ammountOfShownProvider = 35;
    const margin = {top: 20, right: 20, bottom: 50, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    const fetchData = async () => {
        const response = await fetch(`${API_URL}/getLocations`);
        responseJson.current = await response.json();
        var jsonAsList = Object.keys(responseJson.current).map( key => [key, responseJson.current[key].length]);
        jsonAsList = jsonAsList.sort((a, b) => b[1]- a[1]);
        setStartDateJson(jsonAsList);
    }

    function wrap(text, width) {
        text.each(function() {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 0.8,
              y = text.attr("y"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
          }
        });
    }

    /****** functions for dynamic response to mouse over bar *****/
    var Tooltip = d3.select("#categoryBarChart")
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
        .html('"' + displayCategoryNames[d[0]] +'" hat ' + d[1] + ' Kurse.')
        .style("left", (d3.pointer(event,this)[0]) + "px")
        .style("top", (d3.pointer(event, this)[1]) + "px")
    }
    var mouseleave = function(d) {
    Tooltip
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none")
        .style("opacity", 1)
    }
    /****************************************************************/
      
    function drawHeatMap(dataset) {
        const svgCategoryBarChart = d3.select("#categoryBarChart")
        .append("svg")
        .attr("viewBox",`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
        const xScale = d3.scaleBand()
            .domain(dataset.map(item => item[0]))
            .range([0, width])
            .padding(0.05);

        svgCategoryBarChart.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale)
            .tickFormat((d,i) => displayCategoryNames[d]))
            .selectAll(".tick text")
            .call(wrap, margin.bottom * 2)
            .style("font-size", 10)
            .style("text-anchor", "start")
            .attr("transform", "translate(8, 3) rotate(25)");
            
        const yScale = d3.scaleLinear()
            .domain([0, dataset[0][1]])
            .range([height, 0]);
        svgCategoryBarChart.append("g")
            .call(d3.axisLeft(yScale));


        svgCategoryBarChart.selectAll()
            .data(dataset)
            .enter()
            .append('rect')
                .attr("x", function (d) { return xScale(d[0]); } )
                .attr("y", function (d) { return yScale(d[1]); } )
                .attr("width", xScale.bandwidth() )
                .attr("height", function (d) {return height - yScale(d[1]); })
                .attr("fill", function (d) { return categoryColors[d[0]]})
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    }

    useEffect(() => {
        fetchData();
      },[]);

    useEffect(() => {
        if (!startDateJson) return;
        drawHeatMap(startDateJson);
        
    },[startDateJson]);

    return (<div id="categoryBarChart" className="fullwidth">

    </div>);
}

export default CategoryBarChart;