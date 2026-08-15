import React from 'react';

import Icon from '../common/Icon';
const FoodCard = ({ item, cartQty, onAdd, onRemove }) => {
  return (
    <div className="bg-surface-container-lowest rounded-16 border border-surface-variant overflow-hidden hover:shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col sm:flex-row group">
      <div className="w-full sm:w-[140px] h-[200px] sm:h-auto relative overflow-hidden shrink-0 bg-surface-container">
        {item.image && item.image !== 'no-photo.jpg' ? (
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={item.name}
            loading="lazy"
            src={item.image}
          />
        ) : (
          // Menu items without a photo previously rendered <img src={undefined}>,
          // which shows the browser's broken-image glyph.
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <Icon name="restaurant" className="text-[40px] text-on-surface-variant/40" />
          </div>
        )}

      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[20px] font-semibold text-on-surface leading-tight">
              {item.name}
            </h3>
          
            <span className="text-primary font-button text-button ml-2 whitespace-nowrap">
              ${Number(item.price || 0).toFixed(2)}
            </span>
          </div>
          <p className="text-[14px] font-normal text-on-surface/80 line-clamp-2 mt-2">
            {item.description}
          </p>
          <div className="mt-2 flex items-center">
            {item.numReviews > 0 ? (
              <div className="flex items-center gap-1">
                <Icon name="star" className="text-[16px] text-warning" />
                <span className="font-button text-button text-on-surface font-bold">{item.rating?.toFixed(1)}</span>
                <span className="font-label text-[12px] text-secondary">({item.numReviews} rating{item.numReviews !== 1 ? 's' : ''})</span>
              </div>
            ) : (
              <span className="font-label text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-center">New</span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            {item.tag && (
              <span
                className={`px-2 py-1 rounded-full font-label text-label flex items-center gap-1 w-fit ${item.tag === 'Spicy'
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-surface-container text-on-surface-variant'
                  }`}
              >
                {item.tag === 'Spicy' && <Icon name="local_fire_department" className="text-[12px]" />}
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

export default React.memo(FoodCard);
