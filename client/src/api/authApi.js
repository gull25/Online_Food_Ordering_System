import api from './axios';

class AuthService {
  async register(userData) {
    const { data } = await api.post('/auth/register', userData);
    return data;
  }

  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  }
}

export default new AuthService();
