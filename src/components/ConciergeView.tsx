import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, ChatMessage, OrderPreview } from '../types/api.ts';
import { api } from '../client/api.ts';

interface ConciergeViewProps {
  initialPrompt?: string;
  cartItems: Array<{ item: MenuItem; quantity: number; customizations?: string[] }>;
  onAddToCart: (item: MenuItem, quantity?: number, customizations?: string[]) => void;
  onProceedToReview: () => void;
  showToast: (title: string, subtitle: string) => void;
}

export const ConciergeView: React.FC<ConciergeViewProps> = ({
  initialPrompt,
  cartItems,
  onAddToCart,
  onProceedToReview,
  showToast
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-greeting',
      role: 'model',
      authorName: 'Concierge Sravan',
      time: '09:41 AM',
      content:
        "Namaste & good morning! I'm your sensory concierge. Tell me your taste profile, dietary preferences, or exact mood, and I'll pair single-estate Indian roasts with freshly prepared bakery bites."
    }
  ]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isSending, setIsSending] = useState(false);
  const [maxBudget, setMaxBudget] = useState(200);
  const [sensoryTemp, setSensoryTemp] = useState('Cold / Iced');
  const [sweetnessLevel, setSweetnessLevel] = useState('Subtle (0–5%)');
  const [milkBase, setMilkBase] = useState('Oat Milk Special');
  const [isVegetarian, setIsVegetarian] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // If initial prompt provided, auto-trigger request
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && messages.length === 1) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      authorName: 'You • Table 04',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      content: textToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);

    try {
      // Build history
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Call API chat
      const response = await api.chatWithAgent(textToSend, history);

      // Also get recommendations if user asked for items
      let recommendedItems = response.recommendedItems;
      if (!recommendedItems || recommendedItems.length === 0) {
        const recs = await api.getRecommendations(textToSend, isVegetarian ? 'vegetarian' : undefined, maxBudget * 100);
        if (recs.recommendations.length > 0) {
          const fetchedItems = await Promise.all(
            recs.recommendations.map(r => api.getMenuItem(r.menuItemId).catch(() => null))
          );
          recommendedItems = fetchedItems.filter(Boolean) as MenuItem[];
        }
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        authorName: 'Concierge Sravan',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        content: response.reply,
        recommendedItems,
        orderPreview: response.orderPreview || undefined,
        toolsUsed: response.toolsUsed,
        fallbackUsed: response.fallbackUsed
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      // Graceful fallback message
      const recs = await api.getRecommendations(textToSend, undefined, maxBudget * 100);
      const fetchedItems = await Promise.all(
        recs.recommendations.map(r => api.getMenuItem(r.menuItemId).catch(() => null))
      );

      const botFallback: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'model',
        authorName: 'Concierge Sravan',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        content: "Splendid choice for this morning. Here are our freshest single-estate brews matching your palate:",
        recommendedItems: fetchedItems.filter(Boolean) as MenuItem[],
        fallbackUsed: true
      };
      setMessages(prev => [...prev, botFallback]);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddFromRecommendation = (item: MenuItem) => {
    onAddToCart(item);
    showToast(`Added: ${item.name}`, `₹${item.pricePaise / 100} • Added to Tasting Tray`);
  };

  // Cart calculations
  const cartSubtotalPaise = cartItems.reduce((acc, curr) => acc + curr.item.pricePaise * curr.quantity, 0);
  const cartGstPaise = Math.round(cartSubtotalPaise * 0.05);
  const cartTotalPaise = cartSubtotalPaise + (cartItems.length > 0 ? 2000 : 0) + cartGstPaise;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
      {/* Top Context & Sensor Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebe8e2] text-[#4f4540] font-label-sm text-xs uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
            <span>Conversational Tasting Room &amp; Sensory Matchmaker</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-[#38271F] tracking-tight font-bold">
            Artisanal Flavor Dialogue
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFFDF9] shadow-sm border border-[#E3DACE]/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7B8C70] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7B8C70]" />
            </span>
            <span className="font-label-md text-xs text-[#38271F] font-semibold">Cloud Run AI Concierge</span>
            <span className="text-[#6E5E55] text-xs">•</span>
            <span className="font-label-sm text-xs text-[#7B8C70] font-bold">Online (12ms)</span>
          </div>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Center: Concierge Dialogue Thread (8 cols) */}
        <section className="lg:col-span-8 flex flex-col space-y-6">
          {/* Messages Stream */}
          <div className="space-y-6">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : 'max-w-3xl'}`}
                >
                  {!isUser && (
                    <div className="w-9 h-9 rounded-full bg-[#38271F] text-[#F8F5EF] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <span className="material-symbols-outlined text-base">neurology</span>
                    </div>
                  )}

                  <div className={`space-y-2 flex-1 ${isUser ? 'flex flex-col items-end max-w-xl' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-title-sm text-xs font-semibold text-[#38271F]">
                        {msg.authorName || (isUser ? 'You • Table 04' : 'Concierge Sravan')}
                      </span>
                      <span className="font-label-sm text-[11px] text-[#6E5E55]">
                        {msg.time || 'Just now'}
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl p-5 shadow-sm text-sm ${
                        isUser
                          ? 'bg-[#38271F] text-[#F8F5EF] rounded-tr-sm'
                          : 'bg-[#FFFDF9] text-[#1c1c18] rounded-tl-sm border border-[#E3DACE]/60 space-y-3'
                      }`}
                    >
                      <p className="font-body-md text-xs sm:text-sm leading-relaxed">{msg.content}</p>

                      {!isUser && (
                        <div className="flex items-center gap-2 pt-1 text-[#6E5E55] font-label-sm text-[11px]">
                          <span className="material-symbols-outlined text-sm text-[#7B8C70]">verified</span>
                          <span>Direct estate inventory synced (Chikmagalur &amp; Nilgiris)</span>
                        </div>
                      )}

                      {/* Embedded Recommendation Cards if available */}
                      {msg.recommendedItems && msg.recommendedItems.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {msg.recommendedItems.map(item => (
                            <div
                              key={item.id}
                              className="group bg-[#fcf9f3] rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between border border-[#E3DACE]/80"
                            >
                              <div className="space-y-3">
                                <div className="relative w-full h-36 rounded-lg overflow-hidden bg-[#ebe8e2]">
                                  <img
                                    src={item.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtHSxzNZabW1cjQmBNeRZb7bRZwLyVuCLzaSyt8KbNRpfbpO2Mzi-0ewqaoZ69Dan03IJS6SOamjFKG32Ta9xR-DdAYNTS2WQPHYCFCWXBmgWBuM88g8_Y6OM42x8cIc-Qj85YGRU4IK_UuOgewehyd1avaGFuKIJt7npUNDFBMJhdTmCoNVCKYXobnzjWzJr2srHLBsObCsZn2h2C_Pn3IFFsF49wTqk3iWPpV1hda9_MF50nPPSQ'}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#38271F]/80 backdrop-blur-md text-[#F8F5EF] font-label-sm text-[10px]">
                                    {item.tags[0]?.toUpperCase() || 'SPECIALTY'}
                                  </span>
                                </div>

                                <div>
                                  <div className="flex items-baseline justify-between gap-2">
                                    <h4 className="font-title-sm text-sm text-[#38271F] font-semibold leading-snug">
                                      {item.name}
                                    </h4>
                                    <span className="font-price-md text-sm text-[#C66B4E] font-bold shrink-0">
                                      ₹{item.pricePaise / 100}
                                    </span>
                                  </div>
                                  <p className="font-label-sm text-[11px] text-[#6E5E55] mt-0.5">
                                    {item.roastOrigin || 'Single Origin Micro-Lot'}
                                  </p>
                                </div>

                                <p className="font-body-sm text-xs text-[#4f4540] line-clamp-2">
                                  {item.description}
                                </p>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  <span className="px-2 py-0.5 rounded-md bg-[#ebe8e2] font-label-sm text-[10px] text-[#38271F]">
                                    Zero Refined Sugar
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-[#d6e8c8] text-[#3c4b33] font-label-sm text-[10px] font-bold">
                                    In Budget
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddFromRecommendation(item)}
                                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#38271F] text-[#F8F5EF] hover:bg-[#C66B4E] transition-colors font-label-md text-xs shadow-xs font-semibold cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">add</span>
                                <span>Add to Tray • ₹{item.pricePaise / 100}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-9 h-9 rounded-full bg-[#ebe8e2] flex items-center justify-center shrink-0 shadow-sm text-[#38271F] font-label-md text-xs font-bold mt-0.5">
                      AM
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start gap-3.5 max-w-xl">
                <div className="w-9 h-9 rounded-full bg-[#38271F] text-[#F8F5EF] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <span className="material-symbols-outlined text-base animate-spin">autorenew</span>
                </div>
                <div className="bg-[#FFFDF9] rounded-2xl p-4 shadow-sm border border-[#E3DACE]/60 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C66B4E] animate-ping" />
                  <span className="text-xs text-[#6E5E55]">
                    Concierge Sravan is curating harvest notes with Gemini...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested Inquiries Rail */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs text-[#6E5E55] uppercase tracking-wider">
                Suggested Inquiries
              </span>
              <span className="font-label-sm text-xs text-[#C66B4E] font-semibold">Tap to ask</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Pair with a light breakfast', icon: 'bakery_dining', prompt: 'I want a light breakfast pairing for cold brew' },
                { label: 'Make it dairy-free', icon: 'eco', prompt: 'What dairy-free or oat milk iced coffees do you recommend?' },
                { label: 'Show single-origin pour-overs', icon: 'coffee_maker', prompt: 'Tell me about your single-origin pour-over selections' }
              ].map(chip => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="px-3.5 py-1.5 rounded-full bg-[#FFFDF9] hover:bg-[#EFE9DF] text-[#38271F] font-label-md text-xs shadow-xs transition-colors flex items-center gap-1.5 border border-[#E3DACE]/60 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-[#C66B4E]">{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMessages([messages[0]]);
                  showToast('Reset Preferences', 'Flavor dialogue history cleared.');
                }}
                className="px-3 py-1.5 rounded-full bg-[#ebe8e2] hover:bg-[#e5e2dc] text-[#4f4540] font-label-sm text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">restart_alt</span>
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Input Composer */}
          <div className="bg-[#FFFDF9] rounded-2xl p-3 shadow-md border border-[#E3DACE]/80 space-y-2">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => {
                  setInputText('What is something refreshing and low-sugar under ₹200?');
                }}
                aria-label="Preset prompt"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#6E5E55] hover:text-[#38271F] hover:bg-[#ebe8e2] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type your craving or taste preference..."
                className="flex-1 bg-transparent border-0 outline-none font-body-md text-sm text-[#38271F] placeholder:text-[#6E5E55]/60 px-2"
              />

              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                aria-label="Send message"
                className="h-10 px-4 rounded-xl bg-[#C66B4E] hover:bg-[#97472d] text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs font-label-md text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-base">near_me</span>
              </button>
            </form>

            <div className="flex items-center justify-between px-2 pt-1 font-label-sm text-[11px] text-[#6E5E55]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#7B8C70]">auto_awesome</span>
                <span>Powered by Gemini 3.8 Flash • Menu synced in real-time</span>
              </span>
              <span className="hidden sm:inline">Press Enter to chat</span>
            </div>
          </div>
        </section>

        {/* Right Aside: Tasting Profile & Order Panel (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col space-y-6">
          <div className="flex items-center justify-between pb-1">
            <h2 className="font-headline-sm text-lg text-[#38271F] font-semibold">
              Your Tasting Profile &amp; Order
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFFDF9] font-label-sm text-xs text-[#6E5E55] shadow-xs border border-[#E3DACE]/60">
              Live Context
            </span>
          </div>

          {/* Active Sensory Filter Card */}
          <div className="bg-[#FFFDF9] rounded-2xl p-5 shadow-sm border border-[#E3DACE]/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-title-sm text-sm text-[#38271F] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#C66B4E]">tune</span>
                Active Sensory Filter
              </span>
              <button
                onClick={() => {
                  setSensoryTemp(sensoryTemp.includes('Cold') ? 'Hot / Manual Drip' : 'Cold / Iced');
                  showToast('Filter Updated', `Serving temperature set to ${sensoryTemp}`);
                }}
                className="text-[#C66B4E] font-label-sm text-xs hover:underline cursor-pointer font-semibold"
              >
                Toggle
              </button>
            </div>

            <div className="space-y-3 font-body-sm text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#E3DACE]/30">
                <span className="text-[#6E5E55]">Serving Temperature</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ebe8e2] text-[#38271F] font-label-md text-xs font-semibold">
                  <span className="material-symbols-outlined text-xs text-[#97472d]">ac_unit</span>
                  {sensoryTemp}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E3DACE]/30">
                <span className="text-[#6E5E55]">Sweetness Degree</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ebe8e2] text-[#38271F] font-label-md text-xs font-semibold">
                  {sweetnessLevel}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E3DACE]/30">
                <span className="text-[#6E5E55]">Milk Base</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ebe8e2] text-[#38271F] font-label-md text-xs font-semibold">
                  {milkBase}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#6E5E55]">Dietary Classification</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d6e8c8] text-[#3c4b33] font-label-sm text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7B8C70]" />
                  {isVegetarian ? '100% Vegetarian' : 'Custom'}
                </span>
              </div>
            </div>
          </div>

          {/* Budget Guard Indicator */}
          <div className="bg-[#FFFDF9] rounded-2xl p-5 shadow-sm border border-[#E3DACE]/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#7B8C70]">payments</span>
                <span className="font-title-sm text-sm text-[#38271F] font-semibold">Budget Guard</span>
              </div>
              <span className="font-label-md text-xs text-[#38271F] font-bold">₹{maxBudget} max / drink</span>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-[#f0eee8] overflow-hidden p-0.5">
                <div className="h-full rounded-full bg-[#7B8C70] transition-all duration-700" style={{ width: '87.5%' }} />
              </div>
              <div className="flex items-center justify-between text-[#6E5E55] font-label-sm text-[11px]">
                <span>Selected match: ₹175</span>
                <span className="text-[#7B8C70] font-bold">₹25 buffer left</span>
              </div>
            </div>
          </div>

          {/* Active Tasting Tray / Quick Cart */}
          <div className="bg-[#FFFDF9] rounded-2xl p-5 shadow-sm border border-[#E3DACE]/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-title-sm text-sm text-[#38271F] font-semibold">Tasting Tray</span>
                <span className="w-5 h-5 rounded-full bg-[#ebe8e2] text-[#38271F] font-label-sm text-xs flex items-center justify-center font-bold">
                  {cartItems.reduce((acc, c) => acc + c.quantity, 0)}
                </span>
              </div>
              <span className="font-label-sm text-xs text-[#6E5E55]">Table 04 Express</span>
            </div>

            {/* Tray Items */}
            <div className="space-y-3">
              {cartItems.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#f6f3ed] text-center text-xs text-[#6E5E55]">
                  Your tray is currently empty. Ask the concierge or explore the seasonal carte to add items.
                </div>
              ) : (
                cartItems.map((cartItem, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-[#f6f3ed]">
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-title-sm text-xs text-[#38271F] font-semibold truncate">
                        {cartItem.item.name}
                      </h4>
                      <p className="font-body-sm text-[11px] text-[#6E5E55]">
                        {cartItem.customizations?.[0] || 'Single Estate Harvest'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-price-md text-xs text-[#38271F] font-bold">
                        ₹{(cartItem.item.pricePaise * cartItem.quantity) / 100}
                      </span>
                      <span className="block font-label-sm text-[10px] text-[#6E5E55]">Qty: {cartItem.quantity}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Breakdown */}
            {cartItems.length > 0 && (
              <>
                <div className="pt-2 space-y-1.5 font-body-sm text-xs border-t border-[#E3DACE]/40">
                  <div className="flex items-center justify-between text-[#6E5E55]">
                    <span>Item Subtotal</span>
                    <span className="text-[#38271F] font-medium">₹{cartSubtotalPaise / 100}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#6E5E55]">
                    <span>Fair-Trade &amp; GST (5%)</span>
                    <span className="text-[#38271F] font-medium">₹{(2000 + cartGstPaise) / 100}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E3DACE]/40">
                    <span className="font-title-md text-sm text-[#38271F] font-bold">Total Amount</span>
                    <span className="font-price-lg text-base text-[#C66B4E] font-bold">
                      ₹{cartTotalPaise / 100}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onProceedToReview}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#C66B4E] hover:bg-[#97472d] text-white font-title-sm text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-xs font-semibold cursor-pointer group"
                >
                  <span>Review in Smart Order</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </>
            )}
          </div>

          {/* System Resilience Banner */}
          <div className="p-4 rounded-xl bg-[#ebe8e2] text-[#4f4540] space-y-1.5 border border-[#E3DACE]/40">
            <div className="flex items-center gap-2 text-[#38271F] font-label-md text-xs font-semibold">
              <span className="material-symbols-outlined text-sm text-[#7B8C70]">cloud_done</span>
              <span>Zero-Latency Offline Fallback</span>
            </div>
            <p className="font-body-sm text-[11px] text-[#6E5E55] leading-relaxed">
              Offline fallback available: All recommendations link directly to physical kitchen inventory without latency.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
