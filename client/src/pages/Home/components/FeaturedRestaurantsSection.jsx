import React from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../../../components/ui/RestaurantCard/RestaurantCard';
import { FEATURED_RESTAURANTS } from '../constants/homeData';

const FeaturedRestaurantsSection = () => {
  const navigate = useNavigate();

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
              {FEATURED_RESTAURANTS.map((restaurant, idx) => (
                <RestaurantCard key={idx} restaurant={restaurant} />
              ))}
            </div>
          </div>
        </section>
  );
};

export default FeaturedRestaurantsSection;
