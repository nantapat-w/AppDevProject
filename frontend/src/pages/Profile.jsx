import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Star, Package, ShieldCheck, MapPin, Settings, Edit3, Clock, Repeat, Users, MessageCircle, Plus, Check, MessageSquare } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { axiosInstance, getImageUrl } from '../utils/axios';

import { PostCard, POST_TYPE_LABELS } from './Community';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 🟢 รับ ID จาก URL (ถ้ามีแปลว่ากำลังดูโปรไฟล์คนอื่น)
  const [activeTab, setActiveTab] = useState('items');
  const [postFilter, setPostFilter] = useState('ALL'); // เพิ่ม state สำหรับเก็บ filter
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ดึงข้อมูลตัวเองจาก LocalStorage ไว้เทียบว่าใช่โปรไฟล์เราไหม
  let currentUser = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") currentUser = JSON.parse(userStr);
  } catch (error) {
    console.error("Local storage error:", error);
  }
  const myId = currentUser?._id || currentUser?.id;

  // --- ส่วนที่ 1: ดึงข้อมูลโปรไฟล์ (รันครั้งเดียวเมื่อเข้าหน้า หรือเปลี่ยน ID) ---
  useEffect(() => {
    const targetId = id || myId;
    if (!targetId) {
      // 🚫 Remove auto-redirect
      /*
      navigate('/login');
      return;
      */
    }

    const fetchProfile = async () => {
      setLoading(true); // ตัวนี้คุม Loading ทั้งหน้า (เฉพาะตอนเข้าหน้าแรก)
      try {
        const res = await axiosInstance.get(`/auth/profile/${targetId}`);

        if (res.data.success) {
          setProfileData(res.data.data);
          setIsFollowing(res.data.data.followers?.some(f => String(f._id || f) === String(myId)));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        alert("ไม่พบข้อมูลผู้ใช้นี้");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, myId, navigate]); // <--- สังเกตว่าไม่มี postFilter ตรงนี้ หน้าจะได้ไม่รีใหม่

  // --- ส่วนที่ 2: ดึงโพสต์ (รันทุกครั้งที่กดปุ่ม Filter) ---
  useEffect(() => {
    const targetId = id || myId;
    if (!targetId) return;

    const fetchUserPosts = async () => {
      setLoadingPosts(true); // ตัวนี้คุม Loading เฉพาะในบล็อก "โพสต์" เท่านั้น
      try {
        const params = { userId: targetId };
        if (postFilter !== 'ALL') params.postType = postFilter;

        const res = await axiosInstance.get(`/community`, { params });
        if (res.data.success) {
          const filteredPosts = res.data.data.filter(post =>
            String(post.author?._id || post.author) === String(targetId)
          );
          setUserPosts(filteredPosts);
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [id, myId, postFilter]); // <--- ตัวนี้จะทำงานเฉพาะเวลาเปลี่ยน Filter

  // ตรวจสอบว่านี่คือโปรไฟล์ของเราเองหรือไม่
  const isMe = String(profileData?._id) === String(myId);

  // 🟢 ฟังก์ชันกดติดตาม (ในหน้า Profile)
  const handleFollowToggle = async () => {
    if (!currentUser) return navigate('/login');
    try {
      const res = await axiosInstance.put(`/auth/follow/${profileData._id}`);
      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
        // อัปเดตตัวเลขผู้ติดตามแบบ Real-time บนหน้าจอ
        setProfileData(prev => {
          const newFollowers = res.data.isFollowing
            ? [...(prev.followers || []), { _id: myId, username: currentUser.username }] // Fake populate
            : (prev.followers || []).filter(follower => String(follower._id || follower) !== String(myId));
          return { ...prev, followers: newFollowers };
        });
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  // 🟢 ฟังก์ชันทักแชท (ในหน้า Profile)
  const handleChat = () => {
    navigate('/chat', {
      state: {
        receiverId: profileData._id,
        receiverName: profileData.username,
        chatType: 'GENERAL'
      }
    });
  };
  const handleLikePost = async (postId) => {
    if (!currentUser) return navigate('/login');
    try {
      await axiosInstance.put(`/community/${postId}/like`);
      setUserPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const hasLiked = p.likes.includes(currentUser.id || currentUser._id);
        return {
          ...p,
          likes: hasLiked
            ? p.likes.filter(uid => String(uid) !== String(currentUser.id || currentUser._id))
            : [...p.likes, (currentUser.id || currentUser._id)]
        };
      }));
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#05050f] flex items-center justify-center text-white"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#8b2cf5]"></div></div>;
  }

  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">

      {/* 1. Navbar */}
      <Navbar
        currentUser={currentUser}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
      />

      <nav className="bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-3 sticky top-[73px] z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition group">
            <div className="p-2 bg-[#151522] rounded-lg border border-[#2a2a3e] group-hover:border-[#8b2cf5] transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium hidden sm:block">กลับ</span>
          </button>
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
            {isMe ? 'My Profile' : `${profileData.username}'s Profile`}
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 mt-8">

        {/* 2. Profile Header */}
        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl overflow-hidden relative shadow-lg">
          <div className="h-32 md:h-48 bg-gradient-to-r from-[#2a1b41] to-[#162142] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b2cf5] opacity-20 blur-[80px] rounded-full"></div>
          </div>

          <div className="px-6 pb-6 relative flex flex-col md:flex-row gap-6 md:items-end -mt-12 md:-mt-16">

            <div className="relative z-10 shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0a0a16] border-4 border-[#12121e] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(139,44,245,0.3)]">
                {profileData.imageProfile ? (
                  <img src={getImageUrl(profileData.imageProfile)} alt="profile" className="w-full h-full object-cover" />

                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                )}
              </div>
              {isMe && (
                <button className="absolute bottom-0 right-0 p-2 bg-[#8b2cf5] rounded-full border-2 border-[#12121e] hover:bg-[#7220c7] transition text-white">
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

              {/* 🟢 โซนผู้ติดตาม อัปเดตแบบเรียลไทม์ */}
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

            <div className="z-10 mb-2 flex gap-3 w-full md:w-auto">
              {/* 🟢 แยกปุ่มตามเจ้าของโปรไฟล์ */}
              {isMe ? (
                <button
                  onClick={() => navigate('/account-settings')}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-[#151522] border border-[#2a2a3e] rounded-lg text-sm font-medium hover:border-[#8b2cf5] hover:text-[#8b2cf5] transition flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" /> ตั้งค่าบัญชี
                </button>
              ) : (
                <>
                  <button
                    onClick={handleChat}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-[#151522] border border-[#2a2a3e] text-white rounded-lg text-sm font-medium hover:border-[#4361ee] hover:text-[#4361ee] transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> ทักแชท
                  </button>
                  <button
                    onClick={handleFollowToggle}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${isFollowing
                      ? 'bg-[#2a2a3e] text-gray-300 border border-[#2a2a3e] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50'
                      : 'bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white shadow-[0_0_15px_rgba(139,44,245,0.4)] hover:opacity-90'
                      }`}
                  >
                    {isFollowing ? <><Check className="w-4 h-4" /> กำลังติดตาม</> : <><Plus className="w-4 h-4" /> ติดตาม</>}
                  </button>
                </>
              )}
            </div>

          </div>

          <div className="grid grid-cols-3 border-t border-[#2a2a3e] bg-[#0a0a16]">
            <div className="p-4 text-center border-r border-[#2a2a3e]">
              <div className="flex items-center justify-center gap-1 text-[#8b2cf5] mb-1">
                <Star className="w-5 h-5 fill-[#8b2cf5]" />
                <span className="text-xl font-bold">{profileData.trustScore || '5.0'}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">TRUST SCORE</div>
            </div>
            <div className="p-4 text-center border-r border-[#2a2a3e]">
              <div className="text-xl font-bold text-white mb-1">{profileData.tradeCount || 0}</div>
              <div className="text-xs text-gray-500 font-medium">TOTAL TRADES</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xl font-bold text-green-400 mb-1">{profileData.successfulTrade || 0}</div>
              <div className="text-xs text-gray-500 font-medium">SUCCESSFUL</div>
            </div>
          </div>
        </div>

        {/* 3. เนื้อหาด้านล่าง */}
        <div className="mt-8">
          <div className="flex items-center gap-6 border-b border-[#2a2a3e] mb-6">
            <button
              onClick={() => setActiveTab('items')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'items' ? 'text-[#8b2cf5]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className="flex items-center gap-2"><Package className="w-4 h-4" /> คลังสินค้า</div>
              {activeTab === 'items' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]"></div>}
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'posts' ? 'text-[#4361ee]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> โพสต์</div>
              {activeTab === 'posts' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gradient-to-r from-[#4361ee] to-[#8b2cf5]"></div>}
            </button>
          </div>

          {activeTab === 'items' && (
            <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#1c1c2b] rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-[#8b2cf5]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีสินค้าในคลัง</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm">ยังไม่ได้ลงประกาศสินค้าใดๆ</p>

              {isMe && (
                <Link to="/create-product" className="px-6 py-2.5 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(139,44,245,0.4)] hover:opacity-90 transition inline-block">
                  + เพิ่มสินค้าใหม่
                </Link>
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="flex flex-col gap-4">

              {/* 🟢 ส่วนปุ่ม Filter ที่เพิ่มเข้ามาใหม่ (Style เดียวกับ Community) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
                {Object.entries(POST_TYPE_LABELS).map(([key, { label, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setPostFilter(key)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${postFilter === key
                      ? 'bg-[#8b2cf5] border-[#8b2cf5] text-white shadow-[0_0_12px_rgba(139,44,245,0.4)]'
                      : 'bg-[#12121e] border-[#2a2a3e] text-gray-400 hover:border-[#8b2cf5] hover:text-white'
                      }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>

              {loadingPosts ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#8b2cf5]" /></div>
              ) : userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser={currentUser}
                    liked={post.likes?.includes(currentUser?.id || currentUser?._id)}
                    onLike={() => handleLikePost(post._id)}
                    onComment={() => { }}
                    onDeleteComment={() => { }}
                    onDeletePost={() => { }}
                  />
                ))
              ) : (
                <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#1c1c2b] rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-[#4361ee]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">ไม่พบโพสต์</h3>
                  <p className="text-sm text-gray-400">ผู้ใช้นี้ยังไม่ได้โพสต์ในหมวดหมู่ที่เลือก</p>
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