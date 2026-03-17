import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2, Repeat, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../utils/axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [success, setSuccess] = useState(false);

    // 🔑 ส่งคำขอเปลี่ยนรหัสผ่านใหม่ (Reset Password Recovery Flow)
    const handleSubmit = async (e) => {
        e.preventDefault();
        // 1. ตรวจสอบเบื้องต้น (Client-side Validation)
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMsg('รหัสผ่านไม่ตรงกัน');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            // 🔗 PUT /api/auth/reset-password/:token
            // ใช้ Token ที่ได้รับจาก URL (ส่งผ่านอีเมลมา) เพื่อยืนยันสิทธิ์ในการเปลี่ยนรหัสผ่าน
            const response = await axiosInstance.put(`/auth/reset-password/${token}`, {
                newPassword: passwordData.newPassword
            });
            if (response.data.success) {
                setSuccess(true);
                // 🕒 แสดงสถานะสำเร็จ 3 วินาทีเพื่อให้ User อุ่นใจ ก่อนพาวาร์ปไปหน้า Login
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (error) {
            // ❌ กรณี Token หมดอายุ (ปกติจะหมดอายุใน 1 ชม.) หรือเคยถูกใช้งานไปแล้ว
            setErrorMsg(error.response?.data?.message || 'Token ไม่ถูกต้องหรือหมดอายุ');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500 opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-10 shadow-2xl relative z-10 text-center">
                    <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="text-green-400 w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Reset Successful!</h1>
                    <p className="text-gray-400 mb-8">เปลี่ยนรหัสผ่านสำเร็จแล้ว ระบบจะพาคุณกลับไปหน้า Login ในครู่เดียว...</p>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4361ee] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] mb-3">
                        New Password
                    </h1>
                    <p className="text-gray-400 text-sm">กำหนดรหัสผ่านใหม่สำหรับเข้าสู่ระบบ</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center animate-in fade-in duration-300">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 tracking-wider">NEW PASSWORD</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3.5 pl-11 pr-12 focus:outline-none focus:border-[#4361ee] transition-all text-sm placeholder-gray-600"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 tracking-wider">CONFIRM PASSWORD</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#4361ee] transition-all text-sm placeholder-gray-600"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#4361ee] to-[#8b2cf5] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 shadow-[0_8px_25px_rgba(67,97,238,0.3)]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Reset Password <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
