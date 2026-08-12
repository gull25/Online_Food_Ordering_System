import React from 'react';
import Icon from '../common/Icon';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { _id, id, name, cuisine, tags, estimatedDeliveryTime, time, minOrder, images, image, deliveryFee, promo } = restaurant;
  const cardId = _id || id;
  const cardTags = cuisine || tags || [];
  const cardTime = estimatedDeliveryTime || time || '30 min';
  const resolveImage = (img) => (!img || img === 'no-photo.jpg') ? null : img;
  const cardImage = resolveImage(images?.banner) || resolveImage(images?.logo) || resolveImage(image) || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80';
  const freeDelivery = deliveryFee === 0 || restaurant.freeDelivery;

  return (
    <div
      onClick={() => isAuthenticated ? navigate(`/restaurant/${cardId}`) : navigate('/auth', { state: { message: 'Please login or create an account to continue.' } })}
      className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden hover:shadow-xl transition-all cursor-pointer"
    >
      <div className="aspect-[16/9] w-full relative">
        <img
          src={cardImage}
          alt={name}
          className="w-full h-full object-cover object-center"
        />
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

        </div>
        <p className="text-body text-secondary mb-4">{cardTags.join(' • ')}</p>
        <div className="flex items-center gap-4 text-small text-secondary border-t border-outline-variant pt-4">
          <div className="flex items-center gap-1">
            <Icon name="schedule" className="text-[18px]" /> {cardTime}
          </div>
          <div className="flex items-center gap-1">
            <Icon name="payments" className="text-[18px]" /> Min. ${minOrder}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RestaurantCard);
