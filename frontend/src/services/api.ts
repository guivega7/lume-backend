import axios from 'axios';

export const api = axios.create({
  // @ts-ignore
  baseURL: import.meta.env.VITE_API_URL || 'https://lume-backend-production-149a.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lume.token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('lume.token');
      localStorage.removeItem('lume.user');
      
      // Redirecionar para login apenas se não estivermos já lá
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
