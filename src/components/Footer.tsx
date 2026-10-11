import React from 'react';

interface FooterProps {
  onNavigate: (tab: 'discover' | 'menu' | 'ai-concierge' | 'my-order' | 'order-status') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#f6f3ed] mt-auto py-12 border-t border-[#E3DACE]/60 shadow-[0_-1px_6px_rgba(56,39,31,0.02)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
          <div className="space-y-2">
            <h3 className="font-headline-sm text-lg text-[#38271F] font-semibold">Tasting Rooms &amp; Hours</h3>
            <p className="font-body-sm text-xs text-[#6E5E55]">Indiranagar, Bangalore: 07:30 – 22:30 IST</p>
            <p className="font-body-sm text-xs text-[#6E5E55]">Pali Hill, Bandra (W), Mumbai: 08:00 – 23:00 IST</p>
            <p className="font-body-sm text-xs text-[#6E5E55]">Pour-over lab &amp; micro-roastery active daily.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-headline-sm text-lg text-[#38271F] font-semibold">Artisanal Philosophy</h3>
            <p className="font-body-sm text-xs text-[#6E5E55]">
              Direct-trade single estates from Chikmagalur, Shevaroys, and Araku Valley. Roasted in small sensory batches.
            </p>
            <p className="font-label-md text-xs text-[#38271F] pt-1">
              © 2025 Café Companion Pvt Ltd. Craft Indian Specialty.
            </p>
          </div>
          <div className="space-y-3 flex flex-col md:items-end justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebe8e2]">
              <span className="w-2 h-2 rounded-full bg-[#7B8C70] animate-pulse" />
              <span className="font-label-sm text-xs text-[#38271F]">
                Cloud Run AI Concierge • Operational (18ms)
              </span>
            </div>
            <span className="font-body-sm text-xs text-[#6E5E55] md:text-right">
              Intelligent harvest notes &amp; real-time barista queue synced
            </span>
          </div>
        </div>
        <div className="pt-6 border-t border-[#E3DACE]/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-label-sm text-xs text-[#6E5E55]">
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('discover')} className="hover:text-[#38271F] transition-colors cursor-pointer">
              Discover
            </button>
            <button onClick={() => onNavigate('menu')} className="hover:text-[#38271F] transition-colors cursor-pointer">
              Seasonal Menu
            </button>
            <button onClick={() => onNavigate('ai-concierge')} className="hover:text-[#38271F] transition-colors cursor-pointer">
              Estates &amp; Origins
            </button>
            <button onClick={() => onNavigate('discover')} className="hover:text-[#38271F] transition-colors cursor-pointer">
              Manual Brew Guide
            </button>
          </div>
          <span>Single Origin Roasts • Specialty Grade 84+</span>
        </div>
      </div>
    </footer>
  );
};
