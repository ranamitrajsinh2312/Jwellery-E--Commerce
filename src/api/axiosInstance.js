import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
