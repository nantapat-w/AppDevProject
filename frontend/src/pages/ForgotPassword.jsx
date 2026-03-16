import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance } from '../utils/axios';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromAccountSettings = location.state?.from === 'account-settings';
    
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleBack = () => {
        if (fromAccountSettings) {
            navigate('/account-settings');
        } else {
            navigate('/login');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await axiosInstance.post('/auth/forgot-password', { email: identifier });
            if (response.data.success) {
                setSuccessMsg('✅ ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว');
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'ไม่พบอีเมลในระบบ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8b2cf5] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

            <button 
                onClick={handleBack}
                className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 hover:opacity-80 transition z-20 group"
            >
                <div className="w-10 h-10 rounded-xl bg-[#151522] border border-[#2a2a3e] flex items-center justify-center group-hover:border-[#8b2cf5] transition-all">
                    <ArrowLeft className="text-gray-400 w-5 h-5 group-hover:text-white transition-colors" />
                </div>
            </button>

            <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] mb-3">
                        Forgot Password?
                    </h1>
                    <p className="text-gray-400 text-sm">ระบุอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center animate-in fade-in duration-300">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm p-3 rounded-lg mb-6 text-center animate-in fade-in duration-300">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Email / Username</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="ใส่อีเมลของคุณ"
                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm placeholder-gray-600"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 shadow-[0_8px_25px_rgba(139,44,245,0.3)]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Send Reset Link <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400 border-t border-[#2a2a3e] pt-6">
                    จำรหัสผ่านได้แล้ว? {' '}
                    <Link to="/login" className="text-[#8b2cf5] font-bold hover:underline">
                        เข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
