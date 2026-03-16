import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Store, Star, MapPin, Package, ShoppingBag, MessageSquare, Repeat, Clock, ChevronRight } from 'lucide-react';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#05050f]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#8b2cf5]"></div></div>;
  if (!product) return <div className="min-h-screen flex justify-center items-center bg-[#05050f] text-white">ไม่พบข้อมูลสินค้านี้</div>;

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const myId = String(currentUser?.id || currentUser?._id || "");
  const ownerId = String(product.ownerId?._id || product.ownerId || "");
  const isOwner = myId && ownerId && myId === ownerId;

  const handleAddToCart = () => {
    if (isOwner) return;
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemInCart = existingCart.find(item => item._id === product._id);
    
    if (itemInCart) {
      itemInCart.quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    navigate('/cart');
  };

  const handleChatWithShop = () => {
    if (isOwner) return;
    navigate('/chat', {
      state: {
        receiverId: product.ownerId?._id || product.ownerId,
        receiverName: product.ownerId?.username || 'ร้านค้า',
        shopName: product.ownerId?.username, 
        chatType: 'TRADE',
        productId: product._id
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans pb-20">
      {/* Navbar / Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a16]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-[#151522] rounded-full hover:bg-[#2a2a3e] transition text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold truncate">รายละเอียดสินค้า</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-[#12121e] rounded-3xl border border-[#2a2a3e] overflow-hidden shadow-2xl">
            <img 
              src={product.images?.[0] || 'https://via.placeholder.com/600'} 
              className="w-full h-full object-cover" 
              alt={product.productName} 
            />
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <div key={idx} className="aspect-square bg-[#12121e] rounded-xl border border-[#2a2a3e] overflow-hidden cursor-pointer hover:border-[#8b2cf5] transition">
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#8b2cf5]/10 text-[#8b2cf5] border border-[#8b2cf5]/30 rounded-full text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="px-3 py-1 bg-white/5 text-gray-400 border border-white/10 rounded-full text-xs">
                {product.condition === 'NEW' ? '✨ มือหนึ่ง' : '📦 มือสอง'}
              </span>
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {product.productName}
            </h2>
            <div className="mt-4 flex items-baseline gap-3">
               <span className="text-4xl font-black text-[#8b2cf5]">฿{product.price.toLocaleString()}</span>
               {product.tradeType === 'BOTH' && <span className="text-sm text-gray-500 italic">หรือ เสนอถอน/แลก</span>}
            </div>
          </div>

          <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-6 space-y-4 shadow-xl">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-[#8b2cf5]" /> รายละเอียด
             </h3>
             <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {product.productDescription}
             </p>
          </div>

          {/* Shop Card */}
          <div className="bg-[#0a0a16] border border-[#2a2a3e] rounded-2xl overflow-hidden hover:border-[#4361ee] transition group shadow-xl">
             <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#8b2cf5] to-[#4361ee] p-0.5">
                      <div className="w-full h-full bg-[#12121e] rounded-xl overflow-hidden flex items-center justify-center">
                         {product.ownerId?.imageProfile ? (
                           <img src={product.ownerId.imageProfile} className="w-full h-full object-cover" />
                         ) : (
                           <Store className="w-7 h-7 text-gray-500" />
                         )}
                      </div>
                   </div>
                   <div>
                      <h4 className="font-bold text-white group-hover:text-[#4361ee] transition">{product.ownerId?.username || 'Unknown Shop'}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 
                        {product.ownerId?.trustScore || '5.0'} • สินค้าทั้งหมด {product.ownerId?.productCount || '10'}
                      </p>
                   </div>
                </div>
                {product.shopId && (
                  <Link to={`/shops/${product.shopId._id || product.shopId}`} className="text-gray-400 hover:text-white transition">
                    <ChevronRight className="w-6 h-6" />
                  </Link>
                )}
             </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-4">
             {isOwner ? (
                <button 
                  onClick={() => navigate(`/product/edit/${product._id}`)}
                  className="py-4 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(139,44,245,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  แก้ไขข้อมูลสินค้าของคุณ
                </button>
             ) : (
               <div className="grid grid-cols-2 gap-4">
                 <button 
                    onClick={handleAddToCart}
                    className="py-4 bg-gradient-to-r from-[#8b2cf5] to-[#4361ee] rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(139,44,245,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    <ShoppingBag className="w-5 h-5" /> ซื้อทันที
                 </button>
                 <button 
                    onClick={handleChatWithShop}
                    className="py-4 bg-[#151522] border border-[#2a2a3e] hover:border-[#8b2cf5] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                 >
                    <MessageSquare className="w-5 h-5" /> แชทคุย
                 </button>
               </div>
             )}
          </div>
          
          {!isOwner && product.tradeType !== 'SELL_ONLY' && (
            <button 
               onClick={handleChatWithShop}
               className="w-full py-4 bg-[#0a0a16] border-2 border-dashed border-[#8b2cf5]/50 hover:border-[#8b2cf5] hover:bg-[#8b2cf5]/5 text-[#8b2cf5] rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3">
               <Repeat className="w-6 h-6" /> ยื่นข้อเสนอแลกเปลี่ยน (TRADE)
            </button>
          )}

          <div className="flex items-center gap-6 text-[10px] text-gray-500 px-2 justify-center">
             <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> โพสต์เมื่อ 2 ชม. ที่แล้ว</div>
             <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> กรุงเทพมหานคร</div>
             <div className="flex items-center gap-1.5 uppercase font-bold text-[#8b2cf5]">{product.status}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
