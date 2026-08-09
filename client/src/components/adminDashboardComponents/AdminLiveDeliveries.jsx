import React, { useState, useEffect, useMemo, useRef } from 'react';
import { iconMarkup } from '../../helper/mapIconMarkup';
import Icon from '../common/Icon';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { socket, joinOrderRoom, leaveOrderRoom } from '../../helper/socket';
import { ORDER_STATUS } from '../../constants/orderStatus';
import { fetchRoute, haversineMetres } from '../../helper/osrm';
import useAnimatedMarker from '../../helper/useAnimatedMarker';

// Fix Leaflet default marker icon path issue with Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Frames the map on the selected delivery once per order selection.
 * Does NOT re-run on every GPS ping so the admin can pan/zoom freely.
 */
const FitBounds = ({ activeOrder }) => {
  const map = useMap();
  const orderId = activeOrder?._id;

  useEffect(() => {
    const bounds = [];
    if (activeOrder?.restaurant?.location?.coordinates) {
      bounds.push([
        activeOrder.restaurant.location.coordinates[1],
        activeOrder.restaurant.location.coordinates[0],
      ]);
    }
    if (activeOrder?.deliveryAddress?.lat && activeOrder?.deliveryAddress?.lng) {
      bounds.push([activeOrder.deliveryAddress.lat, activeOrder.deliveryAddress.lng]);
    }
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, orderId]);

  return null;
};

