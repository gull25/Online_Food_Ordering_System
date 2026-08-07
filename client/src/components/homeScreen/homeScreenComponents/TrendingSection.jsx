import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../common/Icon';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../../api/axios';
import { TrendingCardSkeleton } from '../../common/Skeleton';
import { APP_ROUTES } from '../../../constants';

const TrendingSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  // Drives the arrow buttons' disabled state so they never look clickable at
  // the ends of the carousel.
  const [scrollState, setScrollState] = useState({ atStart: true, atEnd: false });

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setScrollState({
      atStart: el.scrollLeft <= 4,
      atEnd: maxScroll <= 4 || el.scrollLeft >= maxScroll - 4,
    });
  }, []);

  const scroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Scroll by a viewport-relative amount rather than a fixed 300px, so the
    // carousel advances a sensible number of cards on any screen size.
    const amount = Math.max(280, el.clientWidth * 0.8);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => {
    let cancelled = false;
    const fetchTrending = async () => {
      try {
        const response = await api.get('/public/trending');
        if (!cancelled) setTrendingItems(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch trending items:', error);
        if (!cancelled) setTrendingItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    updateScrollState();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [loading, trendingItems, updateScrollState]);

  const openRestaurant = (item) => {
    const restaurantId = item.restaurant?._id || item.restaurant;
    if (!restaurantId) return;
    if (isAuthenticated) {
      navigate(APP_ROUTES.RESTAURANT_DETAIL(restaurantId));
    } else {
      navigate(APP_ROUTES.AUTH, {
        state: { message: 'Please login or create an account to continue.' },
      });
    }
  };

  return (
    <section className="py-stack_lg bg-surface-bright overflow-hidden">
      <div className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop">
        <div className="flex justify-between items-end mb-stack_lg gap-4">
          <div>
            <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-background">Trending Now</h2>
            <p className="text-body font-body text-secondary">The most ordered dishes in your area right now</p>
          </div>
          {/* Arrows are hidden when there is nothing to scroll, and disabled at
              each end, so they never invite a click that does nothing. */}
          {!loading && trendingItems.length > 0 && (
            <div className="hidden sm:flex gap-stack_sm shrink-0">
              <button
                onClick={() => scroll('left')}
                disabled={scrollState.atStart}
                aria-label="Scroll trending items left"
                className="w-10 h-10 rounded-full border border-outline hover:bg-surface-container transition-all flex items-center justify-center disabled:opacity-30"
              >
                <Icon name="chevron_left" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={scrollState.atEnd}
                aria-label="Scroll trending items right"
                className="w-10 h-10 rounded-full border border-outline hover:bg-surface-container transition-all flex items-center justify-center disabled:opacity-30"
              >
                <Icon name="chevron_right" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-gutter overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x snap-mandatory"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <TrendingCardSkeleton key={i} />)
          ) : trendingItems.length === 0 ? (
            <div className="w-full py-12 text-center text-secondary font-body">
              <Icon name="local_fire_department" className="text-4xl text-surface-variant block mb-2" />
              No trending dishes yet — check back once orders start rolling in.
            </div>
          ) : (
            trendingItems.map((item, index) => {
              const image =
                item.image && item.image !== 'no-photo.jpg'
                  ? item.image
                  : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80';

              return (
                <div
                  key={item._id}
                  onClick={() => openRestaurant(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openRestaurant(item);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.name} at ${item.restaurant?.name || 'restaurant'}`}
                  className="min-w-70 snap-start bg-surface-container-lowest rounded-2xl border border-outline-variant hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                >
                  <div className="h-48 rounded-t-2xl overflow-hidden relative">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${image}')` }}
                    />
                    {item.restaurant?.rating > 0 && (
                      <div className="absolute top-3 right-3 bg-surface-container-lowest/85 backdrop-blur-md px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1 shadow-sm">
                        <Icon name="star" className="text-[16px]" filled />
                        {item.restaurant.rating}
                      </div>
                    )}
                  </div>
                  <div className="p-stack_md flex flex-col grow">
                    <h3 className="font-h3 text-body font-bold text-on-background line-clamp-1">{item.name}</h3>
                    <p className="text-small font-small text-secondary mb-3 line-clamp-1">
                      {item.restaurant?.name || 'Local Restaurant'} • ${Number(item.price || 0).toFixed(2)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRestaurant(item);
                      }}
                      // tabIndex -1: the whole card is already focusable, so a
                      // second stop here would just double every tab press.
                      tabIndex={-1}
                      className="mt-auto w-full py-2.5 border-2 border-primary-container text-primary-container font-button text-button rounded-xl hover:bg-primary-container hover:text-on-primary transition-all"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(TrendingSection);
