import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ArrowLeft, Store, Star, MapPin, X, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { axiosInstance } from '../utils/axios';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myShop, setMyShop] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.role === 'admin';

  // 🗑️ ฟังก์ชันสำหรับ Admin เพื่อลบร้านค้า (ลบแล้วสินค้าในร้านจะหายไปด้วย)
  const handleAdminDeleteShop = async (e, shopId, shopName) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`ลบร้านค้า "${shopName}" ออกจากระบบ? \nสินค้าทั้งหมดในร้านจะถูกลบด้วย!`)) return;
    try {
      await axiosInstance.delete(`/shops/${shopId}`);
      setShops(prev => prev.filter(s => s._id !== shopId));
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  };

  // 📦 ดึงรายชื่อร้านค้าทั้งหมด และร้านค้าของตัวเอง (ถ้ามี)
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('https://appdevproject2.onrender.com/api/shops');
        if (response.data.success) {
          setShops(response.data.data);
        }

        // ดึงข้อมูลร้านของตัวเองถ้าล็อกอินอยู่ (เพื่อแสดงปุ่ม "จัดการร้านค้า")
        if (currentUser) {
          const myShopRes = await axios.get('https://appdevproject2.onrender.com/api/shops/my-shop', { withCredentials: true });
          if (myShopRes.data.success && myShopRes.data.hasShop) {
            setMyShop(myShopRes.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  // 🔍 filter ร้านค้าตาม searchQuery แบบ real-time
  const filteredShops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter(shop =>
      shop.shopName?.toLowerCase().includes(q) ||
      shop.shopDescription?.toLowerCase().includes(q)
    );
  }, [shops, searchQuery]);

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      {/* 🟢 Header Section */}
      <div className="sticky top-0 z-50 bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-[#151522] rounded-full hover:bg-[#2a2a3e] hover:text-[#8b2cf5] transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-[#8b2cf5]" />
              <h1 className="text-xl font-bold">ร้านค้าทั้งหมด</h1>
            </div>
          </div>

          <div className="hidden md:block flex-1 max-w-xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อร้านค้า..."
              className="w-full bg-[#151522] border border-[#2a2a3e] rounded-full py-2 pl-5 pr-12 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm placeholder-gray-500"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1.5 p-1 bg-[#2a2a3e] rounded-full hover:bg-[#3a3a4e] transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            ) : (
              <button className="absolute right-1.5 top-1.5 p-1 bg-[#8b2cf5] rounded-full hover:bg-[#7220c7] transition">
                <Search className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          <div>
            {myShop ? (
              <Link to={`/shops/${myShop._id}`}>
                <button className="flex items-center gap-1.5 bg-gradient-to-r from-[#4361ee] to-[#8b2cf5] text-white text-sm font-bold py-2.5 px-5 rounded-full hover:shadow-[0_0_15px_rgba(67,97,238,0.4)] transition transform hover:-translate-y-0.5">
                  <Store className="w-4 h-4 font-bold" />
                  <span className="hidden sm:inline">จัดการร้านค้าของฉัน</span>
                </button>
              </Link>
            ) : (
              <Link to="/create-shop">
                <button className="flex items-center gap-1.5 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white text-sm font-bold py-2.5 px-5 rounded-full hover:shadow-[0_0_15px_rgba(139,44,245,0.4)] transition transform hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 font-bold" />
                  <span className="hidden sm:inline">สร้างร้านค้า</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 🟢 Body Section */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b2cf5]"></div>
          </div>
        ) : shops.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 bg-[#12121e] rounded-xl border border-[#2a2a3e] text-gray-400 mt-10">
            <Store className="w-16 h-16 mb-4 text-[#2a2a3e]" />
            <h3 className="text-xl font-medium text-gray-300">ยังไม่มีร้านค้าในระบบ</h3>
            <p className="text-sm mt-2 mb-6">มาเป็นคนแรกที่เปิดร้านค้าและเริ่มขายไอเทมกันเถอะ!</p>
            <Link to="/create-shop">
              <button className="bg-[#8b2cf5] text-white font-medium py-2 px-6 rounded-md hover:bg-[#7220c7] transition">
                เปิดร้านค้าฟรี
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* แสดงจำนวนผลลัพธ์เมื่อค้นหา */}
            {searchQuery && (
              <p className="text-sm text-gray-400 mb-4">
                พบ <span className="text-white font-bold">{filteredShops.length}</span> ร้านค้า สำหรับ "{searchQuery}"
              </p>
            )}

            {filteredShops.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-20 bg-[#12121e] rounded-xl border border-[#2a2a3e] text-gray-400">
                <Search className="w-12 h-12 mb-3 text-[#2a2a3e]" />
                <h3 className="text-lg font-medium text-gray-300">ไม่พบร้านค้าที่ค้นหา</h3>
                <p className="text-sm mt-1">ลองค้นหาด้วยคำอื่น หรือ
                  <button onClick={() => setSearchQuery('')} className="text-[#8b2cf5] ml-1 hover:underline">ล้างการค้นหา</button>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShops.map((shop) => (
                  <div key={shop._id} className="relative group">
                    <Link
                      to={`/shops/${shop._id}`}
                      className="block bg-[#12121e] rounded-xl border border-[#2a2a3e] p-5 hover:border-[#8b2cf5] transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(139,44,245,0.1)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#1c1c2b] border border-[#2a2a3e] flex-shrink-0 overflow-hidden group-hover:border-[#8b2cf5] transition-colors">
                          {shop.shopLogo ? (
                            <img src={shop.shopLogo} alt={shop.shopName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500 bg-gradient-to-tr from-[#1c1c2b] to-[#2a2a3e]">
                              {shop.shopName?.charAt(0) || 'S'}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-[#8b2cf5] transition-colors line-clamp-1">
                            {shop.shopName}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                            {shop.shopDescription || 'ไม่มีคำอธิบายร้านค้า'}
                          </p>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <span>{shop.rating || '5.0'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{shop.location || 'ออนไลน์'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    {/* 🗑️ ปุ่มลบสำหรับ Admin */}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleAdminDeleteShop(e, shop._id, shop.shopName)}
                        className="absolute top-3 right-3 p-2 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="ลบร้านค้า (Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shops;