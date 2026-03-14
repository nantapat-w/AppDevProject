import React, { useState, useEffect } from "react";
import { axiosInstance } from "../utils/axios";
import {
  Users,
  Settings as SettingsIcon,
  Tag,
  Trash2,
  Shield,
  ShieldAlert,
  Save,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    bannerTitle: "",
    bannerDiscount: "",
    bannerCode: "",
    bannerDescription: "",
  });
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minAmount: 0,
    expiryDate: "",
    usageLimit: 100,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🟢 1. ดึงข้อมูล User ปัจจุบันมาเช็คสิทธิ์
  let currentUser = null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") currentUser = JSON.parse(userStr);
  } catch (error) { console.error(error); }

  useEffect(() => {
    // 🟢 2. ถ้าไม่ได้ล็อกอิน หรือไม่ใช่ Admin ให้เตะกลับหน้าแรกทันที
    if (!currentUser || currentUser.role !== "admin") {
      toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้!");
      navigate("/");
      return;
    }
    fetchData();
  }, [activeTab]); // ลบ navigate ออกจาก dependency เพราะไม่ได้เปลี่ยนค่า

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const res = await axiosInstance.get("/admin/users");
        setUsers(res.data.data);
      } else if (activeTab === "settings") {
        const res = await axiosInstance.get("/admin/settings");
        setSettings(res.data.data);
      } else if (activeTab === "coupons") {
        const res = await axiosInstance.get("/admin/coupons");
        setCoupons(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/admin/coupons", newCoupon);
      toast.success("Coupon created successfully");
      setNewCoupon({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minAmount: 0,
        expiryDate: "",
        usageLimit: 100,
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await axiosInstance.delete(`/admin/coupons/${id}`);
      toast.success("Coupon deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/status`, {
        accountStatus: newStatus,
      });
      toast.success(`User is now ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    // 🟢 3. ดักไว้ไม่ให้แอดมินเผลอกดลบตัวเอง
    if (currentUser && (currentUser._id === userId || currentUser.id === userId)) {
      return toast.error("ไม่สามารถลบบัญชีผู้ดูแลระบบที่กำลังใช้งานอยู่ได้!");
    }

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put("/admin/settings", settings);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b2cf5] to-[#4361ee]">
              Admin Dashboard
            </h1>
          </div>
        </header>

        <div className="flex gap-4 mb-8 border-b border-[#2a2a3e]">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 flex items-center gap-2 font-medium transition-all relative ${
              activeTab === "users" ? "text-[#8b2cf5]" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Users className="w-5 h-5" /> Users
            {activeTab === "users" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8b2cf5]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-4 flex items-center gap-2 font-medium transition-all relative ${
              activeTab === "settings" ? "text-[#4361ee]" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <SettingsIcon className="w-5 h-5" /> Site Settings
            {activeTab === "settings" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#4361ee]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`pb-3 px-4 flex items-center gap-2 font-medium transition-all relative ${
              activeTab === "coupons" ? "text-pink-500" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Tag className="w-5 h-5" /> Coupons
            {activeTab === "coupons" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-pink-500" />
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#8b2cf5]"></div>
          </div>
        ) : (
          <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl overflow-hidden">
            {activeTab === "users" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#0a0a16] border-b border-[#2a2a3e]">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-300">Username</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-300">Role</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3e]">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-[#1c1c2b] transition">
                        <td className="px-6 py-4 text-sm font-medium">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                            user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                            user.accountStatus === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            user.accountStatus === 'suspended' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {user.accountStatus || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right flex justify-end gap-2">
                          {/* 🟢 ซ่อนปุ่มต่างๆ ถ้าเป็นบัญชีตัวเอง */}
                          {currentUser && String(currentUser._id || currentUser.id) !== String(user._id) && (
                            <>
                              {user.accountStatus === "active" ? (
                                <button
                                  onClick={() => handleUpdateStatus(user._id, "suspended")}
                                  className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition"
                                  title="Suspend User"
                                >
                                  <ShieldAlert className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatus(user._id, "active")}
                                  className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition"
                                  title="Activate User"
                                >
                                  <Shield className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                title="Delete User"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "settings" && (
              <form onSubmit={handleUpdateSettings} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Banner Title</label>
                    <input
                      type="text"
                      value={settings.bannerTitle}
                      onChange={(e) => setSettings({ ...settings, bannerTitle: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#8b2cf5] transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Banner Discount Text</label>
                    <input
                      type="text"
                      value={settings.bannerDiscount}
                      onChange={(e) => setSettings({ ...settings, bannerDiscount: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#8b2cf5] transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Promo Code</label>
                    <input
                      type="text"
                      value={settings.bannerCode}
                      onChange={(e) => setSettings({ ...settings, bannerCode: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#8b2cf5] transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Banner Description</label>
                    <input
                      type="text"
                      value={settings.bannerDescription}
                      onChange={(e) => setSettings({ ...settings, bannerDescription: e.target.value })}
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#8b2cf5] transition"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-[#8b2cf5] hover:bg-[#7220c7] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition"
                  >
                    <Save className="w-5 h-5" /> Save Site Settings
                  </button>
                </div>
              </form>
            )}
            {activeTab === "coupons" && (
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create Form */}
                  <div className="lg:col-span-1 bg-[#0a0a16] p-6 rounded-2xl border border-[#2a2a3e] h-fit">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-pink-500" /> Create Coupon
                    </h3>
                    <form onSubmit={handleCreateCoupon} className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block uppercase font-bold">Code</label>
                        <input
                          type="text"
                          required
                          value={newCoupon.code}
                          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                          className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2.5 focus:border-pink-500 outline-none"
                          placeholder="SALE2024"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block uppercase font-bold">Type</label>
                          <select
                            value={newCoupon.discountType}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                            className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2.5 focus:border-pink-500 outline-none"
                          >
                            <option value="percentage">% Percentage</option>
                            <option value="fixed">฿ Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block uppercase font-bold">Value</label>
                          <input
                            type="number"
                            required
                            value={newCoupon.discountValue}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                            className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2.5 focus:border-pink-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block uppercase font-bold">Expiry Date</label>
                        <input
                          type="date"
                          required
                          value={newCoupon.expiryDate}
                          onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                          className="w-full bg-[#12121e] border border-[#2a2a3e] rounded-xl px-4 py-2.5 focus:border-pink-500 outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-pink-500/20"
                      >
                        Create Coupon
                      </button>
                    </form>
                  </div>

                  {/* List */}
                  <div className="lg:col-span-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[#0a0a16] border-b border-[#2a2a3e]">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Discount</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Expiry</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a3e]">
                          {coupons.map((coupon) => (
                            <tr key={coupon._id} className="hover:bg-[#1c1c2b] transition group">
                              <td className="px-6 py-4">
                                <span className="font-bold text-pink-400 font-mono bg-pink-400/10 px-2 py-1 rounded">
                                  {coupon.code}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `฿${coupon.discountValue}`}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-400">
                                {new Date(coupon.expiryDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteCoupon(coupon._id)}
                                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {coupons.length === 0 && (
                            <tr>
                              <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                No coupons found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;