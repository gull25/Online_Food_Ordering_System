import React, { useEffect } from 'react';
import Icon from '../../common/Icon';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedRestaurants } from "../../../redux/restaurantSlice";
import RestaurantCard from '../../ui/RestaurantCard';
import { RestaurantCardSkeleton } from '../../common/Skeleton';

const FeaturedRestaurantsSection = () => {
  const dispatch = useDispatch();
  const { featuredRestaurants, listLoading, listError } = useSelector((state) => state.restaurants);

  useEffect(() => {
    dispatch(fetchFeaturedRestaurants());
  }, [dispatch]);

  return (
    <section className="py-stack_lg bg-surface">
      <div className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack_lg gap-4">
          <div>
            <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-background">Featured Restaurants</h2>
            <p className="text-body font-body text-secondary mt-1">
              Hand-picked kitchens our customers keep coming back to
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {listLoading ? (
            // Card-shaped skeletons, so the real cards drop in without shifting
            // the grid — a plain grey slab of a different height reflows twice.
            Array.from({ length: 3 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
          ) : listError ? (
            <div className="col-span-full py-12 text-center font-body flex flex-col items-center gap-4">
              <Icon name="error" className="text-4xl text-error" />
              <p className="text-error">{listError}</p>
              <button
                onClick={() => dispatch(fetchFeaturedRestaurants())}
                className="px-5 h-11 rounded-xl border border-outline text-on-surface font-button text-button hover:bg-surface-container transition-colors"
              >
                Try again
              </button>
            </div>
          ) : !featuredRestaurants || featuredRestaurants.length === 0 ? (
            <div className="col-span-full py-16 text-center text-on-surface-variant flex flex-col items-center">
              <Icon name="restaurant_menu" className="text-6xl mb-4 text-surface-variant" />
              <h3 className="font-h3 text-h3 text-on-surface mb-2">No featured restaurants yet</h3>
              <p className="font-body text-body max-w-md mx-auto">We're currently updating our curated list of top spots. Check back soon for the best places to eat!</p>
            </div>
          ) : (
            featuredRestaurants.map((restaurant, index) => (
              <div
                key={restaurant._id || restaurant.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
              >
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedRestaurantsSection;
