import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, User, ShieldCheck, MapPin, CreditCard,
  ChevronRight, Save, Camera, Lock, Eye, EyeOff,
  Plus, Trash2, MapPinned, CreditCard as CardIcon,
  X, Check
} from 'lucide-react';

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
      const res = await axios.get('http://localhost:5000/api/account-settings/addresses', { withCredentials: true });
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
        res = await axios.put(`http://localhost:5000/api/account-settings/addresses/${editingAddress._id}`, formData, config);
      } else {
        res = await axios.post('http://localhost:5000/api/account-settings/addresses', formData, config);
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
      const res = await axios.delete(`http://localhost:5000/api/account-settings/addresses/${id}`, { withCredentials: true });
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/account-settings/addresses/${id}/default`, {}, { withCredentials: true });
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

  // ข้อมูลจำลองสำหรับ UI ส่วนอื่นๆ
  const [user, setUser] = useState({
    username: 'Nantapat.W',
    email: 'nantapat.w@example.com',
    fullName: 'Nantapat Wisetwongsa',
    phone: '081-234-5678',
    imageProfile: null
  });

  const tabs = [
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: <User className="w-5 h-5" /> },
    { id: 'security', label: 'ความปลอดภัย', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'address', label: 'ที่อยู่จัดส่ง', icon: <MapPin className="w-5 h-5" /> },
    { id: 'payment', label: 'ช่องทางชำระเงิน', icon: <CreditCard className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-[#2a2a3e]">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-[#0a0a16] border-2 border-[#2a2a3e] overflow-hidden shadow-2xl flex items-center justify-center">
                  {user.imageProfile ? (
                    <img src={user.imageProfile} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-500" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change Photo</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h3 className="text-xl font-bold">รูปโปรไฟล์ของคุณ</h3>
                <p className="text-sm text-gray-500 max-w-sm">แนะนำให้ใช้รูปที่มีขนาดไฟล์ไม่เกิน 2MB และเป็นไฟล์ประเภท .jpg หรือ .png</p>
                <div className="flex gap-3 justify-center sm:justify-start pt-2">
                  <button className="px-4 py-2 bg-[#8b2cf5] text-white text-xs font-bold rounded-lg hover:bg-[#7220c7] transition">Upload New</button>
                  <button className="px-4 py-2 bg-[#151522] border border-[#2a2a3e] text-gray-400 text-xs font-bold rounded-lg hover:text-white transition">Remove</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">Username</label>
                <input type="text" value={user.username} readOnly className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">Email Address</label>
                <input type="email" value={user.email} readOnly className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">Full Name</label>
                <input type="text" value={user.fullName} className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">Phone Number</label>
                <input type="text" value={user.phone} className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" />
              </div>
            </div>

            <div className="pt-6">
              <button className="px-8 py-4 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold rounded-xl shadow-[0_8px_25px_rgba(139,44,245,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                <Save className="w-5 h-5" /> บันทึกข้อมูล
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="pb-4 border-b border-[#2a2a3e]">
              <h3 className="text-xl font-bold flex items-center gap-2"><Lock className="w-6 h-6 text-[#8b2cf5]" /> เปลี่ยนรหัสผ่าน</h3>
              <p className="text-sm text-gray-400 mt-2">เพื่อความปลอดภัยของบัญชี เราแนะนำให้คุณเปลี่ยนรหัสผ่านทุกๆ 3-6 เดือน</p>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                  <input type="password" placeholder="••••••••" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition" />
                  <button className="absolute right-4 top-4 text-gray-500 hover:text-white transition"><Eye className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">รหัสผ่านใหม่</label>
                <div className="relative">
                  <input type="password" placeholder="••••••••" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#86efac] transition" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร มีทั้งตัวพิมพ์ใหญ่ และตัวเลข</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">ยืนยันรหัสผ่านใหม่</label>
                <div className="relative">
                  <input type="password" placeholder="••••••••" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#86efac] transition" />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button className="px-8 py-4 bg-[#8b2cf5] text-white font-bold rounded-xl shadow-[0_8px_25px_rgba(139,44,245,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
                อัปเดตรหัสผ่าน
              </button>
            </div>
          </div>
        );
      case 'address':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-[#2a2a3e]">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><MapPinned className="w-6 h-6 text-[#8b2cf5]" /> ที่อยู่สำหรับการจัดส่ง</h3>
                <p className="text-sm text-gray-400 mt-1">จัดการที่อยู่ของคุณเพื่อความรวดเร็วในการสั่งซื้อ</p>
              </div>
              {!isAdding && (
                <button 
                  onClick={() => { setIsAdding(true); setEditingAddress(null); setFormData(initialFormState); }}
                  className="p-2 bg-[#8b2cf5]/10 text-[#8b2cf5] border border-[#8b2cf5]/30 rounded-lg hover:bg-[#8b2cf5] hover:text-white transition"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
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
                      onChange={(e) => setFormData({...formData, label: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">เบอร์โทรศัพท์</label>
                    <input 
                      type="text" 
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">ที่อยู่ (เลขที่บ้าน, ถนน, ซอย)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.addressLine}
                      onChange={(e) => setFormData({...formData, addressLine: e.target.value})}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">แขวง / ตำบล</label>
                    <input 
                      type="text" 
                      required
                      value={formData.subDistrict}
                      onChange={(e) => setFormData({...formData, subDistrict: e.target.value})}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">เขต / อำเภอ</label>
                    <input 
                      type="text" 
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">จังหวัด</label>
                    <input 
                      type="text" 
                      required
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-1">รหัสไปรษณีย์</label>
                    <input 
                      type="text" 
                      required
                      value={formData.zipCode}
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, isDefault: !formData.isDefault})}
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
                {addresses.length === 0 ? (
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
                  addresses.map((addr) => (
                    <div key={addr._id} className={`p-6 bg-[#151522] border ${addr.isDefault ? 'border-[#8b2cf5]/50' : 'border-[#2a2a3e]'} rounded-2xl flex justify-between items-start group transition-all`}>
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-xl h-fit ${addr.isDefault ? 'bg-[#8b2cf5]/10' : 'bg-gray-500/10'}`}>
                          <MapPin className={`w-6 h-6 ${addr.isDefault ? 'text-[#8b2cf5]' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold">{addr.label}</h4>
                            {addr.isDefault ? (
                              <span className="px-2 py-0.5 bg-[#8b2cf5]/20 text-[#8b2cf5] text-[10px] rounded uppercase font-bold border border-[#8b2cf5]/30">Default</span>
                            ) : (
                              <button 
                                onClick={() => handleSetDefault(addr._id)}
                                className="text-[10px] text-gray-500 hover:text-[#8b2cf5] transition uppercase font-bold"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-white font-medium mt-2">{addr.fullName} ({addr.phoneNumber})</p>
                          <p className="text-sm text-gray-400 mt-1 max-w-md leading-relaxed">
                            {addr.addressLine}, {addr.subDistrict}, {addr.district}, {addr.province} {addr.zipCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(addr)} className="p-2 text-gray-500 hover:text-white transition"><Save className="w-5 h-5 text-gray-400 hover:text-[#8b2cf5]" /></button>
                        <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-gray-500 hover:text-red-500 transition"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-[#2a2a3e]">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6 text-[#8b2cf5]" /> ข้อมูลการชำระเงิน</h3>
                <p className="text-sm text-gray-400 mt-1">บันทึกบัตรเครดิต/เดบิตเพื่อความสะดวกรวดเร็ว</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#8b2cf5] text-white text-xs font-bold rounded-lg hover:opacity-90 transition">
                <Plus className="w-4 h-4" /> เพิ่มบัตรใหม่
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-[1.586/1] w-full max-w-[350px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border border-white/10 shadow-2xl group transition-transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b2cf5] opacity-10 blur-[50px] rounded-full"></div>
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-gradient-to-tr from-yellow-200 to-yellow-600 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-4 border border-black/20 rounded-sm"></div>
                  </div>
                  <div className="text-white font-bold italic text-lg opacity-80 uppercase">VISA</div>
                </div>
                <div className="space-y-4">
                  <div className="text-lg font-mono tracking-[0.2em] text-white">•••• •••• •••• 4242</div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] uppercase text-gray-500">Card Holder</div>
                      <div className="text-xs font-medium uppercase tracking-wider">NANTAPAT W.</div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase text-gray-500">Expires</div>
                      <div className="text-xs font-medium uppercase tracking-wider">12/26</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="aspect-[1.586/1] w-full max-w-[350px] bg-[#0a0a16] border-2 border-dashed border-[#2a2a3e] rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-500 hover:border-[#8b2cf5] hover:text-[#8b2cf5] transition cursor-pointer group">
                <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center transition-transform group-hover:scale-110">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Add New Payment Method</span>
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
      {/* Navbar */}
      <nav className="bg-[#0a0a16]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-[#151522] rounded-full hover:bg-[#2a2a3e] transition text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Account Settings</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Sidebar Layout */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl overflow-hidden p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white shadow-lg'
                      : 'text-gray-500 hover:bg-[#1c1c2b] hover:text-white'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>

            <div className="p-6 bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-500" /></div>
                <h4 className="font-bold text-red-500">Zone Danger</h4>
              </div>
              <p className="text-xs text-gray-500 mb-4">การลบบัญชีเป็นเรื่องละเอียดอ่อน ข้อมูลทั้งหมดของคุณจะหายไปอย่างถาวร</p>
              <button className="w-full py-3 border border-red-500/30 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/10 transition">ลบบัญชีผู้ใช้งาน</button>
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
