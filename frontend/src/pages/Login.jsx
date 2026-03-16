import React, { useState } from 'react';
import { Lock, User, ArrowRight, Loader2, Repeat, ArrowLeft } from 'lucide-react'; // 🟢 นำเข้า Repeat เพิ่ม
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo0.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post('https://appdevproject-3.onrender.com/api/auth/login', formData, {
        withCredentials: true
      });

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4361ee] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* 🟢 ปุ่ม Logo กลับหน้าหลัก (มุมซ้ายบน) */}
      <Link to="/" className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 hover:opacity-80 transition z-20 group">
        <div className="w-10 h-10 rounded-xl bg-[#151522] border border-[#2a2a3e] flex items-center justify-center group-hover:border-[#4361ee] transition-all">
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
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EMAIL OR USERNAME */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider">EMAIL OR USERNAME</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text" name="identifier" required
                value={formData.identifier} onChange={handleChange}
                placeholder="ใส่อีเมล หรือ ชื่อผู้ใช้"
                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#4361ee] transition-all text-sm placeholder-gray-600"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-gray-400 tracking-wider">PASSWORD</label>
              <Link to="/forgot-password" className="text-[11px] text-[#4361ee] hover:underline">ลืมรหัสผ่าน?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password" name="password" required
                value={formData.password} onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#4361ee] transition-all text-sm placeholder-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#4361ee] to-[#8b2cf5] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 border-t border-[#2a2a3e] pt-6">
          ยังไม่มีบัญชีใช่ไหม? {' '}
          <Link to="/signup" className="text-[#4361ee] font-bold hover:underline">
            สมัครสมาชิกฟรี
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;