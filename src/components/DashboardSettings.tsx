import React, { useState } from "react";
import { useStore } from "../store";
import { TableStatus, UserRole } from "../types";
import { Button, Card, FormInput, Modal } from "./PremiumUI";
import { toast } from "sonner";
import { Settings, Percent, Trash2, Plus, OctagonAlert as AlertOctagon, Check, FileSliders as Sliders, RefreshCw, Sparkles, Ticket } from "lucide-react";

export const DashboardSettings: React.FC = () => {
  // Zustand State
  const system = useStore(state => state.system);
  const coupons = useStore(state => state.coupons);
  const posWidth = useStore(state => state.posWidth);
  const currentUser = useStore(state => state.currentUser);

  const setTagline = useStore(state => state.setTagline);
  const setPOSWidth = useStore(state => state.setPOSWidth);
  const setAuthCode = useStore(state => state.setAuthCode);
  const addCoupon = useStore(state => state.addCoupon);
  const deleteCoupon = useStore(state => state.deleteCoupon);
  const systemHardReset = useStore(state => state.systemHardReset);

  // States: POS config
  const [tagline, setTaglineVal] = useState(system.tagline);
  const [authCode, setAuthCodeVal] = useState(system.receptionAuthCode);

  // States: New Coupon form
  const [isCoupModalOpen, setIsCoupModalOpen] = useState(false);
  const [coupCode, setCoupCode] = useState("");
  const [coupType, setCoupType] = useState<"percentage" | "flat">("flat");
  const [coupValue, setCoupValue] = useState("");
  const [coupMinBuy, setCoupMinBuy] = useState("");

  // States: Hard Reset modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPasscode, setResetPasscode] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);

  // Handle baseline save
  const handleSavePOSBase = (e: React.FormEvent) => {
    e.preventDefault();
    setTagline(tagline);
    setAuthCode(authCode);
    toast.success("Royal system configurations saved successfully!");
  };

  // Handle coupon saves
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(coupValue);
    const minVal = parseFloat(coupMinBuy);

    if (!coupCode.trim() || isNaN(val) || isNaN(minVal)) {
      toast.error("Please check coupon entry constraints!");
      return;
    }

    addCoupon({
      code: coupCode.trim().toUpperCase(),
      discount_type: coupType,
      discount: val,
      min_purchase: minVal,
      linked_bill_id: null,
      valid_from: new Date().toISOString(),
      valid_to: new Date(Date.now() + 86400000 * 30).toISOString()
    });

    setCoupCode("");
    setCoupValue("");
    setCoupMinBuy("");
    setIsCoupModalOpen(false);
    toast.success("New coupon promotion created successfully!");
  };

  // Handle hard reset overrides
  const handleConfirmHardReset = () => {
    const success = systemHardReset(resetPasscode);
    if (success) {
      setResetPasscode("");
      setResetError(null);
      setIsResetModalOpen(false);
      toast.success("System database has been entirely wiped and re-seeded.");
      setTimeout(() => {
        window.location.reload(); // Refresh viewport safely to bind state
      }, 1500);
    } else {
      setResetError("Invalid 6-digit Master Safety overwrite passcode!");
      toast.error("Invalid passcode!");
    }
  };

  return (
    <div className="space-y-8 font-sans select-none pb-8">
      
      {/* HEADER SECTION */}
      <div className="border-b border-gold-rich/10 pb-4">
        <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
          <Settings className="w-5 h-5 text-gold-rich" />
          Settings Console & Danger Zone
        </h3>
        <p className="text-xs text-mocha mt-1">
          Customize bill parameters, manage coupon promotions, or perform master factory overrides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: POS and Coupon creations (7 cols or full 12 cols if not admin) */}
        <div className={`${currentUser?.role === UserRole.ADMIN ? "lg:col-span-7" : "lg:col-span-12"} space-y-6`}>
          
          {/* Section A: POS Hardware options */}
          <Card className="p-5 bg-white border border-gold-rich/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2 flex items-center gap-1">
              <Sliders className="w-4 h-4 text-gold-rich" /> Hardware & Operations Settings
            </h4>

            <form onSubmit={handleSavePOSBase} className="space-y-4">
              <FormInput
                label="Restaurant Slogan (Cormorant Garamond Tagline)"
                value={tagline}
                onChange={(e) => setTaglineVal(e.target.value)}
                placeholder="Royal Slogan Slogan"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Captain Verification Code (Edit Bills)"
                  type="password"
                  maxLength={4}
                  value={authCode}
                  onChange={(e) => setAuthCodeVal(e.target.value)}
                  placeholder="Password to verify edits"
                />

                <div className="relative mb-5 font-sans">
                  <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">POS Printer Width Roll</label>
                  <select
                    value={posWidth}
                    onChange={(e) => setPOSWidth(e.target.value as any)}
                    className="w-full px-3.5 py-3 text-sm text-espresso bg-[#FAF7F2] border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                  >
                    <option value="58mm">58mm (Narrow Thermal Roll)</option>
                    <option value="80mm">80mm (Standard Restaurant Roll)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit" size="sm" className="font-bold">
                  Save Operations Config
                </Button>
              </div>
            </form>
          </Card>

          {/* Section B: Coupon codes cabinet */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gold-rich/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2 flex items-center gap-1">
                <Percent className="w-4 h-4 text-gold-rich" /> Promotional Coupon list
              </h4>

              {currentUser?.role === UserRole.ADMIN && (
                <Button
                  variant="gold"
                  size="sm"
                  className="py-1.5 px-3 text-xs uppercase"
                  onClick={() => setIsCoupModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create coupon</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[290px] overflow-y-auto pr-1">
              {coupons.map(cop => (
                <Card key={cop.id} className="p-3 bg-white border border-gold-rich/15 flex flex-col justify-between overflow-hidden relative min-h-[110px]">
                  {/* Perforated ticket visual border accent on left */}
                  <div className="absolute left-0 inset-y-0 w-1 bg-gold-rich" />
                  
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-espresso bg-cream-warm/40 px-2 py-0.5 rounded border border-gold-rich/20">
                        {cop.code}
                      </span>
                      {currentUser?.role === UserRole.ADMIN && (
                        <button 
                          onClick={() => deleteCoupon(cop.id)}
                          className="p-1 rounded text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-mocha mt-2">
                      Get {cop.discount_type === "percentage" ? `${cop.discount}%` : `₹${cop.discount}`} off on purchases above <span className="font-bold text-espresso">₹{cop.min_purchase}</span>.
                    </p>
                  </div>

                  <span className="block text-[8px] text-gold-rich font-bold uppercase tracking-wider text-right border-t border-dashed border-gold-rich/10 pt-1.5 mt-2">
                    <Ticket className="w-3 h-3 inline" /> active coupon ticker
                  </span>
                </Card>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Safety Hard overrides console (5 cols) */}
        {currentUser?.role === UserRole.ADMIN && (
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 border-l-2 border-red-600 pl-2">
              System Hazard Console
            </h4>

            <Card className="p-5 bg-red-50/20 border border-red-200/50 space-y-4 shadow-sm">
              <div className="p-3 bg-red-100/40 border border-red-200 text-red-800 rounded-xl flex gap-2 w-full text-xs">
                <AlertOctagon className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <strong className="block text-red-950">CRITICAL MASTER WIPE CONTROL</strong>
                  <span>Executing a baseline Hard reset wipes all active dining carts, closes bils, resets dynamic table numbers, logs, stock invoices, and returns the machine state back to original golden seed categories.</span>
                </div>
              </div>

              <p className="text-[11px] text-red-900 leading-relaxed font-medium">
                This process is irreversible. Secure supervisor 6-digit system overwrite security string is checked on execution. Code: <span className="font-bold font-mono text-red-700 select-all">951753</span>.
              </p>

              <Button
                variant="danger"
                className="w-full py-3 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5"
                onClick={() => {
                  setResetPasscode("");
                  setResetError(null);
                  setIsResetModalOpen(true);
                }}
              >
                <RefreshCw className="w-4 h-4 text-white animate-spin-slow" />
                <span>Initialize System Hard Reset</span>
              </Button>
            </Card>
          </div>
        )}

      </div>

      {/* COUPON GENERATOR INSERT MODAL */}
      <Modal
        isOpen={isCoupModalOpen}
        onClose={() => setIsCoupModalOpen(false)}
        title="Add Ticket Coupon"
      >
        <form onSubmit={handleSaveCoupon} className="space-y-4">
          <FormInput
            label="Coupon Alpha-numeric Code"
            value={coupCode}
            onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
            placeholder="eg. ROYAL30"
            required
          />

          <div className="relative mb-5 font-sans">
            <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Discount Style</label>
            <select
              value={coupType}
              onChange={(e) => setCoupType(e.target.value as any)}
              className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
            >
              <option value="flat">Flat Cash Discount (INR)</option>
              <option value="percentage">Percentage Discount (%)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Face Value"
              type="number"
              value={coupValue}
              onChange={(e) => setCoupValue(e.target.value)}
              placeholder="price or pct amount"
              required
            />

            <FormInput
              label="Min Purchase Threshold"
              type="number"
              value={coupMinBuy}
              onChange={(e) => setCoupMinBuy(e.target.value)}
              placeholder="eg. 1000"
              required
            />
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCoupModalOpen(false)}>
              Discard
            </Button>
            <Button variant="primary" size="sm" type="submit" className="font-bold">
              <span>Generate Ticket</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* MASTER WIPE PASSCODE CONFIRM BLOCKER */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Override Authentication"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-red-100/30 text-red-950 font-medium text-xs rounded-xl border border-red-200">
            Warning: Performing this override completely wipes table indices, live orders queue, recipes, and invoices.
          </div>

          <FormInput
            label="Input Master Overwrite Security Passcode"
            type="password"
            maxLength={6}
            value={resetPasscode}
            onChange={(e) => setResetPasscode(e.target.value)}
            placeholder="6-Digit Safety Pin eg. 951753"
            error={resetError || undefined}
          />

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Cancel Setup
            </Button>
            <Button variant="danger" size="sm" className="font-bold uppercase" onClick={handleConfirmHardReset}>
              <Check className="w-4 h-4 text-white" />
              <span>Shatter State</span>
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
