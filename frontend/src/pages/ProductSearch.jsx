import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const ProductSearch = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || ''; 
  
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [userData, setUserData] = useState(currentUser);
  const [showDropdown, setShowDropdown] = useState(false);

  const [allProducts, setAllProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 🟢 1. State สำหรับระบบแบ่งหน้า (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; // กำหนดให้แสดงหน้าละ 30 ชิ้น

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!currentUser) return;
      try {
        const targetId = currentUser.id || currentUser._id;
        const res = await axios.get(`http://localhost:5000/api/auth/profile/${targetId}`, { withCredentials: true });
        if (res.data.success) {
          setUserData(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }
      } catch (err) {
        console.error("Fetch profile error", err);
      }
    };
    fetchMyProfile();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data.success) {
          
          let fetchedProducts = response.data.data;

          if (response.data.success) {
          let fetchedProducts = response.data.data;
          // ใช้ข้อมูลจริงจาก Database ทันที
          setAllProducts(fetchedProducts); 
        }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ระบบกรองข้อมูล (Filter)
  useEffect(() => {
    if (!q) {
      setFilteredProducts(allProducts);
    } else {
      const lowerCaseQuery = q.toLowerCase();
      const matched = allProducts.filter(item => 
        item.productName.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredProducts(matched);
    }
    setCurrentPage(1); // 🟢 สำคัญ: เวลากดค้นหาคำใหม่ ต้องรีเซ็ตกลับไปหน้า 1 เสมอ
  }, [q, allProducts]);

  // 🟢 2. คำนวณข้อมูลสำหรับการแบ่งหน้า
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // ตัดมาเฉพาะสินค้า 30 ชิ้นของหน้าปัจจุบัน
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem); 

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      
      <Navbar 
        currentUser={userData} 
        showDropdown={showDropdown} 
        setShowDropdown={setShowDropdown} 
      />

      <div className="max-w-7xl mx-auto px-4 mt-10">
        
        {/* 🟢 3. เปลี่ยนหัวข้ออัจฉริยะ */}
        <div className="bg-[#12121e] border border-[#2a2a3e] text-white py-3 px-6 mb-8 font-bold text-xl inline-block rounded-xl shadow-lg">
          {q ? (
            <>ผลการค้นหา : <span className="text-[#8b2cf5]">{q}</span></>
          ) : (
            <span className="text-[#8b2cf5]">สินค้าทั้งหมด</span>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b2cf5]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 bg-[#12121e] rounded-xl border border-[#2a2a3e] text-gray-400">
            <PackageOpen className="w-16 h-16 mb-4 text-[#2a2a3e]" />
            <h3 className="text-xl font-medium text-gray-300">ไม่พบสินค้าที่ตรงกับ "{q}"</h3>
          </div>
        ) : (
          <>
            {/* 🟢 4. โครงสร้างตาราง (บังคับ md:grid-cols-3 เพื่อให้ได้แถวละ 3 ชิ้นเป๊ะๆ) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              
              {/* วนลูปจาก currentItems (ที่ไม่เกิน 30 ชิ้น) แทน filteredProducts ทั้งหมด */}
              {currentItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-[#12121e] rounded-md border border-[#2a2a3e] overflow-hidden hover:border-[#8b2cf5] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col shadow-lg"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="aspect-square bg-[#1c1c2b] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded text-[10px] font-bold text-white z-10">
                      {item.tradeType === 'TRADE_ONLY' ? 'TRADE ONLY' : item.tradeType === 'SELL_ONLY' ? 'SELL ONLY' : 'SELL & TRADE'}
                    </div>
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

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sm font-medium text-gray-200 line-clamp-2 mb-2 group-hover:text-white">
                      {item.productName}
                    </h3>

                    <div className="mt-auto">
                      <div className="text-[#8b2cf5] font-bold text-lg mb-1">
                        {item.tradeType === 'TRADE_ONLY' ? 'เสนอแลก' : `฿ ${item.price?.toLocaleString() || 0}`}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#2a2a3e]">
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

            {/* 🟢 5. UI ส่วนของปุ่มแบ่งหน้า (Pagination) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-[#2a2a3e]">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-[#151522] border border-[#2a2a3e] text-white hover:border-[#8b2cf5] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-gray-400 font-medium">
                  หน้า <span className="text-white font-bold">{currentPage}</span> จาก <span className="text-white font-bold">{totalPages}</span>
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-[#151522] border border-[#2a2a3e] text-white hover:border-[#8b2cf5] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;