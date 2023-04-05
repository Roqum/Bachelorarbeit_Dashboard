import React, {Component, useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import { Button } from "tabler-react";
import Dashboard from './Dashboard';
import './css/App.css';

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050";
window.year = "";

function App() {

    const navigate = useNavigate();
    const [datasetsYear,setDatasetsYear] = useState([]);

    const fetchYears = async () => {
      const response = await fetch(`${API_URL}/getAvailibleYears`);
      setDatasetsYear(await response.json());
    }
    // called once the page is opend
    useEffect(() => {
        fetchYears()
    },[]);
    
    const routing = (path) =>{ 
        navigate(path);
      }
    return (
        
        datasetsYear == null ?  <div></div> :
    <div>
    <div className="buttons-list" > 
        <h3>Lade Daten vom Jahr</h3>
        {datasetsYear.map(element => <Button className="buttons" onClick={() => {window.sessionStorage.setItem('year', element); window.year = element; routing('/dashboard')}} role="button"> {element}</Button>)}
    </div>
    </div>
      );
  }
  
  export default App;