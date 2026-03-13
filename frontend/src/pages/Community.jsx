import React, { useState, useEffect } from 'react';
import {
    Search, Bell, User, Star, Repeat, Users, MessageSquare,
    LogOut, Store, Heart, MessageCircle, Plus, X, ChevronLeft,
    ChevronRight, Image, Send, Flame, BookOpen, ThumbsUp, AlertTriangle,
    PackageSearch, Sparkles, PackageOpen, Check
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// ---------- utils ----------
const API = 'http://localhost:5000/api';

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
    return src ? (
        <img src={src} alt={name} className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-[#8b2cf5]/40`} />
    ) : (
        <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#8b2cf5] to-[#4361ee] flex items-center justify-center text-white font-bold text-sm ring-2 ring-[#8b2cf5]/40`}>
            {initials}
        </div>
    );
}

// ---------- main component ----------
const Community = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchText, setSearchText] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [friends, setFriends] = useState([]);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const [form, setForm] = useState({ content: '', postType: 'GENERAL', tags: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeFilter !== 'ALL') params.postType = activeFilter;
            if (searchText.trim()) params.search = searchText.trim();
            const res = await axios.get(`${API}/community`, { params, withCredentials: true });
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
            const res = await axios.get(`${API}/auth/friends`, { withCredentials: true });
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
            const res = await axios.get(`${API}/notifications`, { withCredentials: true });
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

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
    };

    const handleToggleNotifications = async () => {
        setShowNotifications(!showNotifications);
        setShowDropdown(false);
        if (!showNotifications && unreadCount > 0) {
            try {
                await axios.put(`${API}/notifications/mark-read`, {}, { withCredentials: true });
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
            await axios.put(`${API}/community/${postId}/like`, {}, { withCredentials: true });
            setLikedPosts(prev => {
                const next = new Set(prev);
                next.has(postId) ? next.delete(postId) : next.add(postId);
                return next;
            });
            setPosts(prev => prev.map(p => {
                if (p._id !== postId) return p;
                const liked = likedPosts.has(postId);
                return { ...p, likes: liked ? p.likes.slice(0, -1) : [...p.likes, currentUser.id] };
            }));
        } catch (err) {
            console.error('like error', err);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!form.content.trim()) { setFormError('กรุณาพิมพ์เนื้อหาโพสต์'); return; }
        setSubmitting(true);
        setFormError('');
        try {
            const payload = {
                content: form.content,
                postType: form.postType,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            };
            const res = await axios.post(`${API}/community`, payload, { withCredentials: true });
            if (res.data.success) {
                setShowCreateModal(false);
                setForm({ content: '', postType: 'GENERAL', tags: '' });
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
            await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
            localStorage.removeItem('user');
            navigate('/login');
        } catch (err) {
            console.error('logout error', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-3 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                    <Link to="/" className="flex items-center gap-2 cursor-pointer w-48 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center shadow-[0_0_15px_rgba(139,44,245,0.4)]">
                            <Repeat className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">TradeApp</span>
                    </Link>

                    <form onSubmit={handleSearch} className="flex-1 max-w-3xl relative">
                        <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="ค้นหาโพสต์ในชุมชน..." className="w-full bg-[#151522] border border-[#2a2a3e] rounded-md py-2.5 pl-5 pr-12 focus:outline-none focus:border-[#8b2cf5] transition-all text-sm placeholder-gray-500" />
                        <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-[#8b2cf5] rounded-md hover:bg-[#7220c7] transition"><Search className="w-4 h-4 text-white" /></button>
                    </form>

                    <div className="flex items-center gap-5 w-auto justify-end">
                        <Link to="/shops" className="hidden md:flex items-center gap-2 text-gray-300 hover:text-[#8b2cf5] font-medium transition-colors mr-2"><Store className="w-5 h-5" /> ร้านค้า</Link>

                        <div className="relative">
                            <div className="relative cursor-pointer hover:text-[#8b2cf5] transition" onClick={handleToggleNotifications}>
                                <Bell className="w-6 h-6 text-gray-300" />
                                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                            </div>
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-[#12121e] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                                    <div className="px-4 py-3 border-b border-[#2a2a3e] bg-[#0a0a16] flex justify-between items-center"><h3 className="font-bold text-white">การแจ้งเตือน</h3></div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div key={notif._id} onClick={() => { navigate(`/profile/${notif.sender._id}`); setShowNotifications(false); }} className={`p-3 border-b border-[#2a2a3e]/50 hover:bg-[#1a1a2e] transition cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-[#1c1c2b]/60' : ''}`}>
                                                    <Avatar name={notif.sender?.username} src={notif.sender?.imageProfile} size={10} />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-200 leading-tight"><span className="font-bold text-white">{notif.sender?.username}</span> {notif.message || 'ได้เริ่มติดตามคุณ'}</p>
                                                        <p className="text-xs text-[#8b2cf5] mt-1">{timeAgo(notif.createdAt)}</p>
                                                    </div>
                                                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[#8b2cf5] mt-2 shrink-0"></div>}
                                                </div>
                                            ))
                                        ) : (<div className="p-8 flex flex-col items-center justify-center text-center"><Bell className="w-10 h-10 text-[#2a2a3e] mb-3" /><p className="text-sm text-gray-400">ไม่มีการแจ้งเตือนใหม่</p></div>)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/chat" className="relative cursor-pointer hover:text-[#8b2cf5] transition"><MessageSquare className="w-6 h-6 text-gray-300" /></Link>
                        <div className="h-8 w-px bg-[#2a2a3e] mx-1" />

                        <div className="relative">
                            {currentUser ? (
                                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}>
                                    <Avatar name={currentUser.username} src={currentUser.imageProfile} size={9} />
                                    <span className="hidden sm:block text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate max-w-[100px]">{currentUser.username}</span>
                                    {showDropdown && (
                                        <div className="absolute right-0 top-12 w-48 bg-[#12121e] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden z-50">
                                            <div className="px-4 py-3 border-b border-[#2a2a3e] bg-[#0a0a16]"><p className="text-sm font-bold text-white truncate">{currentUser.username}</p><p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p></div>
                                            <div className="p-2">
                                                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1c1c2b] hover:text-[#8b2cf5] rounded-lg transition-colors"><User className="w-4 h-4" /> โปรไฟล์ของฉัน</Link>
                                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"><LogOut className="w-4 h-4" /> ออกจากระบบ</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (<Link to="/login" className="flex items-center gap-2 cursor-pointer hover:text-[#8b2cf5] transition group"><div className="w-9 h-9 rounded-full bg-[#151522] border-2 border-[#2a2a3e] flex items-center justify-center overflow-hidden group-hover:border-[#8b2cf5]"><User className="w-5 h-5 text-gray-400 group-hover:text-white" /></div></Link>)}
                        </div>
                    </div>
                </div>
            </nav>

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
                        {loading ? (<div className="flex justify-center items-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8b2cf5]" /></div>) : posts.length === 0 ? (<div className="flex flex-col items-center justify-center py-24 text-center"><MessageCircle className="w-14 h-14 mb-4 text-[#2a2a3e]" /><p className="text-gray-300 font-medium">ยังไม่มีโพสต์ในตอนนี้</p></div>) : (<div className="flex flex-col gap-4 p-4">{posts.map(post => (<PostCard key={post._id} post={post} currentUser={currentUser} liked={likedPosts.has(post._id)} onLike={() => handleLike(post._id)} />))}</div>)}
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
                            <div><textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="เขียนอะไรก็ได้ที่อยากแชร์กับชุมชน..." className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#8b2cf5] resize-none transition-colors" /></div>
                            <div><label className="text-xs text-gray-400 mb-1.5 block">แท็ก (คั่นด้วยจุลภาค)</label><input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="#หาของ, #รีวิว" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8b2cf5] transition-colors" /></div>
                            {formError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{formError}</p>}
                            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2 rounded-lg bg-[#1c1c2b] text-gray-400 text-sm">ยกเลิก</button><button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white font-medium text-sm disabled:opacity-50">{submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}โพสต์</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════ POST CARD ═══════════════
function PostCard({ post, currentUser, liked, onLike }) {
    const [expanded, setExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();
    const badgeClass = TYPE_BADGE_COLORS[post.postType] || TYPE_BADGE_COLORS.GENERAL;
    const label = POST_TYPE_LABELS[post.postType]?.label || post.postType;
    const isMe = String(currentUser?.id || currentUser?._id) === String(post.author?._id);
    const isTradeRelated = ["TRADE_OFFER", "FINDING_ITEM"].includes(post.postType);

    const handleChatClick = (e, type) => {
        e.stopPropagation(); setShowMenu(false);
        navigate('/chat', { state: { receiverId: post.author._id, receiverName: post.author.username, chatType: type } });
    };

    const handleFollowClick = async (e) => {
        e.stopPropagation();
        try {
            const res = await axios.put(`${API}/auth/follow/${post.author._id}`, {}, { withCredentials: true });
            if (res.data.success) { alert(res.data.isFollowing ? '✅ ติดตามแล้ว!' : '❌ เลิกติดตามแล้ว'); }
        } catch (error) { console.error("Follow error:", error); alert("ไม่สามารถติดตามได้"); }
        setShowMenu(false);
    };

    return (
        <div className={`bg-[#12121e] rounded-xl border border-[#2a2a3e] hover:border-[#8b2cf5]/40 transition-all group relative ${showMenu ? 'z-50' : 'z-10'}`}>
            {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />}
            <div className="flex items-start gap-3 p-4 relative z-20">
                <div className="flex items-start gap-3 cursor-pointer" onClick={() => setShowMenu(!showMenu)}>
                    <Avatar name={post.author?.username} src={post.author?.imageProfile} size={10} />
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-white text-sm hover:text-[#8b2cf5] transition-colors">{post.author?.username || 'Unknown'}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>{label}</span><span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span></div>
                        {post.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{post.tags.map((t, i) => (<span key={i} className="text-[10px] text-[#8b2cf5] bg-[#8b2cf5]/10 rounded px-1.5 py-0.5">#{t}</span>))}</div>}
                    </div>
                </div>
                {showMenu && (
                    <div className="absolute top-14 left-14 w-48 bg-[#1a1a2e] border border-[#8b2cf5]/50 rounded-xl shadow-2xl z-30 p-1.5 flex flex-col gap-0.5 animate-in zoom-in duration-200">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.author._id}`); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] rounded-lg transition-colors"><User className="w-4 h-4" /> ดูโปรไฟล์</button>
                        {!isMe && (
                            <>
                                <button onClick={handleFollowClick} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] hover:text-[#8b2cf5] rounded-lg transition-colors"><Plus className="w-4 h-4" /> ติดตาม</button>
                                <div className="h-px bg-[#2a2a3e] my-1"></div>
                                <button onClick={(e) => handleChatClick(e, 'GENERAL')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] rounded-lg transition-colors"><MessageCircle className="w-4 h-4" /> แชททั่วไป</button>
                                {isTradeRelated && <button onClick={(e) => handleChatClick(e, 'TRADE')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#8b2cf5] hover:bg-[#8b2cf5]/15 rounded-lg transition-colors"><PackageOpen className="w-4 h-4" /> แชทเทรด/ซื้อ</button>}
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="px-4 pb-3"><p className={`text-gray-200 text-sm leading-relaxed ${!expanded && 'line-clamp-4'}`}>{post.content}</p>{post.content?.length > 250 && (<button onClick={() => setExpanded(!expanded)} className="text-[#8b2cf5] text-xs mt-1 hover:underline">{expanded ? 'ย่อลง' : 'อ่านเพิ่มเติม'}</button>)}</div>
            {post.images?.length > 0 && (<div className={`px-4 pb-3 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>{post.images.slice(0, 4).map((img, i) => (<div key={i} className="relative rounded-lg overflow-hidden bg-[#1c1c2b] aspect-video"><img src={img} className="w-full h-full object-cover" /></div>))}</div>)}
            {post.referencedProduct && (<div className="mx-4 mb-3 flex items-center gap-3 bg-[#1c0d33] border border-[#8b2cf5]/20 rounded-xl p-3"><div className="w-12 h-12 rounded-lg bg-[#2a1a4e] flex items-center justify-center shrink-0">{post.referencedProduct.images?.[0] ? <img src={post.referencedProduct.images[0]} className="w-full h-full object-cover" /> : <Image className="w-5 h-5 text-[#8b2cf5]" />}</div><div><p className="text-xs text-[#8b2cf5] font-semibold mb-0.5">สินค้าที่แนบ</p><p className="text-sm text-white font-medium line-clamp-1">{post.referencedProduct.productName}</p>{post.referencedProduct.price && <p className="text-xs text-gray-400">฿{post.referencedProduct.price.toLocaleString()}</p>}</div></div>)}
            <div className="flex items-center gap-4 px-4 py-3 border-t border-[#1c1c2b]"><button onClick={onLike} className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-[#8b2cf5]' : 'text-gray-500 hover:text-[#8b2cf5]'}`}><Heart className={`w-4 h-4 ${liked ? 'fill-[#8b2cf5]' : ''}`} /><span>{post.likes?.length || 0}</span></button><button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-400"><MessageCircle className="w-4 h-4" /><span>{post.comments?.length || 0}</span></button></div>
        </div>
    );
}

export default Community;