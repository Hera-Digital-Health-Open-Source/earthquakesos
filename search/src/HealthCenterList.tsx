import { HealthCenter } from './HealthCenter';
import { getTypeLabel } from './Types';

function HealthCenterList({list, hasGeolocation}: { list: HealthCenter[], hasGeolocation: boolean }) {
  return (
    <>
      {(list.sort((a: HealthCenter, b: HealthCenter) => a.distance - b.distance).map((center: HealthCenter, index) => {
          const latLng = `${center.lat},${center.lng}`;
          const url = `https://www.google.com/maps/?q=${latLng}&ll=${latLng}&z=15`;
          const urlGetDirections = `https://www.google.com/maps?saddr=My+Location&daddr=${latLng}`;
          const distance = hasGeolocation ? `(${Math.round(center.distance)}km)` : '';
          const label = getTypeLabel(center.type);
          return (
            <div key={center.name + index + 'separator'}>
              <hr className={'separator'}></hr>
              <div className={'healthcenter-container'}>
                <div className={'healthcenter-info'}>
                  <h4 className={'title'}>{center.name} {label} {distance}</h4>
                  <p className={'address'}>{center.address}</p>
                </div>
                <div className={'buttons'}>
                  <a className="button" href={url} target="_blank">
                    Google Haritalarda Aç
                  </a>
                  <a className="button" href={urlGetDirections} target="_blank">
                    Yol Tarifi
                  </a></div>
              </div>
            </div>
          );
        })
      )}
    </>);
}

export default HealthCenterList;