import axios from 'axios';

// 🌐 ตั้งค่า URL ของ Backend
// ถ้าอยู่บน Render จะดึงค่าจาก VITE_API_URL (ที่เราตั้งใน Environment) 
// ถ้าไม่เจอจะวิ่งไปที่ localhost:5000 (ในเครื่องเรา)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// สร้างตัวแปร axiosInstance
export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // สำคัญมาก: เพื่อให้ส่ง Cookie/Token ไปกับ Request ได้
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

// 🛡️ Interceptor: จัดการ Response และการ Refresh Token
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ถ้าเจอ Error 401 (Unauthorized) และยังไม่เคยลอง Retry
        if (error.response?.status === 401 && !originalRequest._retry) {

            // ถ้า Error มาจากตัว Refresh Token เอง ให้เด้งไปหน้า Login ทันที
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // ถ้ากำลัง Refresh อยู่ ให้เอา Request นี้ใส่คิวรอไว้
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => axiosInstance(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // เรียก API เพื่อขอ Refresh Token ใหม่
                // ใช้ axios ตัวหลักเรียกเพื่อเลี่ยงการติด Interceptor วนลูป
                await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
                    withCredentials: true,
                });

                processQueue(null);
                isRefreshing = false;

                // เมื่อสำเร็จ ให้ลองส่ง Request เดิมใหม่อีกครั้ง
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;

                // ถ้า Refresh ไม่ผ่าน ให้กลับไปหน้า Login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);