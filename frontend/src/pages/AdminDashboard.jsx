import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Settings, Ticket, Shield, Trash2, AlertCircle, CheckCircle2, Search, User, X, Plus, AlertTriangle, ShoppingBag, MessageSquare, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [settings, setSettings] = useState({
      banner: { title: '', subtitle: '', description: '', buttonText: '', promoCode: '' }
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
      code: '', discountType: 'percentage', discountValue: 0, minAmount: 0, expiryDate: '', usageLimit: 100
    });
    const [saving, setSaving] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Edit modals state
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isCouponEditModalOpen, setIsCouponEditModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    
    // Clear data state
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [clearConfirmText, setClearConfirmText] = useState('');
    const [clearing, setClearing] = useState(false);
    const [clearResult, setClearResult] = useState(null);
    
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = currentUser?._id;
    const userRole = currentUser?.role;




  // 🛡️ ตรวจสอบสิทธิ์ผู้ดูแลระบบ (Admin)
  useEffect(() => {
    if (!currentUser) {
      console.log("No user found in localStorage, redirecting to login");
      navigate('/login');
      return;
    }

    if (userRole !== 'admin') {
      console.log("User is not admin, role:", userRole, "redirecting to home");
      navigate('/');
      return;
    }

    // 👥 ดึงรายชื่อผู้ใช้ทั้งหมด
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users', { withCredentials: true });
        if (response.data.success) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // 🎫 ดึงข้อมูลคูปอง
    const fetchCoupons = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/coupons', { withCredentials: true });
        if (res.data.success) setCoupons(res.data.data);
      } catch (err) { console.error(err); }
    };

    // ⚙️ ดึงตั้งค่าเว็บไซต์
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings', { withCredentials: true });
        if (res.data.success && res.data.data) {
          setSettings(prev => ({
            ...prev,
            ...res.data.data,
            banner: { ...prev.banner, ...res.data.data.banner }
          }));
        }
      } catch (err) { console.error(err); }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchCoupons(), fetchSettings()]);
      setLoading(false);
    };

    loadData();
  }, [navigate, userId, userRole]);

  // ⚙️ อัปเดตการตั้งค่าเว็บไซต์ (รวมถึง Banner)
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. บันทึกข้อมูลตั้งค่า (Banner, Promo Code) ลง Database
      const res = await axios.put('http://localhost:5000/api/admin/settings', settings, { withCredentials: true });
      
      // 2. 🌟 บันทึกเนื้อหา Banner ลงไฟล์ BannerContent.txt บนเซิร์ฟเวอร์
      await axios.post('http://localhost:5000/api/admin/save-banner-file', {
          content: settings?.banner?.content || ''
      }, { withCredentials: true });

      if (res.data.success) {
         alert('บันทึกการตั้งค่า และอัปเดตไฟล์ BannerContent.txt เรียบร้อยแล้ว');
      }
    } catch (err) { 
      console.error(err); 
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
    setSaving(false);
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/coupons', newCoupon, { withCredentials: true });
      if (res.data.success) {
        setCoupons([res.data.data, ...coupons]);
        setIsModalOpen(false);
        setNewCoupon({ code: '', discountType: 'percentage', discountValue: 0, minAmount: 0, expiryDate: '', usageLimit: 100 });
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('ยืนยันการลบคูปองนี้?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/coupons/${id}`, { withCredentials: true });
      if (res.data.success) setCoupons(coupons.filter(c => c._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, { status: newStatus }, { withCredentials: true });
      if (response.data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, accountStatus: newStatus } : u));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("ไม่สามารถอัปเดตสถานะได้: " + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/users/${editingUser._id}`, editingUser, { withCredentials: true });
      if (response.data.success) {
        setUsers(users.map(u => u._id === editingUser._id ? response.data.data : u));
        setIsUserModalOpen(false);
        alert("อัปเดตข้อมูลผู้ใช้สำเร็จ");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("ไม่สามารถอัปเดตข้อมูลได้: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/coupons/${editingCoupon._id}`, editingCoupon, { withCredentials: true });
      if (response.data.success) {
        setCoupons(coupons.map(c => c._id === editingCoupon._id ? response.data.data : c));
        setIsCouponEditModalOpen(false);
        alert("อัปเดตคูปองสำเร็จ");
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      alert("ไม่สามารถอัปเดตคูปองได้: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, { withCredentials: true });
      if (response.data.success) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🛡️ Danger Zone: ล้างข้อมูลธุรกรรมทั้งหมดออกจากระบบ (ใช้ CONFIRM เพื่อยืนยัน)
  const handleClearAllData = async () => {
      if (clearConfirmText !== 'CONFIRM') return;
      setClearing(true);
      try {
          const res = await axios.delete('http://localhost:5000/api/admin/clear-data', { withCredentials: true });
          if (res.data.success) {
              setClearResult(res.data.deleted);
              setClearConfirmText('');
              alert('ล้างข้อมูลสำเร็จ!');
          }
      } catch (err) {
          console.error(err);
          alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
      } finally {
          setClearing(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      <Navbar
        currentUser={currentUser}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
      />

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition group mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>



                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-[#2a2a3e] mb-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'users' ? 'text-[#8b2cf5]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Users className="w-4 h-4" /> Users
                        {activeTab === 'users' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'settings' ? 'text-[#8b2cf5]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Settings className="w-4 h-4" /> Site Settings
                        {activeTab === 'settings' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'coupons' ? 'text-[#8b2cf5]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Ticket className="w-4 h-4" /> Coupons
                        {activeTab === 'coupons' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('danger')}
                        className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'danger' ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                    >
                        <AlertTriangle className="w-4 h-4" /> Danger Zone
                        {activeTab === 'danger' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-red-500"></div>}
                    </button>
                </div>

                {activeTab === 'users' && (
                    <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-[#2a2a3e] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <input 
                                    type="text" 
                                    placeholder="Search users by name or email..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#151522] border border-[#2a2a3e] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm text-gray-200"
                                />
                                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#12121e] text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Username</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2a2a3e]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#8b2cf5] mx-auto mb-4"></div>
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No users found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-[#151522] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#1c1c2b] flex items-center justify-center text-[#8b2cf5] font-bold text-xs ring-1 ring-[#2a2a3e]">
                                                            {user.imageProfile ? (
                                                                <img src={user.imageProfile} alt="" className="w-full h-full rounded-full object-cover" />
                                                            ) : (
                                                                user.username.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{user.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                        user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                                                        user.role === 'official_store' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                                        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                    }`}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                        user.accountStatus === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                        user.accountStatus === 'suspended' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                                                        'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {user.accountStatus.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => { setEditingUser({...user}); setIsUserModalOpen(true); }}
                                                            className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                                                            title="Edit"
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(user._id, user.accountStatus === 'active' ? 'suspended' : 'active')}
                                                            title={user.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                                                            className={`p-1.5 rounded-lg transition ${
                                                                user.accountStatus === 'active' ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-green-500 hover:bg-green-500/10'
                                                            }`}
                                                        >
                                                            {user.accountStatus === 'active' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                  <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-8 shadow-xl">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Settings className="text-[#8b2cf5]" /> เลือกปรับแต่งระบบ
                      </h2>
        
                      <form onSubmit={handleUpdateSettings} className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-[#2a2a3e] pb-2">Home Banner</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs text-gray-400 ml-1">ข้อความหลัก (Title)</label>
                              <input 
                                type="text" 
                                value={settings?.banner?.title || ''}
                                onChange={(e) => setSettings({...settings, banner: {...settings.banner, title: e.target.value}})}
                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition"
                                placeholder="เช่น เทศกาลแลกของ"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-gray-400 ml-1">หัวข้อรอง (Subtitle)</label>
                              <input 
                                type="text" 
                                value={settings?.banner?.subtitle || ''}
                                onChange={(e) => setSettings({...settings, banner: {...settings.banner, subtitle: e.target.value}})}
                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition"
                                placeholder="เช่น ลดค่าธรรมเนียม 50%"
                              />
                            </div>
                          </div>
        
                          <div className="space-y-2">
                            <label className="text-xs text-gray-400 ml-1">รายละเอียด (Description)</label>
                            <textarea 
                              value={settings?.banner?.description || ''}
                              onChange={(e) => setSettings({...settings, banner: {...settings.banner, description: e.target.value}})}
                              className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition h-24"
                              placeholder="เช่น ใช้โค้ด 'TRADE50'..."
                            />
                          </div>
        
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs text-gray-400 ml-1">ข้อความปุ่ม (Button Text)</label>
                              <input 
                                type="text" 
                                value={settings?.banner?.buttonText || ''}
                                onChange={(e) => setSettings({...settings, banner: {...settings.banner, buttonText: e.target.value}})}
                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-gray-400 ml-1">โค้ดที่แสดง (Promo Code)</label>
                               <input 
                                 type="text" 
                                 value={settings?.banner?.promoCode || ''}
                                 onChange={(e) => setSettings({...settings, banner: {...settings.banner, promoCode: e.target.value}})}
                                 className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition"
                               />
                            </div>
                          </div>
                        </div>
        
                        <div className="pt-4">
                          <button 
                            type="submit" 
                            disabled={saving}
                            className="w-full py-4 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition disabled:opacity-50"
                          >
                            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === 'coupons' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl overflow-hidden shadow-xl">
                      <div className="p-6 border-b border-[#2a2a3e] flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <Ticket className="text-yellow-500" /> จัดการคูปอง
                        </h2>
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> สร้างคูปอง
                        </button>
                      </div>
        
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#12121e] border-b border-[#2a2a3e]">
                              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">โค้ด</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ส่วนลด</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">เงื่อนไข (ขั้นต่ำ)</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">หมดอายุ</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ใช้งานแล้ว</th>
                              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2a2a3e]">
                            {coupons.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">ยังไม่มีคูปอง</td>
                              </tr>
                            ) : (
                              coupons.map((coupon) => (
                                <tr key={coupon._id} className="hover:bg-white/[0.02]">
                                  <td className="px-6 py-4 font-mono font-bold text-[#8b2cf5]">{coupon.code}</td>
                                  <td className="px-6 py-4">
                                    {coupon.discountValue} {coupon.discountType === 'percentage' ? '%' : '฿'}
                                  </td>
                                  <td className="px-6 py-4 text-gray-300">฿ {coupon.minAmount.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-sm text-gray-400">
                                    {new Date(coupon.expiryDate).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-xs">{coupon.usedCount} / {coupon.usageLimit}</span>
                                    <div className="w-24 h-1.5 bg-[#1c1c2b] rounded-full mt-1 overflow-hidden">
                                      <div 
                                        className="h-full bg-yellow-500" 
                                        style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                                      ></div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                          onClick={() => { setEditingCoupon({...coupon}); setIsCouponEditModalOpen(true); }}
                                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                                          title="Edit"
                                        >
                                          <Settings className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteCoupon(coupon._id)}
                                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'danger' && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#0a0a16] border border-red-500/30 rounded-2xl p-8 shadow-xl shadow-red-500/5">
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-red-400">
                                <AlertTriangle className="w-7 h-7" /> Danger Zone
                            </h2>
                            <p className="text-gray-500 text-sm mb-8">การกระทำเหล่านี้ไม่สามารถย้อนกลับได้ กรุณาใช้ด้วยความระมัดระวัง</p>

                            <div className="border border-red-500/20 rounded-xl p-6 bg-red-500/5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-red-400 mb-1">ล้างข้อมูลทั้งหมด</h3>
                                        <p className="text-sm text-gray-400 mb-3">ลบข้อมูลต่อไปนี้ออกจากระบบทั้งหมด:</p>
                                        <ul className="space-y-1.5 text-sm text-gray-400">
                                            <li className="flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-red-400/70" /> ร้านค้าทั้งหมด</li>
                                            <li className="flex items-center gap-2"><Package className="w-4 h-4 text-red-400/70" /> สินค้าทั้งหมด</li>
                                            <li className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-red-400/70" /> โพสต์และคอมเมนต์ใน Community ทั้งหมด</li>
                                            <li className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-400/70" /> คำสั่งซื้อและรายการแลกเปลี่ยนทั้งหมด</li>
                                        </ul>
                                        <p className="text-xs text-gray-600 mt-3">* ข้อมูล User, Coupon และ Site Settings จะยังคงอยู่</p>
                                    </div>
                                    <button
                                        onClick={() => { setIsClearModalOpen(true); setClearResult(null); setClearConfirmText(''); }}
                                        className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Clear Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

      </div>
      {/* Modal: สร้างคูปอง */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">สร้างคูปองใหม่</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">โค้ดคูปอง (เช่น SUMMER50)</label>
                <input
                  type="text" required
                  value={newCoupon.code || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: (e.target.value || '').toUpperCase() })}
                  className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">ประเภท</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                  >
                    <option value="percentage">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">จำนวนเงิน (฿)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">มูลค่า</label>
                  <input
                    type="number" required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">ขั้นต่ำ (฿)</label>
                  <input
                    type="number"
                    value={newCoupon.minAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minAmount: Number(e.target.value) })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">วันหมดอายุ</label>
                  <input
                    type="date" required
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400">จำกัดจำนวนครั้ง</label>
                <input
                  type="number"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                  className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                />
              </div>

              <button
                type="submit" disabled={saving}
                className="w-full py-3 bg-yellow-500 text-black font-bold rounded-xl mt-4 hover:bg-yellow-400 transition"
              >
                {saving ? 'กำลังสร้าง...' : 'สร้างคูปอง'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modal: แก้ไขผู้ใช้งาน */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">แก้ไขข้อมูลผู้ใช้</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              {/* Forms fields for user */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Username</label>
                <input
                  type="text" required
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Email</label>
                <input
                  type="email" required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                  >
                    <option value="user">User</option>
                    <option value="official_store">Official Store</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Status</label>
                  <select
                    value={editingUser.accountStatus}
                    onChange={(e) => setEditingUser({ ...editingUser, accountStatus: e.target.value })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              <button
                type="submit" disabled={saving}
                className="w-full py-3 bg-[#8b2cf5] text-white font-bold rounded-xl mt-4 hover:bg-[#7220c7] transition"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: แก้ไขคูปอง */}
      {isCouponEditModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">แก้ไขคูปอง</h3>
              <button onClick={() => setIsCouponEditModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleUpdateCoupon} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">โค้ดคูปอง</label>
                <input
                  type="text" required
                  value={editingCoupon.code}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">ประเภท</label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                  >
                    <option value="percentage">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">จำนวนเงิน (฿)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">มูลค่า</label>
                  <input
                    type="number" required
                    value={editingCoupon.discountValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">ขั้นต่ำ (฿)</label>
                  <input
                    type="number"
                    value={editingCoupon.minAmount}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minAmount: Number(e.target.value) })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">วันหมดอายุ</label>
                  <input
                    type="date" required
                    value={editingCoupon.expiryDate?.split('T')[0]}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400">จำกัดจำนวนครั้ง</label>
                <input
                  type="number"
                  value={editingCoupon.usageLimit}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: Number(e.target.value) })}
                  className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2"
                />
              </div>

              <button
                type="submit" disabled={saving}
                className="w-full py-3 bg-yellow-500 text-black font-bold rounded-xl mt-4 hover:bg-yellow-400 transition"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Clear All Data */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a16] border border-red-500/40 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> ยืนยันการล้างข้อมูล
              </h3>
              <button onClick={() => { setIsClearModalOpen(false); setClearResult(null); }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            {clearResult ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-400 font-bold mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> ล้างข้อมูลสำเร็จ!</p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex justify-between"><span>ร้านค้า</span><span className="font-mono text-red-400">{clearResult.shops} รายการ</span></li>
                    <li className="flex justify-between"><span>สินค้า</span><span className="font-mono text-red-400">{clearResult.products} รายการ</span></li>
                    <li className="flex justify-between"><span>โพสต์ Community</span><span className="font-mono text-red-400">{clearResult.communityPosts} รายการ</span></li>
                    <li className="flex justify-between"><span>คำสั่งซื้อ</span><span className="font-mono text-red-400">{clearResult.orders} รายการ</span></li>
                    <li className="flex justify-between"><span>การแลกเปลี่ยน</span><span className="font-mono text-red-400">{clearResult.trades} รายการ</span></li>
                  </ul>
                </div>
                <button
                  onClick={() => setIsClearModalOpen(false)}
                  className="w-full py-3 bg-[#1c1c2b] text-white font-bold rounded-xl hover:bg-[#2a2a3e] transition"
                >
                  ปิด
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-gray-300">
                  <p className="font-semibold text-red-400 mb-2">⚠️ คำเตือน: การดำเนินการนี้ไม่สามารถย้อนกลับได้!</p>
                  <p>จะทำการลบ <strong>ร้านค้า, สินค้า, โพสต์, คอมเมนต์, ออเดอร์</strong> และ <strong>การแลกเปลี่ยน</strong> ทั้งหมดออกจากระบบ</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">พิมพ์ <span className="font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">CONFIRM</span> เพื่อยืนยัน</label>
                  <input
                    type="text"
                    value={clearConfirmText}
                    onChange={(e) => setClearConfirmText(e.target.value)}
                    placeholder="พิมพ์ CONFIRM"
                    className="w-full bg-[#12121e] border border-red-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition text-white placeholder-gray-600"
                  />
                </div>
                <button
                  onClick={handleClearAllData}
                  disabled={clearConfirmText !== 'CONFIRM' || clearing}
                  className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {clearing ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> กำลังล้างข้อมูล...</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> ล้างข้อมูลทั้งหมด</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
