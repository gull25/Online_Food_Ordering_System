import api from './axios';

class ReviewApi {
  async addReview(reviewData) {
    const { data } = await api.post('/reviews', reviewData);
    return data;
  }

  async getReviewsForRestaurant(restaurantId) {
    const { data } = await api.get(`/reviews/restaurant/${restaurantId}`);
    return data;
  }
}

export default new ReviewApi();
