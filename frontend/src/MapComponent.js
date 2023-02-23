import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Button, Grid, Form} from "tabler-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import "./css/MapComponent.css";


const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5050"

function LeafletMap() {
  const [markerGroup, setMarkerGroup] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markerJson, setMarkerJson] = useState(null);
  const [visibleMarkersCount, setVisibleMarkersCount] = useState(0);
  const [totalMarkersCount, setTotalMarkersCount] = useState(0);
  // Map refs:
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const markersRef = useRef(null);
  const responseJson = useRef(null);

  let currentPositon_lat = 0;
  let currentPositon_long = 0;
  let center_lat = 50;
  let center_long = 12;
  let center_zoom = 5.5;
  markersRef.current = L.markerClusterGroup({
    chunkedLoading: true,
    iconCreateFunction: function (cluster) {
      var childCount = cluster.getChildCount();

      var c = ' marker-cluster-';
      if (childCount < 100) {
        c += 'small';
      }
      else if (childCount < 3000) {
        c += 'medium';
      }
      else if (childCount  < 10000) {
        c += 'large';
      }
      else if (childCount  >= 10000) {
        c += 'large extra';
      }

      return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
  }})
  const currentPositionIcon = L.divIcon({
    className: 'map-marker',
    iconSize: null,
    html:'<div class="current-position-icon"></div>'
  });
  const markerIcon = L.icon({
    iconUrl: '/markerIcon.png',
    iconSize: [13,16]
  });
  tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });


  const createMarkers = (data) => data.forEach(markerData => {
    const marker = L.marker([parseFloat(markerData[1]),parseFloat(markerData[0])], {icon: markerIcon}).bindPopup(markerData[2] + "<br> <a href=" + markerData[3] + " target='_blank'>" + markerData[3] + "</a>")
    markerGroup.addLayer(marker);     
  })

  const fetchData = async () => {
    const response = await fetch(`${API_URL}/getLocations`);
    responseJson.current = await response.json();
    
    if (currentPositon_lat != 0 && currentPositon_long != 0) {
      mapInstance.createPane("locationMarker");
      mapInstance.getPane("locationMarker").style.zIndex = 999;
      var currentPositionMarker = L.marker([currentPositon_lat, currentPositon_long],{icon: currentPositionIcon, title: "current location", pane:"locationMarker"}).bindPopup("Current Location");
      currentPositionMarker.addTo(mapInstance);
    }
    setMarkerJson(responseJson.current.map(([lat, long, course, link]) => [parseFloat(lat), parseFloat(long), course, link]));
    createMarkers(responseJson.current);
    mapInstance.fireEvent("moveend");
    setTotalMarkersCount(responseJson.current.length);
  }
  
  
  useEffect(() => {
      mapRef.current = L.map('map', {
      center: [center_lat, center_long],
      zoom: center_zoom,
      layers: [tileRef.current]
    });
    setMarkerGroup(markersRef.current);
    setMapInstance(mapRef.current);
     
    //mapInstance.addLayer(markerGroup);

},[]);
useEffect(() => {
  // Check for the map instance before adding something (ie: another event listener).
  // If no map, return:
  if (!mapInstance) return;
  
  if (mapInstance) { 
    navigator.geolocation.getCurrentPosition(function(position) {
      currentPositon_lat = position.coords.latitude;
      currentPositon_long = position.coords.longitude;
      mapInstance.flyTo([currentPositon_lat,currentPositon_long], center_zoom + 4 );
      //}
    });
    fetchData();
    mapInstance.addLayer(markerGroup);
  }
}, [mapInstance]);

const filterData = (inputField) => {
  markerGroup.clearLayers();
  if (inputField.target.value == "") {
    createMarkers(markerJson);
  }
  else {
    var uppercaseInput = inputField.target.value[0].toUpperCase() + inputField.target.value.substring(1);
    var lowercaseInput = inputField.target.value[0].toLowerCase() + inputField.target.value.substring(1);
    
    createMarkers(markerJson.filter( data => data[2].search(uppercaseInput) > -1
                                          || data[2].search(lowercaseInput) > -1));
  }
  mapInstance.fireEvent("moveend");
}

if (mapInstance != null) {
  mapInstance.on('moveend', function() {
    // Construct an empty list to fill with onscreen markers.
    setVisibleMarkersCount(0);
    var visibleMarkerCountTemp = 0;
    // Get the map bounds - the top-left and bottom-right locations.
    var bounds = mapInstance.getBounds();

    // For each marker, consider whether it is currently visible by comparing
    // with the current map bounds.
    markerGroup.eachLayer(function(marker) {
        if (marker instanceof L.Marker && bounds.contains(marker.getLatLng())) {
          visibleMarkerCountTemp += 1;
        }
      
    });
    setVisibleMarkersCount(visibleMarkerCountTemp);
  })
}

function getVisibleMarkersCount() {
  return visibleMarkersCount;
}

/*function countVisibleMarkers() {
  var visibleMarkerCount = 0;
  map.eachLayer(function(layer) {
      if ((layer instanceof L.Marker) && (map.getBounds().contains(layer.getLatLng()))) {
        visibleMarkerCount += 1;
      };
  });
}*/


return (
  <div>
    <Grid.Row>
      <Grid.Col width={3} >
        <Grid.Row className="fullsize" >
          <Card className="ml-20">
            <Card.Header className="display-content">
              <Card.Title className="titles">Total Courses</Card.Title>
            </Card.Header>
            <Card.Body className="card-body2 display-content">
              <h1 className='numbers'>{totalMarkersCount}</h1> 
            </Card.Body>
          </Card>

          <Card className="ml-20">
            <Card.Header className="display-content">
              <Card.Title className="titles">Courses in view Area</Card.Title>
            </Card.Header>
            <Card.Body className="card-body2 display-content">
              <h1 className='numbers'>{visibleMarkersCount}</h1> 
            </Card.Body>
          </Card>
        </Grid.Row>
      </Grid.Col>
      <Grid.Col width={9}>
        <Card className="mr-20">
          <Card.Body className="map-container">
            <div>
              <Form.InputGroup>
                <Form.InputGroupPrepend >
                  <Button RootComponent="a" color="primary" type="submit">
                    Go!
                  </Button>
                </Form.InputGroupPrepend>
                <Form.Input placeholder="Filter for..." onChange={filterData} />
              </Form.InputGroup>
              <br></br>
              <div id="map">
              </div>
            </div>
          </Card.Body>
        </Card>
      </Grid.Col>
    </Grid.Row>
  </div>
);

} 

export default LeafletMap;