const MapUpdater = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Inner map panel — receives the active order and rider positions map
// ─────────────────────────────────────────────────────────────────────────────
const LiveMap = ({ activeOrder, riderPositions }) => {
  const rawRiderTarget = activeOrder ? riderPositions[activeOrder._id] : null;
  const { animatedPos: riderPos, isStale } = useAnimatedMarker(rawRiderTarget || null);

  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });
  const [routeError, setRouteError] = useState(false);
  const lastFetchPos = useRef(null);
  const RECALC_M = 30;

  const restaurantLoc = activeOrder?.restaurant?.location?.coordinates
    ? [
        activeOrder.restaurant.location.coordinates[1],
        activeOrder.restaurant.location.coordinates[0],
      ]
    : null;

  const customerLoc =
    activeOrder?.deliveryAddress?.lat
      ? [activeOrder.deliveryAddress.lat, activeOrder.deliveryAddress.lng]
      : null;

  const riderLoc = riderPos ? [riderPos.lat, riderPos.lng] : null;

  const restaurantIcon = useMemo(
    () =>
      new L.DivIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:#1c1b1f;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
                 ${iconMarkup('restaurant', { size: 12, color: 'white' })}
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    []
  );

  const customerIcon = useMemo(
    () =>
      new L.DivIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #ae3200;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
                 ${iconMarkup('home', { size: 12, color: '#ae3200' })}
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    []
  );

  const riderIcon = useMemo(
    () =>
      new L.DivIcon({
        className: '',
        html: `<div style="width:36px;height:36px;background:#ae3200;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 10px rgba(174,50,0,0.4)">
                 ${iconMarkup('two_wheeler_filled', { size: 18, color: 'white' })}
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      }),
    []
  );

  const defaultCenter = [31.5204, 74.3587];
  const center = restaurantLoc || riderLoc || customerLoc || defaultCenter;

  // OSRM route: rider → customer, throttled at RECALC_M metres
  useEffect(() => {
    const origin = riderPos || (restaurantLoc ? { lat: restaurantLoc[0], lng: restaurantLoc[1] } : null);
    const dest = customerLoc ? { lat: customerLoc[0], lng: customerLoc[1] } : null;
    if (!origin || !dest) return;

    const moved = haversineMetres(lastFetchPos.current, origin);
    if (moved < RECALC_M && lastFetchPos.current !== null) return;

    fetchRoute(origin, dest)
      .then((result) => {
        setRouteCoords(result.coords);
        setRouteInfo({ distance: result.distance, duration: result.duration });
        setRouteError(false);
        lastFetchPos.current = origin;
      })
      .catch(() => {
        setRouteError(true);
        if (origin && dest) {
          setRouteCoords([[origin.lat, origin.lng], [dest.lat, dest.lng]]);
        }
      });
  }, [riderPos?.lat, riderPos?.lng, activeOrder?._id]);

  // Initial fetch on order change
  useEffect(() => {
    lastFetchPos.current = null;
    setRouteCoords(null);
    setRouteInfo({ distance: '', duration: '' });
  }, [activeOrder?._id]);

  const lahoreBounds = [[31.0, 73.8], [32.0, 74.9]];

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        minZoom={11}
        maxBounds={lahoreBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater />
        <FitBounds activeOrder={activeOrder} />

        {/* Real-road route polyline */}
        {routeCoords && routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#ae3200',
              weight: 4,
              opacity: 0.7,
              lineJoin: 'round',
              lineCap: 'round',
              ...(routeError ? { dashArray: '8, 8' } : {}),
            }}
          />
        )}

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
      </MapContainer>

      {/* OSRM ETA Overlay */}
      {routeInfo.duration && (
        <div className="absolute top-3 right-3 z-[400] bg-surface-container-lowest/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-surface-variant flex flex-col gap-0.5 pointer-events-none">
          <span className="font-label text-[11px] text-secondary uppercase tracking-wider">Est. Arrival</span>
          <span className="font-h3 text-h3 font-bold text-primary">{routeInfo.duration}</span>
          <span className="text-xs text-on-surface-variant">{routeInfo.distance}</span>
        </div>
      )}

      {/* Signal Lost badge */}
      {isStale && riderLoc && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-error/90 text-white px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 font-label text-[12px] pointer-events-none">
          <Icon name="wifi_off" className="text-sm" />
          Signal Lost
        </div>
      )}

      {/* Waiting for GPS */}
      {!riderLoc && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-surface-container-lowest/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-outline-variant/30 flex items-center gap-2 pointer-events-none">
          <Icon name="location_searching" className="text-primary animate-pulse text-xl" />
          <span className="font-inter text-sm font-bold text-on-surface tracking-wide">
            Waiting for rider GPS…
          </span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main AdminLiveDeliveries component
// ─────────────────────────────────────────────────────────────────────────────
const AdminLiveDeliveries = () => {
  const { orders } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [riderPositions, setRiderPositions] = useState({});

  const liveOrders = useMemo(
    () => orders.filter((o) => o.status === ORDER_STATUS.OUT_FOR_DELIVERY && o.rider),
    [orders]
  );

  const liveOrderIdsKey = liveOrders.map((o) => o._id).join(',');

  // Auto-select first live order
  useEffect(() => {
    if (liveOrders.length > 0 && !activeOrderId) {
      setActiveOrderId(liveOrders[0]._id);
    } else if (liveOrders.length === 0) {
      setActiveOrderId(null);
    }
  }, [liveOrders.length, activeOrderId]);

  // Socket: join rooms + listen for rider location updates
  useEffect(() => {
    if (!user?._id || liveOrders.length === 0) return;

    const joinedIds = liveOrders.map((o) => o._id);
    joinedIds.forEach((id) => joinOrderRoom(id));

    // Seed from last-known DB location
    setRiderPositions((prev) => {
      const seeded = { ...prev };
      let changed = false;
      liveOrders.forEach((order) => {
        const coords = order.rider?.currentLocation?.coordinates;
        if (coords && !seeded[order._id]) {
          seeded[order._id] = { lat: coords[1], lng: coords[0] };
          changed = true;
        }
      });
      return changed ? seeded : prev;
    });

    const handleLocation = (data) => {
      setRiderPositions((prev) => ({
        ...prev,
        [data.orderId]: { lat: data.lat, lng: data.lng },
      }));
    };

    socket.on('rider:location', handleLocation);

    return () => {
      joinedIds.forEach((id) => leaveOrderRoom(id));
      socket.off('rider:location', handleLocation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveOrderIdsKey, user?._id]);

  if (liveOrders.length === 0) return null;

  const activeOrder = liveOrders.find((o) => o._id === activeOrderId);

  return (
    <section className="mb-stack_lg">
      <div className="bg-surface-container-lowest p-gutter rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <h3 className="font-h3 text-h3 text-on-surface font-bold mb-stack_md flex items-center gap-2">
          <Icon name="explore" className="text-primary animate-pulse" />
          Live Deliveries
          <span className="ml-auto text-xs font-label bg-primary/10 text-primary px-3 py-1 rounded-full">
            {liveOrders.length} active
          </span>
        </h3>

        <div className="flex flex-col lg:flex-row gap-gutter" style={{ height: '420px' }}>
          {/* Left Sidebar: Order List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-1">
            {liveOrders.map((order) => (
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
                  <span className="text-xs bg-primary text-on-primary px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 bg-current rounded-full inline-block animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="text-small text-on-surface-variant flex items-center gap-2">
                  <Icon name="person" style={{ fontSize: '16px' }} />
                  {order.deliveryAddress?.firstName || order.user?.name || 'Customer'}
                </div>
                <div className="text-small text-on-surface-variant flex items-center gap-2">
                  <Icon name="two_wheeler" style={{ fontSize: '16px' }} />
                  {order.rider?.name || 'Rider'}
                </div>
                {riderPositions[order._id] && (
                  <div className="text-xs text-primary flex items-center gap-1 mt-1 font-bold">
                    <Icon name="my_location" style={{ fontSize: '14px' }} />
                    GPS ACTIVE
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Map Area */}
          <div className="w-full lg:w-2/3 h-full rounded-xl overflow-hidden border border-surface-variant relative">
            {activeOrder ? (
              <LiveMap activeOrder={activeOrder} riderPositions={riderPositions} />
            ) : (
              <div className="h-full flex items-center justify-center bg-surface-dim text-on-surface-variant">
                <Icon name="map" className="text-6xl opacity-20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminLiveDeliveries;
