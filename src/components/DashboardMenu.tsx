import React, { useState } from "react";
import { useStore, generateDescription, getFoodImage } from "../store";
import { Button, Card, EmptyState, Modal, FormInput } from "./PremiumUI";
import { 
  ChefHat, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  Flame, 
  Eye, 
  BadgeHelp,
  UtensilsCrossed, 
  Image as ImageIcon 
} from "lucide-react";

export const DashboardMenu: React.FC = () => {
  // Zustand States
  const categories = useStore(state => state.categories);
  const menuItems = useStore(state => state.menuItems);

  const addCategory = useStore(state => state.addCategory);
  const deleteCategory = useStore(state => state.deleteCategory);
  
  const addMenuItem = useStore(state => state.addMenuItem);
  const editMenuItem = useStore(state => state.editMenuItem);
  const deleteMenuItem = useStore(state => state.deleteMenuItem);

  // Local UI toggle active tab (categories vs menu_items)
  const [activeSubTab, setActiveSubTab] = useState<"items" | "categories">("items");

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Menu Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory_id, setNewItemCategory_id] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [generatedDesc, setGeneratedDesc] = useState("");
  const [generatedImg, setGeneratedImg] = useState("");
  const [isStepTwoGenerate, setIsStepTwoGenerate] = useState(false);

  // Handle category saves
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory(newCatName, newCatDesc || undefined);
    setNewCatName("");
    setNewCatDesc("");
    setIsCatModalOpen(false);
  };

  // Step 1: Input name and price for menu items, compile preview
  const handleTriggerGenerator = () => {
    if (!newItemName.trim() || !newItemCategory_id || !newItemPrice) {
      alert("Please enter Name, Category and Price!");
      return;
    }

    const matchedCategory = categories.find(c => c.id === newItemCategory_id);
    const resolvedDesc = generateDescription(newItemName, matchedCategory?.name || "Indian Mains");
    const resolvedImg = getFoodImage(newItemName);

    setGeneratedDesc(resolvedDesc);
    setGeneratedImg(resolvedImg);
    setIsStepTwoGenerate(true);
  };

  // Step 2: Confirm or override generated elements
  const handleSaveGeneratedItem = () => {
    const priceVal = parseFloat(newItemPrice);
    if (isNaN(priceVal)) return;

    addMenuItem(newItemName, newItemCategory_id, priceVal, generatedDesc, generatedImg);

    // Reset states
    setNewItemName("");
    setNewItemCategory_id("");
    setNewItemPrice("");
    setGeneratedDesc("");
    setGeneratedImg("");
    setIsStepTwoGenerate(false);
    setIsItemModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* 2. TAB TOGGLES HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-rich/10 pb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
            <ChefHat className="w-5 h-5 text-gold-rich" />
            Kitchen Recipes Cabinet
          </h3>
          <p className="text-xs text-mocha mt-1">
            Build categories or generate new recipe cards with Unsplash image lookups.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-cream-warm/40 p-1.5 rounded-xl border border-gold-rich/10">
          <button
            onClick={() => setActiveSubTab("items")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
              activeSubTab === "items"
                ? "bg-royal-gradient text-white shadow"
                : "text-mocha"
            }`}
          >
            Recipe Items ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
              activeSubTab === "categories"
                ? "bg-royal-gradient text-white shadow"
                : "text-mocha"
            }`}
          >
            Dishes Categories ({categories.length})
          </button>
        </div>
      </div>

      {activeSubTab === "items" ? (
        // SUBPAGE A: MENU RECIPES ITEMS LIST
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gold-rich/10">
            <span className="text-xs text-mocha font-medium">Auto-Description template engine is fully operational.</span>
            <Button
              variant="gold"
              size="sm"
              className="py-2 text-xs font-bold uppercase"
              onClick={() => {
                setIsStepTwoGenerate(false);
                setNewItemName("");
                setNewItemPrice("");
                setIsItemModalOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Recipe Item</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {menuItems.map(item => {
              const matchedCat = categories.find(c => c.id === item.category_id);
              return (
                <Card key={item.id} className="p-3 bg-white relative flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gold-rich" />
                  
                  {/* Food visual representation space */}
                  <div className="h-28 rounded-xl bg-cream-warm relative overflow-hidden mb-3.5">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-charcoal-deep/80 text-white text-[9px] uppercase tracking-wide">
                      {matchedCat?.name || "Dish"}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-espresso leading-tight">{item.name}</h4>
                      <p className="text-[11px] text-mocha line-clamp-2 mt-0.5 leading-relaxed min-h-[32px]">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gold-rich/5 mt-2">
                      <span className="font-mono font-bold text-maroon-royal text-sm">₹{item.price.toFixed(2)}</span>
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1 px-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                        title="Delete menu item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        // SUBPAGE B: CATEGORIES CRUD LIST
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gold-rich/10">
            <span className="text-xs text-mocha font-medium">Cuisine categorization and auto icons pairing.</span>
            <Button
              variant="primary"
              size="sm"
              className="py-2 text-xs font-bold uppercase"
              onClick={() => {
                setNewCatName("");
                setNewCatDesc("");
                setIsCatModalOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <Card key={cat.id} className="p-4 bg-white relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cream-warm/40 text-maroon-royal rounded-xl border border-gold-rich/10">
                    <Flame className="w-5 h-5 text-gold-rich" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-espresso">{cat.name}</h4>
                    <p className="text-xs text-mocha mt-0.5 leading-relaxed">{cat.description || "Fresh and hot recipes."}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                  title="Remove category"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY INSERTION DOCK */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Add Dish Category"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <FormInput
            label="Category Name"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="eg. Shahi Biryani"
            required
          />

          <FormInput
            label="Category brief explanation"
            value={newCatDesc}
            onChange={(e) => setNewCatDesc(e.target.value)}
            placeholder="eg. Slow cooked saffron rices with cashews"
          />

          <div className="flex gap-2 pt-2 justify-end">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCatModalOpen(false)}>
              Discard
            </Button>
            <Button variant="primary" size="sm" type="submit" className="font-bold">
              Confirm Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* DISH GENERATOR EXPERIMENTAL MODULE */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={isStepTwoGenerate ? "Review Auto-Generated Material" : "Generate Recipe Item Card"}
      >
        {!isStepTwoGenerate ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-cream-warm/30 rounded-xl border border-gold-rich/10 text-xs text-mocha flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-gold-rich shrink-0 animate-pulse" />
              <span>Input Name, Price, and Category. The Maharaji template engine will auto-compile gourmet culinary descriptions and find stock visuals instantly!</span>
            </div>

            <FormInput
              label="Dish Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="eg. Paneer Korma Deluxe"
              required
            />

            <div className="relative mb-5 font-sans">
              <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Cuisine Category</label>
              <select
                value={newItemCategory_id}
                onChange={(e) => setNewItemCategory_id(e.target.value)}
                className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich bg-white"
                required
              >
                <option value="">-- Choose Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <FormInput
              label="Sales Price (₹)"
              type="number"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              placeholder="eg. 320"
              required
            />

            <div className="flex gap-2 pt-2 justify-end">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsItemModalOpen(false)}>
                Discard
              </Button>
              <Button variant="primary" size="sm" type="button" className="font-bold font-serif" onClick={handleTriggerGenerator}>
                <Sparkles className="w-4 h-4 fill-current text-gold-shimmer" />
                <span>Initialize AI Generate</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-xl border border-success/20 text-xs text-success flex items-center gap-1.5 mb-2">
              <Check className="w-4.5 h-4.5" />
              <span>Gourmet recipe templates matched successfully! Review below:</span>
            </div>

            {/* Generated Visual Review */}
            <div className="h-40 rounded-xl bg-cream-warm relative overflow-hidden mb-3 border border-gold-rich/10 shadow-inner">
              <img src={generatedImg} alt="Review" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-transparent to-transparent flex items-end p-3">
                <span className="text-white text-sm font-serif font-bold">{newItemName}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-mocha font-bold uppercase tracking-wider mb-1">Gourmet Description (Editable)</label>
                <textarea
                  value={generatedDesc}
                  onChange={(e) => setGeneratedDesc(e.target.value)}
                  className="w-full p-3 text-xs bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich leading-relaxed text-espresso font-medium h-24"
                />
              </div>

              <FormInput
                label="Stock Visual URL (Editable)"
                value={generatedImg}
                onChange={(e) => setGeneratedImg(e.target.value)}
                icon={<ImageIcon className="w-4 h-4" />}
                placeholder="Image URL"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsStepTwoGenerate(false)}>
                Back
              </Button>
              <Button variant="gold" size="sm" className="font-bold uppercase tracking-wider" onClick={handleSaveGeneratedItem}>
                <Check className="w-4 h-4 text-charcoal-deep" />
                <span>Publish live</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
