import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CreateShop from './pages/CreateShop';
import Shops from './pages/Shops';
import ShopDetail from './pages/ShopDetail'; // 🟢 เพิ่ม Import หน้ารายละเอียดร้านค้า
import ProductDetail from './pages/ProductDetail';
import EditProduct from './pages/EditProduct';
import Cart from './pages/Cart';
import Community from './pages/Community';
import Chat from './pages/Chat';
import Payment from './pages/Payment';
import AccountSetting from './pages/AccountSetting';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import ProductSearch from './pages/ProductSearch';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create-shop" element={<CreateShop />} />
        
        {/* 🟢 Route สำหรับหน้ารวมร้านค้า และ หน้ารายละเอียดร้านค้า */}
        <Route path="/shops" element={<Shops />} />
        <Route path="/shops/:id" element={<ShopDetail />} />
         <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/product/edit/:id" element={<EditProduct />} />
        
        <Route path="/community" element={<Community />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/account-settings" element={<AccountSetting />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/search" element={<ProductSearch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;