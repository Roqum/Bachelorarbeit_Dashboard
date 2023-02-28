import React, {Component, useEffect, useState} from 'react';
import { render } from 'react-dom';
import WordCloud from 'react-d3-cloud';
import { createRoot } from 'react-dom/client';
import LeafletMap from './MapComponent';
import { Card, Button, Grid, Form, Page} from "tabler-react";
import ScatterChart from './ScatterChartComponent';
import BarChart from './BarChart';
import "tabler-react/dist/Tabler.css";
import './css/App.css';






const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050"
var loaded = false;

    
function App() {
  const [data,setData] = useState([]);
  const [generalNumbers,setGeneralNumbers] = useState([]);

  function setCloudData(dataForCloud) {
    setData(data => data = dataForCloud)
  }
  function transformDataForCloud(listWithLists) {
    let dataForCloud = [];
    listWithLists = Array.from(listWithLists);
    dataForCloud = listWithLists.map(item => ({text: item[0], value: parseFloat(item[1])}));
    setCloudData(dataForCloud);
  }

  function fetchWordCloudData() {
      fetch(`${API_URL}/wordsCount`)
      .then( (res) => res.json())
      .then( (data) => transformDataForCloud(data))
      .catch( (err) => console.log("wordcloud error: " + err) );
    }

  /* function fetchGeneralData() {
      fetch(`${API_URL}/generalData`)
      .then( (res) => {console.log(res.json()); setGeneralNumbers(res.json())})
      .catch( (err) => console.log("wordcloud error: " + err) );
  } */
  const fetchGeneralData = async () => {
    const response = await fetch(`${API_URL}/generalData`);
    setGeneralNumbers(await response.json());
}

  useEffect(() => {
    fetchWordCloudData()
    fetchGeneralData()
  },[]);

  return(
    <div className="fullwidth">
      <Page.Card >
      <Grid.Row>
        <Grid.Col>
        <Card>
          <Card.Body className="badge">
            <h1>Website Name</h1>
          </Card.Body>
        </Card>
        </Grid.Col>
      </Grid.Row>
      <Grid.Row>
        <Grid.Col>
          <Card className="numberCard">
            <Card.Header>
              <Card.Title>
                Anzahl an Kursen
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {generalNumbers[0]}
            </Card.Body>
          </Card>
        </Grid.Col>
        <Grid.Col>
          <Card className="numberCard">
            <Card.Header>
              <Card.Title>
                Städte mit Kursen
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {generalNumbers[1]}
            </Card.Body>
          </Card>
        </Grid.Col>
        <Grid.Col>
          <Card className="numberCard">
            <Card.Header>
              <Card.Title>
                Oline Kurse
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {generalNumbers[2]}
            </Card.Body>
          </Card>
        </Grid.Col>
        <Grid.Col>
          <Card className="numberCard">
            <Card.Header>
              <Card.Title>
                Anzahl an Anbieter
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {generalNumbers[3]}
            </Card.Body>
          </Card>
        </Grid.Col>
      </Grid.Row>
      <LeafletMap ></LeafletMap>
      <Grid.Row>
        <Grid.Col>
          <Card >
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
          <Card >
            <Card.Header>
              <Card.Title>
                Top 100 used Words in course titles
              </Card.Title>
            </Card.Header>
            <Card.Body>
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
          <Card> 
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
    </Page.Card>
    </div>
  );
}

export default App;




