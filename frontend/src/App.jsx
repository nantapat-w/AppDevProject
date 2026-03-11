import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Settings from './pages/Settings'; 
import CreateShop from './pages/CreateShop';
import Shops from './pages/Shops'; 

// 🟢 1. Import หน้า Chat เข้ามา (เอาคอมเมนต์ออกแล้ว)
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create-shop" element={<CreateShop />} />
        <Route path="/shops" element={<Shops />} />
        
        {/* 🟢 2. เปิดใช้งาน Route สำหรับหน้า Chat */}
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;