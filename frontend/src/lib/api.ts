import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('agent-store');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.agent?.token) {
      config.headers.Authorization = `Bearer ${state.agent.token}`;
    }
  }
  return config;
});

export default api;
