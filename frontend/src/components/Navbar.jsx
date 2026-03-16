//ส่วนนี้ทำหน้าที่เป็น แถบเมนูด้านบนของเว็บ (Navigation Bar) ของแพลตฟอร์ม Shoplify

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageSquare, User, LogOut, ClipboardList, Settings, Store, Shield, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../utils/axios';

import logo from '../assets/logo0.png';


const API = '/api';


function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'เมื่อกี้';
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
}

function Avatar({ name, src, size = 9 }) {
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  return src ? (
    <img
      src={src}
      alt={name}
      className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-[#8b2cf5]/40`}
      onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
    />
  ) : (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#8b2cf5] to-[#4361ee] flex items-center justify-center text-white font-bold text-sm ring-2 ring-[#8b2cf5]/40`}>
      {initials}
    </div>
  );
}

const Navbar = ({ currentUser, showDropdown, setShowDropdown }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (e) => {
    e.preventDefault();
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    
  };
  const notifRef = useRef(null);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await axiosInstance.get('/notifications');

      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('fetch notifications error', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchCartCount();

    // Listen for storage events (cross-tab sync)
    const handleStorageChange = () => fetchCartCount();
    window.addEventListener('storage', handleStorageChange);
    
    // Custom interval to catch changes in the same tab (since we don't have a global state)
    const interval = setInterval(fetchCartCount, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // ปิด panel เมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      // 1. ถ้าคลิกนอกกรอบกระดิ่งแจ้งเตือน ให้ปิดการแจ้งเตือน
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      // 2. ถ้าคลิกนอกกรอบโปรไฟล์ ให้ปิด Dropdown เมนู
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) fetchCartCount(); // Update count when dropdown is opened
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowDropdown]); // 👈 ใส่ dependencies ด้วย

  const handleToggleNotifications = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    setShowDropdown(false);
    if (next && unreadCount > 0) {
      try {
        await axiosInstance.put('/notifications/mark-read', {});

        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout', {});

      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">

        <Link to="/" className="flex items-center gap-2 cursor-pointer w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center shadow-[0_0_15px_rgba(139,44,245,0.4)]">
            <img src={logo} alt="Shoplify Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
            Shoplify
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-3xl relative">

          <input
            type="text"
            value={searchQuery} // 2. ผูกค่าในช่องนี้ให้ตรงกับตัวแปร searchQuery
            onChange={(e) => setSearchQuery(e.target.value)} // 3. ทุกครั้งที่พิมพ์อักษรใหม่ ให้ไปอัปเดตค่าใน State
            placeholder="ค้นหาสินค้า..."
            className="w-full bg-[#151522] border border-[#2a2a3e] rounded-md py-2.5 pl-5 pr-12 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm placeholder-gray-500 text-white"
          />

          {/* 4. เติม type="submit" ให้ปุ่ม เพื่อให้ฟอร์มรู้ว่านี่คือปุ่มสำหรับตกลง/ค้นหา */}
          <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-[#8b2cf5] rounded-md hover:bg-[#7220c7] transition">
            <Search className="w-4 h-4 text-white" />
          </button>

        </form>

        <div className="flex items-center gap-5 w-auto justify-end">

          <Link to="/shops" className="hidden md:flex items-center gap-2 text-gray-300 hover:text-[#8b2cf5] font-medium transition-colors mr-2">
            <Store className="w-5 h-5" />
            ร้านค้า
          </Link>

          {/* 🔔 Notification Bell */}
          <div className="relative" ref={notifRef}>
            <div
              className="relative cursor-pointer hover:text-[#8b2cf5] transition"
              onClick={handleToggleNotifications}
            >
              <Bell className="w-6 h-6 text-gray-300 hover:text-[#8b2cf5] transition" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-[#12121e] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#2a2a3e] bg-[#0a0a16] flex justify-between items-center">
                  <h3 className="font-bold text-white">การแจ้งเตือน</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div
                        key={notif._id}
                        onClick={() => {
                          if (notif.type === 'NEW_LIKE' || notif.type === 'NEW_COMMENT') {
                            navigate(`/community?postId=${notif.linkId}`);
                          } else {
                            navigate(`/profile/${notif.sender._id}`);
                          }
                          setShowNotifications(false);
                        }}
                        className={`p-3 border-b border-[#2a2a3e]/50 hover:bg-[#1a1a2e] transition cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-[#1c1c2b]/60' : ''}`}
                      >
                        <Avatar name={notif.sender?.username} src={notif.sender?.imageProfile} size={10} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-200 leading-tight">
                            <span className="font-bold text-white">{notif.sender?.username}</span>{' '}
                            {notif.message || 'ได้เริ่มติดตามคุณ'}
                          </p>
                          <p className="text-xs text-[#8b2cf5] mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[#8b2cf5] mt-2 shrink-0" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <Bell className="w-10 h-10 text-[#2a2a3e] mb-3" />
                      <p className="text-sm text-gray-400">ไม่มีการแจ้งเตือนใหม่</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 💬 Chat */}
          <Link to="/chat" className="relative cursor-pointer hover:text-[#8b2cf5] transition">
            <MessageSquare className="w-6 h-6 text-gray-300 hover:text-[#8b2cf5] transition" />
          </Link>

          <div className="h-8 w-px bg-[#2a2a3e] mx-1"></div>

          <div className="relative" ref={dropdownRef}>
            {currentUser ? (
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
              >
                <div className="relative transition-all">
                  <Avatar
                    name={currentUser.username}
                    src={currentUser.imageProfile}
                    size={9}
                  />
                  {currentUser.role === 'admin' && (
                    <div className="absolute inset-0 rounded-full border-2 border-[#8b2cf5] pointer-events-none"></div>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate max-w-[100px]">
                  {currentUser.username}
                </span>

                {showDropdown && (
                  <div className="absolute right-0 top-12 w-56 bg-[#12121e] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-[#2a2a3e] bg-[#0a0a16]">
                      <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                    </div>
                    <div className="p-2">
                      {currentUser.role === 'admin' && (
                        <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-[#8b2cf5] hover:bg-[#8b2cf5]/10 rounded-lg transition-colors mb-1 font-bold">
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors">
                        <User className="w-4 h-4" /> โปรไฟล์ของฉัน
                      </Link>
                      <Link to="/cart" className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors mt-1">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" /> ตะกร้าสินค้า
                        </div>
                        {cartCount > 0 && (
                          <span className="bg-[#8b2cf5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                      <Link to="/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors mt-1">
                        <ClipboardList className="w-4 h-4" /> ประวัติการสั่งซื้อ
                      </Link>
                      <Link to="/account-settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors mt-1">
                        <Settings className="w-4 h-4" /> ตั้งค่าบัญชี
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" /> ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 cursor-pointer hover:text-[#8b2cf5] transition group">
                <div className="w-9 h-9 rounded-full bg-[#151522] border-2 border-[#2a2a3e] flex items-center justify-center overflow-hidden group-hover:border-[#8b2cf5]">
                  <User className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-300 group-hover:text-white">เข้าสู่ระบบ</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
