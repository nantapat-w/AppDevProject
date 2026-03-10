import axios from 'axios';

// สร้างตัวแปร axiosInstance และส่งออก (Export) ไปใช้งาน
export const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api', // URL ของ Backend นายน้อย
    withCredentials: true, // 🌟 สำคัญมาก! เพื่อให้ส่ง Cookie ได้
});