import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Settings, Ticket, Shield, Trash2, AlertCircle, CheckCircle2, Search, User, X, Plus } from 'lucide-react';
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

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = currentUser?._id;
  const userRole = currentUser?.role;

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

    const fetchCoupons = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/coupons', { withCredentials: true });
        if (res.data.success) setCoupons(res.data.data);
      } catch (err) { console.error(err); }
    };

    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings', { withCredentials: true });
        if (res.data.success && res.data.data) {
          // Merge with default to ensure banner exists
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

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. เซฟตั้งค่าอื่นๆ (ชื่อโปรโมชั่น, โค้ด) ลง Database ปกติ
      const res = await axios.put('http://localhost:5000/api/admin/settings', settings, { withCredentials: true });
      
      // 2. 🌟 ยิง API ไปให้ server.js สร้างไฟล์ .txt 🌟
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

        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
          Admin Dashboard
        </h1>

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
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              user.role === 'official_store' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.accountStatus === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              user.accountStatus === 'suspended' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {user.accountStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingUser({ ...user }); setIsUserModalOpen(true); }}
                              className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(user._id, user.accountStatus === 'active' ? 'suspended' : 'active')}
                              title={user.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                              className={`p-1.5 rounded-lg transition ${user.accountStatus === 'active' ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-green-500 hover:bg-green-500/10'
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
                        onChange={(e) => setSettings({ ...settings, banner: { ...settings.banner, title: e.target.value } })}
                        className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition"
                        placeholder="เช่น เทศกาลแลกของ"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 ml-1">หัวข้อรอง (Subtitle)</label>
                      <input
                        type="text"
                        value={settings?.banner?.subtitle || ''}
                        onChange={(e) => setSettings({ ...settings, banner: { ...settings.banner, subtitle: e.target.value } })}
                        className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition"
                        placeholder="เช่น ลดค่าธรรมเนียม 50%"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 ml-1">รายละเอียด (Description)</label>
                    <textarea
                      value={settings?.banner?.description || ''}
                      onChange={(e) => setSettings({ ...settings, banner: { ...settings.banner, description: e.target.value } })}
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
                        onChange={(e) => setSettings({ ...settings, banner: { ...settings.banner, buttonText: e.target.value } })}
                        className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 ml-1">โค้ดที่แสดง (Promo Code)</label>
                      <input
                        type="text"
                        value={settings?.banner?.promoCode || ''}
                        onChange={(e) => setSettings({ ...settings, banner: { ...settings.banner, promoCode: e.target.value } })}
                        className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition"
                      />
                    </div>
                  </div>

                  {/* เนื้อหารายละเอียด (Content) & Import .txt */}
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-xs text-gray-400 ml-1">เนื้อหารายละเอียดโปรโมชั่น (Content)</label>
                      <label className="text-xs bg-[#2a2a3e] hover:bg-[#8b2cf5] text-white py-1.5 px-3 rounded cursor-pointer transition flex items-center gap-2">
                        <span>เลือกไฟล์ .txt</span>
                        <input
                          type="file"
                          accept=".txt"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.type === "text/plain" || file.name.endsWith('.txt')) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setSettings({
                                    ...settings,
                                    banner: { ...settings.banner, content: event.target.result }
                                  });
                                };
                                reader.readAsText(file);
                              } else {
                                alert("กรุณาอัปโหลดไฟล์ .txt เท่านั้น");
                              }
                            }
                            e.target.value = null;
                          }}
                        />
                      </label>
                    </div>
                    <textarea
                      value={settings?.banner?.content || ''}
                      onChange={(e) => setSettings({ ...settings, banner: { ...settings.banner, content: e.target.value } })}
                      className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:border-[#8b2cf5] transition h-48"
                      placeholder="พิมพ์เนื้อหาฉบับเต็มที่นี่ หรือกด เลือกไฟล์ .txt..."
                    />
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
                                onClick={() => { setEditingCoupon({ ...coupon }); setIsCouponEditModalOpen(true); }}
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
    </div>
  );
};

export default AdminDashboard;
