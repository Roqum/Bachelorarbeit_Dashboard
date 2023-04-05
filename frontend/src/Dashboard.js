import React, {Component, useEffect, useState} from 'react';
import { render } from 'react-dom';
import WordCloud from 'react-d3-cloud';
import { createRoot } from 'react-dom/client';
import LeafletMap from './MapComponent';
import { Card, Button, Grid, Form, Page, ProgressCard, Loader} from "tabler-react";
import { BuildingCommunity } from 'tabler-icons-react';
import CoursesPerDayHeatMap from './CoursesPerDayHeatMap';
import CategoryBarChart from './CategoryBarChart';
import ProvidersBarChart from './ProvidersBarChart';
import CoursesPerMonthBarChart from './CoursesPerMonthBarChart';
import CitiesBarChart from './CitiesBarChart';
import "tabler-react/dist/Tabler.css";
import './css/Dashboard.css';






const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050"
var loaded = false;

    
function Dashboard() {
  if (window.sessionStorage.getItem('year') != null){
    console.log(window.sessionStorage.getItem('year'))
    window.year = sessionStorage.getItem('year');
  }
  const [data,setData] = useState([]);
  const [generalNumbers,setGeneralNumbers] = useState([]);
  const [loaderSymbol,setLoaderSymbol] = useState(null);
  const [availibleYears,setAvailibleYears] = useState([]);

  /************ fetch data for wordcloud and general infos **************/
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
      fetch(`${API_URL}/wordsCount?year=${window.year}`)
      .then( (res) => res.json())
      .then( (data) => transformDataForCloud(data))
      .catch( (err) => console.log("wordcloud error: " + err) );
    }

  const fetchGeneralData = async () => {
    const response = await fetch(`${API_URL}/generalData?year=${window.year}`);
    setGeneralNumbers(await response.json());
  }
  const fetchAvailibleYears = async () => {
    const response = await fetch(`${API_URL}/getAvailibleYears`);
    setAvailibleYears(await response.json());
  }
/*************************************************************************/

  // called once the page is opend
  useEffect(() => {
    fetchWordCloudData()
    fetchGeneralData()
    fetchAvailibleYears()
  },[]);

  // called if button for load data is clicked
  function loadData() {
    if(loaderSymbol== null) {
      setLoaderSymbol(<Loader className="loader-symbol" checked="true"></Loader>);
      fetch(`${API_URL}/runDatabase`).then(
        result => {
          setLoaderSymbol(null);
          window.location.reload(true);
        }
      );
    }
  }
  function loadDataForYear() {
    var year = document.getElementById("activYear").value
    window.sessionStorage.setItem('year', year)
    window.location.reload(true);
  }
  
  return(
    <div className="fullwidth">
      <div className="badge">
        <h1>Website Name</h1>
        {loaderSymbol}
        <div className="years-selection">
          <select name="years" id="activYear">
            {availibleYears.map(year => year == window.year ? <option value={year} selected="selected"> {year}</option> : <option value={year}> {year}</option>)}         
          </select>
          <button onClick={loadDataForYear} role="button">Jahr laden</button>
          <button onClick={loadData} role="button">Datensatz neu berechnen</button>
        </div>
      </div>
      <div className='dashboard-content'>
        <Grid.Row>
          <Grid.Col>
            <ProgressCard 
              className="progressCard"
              header="Gesamtanzahl an Kursen"
              progressColor="blue"
              progressWidth={100}
              content={generalNumbers[0]}>          
            </ProgressCard>
          </Grid.Col>
          <Grid.Col>        
            <ProgressCard 
              className="progressCard"
              header="Gesamtanzahl an Städten mit Kursen"
              progressColor="blue"
              progressWidth={100}
              content={generalNumbers[1]}>          
            </ProgressCard>
          </Grid.Col>
          <Grid.Col>
            <ProgressCard 
              className="progressCard"
              header="Gesamtanzahl an Onlinekursen"
              progressColor="blue"
              progressWidth={100}
              content={generalNumbers[2]}>          
            </ProgressCard>
          </Grid.Col>
          <Grid.Col>
            <ProgressCard 
              className="progressCard "
              header="Gesamtanzahl an Kursanbietern"
              progressColor="blue"
              progressWidth={100}
              content={generalNumbers[3]}>         
            </ProgressCard>
            
          </Grid.Col>
        </Grid.Row>
        <Grid.Row>
          <LeafletMap ></LeafletMap>
        </Grid.Row>
        <Grid.Row>
          <Grid.Col>
            <Card> 
              <Card.Header>
                <Card.Title>
                  Kursanzahl pro Kategorie
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <CategoryBarChart />
              </Card.Body>
            </Card>
          </Grid.Col>
          <Grid.Col>
            <Card >
              <Card.Header>
                <Card.Title>
                  Kursanzahl pro Tag
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <CoursesPerDayHeatMap />
              </Card.Body>
            </Card>
          </Grid.Col>
          <Grid.Col>
            <Card >
              <Card.Header>
                <Card.Title>
                  100 meist genutzen Wörter
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
          </Grid.Row>
          <Grid.Row>
            <Grid.Col>
              <Card> 
                <Card.Header>
                  <Card.Title>
                    Kursanzahl pro Monat
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
                    Kursanzahl pro Stadt
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <CitiesBarChart />
                </Card.Body>
              </Card>
            </Grid.Col>
            <Grid.Col>
              <Card> 
                <Card.Header>
                  <Card.Title>
                    Kursanbieter mit den meisten Kursen
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <ProvidersBarChart />
                </Card.Body>
            </Card>
            </Grid.Col>
          </Grid.Row>
          </div>
        <div className="badge-bottom">


      </div>
    </div>
  );
}

export default Dashboard;




