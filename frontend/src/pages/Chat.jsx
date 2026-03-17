import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, User, PackageOpen, Plus, X, MapPin, Truck, Banknote, CheckCircle2, ChevronRight, Clock, Box, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Chat = () => {
  const [activeTab, setActiveTab] = useState('GENERAL'); 
  const [chats, setChats] = useState([]); 
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState('');
  const [trackedTrades, setTrackedTrades] = useState([]); // 🚚 ติดตามสถานะเทรดจริงจาก DB
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedTradeForShipping, setSelectedTradeForShipping] = useState(null);
  const [shippingForm, setShippingForm] = useState({ trackingNumber: '', shippingCompany: '' });
  const location = useLocation(); 
  const navigate = useNavigate();
  const messagesEndRef = useRef(null); 

  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeForm, setTradeForm] = useState({
    method: 'SHIPPING',
    location: '',
    extraPay: 0,
    itemDescription: ''
  });

  let currentUser = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") currentUser = JSON.parse(userStr);
  } catch (error) { console.error(error); }
  const myId = String(currentUser?.id || currentUser?._id || "");

  // 💬 ส่วน Chat Initialization: รองรับการทักแชทมาจากหน้าสินค้าหรือโปรไฟล์
  useEffect(() => {
    // หากมีการส่ง state มาจาก navigate (เช่น {receiverId, chatType}) 
    // ให้ทำห้องแชทชั่วคราว (Temp Chat) รอส่งข้อความแรกเพื่อสร้างห้องจริงใน DB
    if (location.state?.receiverId) {
      const incomingType = location.state.chatType || 'GENERAL';
      setActiveTab(incomingType);
      setActiveChat({
        _id: 'new_temp_chat', 
        chatType: incomingType,
        participants: [{ _id: location.state.receiverId, username: location.state.receiverName || 'คู่สนทนา' }]
      });
      // ล้าง state เพื่อไม่ให้มันเด้งกลับมาคุยคนเดิมถ้ารีโหลด
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 🟢 1. ทำให้ "รายชื่อแชทฝั่งซ้าย" อัปเดตอัตโนมัติทุก 3 วินาทีด้วย (เพื่อนจะได้เห็นห้องแชทเด้งขึ้นมาเลย)
  // 🟢 1. ดึงรายชื่อแชทฝั่งซ้าย (อัปเดตอัตโนมัติทุก 3 วินาที)
  useEffect(() => {
    if (!myId) return;
    const fetchChats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/chats', { withCredentials: true }); 
        if (res.data.success) setChats(res.data.data);
      } catch (error) { console.error(error); }
    };
    fetchChats();
    const interval = setInterval(fetchChats, 3000); // Polling ทุก 3 วินาที
    return () => clearInterval(interval);
  }, [myId]);

  // 2. ดึงข้อความในห้องอัตโนมัติ
  useEffect(() => {
    let interval;
    if (activeChat && activeChat._id !== 'new_temp_chat' && myId) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/chats/${activeChat._id}`, { withCredentials: true });
          if (res.data.success) setMessages(res.data.data.messages);
        } catch (error) { console.error(error); }
      };
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [activeChat, myId]);

  // 3. ดึงรายการ Trade จริงจาก DB เพื่อดูสถานะ (SHIPPED, COMPLETED ฯลฯ)
  useEffect(() => {
    if (!myId) return;
    const fetchTrackedTrades = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/trades/outbox', { withCredentials: true });
        const res2 = await axios.get('http://localhost:5000/api/trades/inbox', { withCredentials: true });
        if (res.data.success && res2.data.success) {
           setTrackedTrades([...res.data.data, ...res2.data.data]);
        }
      } catch (error) { console.error(error); }
    };
    fetchTrackedTrades();
    const intv = setInterval(fetchTrackedTrades, 5000);
    return () => clearInterval(intv);
  }, [myId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // 📩 ส่งข้อความ (รองรับทั้งแชททั่วไปและแชทเทรด)
  const handleSendMessage = async (contentStr, isTrade = false) => {
    const textToSend = contentStr || newMessage;
    if (!textToSend.trim() || !activeChat || !myId) return;

    const receiver = activeChat.participants.find(p => String(p._id) !== myId) || activeChat.participants[0];

    try {
      const res = await axios.post('http://localhost:5000/api/chats', {
        receiverId: receiver._id,
        content: textToSend,
        chatType: isTrade ? 'TRADE' : activeTab
      }, { withCredentials: true });

      if (res.data.success) {
        setMessages(prev => [...prev, { sender: myId, content: textToSend }]); // อัปเดต UI ทันที
        setNewMessage('');
        
        // ถ้าเป็นการสร้างแชทใหม่ (Temp Chat) ให้รีเฟรชรายชื่อแชทเพื่อให้มี _id จริงๆ
        if (activeChat._id === 'new_temp_chat') {
            const refreshRes = await axios.get('http://localhost:5000/api/chats', { withCredentials: true }); 
            if (refreshRes.data.success) {
                setChats(refreshRes.data.data);
                const realChat = refreshRes.data.data.find(c => 
                    c.participants.some(p => String(p._id) === String(receiver._id)) && c.chatType === (isTrade ? 'TRADE' : activeTab)
                );
                if(realChat) setActiveChat(realChat);
            }
        }
      }
    } catch (error) { console.error(error); }
  };

  const submitTradeOffer = () => {
    // รวมรายการของที่จะเทรดลงไปด้วย
    const offerString = `TRADE_PROPOSAL|${tradeForm.method}|${tradeForm.location}|${tradeForm.extraPay}|${tradeForm.itemDescription}`;
    handleSendMessage(offerString, true);
    setShowTradeModal(false);
  };

  const handleRespondToTrade = async (originalProposal, action) => {
    const responseString = `${action === 'ACCEPT' ? 'TRADE_ACCEPT' : 'TRADE_DECLINE'}|${originalProposal}`;
    handleSendMessage(responseString, true);

    if (action === 'ACCEPT') {
        try {
            const [_, method, loc, pay, desc] = originalProposal.split('|');
            const receiver = activeChat.participants.find(p => String(p._id) !== myId) || activeChat.participants[0];
            
            // สร้าง Record ใน DB จริงๆ
            // receiver._id คือคนส่งข้อเสนอ (ผู้ยื่น = requestId)
            // myId คือคนที่กด ACCEPT (ผู้รับข้อเสนอ = receiveId)
            await axios.post('http://localhost:5000/api/trades', {
                receiveId: myId,          // คนกด Accept = คนรับข้อเสนอ
                requestId: receiver._id,  // คนส่งข้อเสนอ = ผู้ยื่น
                message: desc,
                offerMoney: pay,
                delivered: method,
                meetupLocation: loc,
                offerItems: location.state?.productId ? [location.state.productId] : []
            }, { withCredentials: true });
        } catch (error) { console.error("Error creating trade record:", error); }
    }
  };

  const updateShippingStatus = async () => {
    try {
        const res = await axios.put('http://localhost:5000/api/trades/shipping', {
            tradeId: selectedTradeForShipping._id,
            trackingNumber: shippingForm.trackingNumber,
            shippingCompany: shippingForm.shippingCompany
        }, { withCredentials: true });
        if (res.data.success) {
            setShowShippingModal(false);
            setShippingForm({ trackingNumber: '', shippingCompany: '' });
            // ส่งข้อความแจ้งเตือนในแชทด้วยสิ!
            handleSendMessage(`🚚 สินค้าถูกจัดส่งแล้ว! เลขพัสดุ: ${shippingForm.trackingNumber} (${shippingForm.shippingCompany})`, true);
        }
    } catch (error) { console.error(error); }
  };

  const completeTradeTransaction = async (tradeId) => {
    try {
        const res = await axios.put(`http://localhost:5000/api/trades/complete/${tradeId}`, {}, { withCredentials: true });
        if (res.data.success) {
            handleSendMessage(`🏁 การเทรดเสร็จสมบูรณ์แล้ว! ได้รับของเรียบร้อย`, true);
        }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="fixed inset-0 flex bg-[#05050f] text-white overflow-hidden font-sans">
      <div className="w-1/3 border-r border-[#2a2a3e] flex flex-col bg-[#0a0a16]">
        <div className="p-4 border-b border-[#2a2a3e] flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 bg-[#151522] rounded-lg hover:bg-[#2a2a3e] transition"><ArrowLeft className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex p-3 gap-2 border-b border-[#2a2a3e]">
          <button onClick={() => { setActiveTab('GENERAL'); setActiveChat(null); }} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === 'GENERAL' ? 'bg-[#4361ee] text-white' : 'bg-[#151522] text-gray-400'}`}>ทั่วไป</button>
          <button onClick={() => { setActiveTab('TRADE'); setActiveChat(null); }} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === 'TRADE' ? 'bg-[#8b2cf5] text-white' : 'bg-[#151522] text-gray-400'}`}>เทรด/ซื้อ</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.filter(c => (c.chatType || 'GENERAL') === activeTab).map(chat => {
            const otherUser = chat.participants.find(p => String(p._id) !== myId);
            
            // 🟢 2. ปรับข้อความพรีวิวฝั่งซ้ายให้สวยงาม ไม่โชว์โค้ดดิบๆ
            let displayMessage = chat.lastMessage || 'เริ่มการสนทนา';
            if (displayMessage.startsWith('TRADE_ACCEPT|')) {
                displayMessage = '✅ ยอมรับข้อเสนอการเทรดแล้ว';
            } else if (displayMessage.startsWith('TRADE_DECLINE|')) {
                displayMessage = '❌ ปฏิเสธข้อเสนอการเทรด';
            } else if (displayMessage.startsWith('TRADE_PROPOSAL|')) {
                displayMessage = '📦 ยื่นข้อเสนอการเทรดใหม่';
            }

            return (
              <div key={chat._id} onClick={() => setActiveChat(chat)} className={`p-4 border-b border-[#2a2a3e]/50 cursor-pointer flex items-center gap-3 ${activeChat?._id === chat._id ? 'bg-[#151522]' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center font-bold">
                    {otherUser?.username?.charAt(0)}
                </div>
                <div className="flex-1 truncate">
                    <h3 className="text-sm font-bold">{otherUser?.username}</h3>
                    <p className={`text-xs truncate ${displayMessage.includes('📦') ? 'text-[#8b2cf5] font-semibold' : 'text-gray-500'}`}>
                        {displayMessage}
                    </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 bg-[#0a0a16] border-b border-[#2a2a3e] flex justify-between items-center">
              <h3 className="font-bold">
                {location.state?.shopName || activeChat.participants.find(p => String(p._id) !== myId)?.username}
              </h3>
              {activeTab === 'TRADE' && (
                <button 
                    onClick={() => setShowTradeModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#8b2cf5] rounded-lg text-xs font-bold hover:scale-105 transition shadow-[0_0_10px_rgba(139,44,245,0.3)]"
                >
                    <Plus className="w-4 h-4" /> ทำข้อตกลงเทรด
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isMe = String(msg.sender?._id || msg.sender) === myId;
                const isProposal = msg.content.startsWith('TRADE_PROPOSAL|');
                
                if (isProposal) {
                  const [_, method, loc, pay, desc] = msg.content.split('|');
                  
                  // เช็คว่าข้อเสนอนี้ถูกตอบไปหรือยัง (วนหาใน messages ถัดจากอันนี้)
                  const subsequentMessages = messages.slice(idx + 1);
                  const isResponded = subsequentMessages.some(m => m.content.includes(msg.content));
                  const isAccepted = subsequentMessages.some(m => m.content.startsWith('TRADE_ACCEPT|') && m.content.includes(msg.content));
                  const isDeclined = subsequentMessages.some(m => m.content.startsWith('TRADE_DECLINE|') && m.content.includes(msg.content));

                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} my-4 w-full animate-in fade-in zoom-in duration-300`}>
                      <div className={`bg-[#12121e] border-2 p-5 rounded-2xl w-full max-w-sm shadow-xl ${isMe ? 'border-[#8b2cf5]/30' : 'border-[#4361ee]/30'}`}>
                        <div className={`flex items-center justify-between font-bold mb-4 border-b pb-2 ${isMe ? 'text-[#8b2cf5] border-[#8b2cf5]/20' : 'text-[#4361ee] border-[#4361ee]/20'}`}>
                           <div className="flex items-center gap-2"><PackageOpen className="w-5 h-5" /> TRADE PROPOSAL</div>
                           {isResponded && (
                             <span className={`text-[10px] px-2 py-0.5 rounded-full ${isAccepted ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isAccepted ? 'CLOSED (ACCEPTED)' : 'CLOSED (DECLINED)'}
                             </span>
                           )}
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="bg-[#0a0a16] p-3 rounded-xl border border-[#2a2a3e]">
                            <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">ของที่เสนอเทรด</p>
                            <p className="text-gray-200">{desc || 'ไม่ได้ระบุรายละเอียดของ'}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 bg-[#151522] p-2 rounded-lg border border-[#2a2a3e]">
                              {method === 'SHIPPING' ? <Truck className="w-3.5 h-3.5 text-[#8b2cf5]" /> : <MapPin className="w-3.5 h-3.5 text-[#4361ee]" />}
                              <span className="text-[10px]">{method === 'SHIPPING' ? 'จัดส่งพัสดุ' : 'นัดรับตัวต่อตัว'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-[#151522] p-2 rounded-lg border border-[#2a2a3e]">
                              <Banknote className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-[10px] text-green-400">฿{pay || 0}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 text-[11px] text-gray-400 pt-1">
                             <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                             <span className="line-clamp-1">{loc || 'ไม่ได้ระบุสถานที่'}</span>
                          </div>
                        </div>

                        {!isMe && !isResponded ? (
                          <div className="mt-5 flex gap-2">
                            <button 
                              onClick={() => handleRespondToTrade(msg.content, 'ACCEPT')}
                              className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-lg font-bold text-xs hover:scale-[1.02] transition shadow-lg shadow-green-500/20"
                            >
                               ✅ ยอมรับ
                            </button>
                            <button 
                              onClick={() => handleRespondToTrade(msg.content, 'DECLINE')}
                              className="flex-1 py-2 bg-[#1c1c2b] text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-lg font-bold text-xs transition"
                            >
                               ❌ ปฏิเสธ
                            </button>
                          </div>
                        ) : isMe && !isResponded ? (
                          <div className="mt-5 text-center text-xs text-gray-500 italic flex items-center justify-center gap-2 py-2 bg-[#0a0a16] rounded-xl border border-dashed border-[#2a2a3e]">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" /> รอคู่เทรดพิจารณา...
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                }

                if (msg.content.startsWith('TRADE_ACCEPT|') || msg.content.startsWith('TRADE_DECLINE|')) {
                    const isAccepted = msg.content.startsWith('TRADE_ACCEPT|');
                    const originalProposal = msg.content.split('|').slice(1).join('|');
                    
                    // หาข้อมูล Trade จริงจาก DB ที่ตรงกับข้อเสนอนี้
                    // originalProposal format: 'METHOD|LOC|PAY|DESC' (index 0,1,2,3)
                    const parts = originalProposal.split('|');
                    const propDesc = parts[3];     // description/message
                    const propLoc  = parts[1];     // location
                    const dbTrade = trackedTrades.find(t =>
                        (t.message === propDesc || t.meetupLocation === propLoc) &&
                        t.status !== 'REJECTED' && t.status !== 'CANCELLED'
                    );

                    return (
                        <div key={idx} className="flex flex-col items-center my-6 w-full animate-in fade-in duration-500">
                            <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border text-sm font-bold shadow-2xl ${isAccepted ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-green-500/5' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/5'}`}>
                                {isAccepted ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                {isAccepted ? 'ข้อเสนอเทรดถูกยอมรับแล้ว' : 'ข้อเสนอเทรดถูกปฏิเสธ'}
                            </div>

                            {isAccepted && dbTrade && (
                                <div className="mt-4 w-full max-w-sm bg-[#12121e] border border-[#2a2a3e] rounded-2xl overflow-hidden shadow-xl">
                                    <div className="p-4 flex items-center justify-between border-b border-[#2a2a3e] bg-[#0a0a16]">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            <Box className="w-3.5 h-3.5" /> ติดตามสถานะ
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8b2cf5]/20 text-[#8b2cf5] font-bold uppercase tracking-wider">
                                            {dbTrade.status}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-center relative mb-8">
                                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#2a2a3e] -z-0"></div>
                                            <div className="absolute top-1/2 left-0 h-0.5 bg-[#8b2cf5] -z-0 transition-all duration-1000" style={{ width: dbTrade.status === 'COMPLETED' ? '100%' : dbTrade.status === 'SHIPPED' ? '50%' : '10%' }}></div>
                                            
                                            <div className="z-10 flex flex-col items-center gap-2 group">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-lg ${dbTrade.status === 'ACCEPTED' || dbTrade.status === 'SHIPPED' || dbTrade.status === 'COMPLETED' ? 'bg-[#8b2cf5] text-white shadow-[#8b2cf5]/30' : 'bg-[#1c1c2b] text-gray-500'}`}>
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-500">เตรียมของ</span>
                                            </div>
                                            <div className="z-10 flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-lg ${dbTrade.status === 'SHIPPED' || dbTrade.status === 'COMPLETED' ? 'bg-[#8b2cf5] text-white shadow-[#8b2cf5]/30' : 'bg-[#1c1c2b] text-gray-500'}`}>
                                                    <Truck className="w-4 h-4" />
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-500">ส่งแล้ว</span>
                                            </div>
                                            <div className="z-10 flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-lg ${dbTrade.status === 'COMPLETED' ? 'bg-[#8b2cf5] text-white shadow-[#8b2cf5]/30' : 'bg-[#1c1c2b] text-gray-500'}`}>
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-500">สำเร็จ</span>
                                            </div>
                                        </div>

                                        {dbTrade.status === 'SHIPPED' && (
                                            <div className="bg-[#0a0a16] p-3 rounded-xl border border-dashed border-[#8b2cf5]/30 mb-4">
                                                <p className="text-[10px] text-gray-500 mb-1">เลขพัสดุ</p>
                                                <p className="text-sm font-mono text-[#8b2cf5]">{dbTrade.trackingNumber} ({dbTrade.shippingCompany})</p>
                                            </div>
                                        )}

                                        {/* ปุ่มจัดการสำหรับแต่ละฝ่าย */}
                                        {/* ฝั่งคนส่งขอเทรดเป็นคนส่งของ (ถ้าเป็น offerer) */}
                                        {dbTrade.status === 'ACCEPTED' && String(dbTrade.requestId?._id || dbTrade.requestId) === myId && (
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={() => { setSelectedTradeForShipping(dbTrade); setShowShippingModal(true); }}
                                                    className="w-full py-2.5 bg-[#8b2cf5] text-white rounded-xl text-xs font-bold hover:scale-[1.02] transition shadow-lg"
                                                >
                                                    📦 เตรียมจัดส่ง / กรอกเลขพัสดุ
                                                </button>
                                                {dbTrade.delivered === 'MEETUP' && (
                                                    <button 
                                                        onClick={() => completeTradeTransaction(dbTrade._id)}
                                                        className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-xl text-xs font-bold hover:scale-[1.02] transition shadow-lg"
                                                    >
                                                        ✅ ยืนยันนัดพบเสร็จสิ้น
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* ฝั่งคนรับของเป็นคนกดจบงาน (ถ้าเป็น receiver) */}
                                        {dbTrade.status === 'SHIPPED' && String(dbTrade.receiveId?._id || dbTrade.receiveId) === myId && (
                                             <button 
                                                onClick={() => completeTradeTransaction(dbTrade._id)}
                                                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-xl text-xs font-bold hover:scale-[1.02] transition shadow-lg"
                                             >
                                                ✅ ยืนยันว่าได้รับของแล้ว
                                             </button>
                                        )}

                                        {dbTrade.status === 'COMPLETED' && (
                                            <div className="flex items-center justify-center gap-2 py-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/30 text-xs font-bold">
                                                <ShieldCheck className="w-4 h-4" /> ขอบคุณที่ใช้บริการ!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-[#4361ee] rounded-tr-none' : 'bg-[#151522] border border-[#2a2a3e] rounded-tl-none'}`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 bg-[#0a0a16] flex gap-2 border-t border-[#2a2a3e]">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="พิมพ์ข้อความ..." className="flex-1 bg-[#12121e] border border-[#2a2a3e] rounded-full px-5 py-2 text-sm focus:outline-none focus:border-[#4361ee] transition-colors" />
                <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-[#4361ee] rounded-full flex items-center justify-center hover:bg-[#8b2cf5] transition disabled:opacity-50"><Send className="w-4 h-4 text-white ml-0.5" /></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-sm gap-3">
              <PackageOpen className="w-12 h-12 opacity-20" />
              <p>เลือกเพื่อนเพื่อเริ่มการเจรจาเทรด</p>
          </div>
        )}
      </div>

      {showTradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12121e] border border-[#2a2a3e] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-4 border-b border-[#2a2a3e] flex justify-between items-center bg-[#0a0a16]">
              <h3 className="font-bold flex items-center gap-2 text-[#8b2cf5]"><PackageOpen className="w-5 h-5" /> สร้างข้อตกลงการเทรด</h3>
              <button onClick={() => setShowTradeModal(false)} className="hover:bg-[#2a2a3e] p-1 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs text-gray-500 block mb-2">วิธีการรับส่ง</label>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setTradeForm({...tradeForm, method: 'SHIPPING'})} className={`py-2 rounded-lg text-xs font-bold border transition-all ${tradeForm.method === 'SHIPPING' ? 'bg-[#8b2cf5] border-[#8b2cf5]' : 'bg-[#1c1c2b] border-[#2a2a3e] hover:border-[#8b2cf5]/50'}`}>จัดส่งพัสดุ</button>
                   <button onClick={() => setTradeForm({...tradeForm, method: 'MEETUP'})} className={`py-2 rounded-lg text-xs font-bold border transition-all ${tradeForm.method === 'MEETUP' ? 'bg-[#8b2cf5] border-[#8b2cf5]' : 'bg-[#1c1c2b] border-[#2a2a3e] hover:border-[#8b2cf5]/50'}`}>นัดรับตัวต่อตัว</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">สถานที่ / ที่อยู่จัดส่ง</label>
                <input type="text" value={tradeForm.location} onChange={(e) => setTradeForm({...tradeForm, location: e.target.value})} placeholder="ระบุที่อยู่หรือจุดนัดพบ" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b2cf5]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">สิ่งที่ต้องการเสนอเทรด / รายละเอียดเพิ่มเติม</label>
                <textarea 
                  value={tradeForm.itemDescription} 
                  onChange={(e) => setTradeForm({...tradeForm, itemDescription: e.target.value})} 
                  placeholder="เช่น: ไอเทมชิ้นนี้แลกกับ..., สภาพสินค้า..., รายละเอียดการคุย" 
                  rows="3"
                  className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b2cf5] resize-none"
                ></textarea>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">ค่าส่วนต่าง (ถ้ามี)</label>
                <div className="relative">
                    <span className="absolute left-4 top-2.5 text-gray-500 text-sm">฿</span>
                    <input type="number" value={tradeForm.extraPay} onChange={(e) => setTradeForm({...tradeForm, extraPay: e.target.value})} className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#8b2cf5]" />
                </div>
              </div>
              <button onClick={submitTradeOffer} className="w-full py-3 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(139,44,245,0.4)] hover:scale-[1.02] transition-transform">ส่งข้อเสนอให้คู่เทรด</button>
            </div>
          </div>
        </div>
      )}

      {showShippingModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#12121e] border border-[#2a2a3e] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
               <div className="p-4 border-b border-[#2a2a3e] flex justify-between items-center bg-[#0a0a16]">
                 <h3 className="font-bold flex items-center gap-2 text-[#4361ee]"><Truck className="w-5 h-5" /> ข้อมูลการจัดส่ง</h3>
                 <button onClick={() => setShowShippingModal(false)} className="hover:bg-[#2a2a3e] p-1 rounded-lg"><X className="w-5 h-5" /></button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-2">บริษัทขนส่ง</label>
                    <input type="text" value={shippingForm.shippingCompany} onChange={(e) => setShippingForm({...shippingForm, shippingCompany: e.target.value})} placeholder="เช่น: Kerry, Flash, ไปรษณีย์ไทย" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4361ee]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-2">เลขพัสดุ (Tracking Number)</label>
                    <input type="text" value={shippingForm.trackingNumber} onChange={(e) => setShippingForm({...shippingForm, trackingNumber: e.target.value})} placeholder="ระบุเลขพัสดุ" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4361ee]" />
                  </div>
                  <button onClick={updateShippingStatus} className="w-full py-3 bg-[#4361ee] text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition shadow-lg shadow-[#4361ee]/20">ยืนยันการจัดส่ง</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Chat;