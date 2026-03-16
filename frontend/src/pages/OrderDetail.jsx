import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { axiosInstance } from '../utils/axios';
import {
    ArrowLeft, Package, Clock, MapPin, CreditCard, 
    ChevronRight, ShoppingBag, Store, AlertCircle,
    CheckCircle2, Truck, Home, XCircle, Info, ClipboardList
} from 'lucide-react';
import Navbar from '../components/Navbar';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const [userData] = useState(currentUser);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/orders/${orderId}`);
            if (res.data.success) {
                setOrder(res.data.order);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            setCancelling(true);
            const res = await axiosInstance.patch(`/orders/${orderId}/cancel`);
            if (res.data.success) {
                setOrder(res.data.order);
                setShowCancelModal(false);
                alert('ยกเลิกคำสั่งซื้อสำเร็จ');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING': return { label: 'รอการชำระเงิน', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock };
            case 'PAID': return { label: 'ชำระเงินแล้ว', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CreditCard };
            case 'SHIPPED': return { label: 'กำลังจัดส่ง', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Truck };
            case 'DELIVERED': return { label: 'จัดส่งสำเร็จ', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 };
            case 'CANCELLED': return { label: 'ยกเลิกแล้ว', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle };
            default: return { label: status, color: 'text-gray-500', bg: 'bg-gray-500/10', icon: Info };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05050f] text-white flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#2a2a3e] border-t-[#8b2cf5] rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium font-sans">กำลังโหลดรายละเอียดคำสั่งซื้อ...</p>
            </div>
        );
    }

    if (!order) return null;

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-20">
            <Navbar 
                currentUser={userData}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
            />

            <div className="max-w-4xl mx-auto px-4 mt-12">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-[#12121e] border border-[#2a2a3e] rounded-xl hover:bg-[#1c1c2b] transition text-gray-400 hover:text-white group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">รายละเอียดคำสั่งซื้อ</h1>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono font-bold">Order ID: {order.orderId}</p>
                    </div>
                    {order.status === 'PAID' && (
                        <button 
                            onClick={() => setShowCancelModal(true)}
                            className="ml-auto px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm font-bold shadow-lg shadow-red-500/5"
                        >
                            ยกเลิกคำสั่งซื้อ
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 🟢 Column 1 & 2: Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Card */}
                        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${statusInfo.bg} rounded-full -mr-16 -mt-16 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${statusInfo.bg} flex items-center justify-center border border-white/5`}>
                                        <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">สถานะการจัดส่ง</p>
                                        <h4 className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.label}</h4>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">วันที่สั่งซื้อ</p>
                                    <p className="text-sm font-medium text-gray-300 mt-1">
                                        {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Status Timeline */}
                            {order.status !== 'CANCELLED' && (
                                <div className="relative pt-2 pb-8 px-2">
                                    <div className="absolute top-7 left-0 w-full h-1 bg-[#2a2a3e] rounded-full"></div>
                                    <div 
                                        className="absolute top-7 left-0 h-1 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-full transition-all duration-1000"
                                        style={{ width: 
                                            order.status === 'PAID' ? '33.33%' : 
                                            order.status === 'SHIPPED' ? '66.66%' : 
                                            order.status === 'DELIVERED' ? '100%' : '0%' 
                                        }}
                                    ></div>
                                    
                                    <div className="flex justify-between relative z-10">
                                        {[
                                            { label: 'รอยืนยัน', status: 'PENDING', icon: Clock },
                                            { label: 'จ่ายแล้ว', status: 'PAID', icon: CreditCard },
                                            { label: 'ส่งแล้ว', status: 'SHIPPED', icon: Truck },
                                            { label: 'สำเร็จ', status: 'DELIVERED', icon: Home }
                                        ].map((step, idx) => {
                                            const isActive = order.status === step.status || 
                                                           (step.status === 'PAID' && ['SHIPPED', 'DELIVERED'].includes(order.status)) ||
                                                           (step.status === 'SHIPPED' && order.status === 'DELIVERED') ||
                                                           (step.status === 'PENDING');
                                            
                                            const StepIcon = step.icon;
                                            
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-3 w-20">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'bg-[#0a0a16] border-[#8b2cf5] shadow-[0_0_15px_rgba(139,44,245,0.4)]' : 'bg-[#12121e] border-[#2a2a3e]'}`}>
                                                        <StepIcon className={`w-4 h-4 ${isActive ? 'text-[#8b2cf5]' : 'text-gray-500'}`} />
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-tight text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>{step.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items Card */}
                        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-3xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-4 bg-[#0a0a16] border-b border-[#2a2a3e] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Store className="w-5 h-5 text-[#8b2cf5]" />
                                    <h4 className="font-bold text-sm">{order.shopName || 'Shopify Store'}</h4>
                                </div>
                                {order.shopId && (
                                    <Link to={`/shops/${order.shopId}`} className="text-xs font-bold text-[#8b2cf5] hover:text-[#4361ee] transition flex items-center gap-1 group/shop">
                                        ดูร้านค้า <ChevronRight className="w-3 h-3 group-hover/shop:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </div>
                            <div className="p-6 space-y-6">
                                {order.items.map((item, idx) => (
                                    <Link key={idx} to={`/product/${item.productId}`} className="flex gap-6 items-center group/item hover:bg-white/5 p-4 -m-4 rounded-2xl transition-all">
                                        <div className="w-20 h-20 rounded-2xl bg-[#0a0a16] border border-[#2a2a3e] overflow-hidden shrink-0 group-hover/item:border-[#8b2cf5]/50 transition-colors">
                                            <img src={item.image || 'https://via.placeholder.com/150'} alt={item.productName} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-bold text-white group-hover/item:text-[#8b2cf5] transition-colors line-clamp-1">{item.productName}</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.productDescription || 'ไม่มีรายละเอียดสินค้า'}</p>
                                            <p className="text-xs font-bold text-gray-400 mt-2">จำนวน: {item.quantity} x ฿{item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-bold text-white">฿{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 🟢 Column 3: Billing & Shipping */}
                    <div className="space-y-6">
                        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-3xl p-6 shadow-2xl">
                            <h4 className="font-bold text-sm mb-6 pb-4 border-b border-[#2a2a3e] flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-[#8b2cf5]" /> สรุปยอดเงิน
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>ยอดรวมสินค้า</span>
                                    <span className="text-white font-medium">฿{(order.originalAmount || order.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>ค่าจัดส่ง</span>
                                    <span className="text-green-500 font-bold">฿0</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">ส่วนลด {order.discountCode ? `(${order.discountCode})` : ''}</span>
                                        <span className="text-red-500 font-bold">-฿{order.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-dashed border-[#2a2a3e] flex justify-between items-end">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ยอดที่ต้องจ่าย</span>
                                    <span className="text-2xl font-bold text-white">฿{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-3xl p-6 shadow-2xl">
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-300">
                                <CreditCard className="w-4 h-4 text-[#8b2cf5]" /> ช่องทางชำระเงิน
                            </h4>
                            <div className="p-3 bg-[#0a0a16] border border-[#2a2a3e] rounded-xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">{order.paymentMethod}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Payment Completed</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Card */}
                        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-3xl p-6 shadow-2xl">
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-300">
                                <MapPin className="w-4 h-4 text-[#8b2cf5]" /> ที่อยู่สำหรับการจัดส่ง
                            </h4>
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-white">{order.shippingAddress.fullName}</p>
                                <p className="text-[10px] text-gray-500 font-bold">{order.shippingAddress.phoneNumber}</p>
                                <p className="text-xs text-gray-400 leading-relaxed bg-[#0a0a16] p-4 rounded-xl border border-[#2a2a3e]">
                                    {order.shippingAddress.addressLine}, {order.shippingAddress.subDistrict}, {order.shippingAddress.district}, {order.shippingAddress.province} {order.shippingAddress.zipCode}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟢 Cancellation Modal */}
            {showCancelModal && (
                <div 
                    className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-[#05050f]/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => !cancelling && setShowCancelModal(false)}
                >
                    <div 
                        className="bg-[#12121e] border border-[#2a2a3e] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl shadow-red-500/20 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 text-center bg-gradient-to-b from-red-500/10 to-transparent">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">ต้องการยกเลิก?</h3>
                            <p className="text-gray-400 text-sm leading-relaxed px-4">
                                คุณแน่ใจใช่ไหมว่าต้องการยกเลิกคำสั่งซื้อนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </p>
                        </div>
                        <div className="p-6 flex flex-col gap-3 px-8 pb-8">
                            <button 
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {cancelling ? <XCircle className="w-5 h-5 animate-spin" /> : 'ยืนยันยกเลิกคำสั่งซื้อ'}
                            </button>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="w-full py-4 bg-transparent border border-[#2a2a3e] text-gray-400 font-bold rounded-2xl hover:text-white transition disabled:opacity-50"
                            >
                                ไม่ลบตอนนี้
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
