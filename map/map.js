const TYPES = {
  DH: { label: 'Devlet Hastanesi', color: '#e8eaed' },
  ÖH: { label: 'Özel Hastane', color: '#ffcfc9' },
  POLİ: { label: 'Poliklinik', color: '#ffc8aa' },
  ASM: { label: 'Aile Sağlık Merkezi', color: '#ffe5a0' },
  GSM: { label: 'Göçmen Sağlık Merkezi', color: '#d4edbc' },
  TSM: { label: 'Toplum Sağlık Merkezi', color: '#bfe1f6' },
  ADM: { label: 'Müdürlük/Bakanlık', color: '#c6dbe1' },
  SHR: { label: 'Sahra Çadırı/Hastanesi', color: '#0a53a8' },
  SYR: { label: 'Seyyar Revir/Eczane', color: '#753800' },
  ECZ: { label: 'Eczane', color: '#b10202' },
  default: { label: '--', color: '#EA4335' },
};

const INACTIVE_COLOR = '#444';

const markers = [];
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

  healthCenters.forEach(({ activity_state, geolocation, type, ...props }) => {
    const [lat, lng] = geolocation.split(',');
    const color =
      activity_state !== 'Aktif' ? INACTIVE_COLOR : getTypeColor(type);
    const label = getTypeLabel(type);

    const center = {
      activity_state,
      color,
      label,
      type,
      lat: +lat,
      lng: +lng,
      ...props,
    };

    markers.push(createMarker(center, map, infoWindow));
  });
  new markerClusterer.MarkerClusterer({ map, markers });
}

function createMarker(center, map, infoWindow) {
  const {
    activity_state,
    address,
    label,
    last_updated,
    lat,
    lng,
    name,
    color,
    type
  } = center;

  const latLng = `${lat},${lng}`;
  const url = `https://www.google.com/maps/?q=${latLng}&ll=${latLng}&z=15`;
  const urlGetDirections = `https://www.google.com/maps?saddr=My+Location&daddr=${latLng}`;
  const lastUpdateDate = new Date(last_updated);
  console.log(type);
  const image = {
    url: `./images/${activity_state === 'Aktif' ? (type ?? 'default') : 'unactive'}.png`,
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(30, 30),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(15, 15),
  };

  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
    icon: image,
    title: name,
  });

  marker.addListener('click', () => {
    infoWindow.close();

    infoWindow.setContent(`
          <div class="infoWindow">
            <h2 class="infoWindow__title">${name}</h2>
            <div class="infoWindow__state-section">
              Durum:
              <span class="infoWindow__state ${
                activity_state === 'Aktif' && 'infoWindow__state--active'
              }"> ${activity_state}</span>
              <span class="infoWindow__type">(${label})</span>
              </div>
              <div class="infoWindow__lastUpdated">(Son güncelleme: ${lastUpdateDate.toLocaleString()})</div>
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
  return marker;
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
