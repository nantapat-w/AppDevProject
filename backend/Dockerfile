# 1. ใช้ Node.js version 20 (หรือตามที่คุณใช้)
FROM node:20-alpine

# 2. สร้างโฟลเดอร์ในกล่อง
WORKDIR /app

# 3. ก๊อปปี้ไฟล์ package.json ไปลงเครื่องมือ
COPY package*.json ./

# 4. ติดตั้ง Library ทั้งหมด
RUN npm install

# 5. ก๊อปปี้โค้ดทั้งหมดในโฟลเดอร์ backend ไปใส่ในกล่อง
COPY . .

# 6. บอกว่า Backend รันที่ Port ไหน (สมมติ 5000)
EXPOSE 5000

# 7. คำสั่งรัน App
CMD ["node", "server.js"]