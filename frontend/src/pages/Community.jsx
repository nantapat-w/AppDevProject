import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Bell, User, Star, Repeat, Users, MessageSquare,
    LogOut, Store, Heart, MessageCircle, Plus, X, ChevronLeft,
    ChevronRight, Image, Send, Flame, BookOpen, ThumbsUp, AlertTriangle,
    PackageSearch, Sparkles, PackageOpen, Check, Camera, Video, Trash2,
    MoreHorizontal, Pencil
} from 'lucide-react';
import { axiosInstance, getImageUrl } from '../utils/axios';


// ---------- utils ----------
const API = ''; // ใช้ axiosInstance ไม่ต้องมี /api แล้ว



const POST_TYPE_LABELS = {
    ALL: { label: 'ทั้งหมด', icon: <Sparkles className="w-3.5 h-3.5" /> },
    GENERAL: { label: 'ทั่วไป', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    TRADE_OFFER: { label: 'แลกของ', icon: <Repeat className="w-3.5 h-3.5" /> },
    FINDING_ITEM: { label: 'ตามหาสินค้า', icon: <PackageSearch className="w-3.5 h-3.5" /> },
    REVIEW: { label: 'รีวิว', icon: <Star className="w-3.5 h-3.5" /> },
};

const TYPE_BADGE_COLORS = {
    GENERAL: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    TRADE_OFFER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    FINDING_ITEM: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    REVIEW: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'เมื่อกี้';
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diff / 86400)} วันที่แล้ว`;
}

// ---------- sub-components ----------
function Avatar({ name, src, size = 9 }) {
    const initials = name ? name.charAt(0).toUpperCase() : '?';
    const imageUrl = getImageUrl(src);


    return imageUrl ? (
        <img
            src={imageUrl}
            alt={name}
            className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-[#8b2cf5]/40`}
            onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
        />
    ) : (
        <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#8b2cf5] to-[#4361ee] flex items-center justify-center text-white font-bold text-sm ring-2 ring-[#8b2cf5]/40`}>
            {initials}
        </div>
    );
}

