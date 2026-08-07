import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Icon from '../../common/Icon';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { socket } from '../../../helper/socket';

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default center: Lahore
const defaultCenter = {
  lat: 31.5204,
  lng: 74.3587
};

const libraries = ['places'];

const LiveTracker = ({ orderId, restaurantLocation, customerLocation, initialRiderLocation, isRiderView = false }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '', // Provide valid key in .env
    libraries,
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  
  const [riderLoc, setRiderLoc] = useState(initialRiderLocation);

  // Parse coordinates safely
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

  // Listen for socket updates
  useEffect(() => {
    if (!isRiderView && socket && orderId) {
      socket.emit('join:order_room', orderId);

      const handleLocationUpdate = (data) => {
        if (data.orderId === orderId) {
          setRiderLoc({ lat: data.lat, lng: data.lng });
        }
      };

      socket.on('rider:location', handleLocationUpdate);

      return () => {
        socket.off('rider:location', handleLocationUpdate);
        socket.emit('leave:order_room', orderId);
      };
    }
  }, [orderId, isRiderView]);

  // Calculate route
  const calculateRoute = useCallback(async () => {
    if (!isLoaded || (!riderLoc && !restaurantPos) || !customerPos) {
      return;
    }

    const origin = riderLoc || restaurantPos;
    const destination = customerPos;

    try {
      // eslint-disable-next-line no-undef
      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: origin,
        destination: destination,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);
    } catch (error) {
      console.error('Directions request failed:', error);
    }
  }, [isLoaded, riderLoc, restaurantPos, customerPos]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-surface-dim text-error p-4 text-center">
        Failed to load Google Maps. Please verify your VITE_GOOGLE_MAPS_API_KEY.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-surface-dim">
        <Icon name="sync" className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={restaurantPos || defaultCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#ae3200',
                strokeWeight: 5,
                strokeOpacity: 0.7,
              },
            }}
          />
        )}

        {/* Custom Markers */}
        {restaurantPos && (
          <Marker 
            position={restaurantPos} 
            icon={{
              url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231c1b1f" width="32px" height="32px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}
        
        {customerPos && (
          <Marker 
            position={customerPos}
            icon={{
              url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ae3200" width="32px" height="32px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}

        {riderLoc && (
          <Marker 
            position={riderLoc}
            icon={{
              url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ae3200" width="48px" height="48px"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM7 17H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>',
              scaledSize: new window.google.maps.Size(48, 48),
            }}
          />
        )}
      </GoogleMap>

      {/* Map Overlay for ETA and Distance */}
      {!isRiderView && distance && duration && (
        <div className="absolute top-4 left-4 z-10 bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-outline-variant/30 animate-in slide-in-from-top-4">
          <p className="font-label text-label text-secondary uppercase mb-1 tracking-wider">Live ETA</p>
          <div className="flex items-end gap-3">
            <span className="font-h3 text-h3 font-bold text-primary">{duration}</span>
            <span className="font-body text-body text-on-surface-variant mb-1">({distance})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracker;
