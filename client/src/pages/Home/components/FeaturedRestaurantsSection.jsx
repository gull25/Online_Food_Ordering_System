import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedRestaurants, setUserLocation } from '../../../features/restaurants/restaurantSlice';
import RestaurantCard from '../../../components/ui/RestaurantCard/RestaurantCard';
import { toast } from 'react-hot-toast';

const FeaturedRestaurantsSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { featuredRestaurants, loading, error, userLocation } = useSelector((state) => state.restaurants);
  const [locating, setLocating] = React.useState(false);

  useEffect(() => {
    dispatch(fetchFeaturedRestaurants(userLocation));
  }, [dispatch, userLocation]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        dispatch(setUserLocation({ lat, lng }));
        setLocating(false);
        toast.success('Found restaurants near you!');
      },
      (error) => {
        setLocating(false);
        toast.error('Unable to retrieve your location');
      }
    );
  };

  return (
    <section className="py-stack_lg bg-surface animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack_lg gap-4">
              <h2 className="font-h2 text-h2 text-on-background">Featured Restaurants</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleUseLocation}
                  disabled={locating}
                  className="px-4 py-2 bg-surface-container-highest text-on-surface rounded-full font-button text-sm flex items-center gap-2 hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">{locating ? 'hourglass_empty' : 'my_location'}</span>
                  {locating ? 'Locating...' : (userLocation ? 'Update Location' : 'Use My Location')}
                </button>
                <button
                  onClick={() => isAuthenticated ? navigate('/offers') : navigate('/auth', { state: { message: 'Please login or create an account to continue.' } })}
                  className="text-primary font-button flex items-center gap-1 hover:underline"
                >
                  View all <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
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
