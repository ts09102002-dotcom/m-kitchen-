import React, { useState } from "react";
import { useStore } from "../store";
import { TableStatus } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Crown, Sparkles, User, ShoppingBag, ShieldCheck, ChevronRight, Minimize2, Eye } from "lucide-react";

export const UnifiedRoleNavigator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = useStore((state) => state.currentUser);
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);
  const unlockTable = useStore((state) => state.unlockTable);

  const handleRoleSwitch = (role: "customer" | "reception" | "admin") => {
    if (role === "customer") {
      // Unlock Table 5 first to avoid locked screens, then redirect to Table 5
      unlockTable("table_5");
      window.history.pushState({}, "", "?table=5");
      window.dispatchEvent(new Event("popstate"));
    } else if (role === "reception") {
      logout();
      // login reception
      login("reception", "reception");
      // reset queries
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new Event("popstate"));
    } else if (role === "admin") {
      logout();
      // login admin
      login("Maharaji741852", "Rest@951");
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new Event("popstate"));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans pointer-events-none select-none">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 220 }}
            className="w-80 bg-white/90 backdrop-blur-xl border-2 border-gold-rich/30 shadow-2xl rounded-3xl p-5 pointer-events-auto overflow-hidden relative"
          >
            {/* Top gold line indicator */}
            <div className="absolute top-0 inset-x-0 h-1 bg-royal-gradient" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gold-rich/10 mb-4">
              <div className="flex items-center gap-1.5">
                <Crown className="w-5 h-5 text-gold-rich" />
                <span className="font-serif font-bold text-xs text-maroon-royal uppercase tracking-wider">
                  Portal Navigator
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-mocha hover:text-maroon-royal hover:bg-cream-warm/30 transition-colors"
                title="Minimize controller"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-mocha font-semibold uppercase tracking-wider mb-3 leading-snug">
              Instant Tenant Multi-Role Toggles
            </p>

            {/* Role Options container */}
            <div className="space-y-2.5">
              {/* 1. Customer Card */}
              <button
                onClick={() => handleRoleSwitch("customer")}
                className="w-full text-left p-3 rounded-2xl border border-gold-rich/10 bg-cream-ivory hover:bg-cream-warm/40 hover:border-gold-rich/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-maroon-royal border border-gold-rich/15 group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-espresso">
                      Customer view
                    </span>
                    <span className="block text-[9px] text-mocha font-medium mt-0.5">
                      Simulate scanning Table 5 Menu
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-mocha group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 2. Reception Card */}
              <button
                onClick={() => handleRoleSwitch("reception")}
                className="w-full text-left p-3 rounded-2xl border border-gold-rich/10 bg-cream-ivory hover:bg-cream-warm/40 hover:border-gold-rich/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-maroon-light border border-gold-rich/15 group-hover:scale-105 transition-transform">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-espresso">
                      Reception Portal
                    </span>
                    <span className="block text-[9px] text-mocha font-medium mt-0.5">
                      Operational billing & orders (reception)
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-mocha group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 3. Admin Card */}
              <button
                onClick={() => handleRoleSwitch("admin")}
                className="w-full text-left p-3 rounded-2xl border border-gold-rich/10 bg-cream-ivory hover:bg-cream-warm/40 hover:border-gold-rich/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-maroon-royal border border-gold-rich/15 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-espresso">
                      Admin Console
                    </span>
                    <span className="block text-[9px] text-mocha font-medium mt-0.5">
                      Full stats, coupons, system reset settings
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-mocha group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Current logged-in stats summary */}
            <div className="mt-4 pt-3 border-t border-gold-rich/10 text-center">
              <span className="text-[9px] text-mocha font-bold uppercase tracking-widest block">
                Active Tenant Session
              </span>
              <span className="inline-block mt-1 px-3 py-1 bg-royal-gradient text-white text-[10px] font-bold rounded-lg border border-maroon-royal/20 uppercase tracking-wider">
                {currentUser ? `${currentUser.role} (${currentUser.username})` : "Guest / Logged Out"}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed-bubble"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-full bg-royal-gradient text-white border-2 border-gold-rich shadow-2xl flex items-center gap-2 pointer-events-auto hover:brightness-110 active:scale-95 transition-all outline-none"
            title="Open Role Navigator"
          >
            <Crown className="w-5 h-5 text-gold-rich animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider pr-1 text-white hidden sm:inline">
              Switch Roles
            </span>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-shimmer opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold-rich border border-white"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
