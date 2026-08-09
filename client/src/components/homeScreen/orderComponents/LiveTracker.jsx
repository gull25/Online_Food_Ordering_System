import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Icon from '../../common/Icon';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { socket } from '../../../helper/socket';
import { fetchRoute, haversineMetres } from '../../../helper/osrm';
import useAnimatedMarker from '../../../helper/useAnimatedMarker';
import { iconMarkup } from '../../../helper/mapIconMarkup';

// Fix Leaflet default marker icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Fixes Leaflet tile shredding on layout resizes
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

// Fits the map bounds to the route whenever the coords change
const FitRoute = ({ coords, riderPos }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 1) {
      map.fitBounds(coords, { padding: [60, 60], maxZoom: 16 });
    } else if (riderPos) {
      map.setView([riderPos.lat, riderPos.lng], 15);
    }
  }, [map, coords, riderPos]);
  return null;
};

// Custom DivIcons
const makeIcon = (html, size) =>
  new L.DivIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

const LiveTracker = ({
  orderId,
  restaurantLocation,
  customerLocation,
  initialRiderLocation,
  isRiderView = false,
}) => {
  const [riderTarget, setRiderTarget] = useState(initialRiderLocation || null);
  const { animatedPos: riderPos, isStale } = useAnimatedMarker(riderTarget);

  const [routeCoords, setRouteCoords] = useState(null);   // [[lat,lng], ...]
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [routeError, setRouteError] = useState(false);

  // Track the last position at which we fetched a route (throttle recalcs)
  const lastRouteFetchPos = useRef(null);
  const RECALC_DISTANCE_M = 30; // only refetch route after rider moves 30 m

  // Parse coordinate helpers
  const restaurantPos = useMemo(() => {
    if (restaurantLocation?.coordinates) {
      return { lat: restaurantLocation.coordinates[1], lng: restaurantLocation.coordinates[0] };
    }
    return null;
  }, [restaurantLocation]);

  const customerPos = useMemo(() => {
    if (customerLocation?.lat && customerLocation?.lng) {
      return { lat: customerLocation.lat, lng: customerLocation.lng };
    }
    return null;
  }, [customerLocation]);

  // Listen for live rider GPS from socket
  useEffect(() => {
    if (!orderId) return;
    const handleLocation = (data) => {
      if (data.orderId === orderId || data.orderId?.toString() === orderId) {
        setRiderTarget({ lat: data.lat, lng: data.lng });
      }
    };
    socket.on('rider:location', handleLocation);
    return () => socket.off('rider:location', handleLocation);
  }, [orderId]);

  // Recalculate OSRM route whenever rider moves > RECALC_DISTANCE_M
  const calcRoute = useCallback(async (from, to) => {
    if (!from || !to) return;
    setRouteError(false);
    try {
      const result = await fetchRoute(from, to);
      setRouteCoords(result.coords);
      setDistance(result.distance);
      setDuration(result.duration);
      lastRouteFetchPos.current = from;
    } catch (err) {
      console.warn('[LiveTracker] OSRM route fetch failed:', err.message);
      setRouteError(true);
      // Fallback: straight line between the two points
      setRouteCoords([[from.lat, from.lng], [to.lat, to.lng]]);
    }
  }, []);

  // Determine routing: rider → customer (customer view) or rider → restaurant/customer (rider view)
  const routeDestination = customerPos;
  const routeOrigin = riderPos || restaurantPos;

  useEffect(() => {
    if (!routeOrigin || !routeDestination) return;

    const moved = haversineMetres(lastRouteFetchPos.current, routeOrigin);
    if (moved < RECALC_DISTANCE_M && lastRouteFetchPos.current !== null) return;

    calcRoute(routeOrigin, routeDestination);
  }, [riderPos?.lat, riderPos?.lng, routeOrigin, routeDestination, calcRoute]);

  // Initial route on mount
  useEffect(() => {
    if (routeOrigin && routeDestination) {
      calcRoute(routeOrigin, routeDestination);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Icons
  const restaurantIcon = useMemo(() => makeIcon(
    `<div style="width:32px;height:32px;background:#1c1b1f;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)">
       ${iconMarkup('restaurant', { size: 16, color: 'white' })}
     </div>`, 32
  ), []);

  const customerIcon = useMemo(() => makeIcon(
    `<div style="width:32px;height:32px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #ae3200;box-shadow:0 2px 8px rgba(0,0,0,0.25)">
       ${iconMarkup('home', { size: 16, color: '#ae3200' })}
     </div>`, 32
  ), []);

  const riderIcon = useMemo(() => makeIcon(
    `<div style="width:44px;height:44px;background:#ae3200;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid white;box-shadow:0 4px 14px rgba(174,50,0,0.45)">
       ${iconMarkup('two_wheeler_filled', { size: 22, color: 'white' })}
     </div>`, 44
  ), []);

  const defaultCenter = [31.5204, 74.3587];
  const center = riderPos
    ? [riderPos.lat, riderPos.lng]
    : restaurantPos
    ? [restaurantPos.lat, restaurantPos.lng]
    : defaultCenter;

  return (
    <div className="relative w-full h-full z-0">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizer />
        <FitRoute coords={routeCoords} riderPos={riderPos} />

        {/* Real-road route polyline */}
        {routeCoords && routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#ae3200',
              weight: 5,
              opacity: 0.75,
              lineJoin: 'round',
              lineCap: 'round',
              // Show dashed when it's a fallback straight line
              ...(routeError ? { dashArray: '10, 8' } : {}),
            }}
          />
        )}

        {/* Restaurant marker */}
        {restaurantPos && (
          <Marker position={[restaurantPos.lat, restaurantPos.lng]} icon={restaurantIcon}>
            <Popup className="font-button text-small">
              <strong>Restaurant</strong>
            </Popup>
          </Marker>
        )}

        {/* Customer / Delivery marker */}
        {customerPos && (
          <Marker position={[customerPos.lat, customerPos.lng]} icon={customerIcon}>
            <Popup className="font-button text-small">
              <strong>Delivery Address</strong>
            </Popup>
          </Marker>
        )}

        {/* Animated Rider marker */}
        {riderPos && (
          <Marker position={[riderPos.lat, riderPos.lng]} icon={riderIcon}>
            <Popup className="font-button text-small">
              <strong>Rider</strong>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ETA Overlay — bottom left */}
      {distance && duration && (
        <div className="absolute bottom-4 left-4 z-[500] bg-surface-container-lowest/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-outline-variant/30 pointer-events-none animate-in slide-in-from-bottom-4">
          <p className="font-label text-[11px] text-secondary uppercase tracking-widest mb-1">
            {isRiderView ? 'To Destination' : 'Rider ETA'}
          </p>
          <div className="flex items-end gap-3">
            <span className="font-h3 text-h3 font-bold text-primary">{duration}</span>
            <span className="font-body text-small text-on-surface-variant mb-0.5">({distance})</span>
          </div>
        </div>
      )}

      {/* Signal Lost badge */}
      {isStale && riderPos && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-error/90 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-button text-small animate-in slide-in-from-top-4 pointer-events-none">
          <Icon name="wifi_off" className="text-base" />
          Signal Lost — GPS not updating
        </div>
      )}

      {/* Waiting for GPS badge (no rider position yet) */}
      {!riderPos && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] bg-surface-container-lowest/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-outline-variant/30 flex items-center gap-2 pointer-events-none">
          <Icon name="location_searching" className="text-primary animate-pulse text-xl" />
          <span className="font-button text-small text-on-surface font-bold tracking-wide">
            Waiting for rider GPS…
          </span>
        </div>
      )}

      {/* Route error notice */}
      {routeError && (
        <div className="absolute top-4 right-4 z-[500] bg-warning/10 border border-warning/30 text-warning-content px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 pointer-events-none">
          <Icon name="alt_route" className="text-sm" />
          Showing approximate path
        </div>
      )}
    </div>
  );
};

export default LiveTracker;
