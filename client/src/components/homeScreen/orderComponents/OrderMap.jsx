import React, { useEffect, useMemo, useState } from 'react';
import { iconMarkup } from '../../../helper/mapIconMarkup';
import Icon from '../../common/Icon';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchRoute } from '../../../helper/osrm';

// Fix Leaflet default marker icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Fit map to all visible pins once
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

// Fixes Leaflet's gray tile shredding bug on resize
const MapUpdater = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

const OrderMap = ({ restaurantLocation, customerLocation, riderLocation, restaurantName }) => {
  const defaultCenter = [31.5204, 74.3587]; // Lahore

  // OSRM road route state
  const [routeCoords, setRouteCoords] = useState(null); // [[lat, lng], ...]
  const [routeError, setRouteError] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Custom marker icons
  const restaurantIcon = useMemo(
    () =>
      new L.DivIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:#1c1b1f;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
                 ${iconMarkup('restaurant', { size: 16, color: 'white' })}
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    []
  );

  const customerIcon = useMemo(
    () =>
      new L.DivIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #ae3200;box-shadow:0 2px 8px rgba(0,0,0,0.25)">
                 ${iconMarkup('home', { size: 16, color: '#ae3200' })}
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    []
  );

  const riderIcon = useMemo(
    () =>
      new L.DivIcon({
        className: '',
        html: `<div style="width:40px;height:40px;background:#ae3200;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 12px rgba(174,50,0,0.4)">
                 ${iconMarkup('two_wheeler_filled', { size: 20, color: 'white' })}
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    []
  );

  // Convert GeoJSON / raw coordinates to Leaflet [lat, lng]
  const restaurantLoc = restaurantLocation?.coordinates
    ? [restaurantLocation.coordinates[1], restaurantLocation.coordinates[0]]
    : null;

  const customerLoc =
    customerLocation?.lat && customerLocation?.lng
      ? [customerLocation.lat, customerLocation.lng]
      : null;

  const riderLoc =
    riderLocation?.lat && riderLocation?.lng
      ? [riderLocation.lat, riderLocation.lng]
      : null;

  const center = restaurantLoc || customerLoc || defaultCenter;

  // Fetch road route (restaurant → customer, or rider → customer) once on mount/change
  useEffect(() => {
    const origin = riderLoc
      ? { lat: riderLoc[0], lng: riderLoc[1] }
      : restaurantLoc
      ? { lat: restaurantLoc[0], lng: restaurantLoc[1] }
      : null;

    const destination = customerLoc
      ? { lat: customerLoc[0], lng: customerLoc[1] }
      : null;

    if (!origin || !destination) return;

    setIsLoadingRoute(true);
    setRouteError(false);

    fetchRoute(origin, destination)
      .then((result) => {
        setRouteCoords(result.coords);
      })
      .catch((err) => {
        console.warn('[OrderMap] OSRM fetch failed:', err.message);
        setRouteError(true);
        // Fallback: straight line
        setRouteCoords([[origin.lat, origin.lng], [destination.lat, destination.lng]]);
      })
      .finally(() => setIsLoadingRoute(false));
  }, [
    restaurantLoc?.[0], restaurantLoc?.[1],
    customerLoc?.[0], customerLoc?.[1],
    riderLoc?.[0], riderLoc?.[1],
  ]);

  return (
    <div className="flex-grow w-full relative min-h-[300px] lg:h-full z-0">
      <MapContainer
        center={center}
        zoom={13}
        minZoom={11}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater />
        <FitBounds
          restaurantLoc={restaurantLoc}
          customerLoc={customerLoc}
          riderLoc={riderLoc}
        />

        {/* Real-road route polyline from OSRM */}
        {routeCoords && routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#ae3200',
              weight: 4,
              opacity: 0.65,
              lineJoin: 'round',
              lineCap: 'round',
              // Dashed only when it's an error fallback (straight line)
              ...(routeError ? { dashArray: '8, 8' } : {}),
            }}
          />
        )}

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
      </MapContainer>

      {/* Route loading spinner */}
      {isLoadingRoute && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-surface-container-lowest/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2 pointer-events-none">
          <Icon name="sync" className="text-primary animate-spin text-sm" />
          <span className="font-label text-[12px] text-on-surface-variant">Loading route…</span>
        </div>
      )}

      {/* Route error notice */}
      {routeError && !isLoadingRoute && (
        <div className="absolute top-3 right-3 z-[400] bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 pointer-events-none">
          <Icon name="alt_route" className="text-secondary text-sm" />
          <span className="font-label text-[11px] text-secondary">Approximate path</span>
        </div>
      )}

      {/* No location data placeholder */}
      {!restaurantLoc && !customerLoc && !riderLoc && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
          <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2 shadow-md">
            <Icon name="location_off" className="text-secondary" />
            <span className="font-label text-label text-on-surface-variant">
              Location data unavailable
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderMap;
