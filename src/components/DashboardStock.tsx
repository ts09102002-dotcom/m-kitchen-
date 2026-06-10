import React, { useState } from "react";
import { useStore } from "../store";
import { Button, Card, FormInput, VoiceSearchMic } from "./PremiumUI";
import { Package, Plus, Trash2, Search, Download, Calendar, ArrowUpRight, TrendingUp } from "lucide-react";

export const DashboardStock: React.FC = () => {
  // Zustand States
  const stockPurchases = useStore(state => state.stockPurchases);
  const addStockEntry = useStore(state => state.addStockEntry);
  const deleteStockEntry = useStore(state => state.deleteStockEntry);

  // Form States
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("kg");
  const [unitPrice, setUnitPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");

  // Search Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("all");

  const computedTotal = (parseFloat(qty) || 0) * (parseFloat(unitPrice) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = parseFloat(qty);
    const priceVal = parseFloat(unitPrice);

    if (!itemName || isNaN(qtyVal) || isNaN(priceVal)) {
      alert("Please enter Name, Quantity and Unit Price!");
      return;
    }

    addStockEntry({
      date: new Date().toISOString(),
      item_name: itemName,
      quantity: qtyVal,
      unit,
      unit_price: priceVal,
      supplier,
      notes: notes || undefined
    });

    // Reset Form
    setItemName("");
    setQty("");
    setUnitPrice("");
    setSupplier("");
    setNotes("");
  };

  // Autocomplete hints from previous distinct items
  const uniqueItemSuggestions = Array.from(new Set(stockPurchases.map(s => s.item_name)));

  // Calculate stats KPIs
  const totalStockValue = stockPurchases.reduce((acc, s) => acc + s.total, 0);
  
  const todayPrefix = new Date().toISOString().slice(0, 10);
  const todayPurchases = stockPurchases
    .filter(s => s.date.startsWith(todayPrefix))
    .reduce((acc, s) => acc + s.total, 0);

  // Filter lists
  const filteredStock = stockPurchases.filter(stock => {
    const matchesSearch = stock.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stock.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnit = selectedUnit === "all" || stock.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  // Export CSV download function
  const handleExportCSV = () => {
    const headers = ["Date", "Item Name", "Qty", "Unit", "Unit Price (INR)", "Total Value (INR)", "Supplier", "Notes"];
    const rows = filteredStock.map(s => [
      new Date(s.date).toLocaleDateString(),
      s.item_name,
      s.quantity,
      s.unit,
      s.unit_price,
      s.total,
      s.supplier,
      s.notes || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maharaji_stock_invoice_${todayPrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="border-b border-gold-rich/10 pb-4">
        <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
          <Package className="w-5 h-5 text-gold-rich" />
          Raw Materials Stock & Ledger
        </h3>
        <p className="text-xs text-mocha mt-1">
          Add operational kitchen ingredient purchases, monitor supplier costs, and compile CSV balance logs.
        </p>
      </div>

      {/* 2. STATS KPI TICKERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-gold-rich/10">
          <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider">Today's Purchases</span>
          <h4 className="font-mono text-lg font-black text-maroon-royal mt-1">₹{todayPurchases.toFixed(2)}</h4>
          <span className="text-[10px] text-success font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Checked in today
          </span>
        </Card>

        <Card className="p-4 bg-white border border-gold-rich/10">
          <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider">Stock Assets Capital</span>
          <h4 className="font-mono text-lg font-black text-maroon-royal mt-1">₹{totalStockValue.toFixed(2)}</h4>
          <span className="text-[10px] text-mocha font-medium mt-1 block">Cumulative purchase records</span>
        </Card>

        <Card className="p-4 bg-white border border-gold-rich/10">
          <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider">Direct suppliers</span>
          <h4 className="font-mono text-lg font-black text-maroon-royal mt-1">
            {Array.from(new Set(stockPurchases.map(s => s.supplier))).filter(Boolean).length} Active
          </h4>
          <span className="text-[10px] text-mocha font-medium mt-1 block">Primary logistics links</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#1C1917] to-charcoal-soft text-cream-ivory border-gold-rich/20">
          <span className="block text-[8px] text-gold-shimmer/75 font-bold uppercase tracking-wider">Ledger Size</span>
          <h4 className="font-mono text-lg font-black text-white mt-1">{stockPurchases.length} Lines</h4>
          <span className="text-[10px] text-gold-light mt-1 block font-mono">Invoice indices logged</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column (4 cols) form parameters */}
        <div className="lg:col-span-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
            Record New Purchase
          </h4>

          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-gold-rich/10 shadow-sm space-y-4">
            
            <div className="relative mb-4">
              <FormInput
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="eg. Basmati rice, Mustard oil"
                required
              />
              {/* Intelligent dynamic autocomplete hint bar */}
              {itemName && uniqueItemSuggestions.filter(s => s.toLowerCase().startsWith(itemName.toLowerCase()) && s !== itemName).length > 0 && (
                <div className="absolute top-12 inset-x-0 bg-[#FAF7F2] border border-gold-rich/25 rounded-md text-[10px] p-2 flex gap-1 z-10 w-full flex-wrap shadow">
                  <span className="font-bold text-maroon-royal uppercase font-mono">Suggestions:</span>
                  {uniqueItemSuggestions
                    .filter(s => s.toLowerCase().startsWith(itemName.toLowerCase()) && s !== itemName)
                    .map(s => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setItemName(s)}
                        className="bg-white px-1.5 py-0.5 rounded cursor-pointer hover:bg-cream-warm"
                      >
                        {s}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Quantity"
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="eg. 25"
                required
              />

              <div className="relative mb-5 font-sans">
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Standard Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich bg-white"
                >
                  <option value="kg">kilograms (kg)</option>
                  <option value="litres">Litres (L)</option>
                  <option value="bag">Bags (pcs)</option>
                  <option value="units">Cans / Units</option>
                </select>
              </div>
            </div>

            <FormInput
              label="Unit Price (₹)"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="price per unit"
              required
            />

            <FormInput
              label="Supplier Title"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Merchant or farmer name"
            />

            <FormInput
              label="Additional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Storage or grade notes"
            />

            {/* Read-only dynamically derived cost summary */}
            <div className="p-3 bg-cream-warm/20 rounded-xl text-xs font-medium space-y-1 border border-gold-rich/5">
              <div className="flex justify-between text-mocha">
                <span>Calculated cost:</span>
                <span className="font-mono text-espresso font-bold">₹{computedTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-xs uppercase font-bold tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Record stock checkin</span>
            </Button>
          </form>
        </div>

        {/* Right ledger list table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gold-rich/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
              Purchases ledger
            </h4>

            {/* Quick Filter actions */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-mocha" />
                <input
                  type="text"
                  placeholder="Filter stock entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-gold-rich/10 bg-white rounded-lg select-none"
                />
              </div>
              <VoiceSearchMic onResults={(v) => setSearchQuery(v)} />
              <Button
                variant="ghost"
                size="sm"
                className="py-1 px-3 text-xs flex items-center gap-1 bg-white shadow-sm border-gold-rich/15 text-mocha hover:text-maroon-royal"
                onClick={handleExportCSV}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {filteredStock.length === 0 ? (
            <div className="text-center p-8 bg-white border border-gold-rich/5 rounded-2xl">
              <span className="text-xl">📦</span>
              <h5 className="font-serif text-sm font-bold text-maroon-royal mt-1">Empty Stock Ledger</h5>
              <p className="text-[10px] text-mocha leading-relaxed mt-0.5">No raw material matches the search keywords.</p>
            </div>
          ) : (
            <div className="bg-white border border-gold-rich/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[9px] uppercase font-bold tracking-wider text-maroon-royal border-b border-gold-rich/10">
                      <th className="p-3">Received</th>
                      <th className="p-3">Particulars</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3">Gross Total</th>
                      <th className="p-3">Merchant</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-rich/5 text-xs">
                    {filteredStock.map(s => (
                      <tr key={s.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                        <td className="p-3 text-mocha">{new Date(s.date).toLocaleDateString()}</td>
                        <td className="p-3 font-semibold text-espresso">{s.item_name}</td>
                        <td className="p-3 font-mono font-bold text-espresso">{s.quantity} {s.unit}</td>
                        <td className="p-3 font-mono text-mocha">₹{s.unit_price} /unit</td>
                        <td className="p-3 font-mono font-bold text-maroon-royal font-black">₹{s.total.toFixed(0)}</td>
                        <td className="p-3 text-mocha truncate max-w-[100px]">{s.supplier || "Cash/Direct"}</td>
                        <td className="p-3">
                          <button
                            onClick={() => deleteStockEntry(s.id)}
                            className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
