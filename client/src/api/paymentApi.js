import api from './axios';

class PaymentApi {
  async processPayment(paymentData) {
    const { data } = await api.post('/payment/process', paymentData);
    return data;
  }
}

export default new PaymentApi();
