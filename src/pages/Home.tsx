import { useState } from 'react';
import { MENU_DATA, TOPPINGS, SUGAR_LEVELS, ICE_LEVELS } from '../constants';
import { useCart, CartItem } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, ShoppingCart, X, Check, Coffee, Leaf, Droplets, Sparkles, Star } from 'lucide-react';
import { toast } from '../components/ui/Toaster';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CATEGORY_ICONS: Record<string, any> = {
  "Original TEA": Coffee,
  "Classic MILK TEA": Droplets,
  "Double FRUIT": Leaf,
  "Fresh MILK": Sparkles,
  "Cheese MILK FOAM": Star,
};

export function Home() {
  const [selectedCategory, setSelectedCategory] = useState(MENU_DATA[0].category);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showCart, setShowCart] = useState(false);
  const { items, addToCart, removeFromCart, clearCart, total } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [size, setSize] = useState<'M' | 'L'>('M');
  const [sugar, setSugar] = useState(SUGAR_LEVELS[0]);
  const [ice, setIce] = useState(ICE_LEVELS[2]); // 微冰 default
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const toppingPrice = selectedToppings.length * 10;
    const unitPrice = (size === 'M' ? selectedProduct.priceM : selectedProduct.priceL) + toppingPrice;
    
    const newItem: CartItem = {
      id: `${selectedProduct.id}-${Date.now()}`,
      name: selectedProduct.name,
      size,
      sugar,
      ice,
      toppings: selectedToppings,
      unitPrice,
      quantity,
      totalPrice: unitPrice * quantity
    };

    addToCart(newItem);
    toast(`已加入購物車: ${selectedProduct.name}`);
    setSelectedProduct(null);
    resetOptions();
  };

  const resetOptions = () => {
    setSize('M');
    setSugar(SUGAR_LEVELS[0]);
    setIce(ICE_LEVELS[2]);
    setSelectedToppings([]);
    setQuantity(1);
  };

  const handleToggleTopping = (topping: string) => {
    setSelectedToppings(prev => 
      prev.includes(topping) ? prev.filter(t => t !== topping) : [...prev, topping]
    );
  };

  const submitOrder = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        items: items.map(item => ({
          name: item.name,
          size: item.size,
          sugar: item.sugar,
          ice: item.ice,
          toppings: item.toppings,
          price: item.unitPrice,
          quantity: item.quantity
        })),
        total,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      clearCart();
      setShowCart(false);
      toast("訂單已送出，請耐心等候");
    } catch (error) {
      console.error(error);
      toast("訂單送出失敗，請檢查網路連線", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CatIcon = CATEGORY_ICONS[selectedCategory] || Coffee;

  return (
    <div className="flex flex-col container mx-auto px-6 py-10 gap-10">
      {/* Header Section */}
      <header className="mb-4">
        <h2 className="text-4xl font-bold text-natural-600 mb-3 flex items-center gap-3">
          精選茶飲
          <CatIcon className="w-8 h-8 text-tea-green" />
        </h2>
        <p className="text-natural-500 font-sans italic text-lg">選用在地小農茶葉，每日現泡，萃取第一道茶韻。</p>
      </header>

      {/* Category Nav - Sidebar style for desktop, horizontal for mobile */}
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 flex-shrink-0">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-natural-400 mb-6 block ml-1">飲品分類</label>
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-2 no-scrollbar">
            {MENU_DATA.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`group flex items-center justify-between px-6 py-4 rounded-2xl whitespace-nowrap text-sm font-bold font-sans transition-all w-full text-left border ${
                  selectedCategory === cat.category
                    ? 'bg-tea-green text-white border-transparent shadow-lg shadow-tea-green/20'
                    : 'bg-white text-natural-500 border-natural-200 hover:bg-tea-hover hover:text-tea-green hover:border-tea-green/30'
                }`}
              >
                {cat.category}
                <div className={`w-1.5 h-4 rounded-full transition-all ${
                  selectedCategory === cat.category ? 'bg-white' : 'bg-natural-200 group-hover:bg-tea-green'
                }`} />
              </button>
            ))}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {MENU_DATA.find(c => c.category === selectedCategory)?.items.map((item) => (
            <motion.div
              layout
              key={item.id}
              onClick={() => setSelectedProduct(item)}
              className="group bg-white p-6 rounded-[32px] border border-natural-200 flex gap-6 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-natural-50 rounded-[28px] flex-shrink-0 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                {selectedCategory.includes('FRUIT') ? '🌿' : 
                 selectedCategory.includes('MILK') ? '🥛' : 
                 selectedCategory.includes('FOAM') ? '✨' : '🍵'}
              </div>
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <h3 className="text-2xl font-bold mb-1 truncate text-natural-700">{item.name}</h3>
                  <p className="text-[11px] text-natural-400 font-sans font-semibold uppercase tracking-wider mb-2">{item.nameEn}</p>
                  <p className="text-xs text-natural-500 font-sans leading-relaxed line-clamp-2 opacity-60 italic">
                    探索純淨茶香，品味每一口自然的回甘韻味。
                  </p>
                </div>
                <div className="flex items-baseline justify-between mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-sans text-tea-green">${item.priceM}</span>
                    <span className="text-[10px] font-sans font-black text-natural-300 uppercase tracking-tighter">M SIZE</span>
                  </div>
                  {item.hasHot && (
                    <div className="w-2 h-2 bg-orange-200 rounded-full" title="可做熱飲" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Footer for mobile cart / stats */}
      <AnimatePresence>
        {items.length > 0 && !showCart && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-30 p-6 flex justify-center pointer-events-none"
          >
            <button
              onClick={() => setShowCart(true)}
              className="pointer-events-auto bg-natural-700 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-6 hover:scale-105 active:scale-95 transition-all group border border-white/10"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-accent-gold" />
                <span className="font-sans font-bold text-lg">購物籃 ({items.length})</span>
              </div>
              <div className="h-6 w-[1px] bg-white/20"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-sans font-bold text-white/50 uppercase">總計</span>
                <span className="font-sans font-bold text-2xl text-accent-gold">${total}</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-natural-700/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg bg-natural-50 rounded-[3rem] shadow-2xl overflow-hidden border border-white/50"
            >
              <div className="p-10 pb-0">
                <div className="flex justify-between items-start mb-8 text-natural-700">
                  <div>
                    <h2 className="text-4xl font-bold tracking-tight">{selectedProduct.name}</h2>
                    <p className="text-natural-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                      {selectedProduct.nameEn}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="p-3 hover:bg-natural-100 rounded-full transition-colors text-natural-300"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="space-y-10 overflow-y-auto max-h-[55vh] pr-4 custom-scrollbar font-sans px-1">
                  {/* Size Select */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-natural-400 tracking-[0.2em] mb-4 block ml-1">容量大小 SIZE</label>
                    <div className="flex gap-4">
                      {['M', 'L'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s as 'M' | 'L')}
                          className={`flex-1 py-5 rounded-[24px] border-2 transition-all flex flex-col items-center gap-1 ${
                            size === s 
                              ? 'border-tea-green bg-white text-tea-green shadow-xl shadow-tea-green/10' 
                              : 'border-natural-200 bg-transparent text-natural-400 hover:border-natural-300'
                          }`}
                        >
                          <span className="font-bold text-2xl">{s}</span>
                          <span className="text-xs font-bold opacity-60">
                            ${s === 'M' ? selectedProduct.priceM : selectedProduct.priceL}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sugar Levels */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-natural-400 tracking-[0.2em] mb-4 block ml-1">甜度調整 SUGAR</label>
                    <div className="grid grid-cols-3 gap-3">
                      {SUGAR_LEVELS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSugar(s)}
                          className={`py-4 rounded-2xl text-[13px] font-bold border transition-all ${
                            sugar === s 
                              ? 'bg-natural-700 text-white border-transparent shadow-xl' 
                              : 'bg-white border-natural-200 text-natural-500 hover:bg-natural-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ice Levels */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-natural-400 tracking-[0.2em] mb-4 block ml-1">冰度調整 ICE</label>
                    <div className="grid grid-cols-4 gap-2">
                      {ICE_LEVELS.map((i) => (
                        <button
                          key={i}
                          onClick={() => setIce(i)}
                          className={`py-3 rounded-2xl text-[11px] font-bold border transition-all ${
                            ice === i 
                              ? 'bg-natural-700 text-white border-transparent shadow-xl' 
                              : 'bg-white border-natural-200 text-natural-500 hover:bg-natural-100'
                          }`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toppings */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-natural-400 tracking-[0.2em] mb-4 block ml-1">加購配料 PLUS (+10)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {TOPPINGS.map((t) => (
                        <button
                          key={t.name}
                          onClick={() => handleToggleTopping(t.name)}
                          className={`py-4 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between ${
                            selectedToppings.includes(t.name)
                              ? 'border-tea-green bg-white text-tea-green shadow-lg shadow-tea-green/5' 
                              : 'bg-white border-natural-200 text-natural-500 hover:bg-natural-100'
                          }`}
                        >
                          {t.name}
                          {selectedToppings.includes(t.name) ? <Check className="w-4 h-4 text-tea-green" /> : <div className="w-4 h-4 rounded-full border border-natural-200" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-10 pt-8 border-t border-natural-200 mt-10 bg-white">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center bg-natural-100 rounded-3xl p-1 shadow-inner">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-4 hover:bg-white rounded-2xl transition-all text-natural-500 shadow-sm disabled:opacity-30"
                      disabled={quantity === 1}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-16 text-center font-bold text-2xl font-sans text-natural-700">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-4 hover:bg-white rounded-2xl transition-all text-natural-500 shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-natural-400 uppercase tracking-widest mb-1">小計 SUB-TOTAL</p>
                    <p className="text-4xl font-bold text-tea-green font-sans tracking-tight">
                      ${((size === 'M' ? selectedProduct.priceM : selectedProduct.priceL) + selectedToppings.length * 10) * quantity}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-tea-green hover:bg-tea-green/90 text-white py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-tea-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 font-sans"
                >
                  <Check className="w-7 h-7" />
                  確認加入購物籃
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-natural-700/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col font-sans"
            >
              <div className="p-8 border-b border-natural-100 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-natural-700">本次點單</h2>
                  <p className="text-natural-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Order Summary ({items.length})</p>
                </div>
                <button onClick={() => setShowCart(false)} className="p-3 hover:bg-natural-50 rounded-full text-natural-300 transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-natural-200 gap-6 opacity-80">
                    <div className="w-24 h-24 bg-natural-50 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-12 h-12" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xl text-natural-400">目前尚無茶飲</p>
                      <p className="text-sm text-natural-300 mt-2 font-medium">快去挑選您心儀的茶飲吧！</p>
                    </div>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <motion.div 
                      layout
                      key={item.id}
                      className="group flex gap-5 p-6 rounded-[32px] bg-natural-50 border border-transparent hover:border-natural-100 hover:bg-white hover:shadow-xl transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-xl text-natural-700 truncate mr-2">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(index)}
                            className="p-2 text-natural-200 hover:text-red-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-[11px] font-bold text-natural-400 uppercase tracking-wide mb-3 flex flex-wrap gap-x-2 gap-y-1">
                          <span className="text-tea-green">{item.size}</span>
                          <span>{item.sugar}</span>
                          <span>{item.ice}</span>
                          {item.toppings.length > 0 && (
                            <span className="text-accent-gold underline decoration-dotted underline-offset-4">
                              + {item.toppings.join(', ')}
                            </span>
                          )}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-natural-100 shadow-sm">
                            <span className="text-xs font-bold text-natural-400 uppercase tracking-tighter">數量</span>
                            <span className="text-sm font-black text-natural-700">{item.quantity}</span>
                          </div>
                          <span className="font-bold text-2xl text-tea-green">${item.totalPrice}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-10 border-t border-natural-100 bg-white">
                  <div className="flex flex-col gap-2 mb-8">
                    <div className="flex justify-between items-center text-natural-400 text-sm font-medium">
                      <span>茶飲小計</span>
                      <span>${total}</span>
                    </div>
                    <div className="flex justify-between items-end border-t border-natural-50 pt-4 mt-2">
                      <p className="text-xs font-bold text-natural-400 uppercase tracking-widest">應付總額 Total</p>
                      <p className="text-4xl font-black text-natural-700 tracking-tight">${total}</p>
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    onClick={submitOrder}
                    className={`w-full py-6 rounded-[2rem] font-bold text-xl transition-all shadow-2xl ${
                      isSubmitting 
                        ? 'bg-natural-100 text-natural-300 cursor-not-allowed shadow-none'
                        : 'bg-tea-green text-white hover:bg-tea-green/90 shadow-tea-green/20 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isSubmitting ? '正在為您泡製中...' : '確認下單 CONFIRM ORDER'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
