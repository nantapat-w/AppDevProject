import axios from 'axios';

// สร้างตัวแปร axiosInstance และส่งออก (Export) ไปใช้งาน
export const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
});

// 🔄 ตัวแปรป้องกัน refresh loop
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

// 🛡️ Interceptor: เมื่อได้รับ 401 → ลอง refresh token ก่อน → retry request เดิม
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ถ้าเป็น 401 และยังไม่เคย retry
        if (error.response?.status === 401 && !originalRequest._retry) {

            // ถ้า error มาจาก refresh-token เอง → logout
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // รอคิว refresh ที่กำลังทำอยู่
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => axiosInstance(originalRequest))
                  .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // เรียก refresh-token endpoint
                await axios.post('http://localhost:5000/api/auth/refresh-token', {}, {
                    withCredentials: true,
                });

                processQueue(null);
                isRefreshing = false;

                // Retry request เดิม
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;
                // Refresh ไม่ได้ → redirect ไป login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);