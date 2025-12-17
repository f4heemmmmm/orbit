-- Split Bill Feature Database Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- 1. SPLIT_BILLS TABLE (Main bill record)
-- ============================================
CREATE TABLE IF NOT EXISTS split_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  service_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  receipt_image_url TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'settled', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_split_bills_user_id ON split_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_split_bills_date ON split_bills(date DESC);

-- RLS Policy: Users can only access their own bills
ALTER TABLE split_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own split_bills" ON split_bills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own split_bills" ON split_bills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own split_bills" ON split_bills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own split_bills" ON split_bills
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. BILL_ITEMS TABLE (Individual line items)
-- ============================================
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES split_bills(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);

-- RLS Policy via parent table
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bill_items via split_bills" ON bill_items
  FOR SELECT USING (
    bill_id IN (SELECT id FROM split_bills WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert bill_items via split_bills" ON bill_items
  FOR INSERT WITH CHECK (
    bill_id IN (SELECT id FROM split_bills WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update bill_items via split_bills" ON bill_items
  FOR UPDATE USING (
    bill_id IN (SELECT id FROM split_bills WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete bill_items via split_bills" ON bill_items
  FOR DELETE USING (
    bill_id IN (SELECT id FROM split_bills WHERE user_id = auth.uid())
  );

-- ============================================
-- 3. BILL_PARTICIPANTS TABLE (People splitting)
-- ============================================
CREATE TABLE IF NOT EXISTS bill_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES split_bills(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_share DECIMAL(10,2) NOT NULL DEFAULT 0,
  service_share DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_share DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_settled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bill_participants_bill_id ON bill_participants(bill_id);

-- RLS Policy via parent table
ALTER TABLE bill_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bill_participants via split_bills" ON bill_participants
  FOR SELECT USING (
    bill_id IN (SELECT id FROM split_bills WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert bill_participants via split_bills" ON bill_participants
  FOR INSERT WITH CHECK (
    bill_id IN (SELECT id FROM split_bills WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update bill_participants via split_bills" ON bill_participants
  FOR UPDATE USING (
    bill_id IN (SELECT id FROM split_bills WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete bill_participants via split_bills" ON bill_participants
  FOR DELETE USING (
    bill_id IN (SELECT id FROM split_bills WHERE user_id = auth.uid())
  );

-- ============================================
-- 4. BILL_ITEM_ASSIGNMENTS TABLE (Item-person mapping)
-- ============================================
CREATE TABLE IF NOT EXISTS bill_item_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES bill_items(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES bill_participants(id) ON DELETE CASCADE,
  share_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  share_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(item_id, participant_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bill_item_assignments_item_id ON bill_item_assignments(item_id);
CREATE INDEX IF NOT EXISTS idx_bill_item_assignments_participant_id ON bill_item_assignments(participant_id);

-- RLS Policy via parent tables
ALTER TABLE bill_item_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignments via bill_items" ON bill_item_assignments
  FOR SELECT USING (
    item_id IN (
      SELECT bi.id FROM bill_items bi
      JOIN split_bills sb ON bi.bill_id = sb.id
      WHERE sb.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert assignments via bill_items" ON bill_item_assignments
  FOR INSERT WITH CHECK (
    item_id IN (
      SELECT bi.id FROM bill_items bi
      JOIN split_bills sb ON bi.bill_id = sb.id
      WHERE sb.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assignments via bill_items" ON bill_item_assignments
  FOR UPDATE USING (
    item_id IN (
      SELECT bi.id FROM bill_items bi
      JOIN split_bills sb ON bi.bill_id = sb.id
      WHERE sb.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete assignments via bill_items" ON bill_item_assignments
  FOR DELETE USING (
    item_id IN (
      SELECT bi.id FROM bill_items bi
      JOIN split_bills sb ON bi.bill_id = sb.id
      WHERE sb.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. RECENT_PARTICIPANTS TABLE (Autocomplete)
-- ============================================
CREATE TABLE IF NOT EXISTS recent_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_recent_participants_user_id ON recent_participants(user_id);

-- RLS Policy
ALTER TABLE recent_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recent_participants" ON recent_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recent_participants" ON recent_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recent_participants" ON recent_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recent_participants" ON recent_participants
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. HELPER FUNCTION: Upsert recent participant
-- ============================================
CREATE OR REPLACE FUNCTION upsert_recent_participant(
  p_user_id UUID,
  p_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO recent_participants (user_id, name, usage_count, last_used_at)
  VALUES (p_user_id, p_name, 1, NOW())
  ON CONFLICT (user_id, name)
  DO UPDATE SET
    usage_count = recent_participants.usage_count + 1,
    last_used_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_split_bills_updated_at ON split_bills;
CREATE TRIGGER update_split_bills_updated_at
  BEFORE UPDATE ON split_bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bill_items_updated_at ON bill_items;
CREATE TRIGGER update_bill_items_updated_at
  BEFORE UPDATE ON bill_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bill_participants_updated_at ON bill_participants;
CREATE TRIGGER update_bill_participants_updated_at
  BEFORE UPDATE ON bill_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. STORAGE BUCKET FOR RECEIPTS
-- Run this separately in Storage settings or use:
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('receipts', 'receipts', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policy for receipts bucket (run after creating bucket)
-- CREATE POLICY "Users can upload receipt images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'receipts' AND auth.uid() IS NOT NULL
--   );
--
-- CREATE POLICY "Users can view receipt images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'receipts');
--
-- CREATE POLICY "Users can delete own receipt images" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
--   );
