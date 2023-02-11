import { ChangeEvent, useEffect, useState } from 'react'
import './App.css'
import { HealthCenter } from './HealthCenter';
import { Coordinate } from './Coordinate';
import HealthCenterList from './HealthCenterList';

function getDistanceBetweenTwoPoints(cord1: Coordinate, cord2: Coordinate) {
  if (cord1.lat == cord2.lat && cord1.lng == cord2.lng) {
    return 0;
  }

  const radlat1 = (Math.PI * cord1.lat) / 180;
  const radlat2 = (Math.PI * cord2.lat) / 180;

  const theta = cord1.lng - cord2.lng;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  if (dist > 1) {
    dist = 1;
  }

  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344; //convert miles to km

  return dist;
}

const getLocation = async (): Promise<[ Coordinate, boolean ]> => {
  const defaultPosition = {lat: 37.1768562341751, lng: 37.01209105546673};

  if (navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            true,
          ]);
        },
        () => {
          resolve([ defaultPosition, false ]);
        }
      );
    });
  }
  return [ defaultPosition, false ];
};

function App() {
  const [ state, setState ] = useState({
    query: '',
    list: [],
    healthCenters: [],
    hasGeolocation: false,
  })
  const fetchFact = (location: Coordinate, hasLocation: boolean) => {
    fetch('https://herav2-web-service.production-turkey.herav2.heradigitalhealth.com/health_centers/')
      .then((response) => response.json())
      .then((healthCenters) => {
        const list = healthCenters.map(({geolocation = '', type, ...props}: HealthCenter) => {
          const [ lat, lng ] = geolocation.split(',');
          let distance = +Infinity;
          if (lat && lng) {
            distance = getDistanceBetweenTwoPoints(location, {lat: Number(lat), lng: Number(lng)});
          }
          return {
            lat: +lat,
            lng: +lng,
            ...props,
            distance,
          };
        })
        setState({
          ...state,
          healthCenters: list,
          list: list,
          hasGeolocation: hasLocation,
        })
      });
  };
  useEffect(() => {
    (async () => {
      const [ location, hasLocation] = await getLocation();
      fetchFact(location, hasLocation)
    })();
  }, []);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const results = state.healthCenters.filter((center: HealthCenter) => {
      if (e.target.value === '') return state.healthCenters
      return center.name.toLowerCase().includes(e.target.value.toLowerCase())
    })
    setState({
      ...state,
      query: e.target.value,
      list: results
    })
  }

  return (
    <div className="App">
      <form className={"form"}>
        <h1>aramak/يبحث</h1>
        <input type="search" placeholder={"sağlık merkezi adı/اسم المركز الصحي"} value={state.query} onChange={handleChange}/>
      </form>
      <div>
        <HealthCenterList list={state.list} hasGeolocation={state.hasGeolocation}></HealthCenterList>
      </div>
    </div>
  )
}

  export default App
