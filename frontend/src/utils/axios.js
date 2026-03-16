import axios from 'axios';

// 1. ตั้งค่า baseURL เป็น Render (อันนี้คุณทำถูกแล้ว)
export const axiosInstance = axios.create({
    baseURL: 'https://appdevproject-3.onrender.com/api', // แนะนำให้เติม /api ไปเลยถ้าทุกเส้นทางใช้เหมือนกัน
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
                // 🚀 แก้จุดนี้: ใช้ axiosInstance เพื่อให้มันวิ่งไปหา Render
                await axiosInstance.post('/auth/refresh-token');

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