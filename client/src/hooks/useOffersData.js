import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDebounce } from '../helper/useDebounce';
import api from '../api/axios';

export const useOffersData = () => {
  // ── URL param: present when navigated via /restaurant/:id/offers ──────────
  const { id: urlRestaurantId } = useParams();

  // ── Fallback context from Redux (cart / previously visited restaurant) ─────
  const { restaurantId: cartRestaurantId } = useSelector((state) => state.cart);
  const { currentRestaurant } = useSelector((state) => state.restaurants);

  const activeRestaurantId = urlRestaurantId || cartRestaurantId || currentRestaurant?._id;

  // ── State ─────────────────────────────────────────────────────────────────
  const [offersData, setOffersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ── Countdown timer ────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(0);

  // ── Fetch offers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        if (activeRestaurantId) {
          const [offersRes, restRes] = await Promise.all([
            api.get(`/offers/active?restaurantId=${activeRestaurantId}`),
            api.get(`/restaurants/${activeRestaurantId}`)
          ]);
          setOffersData(offersRes.data.data || []);
          setRestaurant(restRes.data.data || null);
        } else {
          const res = await api.get('/offers/active');
          setOffersData(res.data.data || []);
          setRestaurant(null);
        }
      } catch (err) {
        console.error('Failed to load offers', err);
        setOffersData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [activeRestaurantId]);

  // ── Derived values ────────────────────────────────────────────────────────
  const flashOffer = useMemo(() => {
    return offersData.slice().sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))[0] || null;
  }, [offersData]);

  useEffect(() => {
    if (!flashOffer?.validUntil) {
      setTimeLeft(0);
      return;
    }
    const secondsLeft = Math.max(0, Math.floor((new Date(flashOffer.validUntil) - Date.now()) / 1000));
    setTimeLeft(secondsLeft);
  }, [flashOffer]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const formattedTime = useMemo(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  }, [timeLeft]);

  const filteredOffers = useMemo(() => {
    if (!offersData || !Array.isArray(offersData)) return [];
    if (!debouncedSearchQuery.trim()) return offersData;

    return offersData.filter(offer =>
      offer.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (offer.restaurantId?.name || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (offer.description || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [debouncedSearchQuery, offersData]);

  const newOffers = useMemo(() => {
    const filtered = offersData.filter(o => o._id !== flashOffer?._id);
    return {
      welcome: filtered[0] || null,
      delivery: filtered[1] || null
    };
  }, [offersData, flashOffer]);

  return {
    loading,
    restaurant,
    activeRestaurantId,
    searchQuery,
    setSearchQuery,
    flashOffer,
    formattedTime,
    newOffers,
    filteredOffers
  };
};
