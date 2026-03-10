import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Star, Package, ShieldCheck, MapPin, Settings, Edit3, Clock, Repeat, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('items'); 

  const [user, setUser] = useState(null);

  useEffect(() => {
    // 🟢 ดึงข้อมูลจาก LocalStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return null; 

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      
      {/* 1. Navbar */}
      <nav className="bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition group">
            <div className="p-2 bg-[#151522] rounded-lg border border-[#2a2a3e] group-hover:border-[#8b2cf5] transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium hidden sm:block">กลับหน้าหลัก</span>
          </Link>
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
            My Profile
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* 2. Profile Header */}
        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl overflow-hidden relative shadow-lg">
          <div className="h-32 md:h-48 bg-gradient-to-r from-[#2a1b41] to-[#162142] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b2cf5] opacity-20 blur-[80px] rounded-full"></div>
          </div>

          <div className="px-6 pb-6 relative flex flex-col md:flex-row gap-6 md:items-end -mt-12 md:-mt-16">
            
            <div className="relative z-10">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0a0a16] border-4 border-[#12121e] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(139,44,245,0.3)]">
                {user.imageProfile ? (
                  <img src={user.imageProfile} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-[#8b2cf5] rounded-full border-2 border-[#12121e] hover:bg-[#7220c7] transition text-white">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 z-10 mb-2">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{user.username}</h1>
                <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] text-blue-400 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </div>
              </div>
              <p className="text-gray-400 flex items-center gap-2 text-sm mb-3">
                <MapPin className="w-4 h-4" /> แอดเดรสยังไม่ระบุ • เข้าร่วมเมื่อเร็วๆ นี้
              </p>

              {/* 🟢 เพิ่มโซน ผู้ติดตาม (Followers / Following) ตรงนี้ครับ */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 cursor-pointer group">
                   <span className="font-bold text-white group-hover:text-[#8b2cf5] transition">{user.followers?.length || 0}</span>
                   <span className="text-gray-400 group-hover:text-gray-300 transition">ผู้ติดตาม</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer group">
                   <span className="font-bold text-white group-hover:text-[#8b2cf5] transition">{user.following?.length || 0}</span>
                   <span className="text-gray-400 group-hover:text-gray-300 transition">กำลังติดตาม</span>
                </div>
              </div>

            </div>

            <div className="z-10 mb-2">
              <button className="w-full md:w-auto px-6 py-2.5 bg-[#151522] border border-[#2a2a3e] rounded-lg text-sm font-medium hover:border-[#8b2cf5] hover:text-[#8b2cf5] transition flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" /> ตั้งค่าบัญชี
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-[#2a2a3e] bg-[#0a0a16]">
            <div className="p-4 text-center border-r border-[#2a2a3e]">
              <div className="flex items-center justify-center gap-1 text-[#8b2cf5] mb-1">
                <Star className="w-5 h-5 fill-[#8b2cf5]" />
                <span className="text-xl font-bold">{user.trustScore || '5.0'}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">TRUST SCORE</div>
            </div>
            <div className="p-4 text-center border-r border-[#2a2a3e]">
              <div className="text-xl font-bold text-white mb-1">{user.tradeCount || 0}</div>
              <div className="text-xs text-gray-500 font-medium">TOTAL TRADES</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xl font-bold text-green-400 mb-1">{user.successfulTrade || 0}</div>
              <div className="text-xs text-gray-500 font-medium">SUCCESSFUL</div>
            </div>
          </div>
        </div>

        {/* 3. เนื้อหาด้านล่าง */}
        <div className="mt-8">
          <div className="flex items-center gap-6 border-b border-[#2a2a3e] mb-6">
            <button 
              onClick={() => setActiveTab('items')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'items' ? 'text-[#8b2cf5]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className="flex items-center gap-2"><Package className="w-4 h-4" /> คลังสินค้าของฉัน</div>
              {activeTab === 'items' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'history' ? 'text-[#4361ee]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> ประวัติการเทรด</div>
              {activeTab === 'history' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-[#4361ee] to-[#8b2cf5]"></div>}
            </button>
          </div>

          {activeTab === 'items' && (
            <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#1c1c2b] rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-[#8b2cf5]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีสินค้าในคลัง</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm">คุณยังไม่ได้ลงประกาศสินค้าใดๆ เริ่มต้นเพิ่มไอเทมของคุณเพื่อนำไปเสนอแลกเปลี่ยนกับคนอื่นๆ ได้เลย!</p>
              
              {/* 🟢 ปุ่มเพิ่มสินค้าใหม่ */}
              <Link to="/create-product" className="px-6 py-2.5 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(139,44,245,0.4)] hover:opacity-90 transition inline-block">
                + เพิ่มสินค้าใหม่
              </Link>

            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#1c1c2b] rounded-full flex items-center justify-center mb-4">
                <Repeat className="w-8 h-8 text-[#4361ee]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีประวัติการเทรด</h3>
              <p className="text-sm text-gray-400">เมื่อคุณเริ่มแลกเปลี่ยนไอเทมสำเร็จ ประวัติทั้งหมดจะถูกบันทึกไว้ที่นี่</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;