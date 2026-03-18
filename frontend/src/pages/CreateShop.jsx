import React, { useState } from 'react';
import { axiosInstance } from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { Store, Upload, Save, ArrowLeft } from 'lucide-react';

const CreateShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 1. State สำหรับเก็บข้อมูล Text และไฟล์รูป
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [imageFile, setImageFile] = useState(null); // ไฟล์โลโก้ร้านของจริงที่จะส่งไป Backend
  const [previewUrl, setPreviewUrl] = useState(null); // URL จำลองไว้โชว์รูปให้ User ดูก่อนกดบันทึก

  // ─────────────────────────────────────────────────────────────────
  // 📷 ฟังก์ชัน: จัดการการเลือกรูปภาพ (เมื่อ User คลิกอัปโหลดรูป)
  // ─────────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // เซฟ object file แท้ๆ ไว้เตรียมส่ง
      setPreviewUrl(URL.createObjectURL(file)); // สร้าง URL จำลองชั่วคราวเพื่อโชว์รูป Preview ทันที
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // 🚀 ฟังก์ชัน: ทำการส่งข้อมูลทั้งหมดไปบันทึก (Submit ข้อมูล)
  // ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บ Refresh เมื่อกดปุ่ม Submit
    setLoading(true);

    try {
      // 🌟 หัวใจสำคัญ: ใช้ FormData เพื่อส่งไฟล์
      // เพราะถ้าส่งเป็น JSON ปกติ {shopName: "abc"} มันจะส่ง "ไฟล์รูป" ไปด้วยไม่ได้!
      const formData = new FormData();
      formData.append('shopName', shopName);
      formData.append('shopDescription', shopDescription);
      
      if (imageFile) {
        // ⚠️ ชื่อ 'shopLogo' ต้องสะกดตรงกับ uploadCloud.single("shopLogo") ที่เขียนไว้ใน Router ของ Backend
        formData.append('shopLogo', imageFile);
      }

      // 🔗 ไปที่ Backend: POST /api/shops/
      // 🛠️ Controller: createShop ใน shop.controller.js
      // 📤 ส่ง formData ทั้งยวง พร้อมแนบ cookies (withCredentials: true) เข้าด่าน protectRoute
      const response = await axiosInstance.post('/shops', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // ถ้าระบบ Backend สร้างสำเร็จและตอบ success กลับมา
      if (response.data.success) {
        alert('เปิดร้านค้าสำเร็จ!');
        navigate('/shops'); // เด้งผู้ใช้ไปหน้าดูร้านค้าทั้งหมด
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างร้านค้า');
    } finally {
      setLoading(false); // ปิดปุ่มโหลด
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft size={20} /> ย้อนกลับ
        </button>

        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Store className="text-[#8b2cf5]" /> สร้างร้านค้าของคุณ
        </h1>

        <form onSubmit={handleSubmit} className="bg-[#12121e] p-8 rounded-2xl border border-[#2a2a3e] space-y-6">
          
          {/* ส่วนอัปโหลดรูปภาพ */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-[#1c1c2b] rounded-full border-2 border-dashed border-[#2a2a3e] overflow-hidden flex items-center justify-center relative group">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="text-gray-500" />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-sm text-gray-400">คลิกเพื่อเลือกโลโก้ร้านค้า (JPG, PNG, WebP)</p>
          </div>

          {/* ชื่อร้าน */}
          <div>
            <label className="block text-sm mb-2">ชื่อร้านค้า *</label>
            <input 
              type="text" 
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="กรอกชื่อร้านของคุณ"
              className="w-full bg-[#1c1c2b] border border-[#2a2a3e] rounded-lg p-3 focus:border-[#8b2cf5] outline-none"
            />
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm mb-2">คำอธิบายร้านค้า</label>
            <textarea 
              rows="4"
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              placeholder="ร้านของคุณขายอะไร มีอะไรน่าสนใจ..."
              className="w-full bg-[#1c1c2b] border border-[#2a2a3e] rounded-lg p-3 focus:border-[#8b2cf5] outline-none"
            />
          </div>

          {/* ปุ่ม Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#8b2cf5] hover:bg-[#7a25d3] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'กำลังบันทึก...' : <><Save size={20} /> บันทึกข้อมูลร้านค้า</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateShop;