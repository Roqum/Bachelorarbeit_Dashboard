import React, {Component, useEffect, useState} from 'react';
import { render } from 'react-dom';
import WordCloud from 'react-d3-cloud';
import { createRoot } from 'react-dom/client';
import LeafletMap from './MapComponent';
import { Card, Button, Grid, Form, Page, ProgressCard, Loader} from "tabler-react";
import { BuildingCommunity } from 'tabler-icons-react';
import ScatterChart from './ScatterChartComponent';
import CategoryBarChart from './CategoryBarChart';
import BarChart from './BarChart';
import CoursesPerMonthBarChart from './CoursesPerMonthBarChart';
import CitiesBarChart from './CitiesBarChart';
import "tabler-react/dist/Tabler.css";
import './css/App.css';






const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050"
var loaded = false;

    
function App() {
  const [data,setData] = useState([]);
  const [generalNumbers,setGeneralNumbers] = useState([]);
  const [loaderSymbol,setLoaderSymbol] = useState(null);

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

  function loadData() {
    if(loaderSymbol== null) {
      setLoaderSymbol(<Loader className="loader-symbol" checked="true"></Loader>);
      fetch(`${API_URL}/runDatabase`).then(
        result => {
          setLoaderSymbol(null);
          window.location.reload(true);
        }
      );
      console.log("hi");
    }
  }


  return(
    <div className="fullwidth">
      <div className="badge">
        <h1>Website Name</h1>
        {loaderSymbol}
        <button onClick={loadData} role="button">Datensatz laden</button>
      </div>
        <Grid.Row>
          <Grid.Col>
            <ProgressCard 
              className="progressCard"
              header="Anzahl an Kursen"
              progressColor="blue"
              progressWidth={100}
              content={generalNumbers[0]}>          
            </ProgressCard>
          </Grid.Col>
          <Grid.Col>        
            <ProgressCard 
              className="progressCard"
              header="Städte mit Kursen"
              progressColor="blue"
              progressWidth={100}
              content={generalNumbers[1]}>          
            </ProgressCard>
          </Grid.Col>
          <Grid.Col>
            <ProgressCard 
              className="progressCard"
              header="Online Kurse"
              progressColor="blue"
              progressWidth={100}
              content={generalNumbers[2]}>          
            </ProgressCard>
          </Grid.Col>
          <Grid.Col>
            <ProgressCard 
              className="progressCard "
              header="Anzahl an Anbietern"
              progressColor="blue"
              progressWidth={100}
              content={generalNumbers[3]}>         
            </ProgressCard>
            
          </Grid.Col>
        </Grid.Row>
        <Grid.Row>
          <LeafletMap ></LeafletMap>
          <Grid.Col>
            <Card> 
              <Card.Header>
                <Card.Title>
                  Kurse pro Kategorie
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <CategoryBarChart />
              </Card.Body>
            </Card>
          </Grid.Col>
        </Grid.Row>
        <Grid.Row>
          <Grid.Col>
            <Card >
              <Card.Header>
                <Card.Title>
                  Anzahl der Kurse am Datum 
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
                  Meist genutzen Wörter
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <WordCloud 
                  height={600}
                  width={600}
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
          <Grid.Col>
            <Card> 
              <Card.Header>
                <Card.Title>
                  Meisten Anbieter
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <BarChart />
              </Card.Body>
            </Card>
          </Grid.Col>
          </Grid.Row>
          <Grid.Row>
            <Grid.Col>
              <Card> 
                <Card.Header>
                  <Card.Title>
                    Kurse pro Monat
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <CoursesPerMonthBarChart />
                </Card.Body>
              </Card>
            </Grid.Col>
            <Grid.Col>
              <Card> 
                <Card.Header>
                  <Card.Title>
                    Anzahl an Kursen in Städten
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <CitiesBarChart />
                </Card.Body>
              </Card>
            </Grid.Col>
          </Grid.Row>
        <div className="badge-bottom">


      </div>
    </div>
  );
}

export default App;




