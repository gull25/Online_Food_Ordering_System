import api from './axios';

class OrderApi {
  async create(orderData) {
    const { data } = await api.post('/orders', orderData);
    return data;
  }

  async getById(id) {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  }

  async getMyOrders() {
    const { data } = await api.get('/orders/my-orders');
    return data;
  }
}

export default new OrderApi();
