import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle2, ChevronRight, Truck, Box, MessageSquare } from 'lucide-react';
import axios from 'axios';

const MyTrades = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, INCOMING, OUTGOING
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const myId = currentUser?.id || currentUser?._id;

    useEffect(() => {
        if (!myId) {
            navigate('/login');
            return;
        }
        fetchTrades();
    }, [myId]);

    const fetchTrades = async () => {
        try {
            setLoading(true);
            const resIn = await axios.get('http://localhost:5000/api/trades/inbox', { withCredentials: true });
            const resOut = await axios.get('http://localhost:5000/api/trades/outbox', { withCredentials: true });
            
            let all = [];
            if (resIn.data.success) all = [...all, ...resIn.data.data.map(t => ({ ...t, type: 'INCOMING' }))];
            if (resOut.data.success) all = [...all, ...resOut.data.data.map(t => ({ ...t, type: 'OUTGOING' }))];
            
            setTrades(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error("Error fetching trades:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTrades = trades.filter(t => {
        if (activeTab === 'ALL') return true;
        return t.type === activeTab;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'ACCEPTED': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'SHIPPED': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
            case 'COMPLETED': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'REJECTED': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'CANCELLED': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'รอการตอบรับ';
            case 'ACCEPTED': return 'รับข้อเสนอแล้ว / รอจัดส่ง';
            case 'SHIPPED': return 'จัดส่งแล้ว';
            case 'COMPLETED': return 'สำเร็จ';
            case 'REJECTED': return 'ปฏิเสธแล้ว';
            case 'CANCELLED': return 'ยกเลิกแล้ว';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
            <div className="sticky top-0 z-40 bg-[#0a0a16]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#151522] rounded-lg transition">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold">รายการเทรดของฉัน</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-6">
                <div className="flex gap-2 mb-6 bg-[#0a0a16] p-1 rounded-xl border border-[#2a2a3e] w-fit">
                    {['ALL', 'INCOMING', 'OUTGOING'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-[#8b2cf5] text-white shadow-lg shadow-[#8b2cf5]/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab === 'ALL' ? 'ทั้งหมด' : tab === 'INCOMING' ? 'ได้รับ' : 'ส่งออก'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#8b2cf5]"></div>
                    </div>
                ) : filteredTrades.length === 0 ? (
                    <div className="text-center py-20 bg-[#0a0a16] rounded-2xl border border-[#2a2a3e] border-dashed">
                        <Package className="w-16 h-16 mx-auto mb-4 text-[#2a2a3e]" />
                        <p className="text-gray-500 font-medium">ไม่พบรายการเทรดในขณะนี้</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTrades.map((trade) => {
                            const otherUser = trade.type === 'INCOMING' ? trade.requestId : trade.receiveId;
                            return (
                                <div 
                                    key={trade._id} 
                                    onClick={() => navigate(`/trade/${trade._id}`)}
                                    className="bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl p-5 hover:border-[#8b2cf5]/50 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex-shrink-0 flex items-center justify-center font-bold text-lg">
                                                {otherUser?.username?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1c1c2b] text-gray-400 uppercase tracking-wider">
                                                        {trade.type === 'INCOMING' ? 'ได้รับจาก' : 'ส่งถึง'}
                                                    </span>
                                                    <h3 className="font-bold text-sm text-white group-hover:text-[#8b2cf5] transition-colors">{otherUser?.username || 'Unknown'}</h3>
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-1 mb-2">
                                                    {trade.message || 'แลกเปลี่ยนไอเทม'}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-2">
                                                        {trade.offerItems?.slice(0, 3).map((item, i) => (
                                                            <div key={i} className="w-8 h-8 rounded-lg border-2 border-[#0a0a16] bg-[#12121e] overflow-hidden">
                                                                <img src={item.images?.[0]} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 text-gray-600" />
                                                    <div className="flex -space-x-2">
                                                        {trade.requestedItems?.slice(0, 3).map((item, i) => (
                                                            <div key={i} className="w-8 h-8 rounded-lg border-2 border-[#0a0a16] bg-[#12121e] overflow-hidden">
                                                                <img src={item.images?.[0]} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border ${getStatusColor(trade.status)}`}>
                                                {getStatusText(trade.status)}
                                            </span>
                                            <p className="text-[10px] text-gray-600 font-medium">
                                                {new Date(trade.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTrades;
