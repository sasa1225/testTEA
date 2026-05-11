import { Link, Outlet, useLocation } from 'react-router-dom';
import { Coffee, Settings, ShoppingBag, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-natural-50 text-natural-700 transition-colors duration-300 flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-natural-200 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-tea-green rounded-full flex items-center justify-center text-white italic text-xl shadow-lg shadow-tea-green/20 group-hover:rotate-12 transition-transform duration-300">
              茶
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-natural-600 font-serif">萃雅園</span>
              <span className="text-[10px] font-sans font-medium text-natural-500 uppercase tracking-widest -mt-1">Cuiya Tea Atelier</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link 
              to="/" 
              className={`font-sans font-medium text-sm transition-all hover:text-tea-green ${location.pathname === '/' ? 'text-tea-green' : 'text-natural-600'}`}
            >
              菜單瀏覽
            </Link>
            <Link 
              to="/admin" 
              className={`font-sans font-medium text-sm transition-all hover:text-accent-gold ${location.pathname === '/admin' ? 'text-accent-gold' : 'text-natural-600'}`}
            >
              訂單查詢
            </Link>
            <div className="h-6 w-[1px] bg-natural-200 mx-2"></div>
            <Link 
              to="/admin" 
              className="px-6 py-2 bg-accent-gold text-white rounded-full shadow-md hover:shadow-lg hover:shadow-accent-gold/20 transition-all font-sans font-medium text-sm active:scale-95"
            >
              進入後台
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-natural-100 transition-colors text-natural-400"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link 
              to="/" 
              className="relative p-2 rounded-full hover:bg-natural-100 transition-colors text-natural-600"
            >
              <ShoppingBag className="w-6 h-6" />
              {items.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent-gold text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-md"
                >
                  {items.length}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="h-16 bg-natural-100 border-t border-natural-200 px-10 flex items-center justify-between text-[11px] font-sans text-natural-400 tracking-wider">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> 
            Firebase Connected
          </span>
          <span className="opacity-60 hidden sm:inline">DATABASE: CUIYA-TEA-PRODUCTION-V1</span>
        </div>
        <p>© 2026 CUIYA TEA ATELIER. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
