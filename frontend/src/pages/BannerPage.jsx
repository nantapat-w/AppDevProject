import React, { useState, useEffect } from 'react';
import { axiosInstance as axios } from '../utils/axios';
import { ArrowLeft, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const BannerPage = () => {
  const navigate = useNavigate();
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 🌟 State สำหรับเก็บข้อความที่อ่านมาจากไฟล์ .txt
  const [bannerFileText, setBannerFileText] = useState(""); 
  
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // 🌟 เพิ่ม State สำหรับคุมการเปิด/ปิด Dropdown ของ Navbar
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ดึงข้อมูลหัวข้อและโค้ดโปรโมชั่นจาก Database
        const settingsRes = await axios.get('/settings');
        if (settingsRes.data.success) {
          setSiteSettings(settingsRes.data.data);
        }

        // 2. 🌟 ดึงเนื้อหารายละเอียดจากไฟล์ BannerContent.txt ผ่าน Backend
        const fileRes = await axios.get('/get-banner-file');
        if (fileRes.data.success) {
            setBannerFileText(fileRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      <Navbar 
        currentUser={currentUser} 
        showDropdown={showDropdown} 
        setShowDropdown={setShowDropdown} 
      />

      <div className="max-w-[1350px] mx-auto px-4 mt-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition group mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">กลับหน้าหลัก</span>
        </button>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#8b2cf5]"></div>
          </div>
        ) : (
          <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl overflow-hidden shadow-xl">
            {/* Header / Hero */}
            <div className="bg-gradient-to-br from-[#1c0d33] to-[#0a1128] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#8b2cf5] opacity-20 blur-[100px] rounded-full"></div>
              <span className="text-sm font-bold tracking-wider text-[#8b2cf5] mb-2 uppercase block">PROMOTION</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 z-10 leading-tight">
                {siteSettings?.banner?.title || "เทศกาลแลกของ"} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                  {siteSettings?.banner?.subtitle || "ลดค่าธรรมเนียม 50%"}
                </span>
              </h1>
              <p className="text-gray-300 text-lg z-10 max-w-2xl">
                {siteSettings?.banner?.description}
              </p>
              
              {siteSettings?.banner?.promoCode && (
                <div className="mt-8 inline-flex items-center gap-3 bg-black/40 border border-[#8b2cf5]/50 px-6 py-3 rounded-lg z-10 relative backdrop-blur-sm">
                  <Ticket className="w-6 h-6 text-[#8b2cf5]" />
                  <div>
                    <div className="text-xs text-gray-400">ใช้โค้ดโปรโมชั่น</div>
                    <div className="font-mono text-xl font-bold tracking-wider text-white">
                      {siteSettings.banner.promoCode}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* เนื้อหารายละเอียด (Content) */}
            <div className="p-8 md:p-10">
              <h3 className="text-xl font-bold border-l-4 border-[#8b2cf5] pl-3 mb-6">รายละเอียดและเงื่อนไข</h3>
              <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-line leading-relaxed">
                {/* 🌟 แสดงข้อความจากไฟล์ .txt ตรงนี้ 🌟 */}
                {bannerFileText ? (
                   bannerFileText
                ) : (
                   <p className="text-gray-500 italic">ยังไม่มีรายละเอียดระบุไว้ในขณะนี้</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerPage;
