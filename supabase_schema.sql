-- ==============================================================================
-- BLOSSOM & OUD WEDDING INVITATION - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Paste and run this script in your Supabase SQL Editor (SQL Editor > New Query)
-- ==============================================================================

-- 1. RSVPs TABLE
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    guests_count INTEGER NOT NULL DEFAULT 1,
    attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no')),
    message TEXT,
    phone TEXT,
    email TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Allow public / anon users to submit (insert) RSVPs
CREATE POLICY "Allow anonymous users to insert RSVPs"
    ON public.rsvps
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow anon and authenticated users to read RSVPs (or restrict to admin key/auth)
CREATE POLICY "Allow public read access to RSVPs"
    ON public.rsvps
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow deletion of RSVPs
CREATE POLICY "Allow public delete access to RSVPs"
    ON public.rsvps
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- 2. WEDDING CONFIGURATION TABLE (Cloud CMS)
CREATE TABLE IF NOT EXISTS public.wedding_config (
    id TEXT PRIMARY KEY DEFAULT 'current_config',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    config JSONB NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wedding_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access to wedding config
CREATE POLICY "Allow public read of wedding config"
    ON public.wedding_config
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow public upsert/update of wedding config
CREATE POLICY "Allow public update of wedding config"
    ON public.wedding_config
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Optional: Enable Realtime for RSVPs
ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvps;
