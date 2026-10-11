import React, { useState, useEffect } from 'react';
import { Order } from '../types/api.ts';

interface OrderStatusViewProps {
  order: Order;
  onNavigateToDiscover: () => void;
  onNavigateToConcierge: (prompt?: string) => void;
  showToast: (title: string, subtitle: string) => void;
}

export const OrderStatusView: React.FC<OrderStatusViewProps> = ({
  order,
  onNavigateToDiscover,
  onNavigateToConcierge,
  showToast
}) => {
  const [countdownMinutes, setCountdownMinutes] = useState(order.estimatedMinutesLeft || 8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownMinutes(prev => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleDownloadInvoice = () => {
    showToast('Invoice Downloaded', `Receipt for Order #${order.orderNumber} saved.`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 lg:py-12 space-y-10">
      {/* Top Celebration & Hero Status Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#FFFDF9] shadow-[0_4px_24px_rgba(56,39,31,0.04)] p-8 lg:p-12 border border-[#E3DACE]/80">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#7B8C70]/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-[#ff9878]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#d6e8c8] text-[#3c4b33] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#7B8C70] animate-pulse" />
              <span className="font-label-md text-xs tracking-wider uppercase font-bold">
                Order Confirmed &amp; Brewing
              </span>
            </div>
            <div className="space-y-1">
              <span className="font-label-sm text-xs text-[#6E5E55] uppercase tracking-widest block font-medium">
                Reference Receipt
              </span>
              <h1 className="font-display-hero text-3xl sm:text-5xl text-[#38271F] tracking-tight font-bold">
                Order #{order.orderNumber}
              </h1>
            </div>
            <p className="font-body-md text-xs sm:text-sm text-[#6E5E55] flex flex-wrap items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#C66B4E]">schedule</span>
              <span>Placed just now IST</span>
              <span className="inline-block w-1 h-1 rounded-full bg-[#d2c3be]" />
              <span>Barista Station 2, Indiranagar Roastery</span>
            </p>
          </div>

          {/* Spotlight Countdown Display */}
          <div className="shrink-0 bg-[#f6f3ed] rounded-2xl p-6 lg:p-8 flex flex-col items-start lg:items-end justify-center shadow-xs border border-[#E3DACE]/80 min-w-[260px]">
            <span className="font-label-sm text-xs uppercase tracking-widest text-[#6E5E55] font-medium">
              Live Queue Estimation
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display-hero text-4xl sm:text-5xl text-[#38271F] font-bold">
                {countdownMinutes}
              </span>
              <span className="font-headline-sm text-lg text-[#38271F] font-normal">min left</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFDF9] text-[#C66B4E] shadow-xs border border-[#E3DACE]/40">
              <span className="material-symbols-outlined text-xs">local_fire_department</span>
              <span className="font-label-sm text-[11px] italic font-semibold">Crafted slowly by hand</span>
            </div>
            <span className="font-body-sm text-xs text-[#6E5E55] mt-3">
              Target Ready Time: <strong className="text-[#38271F] font-semibold">{order.targetReadyTime}</strong>
            </span>
          </div>
        </div>

        {/* Preparation Progress Timeline */}
        <div className="mt-12 pt-8 relative border-t border-[#EFE9DF]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {/* Step 1: Complete */}
            <div className="flex md:flex-col items-center md:items-center gap-4 md:text-center group">
              <div className="w-14 h-14 rounded-full bg-[#7B8C70] text-white flex items-center justify-center shadow-md ring-4 ring-[#FFFDF9] shrink-0">
                <span className="material-symbols-outlined text-2xl font-bold">check</span>
              </div>
              <div className="flex flex-col md:items-center">
                <span className="font-label-md text-xs text-[#7B8C70] uppercase tracking-wider font-bold">
                  Complete
                </span>
                <h4 className="font-title-sm text-xs sm:text-sm text-[#38271F] font-semibold mt-0.5">
                  Order Received
                </h4>
                <p className="font-body-sm text-xs text-[#6E5E55]">
                  Single-origin beans dialed &amp; gram-measured
                </p>
              </div>
            </div>

            {/* Step 2: Active Station */}
            <div className="flex md:flex-col items-center md:items-center gap-4 md:text-center group">
              <div className="w-14 h-14 rounded-full bg-[#C66B4E] text-white flex items-center justify-center shadow-lg ring-4 ring-[#ffdbd0]/60 shrink-0 relative">
                <span className="material-symbols-outlined text-2xl animate-spin" style={{ animationDuration: '6s' }}>
                  motion_photos_on
                </span>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff9878] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#C66B4E]" />
                </span>
              </div>
              <div className="flex flex-col md:items-center">
                <span className="font-label-md text-xs text-[#C66B4E] uppercase tracking-wider font-bold">
                  Active Station
                </span>
                <h4 className="font-title-sm text-xs sm:text-sm text-[#38271F] font-semibold mt-0.5">
                  Extraction &amp; Grinding
                </h4>
                <p className="font-body-sm text-xs text-[#6E5E55]">
                  Pulling 9-bar shot on Slayer espresso machine
                </p>
              </div>
            </div>

            {/* Step 3: Upcoming */}
            <div className="flex md:flex-col items-center md:items-center gap-4 md:text-center opacity-70">
              <div className="w-14 h-14 rounded-full bg-[#ebe8e2] text-[#817570] flex items-center justify-center ring-4 ring-[#FFFDF9] shrink-0">
                <span className="material-symbols-outlined text-2xl">bakery_dining</span>
              </div>
              <div className="flex flex-col md:items-center">
                <span className="font-label-md text-xs text-[#6E5E55] uppercase tracking-wider">Step 3 • Upcoming</span>
                <h4 className="font-title-sm text-xs sm:text-sm text-[#38271F] font-semibold mt-0.5">
                  Steam, Blend &amp; Plating
                </h4>
                <p className="font-body-sm text-xs text-[#6E5E55]">Oat texturing &amp; warm pastry glaze</p>
              </div>
            </div>

            {/* Step 4: Final Step */}
            <div className="flex md:flex-col items-center md:items-center gap-4 md:text-center opacity-50">
              <div className="w-14 h-14 rounded-full bg-[#ebe8e2] text-[#817570] flex items-center justify-center ring-4 ring-[#FFFDF9] shrink-0">
                <span className="material-symbols-outlined text-2xl">countertops</span>
              </div>
              <div className="flex flex-col md:items-center">
                <span className="font-label-md text-xs text-[#6E5E55] uppercase tracking-wider">Final Step</span>
                <h4 className="font-title-sm text-xs sm:text-sm text-[#38271F] font-semibold mt-0.5">
                  Counter Pick-up
                </h4>
                <p className="font-body-sm text-xs text-[#6E5E55]">Tray chime at Counter 2</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Culinary Breakdown (7 cols) */}
        <section className="lg:col-span-7 bg-[#FFFDF9] rounded-2xl p-8 shadow-sm border border-[#E3DACE]/80 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFE9DF]">
            <div className="space-y-1">
              <span className="font-label-sm text-xs uppercase tracking-widest text-[#6E5E55] font-semibold">
                Sensory Manifest
              </span>
              <h2 className="font-headline-sm text-xl text-[#38271F] font-bold">Your Order Summary</h2>
            </div>
            <span className="font-label-md text-xs px-3 py-1 rounded-full bg-[#ebe8e2] text-[#38271F] font-semibold">
              {order.items.length} Handcrafted Item{order.items.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Items Listing */}
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#f6f3ed]/60 hover:bg-[#f6f3ed] transition-colors border border-[#E3DACE]/40"
              >
                <div className="space-y-1 min-w-0">
                  <h3 className="font-title-sm text-sm text-[#38271F] font-bold truncate">
                    {item.itemName}
                  </h3>
                  <p className="font-body-sm text-xs text-[#6E5E55]">
                    Customized: {item.customizations?.join(' • ') || 'Single Estate Harvest • Barista standard'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#4f4540] font-semibold">
                      Lot #AK-24
                    </span>
                    <span className="font-label-sm text-[10px] text-[#7B8C70] font-bold">Brewing now</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-price-md text-sm text-[#38271F] font-bold">
                    ₹{item.lineTotalPaise / 100}
                  </span>
                  <span className="block font-label-sm text-[10px] text-[#6E5E55]">Qty: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Computation Card */}
          <div className="rounded-xl bg-[#f0eee8] p-6 space-y-3 border border-[#E3DACE]/80">
            <div className="flex justify-between font-body-sm text-xs text-[#6E5E55]">
              <span>Culinary Subtotal ({order.items.length} items)</span>
              <span className="font-medium text-[#38271F]">₹{order.subtotalPaise / 100}.00</span>
            </div>
            <div className="flex justify-between font-body-sm text-xs text-[#6E5E55]">
              <span>Specialty Packaging &amp; Roast Tax (5% GST)</span>
              <span className="font-medium text-[#38271F]">₹{order.gstPaise / 100}.00</span>
            </div>
            <div className="flex justify-between font-body-sm text-xs text-[#6E5E55]">
              <span>Karnataka Clean Cultivation Fund &amp; Fair Trade</span>
              <span className="font-medium text-[#38271F]">₹{order.fairTradeSurchargePaise / 100}.00</span>
            </div>
            <div className="pt-3 border-t border-[#d2c3be]/40 flex justify-between items-baseline text-[#38271F]">
              <div>
                <span className="font-title-md text-sm font-bold block">Total Settled</span>
                <span className="block font-label-sm text-[11px] text-[#6E5E55]">
                  Paid instantly via Google Pay UPI • Txn #UPI-9182304
                </span>
              </div>
              <span className="font-display-hero text-2xl text-[#38271F] font-bold">
                ₹{order.totalPaise / 100}
              </span>
            </div>
          </div>

          {/* Tasting Notes */}
          <div className="p-5 rounded-xl bg-[#ebe8e2]/70 flex items-start gap-4 border border-[#E3DACE]/60">
            <span className="material-symbols-outlined text-[#C66B4E] text-2xl shrink-0 mt-0.5">
              psychology_alt
            </span>
            <div className="space-y-1">
              <h4 className="font-title-sm text-xs sm:text-sm text-[#38271F] font-bold">
                Barista Sensory Pairing Note
              </h4>
              <p className="font-body-sm text-xs text-[#6E5E55] leading-relaxed">
                We recommend tasting your coffee first to reset the palate with floral stone-fruit clarity before biting into the rich cardamom butter pastry.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Digital Pick-Up Pass & Roastery Dispatch (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFDF9] rounded-2xl p-8 shadow-sm border border-[#E3DACE]/80 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7B8C70]" />
                <span className="font-label-md text-xs uppercase tracking-wider text-[#38271F] font-bold">
                  Express Collection Pass
                </span>
              </div>
              <span className="font-label-sm text-xs text-[#6E5E55] font-mono font-semibold">
                IND-T2-{order.orderNumber.replace('CC-', '')}
              </span>
            </div>

            {/* Barista Team Avatar */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#f6f3ed] border border-[#E3DACE]/40">
              <div className="flex -space-x-2 shrink-0">
                <img
                  alt="Barista Dev"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FFFDF9] shadow-xs"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WV6RWPIjFvntpczrRXNQGAgCv6jiZm6ZofL2H7gzpwb9YQndqEm1igCzzF_O8GAB0jfCoPOJHm-mzf7PAP2OQeL3a2RNljKb5FPl7udu6w1ME21d1fV7rkGnsg2kQSY9QDsE3gp1bHbUpn_hHwOp-2QkZwUKEy2EKUXT3GBuXoEOnXtDWsraTwXGFT5XITUWwMx9ikaQoKYHtbeijLARfCtnLGox7tWYrW1EEm5efFz7yYw0YGOd4khbM"
                />
                <div className="w-12 h-12 rounded-full bg-[#ebe8e2] ring-2 ring-[#FFFDF9] flex items-center justify-center text-[#38271F] font-title-sm text-xs font-bold">
                  AN
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="font-label-sm text-[11px] uppercase tracking-wide text-[#C66B4E] font-bold">
                  Tasting Room Artisans
                </span>
                <h4 className="font-title-sm text-xs sm:text-sm text-[#38271F] font-bold">
                  Dev (Lead Brewer) &amp; Anita (Baker)
                </h4>
                <p className="font-body-sm text-[11px] text-[#6E5E55]">Station 2 • Indiranagar Sensory Bar</p>
              </div>
            </div>

            {/* QR Counter Scanner Container */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-[#f0eee8] text-center space-y-4 border border-[#E3DACE]/60">
              <div className="p-3 bg-white rounded-xl shadow-xs">
                {/* Clean inline SVG QR code */}
                <svg className="w-36 h-36 text-[#38271F]" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <rect fill="currentColor" height="28" rx="4" width="28" x="10" y="10" />
                  <rect fill="#FFFDF9" height="20" rx="2" width="20" x="14" y="14" />
                  <rect fill="currentColor" height="12" rx="1" width="12" x="18" y="18" />
                  <rect fill="currentColor" height="28" rx="4" width="28" x="62" y="10" />
                  <rect fill="#FFFDF9" height="20" rx="2" width="20" x="66" y="14" />
                  <rect fill="currentColor" height="12" rx="1" width="12" x="70" y="18" />
                  <rect fill="currentColor" height="28" rx="4" width="28" x="10" y="62" />
                  <rect fill="#FFFDF9" height="20" rx="2" width="20" x="14" y="66" />
                  <rect fill="currentColor" height="12" rx="1" width="12" x="18" y="70" />
                  <rect fill="currentColor" height="6" rx="1" width="6" x="44" y="12" />
                  <rect fill="currentColor" height="6" rx="1" width="4" x="52" y="12" />
                  <rect fill="currentColor" height="6" rx="1" width="12" x="44" y="24" />
                  <rect fill="currentColor" height="6" rx="1" width="6" x="46" y="34" />
                  <rect fill="currentColor" height="8" rx="1" width="8" x="12" y="44" />
                  <rect fill="currentColor" height="8" rx="1" width="8" x="24" y="44" />
                  <rect fill="currentColor" height="12" rx="1" width="6" x="36" y="44" />
                  <rect fill="currentColor" height="8" rx="1" width="8" x="46" y="46" />
                  <rect fill="currentColor" height="6" rx="1" width="10" x="60" y="44" />
                  <rect fill="currentColor" height="6" rx="1" width="14" x="74" y="44" />
                  <rect fill="currentColor" height="12" rx="1" width="6" x="62" y="54" />
                  <rect fill="currentColor" height="8" rx="1" width="8" x="72" y="54" />
                  <rect fill="currentColor" height="14" rx="1" width="6" x="84" y="54" />
                  <rect fill="currentColor" height="6" rx="1" width="12" x="44" y="62" />
                  <rect fill="currentColor" height="16" rx="1" width="6" x="44" y="72" />
                  <rect fill="currentColor" height="6" rx="1" width="10" x="54" y="74" />
                  <rect fill="currentColor" height="10" rx="1" width="10" x="68" y="70" />
                  <rect fill="currentColor" height="6" rx="1" width="8" x="62" y="84" />
                  <rect fill="currentColor" height="6" rx="1" width="16" x="74" y="84" />
                </svg>
              </div>
              <div>
                <p className="font-title-sm text-sm text-[#38271F] font-bold">Scan at Counter 2</p>
                <p className="font-body-sm text-xs text-[#6E5E55] mt-0.5">
                  Show this pass to your barista or scan for express bench pickup
                </p>
              </div>
            </div>

            {/* Assistance Row */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EFE9DF]">
              <div className="flex items-center gap-2 text-[#6E5E55] font-body-sm text-xs">
                <span className="material-symbols-outlined text-base text-[#C66B4E]">help_outline</span>
                <span>Need custom adjustments?</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToConcierge(`I have an update for order #${order.orderNumber}`)}
                className="font-label-md text-xs text-[#38271F] hover:text-[#C66B4E] transition-colors px-3 py-1.5 rounded-lg bg-[#ebe8e2] hover:bg-[#EFE9DF] cursor-pointer font-semibold"
              >
                Speak to Counter
              </button>
            </div>
          </div>

          {/* Origin Story Vignette */}
          <div className="bg-[#f6f3ed] rounded-2xl p-6 space-y-4 shadow-xs border border-[#E3DACE]/60">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs uppercase tracking-widest text-[#97472d] font-bold">
                Origin Vignette
              </span>
              <span className="font-label-sm text-xs text-[#6E5E55]">Chikmagalur, 1,650m</span>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-xs bg-[#ebe8e2]">
                <img
                  className="w-full h-full object-cover"
                  alt="Attikan Estate"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADCF1mN-E2SvOo5iPOW7OEVeokLggU_MVYXXz8Vbba_49AvZMGHJ-sVzSCXWaVQrk7TJ0erHvZCFY72DAQo7daSYf6zpru1k8cRae0-3uTMrc8lWPhNwRCmk1ok92JDfM_d7C8_fkSf4JQpvMk9n338V1LWCLoTusS9SqX4-Vk8kcBH-pS3y2wcSRVrpnnjeIVfqK12101UUHbtJPeOEIgXDV82I4mEgiLN3aFkZe7yX0uiFKv0xDj"
                />
              </div>
              <div>
                <h4 className="font-headline-sm text-base text-[#38271F] font-bold">Attikan Estate Yellow Honey</h4>
                <p className="font-body-sm text-xs text-[#6E5E55] mt-1 leading-snug">
                  Pulp dried with sweet fruit mucilage intact. Tasting profile yields sun-ripened fig, raw jaggery, and dark wild honey.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-[#38271F] font-label-md text-xs border-t border-[#E3DACE]/40">
              <span className="inline-flex items-center gap-1.5 text-[#7B8C70] font-bold">
                <span className="material-symbols-outlined text-base">eco</span>
                <span>100% Shade Grown &amp; Hand-Sorted</span>
              </span>
              <span className="text-[#C66B4E] font-bold">Lot #AK-24</span>
            </div>
          </div>
        </section>
      </div>

      {/* Interactive Bottom Actions Bar */}
      <section className="rounded-2xl bg-[#FFFDF9] p-6 lg:p-8 shadow-sm border border-[#E3DACE]/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="w-10 h-10 rounded-full bg-[#ffdbd0]/40 flex items-center justify-center text-[#C66B4E] shrink-0">
            <span className="material-symbols-outlined text-xl">smart_toy</span>
          </span>
          <div className="flex flex-col">
            <span className="font-title-sm text-sm text-[#38271F] font-bold">
              Have brewing or pairing inquiries?
            </span>
            <span className="font-body-sm text-xs text-[#6E5E55]">
              Ask our AI Concierge about water ratios, roasting notes, or estate history.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="font-label-md text-xs text-[#6E5E55] hover:text-[#38271F] transition-colors px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            <span>Download Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToConcierge('How is this roast extracted?')}
            className="font-label-md text-xs px-5 py-2.5 rounded-lg bg-[#ebe8e2] hover:bg-[#EFE9DF] text-[#38271F] transition-colors flex items-center gap-2 cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-base text-[#C66B4E]">chat_bubble</span>
            <span>Ask AI Concierge</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToDiscover}
            className="font-label-md text-xs px-6 py-2.5 rounded-lg bg-[#38271F] hover:bg-[#C66B4E] text-[#F8F5EF] transition-colors shadow-xs flex items-center gap-2 cursor-pointer font-semibold"
          >
            <span>Return to Discover</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};
