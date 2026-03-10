import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Shops from './pages/Shops'; // เปลี่ยนชื่อไฟล์จาก OfficialShops เป็น Shops
// import CreateShop from './pages/CreateShop'; // เดี๋ยวเราสร้างหน้านี้ทีหลัง

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shops" element={<Shops />} />
        {/* <Route path="/create-shop" element={<CreateShop />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;