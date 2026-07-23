import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedRestaurants } from '../../../features/restaurants/restaurantSlice';
import RestaurantCard from '../../../components/ui/RestaurantCard/RestaurantCard';

const FeaturedRestaurantsSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { featuredRestaurants, loading, error } = useSelector((state) => state.restaurants);

  useEffect(() => {
    dispatch(fetchFeaturedRestaurants());
  }, [dispatch]);

  return (
    <section className="py-stack_lg bg-surface animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="flex justify-between items-center mb-stack_lg">
              <h2 className="font-h2 text-h2 text-on-background">Featured Restaurants</h2>
              <button
                onClick={() => navigate('/auth')}
                className="text-primary font-button flex items-center gap-1 hover:underline"
              >
                View all restaurants <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-surface-container rounded-3xl h-64 w-full"></div>
                ))
              ) : error ? (
                <div className="col-span-full py-12 text-center text-error font-body">
                  <span className="material-symbols-outlined text-4xl mb-4">error</span>
                  <p>{error}</p>
                </div>
              ) : !featuredRestaurants || featuredRestaurants.length === 0 ? (
                <div className="col-span-full py-16 text-center text-on-surface-variant flex flex-col items-center">
                  <span className="material-symbols-outlined text-6xl mb-4 text-surface-variant">restaurant_menu</span>
                  <h3 className="font-h3 text-h3 text-on-surface mb-2">No featured restaurants yet</h3>
                  <p className="font-body text-body max-w-md mx-auto">We're currently updating our curated list of top spots. Check back soon for the best places to eat!</p>
                </div>
              ) : (
                featuredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant._id || restaurant.id} restaurant={restaurant} />
                ))
              )}
            </div>
          </div>
        </section>
  );
};

export default FeaturedRestaurantsSection;
