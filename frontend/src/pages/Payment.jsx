import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, QrCode, ArrowLeft, Loader2, CheckCircle, ChevronRight, Copy, Lock, Smartphone, Repeat, MapPin, ShieldCheck, Receipt } from 'lucide-react';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ดึงข้อมูลจากตะกร้าที่ส่งมา
    const { totalAmount, items } = location.state || { totalAmount: 0, items: [] };

    const [method, setMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPromptPayQR, setShowPromptPayQR] = useState(false);
    
    // Address state
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    useEffect(() => {
        fetchDefaultAddress();

        const script = document.createElement('script');
        script.src = 'https://cdn.omise.co/omise.js';
        script.async = true;
        script.onload = () => {
            window.OmiseCard.configure({
                publicKey: 'pkey_test_6703ahcigxtcqe6obvv', // <--- ⚠️ ใส่ PUBLIC KEY
                currency: 'THB',
                frameLabel: 'TradeApp',
                submitLabel: 'ยืนยันชำระเงิน',
            });
        };
        document.body.appendChild(script);
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

        if (method === 'credit') {
            window.OmiseCard.open({
                amount: totalAmount * 100,
                onCreateTokenSuccess: (nonce) => {
                    console.log("🎉 ได้ Token จาก Omise:", nonce);
                    setIsProcessing(true);
                    setTimeout(() => {
                        setIsProcessing(false);
                        setIsSuccess(true);
                        localStorage.removeItem('cart');
                    }, 2000);
                },
                onFormClosed: () => {
                    console.log("ผู้ใช้ปิดหน้าต่างชำระเงิน");
                },
            });
        } else if (method === 'promptpay') {
            setShowPromptPayQR(true);
        } else {
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                setIsSuccess(true);
                localStorage.removeItem('cart');
            }, 2000);
        }
    };

    // ----------------------------------------
    // หน้าจอ: ชำระเงินสำเร็จ
    // ----------------------------------------
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
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
    // หน้าจอ: โชว์ QR Code PromptPay (จำลอง)
    // ----------------------------------------
    if (showPromptPayQR) {
        return (
            <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8b2cf5] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-8 shadow-2xl relative z-10 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">สแกนเพื่อชำระเงิน</h2>
                    <p className="text-gray-400 text-sm mb-6">ยอดสุทธิ: ฿{totalAmount.toLocaleString()}</p>
                    
                    <div className="bg-white p-4 rounded-xl inline-block mb-6 border-4 border-[#8b2cf5]/30">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/330px-QR_code_for_mobile_English_Wikipedia.svg.png" 
                            alt="Mock QR" 
                            className="w-48 h-48"
                        />
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs p-3 rounded-lg mb-6">
                        *นี่คือคิวอาร์โค้ดจำลองสำหรับพรีเซนต์งาน
                    </div>

                    <button
                        onClick={() => {
                            setIsSuccess(true);
                            setShowPromptPayQR(false);
                            localStorage.removeItem('cart');
                        }}
                        className="w-full bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(139,44,245,0.3)]"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" /> จำลองว่าโอนเงินสำเร็จ
                    </button>
                    <button
                        onClick={() => setShowPromptPayQR(false)}
                        className="w-full text-gray-400 font-bold py-3.5 rounded-lg hover:text-white transition-all mt-2 text-sm"
                    >
                        ยกเลิกการชำระเงิน
                    </button>
                </div>
            </div>
        );
    }

    // ----------------------------------------
    // หน้าจอหลัก: Checkout (ปรับ Layout แบบ 2 Columns)
    // ----------------------------------------
    return (
        <div className="min-h-screen bg-[#05050f] flex justify-center p-4 md:p-8 font-sans text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#4361ee] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#8b2cf5] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

            {/* Header / Logo */}
            <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-10 flex items-center gap-2 hover:opacity-80 transition z-20 group">
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

            {/* Main Container */}
            <div className="w-full max-w-6xl relative z-10 mt-20 md:mt-12">
                
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                        ยืนยันการสั่งซื้อ
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">กรุณาตรวจสอบที่อยู่จัดส่งและเลือกช่องทางการชำระเงิน</p>
                </div>

                {/* 🟢 Grid Layout 2 Columns สำหรับหน้าจอใหญ่ */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* ฝั่งซ้าย: ที่อยู่ + ฟอร์มชำระเงิน (กว้าง 60%) */}
                    <div className="w-full lg:flex-1 space-y-6">
                        
                        {/* 1. ที่อยู่สำหรับจัดส่ง */}
                        <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl p-6 md:p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#8b2cf5]/10 flex items-center justify-center border border-[#8b2cf5]/20">
                                        <MapPin className="text-[#8b2cf5] w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">ที่อยู่สำหรับจัดส่ง</h2>
                                </div>
                                <button 
                                    onClick={() => navigate('/account-settings', { state: { activeTab: 'address' } })}
                                    className="text-xs font-bold text-[#4361ee] hover:bg-[#4361ee]/20 flex items-center gap-1 bg-[#4361ee]/10 px-4 py-2 rounded-full border border-[#4361ee]/20 transition-all"
                                >
                                    {defaultAddress ? 'เปลี่ยนที่อยู่' : '+ เพิ่มที่อยู่'}
                                </button>
                            </div>

                            <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-5">
                                {!isLoadingAddress && !defaultAddress && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        <span className="text-red-400 font-medium mb-2 block">ยังไม่มีที่อยู่จัดส่งที่ถูกตั้งเป็นที่อยู่หลัก</span>
                                        กรุณาเพิ่มที่อยู่เพื่อให้เราจัดส่งสินค้าได้ถูกต้อง
                                    </div>
                                )}
                                {(isLoadingAddress || defaultAddress) && (
                                    <div className="text-sm text-gray-300 space-y-2">
                                        {isLoadingAddress ? (
                                            <p className="flex items-center gap-2 justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#4361ee]" /> กำลังโหลดที่อยู่...</p>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-white text-base mb-1">{defaultAddress.fullName} <span className="text-gray-500 font-normal ml-2">{defaultAddress.phoneNumber}</span></p>
                                                <p className="leading-relaxed">{defaultAddress.addressLine}, ต.{defaultAddress.subDistrict}, อ.{defaultAddress.district}, จ.{defaultAddress.province} <span className="text-[#4361ee] font-medium">{defaultAddress.zipCode}</span></p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. ช่องทางการชำระเงิน */}
                        <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl p-6 md:p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[#4361ee]/10 flex items-center justify-center border border-[#4361ee]/20">
                                    <Receipt className="text-[#4361ee] w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-white">ช่องทางการชำระเงิน</h2>
                            </div>

                            <form onSubmit={handlePayment}>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setMethod('credit')}
                                        className={`py-4 px-2 rounded-xl border flex flex-col items-center gap-3 transition-all ${method === 'credit' ? 'bg-[#4361ee]/10 border-[#4361ee] shadow-[0_0_15px_rgba(67,97,238,0.15)]' : 'bg-[#12121e] border-[#2a2a3e] hover:border-gray-500'}`}
                                    >
                                        <CreditCard className={`w-6 h-6 ${method === 'credit' ? 'text-[#4361ee]' : 'text-gray-500'}`} />
                                        <span className={`text-[10px] sm:text-xs font-semibold ${method === 'credit' ? 'text-[#4361ee]' : 'text-gray-400'} text-center`}>Credit / Debit</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethod('promptpay')}
                                        className={`py-4 px-2 rounded-xl border flex flex-col items-center gap-3 transition-all ${method === 'promptpay' ? 'bg-[#8b2cf5]/10 border-[#8b2cf5] shadow-[0_0_15px_rgba(139,44,245,0.15)]' : 'bg-[#12121e] border-[#2a2a3e] hover:border-gray-500'}`}
                                    >
                                        <QrCode className={`w-6 h-6 ${method === 'promptpay' ? 'text-[#8b2cf5]' : 'text-gray-500'}`} />
                                        <span className={`text-[10px] sm:text-xs font-semibold ${method === 'promptpay' ? 'text-[#8b2cf5]' : 'text-gray-400'} text-center`}>QR Promptpay</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethod('mobile')}
                                        className={`py-4 px-2 rounded-xl border flex flex-col items-center gap-3 transition-all ${method === 'mobile' ? 'bg-[#10b981]/10 border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-[#12121e] border-[#2a2a3e] hover:border-gray-500'}`}
                                    >
                                        <Smartphone className={`w-6 h-6 ${method === 'mobile' ? 'text-[#10b981]' : 'text-gray-500'}`} />
                                        <span className={`text-[10px] sm:text-xs font-semibold ${method === 'mobile' ? 'text-[#10b981]' : 'text-gray-400'} text-center`}>Mobile Banking</span>
                                    </button>
                                </div>

                                {/* Dynamic Payment Info Area */}
                                <div className="min-h-[120px] mb-6">
                                    {!method && (
                                        <div className="h-full flex items-center justify-center text-gray-500 text-sm py-8 border border-dashed border-[#2a2a3e] rounded-xl bg-[#12121e]/50">
                                            กรุณาเลือกช่องทางการชำระเงินด้านบน
                                        </div>
                                    )}

                                    {method === 'credit' && (
                                        <div className="bg-[#4361ee]/5 border border-[#4361ee]/20 rounded-xl p-6 text-center space-y-3 animate-in fade-in zoom-in duration-300">
                                            <ShieldCheck className="w-10 h-10 text-[#4361ee] mx-auto" />
                                            <h3 className="font-bold text-white">ชำระเงินปลอดภัยผ่าน Omise</h3>
                                            <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                                ระบบจะแสดงหน้าต่างที่ปลอดภัยสำหรับกรอกข้อมูลบัตรเครดิต/เดบิตของคุณ หลังจากที่คุณกดปุ่มยืนยันด้านล่าง
                                            </p>
                                        </div>
                                    )}

                                    {method === 'promptpay' && (
                                        <div className="bg-[#8b2cf5]/5 border border-[#8b2cf5]/20 rounded-xl p-6 text-center space-y-3 animate-in fade-in zoom-in duration-300">
                                            <div className="w-12 h-12 bg-[#8b2cf5]/10 rounded-full flex items-center justify-center mx-auto">
                                                <QrCode className="w-6 h-6 text-[#8b2cf5]" />
                                            </div>
                                            <h3 className="font-bold text-white">สร้าง QR Code พร้อมเพย์</h3>
                                            <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                                ท่านจะได้รับ QR Code สำหรับสแกนชำระเงินในขั้นตอนถัดไป สามารถใช้แอปพลิเคชันธนาคารใดก็ได้สแกน
                                            </p>
                                        </div>
                                    )}

                                    {method === 'mobile' && (
                                        <div className="space-y-3 animate-in fade-in duration-300">
                                            {[
                                                { id: 'kbank', name: 'K PLUS (กสิกรไทย)', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Kasikorn_Bank_logo.svg' },
                                                { id: 'scb', name: 'SCB EASY (ไทยพาณิชย์)', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/SCB_Logo.svg' },
                                                { id: 'bbl', name: 'Bualuang mBanking (กรุงเทพ)', logo: 'https://companieslogo.com/img/orig/BBL.BK-9804c636.png' }
                                            ].map((bank) => (
                                                <label key={bank.id} className="flex items-center justify-between p-4 border border-[#2a2a3e] rounded-xl hover:border-blue-500 transition-all bg-[#12121e] cursor-pointer group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                                                            <input type="radio" name="bank" className="peer sr-only" required/>
                                                            <div className="absolute inset-0 rounded-full border-2 border-[#2a2a3e] peer-checked:border-[#10b981] transition-all bg-[#0a0a16]"></div>
                                                            <div className="absolute inset-[4px] rounded-full bg-[#10b981] opacity-0 peer-checked:opacity-100 transition-all"></div>
                                                        </div>
                                                        <span className="text-sm font-semibold text-white group-hover:text-[#10b981] transition-colors">{bank.name}</span>
                                                    </div>
                                                    <img src={bank.logo} alt={bank.id} className="h-6 w-6 object-contain opacity-80" />
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ปุ่มยืนยัน ย้ายมาอยู่ใต้ฟอร์มเลย */}
                                <button
                                    type="submit"
                                    disabled={isProcessing || !method}
                                    className={`w-full text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 text-lg
                                    ${method === 'credit' ? 'bg-gradient-to-r from-[#4361ee] to-[#3a53d0] shadow-[0_0_20px_rgba(67,97,238,0.3)] hover:opacity-90' : ''}
                                    ${method === 'promptpay' ? 'bg-gradient-to-r from-[#8b2cf5] to-[#7524d1] shadow-[0_0_20px_rgba(139,44,245,0.3)] hover:opacity-90' : ''}
                                    ${method === 'mobile' ? 'bg-gradient-to-r from-[#10b981] to-[#0d9668] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:opacity-90' : ''}
                                    ${!method ? 'bg-[#12121e] text-gray-500 border border-[#2a2a3e] cursor-not-allowed' : ''}
                                    `}
                                >
                                    {isProcessing ? (
                                        <><Loader2 className="w-6 h-6 animate-spin" /> กำลังประมวลผล...</>
                                    ) : (
                                        `ยืนยันชำระเงิน ฿${totalAmount.toLocaleString()}`
                                    )}
                                </button>
                                <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 mt-4">
                                    <Lock className="w-3 h-3" /> ข้อมูลของคุณถูกเข้ารหัสอย่างปลอดภัยโดยระบบมาตรฐานสากล
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ฝั่งขวา: สรุปรายการสินค้า (กว้าง 40% และ Sticky เลื่อนตาม) */}
                    <div className="w-full lg:w-[400px] xl:w-[450px] space-y-6 lg:sticky lg:top-8">
                        <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl p-6 md:p-8 shadow-xl">
                            
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                สรุปคำสั่งซื้อ
                            </h3>

                            {/* รายการสินค้า */}
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {items && items.length > 0 ? (
                                    items.map((item, idx) => (
                                        <div key={idx} className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-3 flex items-center gap-4 hover:border-gray-600 transition-colors">
                                            <div className="w-16 h-16 bg-[#0a0a16] rounded-xl border border-[#2a2a3e] flex items-center justify-center overflow-hidden shrink-0">
                                                <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt={item.productName} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-sm mb-1 truncate">{item.productName}</h3>
                                                <p className="text-xs text-gray-400">จำนวน: {item.quantity}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-white">฿{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 bg-[#12121e] rounded-2xl border border-[#2a2a3e]">
                                        ไม่มีรายการสินค้า
                                    </div>
                                )}
                            </div>

                            <div className="w-full h-px bg-[#2a2a3e] my-6"></div>

                            {/* สรุปยอดเงิน */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>ยอดรวมสินค้า</span>
                                    <span>฿{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>ค่าจัดส่ง</span>
                                    <span className="text-green-400">ฟรี</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-5 shadow-inner">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">ยอดชำระสุทธิ</span>
                                    <span className="text-xs text-gray-500">รวมภาษีมูลค่าเพิ่มแล้ว</span>
                                </div>
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                                    ฿{totalAmount.toLocaleString()}
                                </span>
                            </div>
                            
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PaymentPage;