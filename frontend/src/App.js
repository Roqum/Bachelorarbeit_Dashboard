import React, {Component, useState} from 'react';
import { render } from 'react-dom';
import WordCloud from 'react-d3-cloud';
import { createRoot } from 'react-dom/client';
import LeafletMap from './MapComponent';
import { Card, Button, Grid, Form} from "tabler-react";
import ScatterChart from './ScatterChartComponent';
import BarChart from './BarChart';
import "tabler-react/dist/Tabler.css";
import './css/App.css';






const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050"
var loaded = false;

    
function App() {
  const [data,setData] = useState([]);

  function setCloudData(dataForCloud) {
    setData(data => data = dataForCloud)
  }
  function transformDataForCloud(listWithLists) {
    let dataForCloud = [];
    listWithLists = Array.from(listWithLists);
    dataForCloud = listWithLists.map(item => ({text: item[0], value: parseFloat(item[1])}));
    setCloudData(dataForCloud);
  }

  function loadWordCloudData() {
    if (!loaded){
      fetch(`${API_URL}/wordsCount`)
      .then( (res) => res.json())
      .then( (data) => transformDataForCloud(data))
      .catch( (err) => console.log("wordcloud error: " + err) );
      loaded = true;
    }
    } 

  return(
    <div>
      <Grid.Row>
        <Card>
          <Card.Body className="badge">
            <h1>Website Name</h1>
          </Card.Body>
        </Card>
      </Grid.Row>
      <LeafletMap ></LeafletMap>
      <Grid.Row>
        <Grid.Col>
        <Card className="ml-10 mr-10 half-page">
          <Card.Header>
            <Card.Title>
              Amount of courses at specific Date 
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <ScatterChart />
          </Card.Body>
        </Card>
        </Grid.Col>
        <Grid.Col>
          <Card className="ml-10 mr-10">
            <Card.Header>
              <Card.Title>
                Top 100 used Words in course titles
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {loadWordCloudData()}
              <WordCloud 
                height={500}
                width={800}
                fontSize={(word) => (word.value)/8}
                spiral="archimedean"
                rotate={() => ((Math.round(Math.random() * 100 ) % 2) * 90)}
                padding={2} 
                data={data} 
                random={Math.random} 
                fontWeight="540"
              />
            </Card.Body>
          </Card>
        </Grid.Col>
      </Grid.Row>

      <Grid.Row>
        <Grid.Col>
          <Card className="ml-10 mr-10 half-page"> 
            <Card.Header>
              <Card.Title>
                Top course providers
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <BarChart />
            </Card.Body>
          </Card>
        </Grid.Col>
      </Grid.Row>

    </div>
  );
}

export default App;




