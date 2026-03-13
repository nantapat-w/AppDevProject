import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, MessageSquare, Bell, User, Star, Repeat, Users, PackageOpen, LogOut, Store, ClipboardList, Settings } from 'lucide-react';

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo0.png';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      
      {/* 🟢 Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          
          <Link to="/" className="flex items-center gap-2 cursor-pointer w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center shadow-[0_0_15px_rgba(139,44,245,0.4)]">
              <img src={logo} alt="TradeApp Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
              Shoplify
            </span>
          </Link>

          <div className="flex-1 max-w-3xl relative">
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า หรือ ร้านค้า..." 
              className="w-full bg-[#151522] border border-[#2a2a3e] rounded-md py-2.5 pl-5 pr-12 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm placeholder-gray-500"
            />
            <button className="absolute right-2 top-1.5 p-1.5 bg-[#8b2cf5] rounded-md hover:bg-[#7220c7] transition">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-5 w-auto justify-end">
            
            {/* 🌟 ลิงก์เมนูร้านค้าบน Navbar 🌟 */}
            <Link to="/shops" className="hidden md:flex items-center gap-2 text-gray-300 hover:text-[#8b2cf5] font-medium transition-colors mr-2">
              <Store className="w-5 h-5" />
              ร้านค้า
            </Link>

            <div className="relative cursor-pointer hover:text-[#8b2cf5] transition">
              <Bell className="w-6 h-6 text-gray-300" />
            </div>
            <div className="relative cursor-pointer hover:text-[#8b2cf5] transition">
              <MessageSquare className="w-6 h-6 text-gray-300" />
            </div>
            <div className="h-8 w-px bg-[#2a2a3e] mx-1"></div>
            
            <div className="relative">
              {currentUser ? (
                <div 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="w-9 h-9 rounded-full bg-[#151522] border-2 border-[#2a2a3e] flex items-center justify-center overflow-hidden group-hover:border-[#8b2cf5] transition-all">
                     <User className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate max-w-[100px]">
                    {currentUser.username}
                  </span>

                  {showDropdown && (
                    <div className="absolute right-0 top-12 w-48 bg-[#12121e] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-[#2a2a3e] bg-[#0a0a16]">
                        <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors">
                          <User className="w-4 h-4" /> โปรไฟล์ของฉัน
                        </Link>
                        <Link to="/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors mt-1">
                          <ClipboardList className="w-4 h-4" /> ประวัติการสั่งซื้อ
                        </Link>
                        <Link to="/account-settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors mt-1">
                          <Settings className="w-4 h-4" /> ตั้งค่าบัญชี
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors mt-1"
                        >
                          <LogOut className="w-4 h-4" /> ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 cursor-pointer hover:text-[#8b2cf5] transition group">
                  <div className="w-9 h-9 rounded-full bg-[#151522] border-2 border-[#2a2a3e] flex items-center justify-center overflow-hidden group-hover:border-[#8b2cf5]">
                     <User className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  </div>
                </Link>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* 🟢 Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[300px]">
          <div className="md:col-span-2 bg-gradient-to-br from-[#1c0d33] to-[#0a1128] rounded-xl border border-[#2a2a3e] p-8 flex flex-col justify-center relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#8b2cf5] opacity-20 blur-[100px] rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
            <span className="text-xs font-bold tracking-wider text-[#8b2cf5] mb-2">PROMOTION</span>
            <h1 className="text-4xl font-bold mb-3 z-10 leading-tight">
              เทศกาลแลกของ <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">ลดค่าธรรมเนียม 50%</span>
            </h1>
            <p className="text-gray-400 mb-6 z-10">ใช้โค้ด "TRADE50" เมื่อทำการยืนยันการแลกเปลี่ยน</p>
            <button className="w-fit bg-[#8b2cf5] text-white font-medium py-2.5 px-8 rounded-md hover:bg-[#7220c7] transition z-10">
              ดูรายละเอียด
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Link to="/community" className="flex-1 bg-[#12121e] rounded-xl border border-[#2a2a3e] p-6 flex items-center justify-center gap-4 hover:border-[#8b2cf5] cursor-pointer transition group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b2cf5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-3 bg-[#1c0d33] rounded-full border border-[#8b2cf5]/30">
                <Users className="w-8 h-8 text-[#8b2cf5]" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Community</h3>
                <p className="text-sm text-gray-400">พูดคุย & หาของ</p>
              </div>
            </Link>

            {/* 🌟 กล่องลิงก์ร้านค้า (มีอยู่แล้ว แค่เน้นย้ำว่าอันนี้ก็วิ่งไป /shops) 🌟 */}
            <Link to="/shops" className="flex-1 bg-[#12121e] rounded-xl border border-[#2a2a3e] p-6 flex items-center justify-center gap-4 hover:border-[#4361ee] cursor-pointer transition group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4361ee]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-3 bg-[#0a1128] rounded-full border border-[#4361ee]/30">
                <ShoppingBag className="w-8 h-8 text-[#4361ee]" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Shop</h3>
                <p className="text-sm text-gray-400">ร้านค้าทั้งหมด</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 🟢 Product Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-xl font-bold mb-6 border-l-4 border-[#8b2cf5] pl-3">ไอเทมมาใหม่</h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b2cf5]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 bg-[#12121e] rounded-xl border border-[#2a2a3e] text-gray-400">
            <PackageOpen className="w-16 h-16 mb-4 text-[#2a2a3e]" />
            <h3 className="text-xl font-medium text-gray-300">ยังไม่มีไอเทมมาใหม่ในขณะนี้</h3>
            <p className="text-sm mt-2">เป็นคนแรกที่เริ่มลงประกาศแลกเปลี่ยนไอเทมเลยสิ!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((item) => (
              <div 
                key={item._id} 
                className="bg-[#12121e] rounded-md border border-[#2a2a3e] overflow-hidden hover:border-[#8b2cf5] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col"
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <div className="aspect-square bg-[#1c1c2b] relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded text-[10px] font-bold text-white z-10">
                    {item.tradeType === 'TRADE_ONLY' ? 'TRADE ONLY' : item.tradeType === 'SELL_ONLY' ? 'SELL ONLY' : 'SELL & TRADE'}
                  </div>
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.productName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <PackageOpen className="w-12 h-12 text-[#2a2a3e]" />
                  )}
                </div>

                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-sm font-medium text-gray-200 line-clamp-2 mb-2 group-hover:text-white">
                    {item.productName}
                  </h3>
                  
                  <div className="mt-auto">
                    <div className="text-[#8b2cf5] font-bold text-lg mb-1">
                      {item.tradeType === 'TRADE_ONLY' ? 'เสนอแลก' : `฿ ${item.price?.toLocaleString() || 0}`}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-[#2a2a3e]">
                      <span className="truncate w-24 hover:text-white">{item.ownerId?.username || 'Unknown User'}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{item.ownerId?.trustScore || 5.0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;