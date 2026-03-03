import api from './middleware/apiMiddleware';

// Centralized API methods using the axios instance from apiMiddleware
export async function login(email, password) {
  const res = await api.post('/login', { email, password });
  // token/role handling is done by api middleware (interceptor)
  return res.data;
}

export async function register(payload) {
  const res = await api.post('/register', payload);
  return res.data;
}

export async function logout() {
  const res = await api.post('/logout');
  // middleware will clear token on successful logout
  return res.data;
}

export default {
  login,
  register,
  logout,
};
