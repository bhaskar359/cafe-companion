import React, { useState, useEffect } from 'react';
import { MenuItem, Order } from './types/api.ts';
import { api } from './client/api.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { DiscoverView } from './components/DiscoverView.tsx';
import { ConciergeView } from './components/ConciergeView.tsx';
import { SmartOrderView } from './components/SmartOrderView.tsx';
import { OrderStatusView } from './components/OrderStatusView.tsx';

interface ToastState {
  show: boolean;
  title: string;
  subtitle: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'discover' | 'menu' | 'ai-concierge' | 'my-order' | 'order-status'>('discover');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [conciergePrompt, setConciergePrompt] = useState<string | undefined>(undefined);

  // Dark mode state with persistence & system preference fallback
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cafe_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('cafe_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('cafe_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Initialize cart with 2 realistic items matching Stitch design (2 items · ₹350 + ₹30 GST = ₹380)
  const [cartItems, setCartItems] = useState<Array<{ item: MenuItem; quantity: number; customizations?: string[] }>>([]);

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({
    show: false,
    title: '',
    subtitle: ''
  });

  const showToast = (title: string, subtitle: string) => {
    setToast({ show: true, title, subtitle });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2800);
  };

  // Fetch menu on load
  useEffect(() => {
    let isMounted = true;
    async function loadMenu() {
      try {
        const items = await api.getMenu();
        if (isMounted) {
          setMenuItems(items);

          // Populate initial cart with 2 items from real loaded menu if empty
          if (items.length >= 8) {
            const frappe = items[0]; // South Indian Filter Coffee Frappe
            const croissant = items[7]; // Cardamom Pistachio Croissant
            setCartItems([
              { item: frappe, quantity: 1, customizations: ['Whole Milk', '50% Organic Jaggery'] },
              { item: croissant, quantity: 1, customizations: ['Warmed slightly'] }
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        if (isMounted) setLoadingMenu(false);
      }
    }
    loadMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (item: MenuItem, quantity = 1, customizations?: string[]) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(c => c.item.id === item.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity
        };
        return next;
      }
      return [...prev, { item, quantity, customizations }];
    });
  };

  const handleUpdateQuantity = (menuItemId: string, newQuantity: number) => {
    setCartItems(prev => {
      if (newQuantity <= 0) {
        return prev.filter(c => c.item.id !== menuItemId);
      }
      return prev.map(c => (c.item.id === menuItemId ? { ...c, quantity: newQuantity } : c));
    });
  };

  const handleAddPairing = (item1Name: string, item2Name: string, _totalRupees: number) => {
    const item1 = menuItems.find(m => m.name.toLowerCase().includes(item1Name.toLowerCase()));
    const item2 = menuItems.find(m => m.name.toLowerCase().includes(item2Name.toLowerCase()));

    if (item1) handleAddToCart(item1);
    if (item2) handleAddToCart(item2);

    showToast('Artisanal Pair Added', `Added ${item1Name} & ${item2Name} to tray`);
  };

  const handleNavigateToConcierge = (initialPrompt?: string) => {
    setConciergePrompt(initialPrompt);
    setActiveTab('ai-concierge');
  };

  const handleOrderConfirmed = (order: Order) => {
    setConfirmedOrder(order);
    setCartItems([]); // Clear cart after order confirmation
    setActiveTab('order-status');
  };

  // Cart totals
  const cartItemCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotalPaise = cartItems.reduce((acc, curr) => acc + curr.item.pricePaise * curr.quantity, 0);
  const cartGstPaise = Math.round(cartSubtotalPaise * 0.05);
  const cartTotalRupees = (cartSubtotalPaise + cartGstPaise) / 100;

  return (
    <div className="min-h-screen bg-[#F8F5EF] dark:bg-[#14110F] text-[#1c1c18] dark:text-[#EFE9E4] flex flex-col font-sans selection:bg-[#ffdbd0] dark:selection:bg-[#E07A5F]/30 selection:text-[#38271F] dark:selection:text-[#F4EFEB] transition-colors duration-250">
      {/* Toast Notification (Fixed Floating Bottom-Right) */}
      <div
        className={`fixed bottom-8 right-8 z-50 flex items-center gap-3.5 px-5 py-3.5 rounded-xl bg-[#38271F] dark:bg-[#251F1B] text-[#F8F5EF] dark:text-[#F4EFEB] shadow-xl border border-transparent dark:border-[#382F2A] transition-all duration-300 ${
          toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7B8C70] dark:bg-[#9BB090] text-white dark:text-[#14110F] text-xs">
          <span className="material-symbols-outlined text-sm font-bold">done</span>
        </span>
        <div className="flex flex-col">
          <span className="font-title-sm text-xs text-[#FFFDF9] dark:text-[#F4EFEB] font-bold leading-none">{toast.title}</span>
          <span className="font-body-sm text-[11px] text-[#dcdad4] dark:text-[#A8988F] mt-0.5">{toast.subtitle}</span>
        </div>
      </div>

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItemCount={cartItemCount}
        cartTotalRupees={cartTotalRupees}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main View Shell */}
      <main className="w-full pt-20 bg-[#F8F5EF] dark:bg-[#14110F] min-h-screen flex-1 flex flex-col transition-colors duration-250">
        {(activeTab === 'discover' || activeTab === 'menu') && (
          <DiscoverView
            menuItems={menuItems}
            loading={loadingMenu}
            onAddToCart={handleAddToCart}
            onAddPairing={handleAddPairing}
            onNavigateToConcierge={handleNavigateToConcierge}
            showToast={showToast}
          />
        )}

        {activeTab === 'ai-concierge' && (
          <ConciergeView
            initialPrompt={conciergePrompt}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onProceedToReview={() => setActiveTab('my-order')}
            showToast={showToast}
          />
        )}

        {activeTab === 'my-order' && (
          <SmartOrderView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onAddToCart={handleAddToCart}
            onOrderConfirmed={handleOrderConfirmed}
            onNavigateToMenu={() => setActiveTab('menu')}
            showToast={showToast}
          />
        )}

        {activeTab === 'order-status' && confirmedOrder && (
          <OrderStatusView
            order={confirmedOrder}
            onNavigateToDiscover={() => setActiveTab('discover')}
            onNavigateToConcierge={handleNavigateToConcierge}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />
    </div>
  );
}
