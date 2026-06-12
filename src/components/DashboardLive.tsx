import React from "react";
import { useStore } from "../store";
import { OrderItemStatus, TableStatus } from "../types";
import { Button, Card, EmptyState } from "./PremiumUI";
import { Plus, ShoppingBag, Check, X, BellRing, Utensils, IndianRupee, Grid2x2 as Grid, Clock, Flame, ShieldCheck, TrendingUp, FileSpreadsheet, Sparkles } from "lucide-react";

export const DashboardLive: React.FC = () => {
  const setActiveTab = useStore(state => state.setActiveTab);

  // Zustand bindings
  const orders = useStore(state => state.orders);
  const orderItems = useStore(state => state.orderItems);
  const menuItems = useStore(state => state.menuItems);
  const tables = useStore(state => state.tables);
  const bills = useStore(state => state.bills);

  const approvePending = useStore(state => state.approvePendingItem);
  const rejectPending = useStore(state => state.rejectPendingItem);
  const updateStatus = useStore(state => state.updateOrderStatus);

  // Filter Active orders (pending, preparing, cooking, served)
  const activeOrders = orders.filter(o => o.status !== "completed" && o.status !== "cancelled");

  // Sum active pending approvals of items (status = pending_approval)
  const pendingApprovalsList = orderItems.filter(oi => oi.status === OrderItemStatus.PENDING_APPROVAL);

  // Calculate Today's settled bills revenue (using local date for India timezone)
  const now = new Date();
  const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todaysBills = bills.filter(b => {
    if (!b.closed_at) return false;
    const billDate = b.closed_at.slice(0, 10);
    return billDate === todayLocal;
  });
  const todayRevenue = todaysBills.reduce((acc, b) => acc + b.total, 0);

  // Count active occupied tables (status = active)
  const occupiedTables = tables.filter(t => t.status === TableStatus.ACTIVE).length;

  const handleUpdateStatus = (orderId: string, current: string) => {
    let nextStatus: typeof orders[0]["status"] = "preparing";
    if (current === "pending") nextStatus = "preparing";
    else if (current === "preparing") nextStatus = "cooking";
    else if (current === "cooking") nextStatus = "served";
    else if (current === "served") nextStatus = "completed";

    updateStatus(orderId, nextStatus);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. TOP DYNAMIC KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="bg-gradient-to-br from-maroon-royal to-maroon-deep text-cream-ivory border-gold-rich/30 relative overflow-hidden p-5">
          <div className="absolute right-3 top-3 opacity-15"><IndianRupee className="w-12 h-12" /></div>
          <span className="text-[10px] text-gold-shimmer/70 font-bold uppercase tracking-wider">Today's Revenue</span>
          <h3 className="font-mono text-xl md:text-2xl font-black mt-1 text-white">
            ₹{todayRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] text-gold-light mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Based on {todaysBills.length} settled tickets</span>
          </div>
        </Card>

        <Card className="bg-white border-gold-rich/10 relative overflow-hidden p-5">
          <div className="absolute right-3 top-3 text-gold-rich/25"><ShoppingBag className="w-12 h-12" /></div>
          <span className="text-[10px] text-mocha font-bold uppercase tracking-wider">Kitchen Queue</span>
          <h3 className="font-mono text-xl md:text-2xl font-black mt-1 text-maroon-royal">
            {activeOrders.length} Tickets
          </h3>
          <div className="text-[10px] text-mocha mt-2 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gold-rich animate-spin-slow" />
            <span>Active dine-in courses</span>
          </div>
        </Card>

        <Card className="bg-white border-gold-rich/10 relative overflow-hidden p-5">
          <div className="absolute right-3 top-3 text-gold-rich/25"><Grid className="w-12 h-12" /></div>
          <span className="text-[10px] text-mocha font-bold uppercase tracking-wider">Occupied Tables</span>
          <h3 className="font-mono text-xl md:text-2xl font-black mt-1 text-maroon-royal">
            {occupiedTables} / 20 Seats
          </h3>
          <div className="text-[10px] text-mocha mt-2 font-medium">
            <span>Sittings operational in hall</span>
          </div>
        </Card>

        <Card className="bg-white border-gold-rich/15 relative overflow-hidden p-5 ring-2 ring-warning/10">
          <div className="absolute right-3 top-3 text-warning/25"><BellRing className="w-12 h-12 animate-bounce" /></div>
          <span className="text-[10px] text-mocha font-bold uppercase tracking-wider">Pending Approvals</span>
          <h3 className={`font-mono text-xl md:text-2xl font-black mt-1 ${pendingApprovalsList.length > 0 ? "text-warning animate-pulse" : "text-maroon-royal"}`}>
            {pendingApprovalsList.length} Items
          </h3>
          <div className="text-[10px] text-mocha mt-2 font-medium">
            <span>Additional requests pending</span>
          </div>
        </Card>
      </div>

      {/* 2. CHASSIS COLS GRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (60%): Incoming Orders feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gold-rich/15">
            <h3 className="font-serif text-lg font-bold text-maroon-royal flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-maroon-royal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-maroon-royal"></span>
              </span>
              Incoming Orders Feed
            </h3>
            <span className="px-2.5 py-1 text-[10px] rounded-full bg-cream-warm text-espresso font-mono font-medium">
              Live updates
            </span>
          </div>

          {activeOrders.length === 0 ? (
            <EmptyState 
              title="Awaiting Incoming Orders" 
              message="No dining cart has triggered orders yet. Open a table QR code and send items from the customer menu!" 
            />
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {activeOrders.map(order => {
                // Find order items associated
                const itemsList = orderItems.filter(oi => oi.order_id === order.id && oi.status === OrderItemStatus.CONFIRMED);
                const orderTotal = itemsList.reduce((sum, item) => sum + item.price * item.quantity, 0);

                if (itemsList.length === 0) return null;

                return (
                  <Card key={order.id} className="p-4 bg-white border border-gold-rich/15 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1 bg-royal-gradient" />
                    
                    {/* Header */}
                    <div className="flex justify-between items-start pb-2 mb-2 border-b border-gold-rich/5">
                      <div>
                        <span className="px-2 py-0.5 rounded-lg bg-royal-gradient text-white text-[10px] font-bold">
                          Table {order.table_number}
                        </span>
                        <span className="text-[10px] text-mocha font-mono pl-2">
                          {new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "numeric" })}
                        </span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg font-mono ${
                        order.status === "pending" ? "bg-warning/15 text-warning" :
                        order.status === "preparing" ? "bg-maroon-light/10 text-maroon-light" :
                        order.status === "cooking" ? "bg-info/10 text-info" : "bg-success/15 text-success"
                      }`}>
                        {order.status === "pending" ? "Received" : order.status}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1.5 py-1">
                      {itemsList.map((oi, idx) => {
                        const mItem = menuItems.find(mi => mi.id === oi.menu_item_id);
                        return (
                          <div key={idx} className="flex justify-between text-xs text-espresso">
                            <span className="font-semibold">{oi.quantity}x {mItem?.name}</span>
                            <span className="font-mono text-mocha">₹{(oi.price * oi.quantity).toFixed(0)}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions and Total */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-gold-rich/10">
                      <div>
                        <span className="block text-[8px] text-mocha font-bold uppercase">Total Order</span>
                        <span className="font-mono font-bold text-maroon-royal text-sm">₹{orderTotal.toFixed(2)}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("checkout")}
                          className="px-3 py-1 text-[10px]"
                        >
                          View Bill
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, order.status)}
                          className="px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-bold"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>
                            {order.status === "pending" ? "Mark Preparing" :
                             order.status === "preparing" ? "Mark Cooking" :
                             order.status === "cooking" ? "Mark Served" : "Done / Complete"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (40%): Supplemental approvals feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gold-rich/15">
            <h3 className="font-serif text-lg font-bold text-maroon-royal flex items-center gap-2">
              <BellRing className="w-4.5 h-4.5 text-gold-rich animate-bell-shake" />
              Pending Approvals
            </h3>
            <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-[9px] uppercase font-bold font-mono tracking-wider">
              Requires validation
            </span>
          </div>

          {pendingApprovalsList.length === 0 ? (
            <div className="text-center p-8 bg-white border border-gold-rich/5 rounded-2xl">
              <span className="block text-xl mb-1.5"><Sparkles className="w-6 h-6 text-gold-rich mx-auto" /></span>
              <h5 className="font-serif text-sm font-bold text-maroon-royal">All Clearance Complete</h5>
              <p className="text-[11px] text-mocha leading-relaxed mt-0.5">
                No supplemental course additions are awaiting verification. Good to go!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {pendingApprovalsList.map(item => {
                const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
                // Find order associated to table
                const sourceOrder = orders.find(o => o.id === item.order_id);

                return (
                  <div 
                    key={item.id} 
                    className="p-4 bg-white border rounded-2xl relative shadow-md animate-pending-blink border-orange-500 overflow-hidden"
                  >
                    <div className="flex justify-between items-start pb-2.5 mb-2.5 border-b border-gold-rich/10">
                      <div>
                        <span className="text-xl font-serif font-black text-maroon-royal block">
                          Table {sourceOrder?.table_number || "Hall"}
                        </span>
                        <span className="text-[9px] text-mocha font-mono leading-none">
                          Added live from phone scan
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 text-[9px] uppercase font-bold tracking-wider animate-pulse">
                        Wants Addition
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-cream-warm/15 p-2 rounded-xl mb-4 border border-gold-rich/5">
                      <div>
                        <h4 className="font-sans text-xs font-bold text-espresso">{menuItem?.name}</h4>
                        <span className="text-[10px] text-mocha font-serif font-bold">Qty: {item.quantity}  price: ₹{item.price}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-maroon-royal">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>

                    {/* Accept Reject Actions */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => rejectPending(item.id)}
                        className="py-2.5 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1 border-opacity-40"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => approvePending(item.id)}
                        className="py-2.5 text-xs bg-success text-white border-success/40 flex items-center justify-center gap-1 shadow-lg shadow-success/15"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 3. QUICK ACTION BOTTOM STRIP */}
      <div className="pt-4 mt-4 border-t border-gold-rich/15 flex flex-wrap gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] font-bold uppercase tracking-wider bg-white shadow-sm"
          onClick={() => setActiveTab("menu")}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Menu Item</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] font-bold uppercase tracking-wider bg-white shadow-sm"
          onClick={() => setActiveTab("stock")}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Stock Entry</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] font-bold uppercase tracking-wider bg-white shadow-sm"
          onClick={() => setActiveTab("stats")}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Open Today's Sales</span>
        </Button>
      </div>

    </div>
  );
};
