import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, QrCode, ArrowLeft, Loader2, CheckCircle, ChevronRight, Copy, Lock, Smartphone, Repeat, MapPin } from 'lucide-react';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ดึงข้อมูลจากตะกร้าที่ส่งมา
    const { totalAmount, items } = location.state || { totalAmount: 0, items: [] };

    const [method, setMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Address state
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    useEffect(() => {
        fetchDefaultAddress();
    }, []);

    const fetchDefaultAddress = async () => {
        try {
            setIsLoadingAddress(true);
            const res = await axios.get('http://localhost:5000/api/account-settings/addresses', { withCredentials: true });
            if (res.data.success) {
                const defaultAddr = res.data.addresses.find(addr => addr.isDefault);
                setDefaultAddress(defaultAddr || null);
            }
        } catch (error) {
            console.error('Error fetching default address:', error);
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handlePayment = (e) => {
        e.preventDefault();
        if (!method) {
            alert('กรุณาเลือกช่องทางการชำระเงิน');
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            // Clear cart after success
            localStorage.removeItem('cart');
        }, 2000);
    };

    // ----------------------------------------
    // หน้าจอ: ชำระเงินสำเร็จ (แสดงเมื่อ isSuccess เป็น true)
    // ----------------------------------------
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#10b981] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-8 shadow-2xl relative z-10 text-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">ชำระเงินสำเร็จ!</h1>
                    <p className="text-gray-400 text-sm mb-8">ขอบคุณสำหรับการสั่งซื้อ ออเดอร์ของคุณกำลังถูกจัดเตรียม</p>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-[#12121e] border border-[#2a2a3e] text-white font-bold py-3.5 rounded-lg hover:bg-[#2a2a3e] transition-all flex items-center justify-center gap-2"
                    >
                        กลับไปหน้าแรก <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // ----------------------------------------
    // หน้าจอ: เลือกช่องทางการชำระเงิน
    // ----------------------------------------
    return (
        <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4361ee] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

            {/* 🟢 ปุ่ม Logo กลับหน้าหลัก (มุมซ้ายบน) - Reverted to Absolute to match Login.jsx */}
            <Link to="/" className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 hover:opacity-80 transition z-20 group">
                <div className="w-10 h-10 rounded-xl bg-[#151522] border border-[#2a2a3e] flex items-center justify-center group-hover:border-[#4361ee] transition-all">
                    <ArrowLeft className="text-gray-400 w-5 h-5 group-hover:text-white transition-colors" />
                </div>
                <div className="hidden sm:flex items-center gap-2 ml-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center shadow-[0_0_15px_rgba(67,97,238,0.4)]">
                        <Repeat className="text-white w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                        TradeApp
                    </span>
                </div>
            </Link>

            <div className="w-full md:w-[70%] max-w-4xl bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 transition-all mt-16 md:mt-0">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                        ชำระเงิน
                    </h1>
                </div>

                {/* รายการสินค้า */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">รายการสินค้าที่คุณสั่งซื้อ</h3>
                    <div className="space-y-4">
                        {items && items.length > 0 ? (
                            items.map((item, idx) => (
                                <div key={idx} className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#0a0a16] rounded-xl border border-[#2a2a3e] flex items-center justify-center overflow-hidden shrink-0">
                                        <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt={item.productName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-sm mb-1">{item.productName}</h3>
                                        <p className="text-xs text-gray-400">จำนวน: {item.quantity} | ฿{item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[#4361ee]">฿{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-500 bg-[#12121e] rounded-2xl border border-[#2a2a3e]">
                                ไม่มีรายการสินค้า
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-8 flex justify-between items-center bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-6">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">ยอดชำระสุทธิ</span>
                    <span className="text-3xl font-bold text-white">
                        ฿{totalAmount.toLocaleString()}
                    </span>
                </div>

                {/* ที่อยู่สำหรับจัดส่ง (ย้ายมาอยู่ข้างล่าง) */}
                <div className="mb-8 bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="text-[#8b2cf5] w-5 h-5" />
                                <h2 className="text-lg font-bold text-white">ที่อยู่สำหรับจัดส่ง</h2>
                            </div>
                            {!isLoadingAddress && !defaultAddress && (
                                <span className="text-xs text-red-400 font-medium px-2 py-0.5 bg-red-400/10 rounded-lg border border-red-400/20">
                                    ยังไม่มีที่อยู่จัดส่งที่ถูกตั้งเป็นที่อยู่หลัก
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={() => navigate('/account-settings', { state: { activeTab: 'address' } })}
                            className="text-xs font-bold text-[#4361ee] hover:underline flex items-center gap-1 bg-[#4361ee]/10 px-3 py-1.5 rounded-full border border-[#4361ee]/20 transition-all self-start sm:self-auto"
                        >
                            {defaultAddress ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่'}
                        </button>
                    </div>

                    {(isLoadingAddress || defaultAddress) && (
                        <div className="text-sm text-gray-400 space-y-1 pl-7 animate-in fade-in duration-300">
                            {isLoadingAddress ? (
                                <p className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลดที่อยู่...</p>
                            ) : (
                                <>
                                    <p className="font-semibold text-gray-200 text-base">{defaultAddress.fullName} ({defaultAddress.phoneNumber})</p>
                                    <p>{defaultAddress.addressLine}, {defaultAddress.subDistrict}, {defaultAddress.district}, {defaultAddress.province} {defaultAddress.zipCode}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ตัวเลือกการชำระเงิน */}
                <h3 className="text-sm font-bold text-gray-400 mb-4 tracking-wider">ช่องทางการชำระเงิน</h3>
                <div className="flex gap-3 mb-8">
                    <button
                        type="button"
                        onClick={() => setMethod('credit')}
                        className={`flex-1 py-4 px-2 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'credit' ? 'bg-[#4361ee]/10 border-[#4361ee]' : 'bg-[#12121e] border-[#2a2a3e] hover:border-gray-500'}`}
                    >
                        <CreditCard className={`w-6 h-6 ${method === 'credit' ? 'text-[#4361ee]' : 'text-gray-500'}`} />
                        <span className={`text-[10px] sm:text-xs font-semibold ${method === 'credit' ? 'text-[#4361ee]' : 'text-gray-400'} text-center`}>Credit / Debit</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethod('promptpay')}
                        className={`flex-1 py-4 px-2 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'promptpay' ? 'bg-[#8b2cf5]/10 border-[#8b2cf5]' : 'bg-[#12121e] border-[#2a2a3e] hover:border-gray-500'}`}
                    >
                        <QrCode className={`w-6 h-6 ${method === 'promptpay' ? 'text-[#8b2cf5]' : 'text-gray-500'}`} />
                        <span className={`text-[10px] sm:text-xs font-semibold ${method === 'promptpay' ? 'text-[#8b2cf5]' : 'text-gray-400'} text-center`}>QR Promptpay</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethod('mobile')}
                        className={`flex-1 py-4 px-2 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'mobile' ? 'bg-[#10b981]/10 border-[#10b981]' : 'bg-[#12121e] border-[#2a2a3e] hover:border-gray-500'}`}
                    >
                        <Smartphone className={`w-6 h-6 ${method === 'mobile' ? 'text-[#10b981]' : 'text-gray-500'}`} />
                        <span className={`text-[10px] sm:text-xs font-semibold ${method === 'mobile' ? 'text-[#10b981]' : 'text-gray-400'} text-center`}>Mobile Banking</span>
                    </button>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                    {/* Credit Card Section */}
                    {method === 'credit' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-400 tracking-wider">CARD NUMBER</label>
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    required
                                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3 px-4 focus:outline-none focus:border-[#4361ee] transition-all text-sm placeholder-gray-600 font-mono"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[11px] font-bold text-gray-400 tracking-wider">EXPIRY DATE</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        required
                                        className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3 px-4 focus:outline-none focus:border-[#4361ee] transition-all text-sm placeholder-gray-600 font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[11px] font-bold text-gray-400 tracking-wider">CVV</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        required
                                        className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3 px-4 focus:outline-none focus:border-[#4361ee] transition-all text-sm placeholder-gray-600 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-400 tracking-wider">CARDHOLDER NAME</label>
                                <input
                                    type="text"
                                    placeholder="JOHN DOE"
                                    required
                                    className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-lg py-3 px-4 focus:outline-none focus:border-[#4361ee] transition-all text-sm placeholder-gray-600 uppercase"
                                />
                            </div>
                        </div>
                    )}

                    {/* PromptPay Section */}
                    {method === 'promptpay' && (
                        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-[#8b2cf5]/10 rounded-full flex items-center justify-center mx-auto border border-[#8b2cf5]/20">
                                <QrCode className="w-8 h-8 text-[#8b2cf5]" />
                            </div>
                            <h3 className="font-bold text-white text-lg">QR PromptPay</h3>
                            <p className="text-sm text-gray-400 max-w-[280px] mx-auto">
                                ท่านจะได้รับ QR Code สำหรับสแกนชำระเงิน <span className="text-white font-bold">ในขั้นตอนถัดไป</span> หลังจากกดปุ่มชำระเงินด้านล่าง
                            </p>
                        </div>
                    )}

                    {/* Mobile Banking Section */}
                    {method === 'mobile' && (
                        <div className="space-y-3">
                            {[
                                { id: 'kbank', name: 'K PLUS (กสิกรไทย)', color: 'green', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Kasikorn_Bank_logo.svg' },
                                { id: 'scb', name: 'SCB EASY (ไทยพาณิชย์)', color: 'purple', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/SCB_Logo.svg' },
                                { id: 'bbl', name: 'Bualuang mBanking (กรุงเทพ)', color: 'blue', logo: 'https://companieslogo.com/img/orig/BBL.BK-9804c636.png' }
                            ].map((bank) => (
                                <label
                                    key={bank.id}
                                    className="flex items-center justify-between p-4 border border-[#2a2a3e] rounded-xl hover:border-blue-500 transition-all bg-[#0a0a16] cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                                            <input type="radio" name="bank" className="peer sr-only" />
                                            <div className="absolute inset-0 rounded-full border-2 border-[#2a2a3e] peer-checked:border-[#4361ee] transition-all bg-[#0a0a16]"></div>
                                            <div className="absolute inset-[4px] rounded-full bg-[#4361ee] opacity-0 peer-checked:opacity-100 transition-all"></div>
                                        </div>
                                        <span className="text-sm font-semibold text-white group-hover:text-[#4361ee] transition-colors">{bank.name}</span>
                                    </div>
                                    <img src={bank.logo} alt={bank.id} className="h-6 w-6 object-contain opacity-80" />
                                </label>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-[#4361ee] to-[#8b2cf5] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4 shadow-[0_0_20px_rgba(67,97,238,0.3)]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> กำลังประมวลผล...
                            </>
                        ) : (
                            `ชำระเงิน ฿${totalAmount.toLocaleString()}`
                        )}
                    </button>
                    <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 mt-4">
                        <Lock className="w-3 h-3" /> ข้อมูลของคุณถูกเข้ารหัสอย่างปลอดภัย
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;