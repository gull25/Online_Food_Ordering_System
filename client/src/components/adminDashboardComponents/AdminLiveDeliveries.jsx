import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { socket, joinOrderRoom, leaveOrderRoom } from '../../helper/socket';

// Fix Leaflet default marker icon path issue with Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Haversine formula for distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const FitBounds = ({ activeOrder, riderPos }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = [];
    if (activeOrder?.restaurant?.location?.coordinates) {
      bounds.push([activeOrder.restaurant.location.coordinates[1], activeOrder.restaurant.location.coordinates[0]]);
    }
    if (activeOrder?.deliveryAddress?.lat && activeOrder?.deliveryAddress?.lng) {
      bounds.push([activeOrder.deliveryAddress.lat, activeOrder.deliveryAddress.lng]);
    }
    if (riderPos) bounds.push([riderPos.lat, riderPos.lng]);
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, activeOrder, riderPos]);
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

const AdminLiveDeliveries = () => {
  const { orders } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [riderPositions, setRiderPositions] = useState({});

  // Icons created with useMemo to avoid L initialization issues at module parse time
  const restaurantIcon = useMemo(() => new L.DivIcon({
    className: '',
    html: `<div style="width:24px;height:24px;background:#1c1b1f;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
             <span class="material-symbols-outlined" style="font-size:12px;color:white">restaurant</span>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }), []);

  const customerIcon = useMemo(() => new L.DivIcon({
    className: '',
    html: `<div style="width:24px;height:24px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #ae3200;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
             <span class="material-symbols-outlined" style="font-size:12px;color:#ae3200">home</span>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }), []);

  const riderIcon = useMemo(() => new L.DivIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:#ae3200;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 10px rgba(174,50,0,0.4)">
             <span class="material-symbols-outlined fill" style="font-size:16px;color:white">two_wheeler</span>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }), []);

  // Filter orders that are currently out for delivery with a rider assigned
  const liveOrders = orders.filter(o => o.status === 'Out For Delivery' && o.rider);

  // Automatically select the first live order if none is selected
  useEffect(() => {
    if (liveOrders.length > 0 && !activeOrderId) {
      setActiveOrderId(liveOrders[0]._id);
    } else if (liveOrders.length === 0) {
      setActiveOrderId(null);
    }
  }, [liveOrders.length, activeOrderId]);

  // Join socket rooms and listen for real-time rider locations
  useEffect(() => {
    if (!user?._id || liveOrders.length === 0) return;

    liveOrders.forEach(order => {
      joinOrderRoom(order._id);
      // Seed with last-known DB location
      if (order.rider?.currentLocation?.coordinates && !riderPositions[order._id]) {
        setRiderPositions(prev => ({
          ...prev,
          [order._id]: {
            lat: order.rider.currentLocation.coordinates[1],
            lng: order.rider.currentLocation.coordinates[0],
          },
        }));
      }
    });

    const handleLocation = (data) => {
      setRiderPositions(prev => ({
        ...prev,
        [data.orderId]: { lat: data.lat, lng: data.lng },
      }));
    };

    socket.on('rider:location', handleLocation);

    return () => {
      liveOrders.forEach(order => leaveOrderRoom(order._id));
      socket.off('rider:location', handleLocation);
    };
  }, [liveOrders.map(o => o._id).join(','), user?._id]);

  // Don't render the section at all if no live deliveries
  if (liveOrders.length === 0) return null;

  const activeOrder = liveOrders.find(o => o._id === activeOrderId);
  const activeRiderPos = activeOrder ? riderPositions[activeOrder._id] : null;

  // Build map coordinates
  const defaultCenter = [31.5204, 74.3587];
  const restaurantLoc = activeOrder?.restaurant?.location?.coordinates
    ? [activeOrder.restaurant.location.coordinates[1], activeOrder.restaurant.location.coordinates[0]]
    : null;
  const customerLoc = activeOrder?.deliveryAddress?.lat
    ? [activeOrder.deliveryAddress.lat, activeOrder.deliveryAddress.lng]
    : null;
  const riderLoc = activeRiderPos ? [activeRiderPos.lat, activeRiderPos.lng] : null;
  const center = restaurantLoc || riderLoc || customerLoc || defaultCenter;

  const routePoints = [];
  if (restaurantLoc) routePoints.push(restaurantLoc);
  if (riderLoc) routePoints.push(riderLoc);
  if (customerLoc) routePoints.push(customerLoc);

  // ETA Calculation
  let distanceKm = 0;
  let etaMin = 0;
  if (riderLoc && customerLoc) {
    distanceKm = getDistance(riderLoc[0], riderLoc[1], customerLoc[0], customerLoc[1]);
    etaMin = Math.round(distanceKm / 0.5); // avg speed 30 km/h = 0.5 km/min
  }

  // Lahore City Bounds (Widened to allow smooth panning)
  const lahoreBounds = [
    [31.0000, 73.8000],
    [32.0000, 74.9000]
  ];

  return (
    <section className="mb-stack_lg">
      <div className="bg-surface-container-lowest p-gutter rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <h3 className="font-h3 text-h3 text-on-surface font-bold mb-stack_md flex items-center gap-2">
          <span className="material-symbols-outlined text-primary animate-pulse">explore</span>
          Live Deliveries
          <span className="ml-auto text-xs font-label bg-primary/10 text-primary px-3 py-1 rounded-full">
            {liveOrders.length} active
          </span>
        </h3>

        <div className="flex flex-col lg:flex-row gap-gutter" style={{ height: '420px' }}>
          {/* Left Sidebar: Active Order List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-1">
            {liveOrders.map(order => (
              <div
                key={order._id}
                onClick={() => setActiveOrderId(order._id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                  activeOrderId === order._id
                    ? 'bg-primary/5 border-primary shadow-sm'
                    : 'bg-surface border-surface-variant hover:bg-surface-variant'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-button text-button font-bold">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-pulse" /> Live
                  </span>
                </div>
                <div className="text-small text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                  {order.deliveryAddress?.firstName || order.user?.name || 'Customer'}
                </div>
                <div className="text-small text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>two_wheeler</span>
                  {order.rider?.name || 'Rider'}
                </div>
                {riderPositions[order._id] && (
                  <div className="text-xs text-primary flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>my_location</span>
                    GPS Active
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Map Area */}
          <div className="w-full lg:w-2/3 h-full rounded-xl overflow-hidden border border-surface-variant relative">
            <MapContainer
              center={center}
              zoom={13}
              minZoom={11}
              maxBounds={lahoreBounds}
              maxBoundsViscosity={1.0}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapUpdater />
              <FitBounds activeOrder={activeOrder} riderPos={activeRiderPos} />

              {restaurantLoc && (
                <Marker position={restaurantLoc} icon={restaurantIcon}>
                  <Popup>{activeOrder?.restaurant?.name || 'Restaurant'}</Popup>
                </Marker>
              )}
              {customerLoc && (
                <Marker position={customerLoc} icon={customerIcon}>
                  <Popup>Deliver to: {activeOrder?.deliveryAddress?.streetAddress}</Popup>
                </Marker>
              )}
              {riderLoc && (
                <Marker position={riderLoc} icon={riderIcon}>
                  <Popup>Rider: {activeOrder?.rider?.name}</Popup>
                </Marker>
              )}
              {routePoints.length > 1 && (
                <Polyline
                  positions={routePoints}
                  pathOptions={{ color: '#ae3200', weight: 3, dashArray: '6, 6', opacity: 0.7 }}
                />
              )}
            </MapContainer>

            {/* ETA Overlay */}
            {riderLoc && customerLoc && (
              <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-surface-variant flex flex-col gap-0.5 pointer-events-none">
                <span className="font-label text-[10px] text-secondary uppercase tracking-wider">Est. Arrival</span>
                <span className="font-h3 text-h3 font-bold text-primary">
                  {etaMin > 0 ? `~${etaMin} min` : 'Arriving now'}
                </span>
                <span className="text-xs text-on-surface-variant">{distanceKm.toFixed(1)} km away</span>
              </div>
            )}

            {/* No location placeholder */}
            {!riderLoc && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow flex items-center gap-2 pointer-events-none">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>location_searching</span>
                <span className="text-xs text-on-surface-variant">Waiting for rider GPS...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminLiveDeliveries;
