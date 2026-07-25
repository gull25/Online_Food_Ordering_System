import React from 'react';

const RestaurantHeader = ({ handleShare, shareText, isFavorite, setIsFavorite, restaurant, loading }) => {
  return (
    <header className="relative w-full h-[300px] md:h-[400px]">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url('${restaurant?.images?.banner || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-full px-margin_mobile md:px-margin_desktop pb-stack_lg max-w-container_max mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-stack_md md:gap-gutter text-white relative z-10">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-16 bg-white overflow-hidden shadow-sm border border-surface-variant flex-shrink-0 flex items-center justify-center p-2">
            {loading ? (
              <div className="w-full h-full animate-pulse bg-surface-variant rounded-full"></div>
            ) : (
              <img
                className="w-full h-full object-contain"
                alt={`${restaurant?.name || 'Restaurant'} Logo`}
                src={restaurant?.images?.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=100"}
              />
            )}
          </div>
          {/* Details */}
          <div className="flex-1">
            {loading ? (
              <div className="h-8 w-48 bg-white/20 animate-pulse rounded mb-2"></div>
            ) : (
              <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-white mb-2">
                {restaurant?.name || 'Loading...'}
              </h1>
            )}
            <div className="flex items-center gap-3 flex-wrap text-surface-container-lowest font-body text-body opacity-90">
              <span className="flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-lg text-[#FFB59E]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>{' '}
                {restaurant?.rating || 'New'} {restaurant?.ratingCount ? `(${restaurant.ratingCount}+ ratings)` : ''}
              </span>
              <span className="w-1 h-1 rounded-full bg-surface-container-lowest"></span>
              <span>{restaurant?.priceRange || '$$'}</span>
              <span className="w-1 h-1 rounded-full bg-surface-container-lowest"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">location_on</span> {restaurant?.location?.address || 'Location unavailable'}
              </span>
              <span className="w-1 h-1 rounded-full bg-surface-container-lowest"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">schedule</span> {restaurant?.deliveryTime || '30-45'} min
              </span>
            </div>
          </div>
          {/* Actions */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={handleShare}
              className="h-12 px-4 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center gap-2 hover:bg-white/30 transition-colors text-white text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-white">share</span>
              {shareText}
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
                isFavorite ? 'bg-primary-container text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RestaurantHeader;
