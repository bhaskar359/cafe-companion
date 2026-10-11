import React, { useState } from 'react';
import { MenuItem } from '../types/api.ts';

interface DiscoverViewProps {
  menuItems: MenuItem[];
  loading: boolean;
  onAddToCart: (item: MenuItem, quantity?: number, customizations?: string[]) => void;
  onAddPairing: (item1Name: string, item2Name: string, totalRupees: number) => void;
  onNavigateToConcierge: (initialPrompt?: string) => void;
  showToast: (title: string, subtitle: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  menuItems,
  loading,
  onAddToCart,
  onAddPairing,
  onNavigateToConcierge,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedItemIds, setAddedItemIds] = useState<{ [id: string]: boolean }>({});

  const handleAskConcierge = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onNavigateToConcierge(searchQuery.trim() || undefined);
  };

  const handlePromptChipClick = (prompt: string) => {
    setSearchQuery(prompt);
    onNavigateToConcierge(prompt);
  };

  const handleAddItem = (item: MenuItem) => {
    onAddToCart(item);
    setAddedItemIds(prev => ({ ...prev, [item.id]: true }));
    showToast(`Added: ${item.name}`, `₹${item.pricePaise / 100} • Synced with barista queue`);
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  // Filtered menu items
  const filteredItems = menuItems.filter(item => {
    // Category match
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'vegan') {
        if (!item.tags.includes('vegan') && item.category !== 'vegan') return false;
      } else if (item.category !== selectedCategory) {
        return false;
      }
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTag = item.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-6 lg:px-12 pt-8 pb-14">
        <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-[#ffdbd0]/30 blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#d6e8c8]/30 blur-3xl pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#ebe8e2] text-[#38271F] shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E] animate-pulse" />
            <span className="font-label-sm text-xs uppercase tracking-widest text-[#38271F] font-semibold">
              Artisanal Estate Roasts &amp; Chef's Kitchen
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display-hero text-[#38271F] tracking-tight max-w-4xl mx-auto">
            Your next favourite, <span className="italic font-normal text-[#97472d]">just a conversation</span> away.
          </h1>

          {/* Subtitle */}
          <p className="font-body-lg text-[#6E5E55] max-w-2xl mx-auto mt-5 text-base sm:text-lg">
            Handcrafted single-origin coffees from Chikmagalur estates, small-batch spiced chais, and fresh Indian bakery bites — paired with an AI concierge attuned to your exact sensory taste.
          </p>

          {/* AI Search Box */}
          <form onSubmit={handleAskConcierge} className="w-full max-w-3xl mt-9">
            <div className="relative flex items-center p-2 rounded-2xl bg-[#FFFDF9] shadow-md hover:shadow-lg transition-shadow duration-200 border border-[#E3DACE]/60">
              <div className="flex items-center pl-4 pr-3 text-[#97472d] pointer-events-none">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="What are you craving today? (e.g. 'light roast with oat milk under ₹200')"
                className="w-full bg-transparent font-body-md text-[#38271F] placeholder:text-[#6E5E55]/60 focus:outline-none py-3 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#38271F] text-[#F8F5EF] font-title-sm text-sm hover:bg-[#97472d] transition-colors duration-200 shadow-sm cursor-pointer"
              >
                <span>Ask Concierge</span>
                <span className="material-symbols-outlined text-base text-[#d6e8c8]">arrow_forward</span>
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
              <span className="font-label-sm text-xs uppercase tracking-wider text-[#6E5E55] mr-1">
                Quick Inquiries:
              </span>
              {[
                'Something under ₹200',
                'Not too sweet',
                'High-protein snacks',
                'Surprise me',
                'Pour-over Single Origin'
              ].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handlePromptChipClick(chip)}
                  className="px-3.5 py-1.5 rounded-full bg-[#ebe8e2] text-[#38271F] font-label-md text-xs hover:bg-[#38271F] hover:text-[#F8F5EF] transition-colors duration-150 cursor-pointer shadow-xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Editorial Split: Micro Curations & Harvest Stats */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* AI Personalized Recommendation Card */}
          <div className="lg:col-span-8 bg-[#FFFDF9] rounded-2xl p-6 lg:p-8 shadow-sm border border-[#E3DACE]/60 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-[#ffb59e]/20 blur-2xl pointer-events-none" />
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d6e8c8] text-[#3c4b33] font-label-sm text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  <span>AI Curation for Morning Energy • Live Harvest</span>
                </div>
                <span className="font-label-md text-xs text-[#6E5E55]">Matched for you 98%</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Pairing Item 1 */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-[#f6f3ed] hover:bg-[#ebe8e2] transition-colors">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#ebe8e2]">
                    <img
                      className="w-full h-full object-cover"
                      alt="Monsooned Malabar Cold Brew"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPee7Rtc_EmjPFFMNa0mxR1dh1gRaRS3TMOqyZGDZcO8LchDpCzOWN1hIhTD7GrwETD-k_u4T3HLsp2mvnH5JYafe6NJ9LIGekABlVdEmel-sQUejdY873L9jku2wmA5KkhQ3vnFGQqoB6X7n95jkxlXXA0OqfJjqDRa4fsxq4JVjTvzAufoIv-C6vLyus9x_lMdm1syQ6iYpFzExZrHebass9KCytXIKKww7gR2nKaxvK9aApwvYK"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-sm text-sm text-[#38271F] font-semibold truncate">
                      Monsooned Malabar Cold Brew
                    </span>
                    <span className="font-body-sm text-xs text-[#6E5E55]">18h Dutch Drip · Malabar Coast</span>
                    <span className="font-price-md text-sm text-[#C66B4E] font-bold mt-1">₹210</span>
                  </div>
                </div>

                {/* Pairing Item 2 */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-[#f6f3ed] hover:bg-[#ebe8e2] transition-colors">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#ebe8e2]">
                    <img
                      className="w-full h-full object-cover"
                      alt="Cardamom Pistachio Croissant"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuASZO8InaIDYadSKseEtIOkqCNUUi7hFfYixQt3h7pUTcg5GzL5DgzyrfGMm1mrKMoDVz1KdIc8cXNpRj-nNJlKF-bTFjwujLiJK40EvPGR4mWCTM9p0_1zaswwjadK9cRD5WuQmDPpor0eCPtpoiJdr1iGD0vboxodpger6MIjB56Ro3wEvGvoD5lYz8DkO8mM2YjH1mmCihMrCQdc3hpmwpGdbZVNrsI_dKujKCE0luwZaBq3brL-"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-sm text-sm text-[#38271F] font-semibold truncate">
                      Cardamom Pistachio Croissant
                    </span>
                    <span className="font-body-sm text-xs text-[#6E5E55]">Pure butter sourdough lamination</span>
                    <span className="font-price-md text-sm text-[#C66B4E] font-bold mt-1">₹160</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f6f3ed]/80 px-4 py-3 rounded-xl border border-[#E3DACE]/40">
              <div className="flex items-start sm:items-center gap-2">
                <span className="material-symbols-outlined text-[#7B8C70] text-lg mt-0.5 sm:mt-0">lightbulb</span>
                <p className="font-body-sm text-xs text-[#38271F]">
                  <span className="font-semibold text-[#38271F]">Why this pair:</span> Low natural acidity with gentle nutty sweetness calibrated for a refreshing, non-jittery morning focus.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAddPairing('Monsooned Malabar Cold Brew', 'Cardamom Pistachio Croissant', 370)}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#C66B4E] text-white font-title-sm text-xs hover:bg-[#97472d] transition-colors cursor-pointer font-semibold shadow-xs"
              >
                <span>Order Pair · ₹370</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Roastery Sensoric Spotlight */}
          <div className="lg:col-span-4 bg-[#38271f] text-[#f6f3ed] rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs uppercase tracking-widest text-[#a68d82]">
                  Chikmagalur Micro-Lot
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ffdbd0] text-[#38271F] font-label-sm text-xs font-bold">
                  Cupping: 87.2
                </span>
              </div>
              <h2 className="font-headline-sm text-xl text-[#FFFDF9] leading-tight font-semibold">
                Attikan Estate Yellow Honey Process
              </h2>
              <p className="font-body-sm text-xs text-[#a68d82] mt-2">
                Sun-dried at 1,650m elevation. Roasted in 4kg drum batches yesterday evening by Master Roaster Dev.
              </p>
              
              {/* Sensory Mini Radar */}
              <div className="mt-6 flex items-center justify-around py-3 px-2 rounded-xl bg-[#21130c]/60">
                <div className="text-center">
                  <span className="block font-label-sm text-[10px] text-[#a68d82] uppercase">Body</span>
                  <span className="font-title-sm text-sm text-[#FFFDF9] font-bold">4.5 / 5</span>
                </div>
                <div className="w-px h-8 bg-[#a68d82]/30" />
                <div className="text-center">
                  <span className="block font-label-sm text-[10px] text-[#a68d82] uppercase">Acidity</span>
                  <span className="font-title-sm text-sm text-[#FFFDF9] font-bold">2.0 / 5</span>
                </div>
                <div className="w-px h-8 bg-[#a68d82]/30" />
                <div className="text-center">
                  <span className="block font-label-sm text-[10px] text-[#a68d82] uppercase">Roast</span>
                  <span className="font-title-sm text-sm text-[#FFFDF9] font-bold">Medium</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-[#a68d82] pt-4 border-t border-[#a68d82]/20">
              <span className="font-label-sm text-xs">Next roast batch starts in 2h 45m</span>
              <span className="material-symbols-outlined text-[#ff9878] text-lg">local_fire_department</span>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Category Filter Tabs */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4">
          <div>
            <span className="font-label-sm text-xs uppercase tracking-widest text-[#6E5E55]">Seasonal Carte</span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl text-[#38271F] mt-1 font-bold">Explore the Menu</h2>
          </div>
          <span className="font-body-sm text-xs text-[#6E5E55]">
            Showing {filteredItems.length} house-crafted recipes • Mysore &amp; Kodagu beans
          </span>
        </div>

        {/* Category Nav Buttons */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Curations' },
            { id: 'specialty', label: 'Specialty Coffee' },
            { id: 'chai', label: 'Artisanal Chai & Coolers' },
            { id: 'bakery', label: 'Bakery & Sourdough' },
            { id: 'small-plates', label: 'Indian Small Plates' },
            { id: 'vegan', label: 'Vegan & Low Sugar' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full font-title-sm text-xs sm:text-sm whitespace-nowrap transition-all duration-150 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#38271F] text-[#F8F5EF] shadow-sm font-semibold'
                  : 'bg-[#ebe8e2] text-[#38271F] hover:bg-[#e5e2dc]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Menu Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full mb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-[#FFFDF9] rounded-2xl h-80 animate-pulse border border-[#E3DACE]/60 p-6 flex flex-col justify-between">
                <div className="w-full h-40 bg-[#ebe8e2] rounded-xl" />
                <div className="space-y-2 mt-4">
                  <div className="h-5 bg-[#ebe8e2] rounded w-3/4" />
                  <div className="h-4 bg-[#ebe8e2] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-2xl p-12 text-center border border-[#E3DACE]/60 max-w-xl mx-auto space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#C66B4E]">search_off</span>
            <h3 className="font-headline-sm text-lg text-[#38271F] font-semibold">No menu items match your search</h3>
            <p className="font-body-sm text-xs text-[#6E5E55]">
              Try searching for "cold", "pour over", "croissant" or clear the filter to see all our artisanal roasts.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#38271F] text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => {
              const isAdded = !!addedItemIds[item.id];
              return (
                <article
                  key={item.id}
                  className="bg-[#FFFDF9] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-[#E3DACE]/60"
                >
                  <div>
                    <div className="relative w-full h-56 overflow-hidden bg-[#ebe8e2]">
                      <img
                        src={item.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIKA2bS52C7_sunXUmE9hNU_PybIy3l8UZ9pYR2khccjAFOpani9NNrTj7FMi7U7ZR5xXAr2OlPITVmv3WxMmvGIHZEjs2qMNHEoH_NIU2ew06Uzk9djJrUDAF0qUCgYuMERqO540m9D-OVhEHT3MK2zWJOyzilSnYHbuIOxJzWhDjeWIi5P7g47E3d7e1Uchu0xYYVRwtm-Y62h5ROKbz_dLhX04P9vQPZ_h9KMLUWYlCFb5R5E3'}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-semibold shadow-xs ${
                              tag === 'house-favorite' || tag === 'chefs-pick'
                                ? 'bg-[#97472d] text-white'
                                : tag === 'vegan'
                                ? 'bg-[#7B8C70] text-white'
                                : 'bg-[#FFFDF9]/90 text-[#38271F] backdrop-blur-md'
                            }`}
                          >
                            {tag.replace('-', ' ').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-headline-sm text-lg text-[#38271F] leading-snug font-semibold">
                        {item.name}
                      </h3>
                      {item.roastOrigin && (
                        <span className="font-label-sm text-[11px] text-[#C66B4E] block mt-0.5 font-medium">
                          {item.roastOrigin}
                        </span>
                      )}
                      <p className="font-body-sm text-xs text-[#6E5E55] mt-2 line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[#E3DACE]/30">
                    <span className="font-price-lg text-lg text-[#38271F] font-bold">
                      ₹{item.pricePaise / 100}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddItem(item)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-title-sm text-xs transition-all cursor-pointer font-semibold shadow-xs ${
                        isAdded
                          ? 'bg-[#7B8C70] text-white'
                          : 'bg-[#38271F] text-[#F8F5EF] hover:bg-[#97472d] active:scale-95'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {isAdded ? 'check' : 'add'}
                      </span>
                      <span>{isAdded ? 'Added' : 'Add'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* AI Companion Banner / Value Proposition */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full mb-16">
        <div className="bg-[#f0eee8] rounded-3xl p-8 lg:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden border border-[#E3DACE]/80">
          <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#d6e8c8]/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-[#ffb59e]/20 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-6 z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#38271F] text-[#d6e8c8] flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-3xl">chat_spark</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ebe8e2] text-[#38271F] font-label-sm text-xs mb-1.5 font-medium">
                <span>Conversational Ordering</span>
              </div>
              <h3 className="font-headline-sm text-xl text-[#38271F] font-bold leading-snug">
                Dietary restrictions or tight for time?
              </h3>
              <p className="font-body-md text-xs sm:text-sm text-[#6E5E55] mt-1 max-w-xl">
                Talk to our AI Concierge directly. Tell us if you're keto, dairy-free, running between meetings, or want beans roasted within 48 hours.
              </p>
            </div>
          </div>

          <div className="shrink-0 z-10 w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToConcierge()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#38271F] text-[#F8F5EF] font-title-sm text-sm hover:bg-[#97472d] transition-colors duration-200 shadow-md text-center cursor-pointer font-semibold"
            >
              <span>Chat with Concierge</span>
              <span className="material-symbols-outlined text-lg">forum</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
