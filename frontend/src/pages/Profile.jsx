import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Star, Package, ShieldCheck, MapPin, Settings, Edit3, Repeat, MessageCircle, Plus, Check, MessageSquare, History } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../utils/axios'; // 🟢 ใช้ axiosInstance ตัวจริงของโปรเจกต์พี่
import { PostCard, POST_TYPE_LABELS } from './Community';

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [activeTab, setActiveTab] = useState('history');
  const [postFilter, setPostFilter] = useState('ALL'); 
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // 🟢 State สำหรับเก็บข้อมูลเทรด และ เลขสถิติคำนวณสด
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [dynamicStats, setDynamicStats] = useState({ total: 0, success: 0 });

  let currentUser = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") currentUser = JSON.parse(userStr);
  } catch (error) { console.error("Local storage error:", error); }
  
  const myId = String(currentUser?._id || currentUser?.id || "");
  const targetId = String(id || myId);
  const isMe = targetId === myId;

  // 1. ดึงข้อมูลโปรไฟล์
  useEffect(() => {
    if (!targetId || targetId === "undefined") return navigate('/login');
    const fetchProfile = async () => {
      setLoading(true); 
      try {
        const res = await axiosInstance.get(`/auth/profile/${targetId}`);
        if (res.data.success) {
          setProfileData(res.data.data);
          setIsFollowing(res.data.data.followers?.includes(myId));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetId, myId, navigate]);

  // 2. ดึงข้อมูลโพสต์
  useEffect(() => {
    if (!targetId || activeTab !== 'posts') return;
    const fetchUserPosts = async () => {
      setLoadingPosts(true); 
      try {
        const params = { userId: targetId };
        if (postFilter !== 'ALL') params.postType = postFilter;
        const res = await axiosInstance.get(`/community`, { params });
        if (res.data.success) {
          const filteredPosts = res.data.data.filter(post => String(post.author?._id || post.author) === targetId);
          setUserPosts(filteredPosts);
        }
      } catch (error) { console.error(error); } 
      finally { setLoadingPosts(false); }
    };
    fetchUserPosts();
  }, [targetId, postFilter, activeTab]);

  // 🌟 3. ดึงประวัติเทรด + คำนวณสถิติทันทีตอนโหลดหน้า 🌟
  useEffect(() => {
    if (!targetId || targetId === 'undefined') return;
    // ถ้าไม่ใช่เจ้าของบัญชี ไม่ต้องดึง
    if (targetId !== myId) {
      setTradeHistory([]);
      setDynamicStats({ total: 0, success: 0 });
      return;
    }

    const fetchTradeHistory = async () => {
      setLoadingTrades(true);
      try {
        const [inboxRes, outboxRes] = await Promise.all([
          axiosInstance.get(`/trades/inbox`).catch(() => ({ data: { data: [] } })),
          axiosInstance.get(`/trades/outbox`).catch(() => ({ data: { data: [] } }))
        ]);

        const inboxData = Array.isArray(inboxRes.data?.data) ? inboxRes.data.data : [];
        const outboxData = Array.isArray(outboxRes.data?.data) ? outboxRes.data.data : [];

        const formatTrade = (t, isOutbox) => {
            const partner = isOutbox ? t.receiveId : t.requestId;
            const myItems = isOutbox ? (t.offerItems || [t.offerItem]) : (t.requestedItems || [t.requestItem]);
            const theirItems = isOutbox ? (t.requestedItems || [t.requestItem]) : (t.offerItems || [t.offerItem]);
            return {
                ...t,
                isRequester: isOutbox,
                partner: partner,
                myItemsArr: myItems.filter(Boolean),
                theirItemsArr: theirItems.filter(Boolean),
                myMoney: isOutbox ? (t.offerMoney || 0) : (t.requestedMoney || 0),
                theirMoney: isOutbox ? (t.requestedMoney || 0) : (t.offerMoney || 0)
            };
        };

        const allTrades = [
            ...inboxData.map(t => formatTrade(t, false)),
            ...outboxData.map(t => formatTrade(t, true))
        ];

        const successStatuses = ['ACCEPTED', 'SHIPPED', 'COMPLETED', 'CLOSED'];
        const completedTrades = allTrades.filter(t => t.status && successStatuses.includes(t.status.toUpperCase()));
        completedTrades.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

        setTradeHistory(completedTrades);
        // ✅ อัปเดตสถิติทันทีไม่ต้องรอเปิดแท็บ
        setDynamicStats({
            total: allTrades.length,
            success: completedTrades.length
        });
      } catch (error) {
        console.error("Error fetching trade history:", error);
      } finally {
        setLoadingTrades(false);
      }
    };
    fetchTradeHistory();
  }, [targetId, myId]); // ✅ ไม่มี activeTab ใน deps แล้ว — โหลดครั้งเดียวตอนเปิดหน้า

  // ... ฟังก์ชันอื่นๆ เหมือนเดิม ...
  const handleFollowToggle = async () => { /* ... */ };
  const handleChat = () => { /* ... */ };

  if (loading) return <div className="min-h-screen bg-[#05050f] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#8b2cf5]"></div></div>;
  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      
      {/* Navbar */}
      <nav className="bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition group">
            <div className="p-2 bg-[#151522] rounded-lg border border-[#2a2a3e] group-hover:border-[#8b2cf5] transition-all"><ArrowLeft className="w-5 h-5" /></div>
            <span className="font-medium hidden sm:block">กลับ</span>
          </button>
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
            {isMe ? 'My Profile' : `${profileData.username}'s Profile`}
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* Profile Header */}
        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl overflow-hidden relative shadow-lg">
          <div className="h-32 md:h-48 bg-gradient-to-r from-[#2a1b41] to-[#162142] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b2cf5] opacity-20 blur-[80px] rounded-full"></div>
          </div>
          <div className="px-6 pb-6 relative flex flex-col md:flex-row gap-6 md:items-end -mt-12 md:-mt-16">
            <div className="relative z-10 shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0a0a16] border-4 border-[#12121e] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(139,44,245,0.3)]">
                {profileData.imageProfile ? (
                  <img src={profileData.imageProfile} alt="profile" className="w-full h-full object-cover" />
                ) : (<User className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />)}
              </div>
              {isMe && (
                <button onClick={() => navigate('/account-settings')} className="absolute bottom-0 right-0 p-2 bg-[#8b2cf5] rounded-full border-2 border-[#12121e] hover:bg-[#7220c7] transition text-white">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 z-10 mb-2">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{profileData.username}</h1>
                <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] text-blue-400 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </div>
              </div>
              <p className="text-gray-400 flex items-center gap-2 text-sm mb-3">
                <MapPin className="w-4 h-4" /> แอดเดรสยังไม่ระบุ • เข้าร่วมเมื่อเร็วๆ นี้
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 cursor-pointer group">
                  <span className="font-bold text-white group-hover:text-[#8b2cf5] transition">{profileData.followers?.length || 0}</span>
                  <span className="text-gray-400 group-hover:text-gray-300 transition">ผู้ติดตาม</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer group">
                  <span className="font-bold text-white group-hover:text-[#8b2cf5] transition">{profileData.following?.length || 0}</span>
                  <span className="text-gray-400 group-hover:text-gray-300 transition">กำลังติดตาม</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 🌟 แสดงเลขสถิติแบบดึงสดๆ (ถ้าเป็นตัวเอง ให้ใช้ค่าที่คำนวณ) 🌟 */}
          <div className="grid grid-cols-3 border-t border-[#2a2a3e] bg-[#0a0a16]">
            <div className="p-4 text-center border-r border-[#2a2a3e]">
              <div className="flex items-center justify-center gap-1 text-[#8b2cf5] mb-1">
                <Star className="w-5 h-5 fill-[#8b2cf5]" />
                <span className="text-xl font-bold">{profileData.trustScore || '5.0'}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">TRUST SCORE</div>
            </div>
            <div className="p-4 text-center border-r border-[#2a2a3e]">
              {/* 🟢 ใช้ dynamicStats.total */}
              <div className="text-xl font-bold text-white mb-1">{isMe ? dynamicStats.total : (profileData.tradeCount || 0)}</div>
              <div className="text-xs text-gray-500 font-medium">TOTAL TRADES</div>
            </div>
            <div className="p-4 text-center">
              {/* 🟢 ใช้ dynamicStats.success */}
              <div className="text-xl font-bold text-green-400 mb-1">{isMe ? dynamicStats.success : (profileData.successfulTrade || 0)}</div>
              <div className="text-xs text-gray-500 font-medium">SUCCESSFUL</div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          
          {/* แท็บเมนู */}
          <div className="flex items-center gap-6 border-b border-[#2a2a3e] mb-6 overflow-x-auto scrollbar-none">
            <button onClick={() => setActiveTab('items')} className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'items' ? 'text-[#8b2cf5]' : 'text-gray-500 hover:text-gray-300'}`}>
              <div className="flex items-center gap-2"><Package className="w-4 h-4" /> คลังสินค้า</div>
              {activeTab === 'items' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]"></div>}
            </button>
            <button onClick={() => setActiveTab('posts')} className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'posts' ? 'text-[#4361ee]' : 'text-gray-500 hover:text-gray-300'}`}>
              <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> โพสต์</div>
              {activeTab === 'posts' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-[#4361ee] to-[#8b2cf5]"></div>}
            </button>
            <button onClick={() => setActiveTab('history')} className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'history' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}>
              <div className="flex items-center gap-2"><History className="w-4 h-4" /> ประวัติการเทรด</div>
              {activeTab === 'history' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-green-400 to-[#4361ee]"></div>}
            </button>
          </div>

          {/* 📦 เนื้อหาแท็บ: คลังสินค้า */}
          {activeTab === 'items' && (
            <div>
              {profileData.products && profileData.products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {profileData.products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="bg-[#12121e] border border-[#2a2a3e] rounded-xl overflow-hidden cursor-pointer hover:border-[#8b2cf5]/50 transition group"
                    >
                      <div className="aspect-square overflow-hidden bg-[#0a0a16]">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-10 h-10 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-white truncate">{product.productName}</p>
                        <p className="text-xs text-[#8b2cf5] font-bold mt-1">
                          {product.price ? `฿${Number(product.price).toLocaleString()}` : 'แลก'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#1c1c2b] rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีสินค้า</h3>
                  <p className="text-sm text-gray-400 mb-4">ยังไม่มีสินค้าในคลังตอนนี้</p>
                  {isMe && (
                    <button onClick={() => navigate('/create-shop')} className="px-4 py-2 bg-[#8b2cf5] text-white rounded-lg text-sm font-semibold hover:bg-[#7220c7] transition flex items-center gap-2">
                      <Plus className="w-4 h-4" /> เพิ่มสินค้า
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 💬 เนื้อหาแท็บ: โพสต์ */}
          {activeTab === 'posts' && (
            <div className="flex flex-col gap-4">
              {loadingPosts ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4361ee]" /></div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard key={post._id} post={post} currentUserId={myId} />
                ))
              ) : (
                <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#1c1c2b] rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีโพสต์</h3>
                  <p className="text-sm text-gray-400">ยังไม่มีโพสต์ใน community ตอนนี้</p>
                </div>
              )}
            </div>
          )}

          {/* 🌟 เนื้อหาแท็บ: ประวัติการเทรด 🌟 */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4">
              {!isMe ? (
                <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#1c1c2b] rounded-full flex items-center justify-center mb-4"><ShieldCheck className="w-8 h-8 text-gray-500" /></div>
                  <h3 className="text-lg font-bold text-white mb-2">ข้อมูลส่วนบุคคล</h3>
                  <p className="text-sm text-gray-400">ประวัติการเทรดสามารถดูได้เฉพาะเจ้าของบัญชีเท่านั้น</p>
                </div>
              ) : loadingTrades ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" /></div>
              ) : tradeHistory.length > 0 ? (
                tradeHistory.map((trade) => {
                  
                  const partnerName = trade.partner?.username || "ผู้ใช้งาน";

                  // ดึงชื่อสินค้าแบบปลอดภัยสุดๆ (ดักทุกกรณี)
                  const getNames = (itemsArr) => {
                      if (!itemsArr || itemsArr.length === 0) return '';
                      return itemsArr.map(i => i.productName || i.name || "สินค้าไม่ทราบชื่อ").join(' + ');
                  };

                  const myItemNames = getNames(trade.myItemsArr);
                  const myOfferText = [myItemNames, trade.myMoney > 0 ? `฿${trade.myMoney.toLocaleString()}` : ''].filter(Boolean).join(' และ ') || 'ไม่ได้เสนอสินค้า/เงิน';

                  const theirItemNames = getNames(trade.theirItemsArr);
                  const theirOfferText = [theirItemNames, trade.theirMoney > 0 ? `฿${trade.theirMoney.toLocaleString()}` : ''].filter(Boolean).join(' และ ') || 'ไม่มีสินค้า/เงิน';

                  return (
                    <div key={trade._id} className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-5 hover:border-[#4361ee]/50 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20`}>
                            TRADE PROPOSAL • {trade.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(trade.createdAt).toLocaleDateString('th-TH')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 p-3 bg-[#0a0a16] border border-[#2a2a3e] rounded-lg text-sm text-gray-300 truncate">
                            <span className="text-[10px] text-gray-500 block mb-1">ของที่คุณเสนอไป:</span>
                            {myOfferText}
                          </div>
                          
                          <Repeat className="w-5 h-5 text-gray-500 shrink-0" />
                          
                          <div className="flex-1 p-3 bg-[#0a0a16] border border-[#2a2a3e] rounded-lg text-sm truncate">
                            <span className="text-[10px] text-gray-500 block mb-1">ของที่ได้รับจาก <span className="text-[#8b2cf5] font-bold">@{partnerName}</span>:</span>
                            <span className="text-white">{theirOfferText}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 sm:border-l border-[#2a2a3e] pt-4 sm:pt-0 sm:pl-6">
                        <div className={`flex items-center gap-1.5 text-sm font-bold text-green-400 whitespace-nowrap`}>
                          <Check className="w-4 h-4" /> เทรดสำเร็จ
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#1c1c2b] rounded-full flex items-center justify-center mb-4"><History className="w-8 h-8 text-green-400" /></div>
                  <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีประวัติการเทรด</h3>
                  <p className="text-sm text-gray-400">ถ้ากดยอมรับเทรดแล้ว ประวัติจะโผล่ที่นี่ครับ!</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;