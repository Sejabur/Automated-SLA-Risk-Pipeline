-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (For Role-Based Access Control)
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL DEFAULT 'pending', -- 'pending', 'operator', 'admin'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Vendors Table
CREATE TABLE vendors (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    category text,
    criticality_score int,
    data_sensitivity_score int,
    sla_uptime_promise numeric,
    actual_sla numeric,
    compliance_certs text[],
    calculated_risk_score int,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Audit Logs Table
CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email text NOT NULL,
    action text NOT NULL,
    vendor_id uuid, -- Optional, if the action is tied to a vendor
    details text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- RLS (Row Level Security) Policies
-- By default, for simplicity in the open source version, we rely on the Next.js 
-- server actions to enforce authentication and authorization.
-- However, you can enable these if you want strict DB-level security.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full access (Since Auth is handled by Next.js Server Actions)
CREATE POLICY "Allow authenticated users full access to profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to vendors" ON vendors FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'pending');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
