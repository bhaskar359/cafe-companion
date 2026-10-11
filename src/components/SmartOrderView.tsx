import React, { useState, useEffect } from 'react';
import { MenuItem, Order, OrderPreview } from '../types/api.ts';
import { api } from '../client/api.ts';
import { OrderReviewSkeleton } from './Skeleton.tsx';

interface SmartOrderViewProps {
  cartItems: Array<{ item: MenuItem; quantity: number; customizations?: string[] }>;
  onUpdateQuantity: (menuItemId: string, newQuantity: number) => void;
  onAddToCart: (item: MenuItem, quantity?: number, customizations?: string[]) => void;
  onOrderConfirmed: (order: Order) => void;
  onNavigateToMenu: () => void;
  showToast: (title: string, subtitle: string) => void;
}

export const SmartOrderView: React.FC<SmartOrderViewProps> = ({
  cartItems,
  onUpdateQuantity,
  onAddToCart,
  onOrderConfirmed,
  onNavigateToMenu,
  showToast
}) => {
  const [handoffMethod, setHandoffMethod] = useState<'dine_in' | 'counter' | 'curbside'>('counter');
  const [notes, setNotes] = useState('');
  const [isAgreed, setIsAgreed] = useState(true);
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate / refresh order preview on the server whenever cart or handoff method changes
  useEffect(() => {
    if (cartItems.length === 0) {
      setOrderPreview(null);
      return;
    }

    let isMounted = true;
    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      setErrorMessage(null);
      try {
        const payload = cartItems.map(c => ({
          menuItemId: c.item.id,
          quantity: c.quantity,
          customizations: c.customizations
        }));
        const preview = await api.previewOrder(payload, handoffMethod, notes);
        if (isMounted) {
          setOrderPreview(preview);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage((err as Error).message);
        }
      } finally {
        if (isMounted) setIsLoadingPreview(false);
      }
    };

    fetchPreview();
    return () => {
      isMounted = false;
    };
  }, [cartItems, handoffMethod]);

  const handleAddBiscotti = async () => {
    try {
      const biscotti = await api.getMenuItem('a1000000-0000-0000-0000-000000000010');
      onAddToCart(biscotti);
      showToast('Pairing Added', 'Roasted Almond Biscotti (+₹60) added to your basket');
    } catch {
      showToast('Added', 'Roasted Almond Biscotti (+₹60)');
    }
  };

  const handleConfirmOrder = async () => {
    if (!orderPreview) return;
    if (!isAgreed) {
      setErrorMessage('Please verify your allergen & recipe selections before placing your order.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const order = await api.confirmOrder(orderPreview.previewId, true, {
        customerName: 'Table 04 Express',
        notes: notes.trim() || undefined
      });
      showToast('Order Confirmed!', `Order #${order.orderNumber} dispatched to the barista station`);
      onOrderConfirmed(order);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is empty, show welcoming empty state
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#ebe8e2] dark:bg-[#2A231F] flex items-center justify-center text-[#C66B4E] dark:text-[#E07A5F] shadow-inner mb-6">
          <span className="material-symbols-outlined text-4xl">shopping_basket</span>
        </div>
        <h2 className="font-display-hero text-3xl sm:text-4xl text-[#38271F] dark:text-[#F4EFEB] font-bold">Your Tray is Empty</h2>
        <p className="font-body-md text-sm sm:text-base text-[#6E5E55] dark:text-[#A8988F] max-w-md mt-3">
          Discover our single-origin roasts, artisanal iced brews, and slow-fermented bakes to begin your order.
        </p>
        <button
          onClick={onNavigateToMenu}
          className="mt-8 px-8 py-3.5 rounded-xl bg-[#38271F] dark:bg-[#E07A5F] text-[#F8F5EF] dark:text-[#14110F] font-title-sm text-sm hover:bg-[#C66B4E] transition-colors shadow-md cursor-pointer font-semibold flex items-center gap-2"
        >
          <span>Explore Artisanal Menu</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    );
  }

  // Calculate pricing fallbacks
  const subtotalPaise = orderPreview
    ? orderPreview.subtotalPaise
    : cartItems.reduce((acc, c) => acc + c.item.pricePaise * c.quantity, 0);
  const fairTradePaise = orderPreview ? orderPreview.fairTradeSurchargePaise : 2000;
  const packagingFeePaise = orderPreview ? orderPreview.packagingFeePaise : 0;
  const gstPaise = orderPreview ? orderPreview.gstPaise : Math.round(subtotalPaise * 0.05);
  const totalPaise = orderPreview ? orderPreview.totalPaise : subtotalPaise + fairTradePaise + gstPaise;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-10 transition-colors duration-250">
      {/* Top Flow Stepper & Header Block */}
      <header className="flex flex-col gap-6">
        {/* Stepper */}
        <nav aria-label="Order Checkout Progress" className="flex items-center gap-3 py-2">
          {/* Step 1 */}
          <button
            onClick={onNavigateToMenu}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#d6e8c8] dark:bg-[#202f19] text-[#3c4b33] dark:text-[#baccad] text-[11px] font-bold shadow-xs">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
            <span className="font-label-md text-xs text-[#1c1c18] dark:text-[#EFE9E4] tracking-wide group-hover:text-[#C66B4E]">
              1. Discover &amp; Concierge
            </span>
          </button>
          <div className="w-8 h-[1px] bg-[#d2c3be] dark:bg-[#382F2A]" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#38271F] dark:bg-[#E07A5F] text-[#F8F5EF] dark:text-[#14110F] text-[11px] font-bold shadow-xs ring-4 ring-[#EFE9DF] dark:ring-[#2E2622]">
              2
            </span>
            <span className="font-label-md text-xs text-[#38271F] dark:text-[#F4EFEB] font-semibold tracking-wide">
              2. Order Review
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdbd0] dark:bg-[#2A1D18] text-[#793018] dark:text-[#ff9878] font-label-sm text-[10px] uppercase tracking-wider font-bold">
              Active
            </span>
          </div>
          <div className="w-8 h-[1px] bg-[#d2c3be] dark:bg-[#382F2A]" />

          {/* Step 3 */}
          <div className="flex items-center gap-2 opacity-50">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ebe8e2] dark:bg-[#2A231F] text-[#4f4540] dark:text-[#A8988F] text-[11px] font-bold">
              3
            </span>
            <span className="font-label-md text-xs text-[#4f4540] dark:text-[#A8988F] tracking-wide">
              3. Brew &amp; Collection
            </span>
          </div>
        </nav>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5 max-w-2xl">
            <span className="font-label-sm text-xs text-[#C66B4E] dark:text-[#E07A5F] tracking-widest uppercase font-semibold block">
              Curated Harvest Basket
            </span>
            <h1 className="font-headline-lg text-2xl sm:text-3xl text-[#38271F] dark:text-[#F4EFEB] tracking-tight font-bold">
              Your Smart Order
            </h1>
            <p className="font-body-md text-xs sm:text-sm text-[#6E5E55] dark:text-[#A8988F]">
              Review your artisanal estate selections, customize milk and roasts, and choose your pick-up timing with live barista queue synchronization.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#f6f3ed] dark:bg-[#1C1714] shadow-xs border border-[#E3DACE]/60 dark:border-[#382F2A]">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7B8C70] dark:bg-[#9BB090]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#7B8C70] dark:bg-[#9BB090] animate-ping absolute" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-[#38271F] dark:text-[#F4EFEB] font-semibold uppercase tracking-wider">
                Micro-Roastery Active
              </span>
              <span className="font-body-sm text-xs text-[#6E5E55] dark:text-[#A8988F]">
                Est. Hand-off: ~{orderPreview?.estimatedMinutes || 12} Mins
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dual Split Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Cart Items (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between px-1">
            <span className="font-title-sm text-sm text-[#38271F] dark:text-[#F4EFEB] font-semibold">
              Selected Beverages &amp; Bakes ({cartItems.reduce((acc, c) => acc + c.quantity, 0)})
            </span>
            <button
              onClick={onNavigateToMenu}
              className="font-label-md text-xs text-[#C66B4E] dark:text-[#E07A5F] hover:underline transition-all inline-flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Add items from menu
            </button>
          </div>

          {/* Cart Item Cards or Skeleton Loading */}
          {isLoadingPreview && !orderPreview ? (
            <OrderReviewSkeleton />
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((cartItem, idx) => (
                <article
                  key={idx}
                  className="bg-[#FFFDF9] dark:bg-[#1C1714] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start border border-[#E3DACE]/60 dark:border-[#382F2A]"
                >
                  <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden shrink-0 relative bg-[#ebe8e2] dark:bg-[#2A231F]">
                    <img
                      src={cartItem.item.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIKA2bS52C7_sunXUmE9hNU_PybIy3l8UZ9pYR2khccjAFOpani9NNrTj7FMi7U7ZR5xXAr2OlPITVmv3WxMmvGIHZEjs2qMNHEoH_NIU2ew06Uzk9djJrUDAF0qUCgYuMERqO540m9D-OVhEHT3MK2zWJOyzilSnYHbuIOxJzWhDjeWIi5P7g47E3d7e1Uchu0xYYVRwtm-Y62h5ROKbz_dLhX04P9vQPZ_h9KMLUWYlCFb5R5E3'}
                      alt={cartItem.item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#38271F]/80 dark:bg-[#14110F]/80 text-[#F8F5EF] font-label-sm text-[9px] uppercase backdrop-blur-xs font-semibold">
                      {cartItem.item.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between w-full h-full gap-3 min-w-0">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="font-title-md text-sm sm:text-base text-[#38271F] dark:text-[#F4EFEB] font-semibold leading-snug">
                            {cartItem.item.name}
                          </h2>
                          <span className="font-body-sm text-xs text-[#6E5E55] dark:text-[#A8988F]">
                            {cartItem.item.roastOrigin || 'Specialty Indian Micro-Lot'}
                          </span>
                        </div>
                        <span className="font-price-md text-sm sm:text-base text-[#38271F] dark:text-[#F4EFEB] font-bold shrink-0">
                          ₹{(cartItem.item.pricePaise * cartItem.quantity) / 100}
                        </span>
                      </div>

                      {/* Customization Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0eee8] dark:bg-[#251F1B] text-[#38271F] dark:text-[#EFE9E4] font-label-sm text-[11px] border border-transparent dark:border-[#382F2A]/60">
                          <span className="material-symbols-outlined text-[13px] text-[#6E5E55] dark:text-[#A8988F]">water_drop</span>
                          Whole Milk / Oat
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0eee8] dark:bg-[#251F1B] text-[#38271F] dark:text-[#EFE9E4] font-label-sm text-[11px] border border-transparent dark:border-[#382F2A]/60">
                          <span className="material-symbols-outlined text-[13px] text-[#C66B4E] dark:text-[#E07A5F]">nutrition</span>
                          50% Organic Jaggery
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EFE9DF]/80 dark:border-[#382F2A]/60 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7B8C70] dark:bg-[#9BB090]" />
                        <span className="font-label-sm text-[11px] text-[#3c4b33] dark:text-[#9BB090] font-medium">
                          Fresh batch brewing • Available
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center rounded-lg bg-[#f6f3ed] dark:bg-[#251F1B] px-1 py-0.5 border border-[#E3DACE]/60 dark:border-[#382F2A]">
                          <button
                            onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#ebe8e2] dark:hover:bg-[#2E2622] text-[#38271F] dark:text-[#F4EFEB] transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="w-6 text-center font-title-sm text-xs text-[#38271F] dark:text-[#F4EFEB] font-bold">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#ebe8e2] dark:hover:bg-[#2E2622] text-[#38271F] dark:text-[#F4EFEB] transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* AI Pairing Callout Banner */}
          <aside className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EFE9DF] via-[#f6f3ed] to-[#FFFDF9] dark:from-[#251F1B] dark:via-[#1C1714] dark:to-[#181412] p-5 shadow-xs border border-[#E3DACE]/80 dark:border-[#382F2A]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#d6e8c8] dark:bg-[#202f19] text-[#3c4b33] dark:text-[#baccad] shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                </span>
                <div className="space-y-0.5">
                  <span className="font-label-sm text-xs text-[#38271F] dark:text-[#F4EFEB] font-semibold uppercase tracking-wider block">
                    AI Pairing Recommendation
                  </span>
                  <p className="font-body-sm text-xs text-[#38271F] dark:text-[#EFE9E4]">
                    Add a <strong className="font-semibold text-[#38271F] dark:text-[#F4EFEB]">Roasted Almond Biscotti (+₹60)</strong> to complement the floral notes of your Araku Cold Brew?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddBiscotti}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#38271F] dark:bg-[#E07A5F] text-[#F8F5EF] dark:text-[#14110F] font-label-md text-xs hover:bg-[#C66B4E] dark:hover:bg-[#d0694e] transition-colors shadow-xs flex items-center gap-1.5 self-end sm:self-center cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add for ₹60
              </button>
            </div>
          </aside>

          {/* Hand-off Experience Tabs */}
          <section className="bg-[#FFFDF9] dark:bg-[#1C1714] rounded-2xl p-6 shadow-sm border border-[#E3DACE]/60 dark:border-[#382F2A] space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-title-sm text-sm text-[#38271F] dark:text-[#F4EFEB] font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C66B4E] dark:text-[#E07A5F] text-[20px]">storefront</span>
                Select Hand-off Experience
              </label>
              <span className="font-label-sm text-xs text-[#6E5E55] dark:text-[#A8988F]">Table Service or Express</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Dine-In */}
              <button
                type="button"
                onClick={() => setHandoffMethod('dine_in')}
                className={`flex flex-col text-left p-3.5 rounded-xl transition-all gap-1 cursor-pointer border ${
                  handoffMethod === 'dine_in'
                    ? 'bg-[#38271F] dark:bg-[#E07A5F] text-[#F8F5EF] dark:text-[#14110F] border-[#38271F] dark:border-[#E07A5F] shadow-sm'
                    : 'bg-[#f6f3ed] dark:bg-[#251F1B] hover:bg-[#ebe8e2] dark:hover:bg-[#2E2622] text-[#1c1c18] dark:text-[#EFE9E4] border-transparent dark:border-[#382F2A]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`material-symbols-outlined text-[20px] ${handoffMethod === 'dine_in' ? 'text-white dark:text-[#14110F]' : 'text-[#6E5E55] dark:text-[#A8988F]'}`}>
                    table_restaurant
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border ${handoffMethod === 'dine_in' ? 'bg-white dark:bg-[#14110F] border-white' : 'border-[#817570]'}`} />
                </div>
                <span className="font-label-md text-xs font-semibold pt-1">Dine-In</span>
                <span className={`font-body-sm text-[11px] ${handoffMethod === 'dine_in' ? 'text-[#ffdbd0] dark:text-[#2A1D18]' : 'text-[#6E5E55] dark:text-[#A8988F]'}`}>
                  At Tasting Table 4
                </span>
              </button>

              {/* Option 2: Barista Counter (Selected Default) */}
              <button
                type="button"
                onClick={() => setHandoffMethod('counter')}
                className={`flex flex-col text-left p-3.5 rounded-xl transition-all gap-1 cursor-pointer border ${
                  handoffMethod === 'counter'
                    ? 'bg-[#38271F] dark:bg-[#E07A5F] text-[#F8F5EF] dark:text-[#14110F] border-[#38271F] dark:border-[#E07A5F] shadow-sm ring-2 ring-[#38271F] dark:ring-[#E07A5F] ring-offset-2 ring-offset-[#F8F5EF] dark:ring-offset-[#14110F]'
                    : 'bg-[#f6f3ed] dark:bg-[#251F1B] hover:bg-[#ebe8e2] dark:hover:bg-[#2E2622] text-[#1c1c18] dark:text-[#EFE9E4] border-transparent dark:border-[#382F2A]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`material-symbols-outlined text-[20px] ${handoffMethod === 'counter' ? 'text-white dark:text-[#14110F]' : 'text-[#6E5E55] dark:text-[#A8988F]'}`}>
                    countertops
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${handoffMethod === 'counter' ? 'bg-white dark:bg-[#14110F]' : 'border border-[#817570]'}`}>
                    {handoffMethod === 'counter' && <span className="w-1.5 h-1.5 rounded-full bg-[#38271F] dark:bg-[#E07A5F]" />}
                  </span>
                </div>
                <span className="font-label-md text-xs font-semibold pt-1">Barista Counter</span>
                <span className={`font-body-sm text-[11px] ${handoffMethod === 'counter' ? 'text-[#ffdbd0] dark:text-[#2A1D18]' : 'text-[#6E5E55] dark:text-[#A8988F]'}`}>
                  Pick-up in ~12 mins
                </span>
              </button>

              {/* Option 3: Curbside Express */}
              <button
                type="button"
                onClick={() => setHandoffMethod('curbside')}
                className={`flex flex-col text-left p-3.5 rounded-xl transition-all gap-1 cursor-pointer border ${
                  handoffMethod === 'curbside'
                    ? 'bg-[#38271F] dark:bg-[#E07A5F] text-[#F8F5EF] dark:text-[#14110F] border-[#38271F] dark:border-[#E07A5F] shadow-sm'
                    : 'bg-[#f6f3ed] dark:bg-[#251F1B] hover:bg-[#ebe8e2] dark:hover:bg-[#2E2622] text-[#1c1c18] dark:text-[#EFE9E4] border-transparent dark:border-[#382F2A]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`material-symbols-outlined text-[20px] ${handoffMethod === 'curbside' ? 'text-white dark:text-[#14110F]' : 'text-[#6E5E55] dark:text-[#A8988F]'}`}>
                    directions_car
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border ${handoffMethod === 'curbside' ? 'bg-white dark:bg-[#14110F] border-white' : 'border-[#817570]'}`} />
                </div>
                <span className="font-label-md text-xs font-semibold pt-1">Curbside Express</span>
                <span className={`font-body-sm text-[11px] ${handoffMethod === 'curbside' ? 'text-[#ffdbd0] dark:text-[#2A1D18]' : 'text-[#6E5E55] dark:text-[#A8988F]'}`}>
                  Roastery Valet Gate
                </span>
              </button>
            </div>

            {/* Preparation Notes */}
            <div className="pt-2 space-y-2">
              <label className="font-label-md text-xs text-[#38271F] dark:text-[#F4EFEB] flex items-center gap-1.5 font-semibold" htmlFor="prep-notes">
                <span>Preparation &amp; Allergen Notes</span>
                <span className="font-normal text-[#6E5E55] dark:text-[#A8988F] text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <textarea
                  id="prep-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="E.g., No plastic lid, extra hot, almond allergy precautions for the croissant..."
                  rows={2}
                  className="w-full rounded-xl bg-[#f6f3ed] dark:bg-[#251F1B] px-4 py-3 font-body-sm text-xs text-[#1c1c18] dark:text-[#F4EFEB] placeholder:text-[#6E5E55]/60 dark:placeholder:text-[#A8988F]/60 focus:bg-[#FFFDF9] dark:focus:bg-[#1C1714] focus:outline-none focus:ring-1 focus:ring-[#C66B4E] dark:focus:ring-[#E07A5F] resize-none transition-all shadow-inner border border-[#E3DACE]/60 dark:border-[#382F2A]"
                />
                <span className="material-symbols-outlined absolute right-3 bottom-3 text-[#6E5E55]/50 dark:text-[#A8988F]/50 text-[18px]">
                  edit_note
                </span>
              </div>
            </div>
          </section>
        </section>

        {/* Right Column: Order Breakdown & Confirmation (5 cols) */}
        <aside className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
          <div className="bg-[#FFFDF9] dark:bg-[#1C1714] rounded-2xl p-6 sm:p-7 shadow-md flex flex-col gap-6 border border-[#E3DACE]/80 dark:border-[#382F2A]">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE9DF] dark:border-[#382F2A]">
              <div>
                <span className="font-label-sm text-xs text-[#C66B4E] dark:text-[#E07A5F] tracking-wider uppercase font-semibold">
                  Single-Estate Receipt
                </span>
                <h2 className="font-headline-sm text-xl text-[#38271F] dark:text-[#F4EFEB] font-bold">Order Breakdown</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#ebe8e2] dark:bg-[#251F1B] text-[#38271F] dark:text-[#EFE9E4] font-label-sm text-xs font-semibold">
                Indiranagar Lab
              </span>
            </div>

            {/* Price Line Items */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between font-body-md text-xs sm:text-sm">
                <span className="text-[#6E5E55] dark:text-[#A8988F]">Subtotal ({cartItems.reduce((acc, c) => acc + c.quantity, 0)} craft items)</span>
                <span className="text-[#38271F] dark:text-[#F4EFEB] font-medium font-price-md text-sm font-bold">
                  ₹{subtotalPaise / 100}
                </span>
              </div>

              {packagingFeePaise > 0 && (
                <div className="flex items-center justify-between font-body-md text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-[#6E5E55] dark:text-[#A8988F]">
                    <span>Specialty Packaging Deposit</span>
                    <span className="material-symbols-outlined text-[15px] text-[#6E5E55] dark:text-[#A8988F] cursor-help" title="Fully refundable upon return of the apothecary cold brew bottle">
                      help_outline
                    </span>
                  </div>
                  <span className="text-[#38271F] dark:text-[#F4EFEB] font-medium font-price-md text-sm font-bold">
                    ₹{packagingFeePaise / 100}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between font-body-md text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-[#6E5E55] dark:text-[#A8988F]">
                  <span>Barista Gratuity &amp; Fair-Trade Surcharge</span>
                </div>
                <span className="text-[#38271F] dark:text-[#F4EFEB] font-medium font-price-md text-sm font-bold">
                  ₹{fairTradePaise / 100}
                </span>
              </div>

              <div className="flex items-center justify-between font-body-md text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-[#6E5E55] dark:text-[#A8988F]">
                  <span>Taxes (GST 5% Café Rate)</span>
                </div>
                <span className="text-[#38271F] dark:text-[#F4EFEB] font-medium font-price-md text-sm font-bold">
                  ₹{gstPaise / 100}
                </span>
              </div>

              {/* Dotted Divider */}
              <div className="border-t-2 border-dashed border-[#EFE9DF] dark:border-[#382F2A] pt-3" />

              {/* Grand Total */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="font-title-md text-base text-[#38271F] dark:text-[#F4EFEB] font-bold block">Total Payable</span>
                  <span className="font-label-sm text-[11px] text-[#6E5E55] dark:text-[#A8988F]">Inclusive of all agricultural duties</span>
                </div>
                <div className="text-right">
                  <span className="font-headline-md text-2xl text-[#38271F] dark:text-[#F4EFEB] font-bold">
                    ₹{totalPaise / 100}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Inventory Guarantee Ribbon */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f6f3ed] dark:bg-[#251F1B] text-[#38271F] dark:text-[#EFE9E4] border border-[#E3DACE]/40 dark:border-[#382F2A]">
              <span className="material-symbols-outlined text-[#7B8C70] dark:text-[#9BB090] text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div className="space-y-0.5">
                <span className="font-label-sm text-xs text-[#38271F] dark:text-[#F4EFEB] font-semibold block uppercase tracking-wider">
                  AI Concierge Guarantee
                </span>
                <p className="font-body-sm text-[11px] text-[#6E5E55] dark:text-[#A8988F] leading-relaxed">
                  Grounded in real-time estate inventory. Zero artificial markups. Hand-roasted beans guaranteed within 14 days of degas.
                </p>
              </div>
            </div>

            {/* Explicit Confirmation Checkbox (Requirement 9 & 8) */}
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={e => setIsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[#C66B4E] accent-[#C66B4E] bg-[#f0eee8] dark:bg-[#251F1B] focus:ring-[#C66B4E] cursor-pointer"
              />
              <span className="font-body-sm text-xs text-[#1c1c18] dark:text-[#EFE9E4] group-hover:text-[#38271F] dark:group-hover:text-[#F4EFEB] transition-colors leading-relaxed">
                I verify that allergen details, temperature preference, and milk selections match my palate.
              </span>
            </label>

            {/* Error banner if validation fails */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#ffdad6] dark:bg-[#441714] text-[#93000a] dark:text-[#ffb4ab] text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Primary Confirmation Action */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isSubmitting || isLoadingPreview || !orderPreview}
                className="w-full py-4 px-6 rounded-xl bg-[#C66B4E] dark:bg-[#E07A5F] text-white dark:text-[#14110F] hover:brightness-105 active:scale-[0.99] font-title-sm text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 font-semibold group"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    <span>Persisting Order to Barista Queue...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Place Order</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 dark:bg-[#14110F]/60" />
                    <span className="font-price-lg text-base">₹{totalPaise / 100}</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[20px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>

              {/* Seamless Instant Checkout Payment Badges */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <span className="font-label-sm text-[11px] text-[#6E5E55] dark:text-[#A8988F] uppercase tracking-wider">
                  Seamless Instant Checkout Via
                </span>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-md bg-[#ebe8e2] dark:bg-[#251F1B] text-[#38271F] dark:text-[#EFE9E4] font-label-sm text-[10px] font-semibold">
                    UPI • GPay / PhonePe
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#ebe8e2] dark:bg-[#251F1B] text-[#38271F] dark:text-[#EFE9E4] font-label-sm text-[10px] font-semibold">
                    Cards
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#ebe8e2] dark:bg-[#251F1B] text-[#38271F] dark:text-[#EFE9E4] font-label-sm text-[10px] font-semibold">
                    Pay at Counter
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sensory Estate Transparency Micro Card */}
          <div className="p-5 rounded-2xl bg-[#f6f3ed] dark:bg-[#1C1714] shadow-xs flex items-center gap-4 border border-[#E3DACE]/60 dark:border-[#382F2A]">
            <div className="w-12 h-12 rounded-xl bg-[#38271F] dark:bg-[#E07A5F] text-[#F8F5EF] dark:text-[#14110F] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">eco</span>
            </div>
            <div className="space-y-0.5">
              <span className="font-label-md text-xs text-[#38271F] dark:text-[#F4EFEB] font-semibold">Estate Carbon Offset</span>
              <p className="font-body-sm text-[11px] text-[#6E5E55] dark:text-[#A8988F]">
                ₹2 from this order funds native shade canopy reforestation in Chikmagalur Western Ghats.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Live Barista Sensory Timeline */}
      <section className="mt-4 p-6 rounded-2xl bg-[#FFFDF9] dark:bg-[#1C1714] shadow-sm space-y-4 border border-[#E3DACE]/60 dark:border-[#382F2A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#7B8C70] dark:text-[#9BB090] text-[22px]">timer</span>
            <span className="font-title-sm text-sm text-[#38271F] dark:text-[#F4EFEB] font-semibold">
              Live Micro-Roaster Queue Status
            </span>
          </div>
          <span className="font-label-sm text-xs text-[#6E5E55] dark:text-[#A8988F]">
            Real-Time Kitchen Sync: Terminal 02 • Station A
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ebe8e2]/60 dark:bg-[#251F1B]">
            <span className="w-7 h-7 rounded-full bg-[#7B8C70] dark:bg-[#9BB090] text-white dark:text-[#14110F] flex items-center justify-center font-label-sm text-xs font-bold">
              1
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-xs text-[#38271F] dark:text-[#F4EFEB] font-semibold">Order Queued</span>
              <span className="font-body-sm text-[11px] text-[#6E5E55] dark:text-[#A8988F]">Ticket dispatched</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ebe8e2]/60 dark:bg-[#251F1B]">
            <span className="w-7 h-7 rounded-full bg-[#38271F] dark:bg-[#E07A5F] text-white dark:text-[#14110F] flex items-center justify-center font-label-sm text-xs font-bold">
              2
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-xs text-[#38271F] dark:text-[#F4EFEB] font-semibold">Bean Grinding</span>
              <span className="font-body-sm text-[11px] text-[#6E5E55] dark:text-[#A8988F]">Mahlkönig EK43</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f6f3ed] dark:bg-[#221C18] opacity-60">
            <span className="w-7 h-7 rounded-full bg-[#d2c3be] dark:bg-[#382F2A] text-[#38271F] dark:text-[#EFE9E4] flex items-center justify-center font-label-sm text-xs font-bold">
              3
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-xs text-[#38271F] dark:text-[#F4EFEB]">Extraction &amp; Steam</span>
              <span className="font-body-sm text-[11px] text-[#6E5E55] dark:text-[#A8988F]">Custom pressure curve</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f6f3ed] dark:bg-[#221C18] opacity-60">
            <span className="w-7 h-7 rounded-full bg-[#d2c3be] dark:bg-[#382F2A] text-[#38271F] dark:text-[#EFE9E4] flex items-center justify-center font-label-sm text-xs font-bold">
              4
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-xs text-[#38271F] dark:text-[#F4EFEB]">Sensory Call</span>
              <span className="font-body-sm text-[11px] text-[#6E5E55] dark:text-[#A8988F]">Pick-up counter bell</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
