import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../utils/axios';
import { 
    Search, Bell, MessageSquare, User, LogOut, Store, 
    ArrowLeft, ClipboardList, Repeat, Package, Clock, 
    MapPin, CreditCard, ChevronRight, ShoppingBag 
} from 'lucide-react';
import axios from 'axios';
import logo from '../assets/logo0.png';

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const res = await axiosInstance.get('/orders/my-orders', { withCredentials: true });
            if (res.data.success) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-20">
            {/* 🟢 Navbar */}
            <nav className="sticky top-0 z-50 bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-3 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                    <Link to="/" className="flex items-center gap-2 cursor-pointer w-fit">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center shadow-[0_0_15px_rgba(139,44,245,0.4)]">
                            <img src={logo} alt="TradeApp Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                            Shoplify
                        </span>
                    </Link>

                    <div className="flex-1 max-w-3xl relative">
                        <input
                            type="text"
                            placeholder="ค้นหาสินค้า หรือ ร้านค้า..."
                            className="w-full bg-[#151522] border border-[#2a2a3e] rounded-md py-2.5 pl-5 pr-12 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm placeholder-gray-500"
                        />
                        <button className="absolute right-2 top-1.5 p-1.5 bg-[#8b2cf5] rounded-md hover:bg-[#7220c7] transition">
                            <Search className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    <div className="flex items-center gap-5 w-auto justify-end">
                        <Link to="/shops" className="hidden md:flex items-center gap-2 text-gray-300 hover:text-[#8b2cf5] font-medium transition-colors mr-2">
                            <Store className="w-5 h-5" />
                            ร้านค้า
                        </Link>

                        <div className="relative cursor-pointer hover:text-[#8b2cf5] transition">
                            <Bell className="w-6 h-6 text-gray-300" />
                        </div>
                        <div className="relative cursor-pointer hover:text-[#8b2cf5] transition">
                            <MessageSquare className="w-6 h-6 text-gray-300" />
                        </div>
                        <div className="h-8 w-px bg-[#2a2a3e] mx-1"></div>

                        <div className="relative">
                            {currentUser ? (
                                <div
                                    className="flex items-center gap-2 cursor-pointer group"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <div className="w-9 h-9 rounded-full bg-[#151522] border-2 border-[#2a2a3e] flex items-center justify-center overflow-hidden group-hover:border-[#8b2cf5] transition-all">
                                        <User className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate max-w-[100px]">
                                        {currentUser.username}
                                    </span>

                                    {showDropdown && (
                                        <div className="absolute right-0 top-12 w-48 bg-[#12121e] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                            <div className="px-4 py-3 border-b border-[#2a2a3e] bg-[#0a0a16]">
                                                <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors">
                                                    <User className="w-4 h-4" /> โปรไฟล์ของฉัน
                                                </Link>
                                                <Link to="/account-settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors mt-1">
                                                    <ClipboardList className="w-4 h-4" /> ตั้งค่าบัญชี
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
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 mt-12 pb-20">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-[#12121e] border border-[#2a2a3e] rounded-xl hover:bg-[#1c1c2b] transition text-gray-400 hover:text-white group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                            ประวัติการสั่งซื้อ
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">ดูรายการที่คุณเคยสั่งซื้อทั้งหมด</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="ml-auto p-3 bg-[#12121e] border border-[#2a2a3e] rounded-xl hover:text-[#8b2cf5] transition-colors"
                        title="รีเฟรช"
                    >
                        <Repeat className="w-5 h-5" />
                    </button>
                </div>

                {ordersLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-12 h-12 border-4 border-[#2a2a3e] border-t-[#8b2cf5] rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 bg-[#12121e] border border-[#2a2a3e] rounded-3xl gap-6 grayscale opacity-60">
                        <div className="w-24 h-24 bg-[#151522] rounded-full flex items-center justify-center border-2 border-dashed border-[#2a2a3e]">
                            <Package className="w-12 h-12 text-gray-500" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-lg font-bold text-white mb-2">ยังไม่มีประวัติการสั่งซื้อ</h4>
                            <p className="text-sm text-gray-500">เมื่อคุณทำการสั่งซื้อ รายการจะมาปรากฏที่นี่</p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-[#1c1c2b] border border-[#2a2a3e] rounded-xl text-sm font-bold hover:text-[#8b2cf5] transition-all"
                        >
                            ไปเลือกซื้อสินค้า
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-[#12121e] border border-[#2a2a3e] rounded-3xl overflow-hidden hover:border-[#8b2cf5]/50 transition-all group shadow-2xl">
                                <div className="px-6 py-4 bg-[#0a0a16] border-b border-[#2a2a3e] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#8b2cf5]/10 flex items-center justify-center border border-[#8b2cf5]/20">
                                            <Package className="text-[#8b2cf5] w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Order ID</p>
                                            <p className="text-sm font-mono text-white mt-0.5">{order.orderId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">วันที่สั่งซื้อ</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-300 mt-0.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 items-center">
                                                <div className="w-16 h-16 rounded-xl bg-[#0a0a16] border border-[#2a2a3e] overflow-hidden shrink-0">
                                                    <img src={item.image || 'https://via.placeholder.com/150'} alt={item.productName} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-white truncate">{item.productName}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">จำนวน: {item.quantity} x ฿{item.price.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-white">฿{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-[#2a2a3e] flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                                <div className="text-xs text-gray-400 leading-relaxed">
                                                    <p className="font-bold text-gray-300 mb-1">ที่อยู่จัดส่ง:</p>
                                                    {order.shippingAddress.fullName} ({order.shippingAddress.phoneNumber})<br />
                                                    {order.shippingAddress.addressLine}, {order.shippingAddress.subDistrict}, {order.shippingAddress.district}, {order.shippingAddress.province} {order.shippingAddress.zipCode}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-4 h-4 text-gray-500" />
                                                <div className="text-xs text-gray-400">
                                                    <p className="font-bold text-gray-300">ชำระผ่าน:</p>
                                                    {order.paymentMethod}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-end space-y-4">
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">ยอดรวมสุทธิ</p>
                                                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                                                    ฿{order.totalAmount.toLocaleString()}
                                                </p>
                                            </div>
                                            <button className="px-6 py-2.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-xs font-bold hover:border-[#8b2cf5] hover:text-[#8b2cf5] transition-all flex items-center gap-2">
                                                รายละเอียดคำสั่งซื้อ <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
