import { useState, useEffect } from 'react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Check, Clock, Package, XCircle, LogOut, ChevronRight, UserCircle } from 'lucide-react';
import { toast } from '../components/ui/Toaster';

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        if (!isFirebaseConfigured) {
          // Mock mode
          const savedPwd = localStorage.getItem('mock_admin_password');
          setIsSetup(!!savedPwd);
          return;
        }
        const docRef = doc(db, 'settings', 'admin_setup');
        const docSnap = await getDoc(docRef);
        setIsSetup(docSnap.exists());
      } catch (error) {
        console.error(error);
        setIsSetup(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSetup();
  }, []);

  const handleSetup = async () => {
    if (!password) return;
    const hashed = await hashPassword(password);
    try {
      if (!isFirebaseConfigured) {
        localStorage.setItem('mock_admin_password', hashed);
        setIsSetup(true);
        toast("Mock 密碼設定成功");
      } else {
        await setDoc(doc(db, 'settings', 'admin_setup'), {
          password: hashed,
          createdAt: new Date().toISOString()
        });
        setIsSetup(true);
        toast("管理員密碼設定完成");
      }
      setIsAuthenticated(true);
    } catch (error) {
      toast("設定失敗", "error");
    }
  };

  const handleLogin = async () => {
    const hashed = await hashPassword(password);
    if (!isFirebaseConfigured) {
      const saved = localStorage.getItem('mock_admin_password');
      if (saved === hashed) {
        setIsAuthenticated(true);
        toast("登入成功");
      } else {
        toast("密碼錯誤", "error");
      }
      return;
    }

    try {
      const docSnap = await getDoc(doc(db, 'settings', 'admin_setup'));
      if (docSnap.exists() && docSnap.data().password === hashed) {
        setIsAuthenticated(true);
        toast("登入成功");
      } else {
        toast("密碼錯誤", "error");
      }
    } catch (error) {
      toast("連線失敗", "error");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      let unsubscribe: () => void;
      if (!isFirebaseConfigured) {
        // In reality, orders would come from a real sync, but for mock we can just use a local interval or nothing
        toast("警告：正在使用 Mock 模式 (本地存儲)", "error");
        return;
      }
      
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const orderList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(orderList);
      }, (error) => {
        console.error(error);
        toast("訂單讀取失敗", "error");
      });

      return () => unsubscribe?.();
    }
  }, [isAuthenticated]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      toast("訂單狀態已更新");
    } catch (error) {
      toast("更新失敗", "error");
    }
  };

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center font-bold">載入中...</div>;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-amber-500 rounded-3xl shadow-xl shadow-amber-200 dark:shadow-none">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-center mb-2">
            {isSetup ? '後台管理登入' : '第一次使用設定'}
          </h2>
          <p className="text-slate-400 text-center text-sm mb-10 font-medium tracking-tight">
            {isSetup ? '請輸入您的管理員密碼以進入系統' : '請設定您的管理員密碼，之後進入後台均需此密碼'}
          </p>

          <div className="space-y-6">
            <div className="relative">
              <input
                type="password"
                placeholder="輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (isSetup ? handleLogin() : handleSetup())}
                className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold"
              />
            </div>
            <button
              onClick={isSetup ? handleLogin : handleSetup}
              className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              {isSetup ? '確認登入 ENTER' : '設定密碼 START'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">後台管理訂單</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
            <Clock className="w-3 h-3" /> Real-time Order Monitoring
          </p>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <LogOut className="w-4 h-4" /> 登出
        </button>
      </div>

      {!isFirebaseConfigured && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-6 rounded-[2rem] flex items-center gap-4 text-amber-800 dark:text-amber-200">
          <UserCircle className="w-10 h-10 flex-shrink-0" />
          <div>
            <h4 className="font-bold">演示模式啟用中</h4>
            <p className="text-sm opacity-80">
              Firebase 未配置。此模式下，訂單僅會存儲在內存中（刷新頁面即消失），密碼則存在瀏覽器本地。
            </p>
          </div>
        </div>
      )}

      {/* Order List */}
      <div className="grid grid-cols-1 gap-6">
        {orders.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-300 gap-4">
            <Package className="w-20 h-20 opacity-20" />
            <p className="font-black text-xl opacity-30 uppercase tracking-widest">目前沒有任何訂單</p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div
              layout
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-3xl ${
                      order.status === 'completed' ? 'bg-green-100/50 dark:bg-green-900/20 text-green-600' :
                      order.status === 'cancelled' ? 'bg-red-100/50 dark:bg-red-900/20 text-red-600' :
                      order.status === 'preparing' ? 'bg-blue-100/50 dark:bg-blue-900/20 text-blue-600' :
                      'bg-amber-100/50 dark:bg-amber-900/20 text-amber-600'
                    }`}>
                      {order.status === 'completed' ? <Check /> : 
                       order.status === 'cancelled' ? <XCircle /> :
                       order.status === 'preparing' ? <Clock /> : <Clock />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black"># {order.id.slice(-4).toUpperCase()}</span>
                        <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold mt-1">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('zh-TW') : new Date(order.createdAt).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform"
                    >
                      製作中
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:scale-105 transition-transform"
                    >
                      完成
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:scale-105 transition-transform"
                    >
                      取消
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl">
                      <div>
                        <p className="font-bold">{item.name} <span className="text-amber-500 ml-2">x{item.quantity}</span></p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {item.size} / {item.sugar} / {item.ice} 
                          {item.toppings?.length > 0 && ` / +${item.toppings.join(', ')}`}
                        </p>
                      </div>
                      <p className="font-black">${item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between items-end border-t border-slate-50 dark:border-slate-800 pt-8">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">總金額 TOTAL AMOUNT</span>
                  <span className="text-3xl font-black">${order.total}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
