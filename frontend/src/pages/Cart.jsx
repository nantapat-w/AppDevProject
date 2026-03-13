import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CreditCard, ChevronRight, Package, Repeat } from 'lucide-react';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
    }, []);

    const updateQuantity = (id, delta) => {
        const updatedCart = cartItems.map(item => {
            if (item._id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const removeItem = (id) => {
        const updatedCart = cartItems.filter(item => item._id !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div className="min-h-screen bg-[#05050f] flex justify-center p-4 md:p-8 font-sans text-white relative overflow-hidden">
            {/* Background Glow แบบเดียวกับหน้า Payment */}
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#8b2cf5] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#4361ee] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

            {/* Header / Logo (ถอดแบบจาก Payment) */}
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
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] flex items-center justify-center md:justify-start gap-3">
                        <ShoppingBag className="w-8 h-8 text-[#8b2cf5]" /> ตะกร้าสินค้า
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">ตรวจสอบรายการสินค้าก่อนดำเนินการชำระเงิน</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl shadow-xl">
                        <div className="w-24 h-24 bg-[#12121e] rounded-full flex items-center justify-center mb-6 border border-[#2a2a3e]">
                            <ShoppingBag className="w-10 h-10 text-gray-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">ตะกร้าของคุณยังว่างเปล่า</h2>
                        <p className="text-gray-400 text-sm mb-6">ดูเหมือนคุณจะยังไม่ได้เพิ่มสินค้าใดๆ ลงในตะกร้า</p>
                        <Link to="/" className="bg-[#4361ee]/10 text-[#4361ee] border border-[#4361ee]/20 px-6 py-3 rounded-xl font-bold hover:bg-[#4361ee] hover:text-white transition-all">
                            ไปเลือกช้อปสินค้ากันเลย!
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        
                        {/* ฝั่งซ้าย: รายการสินค้า (กว้าง 60%) */}
                        <div className="w-full lg:flex-1 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item._id} className="bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-[#8b2cf5]/50 transition-all shadow-xl group">
                                    
                                    {/* รูปสินค้า */}
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#12121e] border border-[#2a2a3e] overflow-hidden flex-shrink-0">
                                        <img src={item.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    
                                    {/* รายละเอียด */}
                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-base md:text-lg font-bold text-white line-clamp-2 leading-tight">{item.productName}</h3>
                                                <p className="text-[#8b2cf5] font-bold mt-2 text-sm">฿{item.price.toLocaleString()}</p>
                                            </div>
                                            <button 
                                                onClick={() => removeItem(item._id)} 
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                                title="ลบสินค้า"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        {/* ตัวปรับจำนวน & ราคา */}
                                        <div className="flex items-center justify-between mt-4 sm:mt-6">
                                            <div className="flex items-center bg-[#12121e] border border-[#2a2a3e] rounded-xl p-1">
                                                <button onClick={() => updateQuantity(item._id, -1)} className="p-2 hover:text-[#8b2cf5] transition-colors"><Minus className="w-4 h-4" /></button>
                                                <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, 1)} className="p-2 hover:text-[#8b2cf5] transition-colors"><Plus className="w-4 h-4" /></button>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-gray-500 block uppercase tracking-wider mb-0.5">ยอดรวม</span>
                                                <span className="font-bold text-white">฿{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ฝั่งขวา: สรุปยอด (Sticky เลื่อนตามจอ) */}
                        <div className="w-full lg:w-[400px] xl:w-[450px] space-y-6 lg:sticky lg:top-8">
                            <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl p-6 md:p-8 shadow-xl">
                                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    สรุปยอดคำสั่งซื้อ
                                </h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>ราคาสินค้า ({cartItems.length} รายการ)</span>
                                        <span>฿{calculateTotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>ค่าจัดส่ง</span>
                                        <span className="text-green-400 font-medium">ฟรี</span>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-[#2a2a3e] my-6"></div>

                                <div className="flex justify-between items-end bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-5 shadow-inner mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">ยอดรวมสุทธิ</span>
                                        <span className="text-xs text-gray-500">รวมภาษีมูลค่าเพิ่มแล้ว</span>
                                    </div>
                                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
                                        ฿{calculateTotal().toLocaleString()}
                                    </span>
                                </div>

                                <button 
                                    onClick={() => navigate('/payment', { state: { totalAmount: calculateTotal(), items: cartItems } })}
                                    className="w-full text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] shadow-[0_0_20px_rgba(139,44,245,0.3)] hover:opacity-90"
                                >
                                    <CreditCard className="w-6 h-6" /> ดำเนินการชำระเงิน
                                </button>
                                
                                <Link to="/" className="w-full mt-3 py-4 border border-[#2a2a3e] bg-[#12121e] rounded-xl font-bold text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-all">
                                    เลือกสินค้าเพิ่มเติม <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Free Shipping Banner */}
                            <div className="bg-[#8b2cf5]/5 border border-[#8b2cf5]/20 rounded-3xl p-5 flex items-start gap-4 shadow-lg">
                                <div className="w-10 h-10 rounded-full bg-[#8b2cf5]/10 flex items-center justify-center shrink-0 border border-[#8b2cf5]/20">
                                    <Package className="w-5 h-5 text-[#8b2cf5]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#8b2cf5] mb-1">Free Shipping</p>
                                    <p className="text-xs text-gray-400 leading-relaxed">คุณได้รับสิทธิ์ส่งฟรีเมื่อซื้อสินค้าชิ้นแรกกับร้านค้าทางการของ TradeApp</p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;