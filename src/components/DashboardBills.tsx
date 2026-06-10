import React, { useState } from "react";
import { useStore } from "../store";
import { Button, Card, EmptyState, Modal } from "./PremiumUI";
import { FileText, Printer, Download, Eye, Clock, ShieldCheck, History, Search } from "lucide-react";
import jsPDF from "jspdf";

export const DashboardBills: React.FC = () => {
  // Zustand States
  const bills = useStore(state => state.bills);
  const billEditsLog = useStore(state => state.billEditsLog);
  const menuItems = useStore(state => state.menuItems);
  const system = useStore(state => state.system);
  const posWidth = useStore(state => state.posWidth);

  // States
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCloseInspector = () => {
    setSelectedBillId(null);
  };

  const activeBill = bills.find(b => b.id === selectedBillId);
  const activeBillEdits = billEditsLog.filter(log => log.bill_id === selectedBillId);

  // Re-usable High-Fidelity PDF Past Invoice download
  const handleDownloadPastPDF = (billNo: string, tableNum: number, subtotal: number, disc: number, total: number) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: posWidth === "58mm" ? [58, 150] : [80, 180]
    });

    const width = posWidth === "58mm" ? 58 : 80;

    // Headings
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("MAHARAJI KITCHEN", width / 2, 8, { align: "center" });

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.text(system.tagline, width / 2, 11, { align: "center" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6);
    doc.text("NH31C Sukhanibasti, West Bengal", width / 2, 14, { align: "center" });
    
    doc.setLineWidth(0.1);
    doc.line(4, 17, width - 4, 17);

    // Meta
    doc.setFontSize(6.5);
    doc.text(`Table No: ${tableNum}`, 5, 21);
    doc.text(`Invoice: ${billNo}`, 5, 25);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, width - 20, 21);
    doc.text("Type: Settlement Paid", width - 20, 25);

    doc.line(4, 28, width - 4, 28);

    doc.setFont("Helvetica", "bold");
    doc.text("STATEMENT DESCRIPTION", 5, 32);
    doc.text("AMOUNT", width - 8, 32, { align: "right" });
    doc.line(4, 34, width - 4, 34);

    doc.setFont("Helvetica", "normal");
    doc.text("Dine-In Royal Banquet Course", 5, 39);
    doc.text(`₹${subtotal.toFixed(0)}`, width - 8, 39, { align: "right" });

    if (disc > 0) {
      doc.text("Promo Discount Coupon:", 5, 44);
      doc.text(`-₹${disc.toFixed(0)}`, width - 8, 44, { align: "right" });
    }

    doc.line(4, 48, width - 4, 48);

    doc.setFont("Helvetica", "bold");
    doc.text("GRAND SETTLED TOTAL:", 5, 53);
    doc.setFontSize(8.5);
    doc.text(`₹${total.toFixed(2)}`, width - 8, 53, { align: "right" });

    doc.setFontSize(6.5);
    doc.setFont("Helvetica", "italic");
    doc.text("System Invoice Closed", width / 2, 60, { align: "center" });

    doc.save(`maharaji-past-invoice-${billNo}.pdf`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="border-b border-gold-rich/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
            <FileText className="w-5 h-5 text-gold-rich" />
            Billing Ledger & Closed Archive
          </h3>
          <p className="text-xs text-mocha mt-1">
            Browse structured historical receipts checkouts, inspect item registers, and query supervisor audit records.
          </p>
        </div>

        {/* Filter input */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-mocha" />
          <input
            type="text"
            placeholder="Search by Bill No (eg. MK-2026)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gold-rich/20 focus:outline-none"
          />
        </div>
      </div>

      {/* 2. CHRONOLOGICAL SETTLED ARCHIVE LIST */}
      {bills.length === 0 ? (
        <EmptyState 
          title="Archive is Empty" 
          message="No customer sittings have compiled checkout payments yet. Approve and checkout an active diner first!" 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills
            .filter(b => b.bill_number.toLowerCase().includes(searchQuery.toLowerCase()))
            .reverse() // Newest on top
            .map(bill => (
              <Card key={bill.id} className="p-4 bg-white border border-gold-rich/15 hover:border-gold-rich/35 relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start pb-2 border-b border-gold-rich/5 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-maroon-royal block select-all">{bill.bill_number}</span>
                      <span className="text-[9px] text-mocha font-mono">Table {bill.table_number} slot</span>
                    </div>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-lg font-mono font-bold bg-[#059669]/10 text-[#059669]">
                      ✓ Paid
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-mocha">Subtotal:</span>
                      <span className="font-mono text-espresso font-medium">₹{bill.subtotal.toFixed(2)}</span>
                    </div>
                    {bill.discount > 0 && (
                      <div className="flex justify-between text-[#059669]">
                        <span>Discount ({bill.coupon_code}):</span>
                        <span className="font-mono">-₹{bill.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-espresso pt-1.5 border-t border-gold-rich/5 text-sm">
                      <span>Total collect:</span>
                      <span className="font-mono text-maroon-royal">₹{bill.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3.5 mt-3.5 border-t border-gold-rich/10 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 px-3 text-[10px] uppercase font-bold flex items-center justify-center gap-1 border-gold-rich/20 text-mocha hover:text-maroon-royal"
                    onClick={() => handleDownloadPastPDF(bill.bill_number, bill.table_number, bill.subtotal, bill.discount, bill.total)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Invoices</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    className="py-1.5 px-3.5 text-[10px] uppercase font-bold flex items-center justify-center gap-1"
                    onClick={() => setSelectedBillId(bill.id)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>details</span>
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* IMMUTABLE DETAILED INVOICE INSPECTOR POPUP */}
      <Modal
        isOpen={selectedBillId !== null}
        onClose={handleCloseInspector}
        title="Royal Invoice Audit"
      >
        {activeBill && (
          <div className="space-y-4">
            
            {/* Header branding */}
            <div className="text-center bg-[#FAF7F2] p-4 rounded-2xl border border-gold-rich/10 relative overflow-hidden">
              <span className="font-serif font-black tracking-tight text-maroon-royal text-sm block">MAHARAJI KITCHEN</span>
              <span className="text-[9px] text-mocha font-serif font-bold tracking-widest block uppercase mt-0.5">{system.tagline}</span>
              <span className="text-[10px] font-mono text-espresso font-bold mt-2 truncate max-w-xs block mx-auto select-all bg-white/50 p-1 rounded">
                Ref No: {activeBill.bill_number}
              </span>
            </div>

            {/* Bill core data rows */}
            <div className="space-y-1.5 text-xs border-b border-gold-rich/10 pb-4 pr-1">
              <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider mb-2">Checkout Breakdown</span>
              <div className="flex justify-between">
                <span className="text-mocha">Table Service Spot:</span>
                <span className="font-mono text-espresso font-bold">Table {activeBill.table_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mocha">Settlement Closed:</span>
                <span className="font-mono text-espresso font-bold">
                  {activeBill.closed_at ? new Date(activeBill.closed_at).toLocaleString("en-IN", { hour12: true }) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mocha">Subtotal Amount:</span>
                <span className="font-mono text-espresso font-bold">₹{activeBill.subtotal.toFixed(2)}</span>
              </div>
              {activeBill.discount > 0 && (
                <div className="flex justify-between text-[#059669]">
                  <span>Applied Promo Coupon ({activeBill.coupon_code}):</span>
                  <span className="font-mono font-bold">-₹{activeBill.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] font-bold text-maroon-royal pt-1.5 border-t border-dashed border-gold-rich/20">
                <span>Grand Final Settled:</span>
                <span className="font-mono">₹{activeBill.total.toFixed(2)}</span>
              </div>
            </div>

            {/* 3. CAPTAIN MODIFICATION LOGS CHRONICLE */}
            {activeBillEdits.length > 0 && (
              <div className="p-3 bg-red-50/50 border border-red-200/50 rounded-xl space-y-1.5">
                <h5 className="text-[9px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Captain Modification Log Tracked
                </h5>
                {activeBillEdits.map((log, idx) => {
                  const beforeObj = JSON.parse(log.before_json);
                  return (
                    <div key={idx} className="text-[10px] text-red-950 font-mono leading-relaxed space-y-0.5">
                      <div>• Edited by <span className="font-bold">{log.user_name}</span> at {new Date(log.timestamp).toLocaleTimeString()}</div>
                      <div className="bg-white/60 p-1 border border-red-200/30 rounded">
                        <div>BEFORE subtotal = <span className="font-bold">₹{beforeObj.subtotal?.toFixed(2)}</span></div>
                        <div>AFTER subtotal = <span className="font-bold">₹{activeBill.subtotal.toFixed(2)}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action check-outs */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="ghost" size="sm" className="text-xs" onClick={handleCloseInspector}>
                Dismiss Panel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs font-bold uppercase"
                onClick={() => handleDownloadPastPDF(activeBill.bill_number, activeBill.table_number, activeBill.subtotal, activeBill.discount, activeBill.total)}
              >
                Download Receipt
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
