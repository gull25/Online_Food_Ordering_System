import api from './axios';

class CartApi {
  async getCart() {
    const { data } = await api.get('/cart');
    return data;
  }

  async addItem(itemData) {
    const { data } = await api.post('/cart/items', itemData);
    return data;
  }

  async removeItem(itemId) {
    const { data } = await api.delete(`/cart/items/${itemId}`);
    return data;
  }
}

export default new CartApi();
