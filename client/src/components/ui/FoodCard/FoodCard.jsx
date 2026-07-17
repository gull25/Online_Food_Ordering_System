import React from 'react';

const FoodCard = ({ item, cartQty, onAdd, onRemove }) => {
  return (
    <div className="bg-surface-container-lowest rounded-16 border border-surface-variant overflow-hidden hover:shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col sm:flex-row group">
      <div className="w-full sm:w-[140px] h-[200px] sm:h-auto relative overflow-hidden flex-shrink-0 bg-surface-container">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={item.name}
          src={item.image}
        />
        {item.rating && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
            <span
              className="material-symbols-outlined text-[14px] text-tertiary-container flex items-center justify-center"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              thumb_up
            </span>
            <span className="font-label text-label text-on-surface">
              {item.rating}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[20px] font-semibold text-on-surface leading-tight">
              {item.name}
            </h3>
            <span className="text-[#FF5A1F] font-button text-button ml-2">
              €{item.price.toFixed(2)}
            </span>
          </div>
          <p className="text-[14px] font-normal text-on-secondary-container line-clamp-2 mt-2">
            {item.description}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            {item.tag && (
              <span
                className={`px-2 py-1 rounded-full font-label text-label flex items-center gap-1 w-fit ${
                  item.tag === 'Spicy'
                    ? 'bg-[#FFDAD6] text-[#93000A]'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {item.tag === 'Spicy' && (
                  <span className="material-symbols-outlined text-[12px] flex items-center justify-center">
                    local_fire_department
                  </span>
                )}
                {item.tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {cartQty > 0 ? (
              <div className="flex items-center bg-primary-container text-on-primary rounded-12 h-10 overflow-hidden shadow-sm">
                <button
                  onClick={() => onRemove(item.id)}
                  className="px-3 hover:bg-black/10 transition-colors h-full text-lg font-bold"
                >
                  -
                </button>
                <span className="px-2 font-button text-button">{cartQty}</span>
                <button
                  onClick={() => onAdd(item)}
                  className="px-3 hover:bg-black/10 transition-colors h-full text-lg font-bold"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAdd(item)}
                className="h-10 px-4 bg-surface-container-lowest border border-surface-variant text-on-surface rounded-12 font-button text-button hover:bg-primary-container hover:text-white hover:border-primary-container transition-all shadow-sm active:scale-95"
              >
                + Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
