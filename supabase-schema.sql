-- ==========================================
-- MAHARAJI KITCHEN - SUPABASE DATABASE SCHEMA
-- ==========================================

-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if reset occurs
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS stock_purchases CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS todays_offers CASCADE;
DROP TABLE IF EXISTS bill_edits_log CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;

-- 1. SYSTEM CONFIGURATION TABLE
CREATE TABLE system_config (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'reception', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLES TABLE
CREATE TABLE tables (
    id VARCHAR(50) PRIMARY KEY,
    table_number INTEGER UNIQUE NOT NULL CHECK (table_number BETWEEN 1 AND 100),
    status VARCHAR(50) NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'open', 'active', 'closed')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name VARCHAR(100) DEFAULT 'Utensils',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MENU ITEMS TABLE
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number INTEGER NOT NULL REFERENCES tables(table_number) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'cooking', 'served', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending_approval')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. BILLS TABLE
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number VARCHAR(100) UNIQUE NOT NULL,
    table_number INTEGER NOT NULL REFERENCES tables(table_number),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    coupon_code VARCHAR(100),
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 9. BILL EDITS LOG
CREATE TABLE bill_edits_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    action TEXT NOT NULL,
    before_json TEXT,
    after_json TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TODAY'S OFFERS TABLE
CREATE TABLE todays_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    icon_svg TEXT,
    animation_style VARCHAR(50) DEFAULT 'pulse' CHECK (animation_style IN ('pulse', 'shimmer', 'glow')),
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_to TIMESTAMP WITH TIME ZONE
);

-- 11. COUPONS TABLE
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    linked_bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
    min_purchase DECIMAL(10,2) DEFAULT 1000.00,
    discount DECIMAL(10,2) NOT NULL,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'flat' CHECK (discount_type IN ('flat', 'percentage')),
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_to TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired'))
);

-- 12. STOCK PURCHASES TABLE
CREATE TABLE stock_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(255),
    notes TEXT
);

-- 13. AUDIT LOG
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details_json TEXT
);

