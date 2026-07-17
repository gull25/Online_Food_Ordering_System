import api from './axios';

class MenuApi {
  async getMenuByRestaurant(restaurantId) {
    const { data } = await api.get(`/restaurants/${restaurantId}/menu`);
    return data;
  }
}

export default new MenuApi();
