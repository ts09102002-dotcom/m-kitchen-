import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { TableStatus, OrderItemStatus } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  MaharajiLogo, 
  Button, 
  Card, 
  VoiceSearchMic, 
  EmptyState 
} from "./PremiumUI";
import { ShoppingBag, Plus, Minus, Percent, Check, Clock, ChevronUp, ChevronDown, Lock, Sparkles, Flame, UtensilsCrossed, Beef, Croissant, Candy, HelpCircle, Search } from "lucide-react";

// Helper to match category icons accurately
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case "Flame": return <Flame className="w-4 h-4" />;
    case "UtensilsCrossed": return <UtensilsCrossed className="w-4 h-4" />;
    case "Beef": return <Beef className="w-4 h-4" />;
    case "Croissant": return <Croissant className="w-4 h-4" />;
    case "Candy": return <Candy className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
  }
};

export const CustomerInterface: React.FC<{ currentTableNum?: number }> = ({ currentTableNum }) => {
  const tableNum = currentTableNum || (new URLSearchParams(window.location.search).get("table") ? parseInt(new URLSearchParams(window.location.search).get("table")!, 10) : NaN);

  // Store variables
  const tables = useStore(state => state.tables);
  const menuItems = useStore(state => state.menuItems);
  const categories = useStore(state => state.categories);
  const orders = useStore(state => state.orders);
  const orderItems = useStore(state => state.orderItems);
  const todaysOffers = useStore(state => state.todaysOffers);
  const coupons = useStore(state => state.coupons);
  const addOrder = useStore(state => state.addOrder);
  const addPendingItems = useStore(state => state.addPendingItems);
  const validateCoupon = useStore(state => state.validateCoupon);

  // Local UI states
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartExpanded, setIsCartExpanded] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Validate Table Existence
  const targetTable = tables.find(t => t.table_number === tableNum);

  // Scroll category active states dynamically
  useEffect(() => {
    if (categories.length > 0 && activeCategory === "all") {
      setActiveCategory("all");
    }
  }, [categories, activeCategory]);

  if (isNaN(tableNum) || tableNum < 1 || tableNum > 20 || !targetTable) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream-soft text-center font-sans">
        <MaharajiLogo size="lg" />
        <Card className="mt-8 max-w-sm border-danger/30">
          <Lock className="w-12 h-12 text-danger mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-maroon-royal mb-2">Invalid Table</h2>
          <p className="text-sm text-mocha mb-4">
            Please scan the official Maharaji QR code placed on your dining table to access our royal menu.
          </p>
        </Card>
      </div>
    );
  }

  // 1. Check Table State: If LOCKED, blocks user with full-screen premium locked display
  if (targetTable.status === TableStatus.LOCKED || targetTable.status === TableStatus.CLOSED) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream-soft text-center font-sans">
        <MaharajiLogo size="lg" />
        <div className="mt-8 relative max-w-md w-full scale-100 transition-all duration-500">
          <Card className="bg-white/80 backdrop-blur-md border border-gold-rich/30 shadow-2xl p-8 overflow-hidden rounded-3xl">
            {/* Indian Imperial Ornament */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-royal-gradient" />
            <div className="w-20 h-20 rounded-full bg-cream-warm/40 flex items-center justify-center mx-auto mb-4 border border-gold-rich/20">
              <Lock className="w-10 h-10 text-maroon-royal" />
            </div>
            
            <h2 className="font-serif text-2xl font-semibold text-maroon-royal mb-3">Table Currently Sealed</h2>
            <p className="text-sm text-espresso leading-relaxed mb-6 font-medium">
              Welcome to <span className="text-maroon-royal font-bold">Maharaji Kitchen</span>. Your table (<span className="text-gold-rich font-bold">Table {tableNum}</span>) is awaiting welcoming.
            </p>

            <div className="py-4 px-6 bg-cream-warm/30 rounded-xl border border-gold-rich/10 text-xs text-mocha flex items-center gap-2 mb-6 font-medium">
              <Sparkles className="w-4 h-4 text-gold-rich" />
              <span>Contact our royal host at the reception counter to instantly activate this table.</span>
            </div>

            <p className="text-[11px] text-mocha tracking-wide uppercase font-mono">
              NH31C Sukhanibasti, WHATSAPP: +91 70764 30467
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate cart metrics
  const totalCartItems = (Object.values(cart) as number[]).reduce((a, b: number) => a + b, 0);
  
  const getSubtotal = () => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = menuItems.find(mi => mi.id === itemId);
      return sum + (item ? item.price * (qty as number) : 0);
    }, 0);
  };

  const currentSubtotal = getSubtotal();
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, currentSubtotal - discountAmount);

  const handleAddToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!couponCode.trim()) {
      setCouponError("Please type a valid coupon.");
      return;
    }

    const validation = validateCoupon(couponCode, currentSubtotal);
    if (!validation.valid) {
      setCouponError(validation.error || "Coupon criteria not met.");
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        discount: validation.discountAmount
      });
      setCouponError(null);
    }
  };

  const handlePlaceOrder = () => {
    const itemsArray = Object.entries(cart).map(([menu_item_id, quantity]) => {
       const item = menuItems.find(mi => mi.id === menu_item_id);
       return {
         menu_item_id,
         quantity: quantity as number,
         price: item?.price || 0
       };
     });

    if (itemsArray.length === 0) return;

    // Check if there is an active session (to decide if supplementary or original)
    const hasActiveOrder = orders.some(o => o.table_number === tableNum && o.status !== "completed" && o.status !== "cancelled");

    if (hasActiveOrder) {
      // Supplementary additions go to PENDING APPROVAL
      addPendingItems(tableNum, itemsArray);
    } else {
      // Direct new order placement
      addOrder(tableNum, itemsArray);
    }

    // Clear cart and show luxurious success overlay
    setCart({});
    setAppliedCoupon(null);
    setCouponCode("");
    setIsCartExpanded(false);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 5000);
  };

  // Filter food list
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category_id === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate order items for active table which is confirmed
  const activeTableOrder = orders.find(o => o.table_number === tableNum && o.status !== "completed" && o.status !== "cancelled");
  const tableOrdersConfirmed = activeTableOrder 
    ? orderItems.filter(oi => oi.order_id === activeTableOrder.id)
    : [];

  const confirmedBillItems = tableOrdersConfirmed.filter(oi => oi.status === OrderItemStatus.CONFIRMED);
  const pendingBillItems = tableOrdersConfirmed.filter(oi => oi.status === OrderItemStatus.PENDING_APPROVAL);

  return (
    <div className="min-h-screen pb-24 bg-[#FAF7F2] font-sans text-espresso selection:bg-maroon-royal selection:text-cream-ivory">
      
      {/* Dynamic Success Overlay */}
      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-deep/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-8 text-center border-2 border-gold-rich/30 shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-gold-gradient rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-rich">
                <Check className="w-8 h-8 text-charcoal-deep stroke-[3px]" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-maroon-royal mb-1">Garama-Garam!</h3>
              <p className="text-sm font-medium text-mocha mb-4">Your order is received in our royal kitchen!</p>
              
              <div className="p-3.5 bg-cream-warm/40 rounded-xl border border-gold-rich/10 text-xs font-mono text-espresso text-left space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Table Number:</span>
                  <span className="font-bold text-maroon-royal">Table {tableNum}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cook State:</span>
                  <span className="font-bold text-success animate-pulse">Approved & Preparing</span>
                </div>
              </div>

              <div className="text-[11px] text-mocha italic">
                Our hospitality captains are preparing your banquet.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Customer Header Block */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-sm border-b border-gold-rich/5 px-4 py-2.5 flex items-center justify-between">
        <MaharajiLogo size="sm" />
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="block text-[10px] text-mocha leading-none tracking-wider font-semibold uppercase">Dining Table</span>
            <span className="font-mono text-sm font-bold text-maroon-royal">Table {tableNum}</span>
          </div>
          <div className="p-1 px-2.5 rounded-full bg-success/10 text-success border border-success/25 text-[10px] uppercase font-bold tracking-wide">
            Connected Live
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        
        {/* Active Bill Tracking (if dining session is active) */}
        {confirmedBillItems.length > 0 && (
          <Card className="p-4 border-gold-rich/20 bg-gradient-to-br from-cream-warm/30 to-white">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gold-rich/5">
              <span className="text-xs font-bold text-maroon-royal flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-rich" />
                Active Royal Feast
              </span>
              <span className="font-mono text-xs text-mocha">
                MK-SESSION-{tableNum}
              </span>
            </div>
            
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {confirmedBillItems.map((oi, idx) => {
                const menuItem = menuItems.find(mi => mi.id === oi.menu_item_id);
                return (
                  <div key={idx} className="flex justify-between text-xs text-espresso">
                    <span>{oi.quantity}x {menuItem?.name}</span>
                    <span className="font-mono text-mocha">₹{(oi.price * oi.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              {pendingBillItems.map((oi, idx) => {
                const menuItem = menuItems.find(mi => mi.id === oi.menu_item_id);
                return (
                  <div key={idx} className="flex justify-between text-xs text-mocha italic bg-warning/5 rounded px-1 animate-pulse">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {oi.quantity}x {menuItem?.name}</span>
                    <span className="text-[10px] text-warning font-semibold font-sans">Kitchen checking</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-xs font-bold text-maroon-royal mt-2 pt-2 border-t border-gold-rich/15">
              <span>Running Total:</span>
              <span className="font-mono text-lg text-maroon-royal">
                ₹{confirmedBillItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
              </span>
            </div>
            <p className="text-[9px] text-mocha text-center mt-1.5 italic">
              Want more? Just add items below and checkout together later!
            </p>
          </Card>
        )}

        {/* 3. Today's Offer Banner - Pulsing / Gold Premium */}
        {todaysOffers.filter(o => o.is_active).map(offer => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-royal-gradient text-cream-ivory relative overflow-hidden shadow-lg border border-gold-rich/30 shadow-maroon-deep/30 group"
          >
            {/* Shimmer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-shimmer/30 to-transparent -translate-x-full group-hover:animate-shimmer-sweep duration-1000" />
            
            <div className="flex items-start gap-3 relative z-10">
              <div className="p-2 h-9 w-9 flex items-center justify-center bg-gold-gradient rounded-xl text-charcoal-deep border border-gold-rich/40 animate-pulse">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gold-light font-bold">Today's Royal Special</span>
                <h4 className="font-serif text-sm font-bold tracking-tight text-white">{offer.title}</h4>
                <p className="text-xs text-cream-warm mt-0.5 leading-snug">{offer.subtitle}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* 4. Visually DISTINCT Coupon Promo Code banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1C1917] to-[#2D2A26] text-cream-ivory border-2 border-gold-rich/40 relative overflow-hidden animate-gold-glow">
          <div className="absolute top-0 right-0 p-1 px-2.5 bg-gold-gradient text-charcoal-deep text-[9px] uppercase font-bold rounded-bl-xl border-l border-b border-gold-rich">
            CAPTAIN'S CHOICE
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gold-rich">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-mocha font-bold uppercase tracking-wider">BANQUET DISCOUNT</span>
              <h4 className="font-sans text-xs font-bold text-white mt-0.5">Use Code <span className="text-gold-rich uppercase font-mono font-black select-all bg-white/10 p-1 rounded">WELCOME100</span></h4>
              <p className="text-[10px] text-cream-warm mt-0.5">Get flat ₹100 discount on orders above ₹500.</p>
            </div>
          </div>
        </div>

        {/* 5. Custom Search Bar with integrated Voice Recognition */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-mocha" />
            <input
              type="text"
              placeholder="Search dishes (eg. Biryani, Naan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gold-rich/20 focus:border-gold-rich focus:ring-2 focus:ring-gold-rich/20 focus:outline-none bg-white font-medium text-espresso placeholder-mocha"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-xs text-mocha font-medium hover:text-maroon-royal"
              >
                Clear
              </button>
            )}
          </div>
          <VoiceSearchMic onResults={(trans) => setSearchQuery(trans)} />
        </div>

        {/* 6. Sticky Categorical Browse tabs */}
        <div className="sticky top-14 z-10 bg-[#FAF7F2]/95 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 border-b border-gold-rich/5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              activeCategory === "all"
                ? "bg-royal-gradient text-white border-maroon-royal shadow"
                : "bg-white text-mocha border-gold-rich/10 hover:bg-cream-warm/30"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Royal Feast</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-royal-gradient text-white border-maroon-royal shadow"
                  : "bg-white text-mocha border-gold-rich/10 hover:bg-cream-warm/30"
              }`}
            >
              {getCategoryIcon(cat.icon_name)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* 7. Menu Item Grid */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-maroon-royal border-l-3 border-gold-rich pl-2">
            {activeCategory === "all" ? "Discover Royal Recipes" : categories.find(c => c.id === activeCategory)?.name}
          </h3>

          {filteredMenuItems.length === 0 ? (
            <EmptyState 
              title="No royal recipes found" 
              message="No banquet items match your search. Try looking for 'Biryani', 'Paneer', or check another category!" 
            />
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              {filteredMenuItems.map(item => {
                const cartQty = cart[item.id] || 0;
                return (
                  <Card 
                    key={item.id} 
                    className="p-3 bg-white hover:border-gold-rich/30 relative flex flex-col justify-between overflow-hidden"
                  >
                    {/* Item Image */}
                    <div className="relative h-28 w-full rounded-xl overflow-hidden bg-cream-warm mb-2.5">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-charcoal-deep/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="px-2 py-1 rounded bg-maroon-royal text-cream-ivory text-[9px] uppercase font-bold tracking-wider">Sold Out</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <h4 className="font-serif text-sm font-bold text-espresso leading-tight">{item.name}</h4>
                      <p className="text-[11px] text-mocha line-clamp-2 leading-relaxed min-h-[30px]">{item.description}</p>
                    </div>

                    {/* Action Block */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gold-rich/5">
                      <span className="font-mono text-sm font-bold text-maroon-royal">₹{item.price.toFixed(0)}</span>
                      
                      {item.is_available && (
                        <div className="flex items-center">
                          {cartQty > 0 ? (
                            <div className="flex items-center gap-2 bg-cream-warm/40 border border-gold-rich/20 rounded-lg p-1">
                              <button
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="p-1 rounded bg-white text-maroon-royal hover:bg-cream-warm"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono text-xs font-bold text-maroon-royal select-none w-4 text-center">{cartQty}</span>
                              <button
                                onClick={() => handleAddToCart(item.id)}
                                className="p-1 rounded bg-white text-maroon-royal hover:bg-cream-warm"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 border-gold-rich/20 text-maroon-royal hover:bg-maroon-royal/5"
                              onClick={() => handleAddToCart(item.id)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 8. STICKY BOTTOM CART BAR (Animated on mobile/always responsive) */}
      <AnimatePresence>
        {totalCartItems > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-gold-rich/20 shadow-[0_-10px_25px_rgba(45,24,16,0.15)] max-w-md mx-auto"
          >
            {/* Expanded Drawer Toggle */}
            <div 
              onClick={() => setIsCartExpanded(!isCartExpanded)}
              className="flex items-center justify-between px-5 py-3 cursor-pointer border-b border-gold-rich/5 hover:bg-cream-warm/15 text-espresso font-sans font-medium"
            >
              <div className="flex items-center gap-2">
                <div className="relative p-2.5 bg-royal-gradient rounded-xl text-cream-ivory">
                  <ShoppingBag className="w-4.5 h-4.5" />
                  <span className="absolute -top-1 -right-1.5 px-1.5 py-0.5 rounded-full bg-gold-gradient text-[9px] font-bold text-charcoal-deep border border-white">
                    {totalCartItems}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-mocha uppercase font-bold tracking-wide">Royal Cart</span>
                  <div className="font-mono text-sm font-bold text-maroon-royal flex items-baseline">
                    ₹{finalTotal.toFixed(2)}
                    {appliedCoupon && <span className="text-[9px] text-[#059669] ml-1 font-sans">(Discounted)</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-mocha">
                <span>{isCartExpanded ? "Hide Details" : "View Details"}</span>
                {isCartExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Expanded items list drawer */}
            {isCartExpanded && (
              <div className="px-5 py-4 max-h-60 overflow-y-auto space-y-3 border-b border-gold-rich/10 bg-[#FAF7F2]">
                <h5 className="font-serif text-xs font-bold text-maroon-royal uppercase tracking-wider">Banquets Items Summary</h5>
                <div className="space-y-2">
                  {Object.entries(cart).map(([itemId, qty]) => {
                    const item = menuItems.find(mi => mi.id === itemId);
                    if (!item) return null;
                    const quantityVal = qty as number;
                    return (
                      <div key={itemId} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-espresso">{quantityVal}x {item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-mocha">₹{(item.price * quantityVal).toFixed(2)}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleRemoveFromCart(itemId)}
                              className="p-1 rounded bg-cream-warm/50 text-maroon-royal hover:bg-cream-warm"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleAddToCart(itemId)}
                              className="p-1 rounded bg-cream-warm/50 text-maroon-royal hover:bg-cream-warm"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Input field */}
                <div className="pt-3 border-t border-gold-rich/5 space-y-2">
                  <span className="block text-[10px] text-mocha font-bold uppercase tracking-wider">Banquet Promo Code</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter eg. WELCOME100"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                      className="flex-1 px-3 py-1.5 text-xs border border-gold-rich/20 rounded-lg uppercase font-mono tracking-wider focus:outline-none focus:border-gold-rich disabled:bg-cream-warm/30 text-espresso"
                    />
                    {appliedCoupon ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="py-1 px-2 text-[10px] text-danger border-danger/30 hover:bg-danger/5"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode("");
                        }}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="py-1 px-3.5 text-[10px]"
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                  {couponError && <span className="block text-[10px] text-danger font-medium">{couponError}</span>}
                  {appliedCoupon && (
                    <span className="block text-[10px] text-success font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Coupon Applied! Saved ₹{appliedCoupon.discount.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Totals Summary */}
                <div className="pt-2 border-t border-gold-rich/5 space-y-1 text-xs font-medium">
                  <div className="flex justify-between">
                    <span className="text-mocha">Subtotal:</span>
                    <span className="font-mono text-espresso">₹{currentSubtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-[#059669]">
                      <span>Coupon Discount ({appliedCoupon.code}):</span>
                      <span className="font-mono">-₹{appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit checkout bottom line */}
            <div className="p-3.5 px-5 bg-white flex gap-3">
              <Button
                variant="gold"
                className="w-full py-3.5 uppercase tracking-wider font-bold shadow-lg text-xs"
                onClick={handlePlaceOrder}
              >
                <Sparkles className="w-4 h-4 fill-current.5 animate-bounce" />
                {orders.some(o => o.table_number === tableNum && o.status !== "completed" && o.status !== "cancelled")
                  ? "Agree supplementary items"
                  : "Send to Royal Kitchen"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
