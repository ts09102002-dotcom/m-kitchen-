import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { MaharajiLogo, Button } from "./PremiumUI";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Grid, 
  ClipboardList, 
  ChefHat, 
  Gift, 
  Package, 
  FileText, 
  BarChart3, 
  QrCode, 
  Settings, 
  LogOut, 
  Clock, 
  User, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StaffShell: React.FC<ShellProps> = ({ children, activeTab, setActiveTab }) => {
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);

  // States
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [time, setTime] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Clock ticks every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  // Exact 10 sidebar links aligned with activeTab identifiers in App
  const sidebarItems = [
    { name: "Live Dashboard", path: "live", icon: <Home className="w-5 h-5" /> },
    { name: "Table Management", path: "tables", icon: <Grid className="w-5 h-5" /> },
    { name: "Active Orders", path: "checkout", icon: <ClipboardList className="w-5 h-5" /> },
    { name: "Menu Management", path: "menu", icon: <ChefHat className="w-5 h-5" /> },
    { name: "Today's Offer", path: "offers", icon: <Gift className="w-5 h-5" /> },
    { name: "Stock / Materials", path: "stock", icon: <Package className="w-5 h-5" /> },
    { name: "Bills & History", path: "archive", icon: <FileText className="w-5 h-5" /> },
    { name: "Reports & Stats", path: "stats", icon: <BarChart3 className="w-5 h-5" /> },
    { name: "Table QR Codes", path: "qr", icon: <QrCode className="w-5 h-5" /> },
    { name: "POS Settings", path: "config", icon: <Settings className="w-5 h-5" /> }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex text-espresso out-of-boundary-scroll">
      
      {/* 1. LEFT SIDEBAR COLLAPSIBLE MODULE (Responsive Desktop / Hidden Mobile) */}
      <aside 
        className={`bg-luxury-dark text-cream-ivory flex-col border-r border-gold-rich/20 select-none z-30 transition-all duration-300 hidden md:flex ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Core Header area with Brand Crown */}
        <div className="h-16 flex items-center justify-between border-b border-gold-rich/10 px-4">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-1.5 py-1 text-center truncate">
              <span className="font-serif font-black tracking-tight text-white flex items-center gap-1 text-sm bg-white/5 px-2 py-1 rounded-lg border border-gold-rich/15">
                <ShieldCheck className="w-4 h-4 text-gold-rich animate-pulse" />
                {currentUser.role.toUpperCase()} PORTAL
              </span>
            </div>
          ) : (
            <div className="text-gold-rich text-center w-full flex justify-center">
              <span className="text-xs font-mono font-bold tracking-tight">MK</span>
            </div>
          )}

          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-gold-rich cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Links listing - strict 1-10 listing using passed tab state */}
        <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item, idx) => {
            const isActive = activeTab === item.path;

            return (
              <button
                key={idx}
                onClick={() => setActiveTab(item.path)}
                className={`w-full text-left flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 group relative cursor-pointer ${
                  isActive 
                    ? "bg-royal-gradient text-white shadow shadow-maroon-royal/20 border-l-[4px] border-gold-rich font-bold" 
                    : "text-cream-warm/75 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className={`transition-transform duration-200 group-hover:rotate-6 ${isActive ? "text-gold-rich" : ""}`}>
                  {item.icon}
                </div>
                {!sidebarCollapsed && <span>{item.name}</span>}

                {/* Micro Tooltip on collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-16 px-2.5 py-1.5 bg-charcoal-deep border border-gold-rich/20 rounded shadow text-[9px] text-cream-ivory uppercase tracking-widest leading-none invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-40 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom profile actions */}
        <div className="p-3 border-t border-gold-rich/10 space-y-2.5 bg-charcoal-deep/40">
          {!sidebarCollapsed && (
            <div className="px-2 py-1.5 rounded-lg border border-white/5 bg-white/5 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gold-gradient text-charcoal-deep font-mono text-xs font-black flex items-center justify-center border border-gold-rich">
                {currentUser.username[0].toUpperCase()}
              </div>
              <div className="truncate">
                <span className="block text-[10px] text-mocha font-bold uppercase leading-none tracking-wide">CAPTAIN</span>
                <span className="text-xs text-white leading-tight font-medium select-all">{currentUser.username}</span>
              </div>
            </div>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            className={`w-full py-2 uppercase tracking-widest text-[9px] font-bold flex items-center justify-center gap-1.5 ${sidebarCollapsed ? "px-0" : ""}`}
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>Logout Panel</span>}
          </Button>
        </div>
      </aside>

      {/* MOBILE POPUP SIDEBAR */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal-deep/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar drawer content */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-64 bg-luxury-dark border-r border-gold-rich/35 text-cream-ivory p-4 flex flex-col justify-between h-full z-10 font-sans"
            >
              <div>
                <div className="flex items-center justify-between border-b border-gold-rich/15 pb-4 mb-4">
                  <MaharajiLogo size="sm" />
                  <button onClick={() => setMobileMenuOpen(false)} className="text-gold-rich font-bold border border-white/10 p-1 px-2.5 rounded hover:bg-white/5">X</button>
                </div>
                <nav className="space-y-1.5">
                  {sidebarItems.map((item, idx) => {
                    const isActive = activeTab === item.path;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTab(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
                          isActive 
                            ? "bg-royal-gradient text-white border-l-[3px] border-gold-rich shadow" 
                            : "text-cream-warm hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-1.5 border-t border-gold-rich/10 space-y-3">
                <div className="rounded-lg border border-white/5 bg-white/5 flex items-center gap-2 p-1.5">
                  <div className="h-8 w-8 rounded-full bg-gold-gradient text-charcoal-deep font-mono text-xs font-black flex items-center justify-center border border-gold-rich">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-[9px] text-mocha font-bold uppercase leading-none">ROLE</span>
                    <span className="text-xs text-white leading-tight font-medium">{currentUser.role}</span>
                  </div>
                </div>
                <Button variant="danger" size="sm" className="w-full text-[10px]" onClick={handleLogout}>
                  Logout Panel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. MAIN HUB SECTION */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* PREMIUM TOP BAR */}
        <header className="h-16 bg-white border-b border-gold-rich/10 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-10 select-none">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 px-2 border border-gold-rich/20 rounded-lg text-maroon-royal bg-cream-warm/10 md:hidden hover:bg-cream-warm"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="font-serif font-black text-maroon-royal flex items-baseline gap-1 md:text-lg">
              <span className="bg-royal-gradient text-transparent bg-clip-text font-black">MAHARAJI KITCHEN</span>
              <span className="text-[10px] md:text-xs font-accent italic text-mocha capitalize">({currentUser.role})</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Ticking Pos Clock is MONOSPACED */}
            <div className="flex items-center gap-2 bg-cream-warm/30 border border-gold-rich/15 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-maroon-royal shadow-inner">
              <Clock className="w-3.5 h-3.5 text-gold-rich animate-pulse" />
              <span>{time}</span>
            </div>

            {/* Profile Avatar bubble */}
            <div className="hidden sm:flex items-center gap-2 border-l border-gold-rich/15 pl-4">
              <div className="text-right">
                <span className="block text-[10px] text-mocha font-bold uppercase leading-none tracking-wider">{currentUser.role}</span>
                <span className="text-xs text-espresso font-semibold font-mono leading-tight">{currentUser.username}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-royal-gradient text-white flex items-center justify-center font-bold text-sm border-2 border-gold-rich">
                <User className="w-4 h-4 text-gold-light" />
              </div>
            </div>
          </div>
        </header>

        {/* INBUILT COMPONENT CHASSIS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAF7F2]">
          {children}
        </main>
      </div>

    </div>
  );
};
