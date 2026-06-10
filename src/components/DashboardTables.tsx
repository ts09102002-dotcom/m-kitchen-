import React, { useState } from "react";
import { useStore } from "../store";
import { TableStatus, OrderItemStatus } from "../types";
import { Button, Card, VoiceSearchMic } from "./PremiumUI";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  Unlock, 
  ChevronRight, 
  Search, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle2, 
  QrCode, 
  XSquare,
  AlertCircle,
  Grid
} from "lucide-react";
import QRCode from "qrcode";

export const DashboardTables: React.FC = () => {
  // Zustand Store
  const tables = useStore(state => state.tables);
  const orders = useStore(state => state.orders);
  const orderItems = useStore(state => state.orderItems);
  const menuItems = useStore(state => state.menuItems);

  const unlockTable = useStore(state => state.unlockTable);
  const lockTable = useStore(state => state.lockTable);
  const openTable = useStore(state => state.openTable);
  const closeTable = useStore(state => state.closeTable);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedTableId, setHighlightedTableId] = useState<string | null>(null);
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [qrModalNum, setQrModalNum] = useState<number | null>(null);

  const handleVoiceSearchResult = (text: string) => {
    // Matches expressions like 'table 5', 'show table twelve', 'table five'
    const clean = text.toLowerCase();
    const numbersMap: Record<string, number> = {
      one: 1, first: 1, "1": 1,
      two: 2, second: 2, "2": 2,
      three: 3, third: 3, "3": 3,
      four: 4, "4": 4,
      five: 5, "5": 5,
      six: 6, "6": 6,
      seven: 7, "7": 7,
      eight: 8, "8": 8,
      nine: 9, "9": 9,
      ten: 10, "10": 10,
      eleven: 11, "11": 11,
      twelve: 12, "12": 12,
      thirteen: 13, "13": 13,
      fourteen: 14, "14": 14,
      fifteen: 15, "15": 15,
      sixteen: 16, "16": 16,
      seventeen: 17, "17": 17,
      eighteen: 18, "18": 18,
      nineteen: 19, "19": 19,
      twenty: 20, "20": 20
    };

    let targetNum: number | null = null;
    
    // Attempt parsing numerical parts
    const match = clean.match(/\d+/);
    if (match) {
      targetNum = parseInt(match[0], 10);
    } else {
      // Lookup textual numbers
      for (const [word, val] of Object.entries(numbersMap)) {
        if (clean.includes(word)) {
          targetNum = val;
          break;
        }
      }
    }

    if (targetNum && targetNum >= 1 && targetNum <= 20) {
      const tableId = `table_${targetNum}`;
      setHighlightedTableId(tableId);
      setSearchQuery(`Table ${targetNum}`);
      // Auto clear highlight after 4 seconds
      setTimeout(() => setHighlightedTableId(null), 4000);
      
      // Smooth scroll target card into view
      const elem = document.getElementById(tableId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setSearchQuery(text);
    }
  };

  const handleOpenQRModal = (num: number) => {
    // Generate QR code for customer web scan
    const portUrl = `https://ais-dev-pvgaexynmavehnu76z6o77-865640942941.asia-east1.run.app/menu?table=${num}`;
    QRCode.toDataURL(portUrl, { width: 300, margin: 2 }, (err, url) => {
      if (!err) {
        setQrModalUrl(url);
        setQrModalNum(num);
      }
    });
  };

  const handleCloseQRModal = () => {
    setQrModalUrl(null);
    setQrModalNum(null);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 2. HEADER SEARCH PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-rich/10 pb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
            <Grid className="w-5 h-5 text-gold-rich" />
            Hall Table Setup
          </h3>
          <p className="text-xs text-mocha mt-1">
            Activate or lock Table QR scanning portals for dine-in guests in real-time.
          </p>
        </div>

        {/* Search capabilities */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-mocha" />
            <input
              type="text"
              placeholder="Filter by table num, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gold-rich/20 focus:border-gold-rich focus:ring-2 bg-white"
            />
          </div>
          <VoiceSearchMic onResults={handleVoiceSearchResult} />
        </div>
      </div>

      {/* 3. GRID LAYOUT TABLE BLOCKS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables
          .filter(t => {
            const numMatch = `table ${t.table_number}`.includes(searchQuery.toLowerCase()) || String(t.table_number).includes(searchQuery);
            const statusMatch = t.status.toLowerCase().includes(searchQuery.toLowerCase());
            return searchQuery === "" || numMatch || statusMatch;
          })
          .map(table => {
            // Compute financials of table if status = ACTIVE
            const activeOrder = orders.find(o => o.table_number === table.table_number && o.status !== "completed" && o.status !== "cancelled");
            
            const confirmedOrderItems = activeOrder
              ? orderItems.filter(oi => oi.order_id === activeOrder.id && oi.status === OrderItemStatus.CONFIRMED)
              : [];

            const billTotal = confirmedOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            const isHighlighted = highlightedTableId === table.id;

            return (
              <Card
                id={table.id}
                key={table.id}
                className={`p-4 relative overflow-hidden flex flex-col justify-between min-h-[190px] border transition-all duration-300 ${
                  isHighlighted ? "ring-4 ring-gold-rich border-gold-rich scale-105 shadow-2xl z-10 bg-cream-warm/25" : ""
                } ${
                  table.status === TableStatus.LOCKED ? "border-maroon-royal/20 bg-white" :
                  table.status === TableStatus.OPEN ? "border-success/30 bg-success/5" :
                  table.status === TableStatus.ACTIVE ? "border-amber-500/30 bg-amber-500/5 animate-pulse-slow" : "border-mocha/20 bg-cream-warm/20"
                }`}
              >
                {/* Visual Accent colors badge */}
                <div className={`absolute top-0 inset-x-0 h-1 ${
                  table.status === TableStatus.LOCKED ? "bg-maroon-royal" :
                  table.status === TableStatus.OPEN ? "bg-success" :
                  table.status === TableStatus.ACTIVE ? "bg-warning" : "bg-mocha"
                }`} />

                {/* Table Header block */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider leading-none">DINING CELL</span>
                    <span className="font-serif text-3xl font-bold text-espresso leading-none">{table.table_number}</span>
                  </div>

                  {/* Operational Status badge */}
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md font-mono ${
                    table.status === TableStatus.LOCKED ? "bg-maroon-light/10 text-maroon-royal border border-maroon-royal/10" :
                    table.status === TableStatus.OPEN ? "bg-success/15 text-success border border-success/10" :
                    table.status === TableStatus.ACTIVE ? "bg-warning/10 text-warning border border-warning/10" : "bg-mocha/10 text-mocha border"
                  }`}>
                    {table.status}
                  </span>
                </div>

                {/* Body: Session stats */}
                <div className="space-y-1.5 my-3">
                  {table.status === TableStatus.ACTIVE ? (
                    <div className="text-xs space-y-0.5 bg-white/50 p-1.5 rounded-lg border border-warning/15">
                      <div className="flex justify-between text-[10px] text-mocha">
                        <span>Items Confirmed:</span>
                        <span className="font-bold text-espresso font-mono">{confirmedOrderItems.length}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-maroon-royal font-mono pt-1 border-t border-gold-rich/5">
                        <span>Running Bill:</span>
                        <span>₹{billTotal.toFixed(0)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-mocha italic leading-snug">
                      {table.status === TableStatus.LOCKED ? "Sealed. No customer can scan or browse menus." :
                       table.status === TableStatus.OPEN ? "Available. Customer can access menu but hasn't ordered." :
                       "Post-checkout state. Close table to wipe cart and reset."}
                    </p>
                  )}
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-gold-rich/5">
                  <button 
                    onClick={() => handleOpenQRModal(table.table_number)}
                    className="p-1.5 bg-cream-warm/40 text-mocha hover:text-maroon-royal hover:bg-cream-warm/80 rounded-lg border border-gold-rich/10 cursor-pointer"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex justify-end gap-1.5">
                    {table.status === TableStatus.LOCKED && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="py-1 px-3.5 text-[10px] uppercase font-bold rounded-lg"
                        onClick={() => unlockTable(table.id)}
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock</span>
                      </Button>
                    )}

                    {table.status === TableStatus.OPEN && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="py-1 px-2.5 text-[10px] rounded-lg border-maroon-royal/20 text-maroon-royal hover:bg-maroon-royal/5"
                          onClick={() => lockTable(table.id)}
                        >
                          <Lock className="w-3 h-3" />
                          <span>Lock</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="py-1 px-3 text-[10px] rounded-lg"
                          onClick={() => openTable(table.id)}
                        >
                          <span>Open</span>
                        </Button>
                      </div>
                    )}

                    {table.status === TableStatus.ACTIVE && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="py-1 px-3 text-[10px] rounded-lg border-warning/35 text-warning hover:bg-warning/5"
                        onClick={() => closeTable(table.id)}
                      >
                        <XSquare className="w-3.5 h-3.5" />
                        <span>Force Lock</span>
                      </Button>
                    )}

                    {table.status === TableStatus.CLOSED && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="py-1 px-3.5 text-[10px] rounded-lg bg-royal-gradient text-white"
                        onClick={() => openTable(table.id)}
                      >
                        <span>Reactivate</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
      </div>

      {/* Dynamic QR visual modal overlay */}
      <AnimatePresence>
        {qrModalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-charcoal-deep/80 backdrop-blur-sm" onClick={handleCloseQRModal} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FAF7F2] p-6 rounded-3xl max-w-sm w-full mx-auto relative border-2 border-gold-rich/30 z-10 text-center text-espresso"
            >
              <h3 className="font-serif text-xl font-bold text-maroon-royal mb-1">Dine-in scan QR</h3>
              <p className="text-xs text-mocha mb-4">Table {qrModalNum} portal link</p>
              
              <div className="p-3 bg-white rounded-2xl inline-block border border-gold-rich/10 shadow-inner mb-4">
                <img src={qrModalUrl} alt="Table QR" className="w-52 h-52 object-contain" />
              </div>

              <div className="text-left py-2 px-3 bg-cream-warm/30 rounded-xl border border-gold-rich/10 text-[10px] text-mocha font-mono leading-relaxed mb-4">
                <div className="flex justify-between">
                  <span>URL:</span>
                  <span className="truncate max-w-[200px] text-maroon-royal font-bold">/menu?table={qrModalNum}</span>
                </div>
                <div className="flex justify-between mt-0.5">
                  <span>Dine status:</span>
                  <span className="text-success font-bold">Encrypted QR Live</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={handleCloseQRModal}>
                  Close Window
                </Button>
                <a 
                  href={qrModalUrl} 
                  download={`maharaji-table-${qrModalNum}.png`}
                  className="w-full"
                >
                  <Button variant="primary" size="sm" className="w-full text-xs font-bold">
                    Download PNG
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
