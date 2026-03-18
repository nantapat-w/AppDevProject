import axios from 'axios';

// 🟢 ชี้ไปที่ '/api' เพื่อใช้โดเมนเดียวกับหน้าเว็บ (1 Web Service)
export const axiosInstance = axios.create({
    baseURL: '/api', 
    withCredentials: true,
});

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
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                window.location.href = '/login';
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
                // 🟢 เปลี่ยนมาใช้ '/api' ตรงนี้ด้วย จะได้ไม่บั๊ก
                await axios.post(`/api/auth/refresh-token`, {}, {
                    withCredentials: true,
                });
                processQueue(null);
                isRefreshing = false;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);