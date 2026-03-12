import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CreateShop from './pages/CreateShop';
import Shops from './pages/Shops';
import Community from './pages/Community';
import Chat from './pages/Chat';
import Payment from './pages/Payment';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🟢 ดูโปรไฟล์ตัวเอง */}
        <Route path="/profile" element={<Profile />} />

        {/* 🟢 ดูโปรไฟล์คนอื่น (รับ ID มาด้วย) */}
        <Route path="/profile/:id" element={<Profile />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/create-shop" element={<CreateShop />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/community" element={<Community />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;