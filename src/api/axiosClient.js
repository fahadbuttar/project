import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v2';

export const axiosClient = axios.create({
  baseURL,
  withCredentials: true, // Crucial for sending and receiving httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory access token storage (synced with localStorage for persistence)
let inMemoryToken = localStorage.getItem('volt_token') || null;

export const setAccessToken = (token) => {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem('volt_token', token);
  } else {
    localStorage.removeItem('volt_token');
  }
};

export const getAccessToken = () => inMemoryToken;

// Request Interceptor: Attach Bearer token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 unauthorized & automatic token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/users/login') &&
      !originalRequest.url?.includes('/users/refresh-token') &&
      !originalRequest.url?.includes('/users/register')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            } else if (originalRequest.headers?.Authorization) {
              delete originalRequest.headers.Authorization;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt token refresh via cookies or body
        const { data } = await axios.post(
          `${baseURL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Backend sets fresh httpOnly cookies, and may also return accessToken in body
        const newToken = data?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        } else {
          // Cookie-based session: clear stale Bearer token so fresh cookie is used
          setAccessToken(null);
          if (originalRequest.headers?.Authorization) {
            delete originalRequest.headers.Authorization;
          }
        }

        processQueue(null, newToken || null);
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        localStorage.removeItem('volt_user');
        // Do not force reload if already on login/register
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login?expired=1';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
