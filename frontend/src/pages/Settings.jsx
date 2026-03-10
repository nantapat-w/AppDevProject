import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../utils/axios';
import { Camera, Phone, ArrowLeft, Save, Loader2 } from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // 📸 ฟังก์ชันเลือกรูปและ Preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // 🚀 ฟังก์ชันบันทึกข้อมูล (ยิง API ไปที่ Backend)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // เนื่องจากมีไฟล์รูป ต้องใช้ FormData
        const formData = new FormData();
        formData.append('phoneNumber', phoneNumber);
        if (imageFile) formData.append('imageProfile', imageFile);

        try {
            const res = await axiosInstance.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                alert('อัปเดตข้อมูลสำเร็จแล้วนายน้อย!');
                navigate('/profile'); // บันทึกเสร็จเด้งกลับหน้า Profile
            }
        } catch (error) {
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0D14] text-white p-6">
            {/* Header */}
            <div className="max-w-2xl mx-auto flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft size={20} /> กลับ
                </button>
                <h1 className="text-xl font-bold text-purple-400">Account Settings</h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-2xl mx-auto bg-[#11131A] border border-gray-800 rounded-2xl p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* ส่วนอัปโหลดรูปโปรไฟล์ */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-2 border-purple-500 overflow-hidden bg-[#1A1D24] flex items-center justify-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={40} className="text-gray-600" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition shadow-lg">
                                <Camera size={18} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500">คลิกที่ไอคอนกล้องเพื่อเปลี่ยนรูปโปรไฟล์</p>
                    </div>

                    <div className="space-y-6">
                        {/* ช่องเบอร์โทรศัพท์ */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="0XX-XXX-XXXX"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 rounded-xl py-3 pl-10 pr-4 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ปุ่มบันทึก */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;