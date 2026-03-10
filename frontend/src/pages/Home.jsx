import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShoppingBag, MessageSquare, Bell, User, Star, Repeat, Flame, PackageOpen, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // สมมติว่าดึงข้อมูล User มาจาก Context/State ว่าเขามีร้านค้าหรือยัง
  // ถ้ามีแล้ว ปุ่มจะเปลี่ยนเป็น "จัดการร้านค้า" แทน
  const [hasShop, setHasShop] = useState(false); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products'); 
        const productData = response.data.data || response.data || [];
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      
      {/* 🟢 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center shadow-[0_0_15px_rgba(139,44,245,0.4)]">
              <Repeat className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
              TradeApp
            </span>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="ค้นหาสินค้าที่อยากแลก หรือ ร้านค้า..." 
              className="w-full bg-[#151522] border border-[#2a2a3e] rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:border-[#8b2cf5] focus:ring-1 focus:ring-[#8b2cf5] transition-all text-sm placeholder-gray-500"
            />
            <button className="absolute right-1.5 top-1.5 p-1.5 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-full hover:opacity-90 transition">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-5">
            {/* 🟢 ปุ่มสร้างร้านค้า (เช็คสถานะว่ามีร้านหรือยัง) */}
            <Link to={hasShop ? "/manage-shop" : "/create-shop"}>
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#151522] border border-[#2a2a3e] rounded-full hover:border-[#8b2cf5] hover:text-[#8b2cf5] transition text-sm font-medium text-gray-300">
                <Store className="w-4 h-4" />
                {hasShop ? "จัดการร้านค้า" : "เปิดร้านค้าฟรี"}
              </button>
            </Link>

            <div className="h-8 w-px bg-[#2a2a3e] mx-1 hidden md:block"></div>

            <div className="relative cursor-pointer hover:text-[#8b2cf5] transition">
              <MessageSquare className="w-6 h-6 text-gray-300" />
            </div>
            <div className="relative cursor-pointer hover:text-[#8b2cf5] transition">
              <Bell className="w-6 h-6 text-gray-300" />
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-[#8b2cf5] transition group">
              <div className="w-8 h-8 rounded-full bg-[#151522] border border-[#2a2a3e] flex items-center justify-center overflow-hidden">
                 <User className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 🟢 2. Banner & Categories */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[280px]">
          
          {/* 🌟 Promo Banner (แทนที่ Main Banner เดิม) */}
          <div className="md:col-span-2 rounded-2xl border border-[#2a2a3e] relative overflow-hidden shadow-lg h-[280px] md:h-auto group cursor-pointer">
            {/* 🖼️ ภาพพื้นหลังโฆษณา */}
            <img 
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" 
              alt="Promotion Banner" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* 🌫️ Overlay สีดำไล่ระดับ */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05050f] via-[#05050f]/80 to-transparent"></div>
            
            {/* ✨ เนื้อหาโปรโมชั่น */}
            <div className="relative z-10 h-full flex flex-col justify-center p-8">
              <span className="px-3 py-1 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white text-[10px] font-bold rounded-full w-fit mb-4 shadow-[0_0_10px_rgba(139,44,245,0.5)] tracking-wider">
                🔥 SPECIAL PROMOTION
              </span>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white leading-tight">
                ลดกระหน่ำกลางปี <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                  แจกโค้ดลดสูงสุด 50%
                </span>
              </h1>
              
              <p className="text-gray-300 mb-6 max-w-sm text-sm">
                เข้ามาช้อปและเทรดไอเทมแรร์ในราคาพิเศษ พร้อมรับสิทธิ์ส่งฟรีตลอดเดือนนี้เท่านั้น!
              </p>
              
              <button className="w-fit bg-white text-[#0a0a16] font-bold py-2 px-6 rounded-full hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition transform hover:-translate-y-0.5">
                เก็บโค้ดส่วนลด
              </button>
            </div>
            
            {/* จุดไข่ปลาด้านล่าง (Indicators) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              <div className="w-6 h-1.5 bg-[#8b2cf5] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>

          {/* Shortcut Cards */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 bg-[#12121e] rounded-2xl border border-[#2a2a3e] p-5 flex items-center gap-4 hover:border-[#8b2cf5] cursor-pointer transition">
              <div className="p-3 bg-purple-500/10 rounded-xl"><Flame className="w-8 h-8 text-[#8b2cf5]" /></div>
              <div>
                <h3 className="font-bold text-lg">Community</h3>
                <p className="text-xs text-gray-400">พูดคุย, หาของ, รีวิว</p>
              </div>
            </div>
            
            {/* 🟢 ลิงก์ไปหน้า Shops */}
            <Link to="/shops" className="flex-1 bg-[#12121e] rounded-2xl border border-[#2a2a3e] p-5 flex items-center gap-4 hover:border-[#4361ee] cursor-pointer transition block">
              <div className="p-3 bg-blue-500/10 rounded-xl"><ShoppingBag className="w-8 h-8 text-[#4361ee]" /></div>
              <div>
                <h3 className="font-bold text-lg">Shops</h3>
                <p className="text-xs text-gray-400">รวมร้านค้าทั้งหมดในระบบ</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 🟢 3. Product Feed */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-[#8b2cf5] to-[#4361ee] rounded-full"></span>
            ไอเทมแนะนำสำหรับคุณ
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b2cf5]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#12121e] rounded-2xl border border-[#2a2a3e] text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2a1b41] to-[#162142] rounded-full flex items-center justify-center mb-4">
               <PackageOpen className="w-10 h-10 text-[#8b2cf5] opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">ยังไม่มีไอเทมเข้าสู่ตลาด</h3>
            <p className="text-gray-400 mb-6 max-w-md">ขณะนี้ยังไม่มีผู้ใช้คนใดลงประกาศสินค้า มาเป็นคนแรกที่เริ่มต้นการเทรดในระบบสิ!</p>
            <button className="bg-[#151522] border border-[#2a2a3e] text-gray-300 font-medium py-2 px-6 rounded-lg hover:border-[#8b2cf5] hover:text-white transition">
              ลงประกาศไอเทม
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((item) => (
              <div key={item._id} className="bg-[#12121e] rounded-xl border border-[#2a2a3e] overflow-hidden hover:-translate-y-1 hover:border-[#8b2cf5] hover:shadow-[0_5px_15px_rgba(139,44,245,0.2)] transition-all cursor-pointer group">
                <div className="aspect-square bg-[#1c1c2b] relative flex items-center justify-center">
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-md text-[10px] font-bold text-white shadow-md z-10">
                    {item.tradeType === 'TRADE_ONLY' ? 'TRADE ONLY' : item.tradeType === 'SELL_ONLY' ? 'SELL ONLY' : 'SELL & TRADE'}
                  </div>
                  
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.productName} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
                    />
                  ) : (
                    <span className="text-xs text-gray-600">No Image</span>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-200 line-clamp-2 leading-snug mb-2 group-hover:text-white h-10">
                    {item.productName}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-[#8b2cf5] font-bold text-lg">
                      {item.tradeType === 'TRADE_ONLY' ? 'เสนอแลก' : `฿${item.price?.toLocaleString() || 0}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.condition === 'NEW' ? 'ใหม่' : 'มือสอง'}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#2a2a3e] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] text-gray-400">5.0</span>
                    </div>
                    <span className="text-[10px] text-gray-500 hover:text-white truncate w-16 text-right">Owner</span>
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