-- ==========================================
-- INDEXES FOR HIGH-SPEED QUERYING
-- ==========================================
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_orders_table ON orders(table_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_status ON order_items(status);
CREATE INDEX idx_bills_table ON bills(table_number);
CREATE INDEX idx_bills_closed_at ON bills(closed_at);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_stock_purchases_date ON stock_purchases(date);

-- ==========================================
-- AUTO TRIGGER FOR BILL NUMBER GENERATION
-- ==========================================
CREATE OR REPLACE FUNCTION generate_bill_number()
RETURNS TRIGGER AS $$
DECLARE
    today_prefix TEXT;
    seq_num TEXT;
    new_bill_no TEXT;
BEGIN
    today_prefix := 'MK-' || to_char(NOW(), 'YYYYMMDD');
    
    -- Count other bills made today to generate sequential sequence
    SELECT lpad((COALESCE(COUNT(*), 0) + 1)::TEXT, 4, '0')
    INTO seq_num
    FROM bills
    WHERE bill_number LIKE today_prefix || '%';
    
    NEW.bill_number := today_prefix || '-' || seq_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bills_number_before_insert
BEFORE INSERT ON bills
FOR EACH ROW
WHEN (NEW.bill_number IS NULL OR NEW.bill_number = '')
EXECUTE FUNCTION generate_bill_number();

-- ==========================================
-- AUTO TRIGGER FOR COUPON GENERATION (BILL >= ₹1000)
-- ==========================================
CREATE OR REPLACE FUNCTION auto_generate_bill_coupon()
RETURNS TRIGGER AS $$
DECLARE
    generated_code TEXT;
BEGIN
    IF NEW.total >= 1000.00 AND NEW.closed_at IS NOT NULL AND OLD.closed_at IS NULL THEN
        -- Generate coupon: 10% off next purchase, valid for 30 days
        generated_code := 'ROYAL' || to_char(NEW.created_at, 'MMYY') || lpad(floor(random() * 10000)::text, 4, '0');
        
        INSERT INTO coupons (code, linked_bill_id, min_purchase, discount, discount_type, valid_from, valid_to, status)
        VALUES (
            generated_code, 
            NEW.id, 
            800.00, 
            10.00, 
            'percentage', 
            NOW(), 
            NOW() + INTERVAL '30 days', 
            'active'
        );
        
        -- Insert into audit log
        INSERT INTO audit_log (action, user_name, timestamp, details_json)
        VALUES (
            'COUPON_AUTO_GENERATED',
            'SYSTEM',
            NOW(),
            '{"code": "' || generated_code || '", "linked_bill_id": "' || NEW.id || '", "total": ' || NEW.total || '}'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bills_coupon_after_update
AFTER UPDATE ON bills
FOR EACH ROW
EXECUTE FUNCTION auto_generate_bill_coupon();

-- ==========================================
-- SEED INITIAL SYSTEM DATA
-- ==========================================

-- Insert Default System Configuration Settings
INSERT INTO system_config (key, value) VALUES
('restaurant_tagline', 'Royal Heritage, Culinary Excellence'),
('reception_auth_code', '852'),
('admin_reset_code', '951753'),
('admin_username', 'Maharaji741852'),
('admin_password', 'Rest@951')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed Tables 1 through 20 (All default LOCKED state)
INSERT INTO tables (id, table_number, status) VALUES
('table_1', 1, 'locked'),
('table_2', 2, 'locked'),
('table_3', 3, 'locked'),
('table_4', 4, 'locked'),
('table_5', 5, 'locked'),
('table_6', 6, 'locked'),
('table_7', 7, 'locked'),
('table_8', 8, 'locked'),
('table_9', 9, 'locked'),
('table_10', 10, 'locked'),
('table_11', 11, 'locked'),
('table_12', 12, 'locked'),
('table_13', 13, 'locked'),
('table_14', 14, 'locked'),
('table_15', 15, 'locked'),
('table_16', 16, 'locked'),
('table_17', 17, 'locked'),
('table_18', 18, 'locked'),
('table_19', 19, 'locked'),
('table_20', 20, 'locked')
ON CONFLICT (id) DO UPDATE SET status = 'locked';

-- Seed initial classic Royal Indian Categories
INSERT INTO categories (id, name, description, icon_name, sort_order) VALUES
('c1010101-1111-1111-1111-111111111111', 'Royal Shuruwat', 'Starters cooked to perfection in clay tandoors and open fire', 'Flame', 1),
('c2020202-2222-2222-2222-222222222222', 'Maharani Curry', 'Aromatic main course curries flavored with royal hand-ground masalas', 'UtensilsCrossed', 2),
('c3030303-3333-3333-3333-333333333333', 'Darbari Biryani', 'Fragrant basmati rice dum cooked with premium spices and visual saffron', 'Beef', 3),
('c4040404-4444-4444-4444-444444444444', 'Tandoori Roti', 'Traditional handmade Indian flatbreads baked freshly in real embers', 'Croissant', 4),
('c5050505-5555-5555-5555-555555555555', 'Shahi Mithai', 'Sumptuous legendary desserts from the royal kitchens of India', 'Candy', 5)
ON CONFLICT DO NOTHING;

-- Seed standard delicious Indian luxury dishes
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_available) VALUES
('m1010101-0000-0000-0000-010101010101', 'c1010101-1111-1111-1111-111111111111', 'Lalquila Paneer Tikka', 'Succulent fresh cottage cheese blocks marinated with tandoori spices and char-broiled.', 260.00, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80', TRUE),
('m1010102-0000-0000-0000-010101010102', 'c1010101-1111-1111-1111-111111111111', 'Dahi ke Shahi Kebab', 'Silky, hung curd patties spiced delicately and shallow fried to an elegant golden crisp.', 240.00, 'https://images.unsplash.com/photo-1601050690597-df056fb49785?w=500&q=80', TRUE),
('m2020201-0000-0000-0000-020202020201', 'c2020202-2222-2222-2222-222222222222', 'Paneer Butter Masala', 'Rich, creamy paneer cubes simmered in a velvety tomato-butter gravy with hand-ground spices.', 280.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80', TRUE),
('m2020202-0000-0000-0000-020202020202', 'c2020202-2222-2222-2222-222222222222', 'Dal Maharaji Dum', 'Legendary 24-hour slow cooked black lentils with fresh cream, churned white butter, and smoke.', 220.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80', TRUE),
('m3030301-0000-0000-0000-030303030301', 'c3030303-3333-3333-3333-333333333333', 'Subz Dum Biryani', 'Fragrant basmati rice steamed layered with crisp garden vegetables, organic saffron mint, and rose water.', 320.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80', TRUE),
('m4040401-0000-0000-0000-040404040401', 'c4040404-4444-4444-4444-444444444444', 'Butter Naan', 'Fine flour flatbread baked instantly in clay oven, brushed with pure amul butter.', 40.00, 'https://images.unsplash.com/photo-1601050690597-df056fb49785?w=500&q=80', TRUE),
('m4040402-0000-0000-0000-040404040402', 'c4040404-4444-4444-4444-444444444444', 'Garlic Naan', 'Clay oven flatbread infused with fire-toasted chopped garlic, light butter coriander.', 50.00, 'https://images.unsplash.com/photo-1601050690597-df056fb49785?w=500&q=80', TRUE),
('m5050501-0000-0000-0000-050505050501', 'c5050505-5555-5555-5555-555555555555', 'Kesari Shahi Tukda', 'Golden fried luxury bread soaked in aromatic cardamom milk syrup, saffron rabri, and silver leaf.', 160.00, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80', TRUE)
-- ('m5050502-0000-0000-0000-050505050502', 'c5050505-5555-5555-5555-555555555555', 'Shahi Gulab Jamun', 'Warm khoya dumplings stuffed with pistachios and sweet cardamom syrup.', 120.00, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80', TRUE);
ON CONFLICT DO NOTHING;

-- Seed static sample offer to start off
INSERT INTO todays_offers (title, subtitle, icon_svg, animation_style, is_active)
VALUES (
    'Royal Feast Bundle Discount',
    'Get flat 15% off on orders above ₹1500 using coupon ROYALFEAST',
    'Crown',
    'glow',
    TRUE
) ON CONFLICT DO NOTHING;

-- Enable Realtime for standard tables to bind alerts smoothly
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE todays_offers;