// ---------- main component ----------
const Community = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const getSafeUser = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr || userStr === 'undefined') return null;
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    };
    const currentUser = getSafeUser();


    const [posts, setPosts] = useState([]);
    const [userData, setUserData] = useState(currentUser); // ใช้เก็บข้อมูลโปรไฟล์ล่าสุด
    const [showDropdown, setShowDropdown] = useState(false); // ควบคุม Dropdown
    const [loading, setLoading] = useState(true);

    // ฟังก์ชันดึงโปรไฟล์ล่าสุดจาก Server เพื่ออัปเดตรูปมุมขวาบน
    const fetchMyProfile = async () => {
        if (!currentUser) return;
        try {
            const targetId = currentUser.id || currentUser._id;
            const res = await axiosInstance.get(`${API}/auth/profile/${targetId}`);

            if (res.data.success) {
                setUserData(res.data.data);
                // อัปเดต LocalStorage ให้มีข้อมูลรูปภาพล่าสุดเสมอ
                localStorage.setItem('user', JSON.stringify(res.data.data));
            }
        } catch (err) {
            console.error("Fetch profile error", err);
        }
    };

    useEffect(() => {
        fetchMyProfile();
    }, []);

    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchText, setSearchText] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [friends, setFriends] = useState([]);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const [form, setForm] = useState({ content: '', postType: 'GENERAL', tags: '' });
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // 🟢 Edit Post State (อยู่ที่ Community level เพื่อให้ Modal ไม่ติด z-index)
    const [editingPost, setEditingPost] = useState(null); // { _id, content, postType, existingImages, newImages }
    const [editSubmitting, setEditSubmitting] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeFilter !== 'ALL') params.postType = activeFilter;
            if (searchText.trim()) params.search = searchText.trim();
            const res = await axiosInstance.get(`${API}/community`, { params });

            if (res.data.success) setPosts(res.data.data);
        } catch (err) {
            console.error('fetch posts error', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFriends = async () => {
        if (!currentUser) return;
        try {
            const res = await axiosInstance.get(`${API}/auth/friends`);

            if (res.data.success) {
                setFriends(res.data.data);
            }
        } catch (err) {
            console.error('fetch friends error', err);
        }
    };

    const fetchNotifications = async () => {
        if (!currentUser) return;
        try {
            const res = await axiosInstance.get(`${API}/notifications`);

            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.data.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error('fetch notifications error', err);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchFriends();
        fetchNotifications();
    }, [activeFilter]);

    const scrolledPostRef = useRef(null);

    // Scroll to specific post if navigated from notification
    useEffect(() => {
        if (!loading && posts.length > 0) {
            const queryParams = new URLSearchParams(location.search);
            const postId = queryParams.get('postId');

            if (postId && scrolledPostRef.current !== postId) {
                const element = document.getElementById(`post-${postId}`);
                if (element) {
                    scrolledPostRef.current = postId; // Mark as scrolled
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add a highlight effect
                        element.classList.add('ring-2', 'ring-[#8b2cf5]', 'ring-offset-2', 'ring-offset-[#12121e]', 'transition-all', 'duration-1000');
                        setTimeout(() => {
                            element.classList.remove('ring-2', 'ring-[#8b2cf5]', 'ring-offset-2', 'ring-offset-[#12121e]');
                        }, 3000);

                        // Clear the postId from URL so it doesn't scroll again on manual refresh
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }, 500); // Wait a bit for images to load
                }
            }
        }
    }, [loading, posts, location.search]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
    };

    const handleToggleNotifications = async () => {
        setShowNotifications(!showNotifications);
        setShowDropdown(false);
        if (!showNotifications && unreadCount > 0) {
            try {
                await axiosInstance.put(`${API}/notifications/mark-read`, {});

                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (error) {
                console.error("Mark as read error:", error);
            }
        }
    };

    const handleLike = async (postId) => {
        if (!currentUser) { navigate('/login'); return; }
        try {
            const res = await axiosInstance.put(`${API}/community/${postId}/like`, {});

            if (res.data.success) {
                setPosts(prev => prev.map(p => {
                    if (p._id !== postId) return p;
                    return { ...p, likes: res.data.data };
                }));
            }
        } catch (err) {
            console.error('like error', err);
        }
    };

    const handleComment = async (postId, text) => {
        if (!currentUser) { navigate('/login'); return; }
        try {
            const res = await axiosInstance.post(`${API}/community/${postId}/comment`, { text });

            if (res.data.success) {
                setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: res.data.data } : p));
            }
        } catch (err) { console.error('comment error', err); alert(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm('ต้องการลบคอมเมนต์นี้ใช่หรือไม่?')) return;
        try {
            const res = await axiosInstance.delete(`${API}/community/${postId}/comment/${commentId}`);

            if (res.data.success) {
                setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: res.data.data } : p));
            }
        } catch (err) { console.error('delete comment error', err); alert('ไม่สามารถลบคอมเมนต์ได้'); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('ต้องการลบโพสต์นี้ใช่หรือไม่?')) return;
        try {
            const res = await axiosInstance.delete(`${API}/community/${postId}`);

            if (res.data.success) {
                setPosts(prev => prev.filter(p => p._id !== postId));
            }
        } catch (err) { console.error('delete post error', err); alert('ไม่สามารถลบโพสต์ได้'); }
    };

    const handleEditPost = async (postId, editData) => {
        try {
            const formData = new FormData();
            formData.append('content', editData.content);
            formData.append('postType', editData.postType);
            formData.append('keepImages', JSON.stringify(editData.existingImages || []));

            // เพิ่มรูปใหม่ที่เลือกไว้
            if (editData.newImages && editData.newImages.length > 0) {
                editData.newImages.forEach(img => formData.append('images', img));
            }

            const res = await axiosInstance.put(`${API}/community/${postId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setPosts(prev => prev.map(p => {
                    if (p._id !== postId) return p;
                    return {
                        ...p,
                        content: res.data.data.content,
                        postType: res.data.data.postType,
                        status: res.data.data.status,
                        tags: res.data.data.tags || p.tags,
                        images: res.data.data.images || [],
                    };
                }));
            }
        } catch (err) { console.error('edit post error', err); alert(err.response?.data?.message || 'ไม่สามารถแก้ไขโพสต์ได้'); }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 4) {
            setFormError('อัปโหลดรูปภาพได้ไม่เกิน 4 รูป');
            return;
        }
        setImages(prev => [...prev, ...files]);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                setFormError('วิดีโอต้องมีขนาดไม่เกิน 50MB');
                return;
            }
            setVideo(file);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeVideo = () => {
        setVideo(null);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!form.content.trim()) { setFormError('กรุณาพิมพ์เนื้อหาโพสต์'); return; }
        setSubmitting(true);
        setFormError('');
        try {
            const formData = new FormData();
            formData.append('content', form.content);
            formData.append('postType', form.postType);

            const tagsArray = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            formData.append('tags', JSON.stringify(tagsArray));

            images.forEach(img => {
                formData.append('images', img);
            });

            if (video) {
                formData.append('video', video);
            }

            const res = await axiosInstance.post(`${API}/community`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setShowCreateModal(false);
                setForm({ content: '', postType: 'GENERAL', tags: '' });
                setImages([]);
                setVideo(null);
                fetchPosts();
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/auth/logout', {});

            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
        } catch (err) {
            console.error('logout error', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans">
            {/* Navbar */}
            <Navbar
                currentUser={userData}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
            />

            <div className="bg-gradient-to-r from-[#1c0d33] via-[#0e0a20] to-[#05050f] border-b border-[#2a2a3e] py-5 px-4">
                <div className="max-w-7xl mx-auto flex items-center gap-3"><div className="p-2.5 bg-[#8b2cf5]/20 rounded-xl border border-[#8b2cf5]/30"><Users className="w-6 h-6 text-[#8b2cf5]" /></div><div><h1 className="text-xl font-bold text-white">ชุมชนนักแลก</h1><p className="text-xs text-gray-400">พูดคุย แชร์ และหาของแลกกัน</p></div></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-5">
                <div className="flex-1 min-w-0 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto flex-1">
                            <ChevronLeft className="w-4 h-4 text-gray-500 shrink-0" />
                            {Object.entries(POST_TYPE_LABELS).map(([key, { label, icon }]) => (
                                <button key={key} onClick={() => setActiveFilter(key)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${activeFilter === key ? 'bg-[#8b2cf5] border-[#8b2cf5] text-white shadow-[0_0_12px_rgba(139,44,245,0.5)]' : 'bg-[#12121e] border-[#2a2a3e] text-gray-400 hover:border-[#8b2cf5] hover:text-white'}`}>{icon}{label}</button>
                            ))}
                            <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                        </div>
                        <button onClick={() => currentUser ? setShowCreateModal(true) : navigate('/login')} className="shrink-0 flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-semibold text-sm shadow-[0_0_20px_rgba(139,44,245,0.5)] hover:scale-105 transition-all w-full sm:w-auto"><Plus className="w-4 h-4" /> เพิ่มโพสต์</button>
                    </div>

                    <div className="relative bg-[#12121e] rounded-xl border border-[#2a2a3e] min-h-[300px]">
                        {loading ? (<div className="flex justify-center items-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8b2cf5]" /></div>) : posts.length === 0 ? (<div className="flex flex-col items-center justify-center py-24 text-center"><MessageCircle className="w-14 h-14 mb-4 text-[#2a2a3e]" /><p className="text-gray-300 font-medium">ยังไม่มีโพสต์ในตอนนี้</p></div>) : (<div className="flex flex-col gap-4 p-4">{posts.map(post => {
                            const isFollowed = friends.some(f => f._id === post.author?._id);
                            return <PostCard key={post._id} post={post} currentUser={currentUser} liked={post.likes?.includes(currentUser?.id || currentUser?._id)} isFollowing={isFollowed} onLike={() => handleLike(post._id)} onComment={handleComment} onDeleteComment={handleDeleteComment} onDeletePost={handleDeletePost} onStartEdit={(p) => setEditingPost({ _id: p._id, content: p.content, postType: p.postType, existingImages: p.images || [], newImages: [] })} />
                        })}</div>)}
                    </div>
                </div>

                {/* ─── RIGHT: Friends (Mutual Follow Only) ─── */}
                <aside className="w-64 shrink-0 hidden lg:block">
                    <div className="bg-[#12121e] rounded-xl border border-[#2a2a3e] p-4 sticky top-24">
                        <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-[#8b2cf5]" /><span className="font-semibold text-sm text-gray-200">เพื่อนในตอนนี้</span></div>
                        <div className="flex flex-col gap-3">
                            {friends.length > 0 ? (
                                friends.map(f => (
                                    <div
                                        key={f._id}
                                        onClick={() => {
                                            // 🟢 จิ้มที่ชื่อเพื่อนปุ๊บ วาร์ปไปคุยแชทกับเพื่อนคนนี้ปั๊บ!
                                            navigate('/chat', {
                                                state: {
                                                    receiverId: f._id,
                                                    receiverName: f.username,
                                                    chatType: 'GENERAL'
                                                }
                                            });
                                        }}
                                        className="flex items-center gap-3 cursor-pointer group hover:bg-[#1c1c2b] rounded-lg p-2 transition-colors -mx-2"
                                    >
                                        <div className="relative">
                                            <Avatar name={f.username} src={f.imageProfile} size={9} />
                                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#12121e] bg-orange-400`} />
                                        </div>
                                        <div><p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{f.username}</p><p className="text-[10px] text-gray-500">ออนไลน์</p></div>
                                    </div>
                                ))
                            ) : (<div className="text-center py-6 border border-dashed border-[#2a2a3e] rounded-lg"><p className="text-sm text-gray-400">ยังไม่มีเพื่อน</p><p className="text-[10px] text-gray-500 mt-1">ต้องติดตามกันและกันก่อนนะ!</p></div>)}
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#2a2a3e]">
                            <button
                                onClick={() => {
                                    // 🟢 ถ้ามีเพื่อน ให้เปิดแชทกับคนแรกในลิสต์ทันที
                                    if (friends.length > 0) {
                                        navigate('/chat', {
                                            state: {
                                                receiverId: friends[0]._id,
                                                receiverName: friends[0].username,
                                                chatType: 'GENERAL'
                                            }
                                        });
                                    } else {
                                        navigate('/chat');
                                    }
                                }}
                                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#1c1c2b] hover:bg-[#8b2cf5]/20 hover:text-[#8b2cf5] text-gray-400 text-sm transition-colors border border-[#2a2a3e]"
                            >
                                <MessageSquare className="w-4 h-4" /> เปิดแชท
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-[#12121e] border border-[#2a2a3e] rounded-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3e] bg-[#0a0a16]"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b2cf5] to-[#4361ee] flex items-center justify-center"><Plus className="w-4 h-4 text-white" /></div><h2 className="font-bold text-white">สร้างโพสต์ใหม่</h2></div><button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-[#2a2a3e] rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <form onSubmit={handleCreatePost} className="p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3"><Avatar name={currentUser?.username} src={currentUser?.imageProfile} size={10} /><div><p className="font-semibold text-white text-sm">{currentUser?.username}</p><p className="text-xs text-gray-500">กำลังโพสต์ในชุมชน</p></div></div>
                            <div><label className="text-xs text-gray-400 mb-1.5 block">ประเภทโพสต์</label><div className="flex flex-wrap gap-2">{Object.entries(POST_TYPE_LABELS).filter(([k]) => k !== 'ALL').map(([key, { label, icon }]) => (<button type="button" key={key} onClick={() => setForm(f => ({ ...f, postType: key }))} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.postType === key ? 'bg-[#8b2cf5] border-[#8b2cf5] text-white' : 'bg-[#1c1c2b] border-[#2a2a3e] text-gray-400'}`}>{icon}{label}</button>))}</div></div>
                            <div>
                                <textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="เขียนอะไรก็ได้ที่อยากแชร์กับชุมชน..." className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#8b2cf5] resize-none transition-colors" />
                            </div>

                            {/* Media Preview Area */}
                            {(images.length > 0 || video) && (
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#2a2a3e] scrollbar-track-transparent">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-[#2a2a3e]">
                                            <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"><X className="w-3 h-3 text-white" /></button>
                                        </div>
                                    ))}
                                    {video && (
                                        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-[#2a2a3e] bg-black">
                                            <video src={URL.createObjectURL(video)} className="w-full h-full object-cover" />
                                            <button type="button" onClick={removeVideo} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"><X className="w-3 h-3 text-white" /></button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <div className="flex gap-3 mb-2">
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a3e] hover:border-[#8b2cf5]/50 hover:bg-[#8b2cf5]/10 transition-all">
                                        <Image className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-300">รูปภาพ</span>
                                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                    </label>
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a3e] hover:border-[#8b2cf5]/50 hover:bg-[#8b2cf5]/10 transition-all">
                                        <Video className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-300">วิดีโอ</span>
                                        <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">อัปโหลดรูปภาพได้ไม่เกิน 4 รูป และวิดีโอ 1 คลิป (ขนาดรวมไม่เกิน 50MB)</p>
                            </div>

                            <div><label className="text-xs text-gray-400 mb-1.5 block">แท็ก (คั่นด้วยจุลภาค)</label><input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="#หาของ, #รีวิว" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition-colors" /></div>
                            {formError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{formError}</p>}
                            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2 rounded-lg bg-[#1c1c2b] text-gray-400 text-sm">ยกเลิก</button><button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-medium text-sm disabled:opacity-50">{submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}โพสต์</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🟢 Edit Post Modal — อยู่ที่ Community level เพื่อไม่ให้ติด z-index */}
            {editingPost && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setEditingPost(null)}>
                    <div className="w-full max-w-lg bg-[#12121e] border border-[#2a2a3e] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3e] bg-[#0a0a16] sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b2cf5] to-[#4361ee] flex items-center justify-center">
                                    <Pencil className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="font-bold text-white">แก้ไขโพสต์</h2>
                            </div>
                            <button onClick={() => setEditingPost(null)} className="p-1 hover:bg-[#2a2a3e] rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">ประเภทโพสต์</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(POST_TYPE_LABELS).filter(([k]) => k !== 'ALL').map(([key, { label, icon }]) => (
                                        <button type="button" key={key} onClick={() => setEditingPost(prev => ({ ...prev, postType: key }))} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${editingPost.postType === key ? 'bg-[#8b2cf5] border-[#8b2cf5] text-white' : 'bg-[#1c1c2b] border-[#2a2a3e] text-gray-400'}`}>{icon}{label}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <textarea rows={4} value={editingPost.content} onChange={e => setEditingPost(prev => ({ ...prev, content: e.target.value }))} placeholder="เขียนเนื้อหาโพสต์..." className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#8b2cf5] resize-none transition-colors" />
                            </div>

                            {/* รูปภาพเดิมที่มีอยู่ + รูปใหม่ที่เลือก */}
                            {(editingPost.existingImages?.length > 0 || editingPost.newImages?.length > 0) && (
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 block">รูปภาพ ({(editingPost.existingImages?.length || 0) + (editingPost.newImages?.length || 0)}/4)</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {/* รูปเดิม (Cloudinary URL) */}
                                        {editingPost.existingImages?.map((url, i) => (
                                            <div key={`existing-${i}`} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-[#2a2a3e]">
                                                <img src={url} alt="existing" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setEditingPost(prev => ({ ...prev, existingImages: prev.existingImages.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 p-1 bg-black/70 rounded-full hover:bg-red-500/80 transition-colors">
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* รูปใหม่ (File object) */}
                                        {editingPost.newImages?.map((file, i) => (
                                            <div key={`new-${i}`} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-[#8b2cf5]/50">
                                                <img src={URL.createObjectURL(file)} alt="new" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setEditingPost(prev => ({ ...prev, newImages: prev.newImages.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 p-1 bg-black/70 rounded-full hover:bg-red-500/80 transition-colors">
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                                <span className="absolute bottom-1 left-1 text-[9px] bg-[#8b2cf5] text-white px-1.5 py-0.5 rounded">ใหม่</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ปุ่มเพิ่มรูป */}
                            {((editingPost.existingImages?.length || 0) + (editingPost.newImages?.length || 0)) < 4 && (
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a3e] hover:border-[#8b2cf5]/50 hover:bg-[#8b2cf5]/10 transition-all w-fit">
                                    <Image className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">เพิ่มรูปภาพ</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        const totalImages = (editingPost.existingImages?.length || 0) + (editingPost.newImages?.length || 0);
                                        const maxNew = 4 - totalImages;
                                        if (files.length > maxNew) {
                                            alert(`เพิ่มได้อีกแค่ ${maxNew} รูป`);
                                            return;
                                        }
                                        setEditingPost(prev => ({ ...prev, newImages: [...(prev.newImages || []), ...files.slice(0, maxNew)] }));
                                        e.target.value = ''; // reset input
                                    }} />
                                </label>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditingPost(null)} className="px-5 py-2 rounded-lg bg-[#1c1c2b] text-gray-400 text-sm hover:bg-[#2a2a3e] transition-colors">ยกเลิก</button>
                                <button
                                    disabled={editSubmitting || !editingPost.content.trim()}
                                    onClick={async () => {
                                        setEditSubmitting(true);
                                        await handleEditPost(editingPost._id, {
                                            content: editingPost.content,
                                            postType: editingPost.postType,
                                            existingImages: editingPost.existingImages || [],
                                            newImages: editingPost.newImages || [],
                                        });
                                        setEditSubmitting(false);
                                        setEditingPost(null);
                                    }}
                                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-medium text-sm disabled:opacity-50 hover:shadow-[0_0_15px_rgba(139,44,245,0.4)] transition-all"
                                >
                                    {editSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════ POST CARD ═══════════════
function PostCard({ post, currentUser, liked, isFollowing, onLike, onComment, onDeleteComment, onDeletePost, onStartEdit }) {
    const [expanded, setExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showCommentMenu, setShowCommentMenu] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showPostMenu, setShowPostMenu] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        // ฟังก์ชันสำหรับปิดเมนูทั้งหมด
        const closeAllDropdowns = () => {
            setShowMenu(false);
            setShowCommentMenu(null);
            setShowPostMenu(false);
        };

        // ดักการคลิกที่ว่างทั่วทั้งหน้าเว็บ (แก้ปัญหาที่ 2)
        document.addEventListener('click', closeAllDropdowns);

        // ดัก Event พิเศษ เผื่อกรณีเราไปกดเปิดเมนูของโพสต์อื่น (แก้ปัญหาที่ 1 แบบข้ามโพสต์)
        document.addEventListener('closeCustomDropdowns', closeAllDropdowns);

        return () => {
            document.removeEventListener('click', closeAllDropdowns);
            document.removeEventListener('closeCustomDropdowns', closeAllDropdowns);
        };
    }, []);
    const badgeClass = TYPE_BADGE_COLORS[post.postType] || TYPE_BADGE_COLORS.GENERAL;
    const label = POST_TYPE_LABELS[post.postType]?.label || post.postType;
    const isMe = String(currentUser?.id || currentUser?._id) === String(post.author?._id);
    const isAdmin = currentUser?.role === 'admin';
    const isTradeRelated = ["TRADE_OFFER", "FINDING_ITEM"].includes(post.postType);

    const handleChatClick = (e, type, overrideUser) => {
        e.stopPropagation(); setShowMenu(false); setShowCommentMenu(null);
        const targetUser = overrideUser || post.author;
        navigate('/chat', { state: { receiverId: targetUser._id, receiverName: targetUser.username, chatType: type } });
    };

    const handleFollowClick = async (e, overrideUserId) => {
        e.stopPropagation();
        const targetId = overrideUserId || post.author._id;
        try {
            const res = await axiosInstance.put(`/auth/follow/${targetId}`, {});

            if (res.data.success) { alert(res.data.isFollowing ? '✅ ติดตามแล้ว!' : '❌ เลิกติดตามแล้ว'); }
        } catch (error) { console.error("Follow error:", error); alert("ไม่สามารถติดตามได้"); }
        setShowMenu(false); setShowCommentMenu(null);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onComment(post._id, commentText);
        setCommentText('');
    };

    // Combine video and images for gallery
    const mediaItems = [];
    if (post.video) mediaItems.push({ type: 'video', url: getImageUrl(post.video) });
    if (post.images?.length > 0) {
        post.images.forEach(img => {
            mediaItems.push({ type: 'image', url: getImageUrl(img) });
        });
    }



    const postDate = new Date(post.createdAt);
    const dateFormatted = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;

    return (
        <div id={`post-${post._id}`} className={`bg-[#12121e] rounded-xl border border-[#2a2a3e] hover:border-[#8b2cf5]/40 transition-all group relative ${(showMenu || showCommentMenu !== null) ? 'z-[60]' : 'z-10'}`}>
            <div className="flex items-start justify-between gap-3 p-4 relative z-20">
                <div className="flex items-start gap-3 cursor-pointer" onClick={(e) => {
                    e.stopPropagation(); // กันไม่ให้คลิกนี้ทะลุไปลั่น document.addEventListener
                    document.dispatchEvent(new Event('closeCustomDropdowns')); // สั่งปิดเมนูอื่นๆ ทั้งแอป
                    setShowMenu(!showMenu); // สลับสถานะเมนูตัวเอง
                    setShowCommentMenu(null); // ปิดเมนูคอมเมนต์ในโพสต์เดียวกัน (เผื่อเปิดค้างไว้)
                }}>
                    <Avatar name={post.author?.username} src={post.author?.imageProfile} size={10} />
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-white text-sm hover:text-[#8b2cf5] transition-colors">{post.author?.username || 'Unknown'}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>{label}</span><span className="text-xs text-gray-500">{dateFormatted} • {timeAgo(post.createdAt)}</span></div>
                        {post.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{post.tags.map((t, i) => (<span key={i} className="text-[10px] text-[#8b2cf5] bg-[#8b2cf5]/10 rounded px-1.5 py-0.5">#{t}</span>))}</div>}
                    </div>
                </div>
                {(isMe || isAdmin) && (
                    <button onClick={() => onDeletePost(post._id)} className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all" title="ลบโพสต์">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
                {showMenu && (
                    <div className="absolute top-14 left-14 w-48 bg-[#1a1a2e] border border-[#8b2cf5]/50 rounded-xl shadow-2xl z-30 p-1.5 flex flex-col gap-0.5 animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="px-3 py-2 border-b border-[#2a2a3e] mb-1"><span className="font-bold text-white text-sm truncate block">{post.author?.username || 'Unknown'}</span></div>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.author._id}`); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] rounded-lg transition-colors"><User className="w-4 h-4" /> ดูโปรไฟล์</button>
                        {!isMe && (
                            <>
                                <button onClick={handleFollowClick} className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isFollowing ? 'text-gray-400 hover:bg-red-500/20 hover:text-red-400' : 'text-gray-300 hover:bg-[#2a2a3e] hover:text-[#8b2cf5]'}`}>{isFollowing ? <><Check className="w-4 h-4" /> เลิกติดตาม</> : <><Plus className="w-4 h-4" /> ติดตาม</>}</button>
                                <div className="h-px bg-[#2a2a3e] my-1"></div>
                                <button onClick={(e) => handleChatClick(e, 'GENERAL')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] rounded-lg transition-colors"><MessageCircle className="w-4 h-4" /> แชททั่วไป</button>
                                {isTradeRelated && <button onClick={(e) => handleChatClick(e, 'TRADE')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#8b2cf5] hover:bg-[#8b2cf5]/15 rounded-lg transition-colors"><PackageOpen className="w-4 h-4" /> แชทเทรด/ซื้อ</button>}
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="px-4 pb-3"><p className={`text-gray-200 text-sm leading-relaxed ${!expanded && 'line-clamp-4'}`}>{post.content}</p>{post.content?.length > 250 && (<button onClick={() => setExpanded(!expanded)} className="text-[#8b2cf5] text-xs mt-1 hover:underline">{expanded ? 'ย่อลง' : 'อ่านเพิ่มเติม'}</button>)}</div>

            {/* Media Gallery */}
            {mediaItems.length > 0 && (
                <div className={`px-4 pb-3 grid gap-2 ${mediaItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {mediaItems.slice(0, 4).map((item, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden bg-[#1c1c2b] aspect-video border border-[#2a2a3e]">
                            {item.type === 'video' ? (
                                <video src={item.url} controls className="w-full h-full object-cover" />
                            ) : (
                                <img src={item.url} className="w-full h-full object-cover" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {post.referencedProduct && (<div className="mx-4 mb-3 flex items-center gap-3 bg-[#1c0d33] border border-[#8b2cf5]/20 rounded-xl p-3"><div className="w-12 h-12 rounded-lg bg-[#2a1a4e] flex items-center justify-center shrink-0">{post.referencedProduct.images?.[0] ? <img src={getImageUrl(post.referencedProduct.images[0])} className="w-full h-full object-cover" /> : <Image className="w-5 h-5 text-[#8b2cf5]" />}</div><div><p className="text-xs text-[#8b2cf5] font-semibold mb-0.5">สินค้าที่แนบ</p><p className="text-sm text-white font-medium line-clamp-1">{post.referencedProduct.productName}</p>{post.referencedProduct.price && <p className="text-xs text-gray-400">฿{post.referencedProduct.price.toLocaleString()}</p>}</div></div>)}

            <div className="flex items-center gap-4 px-4 py-3 border-t border-[#1c1c2b]">
                {/* ปุ่ม Like */}
                <button
                    onClick={onLike}
                    className={`flex items-center gap-1.5 text-sm transition-all duration-200 cursor-pointer hover:scale-110 ${liked ? 'text-[#8b2cf5]' : 'text-gray-500 hover:text-[#8b2cf5]'}`}
                >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-[#8b2cf5]' : ''}`} />
                    <span>{post.likes?.length || 0}</span>
                </button>
                {/* ปุ่ม Comment */}
                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 text-sm transition-all duration-200 cursor-pointer hover:scale-110 ${showComments ? 'text-[#8b2cf5]' : 'text-gray-500 hover:text-[#8b2cf5]'}`}
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments?.length || 0}</span>
                </button>

            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 pb-4 border-t border-[#1c1c2b] pt-3 bg-[#12121e]">

                    {/* รายการคอมเมนต์ที่มีอยู่ */}
                    {post.comments?.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {post.comments.map(comment => {
                                const isCommentOwner = String(currentUser?.id || currentUser?._id) === String(comment.user?._id);
                                const isPostOwner = isMe;
                                const canDelete = isCommentOwner || isPostOwner || isAdmin;
                                const isCommentMenuOpen = showCommentMenu === comment._id;
                                const isCommentAuthorFollowing = isFollowing; // Assuming isFollowing passed to PostCard applies to the post author, not comment author. Need to adjust if comment author's follow status is needed.

                                return (
                                    <div key={comment._id} className={`flex items-start gap-2.5 p-2 rounded-lg transition group relative ${isCommentMenuOpen ? 'z-[100] bg-[#1a1a2e]' : 'z-10 hover:bg-[#1a1a2e]'}`}>

                                        {/* Avatar และ Dropdown เมนูของคอมเมนต์ */}
                                        <div className="relative z-[120]">
                                            <div onClick={(e) => {
                                                e.stopPropagation();
                                                document.dispatchEvent(new Event('closeCustomDropdowns'));
                                                setShowCommentMenu(isCommentMenuOpen ? null : comment._id);
                                                setShowMenu(false); // ปิดเมนูหลักของโพสต์
                                            }} className="cursor-pointer">
                                                <Avatar name={comment.user?.username} src={comment.user?.imageProfile} size={8} />
                                            </div>

                                            {/* 🛠️ Dropdown เมนูโปรไฟล์ */}
                                            {isCommentMenuOpen && (
                                                <div
                                                    className="absolute top-10 left-0 w-48 bg-[#1a1a2e] border border-[#8b2cf5]/50 rounded-xl shadow-2xl z-[999] p-1.5 flex flex-col gap-0.5 animate-in zoom-in duration-200"
                                                    style={{ position: 'absolute' }} onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="px-3 py-2 border-b border-[#2a2a3e] mb-1">
                                                        <span className="font-bold text-white text-sm truncate block">
                                                            {comment.user?.username || 'Unknown'}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${comment.user._id}`); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] rounded-lg transition-colors"
                                                    >
                                                        <User className="w-4 h-4" /> ดูโปรไฟล์
                                                    </button>

                                                    {!isCommentOwner && (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleFollowClick(e, comment.user._id)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] hover:text-[#8b2cf5] rounded-lg transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4" /> ติดตาม
                                                            </button>
                                                            <div className="h-px bg-[#2a2a3e] my-1"></div>
                                                            <button
                                                                onClick={(e) => handleChatClick(e, 'GENERAL', comment.user)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] rounded-lg transition-colors"
                                                            >
                                                                <MessageCircle className="w-4 h-4" /> แชททั่วไป
                                                            </button>
                                                            {isTradeRelated && (
                                                                <button
                                                                    onClick={(e) => handleChatClick(e, 'TRADE', comment.user)}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#8b2cf5] hover:bg-[#8b2cf5]/15 rounded-lg transition-colors"
                                                                >
                                                                    <PackageOpen className="w-4 h-4" /> แชทเทรด/ซื้อ
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* เนื้อหาของคอมเมนต์ */}
                                        <div className="flex-1 min-w-0 relative z-40">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            document.dispatchEvent(new Event('closeCustomDropdowns'));
                                                            setShowCommentMenu(isCommentMenuOpen ? null : comment._id);
                                                            setShowMenu(false);
                                                        }}
                                                        className="font-semibold text-white text-xs cursor-pointer hover:text-[#8b2cf5] transition-colors"
                                                    >
                                                        {comment.user?.username || 'Unknown'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-600">{timeAgo(comment.createdAt)}</span>
                                                </div>
                                                {canDelete && (
                                                    <button
                                                        onClick={() => onDeleteComment(post._id, comment._id)}
                                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-300 mt-0.5 break-words">{comment.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-xs text-gray-500 py-2 border-b border-[#1c1c2b] mb-2">
                            ยังไม่มีความคิดเห็น มาเป็นคนแรกสิ!
                        </div>
                    )}

                    {/* ✨ ฟอร์มสำหรับพิมพ์ตอบกลับคอมเมนต์ ✨ */}
                    <form onSubmit={handleCommentSubmit} className="mt-3 flex items-center gap-3">
                        <Avatar name={currentUser?.username} src={currentUser?.imageProfile} size={8} />
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="เขียนความคิดเห็น..."
                            className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#8b2cf5] text-white hover:bg-[#7220c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                            <Send className="w-4 h-4 -ml-0.5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export {
    PostCard,
    Avatar,
    timeAgo,
    POST_TYPE_LABELS,
    TYPE_BADGE_COLORS
};

export default Community;