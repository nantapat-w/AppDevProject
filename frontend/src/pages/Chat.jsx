import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, User, PackageOpen, Plus, X, MapPin, Truck, Banknote, CheckCircle2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Chat = () => {
  const [activeTab, setActiveTab] = useState('GENERAL'); 
  const [chats, setChats] = useState([]); 
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState('');
  const location = useLocation(); 
  const navigate = useNavigate();
  const messagesEndRef = useRef(null); 

  // --- 🟢 เพิ่ม State สำหรับระบบเทรด ---
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeForm, setTradeForm] = useState({
    method: 'SHIPPING', // SHIPPING หรือ MEETUP
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

  // 1. ดักการวาร์ปมาจากหน้าอื่น
  useEffect(() => {
    if (location.state?.receiverId) {
      const incomingType = location.state.chatType || 'GENERAL';
      setActiveTab(incomingType);
      setActiveChat({
        _id: 'new_temp_chat', 
        chatType: incomingType,
        participants: [{ _id: location.state.receiverId, username: location.state.receiverName || 'คู่สนทนา' }]
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 2. โหลด Inbox และ Polling ข้อความ
  useEffect(() => {
    if (!myId) return;
    const fetchChats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/chats', { withCredentials: true }); 
        if (res.data.success) setChats(res.data.data);
      } catch (error) { console.error(error); }
    };
    fetchChats();
  }, [myId]);

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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // 3. ฟังก์ชันส่งข้อความ / ข้อเสนอเทรด
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
        setMessages(prev => [...prev, { sender: myId, content: textToSend }]);
        setNewMessage('');
        if (activeChat._id === 'new_temp_chat') navigate(0); // Refresh ง่ายๆ เพื่อดึงห้องจริง
      }
    } catch (error) { console.error(error); }
  };

  const submitTradeOffer = () => {
    const offerString = `TRADE_PROPOSAL|${tradeForm.method}|${tradeForm.location}|${tradeForm.extraPay}|${tradeForm.itemDescription}`;
    handleSendMessage(offerString, true);
    setShowTradeModal(false);
  };

  return (
    <div className="fixed inset-0 flex bg-[#05050f] text-white overflow-hidden font-sans">
      
      {/* ฝั่งซ้าย: รายชื่อแชท */}
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
            return (
              <div key={chat._id} onClick={() => setActiveChat(chat)} className={`p-4 border-b border-[#2a2a3e]/50 cursor-pointer flex items-center gap-3 ${activeChat?._id === chat._id ? 'bg-[#151522]' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center font-bold">
                    {otherUser?.username?.charAt(0)}
                </div>
                <div className="flex-1 truncate">
                    <h3 className="text-sm font-bold">{otherUser?.username}</h3>
                    <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ฝั่งขวา: ห้องแชท */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 bg-[#0a0a16] border-b border-[#2a2a3e] flex justify-between items-center">
              <h3 className="font-bold">{activeChat.participants.find(p => String(p._id) !== myId)?.username}</h3>
              {activeTab === 'TRADE' && (
                <button 
                    onClick={() => setShowTradeModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#8b2cf5] rounded-lg text-xs font-bold hover:scale-105 transition"
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
                  return (
                    <div key={idx} className="flex justify-center my-4">
                      <div className="bg-[#12121e] border-2 border-[#8b2cf5] p-5 rounded-2xl w-full max-w-sm shadow-[0_0_20px_rgba(139,44,245,0.2)]">
                        <div className="flex items-center gap-2 text-[#8b2cf5] font-bold mb-4 border-b border-[#8b2cf5]/20 pb-2">
                           <PackageOpen className="w-5 h-5" /> TRADE AGREEMENT
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3"><Truck className="w-4 h-4 text-gray-500" /> <span>{method === 'SHIPPING' ? 'จัดส่งตามที่อยู่' : 'นัดรับสินค้า'}</span></div>
                          <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-500" /> <span className="text-gray-300">{loc}</span></div>
                          <div className="flex items-center gap-3"><Banknote className="w-4 h-4 text-gray-500" /> <span className="text-green-400">ส่วนต่าง: ฿{pay}</span></div>
                        </div>
                        {!isMe ? (
                          <div className="mt-5 flex gap-2">
                            <button className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold text-xs">ยืนยันข้อตกลง</button>
                            <button className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg font-bold text-xs">แก้ไข</button>
                          </div>
                        ) : (
                          <div className="mt-5 text-center text-xs text-gray-500 italic flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" /> รอคู่เทรดยืนยัน...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-[#4361ee]' : 'bg-[#151522] border border-[#2a2a3e]'}`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 bg-[#0a0a16] flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="พิมพ์ข้อความ..." className="flex-1 bg-[#12121e] border border-[#2a2a3e] rounded-full px-5 py-2 text-sm" />
                <button type="submit" className="w-10 h-10 bg-[#4361ee] rounded-full flex items-center justify-center hover:bg-[#8b2cf5] transition"><Send className="w-4 h-4 text-white" /></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">เลือกเพื่อนเพื่อเริ่มการสนทนา</div>
        )}
      </div>

      {/* 🟢 TRADE MODAL (หน้าต่างทำข้อตกลง) */}
      {showTradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12121e] border border-[#2a2a3e] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-4 border-b border-[#2a2a3e] flex justify-between items-center bg-[#0a0a16]">
              <h3 className="font-bold flex items-center gap-2 text-[#8b2cf5]"><PackageOpen className="w-5 h-5" /> สร้างข้อตกลงการเทรด</h3>
              <button onClick={() => setShowTradeModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs text-gray-500 block mb-2">วิธีการรับส่ง</label>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setTradeForm({...tradeForm, method: 'SHIPPING'})} className={`py-2 rounded-lg text-xs font-bold border ${tradeForm.method === 'SHIPPING' ? 'bg-[#8b2cf5] border-[#8b2cf5]' : 'bg-[#1c1c2b] border-[#2a2a3e]'}`}>จัดส่งพัสดุ</button>
                   <button onClick={() => setTradeForm({...tradeForm, method: 'MEETUP'})} className={`py-2 rounded-lg text-xs font-bold border ${tradeForm.method === 'MEETUP' ? 'bg-[#8b2cf5] border-[#8b2cf5]' : 'bg-[#1c1c2b] border-[#2a2a3e]'}`}>นัดรับตัวต่อตัว</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">สถานที่ / ที่อยู่จัดส่ง</label>
                <input type="text" value={tradeForm.location} onChange={(e) => setTradeForm({...tradeForm, location: e.target.value})} placeholder="ระบุที่อยู่หรือจุดนัดพบ" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">ค่าส่วนต่าง (ถ้ามี)</label>
                <div className="relative">
                    <span className="absolute left-4 top-2.5 text-gray-500 text-sm">฿</span>
                    <input type="number" value={tradeForm.extraPay} onChange={(e) => setTradeForm({...tradeForm, extraPay: e.target.value})} className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl pl-8 pr-4 py-2.5 text-sm" />
                </div>
              </div>
              <button onClick={submitTradeOffer} className="w-full py-3 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition">ส่งข้อเสนอให้คู่เทรด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;