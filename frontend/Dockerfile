FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite ปกติรัน port 5173
EXPOSE 5173

# สั่งรัน mode dev หรือ preview ตามที่คุณตั้งค่า
CMD ["npm", "run", "dev", "--", "--host"]