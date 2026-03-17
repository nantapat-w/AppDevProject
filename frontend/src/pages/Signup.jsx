import React, { useState } from 'react';
import { Mail, Lock, User, Loader2, ArrowLeft, Repeat } from 'lucide-react'; // 🟢 เพิ่ม ArrowLeft กับ Repeat
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo0.png';

const Signup = () => {
  const navigate = useNavigate();
  // 🟢 ตรงกับ Backend ของเราเป๊ะๆ: username, email, password
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 📝 จัดการการเปลี่ยนแปลงในฟอร์ม
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 ฟังก์ชันส่งข้อมูลสมัครสมาชิกใหม่ (User Registration)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 🔗 ยิง API Register (Path: /api/auth/register)
      // ส่ง Payload ไปคือ username, email, password
      // Backend จะทำการ hashing password และลงทะเบียน User ใหม่ลง Database
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);

      if (response.data.success) {
        alert('🎉 ยินดีด้วยเพื่อน! สมัครสมาชิกสำเร็จแล้ว กรุณาเข้าสู่ระบบ');
        navigate('/login'); // สมัครเสร็จแล้วก็นำทางไปยังหน้า Login เพื่อให้เขา Token ต่อ
      }
    } catch (error) {
      // ❌ กรณีล้มเหลว: เช่น อีเมลซ้ำ, ชื่อผู้ใช้ซ้ำ (ตรวจสอบโดย Unique Index ใน MongoDB)
      setErrorMsg(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8b2cf5] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* 🟢 ปุ่ม Logo กลับหน้าหลัก (มุมซ้ายบน) */}
      <Link to="/" className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 hover:opacity-80 transition z-20 group">
        <div className="w-10 h-10 rounded-xl bg-[#151522] border border-[#2a2a3e] flex items-center justify-center group-hover:border-[#8b2cf5] transition-all">
          <ArrowLeft className="text-gray-400 w-5 h-5 group-hover:text-white transition-colors" />
        </div>
        <div className="hidden sm:flex items-center gap-2 ml-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center shadow-[0_0_15px_rgba(139,44,245,0.4)] overflow-hidden">
            <img src={logo} alt="Shoplify Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
            Shoplify
          </span>
        </div>
      </Link>

      <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-8 shadow-2xl relative z-10">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#8b2cf5] mb-3">Sign Up</h1>
          <p className="text-gray-400 text-sm">สร้างบัญชีเพื่อเริ่มต้นใช้งาน</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* USERNAME */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider">USERNAME</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text" name="username" required minLength="3" maxLength="20"
                value={formData.username} onChange={handleChange}
                placeholder="ชื่อผู้ใช้ของคุณ"
                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm placeholder-gray-600"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email" name="email" required
                value={formData.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm placeholder-gray-600"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password" name="password" required minLength="6"
                value={formData.password} onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm placeholder-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 border-t border-[#2a2a3e] pt-6">
          มีบัญชีอยู่แล้วใช่ไหม? {' '}
          <Link to="/login" className="text-[#8b2cf5] font-bold hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;