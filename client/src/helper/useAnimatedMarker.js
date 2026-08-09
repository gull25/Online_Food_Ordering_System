import { useState, useEffect, useRef } from 'react';

/**
 * useAnimatedMarker — smoothly interpolates a Leaflet marker between GPS pings.
 *
 * When a new { lat, lng } target arrives, instead of teleporting the marker
 * instantly, this hook uses requestAnimationFrame to glide it from the old
 * position to the new one over `durationMs` milliseconds.
 *
 * It also tracks whether the position has gone stale — i.e. no update has
 * arrived for `staleThresholdMs` milliseconds.
 *
 * @param {{ lat: number, lng: number } | null} targetPos  Latest GPS position
 * @param {{ durationMs?: number, staleThresholdMs?: number }} options
 * @returns {{ animatedPos: { lat: number, lng: number } | null, isStale: boolean }}
 */
const useAnimatedMarker = (
  targetPos,
  { durationMs = 500, staleThresholdMs = 30_000 } = {}
) => {
  const [animatedPos, setAnimatedPos] = useState(targetPos);
  const prevPosRef = useRef(targetPos);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const [isStale, setIsStale] = useState(false);
  const staleTimerRef = useRef(null);

  // Animate position whenever targetPos changes
  useEffect(() => {
    if (!targetPos) return;

    // Mark as fresh whenever a new position arrives
    setIsStale(false);

    // Reset stale timer
    if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    staleTimerRef.current = setTimeout(() => setIsStale(true), staleThresholdMs);

    const from = prevPosRef.current || targetPos;
    const to = targetPos;

    // Cancel any in-progress animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease-out cubic for natural deceleration
      const ease = 1 - Math.pow(1 - progress, 3);

      const interpolated = {
        lat: from.lat + (to.lat - from.lat) * ease,
        lng: from.lng + (to.lng - from.lng) * ease,
      };

      setAnimatedPos(interpolated);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevPosRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetPos?.lat, targetPos?.lng, durationMs, staleThresholdMs]);

  // Cleanup stale timer on unmount
  useEffect(() => {
    return () => {
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { animatedPos, isStale };
};

export default useAnimatedMarker;
