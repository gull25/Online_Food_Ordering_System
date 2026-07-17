import api from './axios';

class RestaurantApi {
  async getAll() {
    const { data } = await api.get('/restaurants');
    return data;
  }

  async getById(id) {
    const { data } = await api.get(`/restaurants/${id}`);
    return data;
  }
}

export default new RestaurantApi();
