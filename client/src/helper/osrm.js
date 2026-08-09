/**
 * osrm.js — Free road-routing via the public OSRM demo server
 *
 * OSRM (Open Source Routing Machine) returns actual driving paths along real
 * roads. The public endpoint is free and requires no API key.
 *
 * Usage:
 *   import { fetchRoute } from '../helper/osrm';
 *   const { coords, distance, duration } = await fetchRoute(origin, destination);
 *   // coords → [[lat, lng], ...] ready for Leaflet <Polyline positions={coords} />
 */

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Simple Haversine distance between two {lat, lng} points (metres).
 * Used externally to throttle route re-fetching.
 */
export const haversineMetres = (a, b) => {
  if (!a || !b) return Infinity;
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
};

/**
 * Format a distance in metres to a human-readable string.
 */
const fmtDistance = (metres) => {
  if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
  return `${Math.round(metres)} m`;
};

/**
 * Format a duration in seconds to a human-readable string.
 */
const fmtDuration = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

/**
 * Decode a Google-encoded polyline (the format OSRM returns by default).
 * Returns [[lat, lng], ...] pairs.
 */
const decodePolyline = (encoded) => {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
};

/**
 * Fetch a driving route between two points.
 *
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @returns {Promise<{ coords: [number, number][], distance: string, duration: string, distanceMetres: number, durationSeconds: number }>}
 */
export const fetchRoute = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error('fetchRoute: origin and destination are required');
  }

  // OSRM expects [longitude, latitude] (GeoJSON order)
  const url = `${OSRM_BASE}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`;

  const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });

  if (!resp.ok) {
    throw new Error(`OSRM HTTP ${resp.status}`);
  }

  const data = await resp.json();

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(`OSRM returned code: ${data.code}`);
  }

  const route = data.routes[0];
  const coords = decodePolyline(route.geometry); // [[lat, lng], ...]
  const distanceMetres = route.distance;
  const durationSeconds = route.duration;

  return {
    coords,
    distance: fmtDistance(distanceMetres),
    duration: fmtDuration(durationSeconds),
    distanceMetres,
    durationSeconds,
  };
};
