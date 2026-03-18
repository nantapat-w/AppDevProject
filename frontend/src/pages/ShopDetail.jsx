import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Star, MapPin, Plus, Package, X, Upload, Image as ImageIcon, Trash2, ShieldCheck, Calendar, Hash, MessageCircle, UserCheck, Clock, Pencil, AlertTriangle } from 'lucide-react';
import { axiosInstance } from '../utils/axios';

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 State สำหรับเก็บรายการสินค้าที่จะดึงมาโชว์
  const [products, setProducts] = useState([]);

  // State Modal เพิ่มสินค้า
  const [showAddModal, setShowAddModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [productForm, setProductForm] = useState({
    productName: '',
    description: '',
    price: '',
    category: 'electronics',
    condition: 'USED_GOOD',
    tradeType: 'BOTH',
  });

  // ✏️ State Modal แก้ไขร้านค้า
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ shopName: '', shopDescription: '' });
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editLogoPreview, setEditLogoPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // 🗑️ State Modal ลบร้านค้า
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  let currentUser = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") currentUser = JSON.parse(userStr);
  } catch (error) { console.error(error); }

  const myId = String(currentUser?.id || currentUser?._id || "");

  // 🟢 useEffect ดึงทั้ง "ข้อมูลร้านค้า" และ "สินค้าของร้านนี้"
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        // 1. ดึงข้อมูลร้านค้า
        // 🔗 ไปที่ Backend: GET /api/shops/:id (Router: shop.route.js)
        // 🛠️ Controller: getShopById ใน shop.controller.js
        // 📤 ส่งอะไรไป: ส่ง id ผ่าน URL Params (req.params.id)
        // 📥 ได้อะไรกลับมา: ข้อมูลร้านค้าที่ populate ownerId แล้ว (res.data.data)
        const shopRes = await axiosInstance.get(`/shops/${id}`);
        if (shopRes.data.success || shopRes.data) {
          const shopData = shopRes.data.data || shopRes.data;
          setShop(shopData);
          setEditForm({ shopName: shopData.shopName, shopDescription: shopData.shopDescription || '' });
          setEditLogoPreview(shopData.shopLogo || null);
        }

        // 2. ดึงข้อมูลสินค้าของร้านนี้
        // 🔗 ไปที่ Backend: GET /api/products/shop/:id (Router: product.route.js)
        // 🛠️ Controller: getProductsByShop ใน product.controller.js
        // 📤 ส่งอะไรไป: ส่ง shopId ผ่าน URL Params (req.params.shopId)
        // 📥 ได้อะไรกลับมา: Array ของสินค้าทั้งหมดในร้านที่มีสถานะ AVAILABLE (res.data.data)
        const productRes = await axiosInstance.get(`/products/shop/${id}`);
        if (productRes.data.success) {
          setProducts(productRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditLogoFile(file);
      setEditLogoPreview(URL.createObjectURL(file));
    }
  };

  // ➕ ฟังก์ชันเพิ่มสินค้าลงในร้านค้า
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.productName) return alert('กรุณากรอกชื่อสินค้า');

    // 📦 เตรียมข้อมูลส่งไปแบบ FormData เพื่อรองรับการอัปโหลดรูปภาพ
    const formData = new FormData();
    formData.append('productName', productForm.productName);
    formData.append('productDescription', productForm.description);
    formData.append('price', Number(productForm.price) || 0);
    formData.append('condition', productForm.condition);
    formData.append('category', productForm.category);
    formData.append('tradeType', productForm.tradeType);
    formData.append('shopId', id); // เชื่อมโยงกับร้านค้าปัจจุบัน

    // แนบไฟล์รูปภาพสินค้าใหม่ (ถ้ามี)
    if (productFile) {
      formData.append('image', productFile);
    }

    try {
      // 🔗 ไปที่ Backend: POST /api/products/
      // 🛠️ Controller: createProduct ใน product.controller.js
      // 📤 ส่ง formData พร้อมแนบ cookies (withCredentials) เพื่อตรวจสอบสิทธิ์การเป็นเจ้าของร้าน
      const res = await axiosInstance.post(`/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setShowAddModal(false);
        alert('🎉 เพิ่มสินค้าใหม่ลงร้านเรียบร้อยแล้ว!');
        window.location.reload(); // รีโหลดเพื่อให้เห็นสินค้าใหม่ในรายการ
      }
    } catch (error) {
      console.error("Add product error:", error.response?.data || error);
      alert(`Error: ${error.response?.data?.message || 'ไม่สามารถเพิ่มสินค้าได้'}`);
    }
  };

  // 🗑️ ฟังก์ชันลบสินค้า
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return;

    try {
      // 🔗 ไปที่ Backend: DELETE /api/products/:id (Router: product.route.js)
      // 🛠️ Controller: deleteProduct ใน product.controller.js
      // 📤 ส่งอะไรไป: ส่ง productId ผ่าน URL Params พร้อม cookies (ตรวจสอบ auth และ owner ของสินค้า)
      // 📥 ได้อะไรกลับมา: Message confirm การลบสำเร็จ (res.data.message)
      const res = await axiosInstance.delete(`/products/${productId}`);

      if (res.data.success) {
        setProducts(products.filter(p => p._id !== productId));
        alert('ลบสินค้าเรียบร้อยแล้ว');
      }
    } catch (error) {
      console.error("Delete product error:", error.response?.data || error);
      alert(`Error: ${error.response?.data?.message || 'ลบไม่ได้ เช็ค Backend'}`);
    }
  };

  // ✏️ แก้ไขร้านค้า
  const handleUpdateShop = async (e) => {
    e.preventDefault();
    if (!editForm.shopName.trim()) return alert('กรุณากรอกชื่อร้านค้า');
    setEditLoading(true);

    const formData = new FormData();
    formData.append('shopName', editForm.shopName.trim());
    formData.append('shopDescription', editForm.shopDescription.trim());
    if (editLogoFile) {
      formData.append('shopLogo', editLogoFile);
    }

    try {
      // 🔗 ไปที่ Backend: PUT /api/shops/:id (Router: shop.route.js)
      // 🛠️ Controller: updateShop ใน shop.controller.js
      // 📤 ส่งอะไรไป: formData ที่มี shopName, shopDescription, และ shopLogo (ถ้ามีอัปโหลดใหม่) พร้อม cookies 
      // 📥 ได้อะไรกลับมา: ข้อมูลร้านค้าเวอร์ชันใหม่ที่ถูกอัปเดตแล้ว (res.data.data)
      const res = await axiosInstance.put(`/shops/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setShop(res.data.data);
        setShowEditModal(false);
        setEditLogoFile(null);
        alert('✅ อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว!');
      }
    } catch (error) {
      console.error("Update shop error:", error.response?.data || error);
      alert(`Error: ${error.response?.data?.message || 'อัปเดตไม่ได้ เช็ค Backend'}`);
    } finally {
      setEditLoading(false);
    }
  };

  // 🗑️ ลบร้านค้า
  const handleDeleteShop = async () => {
    setDeleteLoading(true);
    try {
      // 🔗 ไปที่ Backend: DELETE /api/shops/:id (Router: shop.route.js)
      // 🛠️ Controller: deleteShop ใน shop.controller.js
      // 📤 ส่งอะไรไป: ส่ง shopId ผ่าน URL Params พร้อม cookies ยืนยันสิทธิ์ความเป็นเจ้าของหรือ admin
      // 📥 ได้อะไรกลับมา: Message ยืนยันลบสำเร็จ (res.data.message) และ backend จะลบ products ที่เกี่ยวข้องไปด้วย
      const res = await axiosInstance.delete(`/shops/${id}`);

      if (res.data.success) {
        alert('🗑️ ลบร้านค้าเรียบร้อยแล้ว');
        navigate('/shops');
      }
    } catch (error) {
      console.error("Delete shop error:", error.response?.data || error);
      alert(`Error: ${error.response?.data?.message || 'ลบร้านไม่ได้ เช็ค Backend'}`);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#05050f]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#8b2cf5]"></div></div>;
  if (!shop) return <div className="min-h-screen flex justify-center items-center bg-[#05050f] text-white">ไม่พบข้อมูลร้านค้านี้</div>;

  // 👤 เช็คสิทธิ์ : ผู้ใช้คือเจ้าของร้านนี้ไหม?
  const isOwner = shop && currentUser && (String(shop.ownerId?._id || shop.ownerId) === String(currentUser._id || currentUser.id));
  // 🛡️ เช็คว่าเป็น Admin ไหม (Admin ลบร้านคนอื่นได้)
  const isAdmin = currentUser?.role === 'admin';
  const canManage = isOwner || isAdmin;




  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10 relative">
      <div className="bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6">
          <button onClick={() => navigate('/shops')} className="p-2 bg-[#151522] rounded-full hover:bg-[#2a2a3e] hover:text-[#8b2cf5] transition">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-5 flex-1">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] p-0.5 shadow-[0_0_20px_rgba(139,44,245,0.3)]">
              <div className="w-full h-full bg-[#12121e] rounded-2xl overflow-hidden flex items-center justify-center">
                {shop.shopLogo ? <img src={shop.shopLogo} className="w-full h-full object-cover" /> : <Store className="w-10 h-10 text-gray-500" />}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{shop.shopName}</h1>
                {shop.isOfficial && <span className="bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-[0_0_10px_rgba(139,44,245,0.4)]">✓ Mall</span>}
              </div>
              <p className="text-sm text-gray-400 mt-1 max-w-2xl">{shop.shopDescription || 'ไม่มีคำอธิบายร้านค้า'}</p>
            </div>
          </div>

          {/* ปุ่มเจ้าของร้านเท่านั้น */}
          {isOwner && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition transform hover:-translate-y-1"
              >
                <Plus className="w-4 h-4" /> เพิ่มสินค้า
              </button>
              <button
                onClick={() => {
                  setEditForm({ shopName: shop.shopName, shopDescription: shop.shopDescription || '' });
                  setEditLogoPreview(shop.shopLogo || null);
                  setEditLogoFile(null);
                  setShowEditModal(true);
                }}
                className="flex items-center gap-2 bg-[#1a1a2e] border border-[#2a2a3e] hover:border-[#8b2cf5] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition transform hover:-translate-y-1"
              >
                <Pencil className="w-4 h-4 text-[#8b2cf5]" /> แก้ไขร้านค้า
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 bg-[#1a0a0a] border border-[#3e2a2a] hover:border-red-500 text-red-400 hover:text-red-300 px-5 py-2.5 rounded-xl font-bold text-sm transition transform hover:-translate-y-1"
              >
                <Trash2 className="w-4 h-4" /> ลบร้านค้า
              </button>
            </div>
          )}
          {isAdmin && (
            <button
              onClick={handleDeleteShop}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 border border-red-500/40 hover:border-red-500 text-red-400 hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition"
            >
              <AlertTriangle className="w-4 h-4" /> ลบร้านค้านี้ (Admin)
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-6 items-start">

        {/* ======= ส่วน รายละเอียดร้านค้า (แถบซ้าย) ======= */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-4">

          {/* Card: ข้อมูลทั่วไป */}
          <div className="bg-[#0d0d1a] border border-[#2a2a3e] rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#8b2cf5]/20 to-[#4361ee]/10 border-b border-[#2a2a3e] px-5 py-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8b2cf5]" />
              <h3 className="font-bold text-sm text-white">รายละเอียดร้านค้า</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 text-[#8b2cf5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">รหัสร้านค้า</p>
                  <p className="text-white font-bold tracking-widest mt-0.5">{shop.shopCode || '------'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Store className="w-4 h-4 text-[#8b2cf5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">ชื่อร้านค้า</p>
                  <p className="text-white font-semibold mt-0.5">{shop.shopName}</p>
                </div>
              </div>
              {shop.shopDescription && (
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-[#8b2cf5] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">คำอธิบาย</p>
                    <p className="text-gray-300 text-sm mt-0.5 leading-relaxed">{shop.shopDescription}</p>
                  </div>
                </div>
              )}
              {shop.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#8b2cf5] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">ที่ตั้งร้าน</p>
                    <p className="text-gray-300 text-sm mt-0.5">{shop.location}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#8b2cf5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">วันที่เปิดร้าน</p>
                  <p className="text-gray-300 text-sm mt-0.5">
                    {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ไม่ระบุ'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: shop.status === 'active' ? '#4ade80' : shop.status === 'on_vacation' ? '#facc15' : '#f87171' }} />
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">สถานะร้านค้า</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: shop.status === 'active' ? '#4ade80' : shop.status === 'on_vacation' ? '#facc15' : '#f87171' }}></span>
                    <p className="text-sm font-medium" style={{ color: shop.status === 'active' ? '#4ade80' : shop.status === 'on_vacation' ? '#facc15' : '#f87171' }}>
                      {shop.status === 'active' ? 'เปิดร้านอยู่' : shop.status === 'on_vacation' ? 'พักร้านชั่วคราว' : shop.status === 'suspended' ? 'ถูกระงับ' : 'ถูกแบน'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: สถิติร้านค้า */}
          <div className="bg-[#0d0d1a] border border-[#2a2a3e] rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#8b2cf5]/20 to-[#4361ee]/10 border-b border-[#2a2a3e] px-5 py-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-[#8b2cf5]" />
              <h3 className="font-bold text-sm text-white">สถิติร้านค้า</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="bg-[#12121e] rounded-xl p-3 text-center border border-[#2a2a3e]">
                <p className="text-2xl font-black text-[#8b2cf5]">{products.length}</p>
                <p className="text-[11px] text-gray-400 mt-1">สินค้า</p>
              </div>
              <div className="bg-[#12121e] rounded-xl p-3 text-center border border-[#2a2a3e]">
                <p className="text-2xl font-black text-[#8b2cf5]">{shop.rating || '5.0'}</p>
                <p className="text-[11px] text-gray-400 mt-1">⭐ คะแนน</p>
              </div>
              <div className="bg-[#12121e] rounded-xl p-3 text-center border border-[#2a2a3e]">
                <p className="text-2xl font-black text-[#8b2cf5]">{shop.followerCount?.toLocaleString() || '0'}</p>
                <p className="text-[11px] text-gray-400 mt-1">ผู้ติดตาม</p>
              </div>
              <div className="bg-[#12121e] rounded-xl p-3 text-center border border-[#2a2a3e]">
                <p className="text-2xl font-black text-[#8b2cf5]">{shop.reviewCount || '0'}</p>
                <p className="text-[11px] text-gray-400 mt-1">รีวิว</p>
              </div>
            </div>
          </div>

          {/* Card: เจ้าของร้าน */}
          {shop.ownerId && typeof shop.ownerId === 'object' && (
            <div className="bg-[#0d0d1a] border border-[#2a2a3e] rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#8b2cf5]/20 to-[#4361ee]/10 border-b border-[#2a2a3e] px-5 py-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#8b2cf5]" />
                <h3 className="font-bold text-sm text-white">เจ้าของร้าน</h3>
              </div>
              <div className="p-5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2a2a3e] flex-shrink-0">
                  {shop.ownerId?.imageProfile
                    ? <img src={shop.ownerId.imageProfile} alt="owner" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] flex items-center justify-center text-white font-bold text-sm">
                      {(shop.ownerId?.username || 'U')[0].toUpperCase()}
                    </div>
                  }
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{shop.ownerId?.username || 'เจ้าของร้าน'}</p>
                  {shop.ownerId?.trustScore !== undefined && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <p className="text-yellow-400 text-xs font-medium">Trust Score: {shop.ownerId.trustScore}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======= ส่วน สินค้า (แถบขวา) ======= */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-[#2a2a3e] pb-4">
            <Package className="w-6 h-6 text-[#8b2cf5]" /> สินค้าทั้งหมด ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#12121e] border border-[#2a2a3e] rounded-2xl border-dashed">
              <Package className="w-16 h-16 text-[#2a2a3e] mb-4" />
              <p className="text-gray-400 font-medium text-lg">ยังไม่มีสินค้าในร้านนี้</p>
              {isOwner && (
                <p onClick={() => setShowAddModal(true)} className="text-sm text-[#8b2cf5] mt-2 cursor-pointer hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> คลิกเพื่อเพิ่มสินค้าชิ้นแรก!
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-[#12121e] border border-[#2a2a3e] rounded-xl overflow-hidden hover:border-[#8b2cf5] transition group cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(139,44,245,0.2)] relative"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {canManage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product._id);
                      }}
                      className="absolute top-2 left-2 z-10 p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="aspect-square bg-[#1c1c2b] relative overflow-hidden">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={product.productName}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-[#2a2a3e]">
                      {product.condition === 'NEW' ? '✨ มือหนึ่ง' : '📦 มือสอง'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-white truncate group-hover:text-[#8b2cf5] transition">{product.productName}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-[#8b2cf5] font-bold text-sm">฿{product.price.toLocaleString()}</p>
                      <span className="text-[10px] text-gray-500 bg-[#2a2a3e] px-2 py-0.5 rounded-md">
                        {product.tradeType === 'BOTH' ? 'ขาย/เทรด' : product.tradeType === 'SELL_ONLY' ? 'ขายเท่านั้น' : 'เทรดเท่านั้น'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* 🌟 MODAL เพิ่มสินค้า 🌟 */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12121e] border border-[#2a2a3e] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200 my-8">
            <div className="p-4 border-b border-[#2a2a3e] flex justify-between items-center bg-[#0a0a16] sticky top-0 z-10">
              <h3 className="font-bold flex items-center gap-2 text-white"><Package className="w-5 h-5 text-[#8b2cf5]" /> เพิ่มสินค้าลงร้าน</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-[#2a2a3e] p-1.5 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">

              <div className="flex flex-col items-center justify-center gap-3 mb-2">
                <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-[#2a2a3e] hover:border-[#8b2cf5] flex flex-col items-center justify-center cursor-pointer bg-[#0a0a16] transition overflow-hidden relative group">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-xs text-gray-400 font-medium">อัปโหลดรูป</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 ml-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
                <input type="text" value={productForm.productName} onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })} placeholder="ชื่อสินค้า..." className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition" required />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 ml-1">รายละเอียดสินค้า <span className="text-red-500">*</span></label>
                <textarea rows="2" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="อธิบายสภาพสินค้า..." className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition resize-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 ml-1">หมวดหมู่</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] text-white">
                    <option value="electronics">💻 อิเล็กทรอนิกส์</option>
                    <option value="clothing">👕 เสื้อผ้า</option>
                    <option value="weapon">⚔️ อาวุธ</option>
                    <option value="armor">🛡️ ชุดเกราะ</option>
                    <option value="potion">🧪 โพชั่น</option>
                    <option value="other">📦 อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 ml-1">ประเภทการขาย</label>
                  <select value={productForm.tradeType} onChange={(e) => setProductForm({ ...productForm, tradeType: e.target.value })} className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] text-white">
                    <option value="BOTH">🤝 ขายและเทรด</option>
                    <option value="SELL_ONLY">💰 ขายอย่างเดียว</option>
                    <option value="TRADE_ONLY">🔄 เทรดอย่างเดียว</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 ml-1">ราคา (บาท)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500 text-sm">฿</span>
                    <input type="number" min="0" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="0" className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 ml-1">สภาพสินค้า</label>
                  <select value={productForm.condition} onChange={(e) => setProductForm({ ...productForm, condition: e.target.value })} className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] text-white">
                    <option value="NEW">✨ มือหนึ่ง (New)</option>
                    <option value="USED_LIKE_NEW">💎 มือสอง เหมือนใหม่</option>
                    <option value="USED_GOOD">👍 มือสอง สภาพดี</option>
                    <option value="USED_FAIR">📦 มือสอง สภาพพอใช้</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(139,44,245,0.3)] hover:scale-[1.02] transition">
                  บันทึกสินค้าลงร้าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ MODAL แก้ไขร้านค้า */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12121e] border border-[#2a2a3e] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#2a2a3e] flex justify-between items-center bg-[#0a0a16]">
              <h3 className="font-bold flex items-center gap-2 text-white"><Pencil className="w-5 h-5 text-[#8b2cf5]" /> แก้ไขข้อมูลร้านค้า</h3>
              <button onClick={() => setShowEditModal(false)} className="hover:bg-[#2a2a3e] p-1.5 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleUpdateShop} className="p-6 space-y-5">
              {/* โลโก้ร้าน */}
              <div className="flex flex-col items-center gap-3">
                <label className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-[#2a2a3e] hover:border-[#8b2cf5] flex flex-col items-center justify-center cursor-pointer bg-[#0a0a16] transition overflow-hidden group">
                  {editLogoPreview ? (
                    <>
                      <img src={editLogoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Store className="w-8 h-8 text-gray-500 mb-1" />
                      <span className="text-[10px] text-gray-400">เปลี่ยนโลโก้</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleEditLogoChange} className="hidden" />
                </label>
                <p className="text-xs text-gray-500">คลิกที่รูปเพื่อเปลี่ยนโลโก้ร้าน</p>
              </div>

              {/* ชื่อร้าน */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 ml-1">ชื่อร้านค้า <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editForm.shopName}
                  onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                  placeholder="ชื่อร้านค้า..."
                  maxLength={50}
                  className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition text-white"
                  required
                />
              </div>

              {/* คำอธิบาย */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 ml-1">คำอธิบายร้านค้า</label>
                <textarea
                  rows="3"
                  value={editForm.shopDescription}
                  onChange={(e) => setEditForm({ ...editForm, shopDescription: e.target.value })}
                  placeholder="แนะนำร้านของคุณ..."
                  className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b2cf5] transition resize-none text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl font-bold text-sm text-gray-300 hover:border-[#8b2cf5] transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(139,44,245,0.3)] hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {editLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🗑️ MODAL ยืนยันลบร้านค้า */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12121e] border border-red-900/50 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-red-900/30 flex justify-between items-center bg-[#1a0a0a]">
              <h3 className="font-bold flex items-center gap-2 text-red-400"><AlertTriangle className="w-5 h-5" /> ยืนยันการลบร้านค้า</h3>
              <button onClick={() => setShowDeleteModal(false)} className="hover:bg-[#2a1a1a] p-1.5 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-300 text-sm font-medium mb-1">⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้!</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  เมื่อลบร้านค้า <span className="text-white font-bold">"{shop.shopName}"</span> แล้ว ข้อมูลร้านค้าจะถูกลบออกจากระบบถาวร
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="flex-1 py-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl font-bold text-sm text-gray-300 hover:border-[#8b2cf5] transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteShop}
                  disabled={deleteLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-xl font-bold text-sm hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteLoading ? 'กำลังลบ...' : 'ลบร้านค้า'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetail;