import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./css/ProvidersBarChart.css"

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050"

function ProvidersBarChart() {

    const [fetchedDataset, setFetchedDataset] = useState(null);
    const responseJson = useRef(null);
    const ammountOfShownProvider = 20;
    const margin = {top: 20, right: 50, bottom: 130, left: 35},
        width = 350 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    const fetchData = async () => {
        const response = await fetch(`${API_URL}/coursesProvider?year=${window.year}`);
        responseJson.current = await response.json();

        // map the fetched file in valid format for the charts 
        setFetchedDataset(responseJson.current.map(listElem => [listElem[0], parseFloat(listElem[1])]));
    }

        /**************************Animation on mouseover*******************************/
    var Tooltip = d3.select("#providersBarChart")
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
        .html('"' + d[0] +'" hat ' + d[1] + ' Kurse')
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
    /********************************************************************************/

    // wraps the x-axies provider names so that they are not overlapping
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

    function drawBarChart(dataset) {
        
        const svg = d3.select("#providersBarChart")
            .append("svg")
            .attr("viewBox",`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .domain(dataset.map(item => item[0]))
            .range([0, width])
            .padding(0.05);
            
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)) 
            .selectAll(".tick text")
            .call(wrap, margin.bottom * 1.2)
            .style("font-size", 10)
            .style("text-anchor", "start")
            .attr("transform", "translate(8, 3) rotate(55)");
            
        const y = d3.scaleLinear()
            .domain([0,dataset[0][1]])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));
        
        svg.selectAll()
            .data(dataset)
            .enter()
            .append('rect')
                .attr("x", function (d) { return x(d[0]); } )
                .attr("y", function (d) { return y(d[1]); } )
                .attr("width", x.bandwidth() )
                .attr("height", function (d) {return height - y(d[1]); })
                .attr("fill", "#58f")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    }

    useEffect(() => {
        fetchData();
      },[]);

    useEffect(() => {
        if (!fetchedDataset) return;
        drawBarChart(fetchedDataset.slice(0,ammountOfShownProvider));
        
    },[fetchedDataset]);

    return (<div id="providersBarChart" className="fullwidth">

    </div>);
}

export default ProvidersBarChart;