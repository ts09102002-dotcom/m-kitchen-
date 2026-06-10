import React, { useState } from "react";
import { toast } from "sonner";
import { useStore } from "../store";
import { TableStatus, OrderItemStatus } from "../types";
import { Button, Card, EmptyState, Modal, FormInput } from "./PremiumUI";
import { ClipboardList, Printer, Download, CreditCard, CreditCard as Edit3, Check, TriangleAlert as AlertTriangle, Trash2, Sparkles, ShieldCheck, Percent, Clock } from "lucide-react";
import jsPDF from "jspdf";

export const DashboardActiveOrders: React.FC = () => {
  // Zustand States
  const orders = useStore(state => state.orders);
  const orderItems = useStore(state => state.orderItems);
  const menuItems = useStore(state => state.menuItems);
  const system = useStore(state => state.system);
  const posWidth = useStore(state => state.posWidth);
  const editBillItems = useStore(state => state.editBillItems);
  const editActiveOrderItems = useStore(state => state.editActiveOrderItems);
  const checkoutBill = useStore(state => state.checkoutBill);

  // Active active orders (excluding completed or cancelled)
  const activeOrders = orders.filter(o => o.status !== "completed" && o.status !== "cancelled");

  // Local UI States
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Edit Bill Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAdminCode, setEditAdminCode] = useState("");
  const [editCodeError, setEditCodeError] = useState<string | null>(null);
  const [isEditModeUnlocked, setIsEditModeUnlocked] = useState(false);
  const [editableItems, setEditableItems] = useState<{ menu_item_id: string; quantity: number; price: number }[]>([]);

  // Settlement Modal state
  const [settleTableNum, setSettleTableNum] = useState<number | null>(null);
  const [settleCouponCode, setSettleCouponCode] = useState("");
  const [settleCouponError, setSettleCouponError] = useState<string | null>(null);
  const [settleDiscount, setSettleDiscount] = useState(0);

  const handleOpenEditModal = (orderId: string) => {
    const list = orderItems.filter(oi => oi.order_id === orderId && oi.status === OrderItemStatus.CONFIRMED);
    const mapped = list.map(oi => ({
      menu_item_id: oi.menu_item_id,
      quantity: oi.quantity,
      price: oi.price
    }));
    
    setSelectedOrderId(orderId);
    setEditableItems(mapped);
    setEditAdminCode("");
    setEditCodeError(null);
    setIsEditModeUnlocked(false);
    setIsEditModalOpen(true);
  };

  const handleVerifyEditCode = () => {
    const requirement = system.receptionAuthCode; // '852' or custom
    if (editAdminCode === requirement) {
      setIsEditModeUnlocked(true);
      setEditCodeError(null);
    } else {
      setEditCodeError("Invalid 3-Digit captain authorization code!");
    }
  };

  const handleUpdateItemQty = (menu_item_id: string, dir: "add" | "sub") => {
    setEditableItems(prev => prev.map(item => {
      if (item.menu_item_id === menu_item_id) {
        const nextQty = dir === "add" ? item.quantity + 1 : Math.max(1, item.quantity - 1);
        return { ...item, quantity: nextQty };
      }
      return item;
    }));
  };

  const handleRemoveEditableItem = (menu_item_id: string) => {
    setEditableItems(prev => prev.filter(item => item.menu_item_id !== menu_item_id));
  };

  const handleSaveBillEdits = () => {
    if (!selectedOrderId) return;

    const success = editActiveOrderItems(selectedOrderId, editableItems, editAdminCode);

    if (success) {
      toast.success("Order items updated successfully.");
      setIsEditModalOpen(false);
      setIsEditModeUnlocked(false);
    } else {
      setEditCodeError("Authorization failed or order not found.");
    }
  };

  // Checkout settlement triggers
  const handleOpenSettleModal = (tableNum: number) => {
    setSettleTableNum(tableNum);
    setSettleCouponCode("");
    setSettleCouponError(null);
    setSettleDiscount(0);
  };

  const calculateSettleDiscount = (sub: number) => {
    if (!settleCouponCode.trim()) return;
    const val = useStore.getState().validateCoupon(settleCouponCode, sub);
    if (val.valid) {
      setSettleDiscount(val.discountAmount);
      setSettleCouponError(null);
    } else {
      setSettleCouponError(val.error || "Valid criteria not met.");
      setSettleDiscount(0);
    }
  };

  const handleFinalCheckout = () => {
    if (settleTableNum === null) return;
    checkoutBill(settleTableNum, settleCouponCode || undefined);
    toast.success(`Royal billing settled and Table ${settleTableNum} locked successfully!`);
    setSettleTableNum(null);
  };

  // LUXURIOUS HIGH-FIDELITY VECTOR PDF GENERATION (JSPDF)
  const generateThermalPDF = (tableNum: number, orderId: string) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: posWidth === "58mm" ? [58, 150] : [80, 180] // Fits 58mm POS thermal parameters
    });

    const list = orderItems.filter(oi => oi.order_id === orderId && oi.status === OrderItemStatus.CONFIRMED);
    const subtotal = list.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = subtotal; // Simulating no coupon initially on live view, or applies if requested

    const width = posWidth === "58mm" ? 58 : 80;

    // Header Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("MAHARAJI KITCHEN", width / 2, 8, { align: "center" });
    
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8);
    doc.text(system.tagline, width / 2, 12, { align: "center" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("Sukhanibasti, NH31C, West Bengal 735225", width / 2, 16, { align: "center" });
    doc.text("WhatsApp/Phone: +91 70764 30467", width / 2, 19, { align: "center" });
    
    doc.setLineWidth(0.1);
    doc.line(4, 22, width - 4, 22);

    // Metadata
    doc.setFontSize(7);
    doc.text(`Table No: ${tableNum}`, 5, 26);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, width - 18, 26);
    doc.text(`Bill Ref: MK-${Date.now().toString().slice(-6)}`, 5, 30);
    doc.text(`Time: ${new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "numeric" })}`, width - 18, 30);

    doc.line(4, 33, width - 4, 33);

    // Items Column Titles
    doc.setFont("Helvetica", "bold");
    doc.text("ITEM", 5, 37);
    doc.text("QTY", width - 20, 37);
    doc.text("PRICE", width - 10, 37, { align: "right" });
    doc.line(4, 39, width - 4, 39);

    doc.setFont("Helvetica", "normal");
    let y = 43;

    // Write Items
    list.forEach(oi => {
      const item = menuItems.find(mi => mi.id === oi.menu_item_id);
      const name = item?.name.slice(0, 16) || "Food item";
      
      doc.text(name, 5, y);
      doc.text(String(oi.quantity), width - 19, y);
      doc.text(`₹${(oi.price * oi.quantity).toFixed(0)}`, width - 10, y, { align: "right" });
      y += 5;
    });

    doc.line(4, y, width - 4, y);
    y += 4;

    // Subtotal and Grand Summary
    doc.text("Subtotal:", 5, y);
    doc.text(`₹${subtotal.toFixed(2)}`, width - 10, y, { align: "right" });
    
    y += 5;
    doc.setFont("Helvetica", "bold");
    doc.text("TOTAL AMOUNT:", 5, y);
    doc.text(`₹${finalTotal.toFixed(2)}`, width - 10, y, { align: "right" });
    
    y += 7;
    doc.setFont("Helvetica", "italic");
    doc.text("Thank You! Visit Again", width / 2, y, { align: "center" });

    doc.save(`maharaji-bill-table-${tableNum}.pdf`);
  };

  // Simulated ESC/POS Thermal Print view (pops open simple browser print window)
  const handlePrintThermal = (tableNum: number, orderId: string) => {
    const list = orderItems.filter(oi => oi.order_id === orderId && oi.status === OrderItemStatus.CONFIRMED);
    const subtotal = list.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const widthStyle = posWidth === "58mm" ? "302px" : "576px";

    const htmlContent = `
      <html>
        <head>
          <title>Print Maharaji Bill</title>
          <style>
            body {
              font-family: 'JetBrains Mono', monospace, Arial;
              margin: 0;
              padding: 10px;
              width: ${widthStyle};
              color: #1C1917;
            }
            .text-center { text-align: center; }
            .flex { display: flex; justify-content: space-between; }
            .border-b { border-bottom: 1px dashed #7B1E2B; margin: 4px 0; }
            .bold { font-weight: bold; }
            .item-line { margin: 2px 0; font-size: 13px; }
            .total-line { font-size: 15px; margin-top: 6px; font-weight: bold; }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body>
          <h3 class="text-center" style="margin:2px 0;">MAHARAJI KITCHEN</h3>
          <p class="text-center" style="font-size:11px; margin:2px 0; font-style: italic;">"${system.tagline}"</p>
          <p class="text-center" style="font-size:10px; margin:2px 0;">Sukhanibasti, NH31C, West Bengal 735225</p>
          <p class="text-center" style="font-size:10px; margin:2px 0;">WhatsApp: +91 70764 30467</p>
          
          <div class="border-b"></div>
          
          <div class="flex" style="font-size:11px;">
            <span>Table No: ${tableNum}</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
          <div class="flex" style="font-size:11px;">
            <span>Bill ID: MK-${orderId.slice(-6).toUpperCase()}</span>
            <span>Time: ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>

          <div class="border-b"></div>

          <table style="width:100%; font-size:12px; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left; font-weight: bold;">
                <th>ITEM</th>
                <th style="text-align: center;">QTY</th>
                <th style="text-align: right;">PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(oi => {
                const item = menuItems.find(mi => mi.id === oi.menu_item_id);
                return `
                  <tr>
                    <td>${item?.name || "Dishes"}</td>
                    <td style="text-align: center;">${oi.quantity}</td>
                    <td style="text-align: right;">₹${(oi.price * oi.quantity).toFixed(0)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>

          <div class="border-b"></div>

          <div class="flex" style="font-size:12px;">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div class="flex total-line">
            <span>GRAND TOTAL:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>

          <div class="border-b"></div>
          <p class="text-center" style="font-size:11px; font-style: italic; margin-top:8px;">Thank You! Visit Again</p>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. HEADER DESCRIPTION */}
      <div className="border-b border-gold-rich/10 pb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
            <ClipboardList className="w-5 h-5 text-gold-rich" />
            Active Dining Tables List
          </h3>
          <p className="text-xs text-mocha mt-1">
            Perform checkout checkout, generate print bills, or perform authorized modifications here.
          </p>
        </div>
        
        <div className="text-xs font-mono text-mocha bg-white p-2 rounded-lg border border-gold-rich/10 hidden sm:block">
          POS Width Profile: <span className="text-maroon-royal font-bold uppercase">{posWidth}</span>
        </div>
      </div>

      {/* 2. MAIN ACTIVE LAYOUT CARD FEED */}
      {activeOrders.length === 0 ? (
        <EmptyState 
          title="No Occupied Banquets" 
          message="There are no active orders in dine-in session currently. Go to Table Management to unlock a table and order!" 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeOrders.map(order => {
            const confirmedItems = orderItems.filter(oi => oi.order_id === order.id && oi.status === OrderItemStatus.CONFIRMED);
            const subtotal = confirmedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            if (confirmedItems.length === 0) return null;

            return (
              <Card key={order.id} className="p-5 bg-white border border-gold-rich/15 relative group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-royal-gradient" />

                {/* Card Title Header info */}
                <div className="flex justify-between items-start pb-3 mb-3 border-b border-gold-rich/5">
                  <div>
                    <span className="font-serif text-2xl font-black text-maroon-royal">Table {order.table_number}</span>
                    <span className="block text-[9px] text-mocha font-mono">ID: MK-{order.id.slice(-6).toUpperCase()}</span>
                  </div>

                  <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/30 px-2 py-0.5 rounded-lg font-mono font-bold animate-pulse-slow flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Active Course Queue
                  </span>
                </div>

                {/* Items Summaries lists */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 mb-4">
                  {confirmedItems.map((oi, idx) => {
                    const dish = menuItems.find(m => m.id === oi.menu_item_id);
                    return (
                      <div key={idx} className="flex justify-between text-xs text-espresso">
                        <span>{oi.quantity}x <span className="font-medium text-mocha">{dish?.name}</span></span>
                        <span className="font-mono text-mocha">₹{(oi.price * oi.quantity).toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Summary */}
                <div className="bg-cream-warm/15 p-3 rounded-xl border border-gold-rich/5 space-y-1.5 text-xs font-medium mb-4">
                  <div className="flex justify-between">
                    <span className="text-mocha">Accumulated Subtotal:</span>
                    <span className="font-mono text-espresso font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-maroon-royal text-sm pt-1 border-t border-gold-rich/5">
                    <span>Est. Bill:</span>
                    <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions row footer */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="py-2.5 text-[10px] uppercase font-bold flex items-center justify-center gap-1 border-maroon-royal/20 text-maroon-royal"
                    onClick={() => handleOpenEditModal(order.id)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit items</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="py-2.5 text-[10px] uppercase font-bold flex items-center justify-center gap-1 border-gold-rich/30 text-mocha hover:text-maroon-royal"
                    onClick={() => handlePrintThermal(order.table_number, order.id)}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Thermal POS</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="py-2.5 text-[10px] uppercase font-bold flex items-center justify-center gap-1 border-gold-rich/30 text-mocha hover:text-maroon-royal"
                    onClick={() => generateThermalPDF(order.table_number, order.id)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    className="py-2.5 text-[10px] uppercase font-bold flex items-center justify-center gap-1 bg-royal-gradient"
                    onClick={() => handleOpenSettleModal(order.table_number)}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-gold-shimmer animate-bounce" />
                    <span>Collect Payment</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* SECURE BLOCK FOR AUTH CODE BILL EDITS */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Captain Verification required"
      >
        <div className="space-y-4">
          {!isEditModeUnlocked ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-cream-warm/30 rounded-xl border border-gold-rich/10 text-xs text-mocha flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-gold-rich shrink-0" />
                <span>Editing confirmed billing elements requires Captain or Admin verification code string to construct audits. Default: <span className="font-bold text-maroon-royal">852</span>.</span>
              </div>

              <FormInput
                label="3-Digit Captain Code"
                type="password"
                maxLength={3}
                value={editAdminCode}
                onChange={(e) => setEditAdminCode(e.target.value)}
                placeholder="eg. 852"
                error={editCodeError || undefined}
              />

              <Button
                variant="gold"
                className="w-full text-xs py-3 uppercase tracking-wider font-bold"
                onClick={handleVerifyEditCode}
              >
                <ShieldCheck className="w-4 h-4 text-charcoal-deep" />
                <span>Verify Code</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="block text-xs font-bold text-maroon-royal uppercase tracking-wider mb-2">Edit Items Quantity</span>
              
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {editableItems.map(it => {
                  const dish = menuItems.find(m => m.id === it.menu_item_id);
                  return (
                    <div key={it.menu_item_id} className="flex items-center justify-between text-xs p-2.5 bg-white border border-gold-rich/5 rounded-xl">
                      <div>
                        <h5 className="font-bold text-espresso">{dish?.name}</h5>
                        <span className="font-mono text-[10px] text-mocha">₹{it.price} each</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-cream-warm/30 border rounded-lg p-0.5">
                          <button
                            onClick={() => handleUpdateItemQty(it.menu_item_id, "sub")}
                            className="p-1 rounded bg-white text-espresso hover:bg-cream-warm"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold text-espresso w-4 text-center">{it.quantity}</span>
                          <button
                            onClick={() => handleUpdateItemQty(it.menu_item_id, "add")}
                            className="p-1 rounded bg-white text-espresso hover:bg-cream-warm"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveEditableItem(it.menu_item_id)}
                          className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gold-rich/10">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsEditModalOpen(false)}>
                  Cancel Edit
                </Button>
                <Button variant="primary" size="sm" className="text-xs font-bold uppercase" onClick={handleSaveBillEdits}>
                  Save changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* SETTLEMENT AND PAYMENTS WINDOW MODAL */}
      <Modal
        isOpen={settleTableNum !== null}
        onClose={() => setSettleTableNum(null)}
        title="Receive Payment & Close sitting"
      >
        {settleTableNum !== null && (() => {
          const activeOrder = orders.find(o => o.table_number === settleTableNum && o.status !== "completed" && o.status !== "cancelled");
          const itemsList = orderItems.filter(oi => oi.order_id === activeOrder?.id && oi.status === OrderItemStatus.CONFIRMED);
          const subtotal = itemsList.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          const totalAfterDiscount = Math.max(0, subtotal - settleDiscount);

          return (
            <div className="space-y-4">
              <div className="text-center pb-2 mb-2 border-b border-gold-rich/5">
                <span className="block text-[10px] text-mocha uppercase font-bold font-mono">DINING SLOT</span>
                <span className="font-serif text-3xl font-black text-maroon-royal">Table {settleTableNum}</span>
              </div>

              {/* Promo code block for discount settlements */}
              <div className="p-3 bg-white border border-gold-rich/10 rounded-xl space-y-2.5">
                <span className="block text-[10px] text-mocha font-bold uppercase tracking-wider flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-gold-rich" /> Apply Customer Coupon Code (Optional)
                </span>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon eg. WELCOME100"
                    value={settleCouponCode}
                    onChange={(e) => setSettleCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 text-xs border border-gold-rich/20 rounded-lg uppercase font-mono text-espresso"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] py-1 px-3.5 bg-cream-warm/20"
                    onClick={() => calculateSettleDiscount(subtotal)}
                  >
                    Apply code
                  </Button>
                </div>
                {settleCouponError && (
                  <span className="block text-[10px] text-danger font-medium pl-1">{settleCouponError}</span>
                )}
                {settleDiscount > 0 && (
                  <span className="block text-[10px] text-success font-semibold pl-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Valid Code! Deducted ₹{settleDiscount.toFixed(2)} on checkout.
                  </span>
                )}
              </div>

              {/* Total calculations receipt sheet */}
              <div className="p-3 bg-cream-warm/25 rounded-xl border border-gold-rich/5 text-xs space-y-1.5 font-sans font-medium">
                <div className="flex justify-between">
                  <span className="text-mocha">Session Subtotals:</span>
                  <span className="font-mono text-espresso">₹{subtotal.toFixed(2)}</span>
                </div>
                {settleDiscount > 0 && (
                  <div className="flex justify-between text-[#059669]">
                    <span>Coupon Discount:</span>
                    <span className="font-mono">-₹{settleDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base text-maroon-royal pt-1.5 border-t border-gold-rich/10 flex items-baseline">
                  <span>Grand Total due:</span>
                  <span className="font-mono text-lg font-black">₹{totalAfterDiscount.toFixed(2)}</span>
                </div>
              </div>

              {/* Confirm checkouts buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSettleTableNum(null)}>
                  Abort
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="text-xs font-bold uppercase tracking-wider bg-royal-gradient text-white flex items-center justify-center gap-1"
                  onClick={handleFinalCheckout}
                >
                  <Check className="w-4 h-4 text-gold-light" />
                  <span>Settle & Lock Table</span>
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

    </div>
  );
};
