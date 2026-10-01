// Production & Development API Base configuration
export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`
  : 'https://fidelity-backend-il0j.onrender.com/api/v1';
