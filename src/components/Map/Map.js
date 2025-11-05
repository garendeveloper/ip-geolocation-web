import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMap({ geoData }) {
  if (!geoData || !geoData.loc) {
    return (
      <div className="map-container no-map">
        <p>No location data available to display map</p>
      </div>
    );
  }

  const coordinates = geoData.loc.split(',').map(coord => parseFloat(coord));
  const [lat, lng] = coordinates;

  // Validate coordinates
  if (isNaN(lat) || isNaN(lng)) {
    return (
      <div className="map-container no-map">
        <p>Invalid coordinates for map display</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <h3>Location Map</h3>
      <MapContainer 
        center={[lat, lng]} 
        zoom={13} 
        style={{ height: '400px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div>
              <strong>{geoData.ip}</strong>
              <br />
              {geoData.city && `${geoData.city}, `}
              {geoData.region && `${geoData.region}, `}
              {geoData.country}
              <br />
              <em>Coordinates: {geoData.loc}</em>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default LocationMap;