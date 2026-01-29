import axios from 'axios';
import { useTradeStore } from '../store/useTradeStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor to catch global failures
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If server is down (500) or session expired (401)
    if (error.response?.status === 401 || error.response?.status >= 500) {
      console.error("CRITICAL_SYSTEM_FAILURE: EVE_RED_EYE_ACTIVATED");
      
      // We can use the store to broadcast a global error state
      useTradeStore.getState().setGlobalError(true);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
