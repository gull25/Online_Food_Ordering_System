import React, { useEffect, useMemo } from 'react';
import { iconMarkup } from '../../../helper/mapIconMarkup';
import Icon from '../../common/Icon';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically fit bounds of the map to include all pins
const FitBounds = ({ restaurantLoc, customerLoc, riderLoc }) => {
  const map = useMap();

  useEffect(() => {
    const bounds = [];
    if (restaurantLoc) bounds.push(restaurantLoc);
    if (customerLoc) bounds.push(customerLoc);
    if (riderLoc) bounds.push(riderLoc);

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, restaurantLoc, customerLoc, riderLoc]);

  return null;
};

// Fixes Leaflet's gray "shredding" tiles bug caused by flexbox/grid layout resizes
const MapUpdater = () => {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
};

const OrderMap = ({ restaurantLocation, customerLocation, riderLocation, restaurantName }) => {
  const defaultCenter = [31.5204, 74.3587]; // Default to Lahore

  // Custom Icons — created inside component to ensure L is initialized
  const restaurantIcon = useMemo(() => new L.DivIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:#1c1b1f;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
             ${iconMarkup('restaurant', { size: 16, color: 'white' })}
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }), []);

  const customerIcon = useMemo(() => new L.DivIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #ae3200;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
             ${iconMarkup('home', { size: 16, color: '#ae3200' })}
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }), []);

  const riderIcon = useMemo(() => new L.DivIcon({
    className: '',
    html: `<div style="width:40px;height:40px;background:#ae3200;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 12px rgba(174,50,0,0.4)">
             ${iconMarkup('two_wheeler_filled', { size: 20, color: 'white' })}
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  }), []);

  // Format coordinates for Leaflet ([lat, lng])
  const restaurantLoc = restaurantLocation?.coordinates
    ? [restaurantLocation.coordinates[1], restaurantLocation.coordinates[0]] // GeoJSON is [lng, lat]
    : null;

  const customerLoc = customerLocation?.lat && customerLocation?.lng
    ? [customerLocation.lat, customerLocation.lng]
    : null;

  const riderLoc = riderLocation?.lat && riderLocation?.lng
    ? [riderLocation.lat, riderLocation.lng]
    : null;

  const center = restaurantLoc || customerLoc || defaultCenter;

  // Build the route polyline points
  const routePoints = [];
  if (restaurantLoc) routePoints.push(restaurantLoc);
  if (riderLoc) routePoints.push(riderLoc); // Connect rider to the middle of the route
  if (customerLoc) routePoints.push(customerLoc);

  // Lahore City Bounds (Widened to allow smooth panning)
  const lahoreBounds = [
    [31.0000, 73.8000], // South-West limit
    [32.0000, 74.9000]  // North-East limit
  ];

  return (
    <div className="flex-grow w-full relative min-h-[300px] lg:h-full z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        minZoom={11}
        maxBounds={lahoreBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%', zIndex: 0 }} 
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater />
        <FitBounds restaurantLoc={restaurantLoc} customerLoc={customerLoc} riderLoc={riderLoc} />

        {restaurantLoc && (
          <Marker position={restaurantLoc} icon={restaurantIcon}>
            <Popup className="font-button text-small">
              <strong>{restaurantName || 'Restaurant'}</strong>
            </Popup>
          </Marker>
        )}

        {customerLoc && (
          <Marker position={customerLoc} icon={customerIcon}>
            <Popup className="font-button text-small">
              <strong>Delivery Address</strong>
            </Popup>
          </Marker>
        )}

        {riderLoc && (
          <Marker position={riderLoc} icon={riderIcon}>
            <Popup className="font-button text-small">
              <strong>Rider</strong>
            </Popup>
          </Marker>
        )}

        {/* Dashed line representing the route */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: '#ae3200', weight: 4, dashArray: '8, 8', opacity: 0.6 }}
          />
        )}
      </MapContainer>

      {/* No locations placeholder */}
      {!restaurantLoc && !customerLoc && !riderLoc && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
          <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2 shadow-md">
            <Icon name="location_off" className="text-secondary" />
            <span className="font-label text-label text-on-surface-variant">Location data unavailable</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderMap;
