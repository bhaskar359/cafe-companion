import React from 'react';

interface HeaderProps {
  activeTab: 'discover' | 'menu' | 'ai-concierge' | 'my-order' | 'order-status';
  setActiveTab: (tab: 'discover' | 'menu' | 'ai-concierge' | 'my-order' | 'order-status') => void;
  cartItemCount: number;
  cartTotalRupees: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartItemCount,
  cartTotalRupees,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#F8F5EF]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(56,39,31,0.05)] border-b border-[#E3DACE]/40">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
        {/* Brand logo */}
        <button
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-3 shrink-0 text-left cursor-pointer group"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ebe8e2] text-[#38271F] shadow-[0_1px_4px_rgba(56,39,31,0.06)] group-hover:bg-[#C66B4E] group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-lg">coffee</span>
          </span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-[22px] text-[#38271F] tracking-tight leading-none">
              Café Companion
            </span>
            <span className="font-label-sm text-[11px] text-[#6E5E55] uppercase tracking-widest leading-none mt-1">
              Specialty Roastery • Bharat
            </span>
          </div>
        </button>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-title-sm text-sm">
          <button
            onClick={() => setActiveTab('discover')}
            className={`py-1 cursor-pointer transition-colors ${
              activeTab === 'discover'
                ? 'text-[#C66B4E] font-semibold border-b-2 border-[#C66B4E]'
                : 'text-[#4f4540] hover:text-[#1c1c18]'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-1 cursor-pointer transition-colors ${
              activeTab === 'menu'
                ? 'text-[#C66B4E] font-semibold border-b-2 border-[#C66B4E]'
                : 'text-[#4f4540] hover:text-[#1c1c18]'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('ai-concierge')}
            className={`py-1 cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'ai-concierge'
                ? 'text-[#C66B4E] font-semibold border-b-2 border-[#C66B4E]'
                : 'text-[#4f4540] hover:text-[#1c1c18]'
            }`}
          >
            AI Concierge
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#d6e8c8] text-[#3c4b33] font-label-sm text-[10px] leading-none font-bold">
              AI
            </span>
          </button>
          <button
            onClick={() => setActiveTab('my-order')}
            className={`py-1 cursor-pointer transition-colors inline-flex items-center gap-2 ${
              activeTab === 'my-order'
                ? 'text-[#C66B4E] font-semibold'
                : 'text-[#4f4540] hover:text-[#1c1c18]'
            }`}
          >
            My Order
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#ebe8e2] text-[#38271F] font-label-md text-xs shadow-[0_1px_3px_rgba(56,39,31,0.04)] font-medium">
              {cartItemCount > 0
                ? `${cartItemCount} item${cartItemCount > 1 ? 's' : ''} · ₹${cartTotalRupees}`
                : 'Tray Empty'}
            </span>
          </button>
        </nav>

        {/* Right profile / Search */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('ai-concierge')}
            aria-label="Search drinks and roasts"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#4f4540] hover:text-[#1c1c18] hover:bg-[#f0eee8] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <div className="relative flex items-center cursor-pointer" title="Estate Guest #04">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#38271F]/20"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WV6RWPIjFvntpczrRXNQGAgCv6jiZm6ZofL2H7gzpwb9YQndqEm1igCzzF_O8GAB0jfCoPOJHm-mzf7PAP2OQeL3a2RNljKb5FPl7udu6w1ME21d1fV7rkGnsg2kQSY9QDsE3gp1bHbUpn_hHwOp-2QkZwUKEy2EKUXT3GBuXoEOnXtDWsraTwXGFT5XITUWwMx9ikaQoKYHtbeijLARfCtnLGox7tWYrW1EEm5efFz7yYw0YGOd4khbM"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#7B8C70] ring-2 ring-[#F8F5EF]" />
          </div>
        </div>
      </div>
    </header>
  );
};
