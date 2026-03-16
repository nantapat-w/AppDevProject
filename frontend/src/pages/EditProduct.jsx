import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, X, Upload, Image as ImageIcon, Save } from 'lucide-react';
import { axiosInstance } from '../utils/axios';


const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [productForm, setProductForm] = useState({
    productName: '',
    productDescription: '',
    price: '',
    category: 'electronics',
    condition: 'USED_GOOD',
    tradeType: 'BOTH',
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/${id}`);

        if (res.data.success) {
          const product = res.data.data;
          setProductForm({
            productName: product.productName,
            productDescription: product.productDescription,
            price: product.price,
            category: product.category,
            condition: product.condition,
            tradeType: product.tradeType,
          });
          if (product.images?.[0]) {
            setImagePreview(product.images[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("ไม่สามารถดึงข้อมูลสินค้าได้");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!productForm.productName) return alert('กรุณากรอกชื่อสินค้า');

    const formData = new FormData();
    formData.append('productName', productForm.productName);
    formData.append('productDescription', productForm.productDescription);
    formData.append('price', Number(productForm.price) || 0);
    formData.append('condition', productForm.condition);
    formData.append('category', productForm.category);
    formData.append('tradeType', productForm.tradeType);
    
    if (productFile) {
      formData.append('image', productFile);
    }

    try {
      const res = await axiosInstance.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });


      if (res.data.success) {
        alert('🎉 แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว!');
        navigate(`/product/${id}`);
      }
    } catch (error) {
      console.error("Update product error:", error.response?.data || error);
      alert(`Error: ${error.response?.data?.message || 'แก้ไขไม่ได้ เช็ค Backend'}`);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#05050f]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#8b2cf5]"></div></div>;

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-10">
      <div className="bg-[#0a0a16] border-b border-[#2a2a3e] px-4 py-6 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-[#151522] rounded-full hover:bg-[#2a2a3e] transition text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-[#8b2cf5]" /> แก้ไขข้อมูลสินค้า
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl overflow-hidden shadow-2xl">
          <form onSubmit={handleUpdateProduct} className="p-8 space-y-6">
            
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
              <label className="w-48 h-48 rounded-3xl border-2 border-dashed border-[#2a2a3e] hover:border-[#8b2cf5] flex flex-col items-center justify-center cursor-pointer bg-[#0a0a16] transition overflow-hidden relative group shadow-inner">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-gray-500 mb-2" />
                    <span className="text-sm text-gray-400 font-medium">เปลี่ยนรูปสินค้า</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <p className="text-xs text-gray-500">คลิกที่รูปเพื่ออัปโหลดภาพใหม่</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-2 ml-1 uppercase tracking-widest font-bold">ชื่อสินค้า <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={productForm.productName} 
                  onChange={(e) => setProductForm({...productForm, productName: e.target.value})} 
                  placeholder="ชื่อสินค้าของคุณ..." 
                  className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] focus:ring-1 focus:ring-[#8b2cf5]/50 transition shadow-inner" 
                  required 
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-2 ml-1 uppercase tracking-widest font-bold">รายละเอียดสินค้า <span className="text-red-500">*</span></label>
                <textarea 
                  rows="4" 
                  value={productForm.productDescription} 
                  onChange={(e) => setProductForm({...productForm, productDescription: e.target.value})} 
                  placeholder="อธิบายรายละเอียด สภาพสินค้า ประวัติการใช้งาน..." 
                  className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] focus:ring-1 focus:ring-[#8b2cf5]/50 transition resize-none shadow-inner" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-400 block mb-2 ml-1 uppercase tracking-widest font-bold">หมวดหมู่</label>
                  <select 
                    value={productForm.category} 
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})} 
                    className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] text-white transition shadow-inner"
                  >
                    <option value="electronics">💻 อิเล็กทรอนิกส์</option>
                    <option value="clothing">👕 เสื้อผ้า</option>
                    <option value="weapon">⚔️ อาวุธ</option>
                    <option value="armor">🛡️ ชุดเกราะ</option>
                    <option value="potion">🧪 โพชั่น</option>
                    <option value="other">📦 อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2 ml-1 uppercase tracking-widest font-bold">ประเภทการลงประกาศ</label>
                  <select 
                    value={productForm.tradeType} 
                    onChange={(e) => setProductForm({...productForm, tradeType: e.target.value})} 
                    className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] text-white transition shadow-inner"
                  >
                    <option value="BOTH">🤝 ขายและเทรด</option>
                    <option value="SELL_ONLY">💰 ขายอย่างเดียว</option>
                    <option value="TRADE_ONLY">🔄 เทรดอย่างเดียว</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-400 block mb-2 ml-1 uppercase tracking-widest font-bold">ราคาตั้งขาย (บาท)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-500 text-sm">฿</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={productForm.price} 
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
                      placeholder="0" 
                      className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] transition shadow-inner" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2 ml-1 uppercase tracking-widest font-bold">สภาพสินค้า</label>
                  <select 
                    value={productForm.condition} 
                    onChange={(e) => setProductForm({...productForm, condition: e.target.value})} 
                    className="w-full bg-[#0a0a16] border border-[#2a2a3e] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b2cf5] text-white transition shadow-inner"
                  >
                    <option value="NEW">✨ มือหนึ่ง (New)</option>
                    <option value="USED_LIKE_NEW">💎 มือสอง เหมือนใหม่</option>
                    <option value="USED_GOOD">👍 มือสอง สภาพดี</option>
                    <option value="USED_FAIR">📦 มือสอง สภาพพอใช้</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                className="w-full py-4 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-xl font-bold text-base shadow-[0_8px_25px_rgba(139,44,245,0.4)] hover:shadow-[0_12px_30px_rgba(139,44,245,0.5)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Save className="w-5 h-5" /> บันทึกการแก้ไข
              </button>
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="w-full mt-4 py-4 bg-transparent border border-[#2a2a3e] hover:bg-[#2a2a3e]/30 rounded-xl font-bold text-sm text-gray-400 hover:text-white transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
