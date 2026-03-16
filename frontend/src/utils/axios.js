import axios from 'axios';

// 1. ตั้งค่า baseURL อัตโนมัติ (Local vs Render)
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocal ? 'http://localhost:5000/api' : 'https://appdevproject-4.onrender.com/api';

export const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});

// ✅ Add Request Interceptor to attach Access Token from localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = isLocal ? 'http://localhost:5000' : 'https://appdevproject-4.onrender.com';
    return `${base}${path}`;
};




let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('[Axios Interceptor] 401 Error detected. URL:', originalRequest.url);
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                console.log('[Axios Interceptor] Refresh token request failed with 401. Preventing redirect.');
                // window.location.href = '/login'; // 🚫 Remove auto-redirect
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => axiosInstance(originalRequest))
                  .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 🚀 แก้จุดนี้: ใช้ axiosInstance เพื่อให้มันวิ่งไปหา Render
                // ส่ง refreshToken ไปใน body เผื่อ Cookie ถูกบล็อก
                const storedRefreshToken = localStorage.getItem('refreshToken');
                console.log('[Axios Interceptor] Attempting token refresh. Refresh Token present:', !!storedRefreshToken);
                const res = await axiosInstance.post('/auth/refresh-token', { refreshToken: storedRefreshToken });
                console.log('[Axios Interceptor] Refresh token response Success:', res.data.success || !!res.data.accessToken);

                if (res.data.accessToken) {
                    localStorage.setItem('accessToken', res.data.accessToken);
                }

                processQueue(null);
                isRefreshing = false;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('[Axios Interceptor] Refresh process FATAL error:', refreshError.message);
                processQueue(refreshError);
                isRefreshing = false;
                // window.location.href = '/login'; // 🚫 Remove auto-redirect
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);