import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Store, Star, Users, ChevronRight, ArrowLeft, Plus, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // สมมติว่าดึงข้อมูลจากระบบมาว่า User คนนี้มีร้านหรือยัง
  const [hasShop, setHasShop] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        // 🚨 แก้ URL เป็น API สำหรับดึงร้านค้าของคุณ
        const response = await axios.get('http://localhost:5000/api/shops'); 
        
        // ดึงร้านค้า "ทั้งหมด" มาแสดง (ไม่ต้องกรอง Official แล้ว)
        const allShops = response.data.data || response.data || [];
        setShops(allShops);
      } catch (error) {
        console.error("Error fetching shops:", error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      
      {/* 🟢 1. Header (Navbar) */}
      <nav className="sticky top-0 z-50 bg-[#0a0a16]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* ซ้าย: ปุ่มกลับ และ ชื่อหน้า */}
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-[#151522] rounded-full hover:bg-[#2a2a3e] transition cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Link>
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-[#4361ee]" />
              <h1 className="text-xl font-bold">ร้านค้า (Shops)</h1>
            </div>
          </div>

          {/* ขวา: ปุ่มสร้างร้านค้า */}
          <Link to={hasShop ? "/manage-shop" : "/create-shop"}>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-full hover:shadow-[0_0_15px_rgba(139,44,245,0.4)] transition text-sm font-bold text-white">
              <Plus className="w-4 h-4" />
              {hasShop ? "จัดการร้านค้า" : "เปิดร้านค้าของคุณ ฟรี!"}
            </button>
          </Link>

        </div>
      </nav>

      {/* 🟢 2. Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-[#162142] to-[#2a1b41] rounded-2xl border border-[#4361ee]/30 p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-[0_0_20px_rgba(67,97,238,0.15)]">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#4361ee] opacity-20 blur-[80px] rounded-full"></div>
          
          <div className="z-10 mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              ค้นพบร้านค้าชั้นนำ <Store className="w-8 h-8 text-[#4361ee]" />
            </h2>
            <p className="text-gray-400 max-w-md">
              เลือกดูสินค้าจากร้านค้าในระบบ หรือเริ่มต้นธุรกิจของคุณเองด้วยการเปิดร้านค้าฟรี เพื่อเข้าถึงผู้ใช้งานนับหมื่นคน
            </p>
          </div>

          <div className="z-10 w-full md:w-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อร้านค้า..." 
              className="w-full md:w-80 bg-[#05050f] border border-[#2a2a3e] rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee] transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* 🟢 3. Shop List Section */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        
        {loading ? (
          // สถานะโหลด
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4361ee]"></div>
          </div>
        ) : shops.length === 0 ? (
          // ไม่มีร้านค้า
          <div className="flex flex-col items-center justify-center py-20 bg-[#12121e] rounded-2xl border border-[#2a2a3e] text-center">
            <div className="w-20 h-20 bg-[#162142] rounded-full flex items-center justify-center mb-4">
               <Store className="w-10 h-10 text-[#4361ee] opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">ยังไม่มีร้านค้าในระบบ</h3>
            <p className="text-gray-400 mb-6">มาเป็นร้านค้าแรกในแพลตฟอร์มของเราสิ!</p>
            <Link to="/create-shop">
              <button className="px-6 py-2.5 bg-[#151522] border border-[#2a2a3e] rounded-full hover:border-[#8b2cf5] transition text-sm font-medium text-white">
                สร้างร้านค้าเลย
              </button>
            </Link>
          </div>
        ) : (
          // มีร้านค้า (แสดงเป็น Grid)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div key={shop._id} className="bg-[#12121e] rounded-2xl border border-[#2a2a3e] overflow-hidden hover:-translate-y-1 hover:border-[#4361ee] hover:shadow-[0_8px_20px_rgba(67,97,238,0.2)] transition-all cursor-pointer group flex flex-col relative">
                
                {/* Banner ร้าน */}
                <div className="h-32 bg-[#1c1c2b] relative">
                  {shop.shopBanner ? (
                    <img src={shop.shopBanner} alt="banner" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#2a2a3e] to-[#151522]"></div>
                  )}
                  {/* Status */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-green-400 border border-green-500/30">
                    {shop.status === 'active' ? '● OPEN' : 'CLOSED'}
                  </div>
                </div>

                {/* รายละเอียดร้าน */}
                <div className="px-5 pb-6 relative flex-1 flex flex-col">
                  {/* Logo ร้าน (ลอยทับ Banner) */}
                  <div className="w-16 h-16 rounded-full border-4 border-[#12121e] bg-[#05050f] absolute -top-8 left-5 overflow-hidden shadow-lg flex items-center justify-center">
                    {shop.shopLogo ? (
                      <img src={shop.shopLogo} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-8 h-8 text-gray-500" />
                    )}
                  </div>

                  {/* ข้อมูล */}
                  <div className="mt-10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5 group-hover:text-[#4361ee] transition">
                      {shop.shopName}
                      {shop.isOfficial && <BadgeCheck className="w-4 h-4 text-[#4361ee]" title="ร้านค้าทางการ" />}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {shop.shopDescription || 'ยินดีต้อนรับสู่ร้านค้าของเรา'}
                    </p>
                  </div>

                  {/* สถิติร้านค้า */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#2a2a3e]">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-white">{shop.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-gray-500">({shop.reviewCount || 0})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{shop.followerCount || 0}</span>
                      </div>
                    </div>
                    
                    <button className="flex items-center gap-1 text-[#4361ee] text-sm font-medium hover:text-white transition">
                      เข้าชมร้าน <ChevronRight className="w-4 h-4" />
                    </button>
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

export default Shops;