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
import Navbar from '../components/Navbar';


const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const [userData, setUserData] = useState(currentUser);
    const [showDropdown, setShowDropdown] = useState(false);

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
            await axiosInstance.post('/auth/logout', {});

            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING': return { label: 'รอการชำระเงิน', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
            case 'PAID': return { label: 'ชำระเงินแล้ว', color: 'text-blue-500', bg: 'bg-blue-500/10' };
            case 'SHIPPED': return { label: 'กำลังจัดส่ง', color: 'text-purple-500', bg: 'bg-purple-500/10' };
            case 'DELIVERED': return { label: 'จัดส่งสำเร็จ', color: 'text-green-500', bg: 'bg-green-500/10' };
            case 'CANCELLED': return { label: 'ยกเลิกแล้ว', color: 'text-red-500', bg: 'bg-red-500/10' };
            default: return { label: status, color: 'text-gray-500', bg: 'bg-gray-500/10' };
        }
    };

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-20">
            {/* 🟢 Navbar */}
            <Navbar
                currentUser={userData}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
            />

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
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-sm font-mono text-white">{order.orderId}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusInfo(order.status).bg} ${getStatusInfo(order.status).color} border border-white/5`}>
                                                    {getStatusInfo(order.status).label}
                                                </span>
                                            </div>
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

                                        <div className="flex flex-col items-end justify-end space-y-2">
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-2 mb-1">
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">ยอดรวมสินค้า:</span>
                                                    <span className="text-[10px] font-bold text-white">฿{(order.originalAmount || order.totalAmount).toLocaleString()}</span>
                                                </div>
                                                {order.discountAmount > 0 && (
                                                    <div className="flex items-center justify-end gap-2 mb-1">
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">ส่วนลด {order.discountCode ? `(${order.discountCode})` : ''}:</span>
                                                        <span className="text-[10px] font-bold text-red-500">-฿{order.discountAmount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-end gap-2 mb-1">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ค่าจัดส่ง:</span>
                                                    <span className="text-[10px] font-bold text-green-500">฿0</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">ยอดชำระสุทธิ</p>
                                                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                                                    ฿{order.totalAmount.toLocaleString()}
                                                </p>
                                            </div>
                                            <Link 
                                                to={`/orders/${order._id}`}
                                                className="px-6 py-2.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-xs font-bold shadow-lg hover:border-[#8b2cf5] hover:text-[#8b2cf5] transition-all flex items-center gap-2 group/btn"
                                            >
                                                รายละเอียดคำสั่งซื้อ <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
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
