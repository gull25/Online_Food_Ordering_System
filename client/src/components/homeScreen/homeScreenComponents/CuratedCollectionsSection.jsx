import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../../api/axios';
import { Skeleton } from '../../common/Skeleton';
import { APP_ROUTES } from '../../../constants';

const CuratedCollectionsSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCollections = async () => {
      try {
        const response = await api.get('/public/collections');
        // Combine offers and categories, take up to 3
        const data = response.data?.data || {};
        const combined = [...(data.offers || []), ...(data.categories || [])].slice(0, 3);
        if (!cancelled) setCollections(combined);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
        if (!cancelled) setCollections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCollections();
    return () => {
      cancelled = true;
    };
  }, []);

  const goToOffers = () => {
    if (isAuthenticated) {
      navigate(APP_ROUTES.OFFERS);
    } else {
      navigate(APP_ROUTES.AUTH, {
        state: { message: 'Please login or create an account to continue.' },
      });
    }
  };

  // Nothing to curate — render nothing rather than an apologetic empty row.
  if (!loading && collections.length === 0) return null;

  return (
    <section className="py-stack_lg">
      <div className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop">
        <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-background mb-stack_lg">
          Curated Collections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} rounded="rounded-2xl" className="h-64 w-full" />
              ))
            : collections.map((item, index) => {
                const isOffer = item.discountPercentage !== undefined;
                const label = isOffer ? 'Offer' : 'Category';
                const labelClass = isOffer
                  ? 'bg-primary text-on-primary'
                  : 'bg-tertiary text-on-tertiary';
                const title = item.title || item.name;
                const desc =
                  item.description || (isOffer ? `${item.discountPercentage}% OFF` : `Explore ${title}`);
                const image =
                  item.image && item.image !== 'no-photo.jpg'
                    ? item.image
                    : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={item._id || index}
                    onClick={goToOffers}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        goToOffers();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${label}: ${title}`}
                    className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <img
                      src={image}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <span className={`${labelClass} px-3 py-1 rounded-full text-label font-label mb-2 inline-block`}>
                        {label}
                      </span>
                      <h3 className="font-h2 text-h3 font-bold line-clamp-1">{title}</h3>
                      <p className="text-small opacity-80 line-clamp-2">{desc}</p>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default CuratedCollectionsSection;
