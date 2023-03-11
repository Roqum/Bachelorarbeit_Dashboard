import React, { useEffect, useRef, useState } from "react";
import { Button } from "tabler-react";
import * as d3 from "d3";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050"

function CoursesPerMonthBarChart() {

    const [startDateJson, setStartDateJson] = useState(null);
    const [activeDatasetIndicator, setActiveDatasetIndicator] = useState(null);
    const responseJson = useRef(null);

    const xAxiesMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const displayMonths = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const margin = {top: 20, right: 20, bottom: 50, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    const xScale = useRef(null);
    const yScale = useRef(null);
    const svgCoursesPerMonthBarChart = useRef(null);


    const fetchData = () => {
        fetch(`${API_URL}/coursesStartDate`)
            .then( res => res.json())
            .then( resJson => {
                // map the fetched file in a list of datasets for the diffrent years
                responseJson.current = resJson.map(element => [element[0], (JSON.parse(element[1].replace(/'/g, '"')).map(elem => [parseInt(elem[0].split("-")[1]), parseInt(elem[1])]))]);
                responseJson.current = responseJson.current.map(dataset => [dataset[0], dataset[1].sort((a,b) => b[1] - a[1])]);
                setStartDateJson(responseJson.current);
            });
    }

    // wraps the x-axies month names so that they are not overlapping
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
    var Tooltip = d3.select("#coursesPerMonthBarChart")
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
        .html('"' + displayMonths[d[0] - 1] +'" hat ' + d[1] + ' Kurse.')
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
      
    function drawBarChart(dataset) {
        svgCoursesPerMonthBarChart.current = d3.select("#coursesPerMonthBarChart")
            .append("svg")
            .attr("viewBox",`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        xScale.current = d3.scaleBand()
            .domain(xAxiesMonths)
            .range([0, width])
            .padding(0.05);

        svgCoursesPerMonthBarChart.current.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale.current)
            .tickFormat((d,i) => displayMonths[d]))
            .selectAll(".tick text")
            .call(wrap, margin.bottom * 2)
            .style("font-size", 10)
            .style("text-anchor", "start")
            .attr("transform", "translate(8, 3) rotate(25)");

        yScale.current = d3.scaleLinear()
            .domain([0, dataset[0][1]])
            .range([height, 0]);

        svgCoursesPerMonthBarChart.current.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale.current));
    }

    function updateChart(dataset) {
        yScale.current = d3.scaleLinear()
            .domain([0, dataset[0][1]])
            .range([height, 0]);

        svgCoursesPerMonthBarChart.current.selectAll("g.y.axis")
            .call(d3.axisLeft(yScale.current));

        svgCoursesPerMonthBarChart.current.selectAll('rect')
            .data(dataset)
            .join(
                enter =>
                    enter
                    .append('rect')
                    .attr("x", function (d) { console.log("enter"); return xScale.current(d[0]); } )
                    .attr("y", function (d) { return yScale.current(d[1]); } )
                    .attr("width", xScale.current.bandwidth() )
                    .attr("height", function (d) {return height - yScale.current(d[1]); })
                    .attr("fill", "#58f")
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave),
                update =>
                    update
                        .transition()
                        .duration(1000)
                        .attr("x", function(d) { console.log("update"); return xScale.current(d[0]); })
                        .attr("y", function(d) { return yScale.current(d[1]); })
                        .attr("width", xScale.current.bandwidth())
                        .attr("height", function(d) { return height - yScale.current(d[1]); })
                        .attr("fill", "#58f")
            )
    }
    useEffect(() => {
        fetchData();
      },[]);

    useEffect(() => {
        if (!startDateJson) return;
        drawBarChart(startDateJson[0][1]);
        setActiveDatasetIndicator(startDateJson[0][0]);
    },[startDateJson]);

    // is called each time a year button is clicked and the dataset is changed
    useEffect(() => {
        if (!startDateJson) return;
        startDateJson.forEach(element => { 
            if (element[0] === activeDatasetIndicator) {
                updateChart(element[1]);
            }           
        });
    },[activeDatasetIndicator]);

    return (
        startDateJson == null ?  <div></div> :
    <div  className="fullwidth"> 
        <div id="coursesPerMonthBarChart" className="fullwidth">
        </div>
        {startDateJson.map(element => <Button onClick={() => setActiveDatasetIndicator(element[0])} role="button"> {"Jahr: " + element[0]}</Button>)}
    </div>
    );
}

export default CoursesPerMonthBarChart;