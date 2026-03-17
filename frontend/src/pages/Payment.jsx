import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

import { CreditCard, QrCode, ArrowLeft, Loader2, CheckCircle, ChevronRight, Copy, Lock, Smartphone, Repeat, MapPin, ShieldCheck, Receipt, ClipboardList, Plus, X, Save, MapPinned, Ticket } from 'lucide-react';
import { axiosInstance } from '../utils/axios';
import logo from '../assets/logo0.png';


const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ดึงข้อมูลจากตะกร้าที่ส่งมา
    const { totalAmount, items } = location.state || { totalAmount: 0, items: [] };

    const [method, setMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPromptPayQR, setShowPromptPayQR] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');

    // Address state
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [selectedBank, setSelectedBank] = useState(null);

    const [cardData, setCardData] = useState({
        number: '',
        holder: '',
        expiry: '',
        cvv: ''
    });

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [finalAmount, setFinalAmount] = useState(totalAmount);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showCouponModal, setShowCouponModal] = useState(false);


    const initialAddressForm = {
        label: '',
        fullName: '',
        phoneNumber: '',
        addressLine: '',
        subDistrict: '',
        district: '',
        province: '',
        zipCode: '',
        isDefault: true
    };
    const [addressForm, setAddressForm] = useState(initialAddressForm);

    useEffect(() => {
        fetchAddresses();
        fetchAvailableCoupons();

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


    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 16);
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardData({ ...cardData, number: formattedValue });
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 4);
        if (value.length >= 3) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        setCardData({ ...cardData, expiry: value });
    };

    const handleCVVChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 3);
        setCardData({ ...cardData, cvv: value });
    };

    const fetchAvailableCoupons = async () => {
        try {
            const res = await axiosInstance.get('/coupons');
            if (res.data.success) {
                setAvailableCoupons(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    };

    const handleApplyCoupon = async (codeOverride) => {
        const codeToUse = codeOverride || couponCode;
        if (!codeToUse) return;
        setIsValidatingCoupon(true);
        setCouponError('');
        try {
            const res = await axiosInstance.post('/coupons/validate', { code: codeToUse });
            if (res.data.success) {
                const coupon = res.data.data;
                if (totalAmount < coupon.minAmount) {
                    setCouponError(`ยอดสั่งซื้อขั้นต่ำสำหรับคูปองนี้คือ ฿${coupon.minAmount}`);
                    setIsValidatingCoupon(false);
                    return;
                }
                setAppliedCoupon(coupon);
                setCouponCode(coupon.code);
                let discount = 0;
                if (coupon.discountType === 'percentage') {
                    discount = (totalAmount * coupon.discountValue) / 100;
                } else {
                    discount = coupon.discountValue;
                }
                setFinalAmount(Math.max(0, totalAmount - discount));
                setShowCouponModal(false);
            }
        } catch (error) {
            setCouponError(error.response?.data?.message || 'ไม่สามารถใช้คูปองนี้ได้');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            setIsLoadingAddress(true);
            const res = await axiosInstance.get('/account-settings/addresses');
            if (res.data.success) {
                const filteredAddresses = res.data.addresses.filter(addr => addr.label !== 'SYSTEM_RESERVED');
                setAddresses(filteredAddresses);
                const defaultAddr = filteredAddresses.find(addr => addr.isDefault);
                if (defaultAddr) setDefaultAddress(defaultAddr);
                else if (filteredAddresses.length > 0) setDefaultAddress(filteredAddresses[0]);
                else setDefaultAddress(null);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handleSelectAddress = (addr) => {
        setDefaultAddress(addr);
        setShowAddressModal(false);
    };

    const handleSaveNewAddress = async (e) => {
        e.preventDefault();
        try {
            setIsLoadingAddress(true);
            const res = await axiosInstance.post('/account-settings/addresses', addressForm);
            if (res.data.success) {
                await fetchAddresses();
                setIsAddingNewAddress(false);
                setAddressForm(initialAddressForm);
                // The newly added address is ideally set as default by fetchAddresses if it was marked as default
            }
        } catch (error) {
            console.error('Error saving address:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกที่อยู่');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const saveOrder = async () => {
        try {
            if (!defaultAddress) {
                alert('กรุณาเลือกที่อยู่จัดส่งก่อนชำระเงิน');
                return false;
            }

            const discount = totalAmount - finalAmount;
            const firstItem = items[0];

            const orderData = {
                items: items.map(item => ({
                    productId: item._id,
                    productName: item.productName,
                    productDescription: item.productDescription,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.images?.[0]
                })),
                shippingAddress: {
                    fullName: defaultAddress.fullName,
                    phoneNumber: defaultAddress.phoneNumber,
                    addressLine: defaultAddress.addressLine,
                    subDistrict: defaultAddress.subDistrict,
                    district: defaultAddress.district,
                    province: defaultAddress.province,
                    zipCode: defaultAddress.zipCode
                },
                totalAmount: finalAmount,
                originalAmount: totalAmount,
                discountAmount: discount,
                discountCode: appliedCoupon?.code || "",
                shopName: firstItem?.ownerId?.username || firstItem?.shopId?.shopName || "Shopify Store",
                shopId: firstItem?.shopId?._id || firstItem?.shopId,
                paymentMethod: method === 'credit' ? 'CREDIT_CARD' :
                    method === 'promptpay' ? 'PROMPTPAY' :
                        `MOBILE_BANKING${selectedBank ? ` (${selectedBank.name})` : ''}`
            };


            const res = await axiosInstance.post('/orders', orderData);
            if (res.data.success) {
                console.log("Order saved successfully:", res.data.order);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving order:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลการสั่งซื้อ');
            return false;
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!method) {
            alert('กรุณาเลือกช่องทางการชำระเงิน');
            return;
        }

        if (!defaultAddress) {
            alert('กรุณาเลือกที่อยู่จัดส่ง');
            return;
        }

        if (method === 'credit') {
            setIsProcessing(true); // ใช้ isProcessing สำหรับสถานะกำลังชำระเงิน

            // จำลองการตรวจสอบบัตร
            setTimeout(async () => {
                const success = await saveOrder({ cardData });
                setIsProcessing(false);
                if (success) {
                    setIsSuccess(true);
                    localStorage.removeItem('cart');
                }
            }, 2500);
            return;
        } else if (method === 'promptpay') {
            setIsGeneratingQR(true);
            // Simulate QR generation delay
            setTimeout(() => {
                setIsGeneratingQR(false);
                setShowPromptPayQR(true);
            }, 1800);
            return;
        } else { // This is for 'mobile'
            setIsProcessing(true);
            setProcessingMessage('กำลังติดต่อกับระบบธนาคาร...');

            // Step 1: Connecting
            setTimeout(() => {
                setProcessingMessage('กำลังนำคุณไปยังหน้าชำระเงิน...');

                // Step 2: Redirecting feel
                setTimeout(async () => {
                    setProcessingMessage('กำลังตรวจสอบสถานะการชำระเงิน...');

                    // Step 3: Verifying success
                    setTimeout(async () => {
                        const success = await saveOrder();
                        if (success) {
                            setIsSuccess(true);
                            localStorage.removeItem('cart');
                        }
                        setIsProcessing(false);
                    }, 2000);
                }, 2000);
            }, 1800);
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

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/orders')}
                            className="w-full bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,44,245,0.3)]"
                        >
                            <ClipboardList className="w-5 h-5" /> ดูข้อมูลการสั่งซื้อ
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-[#12121e] border border-[#2a2a3e] text-gray-400 font-bold py-3.5 rounded-lg hover:bg-[#2a2a3e] hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            กลับไปหน้าแรก <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
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
                <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col">
                    <div className="bg-[#12121e] p-6 text-center border-b border-[#2a2a3e]">
                        <h2 className="text-xl font-bold text-white mb-1">สแกนเพื่อชำระเงิน</h2>
                        <p className="text-[#8b2cf5] font-bold">ยอดสุทธิ: ฿{finalAmount.toLocaleString()}</p>
                    </div>

                    <div className="p-8 flex flex-col items-center">
                        <div className="bg-white p-5 rounded-2xl inline-block mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative group">
                            <div className="absolute inset-0 border-2 border-[#8b2cf5] rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/330px-QR_code_for_mobile_English_Wikipedia.svg.png"
                                alt="PromptPay QR Code"
                                className="w-48 h-48 relative z-10"
                            />
                        </div>

                        <div className="bg-[#1c1c2b] rounded-xl p-4 w-full mb-8 border border-[#2a2a3e]">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>รายการ</span>
                                <span>พร้อมเพย์ / PromptPay</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>เลขอ้างอิง</span>
                                <span className="font-mono">REF: {Math.random().toString(36).substring(2, 12).toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="space-y-3 w-full">
                            <button
                                onClick={async () => {
                                    const success = await saveOrder();
                                    if (success) {
                                        setIsSuccess(true);
                                        setShowPromptPayQR(false);
                                        localStorage.removeItem('cart');
                                    }
                                }}
                                className="w-full bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(139,44,245,0.3)] group"
                            >
                                <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> ฉันชำระเงินเรียบร้อยแล้ว
                            </button>
                            <button
                                onClick={() => setShowPromptPayQR(false)}
                                className="w-full text-gray-500 font-bold py-3 hover:text-red-400 transition-all text-sm"
                            >
                                ยกเลิกการชำระเงิน
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 p-4 text-center border-t border-blue-500/10">
                        <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">*โปรดตรวจสอบความถูกต้องของข้อมูลก่อนกดยืนยันชำระเงิน*</p>
                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------
    // หน้าจอหลัก: Checkout (ปรับ Layout แบบ 2 Columns)
    // ----------------------------------------
    return (
        <div className="min-h-screen bg-[#05050f] flex justify-center p-4 md:p-8 font-sans text-white relative overflow-hidden">
            {/* Loading Overlays */}
            {isGeneratingQR && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
                    <div className="w-20 h-20 border-4 border-[#2a2a3e] border-t-[#8b2cf5] rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-bold text-white mb-2 animate-pulse">กำลังเจนเนอเรต QR Code...</h3>
                    <p className="text-gray-400 text-sm">โปรดรอสักครู่ ระบบกำลังสื่อสารกับธนาคาร</p>
                </div>
            )}

            {isProcessing && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center px-4">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-[#2a2a3e] border-t-[#4361ee] rounded-full animate-spin"></div>
                        <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#4361ee]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                        {processingMessage || (method === 'credit' ? 'กำลังตรวจสอบข้อมูลบัตร...' : 'กำลังดำเนินการ...')}
                    </h3>
                    <p className="text-gray-400 max-w-xs leading-relaxed">
                        {method === 'credit'
                            ? 'โปรดอย่าปิดหน้าต่างนี้ ระบบกำลังรักษาความปลอดภัยข้อมูลการชำระเงินของคุณสู่ธนาคารต้นทาง'
                            : 'โปรดอย่าปิดหน้าต่างนี้ ระบบกำลังนำคุณเข้าสู่กระบวนการที่ปลอดภัย'}
                    </p>
                    <div className="mt-8 flex gap-2">
                        <div className="w-2 h-2 bg-[#4361ee] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-[#4361ee] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-[#4361ee] rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}

            {/* Address Selection Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 h-[80vh] flex flex-col">
                        <div className="bg-[#12121e] p-6 border-b border-[#2a2a3e] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#8b2cf5]/10 rounded-lg">
                                    <MapPinned className="w-6 h-6 text-[#8b2cf5]" />
                                </div>
                                <h3 className="text-xl font-bold">{isAddingNewAddress ? 'เพิ่มที่อยู่ใหม่' : 'เลือกที่อยู่จัดส่ง'}</h3>
                            </div>
                            <button
                                onClick={() => { setShowAddressModal(false); setIsAddingNewAddress(false); }}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {isAddingNewAddress ? (
                                <form onSubmit={handleSaveNewAddress} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-1">ชื่อเรียกที่อยู่ (เช่น บ้าน, ที่ทำงาน)</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.label}
                                                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                                placeholder="เช่น บ้านของฉัน"
                                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-1">ชื่อ-นามสกุล ผู้รับ</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.fullName}
                                                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-1">เบอร์โทรศัพท์</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.phoneNumber}
                                                onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-1">ที่อยู่ (เลขที่บ้าน, ถนน, ซอย)</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.addressLine}
                                                onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-1">แขวง / ตำบล</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.subDistrict}
                                                onChange={(e) => setAddressForm({ ...addressForm, subDistrict: e.target.value })}
                                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-1">เขต / อำเภอ</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.district}
                                                onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-1">จังหวัด</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.province}
                                                onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-1">รหัสไปรษณีย์</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.zipCode}
                                                onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                                className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2">
                                            <Save className="w-5 h-5" /> ใช้ที่อยู่ตามนี้
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingNewAddress(false)}
                                            className="flex-1 py-4 bg-[#12121e] border border-[#2a2a3e] text-gray-400 font-bold rounded-2xl hover:text-white transition"
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            onClick={() => handleSelectAddress(addr)}
                                            className={`p-5 bg-[#12121e] border rounded-2xl cursor-pointer transition-all hover:-translate-y-1 flex justify-between items-center group ${defaultAddress?._id === addr._id ? 'border-[#8b2cf5] shadow-[0_0_20px_rgba(139,44,245,0.1)]' : 'border-[#2a2a3e] hover:border-gray-600'}`}
                                        >
                                            <div className="flex gap-4 overflow-hidden">
                                                <div className={`p-3 rounded-xl h-fit shrink-0 ${defaultAddress?._id === addr._id ? 'bg-[#8b2cf5]/10' : 'bg-gray-500/10'}`}>
                                                    <MapPin className={`w-5 h-5 ${defaultAddress?._id === addr._id ? 'text-[#8b2cf5]' : 'text-gray-500'}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-sm truncate">{addr.label}</h4>
                                                        {addr.isDefault && (
                                                            <span className="px-1.5 py-0.5 bg-[#8b2cf5]/20 text-[#8b2cf5] text-[8px] rounded uppercase font-bold border border-[#8b2cf5]/30">Default</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-white font-medium truncate">{addr.fullName} ({addr.phoneNumber})</p>
                                                    <p className="text-[11px] text-gray-500 mt-1 truncate">
                                                        {addr.addressLine}, {addr.subDistrict}, {addr.district}, {addr.province} {addr.zipCode}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Selection Dot (ไข่ปลา) */}
                                            <div className={`shrink-0 ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${defaultAddress?._id === addr._id ? 'border-[#8b2cf5]' : 'border-gray-700'}`}>
                                                {defaultAddress?._id === addr._id && <div className="w-3 h-3 rounded-full bg-[#8b2cf5] animate-in zoom-in-50 duration-200"></div>}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setIsAddingNewAddress(true)}
                                        className="w-full p-4 border-2 border-dashed border-[#2a2a3e] rounded-2xl flex items-center justify-center gap-3 text-gray-500 hover:border-[#8b2cf5] hover:text-[#8b2cf5] transition group mt-2"
                                    >
                                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="font-bold">เพิ่มที่อยู่ใหม่</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Background Glow */}

            <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#4361ee] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#8b2cf5] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

            {/* Header / Logo */}
            <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-10 flex items-center gap-2 hover:opacity-80 transition z-20 group">
                <div className="w-10 h-10 rounded-xl bg-[#151522] border border-[#2a2a3e] flex items-center justify-center group-hover:border-[#4361ee] transition-all">
                    <ArrowLeft className="text-gray-400 w-5 h-5 group-hover:text-white transition-colors" />
                </div>
                <div className="hidden sm:flex items-center gap-2 ml-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center shadow-[0_0_15px_rgba(139,44,245,0.4)] overflow-hidden">
                        <img src={logo} alt="Shoplify Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                        Shoplify
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
                                    onClick={() => setShowAddressModal(true)}
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
                                        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-300">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Lock className="w-4 h-4 text-[#4361ee]" />
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Secure Credit/Debit Payment</span>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">หมายเลขบัตร (Card Number)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="0000 0000 0000 0000"
                                                            value={cardData.number}
                                                            onChange={handleCardNumberChange}
                                                            className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl py-3 px-4 text-white font-mono text-sm focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee] transition-all"
                                                            required
                                                        />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 bg-[#0a0a16] pl-2">
                                                            <div className="w-6 h-4 bg-gray-600 rounded-sm opacity-50"></div>
                                                            <div className="w-6 h-4 bg-gray-600 rounded-sm opacity-50"></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">ชื่อผู้ถือบัตร (Card Holder Name)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="YOUR NAME"
                                                        value={cardData.holder}
                                                        onChange={(e) => setCardData({ ...cardData, holder: e.target.value.toUpperCase() })}
                                                        className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl py-3 px-4 text-white text-sm focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee] transition-all uppercase"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">วันหมดอายุ (Expiry)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="MM/YY"
                                                            value={cardData.expiry}
                                                            onChange={handleExpiryChange}
                                                            className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl py-3 px-4 text-white font-mono text-sm focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee] transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">CVV</label>
                                                        <input
                                                            type="password"
                                                            placeholder="***"
                                                            value={cardData.cvv}
                                                            onChange={handleCVVChange}
                                                            className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl py-3 px-4 text-white font-mono text-sm focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee] transition-all"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
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
                                                <label key={bank.id} className={`flex items-center justify-between p-4 border rounded-xl hover:border-[#8b2cf5]/50 transition-all bg-[#12121e] cursor-pointer group ${selectedBank?.id === bank.id ? 'border-[#8b2cf5] bg-[#8b2cf5]/5' : 'border-[#2a2a3e]'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                                                            <input
                                                                type="radio"
                                                                name="bank"
                                                                className="peer sr-only"
                                                                required
                                                                checked={selectedBank?.id === bank.id}
                                                                onChange={() => setSelectedBank(bank)}
                                                            />
                                                            <div className="absolute inset-0 rounded-full border-2 border-[#2a2a3e] peer-checked:border-[#8b2cf5] transition-all bg-[#0a0a16]"></div>
                                                            <div className="absolute inset-[4px] rounded-full bg-[#8b2cf5] opacity-0 peer-checked:opacity-100 transition-all"></div>
                                                        </div>
                                                        <span className={`text-sm font-semibold transition-colors ${selectedBank?.id === bank.id ? 'text-[#8b2cf5]' : 'text-white group-hover:text-[#8b2cf5]'}`}>{bank.name}</span>
                                                    </div>
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
                                    ${method === 'mobile' ? 'bg-gradient-to-r from-[#8b2cf5] to-[#7524d1] shadow-[0_0_20px_rgba(139,44,245,0.3)] hover:opacity-90' : ''}
                                    ${!method ? 'bg-[#12121e] text-gray-500 border border-[#2a2a3e] cursor-not-allowed' : ''}
                                    `}
                                >
                                    {isProcessing ? (
                                        <><Loader2 className="w-6 h-6 animate-spin" /> กำลังประมวลผล...</>
                                    ) : (
                                        `ยืนยันชำระเงิน ฿${finalAmount.toLocaleString()}`
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

                            {/* Coupon Section */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">คูปองส่วนลด</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCouponModal(true)}
                                        className="text-[10px] font-bold text-[#8b2cf5] hover:underline flex items-center gap-1"
                                    >
                                        <Ticket className="w-3 h-3" /> เลือกคูปอง
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="ใส่รหัสคูปอง"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:border-[#8b2cf5] transition animate-in slide-in-from-left-4 duration-300"
                                            disabled={appliedCoupon}
                                        />
                                        {appliedCoupon && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500/10 text-green-500 px-2 py-1 rounded text-[10px] font-bold border border-green-500/20">
                                                APPLIED
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode || isValidatingCoupon || appliedCoupon}
                                        className="px-6 bg-[#1c1c2b] border border-[#2a2a3e] rounded-xl text-sm font-bold hover:bg-[#2a2a3e] hover:text-[#8b2cf5] transition disabled:opacity-50"
                                    >
                                        {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ใช้'}
                                    </button>
                                </div>
                                {couponError && <p className="text-red-400 text-[10px] mt-2 ml-1 animate-in shake duration-300">*{couponError}</p>}
                                {appliedCoupon && (
                                    <div className="mt-3 p-3 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-4 h-4 text-green-500" />
                                            <span className="text-xs text-green-500 font-bold">{appliedCoupon.code}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setAppliedCoupon(null); setFinalAmount(totalAmount); setCouponCode(''); }}
                                            className="text-gray-500 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
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
                                {appliedCoupon && (
                                    <div className="flex justify-between text-sm text-green-400 animate-in slide-in-from-right-4 duration-300">
                                        <span>ส่วนลด ({appliedCoupon.code})</span>
                                        <span>- ฿{(totalAmount - finalAmount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>ค่าจัดส่ง</span>
                                    <span className="text-green-400">฿0</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-5 shadow-inner">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">ยอดชำระสุทธิ</span>
                                    <span className="text-xs text-gray-500">รวมภาษีมูลค่าเพิ่มแล้ว</span>
                                </div>
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                                    ฿{finalAmount.toLocaleString()}
                                </span>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
            {/* Coupon Selection Modal */}
            {showCouponModal && (
                <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
                        <div className="bg-[#12121e] p-6 border-b border-[#2a2a3e] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#8b2cf5]/10 rounded-lg">
                                    <Ticket className="w-6 h-6 text-[#8b2cf5]" />
                                </div>
                                <h3 className="text-xl font-bold">เลือกคูปองส่วนลด</h3>
                            </div>
                            <button
                                onClick={() => setShowCouponModal(false)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                            {availableCoupons.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Ticket className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    <p>ยังไม่มีคูปองที่ใช้ได้ในขณะนี้</p>
                                </div>
                            ) : (
                                availableCoupons.map((coupon) => (
                                    <div
                                        key={coupon._id}
                                        onClick={() => handleApplyCoupon(coupon.code)}
                                        className={`p-4 bg-[#12121e] border border-[#2a2a3e] rounded-2xl cursor-pointer hover:border-[#8b2cf5]/50 transition-all group flex items-center justify-between
                                        ${totalAmount < coupon.minAmount ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono font-bold text-[#8b2cf5] text-lg">{coupon.code}</span>
                                                {totalAmount < coupon.minAmount && (
                                                    <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold border border-red-500/20">฿{coupon.minAmount} MIN</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-white font-medium">
                                                ส่วนลด {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '฿'}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                หมดอายุ: {new Date(coupon.expiryDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-[#8b2cf5] group-hover:bg-[#8b2cf5]/10 transition-all">
                                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#8b2cf5]" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-[#0a0a16] border-t border-[#2a2a3e] text-center">
                            <p className="text-[10px] text-gray-500">เงื่อนไขเป็นไปตามที่บริษัทกำหนด</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
