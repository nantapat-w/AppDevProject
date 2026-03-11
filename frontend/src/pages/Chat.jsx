import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, User, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Chat = () => {
  const [activeTab, setActiveTab] = useState('GENERAL'); 
  const [chats, setChats] = useState([]); 
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState('');
  
  // 🟢 ดึงข้อมูลแบบปลอดภัย ดัก Error ป้องกันจอขาว
  let currentUser = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") {
      currentUser = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Local storage error:", error);
  }

  const messagesEndRef = useRef(null); 

  // 1️⃣ โหลดรายชื่อแชท
  useEffect(() => {
    if (!currentUser) return;

    const fetchChats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/chat', { withCredentials: true }); 
        if (res.data.success) {
          setChats(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, [currentUser]);

  // 2️⃣ โหลดข้อความ
  useEffect(() => {
    if (activeChat && currentUser) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/chat/${activeChat._id}`, { withCredentials: true });
          if (res.data.success) {
            setMessages(res.data.data.messages);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    }
  }, [activeChat, currentUser]);

  // 3️⃣ เลื่อนจอ
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4️⃣ ส่งข้อความ
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    const receiver = activeChat.participants.find(p => p._id !== currentUser.id);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        receiverId: receiver._id,
        content: newMessage,
        chatType: activeTab 
      }, { withCredentials: true });

      if (res.data.success) {
        setMessages([...messages, { sender: currentUser, content: newMessage }]);
        setNewMessage('');
        setChats(prev => prev.map(c => 
          c._id === activeChat._id ? { ...c, lastMessage: newMessage } : c
        ));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // 🚨 ดักกรณีไม่มี User (ยังไม่ได้ล็อกอิน)
  if (!currentUser) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#05050f] text-white gap-4">
        <div className="w-16 h-16 bg-[#151522] rounded-full flex items-center justify-center border border-[#2a2a3e]">
            <User className="w-8 h-8 text-[#4361ee]" />
        </div>
        <h2 className="text-xl font-bold">คุณยังไม่ได้เข้าสู่ระบบ</h2>
        <p className="text-gray-400 text-sm">กรุณาล็อกอินก่อนเข้าใช้งานหน้าแชทนะครับ</p>
        <Link 
            to="/login" 
            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#4361ee] to-[#8b2cf5] rounded-full font-bold hover:opacity-90 transition"
        >
          ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  const filteredChats = chats.filter(chat => (chat.chatType || 'GENERAL') === activeTab);

  // 🟢 แก้ตรงนี้ครับ! ใช้ fixed inset-0 เพื่อให้มันเต็มจอ 100% ไม่มีแถบขาวดื้อๆ อีกต่อไป
  return (
    <div className="fixed inset-0 flex bg-[#05050f] text-white overflow-hidden font-sans">
      
      {/* 📱 ฝั่งซ้าย: แถบรายชื่อแชท */}
      <div className="w-1/3 border-r border-[#2a2a3e] flex flex-col bg-[#0a0a16]">
        <div className="p-4 border-b border-[#2a2a3e] flex items-center gap-3">
            <Link to="/" className="p-2 bg-[#151522] rounded-lg hover:bg-[#2a2a3e] transition">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">Messages</h2>
        </div>

        <div className="flex p-3 gap-2 border-b border-[#2a2a3e]">
          <button 
            onClick={() => { setActiveTab('GENERAL'); setActiveChat(null); }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'GENERAL' ? 'bg-[#4361ee] text-white shadow-[0_0_10px_rgba(67,97,238,0.4)]' : 'bg-[#151522] text-gray-400 hover:text-white'}`}
          >
            <User className="w-4 h-4" /> แชททั่วไป
          </button>
          <button 
            onClick={() => { setActiveTab('TRADE'); setActiveChat(null); }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'TRADE' ? 'bg-[#8b2cf5] text-white shadow-[0_0_10px_rgba(139,44,245,0.4)]' : 'bg-[#151522] text-gray-400 hover:text-white'}`}
          >
            <PackageOpen className="w-4 h-4" /> แชทเทรด/ซื้อ
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map(chat => {
              const otherUser = chat.participants.find(p => p._id !== currentUser.id) || chat.participants[0];
              return (
                <div 
                  key={chat._id} 
                  onClick={() => setActiveChat(chat)}
                  className={`p-4 border-b border-[#2a2a3e]/50 cursor-pointer transition flex items-center gap-3 ${activeChat?._id === chat._id ? 'bg-[#151522]' : 'hover:bg-[#12121e]'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex-shrink-0 flex items-center justify-center">
                    {otherUser?.imageProfile ? (
                        <img src={otherUser.imageProfile} className="w-11 h-11 rounded-full object-cover" alt="profile"/>
                    ) : (
                        <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold truncate">{otherUser?.username || 'Unknown User'}</h3>
                    <p className="text-xs text-gray-400 truncate mt-1">{chat.lastMessage || 'เริ่มการสนทนา...'}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                <p>ยังไม่มีแชทในหมวดหมู่นี้</p>
            </div>
          )}
        </div>
      </div>

      {/* 💬 ฝั่งขวา: ห้องสนทนา */}
      <div className="flex-1 flex flex-col bg-[#05050f] relative">
        {activeChat ? (
           <>
            <div className="p-4 bg-[#0a0a16] border-b border-[#2a2a3e] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">
                        {activeChat.participants.find(p => p._id !== currentUser.id)?.username}
                    </h3>
                    <span className="px-2 py-1 text-[10px] font-bold bg-[#151522] text-gray-400 rounded-md border border-[#2a2a3e]">
                        {activeTab === 'TRADE' ? 'คุยเรื่องเทรด' : 'คุยเรื่องทั่วไป'}
                    </span>
                </div>
                <button className="text-xs font-bold text-[#4361ee] hover:text-white transition px-3 py-1.5 border border-[#4361ee] hover:bg-[#4361ee] rounded-full">
                    + ติดตาม
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                    const isMe = msg.sender._id === currentUser.id || msg.sender === currentUser.id;
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-tr-none text-white' : 'bg-[#151522] border border-[#2a2a3e] rounded-tl-none text-gray-200'}`}>
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-[#0a0a16] border-t border-[#2a2a3e] flex gap-2">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="พิมพ์ข้อความ..." 
                    className="flex-1 bg-[#12121e] border border-[#2a2a3e] rounded-full px-4 py-2 focus:outline-none focus:border-[#4361ee] text-sm"
                />
                <button type="submit" className="w-10 h-10 bg-[#4361ee] hover:bg-[#8b2cf5] transition-colors rounded-full flex items-center justify-center text-white">
                    <Send className="w-4 h-4 ml-1" />
                </button>
            </form>
           </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#151522] flex items-center justify-center border border-[#2a2a3e]">
                <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p>เลือกห้องแชทเพื่อเริ่มสนทนา</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;