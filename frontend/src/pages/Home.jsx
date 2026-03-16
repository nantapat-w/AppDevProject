import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, MessageSquare, Bell, User, Star, Repeat, Users, PackageOpen, LogOut, Store, ClipboardList, Settings, Trash2 } from 'lucide-react';
import { axiosInstance } from '../utils/axios';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo0.png';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState(null);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('user')));

  // 🛠️ Helper: รองรับทั้ง relative path (/uploads/xxx) และ absolute URL (http://...)
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://appdevproject-4.onrender.com${path}`;

  };

  const [showDropdown, setShowDropdown] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchMyProfile = async () => { //หน้าโปรไฟล์
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return;
    try {
      const targetId = currentUser.id || currentUser._id;
      const res = await axiosInstance.get(`/auth/profile/${targetId}`);

      if (res.data.success) {
        setUserData(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error("Fetch profile error", err);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/products');

        if (response.data.success) {
          //เรียงลำดับจากวันที่สร้างล่าสุด (ใหม่สุดอยู่บนสุด)
          const sortedProducts = response.data.data.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          //ตัดเอามาแค่ 1 ชิ้นแรก (1 แถว แถวละ 4 ชิ้น)
          setProducts(sortedProducts.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSiteSettings = async () => {
      try {
        const response = await axiosInstance.get('/settings');

        if (response.data.success) {
          setSiteSettings(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      }
    };

    fetchProducts();
    fetchSiteSettings();
    fetchMyProfile();
  }, []);

  const handleAdminDeleteProduct = async (e, productId) => {
    e.stopPropagation();
    if (!window.confirm('ลบสินค้านี้ออกจากระบบ? (แอดมิน)')) return;
    try {
      const res = await axiosInstance.delete(`/products/${productId}`);
      if (res.data.success) {
        setProducts(prev => prev.filter(p => p._id !== productId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      <Navbar
        currentUser={userData} // ต้องเป็น userData ที่ผ่านการ fetchMyProfile แล้ว
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
      />

      {/* 🟢 Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[300px]">
          <div className="md:col-span-2 bg-gradient-to-br from-[#1c0d33] to-[#0a1128] rounded-xl border border-[#2a2a3e] p-8 flex flex-col justify-center relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#8b2cf5] opacity-20 blur-[100px] rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
            <span className="text-xs font-bold tracking-wider text-[#8b2cf5] mb-2 uppercase">PROMOTION</span>
            <h1 className="text-4xl font-bold mb-3 z-10 leading-tight">
              {siteSettings?.banner?.title || "เทศกาลแลกของ"} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                {siteSettings?.banner?.subtitle || "ลดค่าธรรมเนียม 50%"}
              </span>
            </h1>
            <p className="text-gray-400 mb-6 z-10">{siteSettings?.banner?.description || `ใช้โค้ด "TRADE50" เมื่อทำการยืนยันการแลกเปลี่ยน`}</p>
            <button
              onClick={() => navigate('/banner')}
              className="w-fit bg-[#8b2cf5] text-white font-medium py-2.5 px-8 rounded-md hover:bg-[#7220c7] transition z-10"
            >
              {siteSettings?.banner?.buttonText || "ดูรายละเอียด"}
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
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold border-l-4 border-[#8b2cf5] pl-3">สินค้ามาใหม่</h2>

          {/* เพิ่มปุ่มกดไปหน้าค้นหา เพื่อดูสินค้าทั้งหมด */}
          <Link to="/search" className="text-sm font-medium text-[#8b2cf5] hover:text-white transition-colors">
            ดูทั้งหมด &gt;
          </Link>
        </div>

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
                  {/* ปุ่มลบสำหรับ Admin */}
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={(e) => handleAdminDeleteProduct(e, item._id)}
                      className="absolute top-2 right-2 z-20 p-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                      title="ลบสินค้า (Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={getImageUrl(item.images[0])}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full items-center justify-center"
                    style={{ display: (item.images && item.images.length > 0) ? 'none' : 'flex' }}
                  >
                    <PackageOpen className="w-12 h-12 text-[#2a2a3e]" />
                  </div>
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