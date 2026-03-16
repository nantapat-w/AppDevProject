import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance } from '../utils/axios';
import {
  ArrowLeft, User, ShieldCheck, MapPin, CreditCard,
  ChevronRight, Save, Camera, Lock, Eye, EyeOff,
  Plus, Trash2, MapPinned, CreditCard as CardIcon,
  X, Check, LogOut, Store, Search, Bell, MessageSquare,
  Settings, UserRound, Calendar, FileText, ClipboardList, Package, Clock, ExternalLink,
  Pencil
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo0.png';
import axios from 'axios';
import Navbar from '../components/Navbar';

const AccountSetting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');

  // State for addresses
  const [addresses, setAddresses] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);



  // Form Data for Address
  const initialFormState = {
    label: '',
    fullName: '',
    phoneNumber: '',
    addressLine: '',
    subDistrict: '',
    district: '',
    province: '',
    zipCode: '',
    isDefault: false
  };
  const [formData, setFormData] = useState(initialFormState);

  // Check if we should switch to address tab (from Payment page)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  useEffect(() => {
    if (activeTab === 'address') {
      fetchAddresses();
    }
  }, [activeTab]);



  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/account-settings/addresses', { withCredentials: true });
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const config = { withCredentials: true };
      let res;

      if (editingAddress) {
        res = await axiosInstance.put(`/account-settings/addresses/${editingAddress._id}`, formData, config);
      } else {
        res = await axiosInstance.post('/account-settings/addresses', formData, config);
      }

      if (res.data.success) {
        setAddresses(res.data.addresses);
        setIsAdding(false);
        setEditingAddress(null);
        setFormData(initialFormState);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกที่อยู่');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('คุณต้องการลบที่อยู่นี้ใช่หรือไม่?')) return;
    try {
      setLoading(true);
      const res = await axiosInstance.delete(`/account-settings/addresses/${id}`, { withCredentials: true });
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await axiosInstance.patch(`/account-settings/addresses/${id}/default`, {}, { withCredentials: true });
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      addressLine: address.addressLine,
      subDistrict: address.subDistrict,
      district: address.district,
      province: address.province,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    setIsAdding(true);
  };

  // ข้อมูลผู้ใช้จาก backend
  const [user, setUser] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    imageProfile: null
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'success'|'error', text }

  // New state for dropdown and user from localStorage (for Navbar consistency)
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [userData, setUserData] = useState(currentUser);
  const [showDropdown, setShowDropdown] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Account deletion state
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // โหลดข้อมูล user จริงจาก backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setProfileLoading(true);
        const res = await axiosInstance.get('/auth/me');
        if (res.data.success) {
          const u = res.data.data;
          setUser({
            username: u.username || '',
            email: u.email || '',
            phoneNumber: u.phoneNumber || '',
            imageProfile: u.imageProfile || null,
            gender: u.gender || '',
            birthday: u.birthday ? new Date(u.birthday).toISOString().split('T')[0] : '',
            bio: u.bio || '',
          });
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchUser();
  }, []);

  // อัปโหลดรูปโปรไฟล์ทันทีเมื่อเลือกไฟล์
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview ทันที
    const previewUrl = URL.createObjectURL(file);
    setUser(prev => ({ ...prev, imageProfile: previewUrl }));

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('imageProfile', file);
      const res = await axiosInstance.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      if (res.data.success) {
        const newUrl = res.data.data?.imageProfile;
        if (newUrl) setUser(prev => ({ ...prev, imageProfile: newUrl }));
        // อัปเดต localStorage ถ้ามี
        const stored = localStorage.getItem('user');
        if (stored && stored !== 'undefined') {
          const parsed = JSON.parse(stored);
          parsed.imageProfile = newUrl || parsed.imageProfile;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
        setProfileMsg({ type: 'success', text: '✅ อัปโหลดรูปโปรไฟล์สำเร็จ!' });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setProfileMsg({ type: 'error', text: '❌ อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่' });
    } finally {
      setUploadingImage(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  // บันทึกข้อมูลโปรไฟล์ (เบอร์โทร, เพศ, วันเกิด, bio)
  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const res = await axiosInstance.put('/auth/profile', {
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        birthday: user.birthday,
        bio: user.bio
      }, {
        withCredentials: true,
      });
      if (res.data.success) {
        setProfileMsg({ type: 'success', text: '✅ บันทึกข้อมูลสำเร็จ!' });
        // Update localStorage if needed
        if (currentUser) {
          const updatedUser = { ...currentUser, phoneNumber: user.phoneNumber };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'บันทึกไม่สำเร็จ กรุณาลองใหม่';
      setProfileMsg({ type: 'error', text: `❌ ${msg}` });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setProfileMsg({ type: 'error', text: '❌ รหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setProfileMsg({ type: 'error', text: '❌ รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await axiosInstance.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, { withCredentials: true });

      if (res.data.success) {
        setProfileMsg({ type: 'success', text: '✅ เปลี่ยนรหัสผ่านสำเร็จ!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: `❌ ${err.response?.data?.message || 'เกิดข้อผิดพลาด'}` });
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setProfileMsg(null);

      // Step 1: Verify Password first
      const verifyRes = await axiosInstance.delete('/auth/account', {
        data: { password: deletePassword, verifyOnly: true },
        withCredentials: true
      });

      if (!verifyRes.data.success) {
        throw new Error(verifyRes.data.message || 'รหัสผ่านไม่ถูกต้อง');
      }

      // Step 2: Show confirmation ONLY if password is correct
      const isConfirmed = window.confirm("⚠️ คุณต้องการลบบัญชีผู้ใช้งานอย่างถาวรใช่หรือไม่?\n\nข้อมูลโปรไฟล์ ร้านค้า และสินค้าทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้");

      if (!isConfirmed) {
        setIsDeleting(false);
        return;
      }

      // Step 3: Perform actual deletion
      const res = await axiosInstance.delete('/auth/account', {
        data: { password: deletePassword },
        withCredentials: true
      });

      if (res.data.success) {
        // Clear all session and cache
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to Home as requested
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Account deletion error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      setProfileMsg({ type: 'error', text: `❌ ลบบัญชีไม่สำเร็จ: ${errorMsg}` });
    } finally {
      setIsDeleting(false);
      setDeletePassword(''); // Reset password on failure or after cancel
      setTimeout(() => setProfileMsg(null), 5000);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout', {});
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: <User className="w-5 h-5" /> },
    { id: 'security', label: 'ความปลอดภัย', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'address', label: 'ที่อยู่จัดส่ง', icon: <MapPin className="w-5 h-5" /> },


    { id: 'advanced', label: 'การตั้งค่าขั้นสูง', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Flash Message */}
            {profileMsg && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium ${profileMsg.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {profileMsg.text}
              </div>
            )}

            <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-[#2a2a3e]">
              <div className="relative group">
                <label htmlFor="profileImageInput" className="cursor-pointer block">
                  <div className="w-32 h-32 rounded-3xl bg-[#0a0a16] border-2 border-[#2a2a3e] overflow-hidden shadow-2xl flex items-center justify-center relative">
                    {user.imageProfile ? (
                      <img src={user.imageProfile} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-500" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                      {uploadingImage
                        ? <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
                        : <>
                          <Camera className="w-8 h-8 text-white mb-1" />
                          <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change Photo</span>
                        </>
                      }
                    </div>
                  </div>
                </label>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/jpg,image/jpeg,image/png"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h3 className="text-xl font-bold">รูปโปรไฟล์ของคุณ</h3>
                <p className="text-sm text-gray-500 max-w-sm">แนะนำให้ใช้รูปที่มีขนาดไฟล์ไม่เกิน 2MB และเป็นไฟล์ประเภท .jpg หรือ .png</p>
                <div className="flex gap-3 justify-center sm:justify-start pt-2">
                  <label htmlFor="profileImageInput" className="px-4 py-2 bg-[#8b2cf5] text-white text-xs font-bold rounded-lg hover:bg-[#7220c7] transition cursor-pointer flex items-center gap-2">
                    <Camera className="w-3 h-3" />
                    {uploadingImage ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปใหม่'}
                  </label>
                  <button
                    onClick={() => setUser(prev => ({ ...prev, imageProfile: null }))}
                    className="px-4 py-2 bg-[#151522] border border-[#2a2a3e] text-gray-400 text-xs font-bold rounded-lg hover:text-white transition"
                  >
                    ลบรูป
                  </button>
                </div>
              </div>
            </div>

            {profileLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#8b2cf5]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">Username</label>
                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={user.username} readOnly className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none text-gray-400 cursor-not-allowed shadow-inner" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">Email Address</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" value={user.email} readOnly className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none text-gray-400 cursor-not-allowed shadow-inner" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">เบอร์โทรศัพท์</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={user.phoneNumber}
                      onChange={(e) => setUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="เช่น 081-234-5678"
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">เพศ</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                      value={user.gender}
                      onChange={(e) => setUser(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner appearance-none"
                    >
                      <option value="">เลือกเพศ</option>
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">วันเกิด</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      value={user.birthday}
                      onChange={(e) => setUser(prev => ({ ...prev, birthday: e.target.value }))}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">เกี่ยวกับฉัน (Bio)</label>
                  <textarea
                    value={user.bio}
                    onChange={(e) => setUser(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="เขียนอะไรบางอย่างเกี่ยวกับตัวคุณ..."
                    rows="3"
                    className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            <div className="pt-6">
              <button onClick={handleSaveProfile} disabled={savingProfile} className="px-8 py-4 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold rounded-xl shadow-[0_8px_25px_rgba(139,44,245,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60">
                <Save className="w-5 h-5" /> {savingProfile ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <form onSubmit={handleUpdatePassword} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {profileMsg && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium ${profileMsg.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {profileMsg.text}
              </div>
            )}
            <div className="pb-4 border-b border-[#2a2a3e]">
              <h3 className="text-xl font-bold flex items-center gap-2"><Lock className="w-6 h-6 text-[#8b2cf5]" /> เปลี่ยนรหัสผ่าน</h3>
              <p className="text-sm text-gray-400 mt-2">เพื่อความปลอดภัยของบัญชี เราแนะนำให้คุณเปลี่ยนรหัสผ่านทุกๆ 3-6 เดือน</p>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-4 top-4 text-gray-500 hover:text-white transition"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">รหัสผ่านใหม่</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-4 text-gray-500 hover:text-white transition"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">ยืนยันรหัสผ่านใหม่</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-4 text-gray-500 hover:text-white transition"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-8 py-4 bg-[#8b2cf5] text-white font-bold rounded-xl shadow-[0_8px_25px_rgba(139,44,245,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {passwordLoading ? 'กำลังอัปเดต...' : 'อัปเดตรหัสผ่าน'}
              </button>
            </div>

            <div className="pt-4 mt-8 border-t border-[#2a2a3e] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151522]/50 p-6 rounded-2xl">
              <div className="text-center sm:text-left">
                <h4 className="font-bold text-gray-200">หากคุณลืมรหัสผ่าน?</h4>
                <p className="text-xs text-gray-500 mt-1">คุณสามารถขอรับลิงก์รีเซ็ตรหัสผ่านทางอีเมลเพื่อตั้งค่ารหัสผ่านใหม่</p>
              </div>
              <Link
                to="/forgot-password"
                state={{ from: 'account-settings' }}
                className="px-6 py-3 bg-[#12121e] border border-[#2a2a3e] text-[#8b2cf5] font-bold text-sm rounded-xl hover:bg-[#1c1c2b] hover:text-white transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> ใช้หน้าลืมรหัสผ่าน
              </Link>
            </div>
          </form>
        );
      case 'address':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-[#2a2a3e]">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><MapPinned className="w-6 h-6 text-[#8b2cf5]" /> ที่อยู่สำหรับการจัดส่ง</h3>
                <p className="text-sm text-gray-400 mt-1">จัดการที่อยู่ของคุณเพื่อความรวดเร็วในการสั่งซื้อ</p>
              </div>
            </div>

            {isAdding ? (
              <form onSubmit={handleSubmitAddress} className="space-y-6 bg-[#151522] border border-[#2a2a3e] p-6 rounded-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg">{editingAddress ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}</h4>
                  <button type="button" onClick={() => { setIsAdding(false); setEditingAddress(null); }} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">ชื่อเรียกที่อยู่ (เช่น บ้าน, ที่ทำงาน)</label>
                    <input
                      type="text"
                      required
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="เช่น บ้านของฉัน"
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">ชื่อ-นามสกุล ผู้รับ</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">ที่อยู่ (เลขที่บ้าน, ถนน, ซอย)</label>
                    <input
                      type="text"
                      required
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">แขวง / ตำบล</label>
                    <input
                      type="text"
                      required
                      value={formData.subDistrict}
                      onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">เขต / อำเภอ</label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">จังหวัด</label>
                    <input
                      type="text"
                      required
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">รหัสไปรษณีย์</label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.isDefault ? 'bg-[#8b2cf5]' : 'bg-[#2a2a3e]'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isDefault ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                  <label className="text-sm text-gray-400">ตั้งเป็นที่อยู่หลัก</label>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2">
                    {loading ? <Plus className="w-4 h-4 animate-spin" /> : editingAddress ? 'อัปเดตข้อมูล' : 'บันทึกที่อยู่'}
                  </button>
                  <button type="button" onClick={() => { setIsAdding(false); setEditingAddress(null); }} className="flex-1 py-3 bg-[#0a0a16] border border-[#2a2a3e] text-gray-400 font-bold rounded-xl hover:text-white transition">ยกเลิก</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {addresses.filter(a => a.label !== 'SYSTEM_RESERVED').length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-[#2a2a3e] rounded-2xl flex flex-col items-center justify-center text-gray-500 gap-4">
                    <MapPin className="w-12 h-12 opacity-20" />
                    <p>ยังไม่มีที่อยู่ถูกจัดส่งถูกบันทึกไว้</p>
                    <button
                      onClick={() => setIsAdding(true)}
                      className="text-[#8b2cf5] font-bold hover:underline"
                    >
                      เพิ่มที่อยู่แรกของคุณ
                    </button>
                  </div>
                ) : (
                  addresses
                    .filter(addr => addr.label !== 'SYSTEM_RESERVED')
                    .map((addr) => (
                      <div key={addr._id} className={`p-6 bg-[#151522] border ${addr.isDefault ? 'border-[#8b2cf5]/50' : 'border-[#2a2a3e]'} rounded-2xl flex justify-between items-start group transition-all`}>
                        <div className="flex-1 min-w-0 flex gap-4">
                          <div className={`p-3 rounded-xl h-fit flex-shrink-0 ${addr.isDefault ? 'bg-[#8b2cf5]/10' : 'bg-gray-500/10'}`}>
                            <MapPin className={`w-6 h-6 ${addr.isDefault ? 'text-[#8b2cf5]' : 'text-gray-500'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold truncate">{addr.label}</h4>
                              {addr.isDefault ? (
                                <span className="px-2 py-0.5 bg-[#8b2cf5]/20 text-[#8b2cf5] text-[10px] rounded uppercase font-bold border border-[#8b2cf5]/30">Default</span>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSetDefault(addr._id); }}
                                  className="text-[10px] text-gray-500 hover:text-[#8b2cf5] transition uppercase font-bold"
                                >
                                  Set as Default
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-white font-medium mt-2 truncate">{addr.fullName} ({addr.phoneNumber})</p>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed break-words">
                              {addr.addressLine}, {addr.subDistrict}, {addr.district}, {addr.province} {addr.zipCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 flex-shrink-0 relative z-[100]">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(addr); }} 
                            className="p-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition rounded-xl border border-blue-500/20 shadow-lg"
                            title="Edit Address"
                          >
                            <Pencil className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }} 
                            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition rounded-xl border border-red-500/20 shadow-lg"
                            title="Delete Address"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
                {addresses.filter(a => a.label !== 'SYSTEM_RESERVED').length > 0 && !isAdding && (
                  <button
                    onClick={() => { setIsAdding(true); setEditingAddress(null); setFormData(initialFormState); }}
                    className="w-full py-4 border-2 border-dashed border-[#2a2a3e] rounded-2xl flex items-center justify-center gap-3 text-gray-500 hover:border-[#8b2cf5] hover:text-[#8b2cf5] transition group mt-6"
                  >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                    <span className="font-bold">เพิ่มที่อยู่ใหม่</span>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 'advanced':


        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="pb-4 border-b border-[#2a2a3e]">
              <h3 className="text-xl font-bold flex items-center gap-2 text-red-500"><Settings className="w-6 h-6" /> การตั้งค่าขั้นสูง (Danger Zone)</h3>
              <p className="text-sm text-gray-400 mt-2">พื้นที่นี้มีการดำเนินการที่มีความเสี่ยงสูง โปรดระมัดระวังก่อนดำเนินการใดๆ</p>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-red-500" />
                <h4 className="font-bold text-lg text-red-500">ลบบัญชีผู้ใช้งาน</h4>
              </div>

              <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                <p className="font-bold text-gray-300">⚠️ รายละเอียดและเงื่อนไขการลบบัญชี:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>ข้อมูลโปรไฟล์ รูปภาพ และข้อมูลส่วนตัวทั้งหมดจะถูกลบอย่างถาวร</li>
                  <li>รายการสินค้าและร้านค้าของคุณจะถูกนำออกจากระบบ</li>
                  <li>ประวัติการทำรายการและการสนทนาจะไม่สามารถเข้าถึงได้อีกต่อไป</li>
                  <li>คุณจะไม่สามารถกลับมาใช้ชื่อผู้ใช้งาน (Username) เดิมได้</li>
                  <li><span className="text-red-400 font-bold">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span> โปรดแน่ใจก่อนทำการกดยืนยัน</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-red-500/10">
                <label className="flex items-center gap-4 group cursor-pointer p-4 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 transition-all mb-6">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.checked)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded border border-red-500/50 bg-[#151522] checked:bg-red-500 transition-all focus:outline-none"
                    />
                    <Check className="pointer-events-none absolute left-1 top-1 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white select-none transition-colors">
                    ฉันเข้าใจและยอมรับเงื่อนไขทั้งหมด และต้องการลบบัญชีของฉัน
                  </span>
                </label>

                {deleteConfirm && (
                  <div className="mb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">ยืนยันรหัสผ่านเพื่อลบบัญชี</label>
                    <div className="relative">
                      <input
                        type={showDeletePassword ? "text" : "password"}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="กรอกรหัสผ่านของคุณ"
                        className="w-full bg-[#0a0a16] border border-red-500/30 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-red-500 transition shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        className="absolute right-4 top-4 text-gray-500 hover:text-white transition"
                      >
                        {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {profileMsg && (
                      <div className={`mt-3 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200 ${profileMsg.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                        {profileMsg.text}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={!deleteConfirm || !deletePassword || isDeleting}
                  className="w-full sm:w-auto px-10 py-4 bg-red-500 text-white font-bold rounded-xl shadow-[0_8px_25px_rgba(239,68,68,0.3)] hover:bg-red-600 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังลบบัญชี...</>
                  ) : (
                    <><Trash2 className="w-5 h-5" /> ยืนยันการลบบัญชีถาวร</>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-20">

      {/* 🟢 Navbar (Synced with Home) */}
      <Navbar
        currentUser={userData}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
      />

      <div className="max-w-7xl mx-auto px-4 mt-12 pb-20">

        {/* Title above the box */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-[#12121e] border border-[#2a2a3e] rounded-xl hover:bg-[#1c1c2b] transition text-gray-400 hover:text-white group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              Account Setting
            </h1>
            <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลส่วนตัว ความปลอดภัย และการตั้งค่าบัญชีของคุณ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar Layout */}
          <div className="lg:col-span-3">
            <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl overflow-hidden p-2 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold transition-all mb-1 last:mb-0 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white shadow-lg'
                    : 'text-gray-500 hover:bg-[#1c1c2b] hover:text-white'
                    }`}
                >
                  <span className={activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-[#8b2cf5]'}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Layout */}
          <div className="lg:col-span-9 bg-[#12121e] border border-[#2a2a3e] rounded-3xl p-8 shadow-2xl min-h-[600px] relative overflow-hidden">
            {/* Decorative Background Glow */}
            <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-[#4361ee] opacity-[0.03] blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-[#8b2cf5] opacity-[0.03] blur-[100px] rounded-full"></div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
