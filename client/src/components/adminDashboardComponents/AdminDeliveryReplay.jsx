import React, { useEffect, useState, useMemo, useRef } from 'react';
import { iconMarkup } from '../../helper/mapIconMarkup';
import Icon from '../common/Icon';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fixes Leaflet's gray "shredding" tiles bug
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

// Component to fit bounds to the entire route
const FitBounds = ({ routePoints }) => {
  const map = useMap();
  useEffect(() => {
    if (routePoints && routePoints.length > 0) {
      const bounds = routePoints.map(p => [p.lat, p.lng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, routePoints]);
  return null;
};

const AdminDeliveryReplay = ({ order, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const playbackIntervalRef = useRef(null);

  const routeHistory = order?.routeHistory || [];

  // Custom Icons
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
    html: `<div style="width:36px;height:36px;background:#ae3200;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 10px rgba(174,50,0,0.4)">
             ${iconMarkup('two_wheeler', { size: 20, color: 'white' })}
           </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }), []);

  // Stats calculation
  const stats = useMemo(() => {
    if (routeHistory.length < 2) return { distance: 0, duration: 0, speed: 0 };

    let totalDistanceMeters = 0;
    for (let i = 1; i < routeHistory.length; i++) {
      const p1 = L.latLng(routeHistory[i - 1].lat, routeHistory[i - 1].lng);
      const p2 = L.latLng(routeHistory[i].lat, routeHistory[i].lng);
      totalDistanceMeters += p1.distanceTo(p2);
    }

    const startTime = new Date(routeHistory[0].timestamp).getTime();
    const endTime = new Date(routeHistory[routeHistory.length - 1].timestamp).getTime();
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    const distanceKm = (totalDistanceMeters / 1000).toFixed(2);
    const speed = durationHours > 0 ? (distanceKm / durationHours).toFixed(1) : 0;

    return { distance: distanceKm, duration: durationMinutes, speed };
  }, [routeHistory]);

  // Playback engine
  useEffect(() => {
    if (isPlaying && currentIndex < routeHistory.length - 1) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= routeHistory.length - 1) {
            clearInterval(playbackIntervalRef.current);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500); // Update every 500ms
    }

    return () => clearInterval(playbackIntervalRef.current);
  }, [isPlaying, currentIndex, routeHistory.length]);

  const togglePlayback = () => {
    if (currentIndex >= routeHistory.length - 1) {
      setCurrentIndex(0); // Restart
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const val = parseInt(e.target.value, 10);
    setCurrentIndex(val);
    if (val === routeHistory.length - 1) {
      setIsPlaying(false);
    }
  };

  if (!routeHistory || routeHistory.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-6 shadow-2xl">
          <h3 className="text-h3 font-bold text-on-surface mb-2">Delivery Playback</h3>
          <p className="text-on-surface-variant">No route history available for this order.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl">Close</button>
        </div>
      </div>
    );
  }

  const restaurantLoc = order.restaurant?.location?.coordinates
    ? [order.restaurant.location.coordinates[1], order.restaurant.location.coordinates[0]]
    : null;
  const customerLoc = order.deliveryAddress?.lat && order.deliveryAddress?.lng
    ? [order.deliveryAddress.lat, order.deliveryAddress.lng]
    : null;

  const currentRiderPos = [routeHistory[currentIndex].lat, routeHistory[currentIndex].lng];
  const fullPath = routeHistory.map(p => [p.lat, p.lng]);
  const traveledPath = fullPath.slice(0, currentIndex + 1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest max-w-5xl w-full h-[85vh] rounded-2xl border border-outline-variant/30 shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="history" className="text-primary" />
            </div>
            <div>
              <h3 className="font-h3 text-h3 font-bold text-on-surface leading-tight">Delivery Playback</h3>
              <p className="text-xs text-on-surface-variant font-label">Order #{order._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close delivery replay" className="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center text-secondary transition-colors">
            <Icon name="close" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x divide-outline-variant/20 border-b border-outline-variant/20 bg-surface">
          <div className="px-6 py-3 flex flex-col">
            <span className="text-xs text-secondary font-label uppercase tracking-wider">Total Distance</span>
            <span className="font-bold text-on-surface text-lg">{stats.distance} km</span>
          </div>
          <div className="px-6 py-3 flex flex-col">
            <span className="text-xs text-secondary font-label uppercase tracking-wider">Duration</span>
            <span className="font-bold text-on-surface text-lg">{stats.duration} min</span>
          </div>
          <div className="px-6 py-3 flex flex-col">
            <span className="text-xs text-secondary font-label uppercase tracking-wider">Avg Speed</span>
            <span className="font-bold text-on-surface text-lg">{stats.speed} km/h</span>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative z-0">
          <MapContainer center={currentRiderPos} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater />
            <FitBounds routePoints={routeHistory} />

            {/* Ghost Path (Full Route) */}
            <Polyline positions={fullPath} color="#1c1b1f" weight={4} opacity={0.2} dashArray="8, 8" />

            {/* Traveled Path */}
            <Polyline positions={traveledPath} color="#ae3200" weight={5} opacity={0.8} />

            {restaurantLoc && (
              <Marker position={restaurantLoc} icon={restaurantIcon}>
                <Popup className="font-body"><strong>{order.restaurant?.name}</strong><br />Pickup Location</Popup>
              </Marker>
            )}

            {customerLoc && (
              <Marker position={customerLoc} icon={customerIcon}>
                <Popup className="font-body"><strong>Customer</strong><br />Dropoff Location</Popup>
              </Marker>
            )}

            <Marker position={currentRiderPos} icon={riderIcon}>
              <Popup className="font-body">Rider Timestamp: {new Date(routeHistory[currentIndex].timestamp).toLocaleTimeString()}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Playback Controls */}
        <div className="px-6 py-4 bg-surface border-t border-outline-variant/20 flex items-center gap-4">
          <button
            onClick={togglePlayback}
            className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 shadow-md transition-opacity shrink-0"
          >
            <Icon name={isPlaying ? 'pause' : (currentIndex >= routeHistory.length - 1 ? 'replay' : 'play_arrow')} className="text-[24px]" />
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <input
              type="range"
              min="0"
              max={routeHistory.length - 1}
              value={currentIndex}
              onChange={handleSeek}
              className="w-full accent-primary h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-secondary font-label mt-1">
              <span>{new Date(routeHistory[0].timestamp).toLocaleTimeString()}</span>
              <span>{new Date(routeHistory[currentIndex].timestamp).toLocaleTimeString()}</span>
              <span>{new Date(routeHistory[routeHistory.length - 1].timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDeliveryReplay;
