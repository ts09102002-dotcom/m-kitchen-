import React, { useState } from "react";
import { useStore } from "../store";
import { Button, Card, FormInput } from "./PremiumUI";
import { Gift, Plus, Trash2, Eye, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

export const DashboardOffers: React.FC = () => {
  // Zustand States
  const todaysOffers = useStore(state => state.todaysOffers);
  const saveOffer = useStore(state => state.saveOffer);
  const deleteOffer = useStore(state => state.deleteOffer);

  // States
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [animStyle, setAnimStyle] = useState<"pulse" | "shimmer" | "glow">("pulse");
  const [isActive, setIsActive] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    saveOffer({
      title,
      subtitle,
      animation_style: animStyle,
      is_active: isActive
    });

    setTitle("");
    setSubtitle("");
    setAnimStyle("pulse");
    setIsActive(true);
  };

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* HEADER SECTION */}
      <div className="border-b border-gold-rich/10 pb-4">
        <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
          <Gift className="w-5 h-5 text-gold-rich" />
          Today's Special Offers
        </h3>
        <p className="text-xs text-mocha mt-1">
          Draft promotional offers and announcements displayed live onto the customer-facing digital menu banner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Edit Banners (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
            Announce New Deal
          </h4>

          <form onSubmit={handleSave} className="space-y-4 bg-white p-5 rounded-2xl border border-gold-rich/10 shadow-sm">
            <FormInput
              label="Promo Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="eg. Royal Feast Bundle Discount"
              required
            />

            <FormInput
              label="Promo Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="eg. Flat 15% off using code..."
            />

            <div className="relative mb-5 font-sans">
              <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Animation Highlight Style</label>
              <select
                value={animStyle}
                onChange={(e) => setAnimStyle(e.target.value as any)}
                className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich bg-white"
              >
                <option value="pulse">Pulse Scaling Highlights</option>
                <option value="shimmer">Sweep Shimmer Stripes</option>
                <option value="glow">Perimeter Aura Glowing</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                id="activeOffer"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-maroon-royal focus:ring-gold-rich h-4 w-4 border-gold-rich/30 cursor-pointer"
              />
              <label htmlFor="activeOffer" className="text-xs text-mocha font-bold uppercase tracking-wider select-none cursor-pointer">
                Publish Active Live Immediately
              </label>
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full py-3 text-xs uppercase tracking-wider font-semibold"
            >
              <span>Publish Live Announcement</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Center / Right Columns: Listing and Visual Preview panes (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Dynamic Mirror Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-mocha flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-gold-rich" />
              Live Interactive Mirror (Mobile Feed Preview)
            </h4>
            
            <div className="p-4 bg-[#FAF7F2] border-2 border-dashed border-gold-rich/25 rounded-2xl max-w-sm">
              <span className="block text-[8px] text-mocha font-bold uppercase tracking-widest text-center mb-2">Simulated Customer Phone Display</span>
              
              {/* Mirrors how customer sees it */}
              {title.trim() ? (
                <div className={`p-4 rounded-xl bg-royal-gradient text-cream-ivory relative overflow-hidden shadow-lg border border-gold-rich/35 ${
                  animStyle === "pulse" ? "scale-98 hover:scale-100 transition-transform" :
                  animStyle === "glow" ? "animate-gold-glow" : ""
                }`}>
                  {animStyle === "shimmer" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F5DC8A]/25 to-transparent -translate-x-full animate-shimmer-sweep" />
                  )}
                  
                  <div className="flex gap-2.5 relative z-10">
                    <div className="h-8 w-8 bg-gold-gradient rounded-lg text-charcoal-deep flex items-center justify-center animate-pulse">
                      <Sparkles className="w-4 h-4 fill-current.5" />
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-gold-light font-bold">TODAY'S SPECIAL Announcement</span>
                      <h5 className="font-serif text-sm font-bold text-white">{title}</h5>
                      <p className="text-[10px] text-cream-warm mt-0.5 leading-snug">{subtitle}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-mocha italic bg-white border border-gold-rich/5 rounded-xl font-medium">
                  Types in details on the left form to preview banner layout.
                </div>
              )}
            </div>
          </div>

          {/* Active announcements directory list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
              Active Board Directory ({todaysOffers.length})
            </h4>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {todaysOffers.map(offer => (
                <Card key={offer.id} className="p-3 bg-white flex justify-between items-center border-gold-rich/10 gap-4">
                  <div className="flex gap-2.5 items-center">
                    <div className="p-2 rounded bg-gold-gradient text-charcoal-deep font-mono font-black text-xs">
                      {offer.animation_style.slice(0,3).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-espresso">{offer.title}</h5>
                      <p className="text-[10px] text-mocha">{offer.subtitle || "No subtitle announcement details."}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      offer.is_active ? "bg-success/15 text-success" : "bg-mocha/15 text-mocha"
                    }`}>
                      {offer.is_active ? "Live" : "Draft"}
                    </span>
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
