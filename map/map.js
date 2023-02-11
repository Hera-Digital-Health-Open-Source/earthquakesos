const TYPES = {
  DH: { label: 'DH', color: '#e8eaed' },
  OH: { label: 'ÖH', color: '#ffcfc9' },
  POLI: { label: 'POLİ', color: '#ffc8aa' },
  ASM: { label: 'ASM', color: '#ffe5a0' },
  GSM: { label: 'GSM', color: '#d4edbc' },
  TSM: { label: 'TSM', color: '#bfe1f6' },
  ADM: { label: 'ADM', color: '#c6dbe1' },
  SHR: { label: 'SHR', color: '#0a53a8' },
  SYR: { label: 'SYR', color: '#753800' },
  ECZ: { label: 'ECZ', color: '#b10202' },
  default: { label: '--', color: '#EA4335' },
};

const getHealthCenters = async () => {
  const response = await fetch(
    'https://herav2-web-service.production-turkey.herav2.heradigitalhealth.com/health_centers/'
  );
  return response.json();
};

const getLocation = async () => {
  const defaultPosition = { lat: 37.1768562341751, lng: 37.01209105546673 };

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
          resolve([defaultPosition, false]);
        }
      );
    });
  }
  return [defaultPosition, false];
};

function getTypeColor(type) {
  return TYPES[type]?.color ?? TYPES.default.color;
}

function getTypeLabel(type) {
  return TYPES[type]?.label ?? TYPES.default.label;
}

function displayHealthCentersOnMap(healthCenters, map) {
  const infoWindow = new google.maps.InfoWindow();

  healthCenters.forEach(({ geolocation, type, ...props }) => {
    const [lat, lng] = geolocation.split(',');
    const color = getTypeColor(type);
    const label = getTypeLabel(type);

    const center = {
      color,
      label,
      lat: +lat,
      lng: +lng,
      ...props,
    };

    createMarker(center, map, infoWindow);
  });
}

function createMarker(center, map, infoWindow) {
  const { address, label, lat, lng, name, color } = center;

  const latLng = `${lat},${lng}`;
  const url = `https://www.google.com/maps/?q=${latLng}&ll=${latLng}&z=15`;
  const urlGetDirections = `https://www.google.com/maps?saddr=My+Location&daddr=${latLng}`;

  const svgMarker = {
    // path: 'M -1.53 11.933 z M 0 0 q 2.906 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z',
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.8,
    strokeColor: color,
    strokeWeight: 2,
    strokeOpacity: 1,
    rotation: 0,
    scale: 12,
    anchor: new google.maps.Point(0, 0),
    labelOrigin: new google.maps.Point(0, 0),
  };

  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
    icon: svgMarker,
    title: name,
  });

  marker.addListener('click', () => {
    infoWindow.close();

    infoWindow.setContent(`
          <div class="infoWindow">
            <h2 class="infoWindow__title">${name} (${label})</h2>
            <p class="infoWindow__address">${address}</p>
            <div class="infoWindow__buttons">
                <a class="infoWindow__button" href="${url}" target="_blank">
                  Google Haritalarda Aç
                </a>
                <a class="infoWindow__button" href="${urlGetDirections}" target="_blank">
                  Yol Tarifi
                </a>
            </div>
          </div>
        `);

    infoWindow.open(marker.getMap(), marker);
  });
}

function displayUserPin(map, coordinates) {
  const svgMarker = {
    path: 'M -1.53 11.933 z M 0 0 q 2.906 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z',
    fillColor: 'blue',
    fillOpacity: 0.6,
    strokeWeight: 0,
    rotation: 0,
    scale: 2,
    anchor: new google.maps.Point(0, 20),
  };

  new google.maps.Marker({
    position: coordinates,
    icon: svgMarker,
    map,
  });
}

async function initMap(healCenterGetaway) {
  const [coordinates, isUserPosition] = await getLocation();

  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: coordinates,
  });

  if (isUserPosition) {
    displayUserPin(map, coordinates);
  }

  const healthCenters = await healCenterGetaway();
  displayHealthCentersOnMap(healthCenters, map);
}

window.init = () => {
  initMap(getHealthCenters);
};