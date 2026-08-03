import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';

const ReviewsSection = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/restaurant/${restaurantId}`);
        setReviews(res.data.data || []);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) {
      fetchReviews();
    }
  }, [restaurantId]);

  if (loading) {
    return <div className="mt-8 mb-24 animate-pulse h-32 bg-surface-variant rounded-2xl w-full"></div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-8 mb-24 p-8 text-center bg-surface-container-low border border-outline-variant/30 rounded-2xl">
        <h3 className="font-h3 text-h3 text-on-surface mb-2">No Reviews Yet</h3>
        <p className="font-body text-body text-secondary">Be the first to review this restaurant by placing an order!</p>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-24">
      <h2 className="font-h2 text-h2 font-bold text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[28px]">star_rate</span>
        Customer Reviews ({reviews.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden">
                  <img
                    src={review.user?.avatar || "https://ui-avatars.com/api/?name=" + (review.user?.name || 'U')}
                    alt={review.user?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-button text-button font-bold text-on-surface">{review.user?.name || 'Anonymous User'}</h4>
                  <p className="text-[12px] text-secondary">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`material-symbols-outlined text-[18px] ${
                      star <= review.rating ? 'text-[#F59E0B] fill-current' : 'text-outline-variant'
                    }`}
                    style={star <= review.rating ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="font-body text-body text-on-surface-variant leading-relaxed">
                "{review.comment}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
