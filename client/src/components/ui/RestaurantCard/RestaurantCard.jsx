import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  const { id, name, rating, tags, time, minOrder, image, freeDelivery, promo } = restaurant;

  return (
    <div
      onClick={() => navigate(`/restaurant/${id}`)}
      className="bg-white rounded-2xl border border-outline-variant overflow-hidden hover:shadow-xl transition-all cursor-pointer"
    >
      <div className="h-52 relative">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        ></div>
        <div className="absolute top-4 left-4 flex gap-2">
          {freeDelivery && (
            <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-lg text-label font-label">
              Free Delivery
            </span>
          )}
          {promo && (
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-lg text-label font-label">
              Promo
            </span>
          )}
        </div>
      </div>
      <div className="p-stack_md">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-h3 text-h3 font-bold">{name}</h3>
          <div className="bg-surface-container px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] fill">star</span> {rating}
          </div>
        </div>
        <p className="text-body text-secondary mb-4">{tags.join(' • ')}</p>
        <div className="flex items-center gap-4 text-small text-secondary border-t border-outline-variant pt-4">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">schedule</span> {time}
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">payments</span> Min. ${minOrder}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
