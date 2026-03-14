import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, MapPin, Truck, Banknote, CheckCircle2, Clock, 
    Package, ShieldCheck, ChevronRight, Loader2, Save, Send, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const TradeStatus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trade, setTrade] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phoneNumber: '',
        addressLine: '',
        province: '',
        zipCode: ''
    });

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const myId = currentUser?.id || currentUser?._id;

    useEffect(() => {
        fetchTradeDetails();
    }, [id]);

    const fetchTradeDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/trades/inbox`, { withCredentials: true });
            const res2 = await axios.get(`http://localhost:5000/api/trades/outbox`, { withCredentials: true });
            
            const all = [...(res.data.data || []), ...(res2.data.data || [])];
            const found = all.find(t => t._id === id);
            
            if (found) {
                setTrade(found);
                const isSender = found.requestId._id === myId || found.requestId === myId;
                const addr = isSender ? found.senderAddress : found.receiverAddress;
                if (addr) setAddressForm(addr);
            }
        } catch (error) {
            console.error("Error fetching trade details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAddress = async () => {
        try {
            setUpdating(true);
            const res = await axios.put('http://localhost:5000/api/trades/update-details', {
                tradeId: id,
                address: addressForm
            }, { withCredentials: true });
            
            if (res.data.success) {
                alert('อัปเดตข้อมูลที่อยู่สำเร็จ!');
                fetchTradeDetails();
            }
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการอัปเดต');
        } finally {
            setUpdating(false);
        }
    };

    const handlePayment = async () => {
        if (!window.confirm('คุณต้องการดำเนินการชำระเงินค่าส่วนต่างใช่หรือไม่?')) return;
        try {
            setUpdating(true);
            const res = await axios.put(`http://localhost:5000/api/trades/${id}/pay`, {}, { withCredentials: true });
            if (res.data.success) {
                alert('ชำระเงินสำเร็จ!');
                fetchTradeDetails();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05050f] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[#8b2cf5] animate-spin" />
                <p className="text-gray-400 text-sm">กำลังโหลดข้อมูลการเทรด...</p>
            </div>
        );
    }

    if (!trade) {
        return (
            <div className="min-h-screen bg-[#05050f] flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4 opacity-50" />
                <h1 className="text-2xl font-bold mb-2">ไม่พบข้อมูลการเทรด</h1>
                <p className="text-gray-500 mb-6">ลิงก์อาจไม่ถูกต้อง หรือคุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                <button onClick={() => navigate('/my-trades')} className="px-6 py-2 bg-[#8b2cf5] rounded-xl font-bold">กลับไปหน้ารายการเทรด</button>
            </div>
        );
    }

    const isRequester = trade.requestId._id === myId || trade.requestId === myId;
    const otherUser = isRequester ? trade.receiveId : trade.requestId;
    const statusIdx = trade.status === 'PENDING' ? 0 : trade.status === 'ACCEPTED' ? 1 : trade.status === 'SHIPPED' ? 2 : 3;

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-20">
            <div className="sticky top-0 z-40 bg-[#0a0a16]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#151522] rounded-lg transition">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                สถานะการเทรด <span className="text-gray-500 text-sm font-normal">#{id.slice(-6)}</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-8">
                {/* 🟢 Timeline */}
                <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl p-8 mb-8">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-4 left-0 w-full h-1 bg-[#151522] -z-0"></div>
                        <div 
                            className="absolute top-4 left-0 h-1 bg-[#8b2cf5] -z-0 transition-all duration-1000" 
                            style={{ width: `${(statusIdx / 3) * 100}%` }}
                        ></div>

                        {[
                            { label: 'รอยืนยัน', icon: Clock },
                            { label: 'ลงรอยกัน', icon: CheckCircle2 },
                            { label: 'จัดส่งแลก', icon: Truck },
                            { label: 'สำเร็จ', icon: ShieldCheck },
                        ].map((step, idx) => (
                            <div key={idx} className="z-10 flex flex-col items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-2xl ${idx <= statusIdx ? 'bg-[#8b2cf5] text-white shadow-[#8b2cf5]/30' : 'bg-[#151522] text-gray-600'}`}>
                                    <step.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs font-bold ${idx <= statusIdx ? 'text-white' : 'text-gray-600'}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Items Section */}
                        <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-[#2a2a3e] bg-[#0c0c1a]">
                                <h2 className="font-bold flex items-center gap-2"><Package className="w-5 h-5 text-[#8b2cf5]" /> รายละเอียดการแลกเปลี่ยน</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                                    <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-2 bg-[#1c1c2b] rounded-full border border-[#2a2a3e]">
                                        <ArrowLeft className="w-5 h-5 text-gray-500 rotate-180" />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#2a2a3e] pb-1">สิ่งที่เสนอให้ ({trade.requestId.username})</p>
                                        <div className="space-y-2">
                                            {trade.offerItems?.map(item => (
                                                <div key={item._id} className="flex items-center gap-3 bg-[#12121e] p-2 rounded-xl border border-[#2a2a3e]">
                                                    <img src={item.images?.[0]} className="w-10 h-10 object-cover rounded-lg" />
                                                    <span className="text-sm font-medium">{item.productName}</span>
                                                </div>
                                            ))}
                                            {trade.offerMoney > 0 && (
                                                <div className="flex items-center gap-3 bg-green-500/10 p-2 rounded-xl border border-green-500/20 text-green-400">
                                                    <div className="w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-lg"><Banknote className="w-5 h-5" /></div>
                                                    <span className="text-sm font-bold">+ ฿{trade.offerMoney.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#2a2a3e] pb-1">สิ่งที่อยากได้ ({trade.receiveId.username})</p>
                                        <div className="space-y-2">
                                            {trade.requestedItems?.map(item => (
                                                <div key={item._id} className="flex items-center gap-3 bg-[#12121e] p-2 rounded-xl border border-[#2a2a3e]">
                                                    <img src={item.images?.[0]} className="w-10 h-10 object-cover rounded-lg" />
                                                    <span className="text-sm font-medium">{item.productName}</span>
                                                </div>
                                            ))}
                                            {trade.requestedMoney > 0 && (
                                                <div className="flex items-center gap-3 bg-green-500/10 p-2 rounded-xl border border-green-500/20 text-green-400">
                                                    <div className="w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-lg"><Banknote className="w-5 h-5" /></div>
                                                    <span className="text-sm font-bold">+ ฿{trade.requestedMoney.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Form */}
                        <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-[#2a2a3e] bg-[#0c0c1a] flex justify-between items-center">
                                <h2 className="font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-[#4361ee]" /> ข้อมูลที่อยู่ของคุณ</h2>
                                <button 
                                    onClick={handleUpdateAddress}
                                    disabled={updating}
                                    className="px-4 py-1.5 bg-[#4361ee] text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition disabled:opacity-50"
                                >
                                    {updating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
                                    บันทึกข้อมูล
                                </button>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">ชื่อ-นามสกุล</label>
                                    <input type="text" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm focus:border-[#4361ee] outline-none" placeholder="ระบุชื่อผู้รับ/ผู้ส่ง" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">เบอร์โทรศัพท์</label>
                                    <input type="text" value={addressForm.phoneNumber} onChange={e => setAddressForm({...addressForm, phoneNumber: e.target.value})} className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm focus:border-[#4361ee] outline-none" placeholder="ระบุเบอร์โทร" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">ที่อยู่สำหรับการจัดส่ง</label>
                                    <textarea value={addressForm.addressLine} onChange={e => setAddressForm({...addressForm, addressLine: e.target.value})} className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm focus:border-[#4361ee] outline-none resize-none" rows="3" placeholder="บ้านเลขที่, ถนน, ซอย..."></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">จังหวัด</label>
                                    <input type="text" value={addressForm.province} onChange={e => setAddressForm({...addressForm, province: e.target.value})} className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm focus:border-[#4361ee] outline-none" placeholder="จังหวัด" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">รหัสไปรษณีย์</label>
                                    <input type="text" value={addressForm.zipCode} onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm focus:border-[#4361ee] outline-none" placeholder="รหัสไปรษณีย์" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="space-y-6">
                        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                             <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8b2cf5] opacity-10 blur-3xl rounded-full"></div>
                             
                             <h3 className="font-bold text-lg mb-4 flex items-center gap-2">คู่เทรดของคุณ</h3>
                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center font-bold text-xl">{otherUser?.username?.charAt(0)}</div>
                                <div>
                                    <p className="font-bold text-white">{otherUser?.username}</p>
                                    <button onClick={() => navigate('/chat', { state: { receiverId: otherUser?._id, receiverName: otherUser?.username, chatType: 'TRADE' } })} className="text-[10px] text-[#8b2cf5] font-bold flex items-center gap-1 hover:underline mt-1">
                                        <MessageSquare className="w-3 h-3" /> ส่งข้อความแชท
                                    </button>
                                </div>
                             </div>

                             <div className="space-y-4 pt-4 border-t border-[#2a2a3e]">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">ขั้นตอนต่อไปที่ต้องทำ</p>
                                
                                {trade.status === 'ACCEPTED' && !trade.isPaid && isRequester && trade.offerMoney > 0 && (
                                    <button 
                                        onClick={handlePayment}
                                        disabled={updating}
                                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-500/20 hover:scale-[1.02] transition flex items-center justify-center gap-2"
                                    >
                                        <Banknote className="w-5 h-5"/> โอนเงินค่าส่วนต่าง ฿{trade.offerMoney.toLocaleString()}
                                    </button>
                                )}

                                {trade.status === 'ACCEPTED' && (trade.isPaid || trade.offerMoney === 0) && (
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                        <p className="text-[11px] text-blue-400 font-medium leading-relaxed">
                                            กรุณากรอกที่อยู่และรอคู่เทรดมาตรวจสอบข้อมูลให้เรียบร้อย ก่อนดำเนินการจัดส่งสินค้าในขั้นตอนถัดไป
                                        </p>
                                    </div>
                                )}

                                {trade.status === 'COMPLETED' && (
                                    <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl text-center">
                                        <ShieldCheck className="w-12 h-12 text-white mx-auto mb-2 opacity-50" />
                                        <p className="font-bold text-white mb-1">การเทรดสำเร็จ!</p>
                                        <p className="text-[10px] text-white/80">ขอบคุณที่เลือกใช้บริการ Shoplify</p>
                                    </div>
                                )}
                             </div>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-3xl p-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">สรุปรายการ</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">สถานะ</span>
                                    <span className="text-[#8b2cf5] font-bold">{trade.status}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">การชำระเงิน</span>
                                    <span className={trade.isPaid ? 'text-green-400' : 'text-gray-500'}>
                                        {trade.isPaid ? 'จ่ายแล้ว' : trade.offerMoney > 0 ? 'รอการชำระ' : 'ไม่มีค่าส่วนต่าง'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">จัดส่งโดย</span>
                                    <span className="text-white">{trade.delivered || 'พัสดุ'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradeStatus;
