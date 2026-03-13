import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Star, MapPin, Plus, Package, X, Upload, Image as ImageIcon, Trash2, ShieldCheck, Calendar, Hash, MessageCircle, UserCheck, Clock } from 'lucide-react';
import axios from 'axios';

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
        const shopRes = await axios.get(`http://localhost:5000/api/shops/${id}`);
        if (shopRes.data.success || shopRes.data) {
          setShop(shopRes.data.data || shopRes.data);
        }

        // 2. ดึงข้อมูลสินค้าของร้านนี้ (เรียก API ของเพื่อนเลย!)
        const productRes = await axios.get(`http://localhost:5000/api/products/shop/${id}`);
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.productName) return alert('กรุณากรอกชื่อสินค้า');

    // 🟢 ห่อของใส่กล่อง FormData เพื่อส่งรูปภาพไปหลังบ้าน
    const formData = new FormData();
    formData.append('productName', productForm.productName);
    formData.append('productDescription', productForm.description);
    formData.append('price', Number(productForm.price) || 0);
    formData.append('condition', productForm.condition);
    formData.append('category', productForm.category);
    formData.append('tradeType', productForm.tradeType);
    formData.append('shopId', id);

    // 🟢 ถ้ายูสเซอร์เลือกรูปภาพมา ให้ยัดใส่กล่องชื่อ 'image' ไปด้วย
    if (productFile) {
      formData.append('image', productFile);
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // 🟢 สำคัญมาก! บอกหลังบ้านว่านี่คือไฟล์
        withCredentials: true
      });

      if (res.data.success) {
        setShowAddModal(false);
        alert('🎉 ลงสินค้าเข้าคลังเรียบร้อยแล้วเพื่อน!');
        window.location.reload();
      }
    } catch (error) {
      console.error("Add product error:", error.response?.data || error);
      alert(`Error: ${error.response?.data?.message || 'เช็ค Backend ด่วน'}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/products/${productId}`, {
        withCredentials: true
      });

      if (res.data.success) {
        setProducts(products.filter(p => p._id !== productId));
        alert('ลบสินค้าเรียบร้อยแล้ว');
      }
    } catch (error) {
      console.error("Delete product error:", error.response?.data || error);
      alert(`Error: ${error.response?.data?.message || 'ลบไม่ได้ เช็ค Backend'}`);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#05050f]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#8b2cf5]"></div></div>;
  if (!shop) return <div className="min-h-screen flex justify-center items-center bg-[#05050f] text-white">ไม่พบข้อมูลร้านค้านี้</div>;

  const isOwner = shop && currentUser && (String(shop.ownerId?._id || shop.ownerId) === String(currentUser._id || currentUser.id));

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

          {isOwner && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] text-white px-6 py-3 rounded-xl font-bold text-sm transition transform hover:-translate-y-1">
              <Plus className="w-5 h-5" /> เพิ่มสินค้าใหม่
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

          {/* 🟢 ส่วนแสดงสินค้า ถ้ายาวมากกว่า 0 ให้โชว์การ์ด ถ้าไม่มีให้โชว์ว่าว่างเปล่า */}
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
                  {isOwner && (
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


      {/* 🌟 MODAL เพิ่มสินค้า 🌟 (ส่วนนี้เหมือนเดิมเลย) */}
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
    </div>
  );
};

export default ShopDetail;